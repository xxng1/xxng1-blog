---
layout:       post
title:        "[DevOps] WS에서의 직접 SSL 인증서 발급/적용"
date: '2024-01-08'
section: 'infra'
excerpt: 'Dockerfile을 통한 웹서버 SSL 인증서 발급 및 적용 방법'
tags: ['Docker', 'SSL', 'Nginx', "Let's Encrypt", 'DevOps']
---

Docker(Dockerfile)을 통한 웹서버에서의 직접 SSL인증서 적용 방법에 대한 가이드라인

---

1. 젠킨스 **Docker Pipeline**에 **443포트(HTTPS요청)** 발신 연결 추가
```
docker run --name dmarket-front -p 80:80 -p 443:443 -d ${repository}/kwanza/dmarket-front:v${env.BUILD_NUMBER}
```

2. **nginx.conf**(Frontend)에 **80포트(HTTP요청)** 수신 연결 추가
```yaml
listen 80;
listen [::]:80;
```

3. **nginx.conf**(Frontend)에 servername 추가
```yaml
server_name dmarketmall.com;
```

4. Dockerfile에 SSL 관련 도구 다운로드
```yaml
RUN apk add python3 python3-dev py3-pip build-base libressl-dev musl-dev libffi-dev
RUN pip3 install pip --upgrade
RUN pip3 install certbot-nginx
RUN mkdir /etc/letsencrypt
```
> Certbot: Let's Encrypt를 사용하여 SSL 인증서를 생성하는 도구

5. FE SSH 접속

6. 80포트와 443 포트가 동작중인지 확인
```
docker ps
```
![](https://velog.velcdn.com/images/woongaa1/post/603d89c2-6931-4fc0-8d16-24260a470ea7/image.png)

7. 컨테이너 접속
```
docker exec -it dmarket-front /bin/sh
```
![](https://velog.velcdn.com/images/woongaa1/post/04827a10-e9f1-4220-bff1-ebf5092722cd/image.png)

8. 인증서 발급
```
certbot --nginx -d dmarketmall.com
```
- nginx.conf에서 설정해주었던 도메인 입력
- 이메일 입력 후 → (Y)es → (Y)es.
![](https://velog.velcdn.com/images/woongaa1/post/1a416553-04f3-428f-91ed-fa81c09b92c4/image.png)

적용 완료!


### 적용 전(Http)
![](https://velog.velcdn.com/images/woongaa1/post/e8781817-6d60-4cb8-a98f-681b78aaac18/image.png)

### 적용 후(Https)
![](https://velog.velcdn.com/images/woongaa1/post/9c990ab3-2c4f-4f88-b98d-75400f9a30de/image.png)
