---
layout:       post
title:        "WS(Web Server)에서 SSL 인증서 직접 발급과 적용"
date: '2024-01-08'
section: 'infra'
excerpt: 'Dockerfile을 통한 웹서버 SSL 인증서 발급 및 HTTPS 적용'
tags: ['Docker', 'SSL', 'Nginx', "Let's Encrypt", 'DevOps']
---


Docker 기반 Nginx 서버에 Certbot을 활용해 SSL 인증서를 발급하고 적용하는 과정

# ☑️ 사전 준비 체크리스트

| 항목 | 내용 |
| --- | --- |
| 서버 | Jenkins에서 배포하는 Docker 기반 웹 서버 |
| 포트 | 80, 443 모두 개방 |
| DNS | `dmarketmall.com` 도메인이 서버 IP를 가리키도록 설정 |
| 도구 | Certbot (Let's Encrypt) |

<br>

# ☑️ 1. Jenkins 파이프라인에서 HTTPS 포트 열기

Jenkins Docker 파이프라인 구성 시 443 포트를 함께 노출.

```bash
docker run --name dmarket-front -p 80:80 -p 443:443 -d ${repository}/kwanza/dmarket-front:v${env.BUILD_NUMBER}
```

<br>

# ☑️ 2. Nginx 기본 설정 확인

`nginx.conf`에 HTTP(80) 수신과 도메인 설정을 추가

```nginx
listen 80;
listen [::]:80;
server_name dmarketmall.com;
```

<br>

# ☑️ 3. Dockerfile에 Certbot 설치

인증서를 자동 발급하기 위해 필요한 패키지를 이미지에 포함.

```dockerfile
RUN apk add python3 python3-dev py3-pip build-base libressl-dev musl-dev libffi-dev
RUN pip3 install pip --upgrade
RUN pip3 install certbot-nginx
RUN mkdir /etc/letsencrypt
```

<sub> * **Certbot**: Let's Encrypt 무료 인증서를 발급하고 주기적으로 갱신까지 처리해 주는 도구 </sub>

<br>


# ☑️ 4. 서버 접속 및 컨테이너 상태 확인

1. 프런트엔드 서버에 SSH로 접속합니다.
2. Nginx 컨테이너가 80, 443 포트로 정상 동작 중인지 확인합니다.

```bash
docker ps
```

![](https://velog.velcdn.com/images/woongaa1/post/603d89c2-6931-4fc0-8d16-24260a470ea7/image.png)

<br>

# ☑️ 5. 컨테이너 내부에서 Certbot 실행

```bash
docker exec -it dmarket-front /bin/sh
certbot --nginx -d dmarketmall.com
```

- 이메일 입력 후 안내에 따라 `Y`를 선택하면 인증서가 생성된다.
- Nginx 설정과 인증서 경로가 자동으로 매핑.

<br>

![](https://velog.velcdn.com/images/woongaa1/post/04827a10-e9f1-4220-bff1-ebf5092722cd/image.png)
![](https://velog.velcdn.com/images/woongaa1/post/1a416553-04f3-428f-91ed-fa81c09b92c4/image.png)


<br>


# ☑️ 6. 결과 확인

### 적용 전: HTTP 접속
![](https://velog.velcdn.com/images/woongaa1/post/e8781817-6d60-4cb8-a98f-681b78aaac18/image.png)

<br>

### 적용 후: HTTPS 접속 및 안전 연결 표시
![](https://velog.velcdn.com/images/woongaa1/post/9c990ab3-2c4f-4f88-b98d-75400f9a30de/image.png)

