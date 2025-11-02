---
layout:       post
title:        "[Cloud] 웹사이트에서의 NLB(Network Load Balancer)"
date: '2025-05-14'
section: 'infra'
excerpt: '웹사이트에 Network Load Balancer 적용 및 ALB 대비 장단점 분석'
tags: ['AWS', 'NLB', 'Load Balancer', 'Cloud', 'Infrastructure']
---

<br />

> 웹사이트에서 NLB를 사용하는 구성

<br /><br />




웹사이트에서는 주로 ALB(Application Load Balancer)를 사용하는데, NLB(Network Load Balancer)를 사용하면 안될까?

이 글에서는, 웹사이트에서 NLB를 사용하는 구성과 `Azure NLB 동작 알고리즘`을 알아보고, `성능 테스트`를 진행한다.

# ✔️ Azure NLB의 Load Balancing 일고리즘 & NLB 성능 테스트

### ✔️ Azure NLB 기준 동작 알고리즘?
*5-tuple hash* 에 의해 해시값 → 백엔드 풀의 특정 VM으로 매핑됨

### 5-tuple hash
-> (Source IP, Source Port, Destination IP, Destination Port, Protocol)

이 5개의 값들의 조합을 해시하여 백엔드 풀 중 하나를 결정.


# 목차
### 1. 현재 상태 (구성)
- Azure NLB 알고리즘을 알아보기 위한 리소스 구성

### 2. Curl 테스트 
- Curl, tcpdump 를 통한 알고리즘 테스트

### 3. 성능 테스트
  - Smoke, Load, Stress 테스트

### 4. 결론

---

# 1. 현재 상태

3개의 VM이 있고:

