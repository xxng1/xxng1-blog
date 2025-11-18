---
layout:       post
title:        "SSE 방식을 이용한 실시간 알림 구현"
date: '2024-06-15'
section: 'dev'
excerpt: 'Server-Sent Events를 활용한 단방향 통신 및 Nginx 설정'
tags: ['SSE', 'Backend', 'Real-time', 'Nginx']
---

프로젝트에서 사용했던 SSE 방식에 대해.  

사용자 알림 기능을 위해 단방향 통신인 **Server-Sent Events(SSE)** 를 선택했고,  
Spring Boot와 Nginx 환경에서 안정적으로 동작하도록 구현했다.

<br>

# ☑️ 개요

알림 구현에는 크게 **네 가지** 패턴이 있다.

### 1. 폴링(Polling)
- 일정 시간마다 클라이언트가 서버로 요청을 보내고 응답을 받는 방식
- 응답 데이터가 없어도 계속 요청을 수행하기 때문에 비용과 부하가 커질 수 있음

![](https://velog.velcdn.com/images/woongaa1/post/119c4231-3077-4528-8e7c-4b83ce622220/image.png)

<br>

### 2. 롱 폴링(Long Polling)
- 연결을 길게 열어두고 이벤트가 생길 때까지 대기
- 연결 간격이 짧으면 폴링과 큰 차이가 없으며, 커넥션 관리 부담이 존재

![](https://velog.velcdn.com/images/woongaa1/post/81491857-b22f-41a5-9be3-6e6109891178/image.png)

<br>

### 3. 웹소켓(WebSocket)
- 클라이언트·서버 간 양방향 통신을 지원
- 연결이 지속되기 때문에 불필요한 비용이 발생할 수 있고, 서버 자원 관리가 필요

![](https://velog.velcdn.com/images/woongaa1/post/79f24b0b-b0bb-4246-9d98-a559bd8bc111/image.png)

<br>



### 4. SSE(Server-Sent Events)
- 클라이언트가 구독을 요청하면 서버에서 이벤트가 발생할 때마다 응답을 전송
- 서버 → 클라이언트 단방향 스트림으로 알림, 모니터링 로그 등에 적합

![](https://velog.velcdn.com/images/woongaa1/post/d200c868-0596-4913-8f15-c636e05c83c5/image.png)

<br>

우리 시나리오는 사용자에게 일방향 알림만 전달하면 충분했기 때문에 SSE가 가장 가볍고 적합했다.


| 방식 | 특징 | 언제 유용한가 |
| --- | --- | --- |
| 폴링 | 주기적으로 서버에 요청 | 구현이 간단하지만 트래픽이 많아짐 |
| 롱 폴링 | 요청을 오래 열어두고 응답 대기 | 폴링보다 효율적이나 연결 관리가 번거로울 수 있음 |
| 웹소켓 | 양방향 통신 | 채팅, 게임 등 양방향이 필요할 때 |
| **SSE** | 서버 → 클라이언트 단방향 스트림 | 알림, 로그 스트리밍 등 서버 푸시가 핵심일 때 |

<br>

# ☑️ 핵심 개념

- **SseEmitter**: Spring이 제공하는 SSE 구현체
- **EventSource / EventSourcePolyfill**: 브라우저에서 SSE를 구독하는 객체 (인증 토큰이 필요하면 Polyfill 사용)

<br>

# ☑️ 서버 구현

### 1. Emitter 관리 클래스

```java
@Slf4j
@Getter
@Component
@RequiredArgsConstructor
public class SseEmitters {
    private final ConcurrentHashMap<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter add(String id, SseEmitter emitter) {
        emitters.put(id, emitter);
        log.info("new emitter added: {}", emitter);
        log.info("emitter list size: {}", emitters.size());
        return emitter;
    }

    public Map<String, SseEmitter> findEmitter(String id){
        return emitters.entrySet().stream()
                .filter(entry -> entry.getKey().startsWith(id))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    public void delete(String id) {
        emitters.remove(id);
    }
}
```

사용자별로 여러 탭에서 접속할 수 있으므로 `ConcurrentHashMap`으로 안전하게 관리.


<br>

### 2. Controller

```java
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notification")
public class NotificationController {
    private final JWTUtil jwtUtil;
    private final NotificationService notificationService;

    @GetMapping(value = "/subscribe/{userId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> subscribe(@PathVariable Long userId,
                                                @RequestHeader(value = "lastEventId", required = false, defaultValue = "") String lastEventId,
                                                HttpServletResponse response){
        log.info(lastEventId);
        return new ResponseEntity<>(notificationService.subscribe(userId, response), HttpStatus.OK);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId){
        List<Notification> notifications = notificationService.getUserNotifications(userId);
        return new ResponseEntity<> (notifications, HttpStatus.OK);
    }
}
```

- `MediaType.TEXT_EVENT_STREAM_VALUE`를 명시해 브라우저가 SSE임을 인지하도록 구현
- `lastEventId`를 활용하면 누락된 이벤트를 다시 전달 가능하도록 구현

<br>


### 3. Service

```java
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
    private final SseEmitters sseEmitters;
    private final NotificationRepository notificationRepository;
    private static final long TIMEOUT = 60 * 1000L;

    public SseEmitter subscribe(Long userId, HttpServletResponse response) {
        String existingId = userId + "_";
        Map<String, SseEmitter> existingEmitters = sseEmitters.findEmitter(existingId);
        existingEmitters.forEach((key, emitter) -> {
            emitter.complete();
            sseEmitters.delete(key);
        });

        SseEmitter emitter = new SseEmitter(TIMEOUT);
        String id = userId + "_" + System.currentTimeMillis();
        sseEmitters.add(id, emitter);

        response.setHeader("X-Accel-Buffering", "no");

        Map<String, Object> testContent = new HashMap<>();
        testContent.put("content", "connected!");
        sendToClient(emitter, "test", id, testContent);

        emitter.onTimeout(() -> {
            log.info("onTimeout callback");
            emitter.complete();
            sseEmitters.delete(id);
        });

        emitter.onError(throwable -> {
            log.error("[sse] SseEmitters 파일 add 메서드 : {}", throwable.getMessage());
            emitter.complete();
            sseEmitters.delete(id);
        });

        emitter.onCompletion(() -> {
            log.info("onCompletion callback");
            sseEmitters.delete(id);
        });

        return emitter;
    }

    private void sendToClient(SseEmitter emitter, String name, String id, Object data) {
        try {
            emitter.send(SseEmitter.event()
                    .id(id)
                    .name(name)
                    .data(data));
        } catch (IOException exception) {
            sseEmitters.delete(id);
            throw new RuntimeException("연결 오류!");
        }
    }

    @Transactional
    public void send(SendNotificationEvent noti) {
        Notification notification = notificationRepository.save(Notification.create(noti));
        String receiverId = noti.getReceiver() + "_";

        Map<String, SseEmitter> emitters = sseEmitters.findEmitter(receiverId);
        emitters.forEach((key, emitter) -> {
            sendToClient(emitter, noti.getName(), noti.getEventId(), notification);
            log.info("알림 전송 완료");
        });
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByReceiverOrderByNotificationCreatedDateDesc(userId);
    }
}
```

구독 요청 시 기존 연결을 정리하고 새 `SseEmitter`를 생성.

<br>

# ☑️ 클라이언트 구현 (React)

```typescript
useEffect(() => {
  if (token && !eventSource) {
    subscribe();
  }
  return () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
  };
}, [eventSource, token]);

const subscribe = async () => {
  const source = new EventSourcePolyfill(`${notifyApi}/subscribe/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      lastEventId: lastEventId,
    },
    heartbeatTimeout: 600000,
  });

  source.addEventListener("mileage", (e) => {
    setLastEventId(e.lastEventId);
    const data = JSON.parse(e.data);
    toast(data.content);
    setNotifications((prev) => [data, ...prev]);
    setUnreadCount((prev) => prev + 1);
  });

  setEventSource(source);
};
```

- 컴포넌트가 마운트되면 구독을 시작하고, 언마운트될 때 연결을 종료.
- 이벤트 타입(`mileage`)별로 리스너를 추가해, 토스트 알림과 상태 갱신을 수행.

<br>


# ☑️ 운영 중 만난 이슈

### 1. Nginx Proxy 설정

Nginx는 기본적으로 클라이언트와는 HTTP/1.1로 통신하지만,  
**백엔드(upstream)로는 HTTP/1.0을 사용**한다.

이때 `Connection: close` 헤더가 포함되어 요청이 끝나면 연결이 즉시 끊어진다.

```
클라이언트 → Nginx: HTTP/1.1 (keep-alive 가능)
Nginx → 백엔드: HTTP/1.0 + Connection: close (연결 즉시 종료)
```

<br>


아래 두 설정을 추가하면 Nginx가 백엔드로 HTTP/1.1을 사용하고 연결을 유지할 수 있다.

```nginx
# Nginx가 백엔드로 HTTP/1.1 프로토콜을 사용하도록 강제
proxy_set_header Connection '';
# Connection 헤더를 제거하여 HTTP/1.1의 기본 동작(keep-alive) 활성화
proxy_http_version 1.1;
```
