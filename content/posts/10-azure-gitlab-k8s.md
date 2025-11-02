---
layout:       post
title:        "[DevOps] Kubernetes Executor 기반 GitLab Runner"
date: '2025-05-12'
section: 'infra'
excerpt: 'AKS(Azure Kubernetes Service)에서 GitLab Runner Kubernetes Executor 구성 및 CI Job Pod 동적 생성'
tags: ['GitLab', 'Kubernetes', 'Azure', 'AKS', 'CI/CD', 'DevOps']
---

GitLab Runner를 Kubernetes 클러스터에 통합하는 과정입니다.

## Architecture

```
[GitLab (Self-hosted on Azure VM)]
     ↓
[GitLab Runner (AKS 내 설치)]
     ↓
[Runner는 실행 중, GitLab과 연동]
```

AKS(Azure Kubernetes Service)를 사용하며, CI Job 실행 시 Pod이 동적으로 생성되는 것을 확인합니다.

## 목차

1. 설치 과정
2. 테스트
3. CI Job 실행할 때마다 Pod 생성 확인

## 1. 설치 과정

### GitLab 설치 (Azure VM, Omnibus CE)

GitLab을 Self-managed로 구성합니다.

```bash
az group create --name gitlab-rg --location koreacentral

az vm create \
  --resource-group gitlab-rg \
  --name gitlab-vm \
  --image Ubuntu2204 \
  --size Standard_B2ms \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard \
  --os-disk-size-gb 64
```

- **Standard_B2ms** (2 vCPU / 8GB RAM): 2코어이지만 RAM이 8GB로 GitLab 테스트에 최소한 동작이 가능합니다.

포트를 엽니다:

```bash
az vm open-port --port 80 --resource-group gitlab-rg --name gitlab-vm
az vm open-port --port 443 --resource-group gitlab-rg --name gitlab-vm
az vm open-port --port 22 --resource-group gitlab-rg --name gitlab-vm
```

> **참고**: 다른 group과 충돌 문제 시 `priority`를 지정합니다:
> ```bash
> az vm open-port --port 443 --resource-group gitlab-rg --name gitlab-vm --priority 1100
> ```

HTTP, HTTPS, SSH가 허용됩니다.

### SSH 접속

Azure -> Networking -> Public IP address를 확인한 후:

```bash
ssh azureuser@<Public_IP>
```

### GitLab CE 설치 (Omnibus)

```bash
sudo apt update
sudo apt install -y curl openssh-server ca-certificates tzdata perl

# GitLab 패키지 저장소 등록
curl https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.deb.sh | sudo bash

# 설치
sudo EXTERNAL_URL="http://<Public_IP>" apt install -y gitlab-ce
```

설치 완료 후:

```bash
Thank you for installing GitLab!
GitLab should be available at http://4.217.217.205
```

GitLab Web URL을 확인합니다.

초기 비밀번호 확인:

```bash
sudo cat /etc/gitlab/initial_root_password | grep Password:
Password: ~~~~
```

**프로젝트 이름**: `gitlab-aks`

### AKS 구성

AKS 클러스터를 생성합니다:

```bash
az group create --name gitlab-aks-rg --location koreacentral

az aks create \
  --resource-group gitlab-aks-rg \
  --name gitlab-aks-cluster \
  --node-count 2 \
  --enable-addons monitoring \
  --generate-ssh-keys

az aks get-credentials --resource-group gitlab-aks-rg --name gitlab-aks-cluster
```

- **기본 VM 크기**: `Standard_DS2_v2` (2VCPU, 7GB)
- 노드 2개 구성, kubeconfig 연결

