---
layout:       post
title:        "웹기반 미디어 스트리밍 서비스"
date: '2025-03-17'
excerpt: ''
---

> WEB 기반 미디어 스트리밍 서비스 구축기




# 도전 과제
- 다양한 **서비스**를 사용해볼 것.
- 다양한 **솔루션**을 사용해볼 것.
- **성능** & **운영**에서 최적화를 진행할 것.



# 시스템 아키텍처
![](https://velog.velcdn.com/images/xxng1/post/1a1ffb5c-68c7-43d4-b280-57774f6a9480/image.png)

## 체크 포인트

> *WEB*, *EKS*, *Media*, *Security*, *Observability*


ㅤ


# WEB
> ### S3, Cloudfront
S3, CloudFront를 사용하여 React로 구성한 프론트엔드 애플리케이션을 CDN 배포했습니다.

**Github Actions를 통한 배포 자동화/캐싱 무효화**

![](https://velog.velcdn.com/images/xxng1/post/4778d7b8-f574-4250-b1aa-5d95488ba269/image.png)


ㅤ

> ### Route53
네임서버 호스팅으로 Route53을 사용했습니다.


프론트엔드 ↔️ 백엔드 통신을 위한 HTTPS 구성에서, *Route53* 서브도메인을 이용했습니다.

ArgoCD로 애플리케이션을 구성하면 *CLB(Classic Load Balancer)* 타입으로 배포가 되는데,

아래 두 가지 이유 때문에 **CLB ➡️ ALB** 로의 로드밸런서 타입을 전환했습니다.

1. CLB는 Latency문제가 있기 때문.
2. Route53에서 네임서버에 대한 인증서를 서브도메인(api)에도 사용(운영 효율 증가).

ㅤ

> *AWS Load Balancer Controller* 를 통해서 ingress 구성. **(CLB ➡️ ALB)**
* Public Subnet에 *kubernetes.io/role/elb* 태그 지정하여 ALB를 배포.


![](https://velog.velcdn.com/images/xxng1/post/4f81a088-5684-4808-bdf0-1a478ae4c300/image.png)

ㅤ

> *backend ingress* 의 address를 Route53 유형A로 호스팅. **(서브도메인 - api.chuno.store)**

![](https://velog.velcdn.com/images/xxng1/post/2f5befde-0d1c-463f-8f02-9f9163f5e357/image.png)





# EKS

- 원격 접속을 위한 목적의 노드 1개 **(t3.medium)**
- 애플리케이션 배포를 위한 노드 **(m5.large)**
  - 최소 노드: **2**, 최대 노드: **6**

![](https://velog.velcdn.com/images/xxng1/post/723f1897-f460-471d-afa4-be62d223a12b/image.png)


### Backend

**FastAPI**로 구축한 백엔드를 Kubernetes **Deployment** 리소스로 배포했습니다.

주요 설정
1. *replicas: 2*
    - **고가용성**
2. *revisionHistoryLimit: 2*
    - **배포 이력 관리**
3. *podAntiaffinity: preferredDuringSchedulingIgnoredDuringExecution*
    - **파드를 스케줄링하는 동안 최대한 다른 노드에 배포하도록 설정**
4. *IAM Role Service Account 선언*
    - **S3, DynamoDB 접근 권한**
5. *priorityClassName: high-priority*
    - **우선순위 부여(Cluster Over-Provisioning)**


### ArgoCD

이 과정을 ArgoCD GitOps방식 Workflow로 구성했습니다.

![](https://velog.velcdn.com/images/xxng1/post/d0c78493-8b5c-4422-8838-032cff69c3f2/image.png)


ㅤ


# Autoscaling

> ### Cluster Over-Provisioning

Auto Scaling간 미리 Over-Provisioning을 설정함으로써 급격한 트래픽 증가에 즉각적으로 대응이 가능하게 하고 서비스 중단을 최소화하여 오토스케일링이 완료될 때까지의 시간 확보를 통해 성능을 최적화할 수 있습니다.

ㅤ





![](https://velog.velcdn.com/images/xxng1/post/9a678f0f-09af-47a2-a6b4-3ad4f0ced79f/image.png)

Node는 2 vCPU로 설정되어 있는데, pause pods를 생성하고 우선순위를 마지막으로(*value: -1*) 설정하였습니다.

2코어 보다 작은 1.7(*1700m*)코어를 할당 함으로써 Over-Provisioning을 구축했습니다.

ㅤ
ㅤ

![](https://velog.velcdn.com/images/xxng1/post/3e717fee-16a9-4b27-a215-ea054879fb3b/image.png)

Autoscaling으로 리소스가 부족하면 우선순위에 따라 application pod가 스케줄링(**Running**)되고

**pause pod**는 다시 **pending** 상태가 되면서 추가로 1개의 인스턴스가 생성됩니다.

ㅤ


> ### HPA(Horizontal Pod Autoscaler)

![](https://velog.velcdn.com/images/xxng1/post/9880bc40-1ecd-46f5-9d55-00272338f3de/image.png)

HPA(Horizontal Pod Autoscaler)은 파드 수를 조정하여 애플리케이션 성능과 자원 사용을 최적화해줍니다.


ㅤ

주요 설정
1. Pod resources.request.cpu = 800m (**Deployment**)
2. targetCPUUtilizationPercentage: 50 (**50%**)

![](https://velog.velcdn.com/images/xxng1/post/a603e027-3029-4055-b84a-b9a5116273c8/image.png)

Deployment로 배포한 비디오 application pod가 CPU를 50%이상 사용시 *Scale Out* (pod 증가)


ㅤ


# Media

> ### MediaConvert
영상 업로드 프로토콜로는 HLS를 사용했습니다. 

HLS는 HTTP 기반 전송 스트리밍 프로토콜로, 영상을 업로드하면 파일을 세그먼트로 나누고 이를 **.ts** 파일에 저장합니다.

적응형 비트 레이트 지원으로 네트워크 환경에 따른 화질 조정이 자동으로 이뤄지고 대부분의 웹 브라우저와 모바일에 지원하여 광범위한 지원을 해줍니다.

![](https://velog.velcdn.com/images/xxng1/post/d318fddf-708c-4a8a-8488-66adcb6e9b9e/image.png)

ㅤ
ㅤ

이를 구현하기 위해, AWS의 *MediaConvert*를 사용했습니다.

![](https://velog.velcdn.com/images/xxng1/post/aec76703-ffad-4863-afc4-6e35049c69de/image.png)

HLS 변환은 아래 과정을 따릅니다.
1. 사용자가 업로드를 하면 백엔드 API에서 *Source Bucket*과 *DynamoDB*에 metadata로 저장
2. 파일이 업로드 되면 *Lambda*가 트리거
3. *MediaConvert* 에서 파일을 변환하여
4. *Destination Bucket* 에 저장.
5. 저장된 영상을 *CloudFront* 로 배포하여 재생.

> ### HLS 구현 아키텍처

![](https://velog.velcdn.com/images/xxng1/post/446eb19c-6fc0-438c-bb27-5cc5aeb88ddd/image.png)



사용자가 영상을 업로드하면 HLS 변환을 통해 m3u8 파일로 변환하고, 270p ~ 1080p 해상도까지
네트워크 환경에 맞게 화질을 조정할 수 있도록 각각의 해상도를 설정해 주었습니다.

 ㅤ
> ### IVS(Interactive Video Service)
![](https://velog.velcdn.com/images/xxng1/post/befcea24-d759-4c49-bc28-46811e91dbd0/image.png)

실시간 스트리밍으로는 대규모 스트리밍 서비스인 IVS를 사용했으며, *amazon-ivs-chat-web-demo*를 프로젝트 환경에 바꾸어 사용했습니다.

Lambda와 API Gateway를 사용해서 만든 백엔드 URL을 IVS 채널과 IVS 채팅방과 연결해서 구현했습니다.

이를 통해 촬영중인 실시간 방송 화면을 볼 수 있고, 채팅도 가능하게 구현했습니다.




# Security


> ### 사용자 인증/인가
![](https://velog.velcdn.com/images/xxng1/post/27428625-623a-4835-bdef-ddd2a6e71fc2/image.png)

Cognito를 사용해서 JWT 토큰 기반 사용자 인증/인가를 관리했습니다.

- Client(React): *amazon-cognito-identity-js*


```js

const authenticationData = {
  Username: email,
  Password: password,
};
const authenticationDetails = new AuthenticationDetails(authenticationData);

const userData = {
  Username: email,
  Pool: userPool,
};
const cognitoUser = new CognitoUser(userData) ;

cognitoUser.authenticateUser(authenticationDetails,{
onSuccess: (result) => { 
  // accessToken 저장방식
 })
```


- Server(FastAPI): *Boto3*

```python
# 엑세스 토큰 유효성 검사
def validate_token(token: str):
  try:
    # Cognito에서 토큰 검증
    cognito_client.get_user(
      AccessToken=token
    )
    except ClientError as e:
      raise HTTPException(status_code=401, detail=str(e))
```







> ### webhook 암호화
![](https://velog.velcdn.com/images/xxng1/post/217c8bae-e9fd-4040-a88b-4f0d4cd401ef/image.png)

알림으로써 Slack Webhook을 사용한 알림을 구현했습니다. 이를 KMS로 암호화해주었습니다.

ㅤ


> ### IRSA(IAM Roles for Service Accounts)
![](https://velog.velcdn.com/images/xxng1/post/2cc9c789-cab4-40e4-81d6-601ab742b8e0/image.png)

IRSA는 쿠버네티스 사용자에 AWS 역할을 부여하여 사용하는 기능입니다.

IRSA는 OIDC(OpenID Connect) 프로바이더의 신뢰가 필요합니다. EKS는 IAM 역할을 Kubernetes 서비스 계정과 연결하기 위해 OIDC를 사용하며 클러스터에서 IAM 역할에 접근할 수 있는 안전한 연결을 제공합니다.

kubernetes 내부에서는 service account를 생성하여 생성한 역할을 부여하고, 
deployment에 service account를 선언하여 클러스터에서도 IAM 역할에 접근할 수 있도록 설정했습니다.



# Observability

> ### Monitoring

helm을 통한 Grafana(대시보드)/prometheus(메트릭 수집) 모니터링 시스템을 구축했습니다.

![](https://velog.velcdn.com/images/xxng1/post/b1fc6a51-e328-440f-aa4e-8638aacfd6fa/image.png)

노드 별 CPU, 메모리 사용량, 네임스페이스 파드별 CPU, 메모리 사용량, 총 실행 중인 파드 수를 모니터링 했습니다.

ㅤ

ㅤ



> ### service mesh



![](https://velog.velcdn.com/images/xxng1/post/dadcb113-95dc-4c59-8516-c0a02e1d2a71/image.png)

![](https://velog.velcdn.com/images/xxng1/post/3a94f05d-5519-4c0f-a5ae-95968f08e0aa/image.png)

*istio*, *kiali*를 사용하여 네트워크 관리 및 성능 모니터링하고, 요청 흐름을 추적했습니다.




ㅤ
ㅤ
ㅤ

ㅤ
ㅤ
ㅤ

ㅤ
ㅤ
ㅤ
> *github repo*
```
https://github.com/AWS2-Chuno
```