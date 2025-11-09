---
layout:       post
title:        "[DevOps] Kubernetes Executor 기반 GitLab Runner"
date: '2025-05-12'
section: 'infra'
excerpt: 'AKS(Azure Kubernetes Service)에서 GitLab Runner Kubernetes Executor 구성 및 CI Job Pod 동적 생성'
tags: ['Azure', 'GitLab', 'Kubernetes', 'AKS', 'CI/CD', 'DevOps']
---

GitLab Runner를 Kubernetes에 붙이고 나면, CI Job이 실행될 때마다 임시 Pod가 생성되고 종료되는 과정을 확인할 수 있습니다.

이 글에서는 `Azure` 환경을 예로 들어, `GitLab`을 자체 호스팅하고 `AKS`에 `GitLab Runner`를 배포하는 과정을 정리했습니다.

## 전체 구조

```
[GitLab (Azure VM)] → [GitLab Runner (AKS)] → [CI Job Pod]
```

- GitLab은 Azure VM에 Omnibus CE 버전으로 설치
- AKS에 Helm Chart를 이용해 GitLab Runner 배포
- Runner가 Kubernetes Executor로 Job을 처리하면서 Pod를 동적 생성

## 1. GitLab 설치 (Azure VM)

### 리소스 그룹 & VM 생성

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

`Standard_B2ms`(2 vCPU, 8GB RAM) 구성으로 테스트 환경을 마련했습니다.

### 포트 개방

```bash
az vm open-port --port 80 --resource-group gitlab-rg --name gitlab-vm
az vm open-port --port 443 --resource-group gitlab-rg --name gitlab-vm
az vm open-port --port 22 --resource-group gitlab-rg --name gitlab-vm
```

필요 시 `--priority` 옵션으로 NSG 규칙 우선순위를 조정합니다.

### SSH 접속 및 GitLab CE 설치

```bash
ssh azureuser@<Public_IP>

sudo apt update
sudo apt install -y curl openssh-server ca-certificates tzdata perl
curl https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.deb.sh | sudo bash
sudo EXTERNAL_URL="http://<Public_IP>" apt install -y gitlab-ce
```

설치가 끝나면 `initial_root_password` 파일에서 초기 비밀번호를 확인합니다.

## 2. AKS 클러스터 준비

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

![](https://velog.velcdn.com/images/xxng1/post/50510be6-823d-4b79-8efe-5c5d3762358c/image.png)

기본 노드 풀은 `Standard_DS2_v2`(2 vCPU, 7GB RAM)로 생성되었습니다.

## 3. GitLab Runner (Helm) 설치

Runner 등록 토큰은 GitLab 프로젝트의 **Settings → CI/CD → Runners**에서 확인합니다.

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

![](https://velog.velcdn.com/images/xxng1/post/1a370ad6-608b-45d6-af6d-cc77ee33918a/image.png)

설치 후 상태 확인:

```bash
kubectl get po -n gitlab-runner
```

```
NAME                             READY   STATUS    RESTARTS   AGE
gitlab-runner-56776bcccb-gzm2b   1/1     Running   0          2m
```

## 4. 기본 동작 테스트

`.gitlab-ci.yml`에 가장 단순한 Job을 추가했습니다.

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

로그 확인:

```bash
kubectl logs gitlab-runner-56776bcccb-gzm2b -n gitlab-runner
```

`Job succeeded` 메시지가 보이면 Runner와 GitLab이 정상적으로 통신 중입니다.

## 5. Pod 동적 생성 확인

Runner가 Kubernetes Executor로 동작하는지 확인하기 위해 Job을 수정했습니다.

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

Job이 실행되는 동안 `kubectl get pods -n gitlab-runner -w`로 모니터링하면, 다음과 같이 임시 Pod가 생성되고 종료되는 것을 볼 수 있습니다.

![](https://velog.velcdn.com/images/xxng1/post/752dbe80-cafd-469d-bdf3-2a88f6531635/image.png)

잠깐 `sleep`을 준 이유는 Pod 상태를 직접 확인하고 싶었기 때문입니다.

## Troubleshooting 메모

- VM을 재생성했는데 IP가 그대로라면 기존 SSH 키 때문에 접속이 거부될 수 있습니다. `ssh-keygen -R <IP>`로 known_hosts 항목을 삭제하면 됩니다.

```
ssh-keygen -R 4.217.217.205
```

![](https://velog.velcdn.com/images/xxng1/post/87299252-8b81-4608-8980-7edaff38e62b/image.png)

## 마무리

이 구성을 통해 GitLab Runner가 Kubernetes 자원을 효율적으로 활용하도록 만들었습니다. 실제 프로젝트에서는 Pod 템플릿을 수정해 이미지나 리소스 제한을 세밀하게 조정할 수 있고, 여러 태그를 사용해 Runner 역할을 분리할 수도 있습니다. 다음 단계는 Helm Chart Values를 커스터마이징해 캐시, 볼륨 마운트 등을 붙여보는 것입니다.
