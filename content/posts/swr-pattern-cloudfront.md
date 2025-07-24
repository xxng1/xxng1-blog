---
layout:       post
title:        "[Cloud] CloudFront의 캐싱 ( 무효화 / SWR Pattern )"
date: '2025-07-24'
section: 'infra'
# excerpt: '클라우드 기반 미디어 스트리밍 서비스 구축 경험 공유'
# categories: ['AWS/Media']
# tags: ['AWS', 'Media', 'Streaming', 'Cloud']
---

CloudFront의 기본 캐시 정책 때문에,

S3 등으로 웹페이지를 배포했을때, 수정사항이 생기면 일반적으로 무효화를 해줄 필요가 생긴다.

그런데, 무효화는 조건부 비용이 붙는다.

![](https://velog.velcdn.com/images/xxng1/post/54c8e1cb-0ba5-4b83-a6e5-fda1787bcf88/image.png)

그래서 SWR Pattern을 CloudFront에 적용하는 과정을 알아보려고 한다.


### 사용 기술
- React - 웹페이지 생성
- AWS S3 - 웹페이지 배포용
- AWS CloudFront - CDN 배포
- AWS CLI & GUI - 버킷 업로드 & 정책 생성

### SWR Pattern?

SWR(Stale-While-Revalidate)는 사용자에게 빠른 응답을 제공하며, 복구 방식으로 최신 데이터를 검사하고 자동 갱신하는 캐시 옵션이다.

현재 사용중인 파일이 존재하면:

TTL(max-age) 기간이 지나도

웹서버는 stale 데이터를 여전히 보내고,

뒤장에서 자동으로 조건부 요청 (If-Modified-Since / ETag) 을 사용해 최신화한다.

CloudFront에서 SWR을 적용하면,

사용자는 느리지 않고,

최신 컴퓨터 데이터가 나오면 자동으로 업데이티를 받게 된다.

SWR은 정상적인 Cache-Control 헤더 값 (ex. max-age=10, stale-while-revalidate=60)과,
CloudFront 캐시 정체에서 해당 헤더를 유효하게 하는 설정이 업데이티 조건이 된다.

이를 통해 내 배포 프로젝트에서 무효화 없이, 자동 최신화가 되는 모든 형태의 정적 캐시 시대를 구현할 수 있다.







### 웹페이지 구성

react로 웹페이지 생성, 빌드.

s3 생성, 정책 생성, 정적 사이트 호스팅.

CloudFront와 연결. 초기 Cache 정책은 Default.

빌드파일 업로드

`aws s3 sync build/ s3://<bucket-name> --acl public-read`


빌드파일을 새로 업로드해도, s3의 웹사이트에만 반영이 될 뿐 CloudFront에는 변화가 없다.
기본적으로 캐싱을 하기 때문.


이제는 Cache-control 헤더를 포함해서 업로드를 해서 테스트한다.
캐시 헤더 변경이 필요하기때문에, `cp` 명령어를 사용한다.


| 항목       | `sync`                              | `cp --recursive`    |
| -------- | ----------------------------------- | ------------------- |
| 기본 동작    | 변경된 파일만 업로드                         | 모든 파일 무조건 업로드       |
| 캐시 헤더 적용 | ❌ 기본적으로 새 헤더가 적용되지 않음 (변경 없으면 skip) | ✅ 모든 파일에 강제로 헤더 적용  |
| 성능       | 빠름                                  | 느릴 수 있음 (항상 전체 업로드) |
| 권장 용도    | 자주 배포할 때                            | **캐시 헤더 변경이 필요할 때** |

```bash
aws s3 cp build/ s3://swr-pattern-bucket-s3/ \
  --recursive \
  --cache-control "max-age=10, stale-while-revalidate=60" \
  --acl public-read
```
- 후에 10초, 60초를 적용하기 위해서 CloudFront에서 0 ~ 10 ~ 70 의 값을 설정함. 

  - fresh 상태: 0~10초
  - stale 상태 허용: 10~70초


```bash
PS C:\Users\admin\Desktop\react-swr-demo> aws s3api head-object --bucket swr-pattern-bucket-s3 --key index.html
>>
{
    "AcceptRanges": "bytes",
    "LastModified": "2025-07-24T07:21:59+00:00",
    "ContentLength": 644,
    "ETag": "\"92ed791677aab7efc06ae542ecdb82f3\"",
    "CacheControl": "max-age=10, stale-while-revalidate=60",
    "ContentType": "text/html",
    "ServerSideEncryption": "AES256",
    "Metadata": {}
}
```

CloudFront의 default 캐시 값이 적용되어있어서,
x-cache 값이 추출되지 않는다. Swr 정책을 만들어준다. (GUI환경)

- TTL 설정
  - 최솟값: 0
  - 기본값: 10
  - 최댓값: 70

![](https://velog.velcdn.com/images/xxng1/post/ed760744-433a-4b26-9dfb-e56c5163044a/image.png)

custom header도 추가해주고,
![](https://velog.velcdn.com/images/xxng1/post/7a359d95-2f1b-4011-9818-9a19a5138d65/image.png)

만들어준 헤더를 적용해준다.
![](https://velog.velcdn.com/images/xxng1/post/6e8b2ce5-956f-446c-9177-2dfe7a24bd99/image.png)





| x-cache 값                    | 의미                          |
| ---------------------------- | --------------------------- |
| `Hit from cloudfront`        | TTL 내 or stale 응답           |
| `RefreshHit from cloudfront` | stale 상태 → 오리진 304 응답       |
| `Miss from cloudfront`       | 캐시 없음 or 만료됨 → 오리진에서 새로 가져옴 |


다시 `cp`명령어로 s3 상태를 업데이트하고 `curl`명령어를 통해서 상태를 확인한다.
```
curl -I https://<your-cloudfront-url>/index.html
```

![](https://velog.velcdn.com/images/xxng1/post/e06eb37a-54f8-4486-a7eb-0ff0ad9f3a16/image.png)

초기상태는 x-cache 값이 `Miss fron cloudfront`가 출력된다. 

![](https://velog.velcdn.com/images/xxng1/post/cb62df66-1f78-4629-9d7f-8b4cc00697ac/image.png)

기본적으로 요청을 보내면 위와 같이 `Hit from cloudfront` 값이 출력되는데,

---

아래처럼 요청을 70초 이상 ( Max TTL ) 보내지 않으면 `RefreshHit from cloudfront`, 후에 다시 요청하면 `Hit from cloudfront` 을 출력받을 수 있다.

![](https://velog.velcdn.com/images/xxng1/post/c534ad07-5be7-4f2f-b3d1-79823d91ef44/image.png)




---
![](https://velog.velcdn.com/images/xxng1/post/34cd1931-5ceb-480a-afd3-87c52bb0689f/image.png)

`Hit from cloudfront` 상태에서, s3에 수정사항을 적용하면 age 값이 10에서 다시 1로 돌아간다. (Min TTL)


### 정리

아래 시간순

| 시간      | 상태                  | 동작                     | x-cache                |
| ------- | ------------------- | ---------------------- | ---------------------- |
| 0\~10초  | Fresh TTL           | 캐시에서 응답, 오리진 무시        | `Hit from cloudfront`  |
| 10\~70초 | SWR (stale allowed) | stale 응답 + 오리진에 조건부 요청 | `Hit` 또는 `RefreshHit`  |
| 70초 이후  | TTL + SWR 만료        | 오리진에서 새로 가져옴           | `Miss from cloudfront` |



# SWR Pattern VS 무효화

| 항목        | **SWR (stale-while-revalidate)**  | **CloudFront 캐시 무효화**              |
| --------- | --------------------------------- | ---------------------------------- |
| ❓ 목적      | **사용자에게 빠른 응답 제공** + 자동 최신화       | 캐시에 남은 데이터를 **강제로 제거**             |
| 🧠 작동 방식  | 일정 시간 후 stale → 오리진 확인 → 백그라운드 갱신 | 대상 객체를 즉시 캐시에서 삭제                  |
| ⏱️ 반영 속도  | 변경 직후엔 stale 응답 → 시간이 지나면 갱신      | 즉시 최신 콘텐츠 반영됨 (강제 Miss)            |
| 🔁 사용자 응답 | 최대한 빠른 응답 (stale 응답 제공)           | 삭제 직후엔 느림 (S3 요청 발생)               |
| 🔧 설정 복잡도 | `Cache-Control` + 캐시 정책으로 세팅      | 명령으로 단순 실행 (`create-invalidation`) |
| 💰 비용     | 요청 수만큼 (저렴)                       | **무효화 요청 비용 발생** (1,000건 이후부터 유료)  |
| 🌍 글로벌 반영 | 자동                                | ❗ 전 Edge 노드에 즉시 반영되진 않음 (약간 지연)    |
| 🔄 자동화    | O                                 | X (수동 명령 필요)                       |



| 관점     | SWR                       | 무효화                      |
| ------ | ------------------------- | ------------------------ |
| 응답속도   | 매우 빠름                     | 느릴 수 있음 (무효화 후 첫 요청은 S3) |
| 운영 자동화 | 좋음 (build 시 header만 잘 설정) | ❌ 배포 자동화에 추가 작업 필요       |
| 유저 경험  | 아주 부드럽게 최신화               | 강제 새로고침 또는 잠깐 이전 버전 보임   |
| 비용     | 요청 기준 (일반적)               | 무효화 요청 1,000건 초과 시 유료    |

