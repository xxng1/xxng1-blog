---
layout:       post
title:        "Kubernetes Executor 기반 GitLab Runner"
date: '2025-05-12'
section: 'infra'
excerpt: 'AKS(Azure Kubernetes Service)와 GitLab Runner를 연동한 CI Job Pod 동적 생성'
tags: ['Azure', 'GitLab', 'Kubernetes', 'Cloud', 'CI/CD', 'DevOps']
---

GitLab Runner를 Kubernetes에 붙이면, CI Job이 실행될 때마다 임시 Pod가 생성되고 종료되는 과정을 확인할 수 있다.

이 글에서는 **GitLab**, **GitLab Runner**를 자체 호스팅해서 **AKS(Azure Kubernetes Service)** 에 연결하는 과정을 정리했다.

<br>

# ☑️ 전체 구조

```
[GitLab (Azure VM)] → [GitLab Runner (AKS)] → [CI Job Pod]
```

- GitLab은 Azure VM에 Omnibus CE 버전으로 설치
- AKS에 Helm Chart를 이용해 GitLab Runner 배포
- Runner가 Kubernetes Executor로 Job을 처리하면서 Pod를 동적 생성

<br>

# ☑️ 1. GitLab 설치 (Azure VM)

- 리소스 그룹 & VM 생성

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

GitLab은 최소 사양이 있다.  
`Standard_B2ms`(2 vCPU, 8GB RAM) 구성으로 테스트 환경을 마련했다.

<br>

- 포트 개방

```bash
az vm open-port --port 80 --resource-group gitlab-rg --name gitlab-vm
az vm open-port --port 443 --resource-group gitlab-rg --name gitlab-vm
az vm open-port --port 22 --resource-group gitlab-rg --name gitlab-vm
```

`HTTP`, `HTTPS`, `SSH` 를 허용해준다.  
다른 group 과 충돌 문제 시, `--priority` 옵션으로 NSG 규칙 우선순위를 조정해서 port 를 개방해준다.


<br>


- SSH 접속 및 GitLab CE 설치

```bash
ssh azureuser@<Public_IP>

sudo apt update
sudo apt install -y curl openssh-server ca-certificates tzdata perl
curl https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.deb.sh | sudo bash
sudo EXTERNAL_URL="http://<Public_IP>" apt install -y gitlab-ce
```

설치가 끝나면 `initial_root_password` 파일에서 초기 비밀번호를 확인한다.

<br>

# ☑️ 2. AKS 클러스터 준비

- Azure CLI로 생성

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

기본 노드 풀은 `Standard_DS2_v2`(2 vCPU, 7GB RAM)로 생성된다.

![](https://velog.velcdn.com/images/xxng1/post/50510be6-823d-4b79-8efe-5c5d3762358c/image.png)

<br>

# ☑️ 3. GitLab Runner (Helm) 설치

Runner `<RegistrationToken>`은 GitLab 프로젝트의 **Settings → CI/CD → Runners**에서 확인 가능

- 로컬에서 helm 설치 후 진행

```bash
helm repo add gitlab https://charts.gitlab.io
helm repo update
kubectl create namespace gitlab-runner

helm install gitlab-runner gitlab/gitlab-runner \
  --namespace gitlab-runner \
  --set gitlabUrl=http://<GitLab_Public_IP> \
  --set runnerRegistrationToken=<RegistrationToken> \
  --set rbac.create=true \
  --set runners.tags="aks" \
  --set runners.executor=kubernetes \
  --set runners.namespace=gitlab-runner
```

<br>

- 연결 완료 상태

![](https://velog.velcdn.com/images/xxng1/post/1a370ad6-608b-45d6-af6d-cc77ee33918a/image.png)

<br>

- 설치 후 상태 확인

```shell
$ kubectl get po -n gitlab-runner
NAME                             READY   STATUS    RESTARTS   AGE
gitlab-runner-56776bcccb-gzm2b   1/1     Running   0          2m

```

<br>

# ☑️ 4. 기본 동작 테스트

- `.gitlab-ci.yml`에 단순한 Job 추가.

```yml
stages:
  - test

job-runner-test:
  stage: test
  tags:
    - aks
  script:
    - echo "Runner 동작 확인 완료"
```

<br>

- 로그 확인

```shell
$ kubectl logs gitlab-runner-56776bcccb-gzm2b -n gitlab-runner
job-status=running ... sent-log=0-764 status=202 Accepted
Job succeeded ...
Submitting job to coordinator...ok ... code=200 job-status=success
Removed job from processing list ...
```
- `job-status=running`: GitLab 서버로부터 CI Job을 받아 처리 중
- `sent-log=0-764`: Job의 출력 로그 일부를 GitLab으로 전송함
- `Job succeeded: Job`: 내부 스크립트가 정상적으로 성공 처리됨
- `Submitting job to coordinator...ok`: 최종 결과를 GitLab 서버에 제출 완료
- `Removed job from processing list`: Runner가 해당 Job을 완전히 마무리하고 대기 상태로 전환

<br>

# ☑️ 5. Pod 동적 생성 확인

- Runner가 Kubernetes Executor로 동작하는지 확인하기 위한 Job

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
    - sleep 15
```

<br>


- `kubectl -w` 명령어로 모니터링
![](https://velog.velcdn.com/images/xxng1/post/752dbe80-cafd-469d-bdf3-2a88f6531635/image.png)

사진과 같이 임시 Pod가 생성되고 종료되는 것을 확인할 수 있다.