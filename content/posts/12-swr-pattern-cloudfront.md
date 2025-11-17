---
layout:       post
title:        "AWS CloudFront에서의 무효화(invalidate) 및 SWR Pattern"
date: '2025-07-24'
section: 'infra'
excerpt: 'AWS CloudFront에 SWR(Stale-While-Revalidate) 패턴 적용'
tags: ['AWS', 'CloudFront', 'CDN', 'Caching', 'SWR', 'Cloud']
---

<sub>* AWS CloudFront: AWS의 CDN(Content Delivery Network) 서비스</sub>  

**AWS CloudFront** 는 전 세계 엣지에 정적 파일을 캐싱해서 빠르게 제공한다.

이 기본 캐싱 정책 때문에 `S3` + `CloudFront`로 컨텐츠를 배포하면,  
수정사항이 생겼을 때 **무효화(invalidation)** 를 해줄 필요가 생긴다.

그런데, 무효화는 조건부 비용이 있다.

![](https://velog.velcdn.com/images/xxng1/post/54c8e1cb-0ba5-4b83-a6e5-fda1787bcf88/image.png)

<br>

그래서, **SWR(Stale-While-Revalidate)** 패턴을 적용하는 과정을 알아보려고 한다.

<br>

# SWR Pattern?

SWR은 “조금 낡은 데이터를 먼저 보여 주고, 뒤에서 몰래 최신화”하는 전략이다.

1. 사용자가 페이지를 요청하면, 캐시된 콘텐츠를 즉시 전달
2. 동시에 백그라운드에서 원본(S3)에 요청을 보내 최신 여부를 확인
3. 변경이 있다면 캐시를 업데이트하고 다음 요청부터 바로 새로운 콘텐츠가 전달

즉, `Cache-Control: max-age=10`, `stale-while-revalidate=60`과 같은 헤더를 사용하면 **10초 동안은 Fresh**, 이후 **60초까지는 Stale이 허용**되고 그 사이에 CloudFront가 알아서 최신화해주는 전략이다.



<br>

# 사용한 구성 요소

- **React**: 정적 웹사이트 빌드
- **S3**: 정적 사이트 호스팅
- **CloudFront**: CDN 배포
- **AWS CLI / Console**: 파일 업로드 및 캐시 정책 설정

<br>

# 1. AWS CLI 사용

CI/CD 파이프라인에서 S3로 빌드 결과를 업로드할 때, 

보통은 `aws s3 sync` 명령어로 빌드 파일을 올린다.

```bash
aws s3 sync build/ s3://<bucket-name> --acl public-read
```

<br>

그런데 `sync`는 변경된 파일만 업로드하기 때문에, **캐시 헤더가 갱신되지 않는다.** 

캐시 정책을 바꾸려면 `cp --recursive` 명령어를 통해서 강제로 모든 파일을 덮어써야 한다.

| 항목 | `sync` | `cp --recursive` |
| --- | --- | --- |
| 기본 동작 | 변경된 파일만 업로드 | 모든 파일 강제 업로드 |
| 캐시 헤더 반영 | 기존 헤더 유지 | 새 헤더 적용 |
| 속도 | 빠름 | 느릴 수 있음 |
| 추천 상황 | 자주 배포 | **헤더 변경 필요할 때** |

<br>

# 2. 캐시 헤더 설정

모든 파일을 새 헤더로 덮어쓴다.


```bash
aws s3 cp build/ s3://swr-pattern-bucket-s3/ \
  --recursive \
  --cache-control "max-age=10, stale-while-revalidate=60" \
  --acl public-read
```

<br>

- 헤더 적용 확인

```powershell
PS C:\Users\admin\Desktop\react-swr-demo> aws s3api head-object --bucket swr-pattern-bucket-s3 --key index.html
>>
{
    "AcceptRanges": "bytes",
    "LastModified": "2025-07-24T07:21:59+00:00",
    "ContentLength": 644,
    "ETag": "\"92ed791677aab7efc06ae542ecdb82f3\"",
    "CacheControl": "max-age=10, stale-while-revalidate=60", // ✅
    "ContentType": "text/html",
    "ServerSideEncryption": "AES256",
    "Metadata": {}
}

```
CloudFront의 default 캐시 값이 적용되어있어서, x-cache 값이 추출되지 않는다.

<br>

# 3. CloudFront 캐시 정책 생성 (GUI)

헤더 적용 이후에 **TTL** 을 적용하기 위해서 `CloudFront`에서 **0 ~ 10 ~ 70** 의 SWR 정책을 생성해준다.

### 상태 흐름
- `fresh` 상태: 0~10초
- `stale` 상태 허용: 10~70초  

### TTL 설정
  - **최솟값(Minimum TTL)**: `0` 초
  - **기본값(Default TTL)**: `10` 초
  - **최댓값(Maximum TTL)**: `70` 초 (= max-age + stale-while-revalidate)



![](https://velog.velcdn.com/images/xxng1/post/ed760744-433a-4b26-9dfb-e56c5163044a/image.png)

<br>


- custom header도 추가해주고,

![](https://velog.velcdn.com/images/xxng1/post/7a359d95-2f1b-4011-9818-9a19a5138d65/image.png)

<br>


- CloudFront에 만들어준 캐시 정책을 적용해준다.

![](https://velog.velcdn.com/images/xxng1/post/6e8b2ce5-956f-446c-9177-2dfe7a24bd99/image.png)

<br>


# 4. 동작 확인

1. 파일 업로드 후 `curl -I https://<cloudfront-domain>/index.html`
2. 응답 헤더의 `x-cache` 값을 관찰합니다.

| x-cache | 의미 |
| --- | --- |
| `Miss from cloudfront` | 캐시 첫 등록 |
| `Hit from cloudfront` | TTL 내 응답 또는 SWR 허용 구간 |
| `RefreshHit from cloudfront` | Stale 상태에서 오리진의 304 응답으로 갱신 |

<br>

테스트 결과:

- 처음 요청: `Miss`

![](https://velog.velcdn.com/images/xxng1/post/36e247be-f972-4d52-aab7-aa0224b39fa0/image.png)

<br>

- 연속 요청: `Hit`

![](https://velog.velcdn.com/images/xxng1/post/c8b74eeb-8810-4fa0-a2c6-5baa1da7284a/image.png)

<br>

- 70초 이상 요청이 없으면 `RefreshHit`, 이후 다시 `Hit`

![](https://velog.velcdn.com/images/xxng1/post/f3575934-7aa7-4073-b20b-92abce19b1ba/image.png)

<br>

- S3에서 파일을 수정하면 `Age` 값이 초기화

![](https://velog.velcdn.com/images/xxng1/post/34cc5d8b-e3cd-4d83-8820-a73c4875d614/image.png)

<br>

# 5. 흐름 정리

| 시간대 | 상태 | 동작 | x-cache |
| --- | --- | --- | --- |
| 0~10초 | Fresh | 캐시에서 즉시 응답 | `Hit from cloudfront` |
| 10~70초 | Stale 허용 | Stale 응답 + 백그라운드 최신화 | `Hit` 또는 `RefreshHit` |
| 70초 이후 | 만료 | 오리진에서 새로 가져옴 | `Miss from cloudfront` |

<br>

# 6. 무효화(invalidation)와 비교

| 관점 | SWR | 무효화 |
| --- | --- | --- |
| 사용자 체감 | 항상 빠른 응답 | 새 버전 적용 전 잠깐 느려질 수 있음 |
| 운영 | 헤더만 잘 관리하면 자동 | 무효화 요청을 자동화해야 함 |
| 비용 | 일반적인 요청 비용만 발생 | 1,000건 초과 시 무효화 비용 부과 |