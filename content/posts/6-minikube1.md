---
layout: post
title: "minikube?"
date: '2024-04-25'
section: 'infra'
excerpt: '로컬 환경에서 Kubernetes를 간단하게 사용하기 위한 minikube 설치 및 사용법'
tags: ['Kubernetes', 'minikube', 'DevOps']
---

쿠버네티스를 쉽게 구축하고 싶을 때 빠른 대안 중 하나가 **minikube**이다.

이름 그대로 "mini Kubernetes"를 로컬에서 실행할 수 있다.

<br>

# ☑️ minikube란?

![](/blog-images/6/1.png)

- 로컬 개발 PC에서 간단히 Kubernetes를 체험할 수 있는 도구
- VirtualBox, Docker, HyperKit 등 다양한 하이퍼바이저 위에서 동작
- `kubectl`과 동일한 명령어를 사용하기 때문에 실제 클러스터로 옮길 때도 부담이 적음


# ☑️ 설치

[minikube 공식 문서](https://minikube.sigs.k8s.io/docs/start/)에서 운영체제에 맞는 설치 방법을 확인할 수 있다.

Docker 드라이버를 선택해 설치했다.

# ☑️ 첫 번째 클러스터 띄우기

1. **클러스터 시작**
   ```bash
   minikube start
   ```
   기본 설정으로도 워커 노드 하나가 생성된다.

<br>

2. **대시보드 확인**
   ```bash
   minikube dashboard
   ```
   브라우저에서 리소스를 확인할 수 있다.

   ![](/blog-images/6/2.png)

<br>

# ☑️ kubectl 명령

| 목적 | 명령어 |
| --- | --- |
| 디플로이먼트 생성 | `kubectl create deployment hello-node --image=registry.k8s.io/e2e-test-images/agnhost:2.39 -- /agnhost netexec --http-port=8080` |
| 디플로이먼트 목록 | `kubectl get deployments` |
| 파드 목록 | `kubectl get pods` |
| 이벤트 확인 | `kubectl get events` |
| 현재 컨텍스트 | `kubectl config view` |
| 파드 로그 | `kubectl logs <파드이름>` |

각 명령을 실행하면 아래처럼 결과를 확인할 수 있습니다.

![kubectl get deployments](/blog-images/6/3.png)
![kubectl get pods](/blog-images/6/4.png)
![kubectl get events](/blog-images/6/5.png)
![kubectl config view](/blog-images/6/6.png)
![kubectl logs](/blog-images/6/7.png)

<br>


# ☑️ 서비스 노출과 접근

### 1. **로드 밸런서 타입 서비스 생성**
   ```bash
   kubectl expose deployment hello-node --type=LoadBalancer --port=8080
   ```
   minikube 환경에서는 내부적으로 터널을 만들어 외부 접근을 허용한다.

   ![](/blog-images/6/8.png)

<br>

### 2. **서비스 목록 확인**
   ```bash
   kubectl get services
   ```
   직접 만든 `hello-node` 확인.

   ![](/blog-images/6/9.png)

<br>

### 3. **서비스 URL 열기**
   ```bash
   minikube service hello-node
   ```
   자동으로 브라우저가 열리며 호출이 가능합니다.

   ![](/blog-images/6/10.png)
   ![](/blog-images/6/11.png)

