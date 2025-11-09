---
layout:       post
title:        "[Cloud] 웹사이트에서의 NLB(Network Load Balancer)"
date: '2025-05-14'
section: 'infra'
excerpt: '웹사이트에 Network Load Balancer 적용 및 ALB 대비 장단점 분석'
tags: ['AWS', 'NLB', 'Load Balancer', 'Cloud', 'Infrastructure']
---

"웹 서비스라면 ALB를 써야 한다"는 말을 흔히 듣습니다. 하지만 L4 기반의 NLB를 쓰면 어떤 결과가 나올지 궁금해졌고, 직접 구성해 보았습니다. 이 글은 Azure NLB를 기준으로 알고리즘을 확인하고, 실제 부하 테스트를 통해 체감 성능을 측정한 기록입니다.

## NLB의 분산 방식은?

Azure NLB는 **5-tuple 해시**를 사용합니다.

- Source IP
- Source Port
- Destination IP
- Destination Port
- Protocol

이 다섯 값을 해싱해 백엔드 풀의 VM 중 하나를 선택합니다. 따라서 Source Port가 바뀔 때마다 다른 VM으로 라우팅되며, 겉보기에는 Round-Robin처럼 느껴질 수 있습니다.

![](https://velog.velcdn.com/images/xxng1/post/a625504d-c44c-4a57-ba69-bcce35170229/image.png)

## 테스트 환경 구성

- VM 3대 + NLB 1대 (Standard SKU)
- Terraform으로 네트워크, 보안 그룹, VM, NLB 리소스 구성
- 각 VM에는 간단한 Nginx 서버와 "Hello from VM n" 페이지 배포

![](https://velog.velcdn.com/images/xxng1/post/47284d13-e672-47f8-8529-a4cada8828d1/image.png)
![](https://velog.velcdn.com/images/xxng1/post/60786f93-7c19-44d2-b873-37a8abaae66c/image.png)

Terraform 스니펫(발췌):

```hcl
resource "azurerm_lb" "nlb" {
  name                = "nlbtest-nlb"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "Standard"

  frontend_ip_configuration {
    name                 = "frontend"
    public_ip_address_id = azurerm_public_ip.lb_pip.id
  }
}

resource "azurerm_lb_rule" "lbrule" {
  name                           = "http-rule"
  loadbalancer_id                = azurerm_lb.nlb.id
  protocol                       = "Tcp"
  frontend_port                  = 80
  backend_port                   = 80
  frontend_ip_configuration_name = "frontend"
  backend_address_pool_ids       = [azurerm_lb_backend_address_pool.bepool.id]
  probe_id                       = azurerm_lb_probe.probe.id
}
```

## Curl + tcpdump로 확인하기

1. 퍼블릭 IP로 여러 번 `curl`을 실행하면 `VM2 → VM1 → VM0` 순서로 응답이 돌아옵니다.
2. 각 VM에서 `tcpdump`로 캡처해 보면 Source Port가 매 요청마다 바뀌는 것을 확인할 수 있습니다.
3. 즉, Round-Robin이 아니라 **해시 결과가 달라져 순차적으로 분산되는 현상**입니다.

![](https://velog.velcdn.com/images/xxng1/post/1f615888-86f9-404a-ad0b-206df1cd93ed/image.png)
![](https://velog.velcdn.com/images/xxng1/post/d0690776-259f-4de9-9c77-ac4a630073f9/image.png)
![](https://velog.velcdn.com/images/xxng1/post/b289264b-3ca3-4a87-b821-5c54643a1500/image.png)
![](https://velog.velcdn.com/images/xxng1/post/0e46913d-7403-4779-99ab-a0684d4f1c08/image.png)
![](https://velog.velcdn.com/images/xxng1/post/299fbe73-90e6-4baf-80a3-0d41d4ae5475/image.png)
![](https://velog.velcdn.com/images/xxng1/post/3d0b480b-b7f2-409d-8ac4-e3d2bcad9625/image.png)

## 부하 테스트 (k6)

테스트 스크립트:

```js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 10000,
  duration: '10s',
};

export default function () {
  const res = http.get('http://4.218.19.35');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'body includes VM banner': (r) =>
      ['Hello from VM 0', 'Hello from VM 1', 'Hello from VM 2'].some((text) => r.body.includes(text)),
  });
}
```

### 결과 요약

- Smoke Test: 짧은 시간 동안 기본 응답 확인
- Load Test: 동시 사용자 100명, 3분. 에러 없이 평균 응답 200ms대 유지
- Stress Test: 동시 사용자 200명 이상에서 일부 타임아웃 발생

![](https://velog.velcdn.com/images/xxng1/post/824cb09b-911d-4304-b7f3-acaef4adf0ba/image.png)

## 결론

- NLB는 매우 낮은 지연을 제공하고, 단순 트래픽 분산에는 충분히 좋은 선택입니다.
- 하지만 URL 라우팅, SSL 종료, 세션 스티키니스 등 L7 기능이 필요하다면 여전히 ALB가 적합합니다.
- 고부하 상황에서는 백엔드 확장 없이는 한계가 명확하게 드러났습니다.

전반적으로 NLB는 "가볍지만 빠른" 구성에 잘 맞습니다. 프로젝트 상황에 따라 NLB와 ALB 각각의 장단점을 비교해 선택하면 좋겠습니다.
