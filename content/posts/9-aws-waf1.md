---
layout:       post
title:        "AWS WAF(Web Application Firewall)를 사용한 웹 공격 방어 설정"
date: '2024-08-15'
section: 'infra'
excerpt: '웹 애플리케이션 보안 및 공격 방어 설정'
tags: ['AWS', 'WAF', 'Security', 'Cloud']
---

AWS 서비스 중 WAF(Web Application Firewall)를 직접 구성해 보며 얻은 내용

<br>

# ☑️ 먼저 짚고 가는 공격 유형

- **SQL Injection**: 파라미터에 SQL 문을 삽입해 인증을 우회하거나 데이터를 탈취하는 공격
- **XSS**: 사용자 입력에 악성 스크립트를 심어 브라우저에서 실행시키는 공격
- **DDoS**: 다수의 IP가 동시에 요청을 보내 서비스 자원을 고갈시키는 공격

WAF는 이러한 애플리케이션 레벨(L7) 공격을 차단하는 데 초점을 맞춘 서비스.

<br>

# ☑️ AWS WAF 살펴보기

- **배포 대상**: CloudFront, ALB, API Gateway, AppSync 등 L7에서 동작하는 리소스
- **구성 요소**
  - Web ACL: 룰의 집합. 어떤 리소스에 적용할지 지정
  - Rules / Rule Groups: 실제로 트래픽을 허용·차단하는 기준
  - Log & Metrics: CloudWatch, Kinesis Firehose 등으로 분석 가능

이번 실습에서는 ALB 앞단에 Web ACL을 배치해 요청이 들어오는 시점에 필터링

<br>

# ☑️ Web ACL 생성 절차

- **WAF & Shield 콘솔** → Web ACL 생성

   ![](https://velog.velcdn.com/images/woongaa1/post/3e20e4f6-e714-435e-8ccb-d1367fc5089a/image.png)


<br>   

- 이름, 리전, 연결할 리소스(ALB 등) 선택

   ![](https://velog.velcdn.com/images/woongaa1/post/6926f03e-ce7c-4585-ae10-5b10cbebe997/image.png)


<br>

- 연결할 AWS 서비스를 선택하고, 적용 대상을 확인

   ![](https://velog.velcdn.com/images/woongaa1/post/d714d461-cab9-4ce5-9fbb-79739d6a2a1e/image.png)



<br>


- 룰 추가 (Managed Rule Group 또는 직접 작성)

   ![](https://velog.velcdn.com/images/woongaa1/post/8888759f-98e1-43e8-82c0-0a2f5b5d143c/image.png)


<br>



- 콘솔에서 제공하는 JSON 에디터를 통해 규칙을 쉽게 작성하고 검증할 수 있다.

   ![](https://velog.velcdn.com/images/woongaa1/post/cf62011c-2176-4ed7-b2a5-38738badb0d9/image.png)


<br>



# ☑️ 룰 예시

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

특정 국가에서만 접근하도록 제한하고 싶을 때 사용.

<br>

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

5분 동안 요청이 1000건을 초과하는 IP를 차단하는 규칙. 간단한 DDoS 완화에 유용하다.


<br>


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

스크립트 기반 공격 시도(예: `python`으로된 User-Agent)를 필터링할 수 있다.


<br>
