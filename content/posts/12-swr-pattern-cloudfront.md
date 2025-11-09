---
layout:       post
title:        "[Cloud] CloudFront의 캐싱 ( 무효화 / SWR Pattern )"
date: '2025-07-24'
section: 'infra'
excerpt: 'CloudFront에 Stale-While-Revalidate 패턴 적용으로 비용 절감 및 성능 개선'
tags: ['AWS', 'CloudFront', 'CDN', 'Caching', 'SWR', 'Cloud']
---

React로 만든 정적 웹사이트를 S3 + CloudFront에 배포하고 나면, 수정사항이 생길 때마다 **무효화(Invalidation)**를 누르는 자신을 발견하게 됩니다. 문제는 무효화 요청이 무료가 아니라는 점입니다. 그래서 캐시 비용은 줄이면서도 최신 콘텐츠를 유지할 수 있는 방법으로 **SWR(Stale-While-Revalidate)** 패턴을 적용해 보았습니다.

![](https://velog.velcdn.com/images/xxng1/post/54c8e1cb-0ba5-4b83-a6e5-fda1787bcf88/image.png)

## SWR은 무엇인가요?

SWR은 “조금 낡은 데이터를 먼저 보여 주고, 뒤에서 몰래 최신화”하는 전략입니다.

1. 사용자가 페이지를 요청하면, 캐시된 콘텐츠를 즉시 전달합니다.
2. 동시에 백그라운드에서 원본(S3)에 조건부 요청(If-Modified-Since / ETag)을 보내 최신 여부를 확인합니다.
3. 변경이 있다면 캐시를 업데이트하고 다음 요청부터 바로 새로운 콘텐츠가 전달됩니다.

즉, `Cache-Control: max-age=10, stale-while-revalidate=60`과 같은 헤더를 사용하면 **10초 동안은 Fresh**, 이후 **60초까지는 Stale이 허용**되고 그 사이에 CloudFront가 알아서 최신화합니다.

## 사용한 구성 요소

- **React**: 정적 웹사이트 빌드
- **S3**: 정적 사이트 호스팅
- **CloudFront**: CDN 배포
- **AWS CLI / Console**: 파일 업로드 및 캐시 정책 설정

## 1. 기본 배포 후 문제점

보통은 `aws s3 sync` 명령어로 빌드 파일을 올립니다.

```bash
aws s3 sync build/ s3://<bucket-name> --acl public-read
```

하지만 `sync`는 변경된 파일만 업로드하기 때문에 **캐시 헤더가 갱신되지 않습니다.** 캐시 정책을 바꾸려면 강제로 모든 파일을 덮어써야 합니다.

| 항목 | `sync` | `cp --recursive` |
| --- | --- | --- |
| 기본 동작 | 변경된 파일만 업로드 | 모든 파일 강제 업로드 |
| 캐시 헤더 반영 | ❌ (기존 헤더 유지) | ✅ (새 헤더 적용) |
| 속도 | 빠름 | 느릴 수 있음 |
| 추천 상황 | 자주 배포 | **헤더 변경 필요할 때** |

## 2. 캐시 헤더 설정

모든 파일을 새 헤더로 덮어씁니다.

```bash
aws s3 cp build/ s3://swr-pattern-bucket-s3/ \
  --recursive \
  --cache-control "max-age=10, stale-while-revalidate=60" \
  --acl public-read
```

### 헤더 적용 확인

```bash
aws s3api head-object --bucket swr-pattern-bucket-s3 --key index.html
```

![](https://velog.velcdn.com/images/xxng1/post/ed760744-433a-4b26-9dfb-e56c5163044a/image.png)
![](https://velog.velcdn.com/images/xxng1/post/7a359d95-2f1b-4011-9818-9a19a5138d65/image.png)
![](https://velog.velcdn.com/images/xxng1/post/6e8b2ce5-956f-446c-9177-2dfe7a24bd99/image.png)

## 3. CloudFront 캐시 정책 만들기

헤더만 바꿔서는 부족합니다. CloudFront도 SWR 값을 존중하도록 정책을 만들어야 합니다.

- **Minimum TTL**: 0초
- **Default TTL**: 10초
- **Maximum TTL**: 70초 (= max-age + stale-while-revalidate)
- **Cache key**: 필요 시 커스텀 헤더 포함

Console에서 **Cache Policy**를 새로 만들고, 배포에 연결합니다.

## 4. 동작 확인

1. 파일 업로드 후 `curl -I https://<cloudfront-domain>/index.html`
2. 응답 헤더의 `x-cache` 값을 관찰합니다.

| x-cache | 의미 |
| --- | --- |
| `Miss from cloudfront` | 캐시 첫 등록 |
| `Hit from cloudfront` | TTL 내 응답 또는 SWR 허용 구간 |
| `RefreshHit from cloudfront` | Stale 상태에서 오리진의 304 응답으로 갱신 |

테스트 결과:

- 처음 요청: `Miss`

![](https://velog.velcdn.com/images/xxng1/post/36e247be-f972-4d52-aab7-aa0224b39fa0/image.png)

- 연속 요청: `Hit`

![](https://velog.velcdn.com/images/xxng1/post/c8b74eeb-8810-4fa0-a2c6-5baa1da7284a/image.png)

- 70초 이상 요청이 없으면 `RefreshHit`, 이후 다시 `Hit`

![](https://velog.velcdn.com/images/xxng1/post/f3575934-7aa7-4073-b20b-92abce19b1ba/image.png)

- S3에서 파일을 수정하면 `Age` 값이 초기화

![](https://velog.velcdn.com/images/xxng1/post/34cc5d8b-e3cd-4d83-8820-a73c4875d614/image.png)

## 5. 흐름 정리

| 시간대 | 상태 | 동작 | x-cache |
| --- | --- | --- | --- |
| 0~10초 | Fresh | 캐시에서 즉시 응답 | `Hit from cloudfront` |
| 10~70초 | Stale 허용 | Stale 응답 + 백그라운드 최신화 | `Hit` 또는 `RefreshHit` |
| 70초 이후 | 만료 | 오리진에서 새로 가져옴 | `Miss from cloudfront` |

## 무효화와 비교해 보니

| 관점 | SWR | 무효화 |
| --- | --- | --- |
| 사용자 체감 | 항상 빠른 응답 | 새 버전 적용 전 잠깐 느려질 수 있음 |
| 운영 | 헤더만 잘 관리하면 자동 | 무효화 요청을 자동화해야 함 |
| 비용 | 일반적인 요청 비용만 발생 | 1,000건 초과 시 무효화 비용 부과 |

## 마무리

SWR 패턴을 적용하고 나니, 배포할 때마다 무효화 버튼을 누르던 일이 사라졌습니다. 빌드 과정에서 `Cache-Control`만 제대로 설정하면, CloudFront가 알아서 최신 콘텐츠를 유지해 줍니다. 정적 사이트 운영 비용을 줄이고 사용자 경험도 향상시키고 싶다면 꼭 한 번 적용해 보세요.
