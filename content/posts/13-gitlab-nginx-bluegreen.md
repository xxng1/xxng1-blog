---
layout:       post
title:        "GitLab Runner(Shell Executor)를 통한 Nginx의 Blue/Green 배포"
date: '2025-08-13'
section: 'infra'
excerpt: 'GitLab CI를 활용한 Nginx Blue/Green 배포 파이프라인 구성'
tags: ['Azure', 'Cloud', 'GitLab', 'CI/CD', 'Nginx', 'Blue/Green', 'Shell']
---

Azure VM에서 `GitLab`, `GitLab Runner`, `Nginx`를 사용한 무중단 블루/그린 배포 구축

<br>

# Github 소스 코드

[Github Source Code](https://github.com/xxng1/nginx-apache-bluegreen-gitlab)

<br>

# 구축 목표

- GitLab(Omnibus)은 80/443 포트를 그대로 사용, 애플리케이션 트래픽은 8081번 포트의 Edge Nginx가 담당
- Blue/Green 슬롯은 각각의 컨테이너(app-blue, app-green)로 항상 기동
- 심볼릭 링크를 교체한 뒤 `nginx -s reload`를 호출하면 즉시 전환
- GitLab Runner가 태그 푸시를 감지해 **배포 → 검증 → 전환 → 지연 정리**까지 자동 실행

<br>

# 환경 구성

- Azure VM (Standard_B4ms, Ubuntu)
- Docker / Docker Compose v2
- GitLab Omnibus + GitLab Runner(Shell)

<br>

# 웹 서버 컨테이너 구성

![](https://velog.velcdn.com/images/xxng1/post/65e9fee9-bf27-433b-ac8f-975dc5760ed8/image.png)


```
[Client]
   ↓
http://<VM>:8081 (Edge Nginx)
   ├─ /        → app_active (blue 또는 green)
   ├─ /_blue/  → app-blue  (Nginx 컨테이너)
   └─ /_green/ → app-green (Apache 컨테이너)
```


- Edge Nginx가 단일 엔드포인트 역할
- `app_active.conf`가 현재 슬롯을 가리키며, 심볼릭 링크 교체로 전환
- GitLab Runner와 애플리케이션 컨테이너는 동일 VM에 위치

<br>


# 초기 설정

- **GitLab Runner 등록** 과정에서 Shell Executor를 붙여 놓았다.

  ![](https://velog.velcdn.com/images/xxng1/post/325f305c-388c-4d6e-a827-79abe52d4404/image.png)
  ![](https://velog.velcdn.com/images/xxng1/post/c17c9d54-73ad-41da-aab9-e92e04b2e5be/image.png)

<br>

# 디렉터리 구조

```bash
nginx-apache-blue-green
├── app
│   ├── blue/www/index.html
│   ├── green/www/index.html
│   ├── docker-compose.blue.yml
│   └── docker-compose.green.yml
├── nginx
│   ├── conf.d/app_active.conf -> app_blue.conf
│   ├── conf.d/app_blue.conf
│   ├── conf.d/app_green.conf
│   ├── docker-compose.nginx.yml
│   └── nginx.conf
└── scripts
    ├── deploy_green.sh
    ├── retire_old.sh
    ├── rollback.sh
    └── switch_traffic.sh
```

두 슬롯을 동시에 띄우고, 스크립트에서 심볼릭 링크와 Compose 프로젝트명을 적절히 다루는 것이 핵심이다.

# 파이프라인 흐름

### 1. **태그 푸시** 또는 수동 실행으로 배포 파이프라인 시작
  ![](https://velog.velcdn.com/images/xxng1/post/de7dbdcd-1d84-4686-8cce-3a1147848352/image.png)

<br>

### 2. `bootstrap` 단계에서 환경 점검 및 기본 링크 설정
  ![](https://velog.velcdn.com/images/xxng1/post/a21dad4c-2a45-4d88-8974-2f44150edaff/image.png)

<br>

### 3. 이후 배포 진행 후 검증
`bootstrap` -> `deploy` -> `verify` -> `switch` 과정 진행 (`cleanup`은 30분 후 스케줄링)

![](https://velog.velcdn.com/images/xxng1/post/d3e955e0-50cc-4bc8-9826-fc49517546f1/image.png)

- 현재 활성 슬롯을 확인해 반대 슬롯으로 전환
- `Blue`가 활성이면 → `Green`으로 전환
- `Green`이 활성이면 → `Blue`로 전환

<br>


# 결과

### 1. 파이프라인 실행 전/후

![](https://velog.velcdn.com/images/xxng1/post/34b14a31-0d05-43c4-a8ca-4f832886db7c/image.png)

<br>

### 2. GitLab UI에 전환용 수동(Job) 버튼을 추가해, 파이프라인을 돌지 않고 롤백도 가능

![](https://velog.velcdn.com/images/xxng1/post/5ac164d4-bfa5-4c3f-9d75-b8a3dc022f31/image.png)

<br>


# Troubleshooting



### 1. Nginx 체크 포인트

```nginx
# nginx.conf
upstream app_blue  { server app-blue:80;  keepalive 64; }
upstream app_green { server app-green:80; keepalive 64; }

# 활성 슬롯만 include
include /etc/nginx/conf.d/app_active.conf;
```

- `app_active.conf`는 `app_blue.conf` 또는 `app_green.conf`에 대한 심볼릭 링크
- 링크 교체는 항상 원자적으로 수행 (`ln -sfn`, `mv -Tf`)해 중간 상태를 방지
- Nginx 설정 변경 후에는 `nginx -t`로 검증한 뒤 `nginx -s reload`

<br>

### 2. Docker Compose 프로젝트 분리

`deploy` 파이프라인 실패
![](https://velog.velcdn.com/images/xxng1/post/87299252-8b81-4608-8980-7edaff38e62b/image.png)

```bash
# bootstrap
docker compose -p bg-blue  -f app/docker-compose.blue.yml  up -d
docker compose -p bg-green -f app/docker-compose.green.yml up -d
```

- bootstrap에서 `-p`로 올렸으면, deploy/cleanup에서도 반드시 같은 `-p`를 써야 컨테이너 이름 충돌이 나지 않는다.

<br>


### 3. GitLab CI 체크 포인트

`bootstrap` 파이프라인 실패
![](https://velog.velcdn.com/images/xxng1/post/2a179c2f-8762-4b83-add3-bc6a47613126/image.png)

```yaml
before_script:
  - set -euo pipefail
  - docker --version
  - docker compose version
```

- 파이프라인 초반에 환경 이상(Compose v2 미설치, runner 태그 미일치) 발견
- Runner 환경이 예상과 다를 경우 즉시 실패하도록 `set -euo pipefail`