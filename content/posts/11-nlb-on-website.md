---
layout:       post
title:        "웹사이트에서의 NLB(Network Load Balancer)와 Azure Load Balancer 알고리즘"
date: '2025-05-14'
section: 'infra'
excerpt: 'WEB(HTTP/HTTPS)사이트에서의 L4 Layer Load Balancer와 성능 테스트'
tags: ['Azure', 'NLB', 'Cloud', 'HTTP', 'Terraform', 'k6']
---

웹사이트는 HTTP/HTTPS 레벨에서 동작하기 때문에 URL·호스트 기반 라우팅, WAF, 쿠키 기반 세션 유지가 필요하면 L7 로드 밸런서가 적합하다.

하지만 모든 웹 서비스에 L7 기능이 필요한 것은 아니다. HTTP/HTTPS도 TCP 위에서 동작하므로, TLS 종료와 HTTP 처리를 백엔드가 담당할 수 있다면 L4 로드 밸런서로도 충분히 서비스할 수 있다. 특히 **L7 기능보다 지연 시간과 처리량이 중요하다면 L4가 더 적합한 선택**일 수 있다.

이 글에서는 Azure의 L4 서비스인 **Azure Load Balancer**의 분산 알고리즘을 알아보고, 간단한 부하 테스트를 진행한다.



![](/blog-images/11/1.png)
<sub>[docs: azure load balancer](https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-overview)</sub>

---

