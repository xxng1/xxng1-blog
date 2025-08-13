---
layout:       post
title:        "[DevOps] Kubernetes Executor 기반 GitLab Runner"
date: '2025-05-12'
section: 'infra'
# excerpt: '클라우드 기반 미디어 스트리밍 서비스 구축 경험 공유'
# categories: ['AWS/Media']
# tags: ['AWS', 'Media', 'Streaming', 'Cloud']
---

<br />

> Gitlab Runner 를 K8S 클러스터에 통합하는 과정

<br /><br />

AKS(Azure Kubernetes Service) 사용.

CI Job 실행 시 Pod 동적 생성 확인.

# ⚙️ Architecture

```
[GitLab (Self-hosted on Azure VM)]
     ↓
[GitLab Runner (AKS 내 설치)]
     ↓
[Runner는 실행 중, GitLab과 연동]
```

# 목차

1. 설치과정

2. 테스트

3. CI Job 실행할 때마다 Pod 생성 확인



# 1. 설치과정

## Install Gitlab on Azrue VM (Omnibus CE)

Gitlab을 Self-managed로 구성.

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

- Standard_B2ms (2 vCPU / 8GB RAM)

- B2ms는 2코어이지만 RAM이 8GB로 GitLab 테스트에 최소한 동작은 가능


```bash
az vm open-port --port 80 --resource-group gitlab-rg --name gitlab-vm
az vm open-port --port 443 --resource-group gitlab-rg --name gitlab-vm
az vm open-port --port 22 --resource-group gitlab-rg --name gitlab-vm
```

다른 group 과 충돌 문제 시 `priority` 지정
`az vm open-port --port 443 --resource-group gitlab-rg --name gitlab-vm --priority 1100`

- http,https,ssh 허용


## ssh 접속
azure -> Networking -> Public IP address 확인
```bash
ssh azureuser@<Public_IP>
```

## Gitlab CE 설치 (Omnibus)

```bash
sudo apt update
sudo apt install -y curl openssh-server ca-certificates tzdata perl

# GitLab 패키지 저장소 등록
curl https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.deb.sh | sudo bash

# 설치
sudo EXTERNAL_URL="http://<Public_IP>" apt install -y gitlab-ce
```

설치 후,

```bash
Thank you for installing GitLab!
GitLab should be available at http://4.217.217.205
```
- Gitlab Web Url 확인

```bash
# 초기 비밀번호 검색
azureuser@gitlab-vm:~$ sudo cat /etc/gitlab/initial_root_password  | grep Password:
Password: ~~~~
```


project name: gitlab-aks



## AKS 구성

```
az group create --name gitlab-aks-rg --location koreacentral

az aks create \
  --resource-group gitlab-aks-rg \
  --name gitlab-aks-cluster \
  --node-count 2 \
  --enable-addons monitoring \
  --generate-ssh-keys

az aks get-credentials --resource-group gitlab-aks-rg --name gitlab-aks-cluster

```

- default: `Standard_DS2_v2` ( 2VCPU, 7GB )
- 노드 2개 구성, kubeconfig 연결

```bash
# 로컬에 helm 설치 필수
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
! RegistrationToken = gitlab-aks > CI/CD Settings > Runners


![](https://velog.velcdn.com/images/xxng1/post/1a370ad6-608b-45d6-af6d-cc77ee33918a/image.png)

- Gitlab Runner connect



### 현재 상태 (설치과정 이후)

```bash
 $ kubectl get po -n gitlab-runner
NAME                             READY   STATUS    RESTARTS   AGE
gitlab-runner-56776bcccb-gzm2b   1/1     Running   0          2m
```

![](https://velog.velcdn.com/images/xxng1/post/50510be6-823d-4b79-8efe-5c5d3762358c/image.png)


# 2. 테스트

.gitlab-ci.yml 테스트 파일

```yml
stages:
  - test

job-runner-test:
  stage: test
  tags:
    - aks
  script:
    - echo "✅ Runner 동작 확인 완료!"
```



```bash
 $ kubectl logs gitlab-runner-56776bcccb-gzm2b -n gitlab-runner
job-status=running ... sent-log=0-764 status=202 Accepted
Job succeeded ...
Submitting job to coordinator...ok ... code=200 job-status=success
Removed job from processing list ...


```

로그 메시지

- *job-status=running*: GitLab 서버로부터 CI Job을 받아 처리 중

- *sent-log=0-764*: Job의 출력 로그 일부를 GitLab으로 전송함

- *Job succeeded: Job*: 내부 스크립트가 정상적으로 성공 처리됨

- *Submitting job to coordinator...ok*: 최종 결과를 GitLab 서버에 제출 완료

- *Removed job from processing list*: Runner가 해당 Job을 완전히 마무리하고 대기 상태로 전환



# 3. CI Job 실행할 때마다 Pod 생성 확인

.gitlab-ci.yml 수정

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

### Pod 자동 생성

```bash
# -w 옵션으로 Watch 모드
kubectl get pods -n gitlab-runner -w 
```

![](https://velog.velcdn.com/images/xxng1/post/752dbe80-cafd-469d-bdf3-2a88f6531635/image.png)


```bash
# 초기상태, 커밋하면 kubernetes executor가 job 실행 시 Pod 동적 생성
gitlab-runner-56776bcccb-gzm2b   1/1     Running   0          27m

# Runner가 Job 실행용 임시 Pod을 생성함.
runner-<runner-id>-project-<project-id>-concurrent-<n>-<rand>
```




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