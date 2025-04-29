---
layout:       post
title:        "SSE 방식을 이용한 알림 구현"
date: '2024-06-15'
excerpt: ''
categories: ['Java/Spring']
---

> 프로젝트에서 사용했던 SSE 방식에 대해

## 개요
알림 구현에는 크게 4가지 방식이 있다.

### 폴링(Polling)
- 일정 시간마다 Client에서 Server로 요청을 보내고 응답을 받는 방식
- 응답해줄 데이터가 없어도 응답을 받음
- 지속적으로 request를 날림으로써 비용 부담 및 서버에 부하를 줄 수 있음
![](https://velog.velcdn.com/images/woongaa1/post/119c4231-3077-4528-8e7c-4b83ce622220/image.png)

### 롱 폴링(Long Polling)
- 긴 connection을 열어두고, 이벤트가 발생했을때 Request를 보냄
- 응답해줄 데이터가 없으면 데이터가 생길때까지 기다림
- connection 간격이 좁으면 Polling 방식과 큰 차이가 없음
![](https://velog.velcdn.com/images/woongaa1/post/81491857-b22f-41a5-9be3-6e6109891178/image.png)

### 웹소켓(WebSocket)
- 양방향 통신으로써 Client, Server 간 Handshaking 방식으로 접속 후 통신
- 연결 후 계속 connection을 유지하므로 불필요한 비용 발생할 수 있음
![](https://velog.velcdn.com/images/woongaa1/post/79f24b0b-b0bb-4246-9d98-a559bd8bc111/image.png)
### SSE(Server-Sent-Events)
- Client가 Server에 구독 요청을 보내면, Server에서 이벤트가 발생할 때마다 Response를 보냄
- Server에서 Client로만 이벤트를 보내는 단방향 통신

![](https://velog.velcdn.com/images/woongaa1/post/d200c868-0596-4913-8f15-c636e05c83c5/image.png)

우리는 사용자 알림에 대해서 기능을 구현할 예정이었기 때문에, SSE 방식을 통해서 알림을 구현하기로 했다.

## 구현
* `Emitter`란?
SseEmitter 라는 SSE 통신을 위한 구현체를 제공받기 위해 사용

* `React(Client)`에서 SSE응답을 받기 위한 방법
token을 사용하지 않을 때: `EventSource`
token을 사용할 때: `EventSourcePolyfill`

우리는 사용자 인증/인가를 JWT를 사용하여 구현하였기 때문에 `EventSourcePolyfill`을 사용하게 되었다.

### 1. SseEmitters 클래스
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
- 이벤트를 관리하는 SseEmitter, ConcurrentHashMap을 통해서 여러 스레드에서 동시에 접근해도 데이터를 처리할 수 있도록 함

### 2. NotificationController 클래스
```java
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notification")
public class NotificationController {
    private final JWTUtil jwtUtil;
    private final NotificationService notificationService;

    // sse 연결
    @GetMapping(value = "/subscribe/{userId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> subscribe(@PathVariable Long userId,
                                                @RequestHeader(value = "lastEventId", required = false, defaultValue = "") String lastEventId,
                                                HttpServletResponse response){
        log.info(lastEventId);
        return new ResponseEntity<>(notificationService.subscribe(userId, response), HttpStatus.OK);
    }

    // 유저 별 알림 조회
    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId){
        List<Notification> notifications = notificationService.getUserNotifications(userId);
        return new ResponseEntity<> (notifications, HttpStatus.OK);
    }


```
- 클라이언트 Header에 알림 모달이 위치해있고, 유저가 로그인해서 메인페이지에 접속하게 되면 Header를 통해서 `/api/notification/subscribe/{userId}`에 구독 요청을 보낸다.
- 알림에는 아이디가 존재하는데, 통신 간에 누락 된 알림을 테스트하기 위해 lastEventId를 사용했다.
- MediaType.TEXT_EVENT_STREAM_VALUE는 SSE를 지원하는 텍스트 형식을 나타낸다.

### 3. NotificationService 클래스
```java
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
    private final SseEmitters sseEmitters;
    private final NotificationRepository notificationRepository;
    // timeout 시간 설정
    private static final long TIMEOUT = 60 * 1000L;

    public SseEmitter subscribe(Long userId, HttpServletResponse response) {
        // 기존의 연결 종료
        String existingId = userId + "_";
        Map<String, SseEmitter> existingEmitters = sseEmitters.findEmitter(existingId);
        existingEmitters.forEach((key, emitter) -> {
            emitter.complete();
            sseEmitters.delete(key);
        });

        // 새 연결 생성
        SseEmitter emitter = new SseEmitter(TIMEOUT);
        String id = userId + "_" + System.currentTimeMillis();
        sseEmitters.add(id, emitter);

        // NGINX PROXY 에서의 필요 설정 불필요한 버퍼링방지
        response.setHeader("X-Accel-Buffering", "no");

        Map<String, Object> testContent = new HashMap<>();
        testContent.put("content", "connected!");
        sendToClient(emitter, "test", id, testContent);

        // 타임아웃 시 emitter 만료
        emitter.onTimeout(() -> {
            log.info("onTimeout callback");
            emitter.complete();
            sseEmitters.delete(id);
        });

		// 에러 발생
        emitter.onError(throwable -> {
            log.error("[sse] SseEmitters 파일 add 메서드 : {}", throwable.getMessage());
            emitter.complete();
            sseEmitters.delete(id);
        });

		//클라이언트와의 연결이 끊어졌을 때
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
        log.info("저장됨");

        String receiverId = noti.getReceiver() + "_";
        log.info(receiverId);

        // 해당 회원의 emitter 모두 찾아서 이벤트 전송
        Map<String, SseEmitter> emitters = sseEmitters.findEmitter(receiverId);
        log.info(emitters.entrySet().toString());

        emitters.forEach(
            (key, emitter) -> {
                sendToClient(emitter, noti.getName(), noti.getEventId(), notification);
                log.info("알림 전송 완료");
            }
        );
    }

    // 유저 별 알림 조회
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByReceiverOrderByNotificationCreatedDateDesc(userId);
    }

```
- 구독 요청이 들어왔을 때, 새로운 Emitter를 생성하고 더미 데이터를 보낸다. 기존 연결이 있다면 제거하고 새로운 Emitter를 생성한다.


추가적으로, 읽지 않은 알림 및 전체 알림 조회/삭제 기능을 위해서 알림에 대한 Entity와 Repository를 생성해줬다.

### (+) 클라이언트에서 구독 요청 & 응답 읽기
```java
	// sse 연결 선언
    useEffect(() => {
        // 마운트 시 로그인 상태 + sse 연결이 안 된 상태면 연결
        if (token && !eventSource) {
            subscribe();
        }

        // 언마운트 시 sse 연결 종료
        return () => {
            if (eventSource) {
                eventSource.close();
                console.log("연결 종료");
                setEventSource(null);
            }
        }
    },[eventSource, token])
    
    // sse 연결 시작
    const subscribe = async () => {
        console.log("연결 시작");
        const source = new EventSourcePolyfill(
            `${notifyApi}/subscribe/` + userId,
            {
            headers: {
                Authorization: `Bearer ${token}`,
                lastEventId: lastEventId,
            },
            heartbeatTimeout: 600000,
            }
        );
        
        // mileage 관련 알림 받아옴
        source.addEventListener("mileage", (e) => {
            setLastEventId(e.lastEventId);
            console.log(lastEventId);
            const data = JSON.parse(e.data);
            console.log(data);
            toast(data.content);
            setNotifications((prevNotifications) => [data, ...prevNotifications]);
            console.log(notifications);
            setUnreadCount((prevCount) => prevCount + 1);
        });
	}
```
연결 이펙트에 대한 함수를 선언하고, Server에서 보내는 알림에 대해 setNotifications useState에 인자로 넣어준다.

## Trouble Shooting
- 프로젝트에서 WebServer로 nginx를 사용했는데, nginx는 WAS로 HTTP/1.0을 사용하고 ***Connection: close*** 헤더를 사용하기 때문에 지속적으로 연결이 안돼서 SSE가 작동하지 않는다.
이에 대한 설정으로 nginx.conf에 추가해준다.
```yaml
proxy_set_header Connection '';
proxy_http_version 1.1;
```


- open-in-view를 false로 설정하여 요청이 트랜잭션이 처리되는 동안에만 데이터베이스 연결을 열어준다.
