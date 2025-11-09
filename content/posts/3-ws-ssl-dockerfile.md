---
layout:       post
title:        "[DevOps] WS에서의 직접 SSL 인증서 발급/적용"
date: '2024-01-08'
section: 'infra'
excerpt: 'Dockerfile을 통한 웹서버 SSL 인증서 발급 및 적용 방법'
tags: ['Docker', 'SSL', 'Nginx', "Let's Encrypt", 'DevOps']
---

HTTPS는 사용자 신뢰와 검색 노출을 위해 이제는 선택이 아니라 필수가 되었습니다. 프런트엔드 서버를 직접 운영하고 있었다면 "인증서를 자동으로 갱신하고 안전하게 적용할 수 있을까?"라는 고민을 한 번쯤 하게 됩니다. 이 글에서는 Docker 기반 Nginx 서버에 Certbot을 활용해 SSL 인증서를 발급하고 적용하는 과정을 순서대로 정리했습니다.

## 사전 준비 체크리스트

| 항목 | 내용 |
| --- | --- |
| 서버 | Jenkins에서 배포하는 Docker 기반 웹 서버 |
| 포트 | 80, 443 모두 개방 |
| DNS | `dmarketmall.com` 도메인이 서버 IP를 가리키도록 설정 |
| 도구 | Certbot (Let's Encrypt) |

## 1. Jenkins 파이프라인에서 HTTPS 포트 열기

Jenkins Docker 파이프라인 구성 시 443 포트를 함께 노출합니다.

```bash
docker run --name dmarket-front -p 80:80 -p 443:443 -d ${repository}/kwanza/dmarket-front:v${env.BUILD_NUMBER}
```

### 2. Nginx 기본 설정 확인

`nginx.conf`에 HTTP(80) 수신과 도메인 설정을 추가합니다.

```nginx
listen 80;
listen [::]:80;
server_name dmarketmall.com;
```

### 3. Dockerfile에 Certbot 설치

인증서를 자동 발급하기 위해 필요한 패키지를 이미지에 포함합니다.

```dockerfile
RUN apk add python3 python3-dev py3-pip build-base libressl-dev musl-dev libffi-dev
RUN pip3 install pip --upgrade
RUN pip3 install certbot-nginx
RUN mkdir /etc/letsencrypt
```

> **참고**: Certbot은 Let's Encrypt 무료 인증서를 발급하고 주기적으로 갱신까지 처리해 주는 도구입니다.

## 4. 서버 접속 및 컨테이너 상태 확인

1. 프런트엔드 서버에 SSH로 접속합니다.
2. Nginx 컨테이너가 80, 443 포트로 정상 동작 중인지 확인합니다.

```bash
docker ps
```

![](https://velog.velcdn.com/images/woongaa1/post/603d89c2-6931-4fc0-8d16-24260a470ea7/image.png)

## 5. 컨테이너 내부에서 Certbot 실행

```bash
docker exec -it dmarket-front /bin/sh
certbot --nginx -d dmarketmall.com
```

- 이메일 입력 후 안내에 따라 `Y`를 선택하면 인증서가 생성됩니다.
- Nginx 설정과 인증서 경로가 자동으로 매핑됩니다.

![](https://velog.velcdn.com/images/woongaa1/post/04827a10-e9f1-4220-bff1-ebf5092722cd/image.png)
![](https://velog.velcdn.com/images/woongaa1/post/1a416553-04f3-428f-91ed-fa81c09b92c4/image.png)

## 6. 결과 확인

인증서가 적용되면 브라우저 주소창에서 자물쇠 아이콘을 확인할 수 있습니다.

- 적용 전: HTTP 접속
- 적용 후: HTTPS 접속 및 안전 연결 표시

![](https://velog.velcdn.com/images/woongaa1/post/e8781817-6d60-4cb8-a98f-681b78aaac18/image.png)
![](https://velog.velcdn.com/images/woongaa1/post/9c990ab3-2c4f-4f88-b98d-75400f9a30de/image.png)

## 마무리

이 과정을 통해 수동 작업을 최소화하고, 인증서 만료 걱정 없이 서비스를 운영할 기반을 마련했습니다. 이후에는 Certbot 자동 갱신 로그를 모니터링하거나 Slack/Webhook 알림을 붙여 만일의 상황에 대비하는 것이 좋습니다.