![](https://velog.velcdn.com/images/xxng1/post/a625504d-c44c-4a57-ba69-bcce35170229/image.png)

1개의 NLB(Network Load Balancer)가 있고:

![](https://velog.velcdn.com/images/xxng1/post/47284d13-e672-47f8-8529-a4cada8828d1/image.png)

이 NLB에서 3개의 VM을 호스팅합니다:

![](https://velog.velcdn.com/images/xxng1/post/60786f93-7c19-44d2-b873-37a8abaae66c/image.png)

### 사용한 Terraform 파일 (main.tf)
```hcl
# provider "azurerm" {
#   features {}
# }

provider "azurerm" {
  features {}

  subscription_id = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}

resource "azurerm_resource_group" "rg" {
  name     = "nlbtest-rg"
  location = "Korea Central"
}

resource "azurerm_virtual_network" "vnet" {
  name                = "nlbtest-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_subnet" "subnet" {
  name                 = "nlbtest-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_public_ip" "lb_pip" {
  name                = "nlbtest-nlb-pip"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

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

resource "azurerm_lb_backend_address_pool" "bepool" {
  name            = "nlbtest-backend-pool"
  loadbalancer_id = azurerm_lb.nlb.id
}

resource "azurerm_network_security_group" "nsg" {
  name                = "nlbtest-nsg"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  security_rule {
    name                       = "allow-http"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "allow-ssh"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_network_interface" "nic" {
  count               = 3
  name                = "nlbtest-nic-${count.index}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
  }
}

resource "azurerm_network_interface_backend_address_pool_association" "nic_lb_assoc" {
  count                     = 3
  network_interface_id      = azurerm_network_interface.nic[count.index].id
  ip_configuration_name     = "internal"
  backend_address_pool_id   = azurerm_lb_backend_address_pool.bepool.id
}

resource "azurerm_network_interface_security_group_association" "nic_nsg" {
  count                     = 3
  network_interface_id      = azurerm_network_interface.nic[count.index].id
  network_security_group_id = azurerm_network_security_group.nsg.id
}

resource "azurerm_linux_virtual_machine" "vm" {
  count               = 3
  name                = "nlbtest-vm-${count.index}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  size                = "Standard_B1s"
  admin_username      = "azureuser"
  network_interface_ids = [azurerm_network_interface.nic[count.index].id]

  admin_ssh_key {
    username   = "azureuser"
    public_key = file("~/.ssh/id_rsa.pub") # SSH 키 경로 확인 필요
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }

  custom_data = base64encode(<<-EOF
              #!/bin/bash
              apt update
              apt install -y nginx
              echo "Hello from VM ${count.index}" > /var/www/html/index.html
              systemctl enable nginx
              systemctl restart nginx
              EOF
  )
}

resource "azurerm_lb_probe" "probe" {
  name            = "http-probe"
  loadbalancer_id = azurerm_lb.nlb.id
  protocol        = "Tcp"
  port            = 80
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

output "lb_public_ip" {
  value = azurerm_public_ip.lb_pip.ip_address
}

```


## 2. Curl 테스트

![](https://velog.velcdn.com/images/xxng1/post/1f615888-86f9-404a-ad0b-206df1cd93ed/image.png)

Public IP에 Curl로 요청을 보냅니다:

![](https://velog.velcdn.com/images/xxng1/post/d0690776-259f-4de9-9c77-ac4a630073f9/image.png)

VM2 → VM1 → VM0 → VM2 ... 순서대로 작동하는 것처럼 보입니다.

`seq` 명령어로 다시 요청을 보냅니다:

![](https://velog.velcdn.com/images/xxng1/post/b289264b-3ca3-4a87-b821-5c54643a1500/image.png)

100번씩 요청을 보내면, VM2 → VM1 → VM0 순서대로 34번씩 (33+33+34=100) 요청을 받습니다.

그렇다면 Azure NLB는 RR(Round-Robin) 방식일까요?

### ❌ Azure NLB는 Round-Robin 방식이 아니다

아래 조건을 만족할 경우 Round-Robin처럼 보일 수 있습니다:

- **curl 요청의 Source Port가 매번 다르게 랜덤으로 바뀌는 경우**
- curl을 여러 번 실행할 때 매번 새로운 TCP 커넥션을 생성하는 경우
- Destination은 동일 (4.218.19.35:80), Protocol은 TCP, Source IP는 동일

결국 5-tuple 중 source port만 계속 바뀌면, 해시 결과도 달라져서 VM2 → VM1 → VM0처럼 Round-Robin 효과가 나는 것처럼 보입니다.

### tcpdump 실행 후 Curl

**VM 1 호출**
![](https://velog.velcdn.com/images/xxng1/post/0e46913d-7403-4779-99ab-a0684d4f1c08/image.png)

**VM 0 호출**
![](https://velog.velcdn.com/images/xxng1/post/299fbe73-90e6-4baf-80a3-0d41d4ae5475/image.png)

**VM 2 호출**
![](https://velog.velcdn.com/images/xxng1/post/3d0b480b-b7f2-409d-8ac4-e3d2bcad9625/image.png)



지금 tcpdump 결과를 보면 curl 요청을 보낼 때마다 Source Port **(64352, 64353, 64354)** 가 계속 자동으로 증가하면서 바뀌고 있다는 걸 확인할 수 있다.

이 때문에 5-tuple Hash 결과가 계속 달라지고, Azure NLB가 다른 백엔드 VM으로 요청을 보내는 것이다.


## 3. NLB 성능 테스트

**K6**으로 부하 테스트를 실행합니다.

### nlb-test.js (k6)
```js

import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 10000,             // 동시 사용자 수
  duration: '10s',     // 테스트 시간
};

export default function () {
  const res = http.get('http://4.218.19.35');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'body is VM 0/1/2': (r) =>
      r.body.includes('Hello from VM 0') ||
      r.body.includes('Hello from VM 1') ||
      r.body.includes('Hello from VM 2'),
  });
}



```








## 1. Smoke Test
*10명 사용자*, *10초* 수행

```bash

 xxng  ~/desktop/terraform/nlb-website/az  k6 run nlb-test.js

         /\      Grafana   /‾‾/
    /\  /  \     |\  __   /  /
   /  \/    \    | |/ /  /   ‾‾\
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/

     execution: local
        script: nlb-test.js
        output: -

     scenarios: (100.00%) 1 scenario, 10 max VUs, 40s max duration (incl. graceful stop):
              * default: 10 looping VUs for 10s (gracefulStop: 30s)



  █ TOTAL RESULTS

    checks_total.......................: 16664   1665.01504/s
    checks_succeeded...................: 100.00% 16664 out of 16664
    checks_failed......................: 0.00%   0 out of 16664

    ✓ status is 200
    ✓ body is VM 0/1/2

    HTTP
    http_req_duration.......................................................: avg=11.76ms min=4.96ms med=9.18ms max=115.66ms p(90)=13.04ms p(95)=18.13ms
      { expected_response:true }............................................: avg=11.76ms min=4.96ms med=9.18ms max=115.66ms p(90)=13.04ms p(95)=18.13ms
    http_req_failed.........................................................: 0.00%  0 out of 8332
    http_reqs...............................................................: 8332   832.50752/s

    EXECUTION
    iteration_duration......................................................: avg=11.99ms min=4.99ms med=9.31ms max=115.82ms p(90)=14.36ms p(95)=19.19ms
    iterations..............................................................: 8332   832.50752/s
    vus.....................................................................: 10     min=10        max=10
    vus_max.................................................................: 10     min=10        max=10

    NETWORK
    data_received...........................................................: 2.2 MB 217 kB/s
    data_sent...............................................................: 558 kB 56 kB/s




running (10.0s), 00/10 VUs, 8332 complete and 0 interrupted iterations
default ✓ [======================================] 10 VUs  10s
 x

```


## 2. Load Test

*100명 사용자*, *60초* 수행

```bash
xxng  ~/desktop/terraform/nlb-website/az  k6 run nlb-test.js

         /\      Grafana   /‾‾/
    /\  /  \     |\  __   /  /
   /  \/    \    | |/ /  /   ‾‾\
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/

     execution: local
        script: nlb-test.js
        output: -

     scenarios: (100.00%) 1 scenario, 100 max VUs, 1m30s max duration (incl. graceful stop):
              * default: 100 looping VUs for 1m0s (gracefulStop: 30s)



  █ TOTAL RESULTS

    checks_total.......................: 708564  11790.398986/s
    checks_succeeded...................: 100.00% 708564 out of 708564
    checks_failed......................: 0.00%   0 out of 708564

    ✓ status is 200
    ✓ body is VM 0/1/2

    HTTP
    http_req_duration.......................................................: avg=16.71ms min=4.65ms med=10.85ms max=377.83ms p(90)=25.17ms p(95)=35.28ms
      { expected_response:true }............................................: avg=16.71ms min=4.65ms med=10.85ms max=377.83ms p(90)=25.17ms p(95)=35.28ms
    http_req_failed.........................................................: 0.00%  0 out of 354282
    http_reqs...............................................................: 354282 5895.199493/s

    EXECUTION
    iteration_duration......................................................: avg=16.93ms min=4.71ms med=10.96ms max=385.62ms p(90)=25.51ms p(95)=35.93ms
    iterations..............................................................: 354282 5895.199493/s
    vus.....................................................................: 100    min=100         max=100
    vus_max.................................................................: 100    min=100         max=100

    NETWORK
    data_received...........................................................: 93 MB  1.5 MB/s
    data_sent...............................................................: 24 MB  395 kB/s




running (1m00.1s), 000/100 VUs, 354282 complete and 0 interrupted iterations
default ✓ [======================================] 100 VUs  1m0s

```




| 항목             | 10 VUs / 10s | 100 VUs / 60s |
|------------------|--------------|---------------|
| RPS              | ~830         | ~5,900        |
| 평균 응답 시간   | ~11.7ms          | ~16.7ms       |
| 최대 응답 시간   | ~115ms           | ~378ms        |
| 성공률           | 100%           | 100%          |

### 🧠 해석:

- 사용자 10배 증가 → 처리량도 거의 10배 증가
- 응답 시간도 소폭 상승 (정상 범위)
- NLB 또는 백엔드 VM에 과부하 증거 없음 → 수평 확장 안정적으로 작동


### ✅ 웹사이트에 NLB를 사용했지만 꽤 괜찮은 성능.




### Stress Test

10,000명 사용자, 10초 수행:

```bash
k6 run nlb-test.js
```
█ TOTAL RESULTS

    checks_total.......................: 55964  1396.780297/s
    checks_succeeded...................: 71.42% 39970 out of 55964
    checks_failed......................: 28.57% 15994 out of 55964

    ✗ status is 200
      ↳  71% — ✓ 19985 / ✗ 7997
    ✗ body is VM 0/1/2
      ↳  71% — ✓ 19985 / ✗ 7997

    HTTP
    http_req_duration.......................................................: avg=3.61s min=0s     med=858.28ms max=33.14s p(90)=8.99s p(95)=11.2s
      { expected_response:true }............................................: avg=4.46s min=6.83ms med=1.48s    max=33.14s p(90)=9.4s  p(95)=11.31s
    http_req_failed.........................................................: 28.57% 7997 out of 27982
    http_reqs...............................................................: 27982  698.390149/s

    EXECUTION
    iteration_duration......................................................: avg=3.99s min=1.72ms med=1.58s    max=33.14s p(90)=9.22s p(95)=11.2s
    iterations..............................................................: 27982  698.390149/s
    vus.....................................................................: 454    min=454           max=10000
    vus_max.................................................................: 10000  min=10000         max=10000

    NETWORK
    data_received...........................................................: 5.2 MB 130 kB/s
    data_sent...............................................................: 2.1 MB 52 kB/s




running (40.1s), 00000/10000 VUs, 27982 complete and 454 interrupted iterations
default ✓ [======================================] 10000 VUs  10s
 xxng  ~/desktop/terraform/nlb-website/az 





```


| 항목             | 10 VUs / 10s | 100 VUs / 60s | 10,000 VUs / 10s       |
|------------------|--------------|---------------|-------------------------|
| RPS              | ~830         | ~5,900        | ~698                    |
| 평균 응답 시간   | ~11.7ms      | ~16.7ms       | ~3.6s                   |
| 최대 응답 시간   | ~115ms       | ~378ms        | ~33s                    |
| 성공률           | 100%         | 100%          | **71.4%** (28.6% 실패)  |




![](https://velog.velcdn.com/images/xxng1/post/824cb09b-911d-4304-b7f3-acaef4adf0ba/image.png)

### ⬆️ 스트레스 테스트에는 버티지 못하는 모습

## 4. 결론

Azure NLB는 L4 기반의 로드 밸런서로 웹사이트 구축에는 제한적인 기능만 제공하지만, 단순한 정적 웹 페이지나 고성능이 필요한 서비스에서는 꽤 우수한 성능을 발휘합니다.

실제 테스트에서도 평균 **10ms** 내외의 빠른 응답 속도와 **100% 성공률**을 기록하며 안정적인 트래픽 처리를 보였습니다.

하지만 **URL 라우팅**, **SSL 종단 처리**, **세션 유지**와 같은 고급 기능이 필요한 경우에는 **ALB** 사용이 일반적으로 더 적절합니다.

다만, 극단적으로 높은 동시 접속(예: 10,000 VUs)에서는 응답 지연과 실패가 발생하며, 이는 백엔드 VM 수의 증가, 커넥션 처리 설정, 그리고 인프라 확장이 필요하다는 점을 보여줍니다.
