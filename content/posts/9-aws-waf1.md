---
layout:       post
title:        "[Cloud] 웹 공격 방어 ( feat. AWS )"
date: '2024-08-15'
section: 'infra'
excerpt: 'AWS WAF를 활용한 웹 애플리케이션 보안 및 공격 방어 설정'
tags: ['AWS', 'WAF', 'Security', 'Cloud']
---

프로덕션 환경을 준비하면서 "헬스 체크는 잘 되는데, 보안은 어떻게 막을까?"라는 질문을 자주 받았습니다. 그래서 AWS에서 제공하는 WAF(Web Application Firewall)를 직접 구성해 보며 얻은 내용을 정리했습니다. 기본적인 공격 유형을 짚어보고, Web ACL을 만들면서 적용했던 규칙 예시까지 함께 기록했습니다.

## 먼저 짚고 가는 공격 유형

- **SQL Injection**: 파라미터에 SQL 문을 삽입해 인증을 우회하거나 데이터를 탈취하는 공격
- **XSS**: 사용자 입력에 악성 스크립트를 심어 브라우저에서 실행시키는 공격
- **DDoS**: 다수의 IP가 동시에 요청을 보내 서비스 자원을 고갈시키는 공격

WAF는 이러한 애플리케이션 레벨(L7) 공격을 차단하는 데 초점을 맞춘 서비스입니다.

## AWS WAF 살펴보기

- **배포 대상**: CloudFront, ALB, API Gateway, AppSync 등 L7에서 동작하는 리소스
- **구성 요소**
  - Web ACL: 룰의 집합. 어떤 리소스에 적용할지 지정
  - Rules / Rule Groups: 실제로 트래픽을 허용·차단하는 기준
  - Log & Metrics: CloudWatch, Kinesis Firehose 등으로 분석 가능

이번 실습에서는 ALB 앞단에 Web ACL을 배치해 요청이 들어오는 시점에 필터링했습니다.

## Web ACL 생성 절차

1. **WAF & Shield 콘솔** → Web ACL 생성

   ![](https://velog.velcdn.com/images/woongaa1/post/3e20e4f6-e714-435e-8ccb-d1367fc5089a/image.png)

2. 이름, 리전, 연결할 리소스(ALB 등) 선택

   ![](https://velog.velcdn.com/images/woongaa1/post/6926f03e-ce7c-4585-ae10-5b10cbebe997/image.png)

3. 당장 연결할 AWS 서비스를 선택하고, 적용 대상을 확인

   ![](https://velog.velcdn.com/images/woongaa1/post/d714d461-cab9-4ce5-9fbb-79739d6a2a1e/image.png)

4. 룰 추가 (Managed Rule Group 또는 직접 작성)

   ![](https://velog.velcdn.com/images/woongaa1/post/8888759f-98e1-43e8-82c0-0a2f5b5d143c/image.png)

5. 콘솔에서 제공하는 JSON 에디터를 통해 규칙을 쉽게 작성·검증할 수 있습니다.

   ![](https://velog.velcdn.com/images/woongaa1/post/cf62011c-2176-4ed7-b2a5-38738badb0d9/image.png)

## 직접 만든 룰 예시

### 1. 국가 기반 차단

```json
{
  "Name": "BLOCK_KOREA",
  "Priority": 0,
  "Action": { "Block": {} },
  "VisibilityConfig": {
    "SampledRequestsEnabled": true,
    "CloudWatchMetricsEnabled": true,
    "MetricName": "BLOCK_KOREA"
  },
  "Statement": {
    "GeoMatchStatement": {
      "CountryCodes": ["KR"]
    }
  }
}
```

특정 국가에서만 접근하도록 제한하고 싶을 때 사용했습니다.

### 2. 속도(요청 빈도) 제한

```json
{
  "Name": "MAX_REQUEST_1000",
  "Priority": 0,
  "Action": { "Block": {} },
  "VisibilityConfig": {
    "SampledRequestsEnabled": true,
    "CloudWatchMetricsEnabled": true,
    "MetricName": "MAX_REQUEST_1000"
  },
  "Statement": {
    "RateBasedStatement": {
      "Limit": "1000",
      "AggregateKeyType": "IP"
    }
  }
}
```

5분 동안 요청이 1000건을 초과하는 IP를 차단합니다. 간단한 DDoS 완화에 유용합니다.

### 3. User-Agent 필터링

```json
{
  "Name": "USERAGENT_BLOCK_PYTHON",
  "Priority": 0,
  "Action": { "Block": {} },
  "VisibilityConfig": {
    "SampledRequestsEnabled": true,
    "CloudWatchMetricsEnabled": true,
    "MetricName": "USERAGENT_BLOCK_PYTHON"
  },
  "Statement": {
    "ByteMatchStatement": {
      "FieldToMatch": {
        "SingleHeader": { "Name": "User-Agent" }
      },
      "PositionalConstraint": "CONTAINS",
      "SearchString": "python",
      "TextTransformations": [
        { "Type": "LOWERCASE", "Priority": 0 }
      ]
    }
  }
}
```

스크립트 기반 공격 시도(예: `python`으로된 User-Agent)를 필터링하기 위해 사용했습니다.

## 모니터링 설정

Web ACL을 적용한 후에는 반드시 로그와 메트릭을 활성화하는 것이 좋습니다.

- **CloudWatch Metrics**: 룰별 차단/허용 건수 추이 확인
- **Sampled Requests**: 실제로 어떤 요청이 차단되었는지 샘플 분석
- **Kinesis Firehose + S3**: 상세 로그를 저장하고 Athena로 쿼리

## 마무리

AWS WAF는 완벽한 보안을 보장하진 않지만, 애플리케이션 앞단에서 쉽게 적용할 수 있는 1차 방어선입니다. 규칙을 세밀하게 조정하면 특정 봇, 국가, 공격 패턴을 효과적으로 필터링할 수 있습니다. 이후에는 Managed Rule Group(예: AWS Managed Rules for Common Vulnerabilities)를 함께 사용해 보안 커버리지를 더 넓히는 것도 추천합니다.


