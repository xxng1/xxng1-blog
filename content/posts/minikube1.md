---
title: "minikube?"
date: '2024-04-25'
excerpt: ''
categories: ['Database/mysql', 'Go']
---

## minikube?
![](https://velog.velcdn.com/images/woongaa1/post/f012ab39-2215-4dd1-8fab-f2f7167053f6/image.png)

mini + kubernetes의 약자로 k8s 클러스터 구축 과정을 줄여서 쿠버네티스를 체험할 수 있는 프로젝트

쿠버네티스를 로컬에서 사용하기에 편리하다.

---
먼저 minikube를 설치해준다.

[minikube 사이트](https://minikube.sigs.k8s.io/docs/start/)에서 설치 과정이 설명되어 있다.

- minikube 시작 명령어 ***minikube start***


- minikube 대시보드 확인 ***minikube dashboard***
![](https://velog.velcdn.com/images/woongaa1/post/1a6b8f78-6ac9-41d9-b107-08ae15617885/image.png)

- 디플로이먼트 생성 ***kubectl create deployment hello-node --image=registry.k8s.io/e2e-test-images/agnhost:2.39 -- /agnhost netexec --http-port=8080***


- 디플로이먼트 조회 ***kubectl get deployments***
![](https://velog.velcdn.com/images/woongaa1/post/3325e855-72c1-4c1f-bc25-4bca48b2744f/image.png)

- 파드 조회 ***kubectl get pods***
![](https://velog.velcdn.com/images/woongaa1/post/b8db9882-dfb7-4a61-9b21-948722bce267/image.png)

- 클러스터 이벤트 조회 ***kubectl get events***
![](https://velog.velcdn.com/images/woongaa1/post/b3ec55c5-d348-4e78-b324-b92e8f3e53cb/image.png)


- kubectl 설정 조회 ***kubectl config view***
![](https://velog.velcdn.com/images/woongaa1/post/13cac459-14a5-4662-bb7a-ddb83516cee6/image.png)


- 컨테이너 로그 조회 ***kubectl logs <파드이름>***
![](https://velog.velcdn.com/images/woongaa1/post/126e465c-6e18-4b68-ad5d-1ca9dca89967/image.png)

- 외부IP 주소로 expose해주는 로드 밸런서 디플로이먼트 생성 ***kubectl expose deployment hello-node --type=LoadBalancer --port=8080***

![](https://velog.velcdn.com/images/woongaa1/post/b70416c4-8b2d-4bc1-ab21-07a107397108/image.png)

- 서비스 조회 ***kubectl get services***
![](https://velog.velcdn.com/images/woongaa1/post/59e9965f-5e31-4246-93c5-f5abd87f5272/image.png)


- 서비스 실행 ***minikube service hello-node***
![](https://velog.velcdn.com/images/woongaa1/post/e54e51c7-6a12-4d3b-83fb-9155f2d3b4d4/image.png)


실행화면
![](https://velog.velcdn.com/images/woongaa1/post/3728b5f5-c081-462a-9f1b-2912164639a5/image.png)


서비스 삭제
![](https://velog.velcdn.com/images/woongaa1/post/f1f1fe4d-ada4-4e79-917a-8ac0be48a80d/image.png)



- minikube 종료 ***minikube stop***




