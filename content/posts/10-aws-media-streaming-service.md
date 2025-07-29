---
layout:       post
title:        "[Project] 웹기반 미디어 스트리밍 서비스"
date: '2025-03-17'
section: 'etc'
# excerpt: '클라우드 기반 미디어 스트리밍 서비스 구축 경험 공유'
# categories: ['AWS/Media']
# tags: ['AWS', 'Media', 'Streaming', 'Cloud']
# <br />
---

<br />

> WEB 기반 미디어 스트리밍 서비스 구축기

<br /><br />


# 🚀 도전 과제
- 다양한 **서비스**를 사용할 것.
- 다양한 **솔루션**을 사용할 것.
- **성능** & **운영**에서 최적화를 진행할 것.

<br /><br />

# ⚙️ 시스템 아키텍처
![](https://velog.velcdn.com/images/xxng1/post/1a1ffb5c-68c7-43d4-b280-57774f6a9480/image.png)

<br />

## ✅ 체크 포인트

### 1. ☑️ WEB
- 웹 프론트엔드 배포와 ALB를 사용한 백엔드 서브도메인 배포

### 2. ☑️ EKS 
- EKS 주요 설정과 ArgoCD GitOps 워크플로우 구성

### 3. ☑️ AutoScaling
- Cluster Over-Provisioning과 HPA(Horizontal Pod Autoscaler)를 통한 자동 확장

### 4. ☑️ Media
- AWS MediaConvert를 사용한 동영상 제공과 AWS IVS를 사용한 실시간 스트리밍 구성

### 5. ☑️ Security
- AWS Cognito를 사용한 JWT 토큰 활용과 KMS 키 암호화 구성

### 6. ☑️ Future Improvements
- 개선점1: CDN 배포에서의 캐싱 무효화
- 개선점2: JWT 토큰의 활용

<br /><br />

# ☑️ WEB
> `S3`, `CloudFront`

S3, CloudFront를 사용하여 React로 구성한 프론트엔드 애플리케이션을 CDN 배포했습니다.

**📷 Github Actions를 통한 배포 자동화/캐싱 무효화**

![](https://velog.velcdn.com/images/xxng1/post/4778d7b8-f574-4250-b1aa-5d95488ba269/image.png)

<br />

> `Route53`

네임서버 호스팅으로 `Route53`을 사용했습니다.


프론트엔드 ↔️ 백엔드 통신을 위한 HTTPS 구성에서, `Route53` **서브도메인**을 이용했습니다.

ArgoCD로 애플리케이션을 구성하면 `CLB(Classic Load Balancer)` 타입으로 배포가 되는데,

아래 두 가지 이유 때문에 **CLB ➡️ ALB** 로의 로드밸런서 타입을 전환했습니다.

1. CLB(Classic Load Balancer)는 Latency문제가 있기 때문.
2. Route53에서 네임서버에 대한 인증서를 서브도메인(api)에도 사용(운영 효율 증가).

<br />

> `AWS Load Balancer Controller`

LoadBalcner 타입 교체를 위해 ingress 구성.

**📷 `AWS Load Balancer Controller`: Kubernetes 클러스터에서 AWS의 Elastic Load Balancer(ELB)를 관리하는 컨트롤러**
![](https://velog.velcdn.com/images/xxng1/post/4288f52a-1970-404d-b807-f67ccdf070ae/image.png)

<br />

**📷 Public Subnet에 `kubernetes.io/role/elb: 1` 태그 지정하여 ALB를 배포**


![](https://velog.velcdn.com/images/xxng1/post/4f81a088-5684-4808-bdf0-1a478ae4c300/image.png)

<br />

```shell
$ kubectl get ingress -n video # Ingress 조회
```
**backend server**의 `ADDRESS(k8s-video-chunobac-71d4...)`를 Route53 유형`A`로 호스팅. 

<br />

**📷 서브도메인 - api.chuno.store `(Type: A)`**
![](https://velog.velcdn.com/images/xxng1/post/2f5befde-0d1c-463f-8f02-9f9163f5e357/image.png)

<br /><br />

# ☑️ EKS

- 원격 접속을 위한 목적의 노드 1개 **(t3.medium)**
- 애플리케이션 배포를 위한 노드 **(m5.large)**
  - 최소 노드: **2**, 최대 노드: **6**

![](https://velog.velcdn.com/images/xxng1/post/723f1897-f460-471d-afa4-be62d223a12b/image.png)


> `Backend(FastAPI)`

**FastAPI**로 구축한 백엔드 서버를 Kubernetes **Deployment** 리소스로 배포했습니다.


1. `replicas`: **2**
    - 고가용성을 위해 최소 두 개의 복제 파드 유지.
2. `revisionHistoryLimit`: **2**
    - 배포 이력 관리로 이전 버전의 Deployment 기록을 두 개까지만 유지.
3. `podAntiaffinity`: **preferredDuringSchedulingIgnoredDuringExecution**
    - 파드를 최대한 다른 노드에 분산 배포하려고 시도, 강제하지는 않도록 설정.
 4. `IRSA(IAM Role Service Account)` **선언**
    - **S3**, **DynamoDB** 접근 권한 부여.
5. `priorityClassName`: **high-priority**
    - 이후 **Cluster Over-Provisioning** 구현을 고려한 높은 우선순위 부여.

<br /><br />

> `ArgoCD`

EKS 배포 자동화 워크플로우 구성.

1.	FastAPI 코드 GitHub 푸시 트리거

2.	Python 패키지 설치

3.	Docker 이미지 빌드

4.	ECR 로그인 및 이미지 푸시

5.  deployment.yaml에서 새로 빌드한 Docker 이미지로 업데이트 및 푸시

6.	ArgoCD가 `GitOps` 방식으로 변경 사항을 가져와서 업데이트

<br />

**📷 ArgoCD Application 배포**

argocd-server의 TYPE은 *ClusterIP*로 생성, 외부 접속을 위해 `LoadBalancer`로 변경해줍니다.

```shell
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'
```


![](https://velog.velcdn.com/images/xxng1/post/d0c78493-8b5c-4422-8838-032cff69c3f2/image.png)

<br /><br />

# ☑️ Autoscaling

> `Cluster Over-Provisioning`

Auto Scaling간 미리 Over-Provisioning을 설정함으로써 급격한 트래픽 증가에 즉각적으로 대응이 가능하게 하고 서비스 중단을 최소화하여 오토스케일링이 완료될 때까지의 시간 확보를 통해 성능을 최적화할 수 있습니다.

<br />

![](https://velog.velcdn.com/images/xxng1/post/9a678f0f-09af-47a2-a6b4-3ad4f0ced79f/image.png)

Node는 2 vCPU로 설정되어 있는데, `pause pods`를 생성하고 우선순위를 마지막으로(`value: -1`) 설정하였습니다.

2코어 보다 작은 1.7(`1700m`)코어를 할당 함으로써 Over-Provisioning을 구축했습니다.

<br />

![](https://velog.velcdn.com/images/xxng1/post/3e717fee-16a9-4b27-a215-ea054879fb3b/image.png)

Autoscaling으로 리소스가 부족하면 우선순위에 따라 application pod가 스케줄링(**Running**)되고

`pause pod`는 다시 `pending` 상태가 되면서 추가로 1개의 인스턴스가 생성됩니다.

<br />

> `HPA(Horizontal Pod Autoscaler)`

![](https://velog.velcdn.com/images/xxng1/post/9880bc40-1ecd-46f5-9d55-00272338f3de/image.png)

HPA(Horizontal Pod Autoscaler)은 파드 수를 조정하여 애플리케이션 성능과 자원 사용을 최적화해줍니다.

<br />

주요 설정
1. `Pod resources.request.cpu` = `800m` (**Deployment**)
2. `targetCPUUtilizationPercentage`: `50` (**50%**)

![](https://velog.velcdn.com/images/xxng1/post/a603e027-3029-4055-b84a-b9a5116273c8/image.png)

Deployment로 배포한 비디오 application pod가 CPU를 50%이상 사용시 `Scale Out` (pod 증가)

<br /><br />

# ☑️ Media

> `AWS MediaConvert`

영상 업로드 프로토콜로는 HLS를 사용했습니다. 

HLS는 HTTP 기반 전송 스트리밍 프로토콜로, 영상을 업로드하면 파일을 세그먼트로 나누고 이를 `.ts` 파일에 저장합니다.

적응형 비트 레이트 지원으로 네트워크 환경에 따른 화질 조정이 자동으로 이뤄지고 대부분의 웹 브라우저와 모바일에 지원하여 광범위한 지원을 해줍니다.

![](https://velog.velcdn.com/images/xxng1/post/d318fddf-708c-4a8a-8488-66adcb6e9b9e/image.png)

<br />

이를 구현하기 위해, AWS의 `MediaConvert`를 사용했습니다.

![](https://velog.velcdn.com/images/xxng1/post/aec76703-ffad-4863-afc4-6e35049c69de/image.png)

HLS 변환은 아래 과정을 따릅니다.
1. 사용자가 업로드를 하면 백엔드 API에서 `Source Bucket`과 `DynamoDB`에 metadata로 저장  

2. 파일이 업로드 되면 `AwS Lambda`가 트리거  

3. `MediaConvert` 에서 HLS 변환 수행  

4. `Destination Bucket` 에 저장.  

5. 저장된 영상을 `AWS CloudFront` 로 배포하여 재생.  

<br /><br />

**📷 HLS 구현 아키텍처**

![](https://velog.velcdn.com/images/xxng1/post/446eb19c-6fc0-438c-bb27-5cc5aeb88ddd/image.png)



사용자가 영상을 업로드하면 HLS 변환을 통해 m3u8 파일로 변환하고, 270p ~ 1080p 해상도까지
네트워크 환경에 맞게 화질을 조정할 수 있도록 각각의 해상도를 설정해 주었습니다.

 ㅤ
> `AWS IVS(Interactive Video Service)`

![](https://velog.velcdn.com/images/xxng1/post/befcea24-d759-4c49-bc28-46811e91dbd0/image.png)

실시간 스트리밍으로는 대규모 스트리밍 서비스인 IVS를 사용했으며, [amazon-ivs-chat-web-demo](https://github.com/aws-samples/amazon-ivs-chat-web-demo)
를 프로젝트 환경으로 맞추어 사용했습니다.

Lambda와 API Gateway를 사용해서 만든 백엔드 URL을 IVS 채널과 IVS 채팅방과 연결해서 구현했습니다.

이를 통해 촬영중인 실시간 방송 화면을 볼 수 있고, 채팅도 가능하게 구현했습니다.

<br /><br />

# ☑️ Security


> `AWS Cognito`

![](https://velog.velcdn.com/images/xxng1/post/27428625-623a-4835-bdef-ddd2a6e71fc2/image.png)

`Cognito`를 사용해서 `JWT Token` 기반 사용자 인증/인가를 관리했습니다.

<br />

- Client(React): `amazon-cognito-identity-js`


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

<br />

- Server(FastAPI): `Boto3`

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

<br /><br />

> `AWS KMS(Key Management Service)`

![](https://velog.velcdn.com/images/xxng1/post/217c8bae-e9fd-4040-a88b-4f0d4cd401ef/image.png)

알림으로써 `Slack Webhook`을 사용한 알림을 구현했습니다. 이를 `AWS KMS`로 암호화해주었습니다.

**인코딩**

```shell
aws kms encrypt \
    --key-id <KEY_ID> \
    --plaintext fileb://<(echo -n "<TEXT>") \
    --output text \
    --query CiphertextBlob
```

- KMS key id 지정
- 암호화 데이터 입력(평문)

**디코딩**

```shell
aws kms decrypt \
--ciphertext-blob fileb://<(echo "<INCODED_TEXT>" | base64 --decode) \
--output text \
--query Plaintext | base64 --decode
```

- FastAPI 내에서 `AWS SDK boto3` 활용하여 `decrypted_value` 추출

<br /><br />

> `IRSA(IAM Roles for Service Accounts)`

![](https://velog.velcdn.com/images/xxng1/post/2cc9c789-cab4-40e4-81d6-601ab742b8e0/image.png)

`IRSA`는 쿠버네티스 사용자에 AWS 역할을 부여하여 사용하는 기능입니다.

IRSA는 `OIDC(OpenID Connect)` 프로바이더의 신뢰가 필요합니다. EKS는 IAM 역할을 Kubernetes 서비스 계정과 연결하기 위해 OIDC를 사용하며 클러스터에서 IAM 역할에 접근할 수 있는 안전한 연결을 제공합니다.

kubernetes 내부에서는 `Service Account`를 생성하여 생성한 역할을 부여하고, 
deployment에 Service Account를 선언하여 클러스터에서도 IAM 역할에 접근할 수 있도록 설정했습니다.

<br /><br />

 ### + Observability

> `Grafana/Prometheus`

`helm`을 통한 Grafana(대시보드)/prometheus(메트릭 수집) 모니터링 시스템을 구축했습니다.

![](https://velog.velcdn.com/images/xxng1/post/b1fc6a51-e328-440f-aa4e-8638aacfd6fa/image.png)

노드 별 CPU, 메모리 사용량, 네임스페이스 파드별 CPU, 메모리 사용량, 총 실행 중인 파드 수를 모니터링 했습니다.

<br /><br />

# ☑️ Future Improvements

### 개선점 1

- 프로젝트에서 `CloudFront`로 CDN배포를 할 때, 캐싱 무효화를 위해서
```shell
aws cloudfront create-invalidation --distribution-id ECDYLDP4DEWXU --paths "/*"
```

위의 `(/*)` 경로의 모든 캐싱을 무효화했는데, 더 좋은 방법으로 캐싱을 무효화 할 수 있었던 것 같다.

예를 들어, `SWR(Stale-While-Revalidate)` 패턴을 적용해서 캐시 효율성을 높일 수 있다.

*SWR*: 캐시 TTL이 만료된 데이터라도, 일정 기간(stale-while-revalidate 시간) 동안 사용자에게 제공.

[SWR Pattern 구현 포스팅](https://www.xxng1.com/posts/13-swr-pattern-cloudfront)

```
예시 설정:
- 기본 TTL (Default TTL): 60초
- Stale-While-Revalidate TTL: 300초
```
- **동작 방식**:
    - 60초 동안은 최신 데이터 제공.
    - 60초가 지난 후 300초(5분) 동안은 만료된 데이터를 제공하면서 원본 서버에 재검증 요청을 비동기로 수행합니다.
    - 재검증 성공 시 캐시 갱신, 실패 시 기존 데이터 계속 사용.

<br /><br />

### 개선점 2

`AWS Cognito` 를 사용해서 JWT 토큰 기반 사용자 인증/인가를 관리했다.

이 때, **Client(React)** 에서 `amazon-cognito-identity-js`를 사용하여 토큰을 검증했는데,
local storage에 accesstoken을 저장했었다.

```javascript
  useEffect(() => {
    const token = localStorage.getItem('accessToken'); // 이 부분
    if (token) {
      setIsAuthenticated(true);
      setUsername(localStorage.getItem('username') || 'User');
    } else {
      setIsAuthenticated(false);
    }
  }, []);
```

하지만, localStorage는 XSS(크로스 사이트 스크립팅) 공격에 취약하다는 문제가 있다.

`sessionStorage` 또는 `httpOnly` 쿠키에 저장하는 방법을 사용했으면 보안 효율을 높일 수 있었던 것 같다.

- `sessionStorage`: 사용자가 브라우저를 닫으면 자동 삭제되므로, 일회성 로그인 세션 유지에 적합하다.
- `httpOnly 쿠키`: JavaScript에서 접근할 수 없도록 설정할 수 있어 XSS 공격으로부터 보호할 수 있는 더 안전한 방법이다.

<br /><br />

<!-- [![GitHub 로고](/image.png)](https://github.com/AWS2-Chuno) -->

### ➕ IaC(Infrastructure as Code) - Terraform 구성
---
AWS 인프라를 코드로 관리하여 일관성 있고 재현 가능한 환경을 구축했습니다.

[Terraform Source Code Github Link](https://github.com/AWS2-Chuno/tf)