![](/blog-images/11/2.png)
<sub>[docs: azure application gateway](https://learn.microsoft.com/en-us/azure/application-gateway/overview)</sub>


---

서비스별 세부 기능은 다르지만, 계층과 역할을 기준으로 대략 대응시키면 AWS의 **NLB(Network Load Balancer)** 는 Azure의 **Load Balancer**에, AWS의 **ALB(Application Load Balancer)** 는 Azure의 **Application Gateway**에 해당한다.

| AWS 서비스 | Azure 서비스 | 계층 |
| :--- | :--- | :--- |
| **NLB (Network Load Balancer)** | **Azure Load Balancer** | **L4** |
| **ALB (Application Load Balancer)** | **Application Gateway** | **L7** |





<br>

# ☑️ Azure Load Balancer의 분산 방식은?

Azure Load Balancer는 **5-tuple 해시**를 사용한다.

- Source IP
- Source Port
- Destination IP
- Destination Port
- Protocol

이 다섯 값을 해싱해 **백엔드 풀(Backend pool)** 의 VM 중 하나를 선택한다.  
<sub> [Azure Docs: Backend pool management](https://learn.microsoft.com/ko-kr/azure/load-balancer/backend-pool-management) </sub>

새 TCP 세션을 만들면서 `Source Port`가 바뀌면 해시 입력도 달라지고, 백엔드 VM이 다시 선택된다. 다만 **Source Port가 바뀌었다고 반드시 이전과 다른 VM이 선택되는 것은 아니며**, VM0 → VM1 → VM2와 같은 순서도 보장하지 않는다.

반대로 HTTP keep-alive로 같은 TCP 연결을 재사용하면 5-tuple이 유지되므로, 해당 연결의 여러 HTTP 요청은 같은 백엔드 VM으로 전달된다. Azure Load Balancer의 기본 분산 단위는 HTTP 요청이 아니라 TCP/UDP 흐름이다.

<br>

# ☑️ 테스트 환경 구성

- VM 3대(Standard_B1s)

![](/blog-images/11/3.png)

<br>

- Azure Load Balancer 한개

![](/blog-images/11/4.png)

<br>

- 3개의 VM을 호스팅하도록 Backend pools 구성

![](/blog-images/11/5.png)

<br>


- 추가적으로 **Terraform**을 사용해서 네트워크, 보안 그룹, VM, NLB 리소스 구성

<details>
  <summary style="font-size:1.2em; font-weight:bold;">사용한 Terraform 파일 (main.tf)</summary>


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



</details>


<br>

# ☑️ 테스트 결과 확인

`Curl`명령어와 `tcpdump` 명령어를 통해서 확인하기

- Terraform `output.tf`에서 확인한 Public IP

![](/blog-images/11/6.png)

<br>

- Public IP로 `curl`을 여러 번 실행하면 각 명령이 새로운 TCP 연결을 만들고, 요청이 여러 VM으로 분산되는 것을 확인할 수 있다. 아래 실행에서는 VM0, VM1, VM2가 반복해서 나타났지만 이 순서는 Azure Load Balancer가 보장하는 Round-Robin 결과가 아니다.

![](/blog-images/11/7.png)

<br>

- `seq` 명령어로 다시 요청을 보내보면 각 순서대로 요청을 받는 것을 확인할 수 있다.

![](/blog-images/11/8.png)



결국 5-tuple 중 Source Port가 계속 바뀌면 해시 입력도 달라진다. 이 때문에 요청이 여러 VM에 비교적 고르게 분산되어 Round-Robin처럼 보일 수 있지만, 실제 알고리즘은 연결 단위의 5-tuple 해시다.


<br>

- 클라이언트에서 `tcpdump`로 캡처해 보면, 각각의 `curl`이 새 연결을 만들면서 Source Port가 바뀌는 것을 확인할 수 있다.

<div align="center">
<64352 port>
</div>

![](/blog-images/11/9.png)

<br>


<div align="center">
<64353 port>
</div>

![](/blog-images/11/10.png)

<br>

<div align="center">
<64354 port>
</div>

![](/blog-images/11/11.png)

<br>

이에 따라 5-tuple 해시 입력이 달라지고, Azure Load Balancer가 각 연결에 사용할 백엔드 VM을 다시 선택한다.



# ☑️ Azure Load Balancer 성능 테스트

`k6`를 사용해 Azure Load Balancer를 거쳐 Nginx가 설치된 VM까지의 **end-to-end 성능**을 측정한다.

이 테스트의 응답 시간에는 부하 발생기, 인터넷 구간, Azure Load Balancer, VM 네트워크, Nginx 처리 시간이 모두 포함된다. 따라서 아래 결과만으로 Azure Load Balancer가 추가한 지연이나 Load Balancer 자체의 최대 처리량을 분리해서 측정할 수는 없다.

### 테스트 스크립트 (nlb-test.js)

```js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  // 테스트별로 10, 100, 10000으로 변경
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

<br>

### 1. Smoke Test

- 10명 사용자, 10초 수행

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
```

<br>


### 2. Load Test

- 100명 사용자, 60초 수행

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

<br>

### 3. Stress Test

- 10000명 사용자, 10초 수행

```bash
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
```

<br>

- 10,000 VU에서 현재 테스트 구성의 응답 지연과 실패율이 크게 증가한 모습
![](/blog-images/11/12.png)


### Stress Test 결과를 어떻게 해석해야 할까?

이 결과를 곧바로 **Azure Load Balancer가 고부하를 처리하지 못했다**고 해석할 수는 없다.

먼저 `vus`와 `duration`을 사용한 k6 기본 시나리오는 고정된 수의 VU가 응답을 받은 뒤 다음 요청을 보내는 **Closed Model**이다. 시스템의 응답이 느려지면 새로운 요청을 보내는 속도도 함께 감소하므로, 목표 RPS를 일정하게 유지하는 테스트가 아니다. 처리량 한계를 측정하려면 `constant-arrival-rate`와 같은 Open Model을 사용해 목표 RPS를 단계적으로 높이는 방식이 더 적합하다.

<sub>[k6 Docs: Open and closed models](https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/)</sub>

또한 10,000 VU 결과의 `698 req/s`는 10초만을 기준으로 계산된 값이 아니다.

```text
27,982 requests / 40.1 seconds ≈ 698 req/s
```

k6가 테스트 종료 후 진행 중인 요청을 기다리는 기본 `gracefulStop` 30초를 모두 사용했기 때문에 전체 실행 시간이 약 40.1초가 되었다. 따라서 이 값은 앞의 10 VU, 100 VU 결과와 같은 기준으로 직접 비교하기 어렵다.

<sub>[k6 Docs: Graceful stop](https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/graceful-stop/)</sub>

병목 후보도 Azure Load Balancer 하나가 아니다.

- **부하 발생기**: 로컬 장비가 10,000 VU에 필요한 CPU, 메모리, 파일 디스크립터와 소켓을 충분히 제공했는지 확인하지 않았다.
- **Nginx**: 기본 worker 및 동시 연결 설정을 그대로 사용했기 때문에, 10,000개의 연결을 수용하기 전에 Nginx의 연결 큐나 worker 한계에 도달했을 수 있다.
- **백엔드 VM**: `Standard_B1s`는 1 vCPU, 1GiB 메모리의 버스터블 VM이다. 고정된 성능을 제공하는 벤치마크용 인스턴스가 아니며 CPU 크레딧과 네트워크 상태도 함께 관찰하지 않았다.
- **실패 원인 미수집**: 실패한 7,997개 요청이 연결 타임아웃, connection reset, 로컬 소켓 부족, HTTP 5xx 중 무엇이었는지 기록하지 않았다.

Microsoft 문서에 따르면 Azure Load Balancer 자체는 처리량 제한을 적용하지 않는다. 실제 처리량은 백엔드 VM과 가상 네트워크 등의 제한을 함께 받는다. 그러므로 이 실험에서 확인된 것은 **10,000 VU 스파이크에서 현재 구성 전체가 포화되었다는 사실**이며, Azure Load Balancer의 처리량 한계가 아니다.

<sub>[Azure Docs: Azure subscription and service limits](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/azure-subscription-service-limits#load-balancer-limits)</sub>


<br>


# ☑️ 결론

- Azure Load Balancer는 HTTP를 해석하거나 TCP 연결을 프록시에서 종료하지 않고, L4에서 TCP/UDP 흐름을 분산한다. **URL 라우팅이나 WAF 같은 L7 기능보다 지연 시간과 처리량이 중요한 서비스라면 의도적으로 선택할 수 있는 구성**이다.
- HTTP/HTTPS 서비스에서도 사용할 수 있다. 다만 TLS 종료와 HTTP 처리는 백엔드가 담당해야 하며, URL·호스트 기반 라우팅, WAF, 쿠키 기반 세션 affinity가 필요하면 Azure Application Gateway가 적합하다.
- Azure Load Balancer도 Source IP 기반의 2-tuple 또는 3-tuple 세션 지속성을 지원한다. Application Gateway가 필요한 경우는 HTTP 쿠키를 이용한 애플리케이션 수준의 세션 affinity가 필요할 때다.
- 이번 테스트에서는 100 VU까지 약 5,900 RPS를 오류 없이 처리했다. 그러나 이는 전체 경로의 측정값이므로 Azure Load Balancer만의 지연이나 최대 처리량을 나타내지는 않는다.
- 10,000 VU에서 현재 테스트 구성 전체의 한계가 드러났지만, 수집한 정보만으로는 병목을 Azure Load Balancer로 특정할 수 없다.

| 항목             | 10 VUs / 10s | 100 VUs / 60s | 10,000 VUs / 10s                         |
|------------------|--------------|---------------|-------------------------------------------|
| k6 표시 RPS      | ~830         | ~5,900        | ~698 (40.1초 전체 실행 시간 기준)         |
| 평균 응답 시간   | ~11.7ms      | ~16.7ms       | ~3.6s                                     |
| 최대 응답 시간   | ~115ms       | ~378ms        | ~33s                                      |
| 성공률           | 100%         | 100%          | **71.4%** (28.6% 실패)                    |

L7 기능이 필요하지 않고 초저지연·고처리량이 핵심 요구사항이라면 Azure Load Balancer가 우선 선택지가 될 수 있다. 이를 성능 수치로 입증하려면 동일한 백엔드와 부하 조건에서 Azure Load Balancer, Application Gateway, Load Balancer를 우회한 직접 요청을 각각 비교하고 각 구간의 메트릭을 함께 수집해야 한다.
