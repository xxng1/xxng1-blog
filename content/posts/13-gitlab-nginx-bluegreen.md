---
layout:       post
title:        "[DevOps] Gitlab Runner(Shell Executor)를 통한 Nginx의 Blue/Green 배포"
date: '2025-08-13'
section: 'infra'
excerpt: 'GitLab CI를 활용한 Nginx Blue/Green 배포 자동화 구성'
tags: ['Azure', 'Cloud', 'GitLab', 'CI/CD', 'Nginx', 'Blue/Green', 'Shell']
---

> Azure VM 한 대에서 `GitLab`, `GitLab Runner`, `Nginx`로 무중단 블루/그린 배포 구축

## Source Code

[Github Source Code](https://github.com/xxng1/nginx-apache-bluegreen-gitlab)

---


![](https://velog.velcdn.com/images/xxng1/post/65e9fee9-bf27-433b-ac8f-975dc5760ed8/image.png)



## 훑어보기

- GitLab(Omnibus)은 80/443 포트를 그대로 사용하고, 애플리케이션 트래픽은 8081번 포트의 Edge Nginx가 담당
- Blue/Green 슬롯은 각각의 컨테이너(app-blue, app-green)로 항상 기동
- 심볼릭 링크를 교체한 뒤 `nginx -s reload`를 호출하면 즉시 전환
- GitLab Runner가 태그 푸시를 감지해 **배포 → 검증 → 전환 → 지연 정리**까지 자동 실행

## 구조 요약

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

## 환경 구성

- Azure VM (Standard_B4ms, Ubuntu)
- Docker / Docker Compose v2
- GitLab Omnibus + GitLab Runner(Shell)
- Edge Nginx, 내부 앱 컨테이너 (blue/nginx, green/apache)

## 초기 설정 스냅샷

- **GitLab Runner 등록** 과정에서 Shell Executor를 붙여 놓았습니다.

  ![](https://velog.velcdn.com/images/xxng1/post/325f305c-388c-4d6e-a827-79abe52d4404/image.png)

- **Shell Executor 권한 구성** 화면. Runner가 호스트에서 Docker 명령을 실행할 수 있도록 구성했습니다.

  ![](https://velog.velcdn.com/images/xxng1/post/c17c9d54-73ad-41da-aab9-e92e04b2e5be/image.png)

## 디렉터리 구조

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

두 슬롯을 동시에 띄우고, 스크립트에서 심볼릭 링크와 Compose 프로젝트명을 적절히 다루는 것이 핵심입니다.

## 파이프라인 흐름

1. **태그 푸시** 또는 수동 실행으로 배포 파이프라인 시작
2. `bootstrap` 단계에서 환경 점검 및 기본 링크 설정
3. Idle 슬롯(예: green)에 새 이미지를 배포하고 검증
4. 문제 없으면 심볼릭 링크를 교체하고 Nginx를 재시작
5. 30분 지연 후 이전 슬롯을 자동 정리 (`cleanup` Job)

![](https://velog.velcdn.com/images/xxng1/post/de7dbdcd-1d84-4686-8cce-3a1147848352/image.png)
![](https://velog.velcdn.com/images/xxng1/post/a21dad4c-2a45-4d88-8974-2f44150edaff/image.png)
![](https://velog.velcdn.com/images/xxng1/post/d3e955e0-50cc-4bc8-9826-fc49517546f1/image.png)

GitLab UI에 전환용 수동(Job) 버튼을 추가해, 필요 시 클릭 한 번으로 롤백도 가능합니다.

![](https://velog.velcdn.com/images/xxng1/post/5ac164d4-bfa5-4c3f-9d75-b8a3dc022f31/image.png)
![](https://velog.velcdn.com/images/xxng1/post/34b14a31-0d05-43c4-a8ca-4f832886db7c/image.png)

## Nginx 관련 포인트

```nginx
# nginx.conf (발췌)
upstream app_blue  { server app-blue:80;  keepalive 64; }
upstream app_green { server app-green:80; keepalive 64; }

# 활성 슬롯만 include
include /etc/nginx/conf.d/app_active.conf;
```

- `app_active.conf`는 `app_blue.conf` 또는 `app_green.conf`에 대한 심볼릭 링크
- 링크 교체는 항상 원자적으로 수행 (`ln -sfn`, `mv -Tf`)해 중간 상태를 방지
- Nginx 설정 변경 후에는 `nginx -t`로 검증한 뒤 `nginx -s reload`

## Docker Compose 운용 팁

```bash
# bootstrap (발췌)
docker compose -p bg-blue  -f app/docker-compose.blue.yml  up -d
docker compose -p bg-green -f app/docker-compose.green.yml up -d
```

- `-p` 옵션으로 Compose 프로젝트를 분리해 orphan 처리를 피했습니다.
- 배포/정리 스크립트에서도 동일한 프로젝트명을 사용해야 컨테이너가 꼬이지 않습니다.

![](https://velog.velcdn.com/images/xxng1/post/87299252-8b81-4608-8980-7edaff38e62b/image.png)

## GitLab CI 설정 하이라이트

```yaml
before_script:
  - set -euo pipefail
  - docker --version
  - docker compose version
```

![](https://velog.velcdn.com/images/xxng1/post/2a179c2f-8762-4b83-add3-bc6a47613126/image.png)

- Runner 환경이 예상과 다를 경우 즉시 실패하도록 `set -euo pipefail`
- 태그 기반 트리거와 지연 정리를 위해 `only: [tags]`, `start_in: "30 minutes"` 조합 사용

Manual 전환 Job 예시:

```yaml
switch_to_green:
  stage: switch
  when: manual
  script:
    - bash /opt/bluegreen/scripts/switch_traffic.sh green
  tags: [bluegreen]
  only: [branches, tags]
```

## 인사이트

- **심볼릭 링크 경로**는 컨테이너 내부 기준으로 작성해야 합니다.
- 링크를 교체하기 전에는 반드시 Nginx 설정 검증을 선행해야 전체 Edge가 다운되는 사고를 막을 수 있습니다.
- GitLab Runner를 Shell Executor로 사용할 때는 권한 문제를 고려해 `sudo -u gitlab-runner`로 로컬 테스트를 진행하면 좋습니다.

```bash
sudo -u gitlab-runner -H bash -lc '/opt/bluegreen/scripts/deploy_green.sh'
```

## 마치며

블루/그린 배포는 복잡해 보이지만, 구조를 단순하게 유지하면 한 대의 VM에서도 충분히 구현할 수 있습니다. 핵심은 **전환 로직을 스크립트로 명확히 정의하고, CI 파이프라인에서 환경 검증을 자동화**하는 것입니다. 앞으로는 롤백 히스토리를 Slack 알림으로 남기거나, Argo Rollouts 같은 도구와 비교도 해볼 계획입니다.