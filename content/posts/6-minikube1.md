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

![](https://velog.velcdn.com/images/woongaa1/post/f012ab39-2215-4dd1-8fab-f2f7167053f6/image.png)

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

   ![](https://velog.velcdn.com/images/woongaa1/post/1a6b8f78-6ac9-41d9-b107-08ae15617885/image.png)

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

![kubectl get deployments](https://velog.velcdn.com/images/woongaa1/post/3325e855-72c1-4c1f-bc25-4bca48b2744f/image.png)
![kubectl get pods](https://velog.velcdn.com/images/woongaa1/post/b8db9882-dfb7-4a61-9b21-948722bce267/image.png)
![kubectl get events](https://velog.velcdn.com/images/woongaa1/post/b3ec55c5-d348-4e78-b324-b92e8f3e53cb/image.png)
![kubectl config view](https://velog.velcdn.com/images/woongaa1/post/13cac459-14a5-4662-bb7a-ddb83516cee6/image.png)
![kubectl logs](https://velog.velcdn.com/images/woongaa1/post/126e465c-6e18-4b68-ad5d-1ca9dca89967/image.png)

<br>


# ☑️ 서비스 노출과 접근

### 1. **로드 밸런서 타입 서비스 생성**
   ```bash
   kubectl expose deployment hello-node --type=LoadBalancer --port=8080
   ```
   minikube 환경에서는 내부적으로 터널을 만들어 외부 접근을 허용한다.

   ![](https://velog.velcdn.com/images/woongaa1/post/b70416c4-8b2d-4bc1-ab21-07a107397108/image.png)

<br>

### 2. **서비스 목록 확인**
   ```bash
   kubectl get services
   ```
   직접 만든 `hello-node` 확인.

   ![](https://velog.velcdn.com/images/woongaa1/post/59e9965f-5e31-4246-93c5-f5abd87f5272/image.png)

<br>

### 3. **서비스 URL 열기**
   ```bash
   minikube service hello-node
   ```
   자동으로 브라우저가 열리며 호출이 가능합니다.

   ![](https://velog.velcdn.com/images/woongaa1/post/e54e51c7-6a12-4d3b-83fb-9155f2d3b4d4/image.png)
   ![](https://velog.velcdn.com/images/woongaa1/post/3728b5f5-c081-462a-9f1b-2912164639a5/image.png)

