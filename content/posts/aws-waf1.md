---
layout:       post
title:        "웹 공격 방어 ( feat. AWS )"
date: '2024-08-15'
section: 'tech'
# excerpt: ''
# categories: ['AWS', 'Database/mysql', 'Database/oracle']
---
### SQL injection?
논리적 오류를 포함한 SQL 문을 임의로 주입하여 데이터베이스를 공격하는 행위
```sql
SELECT user FROM user_table WHERE 
id='admin' AND password=' ' OR '1' = '1';
```
해당 구문에서 false and false or true 기 때문에 AND연산이 OR연산 보다 우선순위가 빠르므로 false or True가 되기 때문에 연산값이 True가 되어, 로그인에 성공하게 된다. 아이디와 비밀번호를 몰라도 'OR '1' = '1 라는 구문에 의해서 로그인에 성공하게 되는 것이다.

해당 공격을 막기 위해서 특수문자 필터링(화이트리스트 체크), 서버에서 체크 등 많은 방법이 있다.

### XSS 공격?
공격자가 상대방의 브라우저에 스크립트가 실행되도록 해 사 공격하는 방식,

웹사이트에서 
```js
<script> alert(1) </script>
``` 
와 같이 스크립트를 삽입해서 alert창을 띄우는 기법이다.
### DDos?
서버, 서비스 또는 네트워크에 인터넷 트래픽을 대량으로 보내는 공격

# AWS WAF?
AWS WAF의 AWS Firewall Manager를 설정해서 위에서 설명한 `SQL injection`, `XSS 공격`, `DDoS` 등을 방어할수 있다.

AWS WAF(Web Application Firewall)은 **Application Layer(7 Layer)**에서 발생하는 보안 위협 공격에 대응하는 서비스이다.
`CloudFront`, `ALB(Application Load Balancer)`, `API Gateway`, `AppSync` 등에 배포할 수 있다.

ALB가 있는 AWS WAF 규칙은 리전에서 실행된다.

`Internet gateway`와 `ALB`가 통신하는 과정에서 `AWS WAF` 규칙을 구성하는 과정을 알아보자.


### 1. WAF & Shield 에서 Web ACL을 생성해준다.

![](https://velog.velcdn.com/images/woongaa1/post/3e20e4f6-e714-435e-8ccb-d1367fc5089a/image.png)

리소스 타입 및 이름을 입력해준다.
![](https://velog.velcdn.com/images/woongaa1/post/6926f03e-ce7c-4585-ae10-5b10cbebe997/image.png)

당장 연결할 AWS 서비스를 선택할 수 있다.
![](https://velog.velcdn.com/images/woongaa1/post/d714d461-cab9-4ce5-9fbb-79739d6a2a1e/image.png)

### 2. 다음으로 넘어가서, 규칙을 추가해준다.
![](https://velog.velcdn.com/images/woongaa1/post/8888759f-98e1-43e8-82c0-0a2f5b5d143c/image.png)

`Add rules` -> `Add managed rule groups` 에서 AWS가 제공해주는 템플릿을 이용할 수 있는데, 
직접 규칙을 만들어 주기 위해서
`Add rules` -> `Add my own rules and rule groups` 탭으로 이동한다.

`Rule JSON editor`에서 다음과 같은 화면을 볼 수 있다.
![](https://velog.velcdn.com/images/woongaa1/post/cf62011c-2176-4ed7-b2a5-38738badb0d9/image.png)

작성 후, `Validate` 버튼을 통해서 규칙을 검증한다.

### 국가 IP 기반 차단
한국IP 에서 요청이 들어온 경우 차단하는 규칙
```json
{
  "Name": "BLOCK_KOREA",
  "Priority": 0,
  "Action": {
    "Block": {}
  },
  "VisibilityConfig": {
    "SampledRequestsEnabled": true,
    "CloudWatchMetricsEnabled": true,
    "MetricName": "BLOCK_KOREA"
  },
  "Statement": {
    "GeoMatchStatement": {
      "CountryCodes": [
        "KR"
      ]
    }
  }
}
```
### 속도 기반 IP 차단 [DDos]
특정IP 요청이 5분 동안 1000번 이상 웹 요청시 차단하는 규칙

```json
{
  "Name": "MAX_REQUEST_1000",
  "Priority": 0,
  "Action": {
    "Block": {}
  },
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

### HTTP Header 기반의 요청 차단 [SQL injection]
"User-Agent" 헤더로 매칭해서 문자열에 대소문자 구별없이(LOWERCASE) "python" 문자열이 포함되어 있을 시 차단하는 규칙
```json
{
  "Name": "USERAGENT_BLOCK_PYTHON",
  "Priority": 0,
  "Action": {
    "Block": {}
  },
  "VisibilityConfig": {
    "SampledRequestsEnabled": true,
    "CloudWatchMetricsEnabled": true,
    "MetricName": "USERAGENT_BLOCK_PYTHON"
  },
  "Statement": {
    "ByteMatchStatement": {
      "FieldToMatch": {
        "SingleHeader": {
          "Name": "User-Agent"
        }
      },
      "PositionalConstraint": "CONTAINS",
      "SearchString": "python",
      "TextTransformations": [
        {
          "Type": "LOWERCASE",
          "Priority": 0
        }
      ]
    }
  }
}
```

### 3.***Configure metrics*** 에서, CloudWatch를 통한 메트릭 설정을 할 수 있다.


