---
layout:       post
title:        "[DevOps] Gitlab Runner(Shell Executor)를 통한 Nginx의 Blue/Green 배포"
date: '2025-08-13'
section: 'infra'
excerpt: 'GitLab CI를 활용한 Nginx Blue/Green 배포 자동화 구성'
tags: ['GitLab', 'CI/CD', 'Nginx', 'Blue/Green', 'DevOps', 'Docker']
---

Azure VM에서 GitLab + Nginx로 무중단 블루/그린 배포를 구축하는 방법입니다.

## Source Code

[Github Source Code](https://github.com/xxng1/nginx-apache-bluegreen-gitlab)

## TL;DR

- GitLab(Omnibus)은 80/443 그대로, 앱용 edge Nginx는 8081로 분리
- Blue/Green은 각각 컨테이너(app-blue, app-green)로 항상 떠 있고, **심볼릭 링크 교체 + nginx -s reload**로 즉시 전환
- GitLab Runner(shell) + Docker Compose v2:
  - **태그 푸시 → idle 배포 → 검증 → 전환 → (지연) 정리** 자동화

## 목차

1. 구조 (스크린샷)
2. 환경
3. 디렉터리 구조
4. 구현 (스크린샷)
5. 주요 코드 (Nginx)
6. 주요 코드 (GitLab CI)
7. Trouble Shooting

## 1. 구조 

```swift
[Client] → http://<VM>:8081 → (edge-nginx)
                        ├─ / → app_active (blue or green)
                        ├─ /_blue/  → app-blue  (nginx 컨테이너)
                        └─ /_green/ → app-green (apache 컨테이너)
```
- GitLab(Omnibus): 80/443 (자체 UI/레지스트리)
- Edge Nginx: 8081 (애플리케이션 트래픽 전용)
- 두 슬롯(blue/green) 동시 구동 → 전환은 edge에서 처리



# 2. 환경
- Ubuntu 기반 Azure VM (root/sudo) - Standard_B4ms(4vCPU / 16GB)
- Docker/Docker Compose v2
- GitLab(Omnibus)
- GitLab Runner(shell) - (동일 VM)
- Nginx + Apache2

# 3. 디렉터리 구조
```shell
azureuser@gitlab-vm:~/nginx-apache-blue-green$ tree
.
├── README.md
├── app
│   ├── blue
│   │   └── www
│   │       └── index.html
│   ├── docker-compose.blue.yml
│   ├── docker-compose.green.yml
│   └── green
│       └── www
│           └── index.html
├── nginx
│   ├── conf.d
│   │   ├── app_active.conf -> app_blue.conf
│   │   ├── app_blue.conf
│   │   └── app_green.conf
│   ├── docker-compose.nginx.yml
│   └── nginx.conf
└── scripts
    ├── deploy_green.sh
    ├── retire_old.sh
    ├── rollback.sh
    └── switch_traffic.sh

8 directories, 14 files

```

# 4. 📷 구현 


- `nginx Blue/Green 배포`

![](https://velog.velcdn.com/images/xxng1/post/65e9fee9-bf27-433b-ac8f-975dc5760ed8/image.png)

- `GitLab Runner 등록`

![](https://velog.velcdn.com/images/xxng1/post/325f305c-388c-4d6e-a827-79abe52d4404/image.png)

<br />

- `shell executor 설정`

![](https://velog.velcdn.com/images/xxng1/post/c17c9d54-73ad-41da-aab9-e92e04b2e5be/image.png)

<br />



### Job 트리거

- `태그 추가` ->  `git tag v0.0.1` or `수동`

![](https://velog.velcdn.com/images/xxng1/post/de7dbdcd-1d84-4686-8cce-3a1147848352/image.png)

- `bootstrap running`

![](https://velog.velcdn.com/images/xxng1/post/a21dad4c-2a45-4d88-8974-2f44150edaff/image.png)

<br />

- `bootstrap -> deploy -> verify -> switch 성공 ( cleanup은 스케줄링(30분 후))`

![](https://velog.velcdn.com/images/xxng1/post/d3e955e0-50cc-4bc8-9826-fc49517546f1/image.png)

<br />


### Job 트리거 자동화 ( 버튼 )

- `Manual Switch Jobs를 통한 스위칭 버튼 추가`

![](https://velog.velcdn.com/images/xxng1/post/5ac164d4-bfa5-4c3f-9d75-b8a3dc022f31/image.png)

<br />

- ` 전 / 후 `
![](https://velog.velcdn.com/images/xxng1/post/34b14a31-0d05-43c4-a8ca-4f832886db7c/image.png)

<br />

# 주요 코드 (Nginx)

### 1. 활성 슬롯을 심볼릭 링크로 include

```yaml
# nginx.conf (발췌)
upstream app_blue  { server app-blue:80;  keepalive 64; }
upstream app_green { server app-green:80; keepalive 64; }

# ★ 전환의 핵심: active 대상만 링크로 교체
include /etc/nginx/conf.d/app_active.conf;
```

- app_active.conf만 app_blue.conf ↔ app_green.conf로 갈아끼우면 루트(/) 트래픽이 즉시 전환됨.

- 주의: 컨테이너 안에서는 상대링크여야 함. 절대경로 링크면 “파일 없음”으로 죽음.


### 2. 볼륨 마운트 기준(Compose 관점)

```yaml
# docker-compose.nginx.yml (발췌)
volumes:
  - ./nginx.conf:/etc/nginx/nginx.conf:ro
  - ./conf.d:/etc/nginx/conf.d
```
- Compose의 상대경로는 compose 파일이 위치한 폴더 기준. 엣지 Nginx가 호스트의 링크/설정을 올바르게 읽게 하는 핵심.

# 주요 코드 (GitLab CI)

### 1. GitLab Runner가 쓰는 툴을 사전 점검

- `bootstrap 파이프라인 실패`

![](https://velog.velcdn.com/images/xxng1/post/2a179c2f-8762-4b83-add3-bc6a47613126/image.png)

<br />

```yaml
# .gitlab-ci.yml (발췌)
before_script:
  - set -euo pipefail
  - docker --version
  - docker compose version
tags: [bluegreen]
```
- 파이프라인 초반에 환경 이상(Compose v2 미설치, runner 태그 미일치)을 즉시 발견.

### 2. 활성 링크 없을 때 기본 링크 보정

```shell
# bootstrap (발췌)
- cd /opt/bluegreen/nginx/conf.d && [ -e app_active.conf ] || ln -s app_blue.conf app_active.conf
```
- 첫 부팅/초기화 시 루트(/)가 사라지는걸 방지.

### 3. blue/green을 서로 다른 Compose 프로젝트로 띄우기

```shell
# bootstrap (발췌)
- docker compose -p bg-blue  -f /opt/bluegreen/app/docker-compose.blue.yml   up -d
- docker compose -p bg-green -f /opt/bluegreen/app/docker-compose.green.yml  up -d
```
- 두 compose 파일을 같은 프로젝트로 올리면 orphan 처리로 서로 지워버림.
- -p bg-blue / -p bg-green으로 분리해 충돌/삭제를 막음.

### 4. Nginx 설정은 테스트 후 리로드

```shell
# bootstrap (발췌)
- docker exec edge-nginx nginx -t || (docker exec edge-nginx nginx -T; false)
- docker exec edge-nginx nginx -s reload
```
-  오타/링크 오류로 전체 엣지가 죽는 걸 방지.
- 실패 시 **nginx -T**로 전체 설정 덤프를 로그에 남겨 디버깅 용이.

### 5. idle 슬롯에 배포할 때 프로젝트명 일치

- `deploy 파이프라인 실패`

![](https://velog.velcdn.com/images/xxng1/post/87299252-8b81-4608-8980-7edaff38e62b/image.png)

<br />

```bash
# scripts/deploy_green.sh (발췌)
# active가 blue면 idle=green → PROJECT="bg-green", 반대면 "bg-blue"
docker compose -p "$PROJECT" -f "$COMPOSE" pull
docker compose -p "$PROJECT" -f "$COMPOSE" up -d
```
- bootstrap에서 -p로 올렸으면, deploy/cleanup에서도 **반드시 같은 -p**를 써야 컨테이너 이름 충돌이 안 남.

### 6. 전환은 원자적 링크 교체 + 사전 검사

```bash
# scripts/switch_traffic.sh (발췌)
ln -sfn app_green.conf app_active.conf.new   # 또는 app_blue.conf.new
mv -Tf app_active.conf.new app_active.conf   # 원자적 교체
docker exec edge-nginx nginx -t && docker exec edge-nginx nginx -s reload
```
- 링크 교체 중간 상태에서 리로드가 들어가면 “파일 없음” 에러가 날 수 있음 → 원자적 교체로 레이스 제거.

### 7. 태그 트리거 + 지연 정리

```yaml
# cleanup (발췌)
when: delayed
start_in: "30 minutes"
only: [tags]
```

- 새 슬롯 안정화 시간을 준 뒤 이전 슬롯을 자동 정리.
GitLab 일부 버전에선 rules + start_in이 충돌하므로 **only: [tags]**로 단순화.


### 8. GitLab UI 버튼으로 즉시 전환

```yaml
# manual switch (발췌)
switch_to_green:
  stage: switch
  when: manual
  script: [ "bash /opt/bluegreen/scripts/switch_traffic.sh green" ]
  tags: [bluegreen]
  only: [branches, tags]
```
- UI에서 원클릭 전환 가능. (변수 방식으로 TARGET=green을 받는 한 개 짜리 잡으로도 가능)


> 로컬 테스트명령어

``` bash
sudo -u gitlab-runner -H bash -lc '/opt/bluegreen/scripts/deploy_green.sh'
```