![](https://velog.velcdn.com/images/xxng1/post/50510be6-823d-4b79-8efe-5c5d3762358c/image.png)

### GitLab Runner 설치 (Kubernetes Executor)

로컬에 Helm이 설치되어 있어야 합니다:

```bash
helm repo add gitlab https://charts.gitlab.io
helm repo update
kubectl create namespace gitlab-runner

helm install gitlab-runner gitlab/gitlab-runner \
  --namespace gitlab-runner \
  --set gitlabUrl=http://4.217.217.205 \
  --set runnerRegistrationToken=<복사한_토큰> \
  --set rbac.create=true \
  --set runners.tags="aks" \
  --set runners.executor=kubernetes \
  --set runners.namespace=gitlab-runner
```

> **RegistrationToken**: GitLab > 프로젝트 > Settings > CI/CD > Runners에서 확인

![](https://velog.velcdn.com/images/xxng1/post/1a370ad6-608b-45d6-af6d-cc77ee33918a/image.png)

GitLab Runner가 연결되었습니다.

### 설치 완료 확인

```bash
kubectl get po -n gitlab-runner
```

```
NAME                             READY   STATUS    RESTARTS   AGE
gitlab-runner-56776bcccb-gzm2b   1/1     Running   0          2m
```




## 2. 테스트

`.gitlab-ci.yml` 테스트 파일을 작성합니다:

```yaml
stages:
  - test

job-runner-test:
  stage: test
  tags:
    - aks
  script:
    - echo "✅ Runner 동작 확인 완료!"
```

Runner 로그 확인:

```bash
kubectl logs gitlab-runner-56776bcccb-gzm2b -n gitlab-runner
```

```
job-status=running ... sent-log=0-764 status=202 Accepted
Job succeeded ...
Submitting job to coordinator...ok ... code=200 job-status=success
Removed job from processing list ...
```

### 로그 메시지 설명

- **job-status=running**: GitLab 서버로부터 CI Job을 받아 처리 중
- **sent-log=0-764**: Job의 출력 로그 일부를 GitLab으로 전송함
- **Job succeeded**: 내부 스크립트가 정상적으로 성공 처리됨
- **Submitting job to coordinator...ok**: 최종 결과를 GitLab 서버에 제출 완료
- **Removed job from processing list**: Runner가 해당 Job을 완전히 마무리하고 대기 상태로 전환

## 3. CI Job 실행할 때마다 Pod 생성 확인

`.gitlab-ci.yml`을 수정합니다:

```yaml
stages:
  - verify

test-pod-creation:
  stage: verify
  tags:
    - aks
  script:
    - echo "Running inside a temporary pod!"
    - hostname
    - sleep 15  # 잠깐 유지시켜서 kubectl로 볼 수 있도록
```

### Pod 자동 생성 확인

Watch 모드로 Pod 상태를 확인합니다:

```bash
kubectl get pods -n gitlab-runner -w
```

![](https://velog.velcdn.com/images/xxng1/post/752dbe80-cafd-469d-bdf3-2a88f6531635/image.png)

**초기 상태**: Runner Pod만 실행 중

```bash
gitlab-runner-56776bcccb-gzm2b   1/1     Running   0          27m
```

**커밋 후**: Kubernetes executor가 Job 실행 시 Pod을 동적으로 생성

```
runner-<runner-id>-project-<project-id>-concurrent-<n>-<rand>
```

Runner가 Job 실행용 임시 Pod을 생성합니다.




---




# Troubleshooting

VM 재생성했을때, IP 같으면 ssh-keygen 제거.

```
 ✘ xxng  ~  ssh azureuser@4.217.217.205
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
Someone could be eavesdropping on you right now (man-in-the-middle attack)!
It is also possible that a host key has just been changed.
The fingerprint for the ED25519 key sent by the remote host is
SHA256:nVnJPnmIpOU1/goBqCezkn6X0E1jqTEfmtpI9mpleLM.
Please contact your system administrator.
Add correct host key in /Users/xxng/.ssh/known_hosts to get rid of this message.
Offending ECDSA key in /Users/xxng/.ssh/known_hosts:20
Host key for 4.217.217.205 has changed and you have requested strict checking.
Host key verification failed.
```

```bash
ssh-keygen -R 4.217.217.205
```