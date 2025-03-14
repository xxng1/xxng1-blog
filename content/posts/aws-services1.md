---
layout:       post
title:        "AWS Services(feat. network)"
date: '2024-04-11'
excerpt: '#AWS'
---


# Network
>**Application load balancer(ALB)**
- Http, Https통신에 사용
- <span style="color:yellowgreen"> 리스너 규칙으로 HTTP트래픽을 HTTPS로 리디랙션 가능 </span>

>**Network load balancer(NLB)**
- TCP, UDP통신에 사용
- <span style="color:yellowgreen"> TLS(SSL) listener를 구성하여 보안⬆️ </span>

>**Gateway load balancer(GLB)**
- VPC간의 통신에 사용

>**NAT Gateway**
- 네트워크 트래픽을 패킷을 수정함으로써 포트 및 주소 등을 기록
- 프라이빗 서브넷에 대한 인터넷 엑세스를 활성화하는 등에 사용
- <span style="color:yellowgreen"> 퍼블릭 서브넷에 배치 </span>

>**SFTP(SSH File Transfer Protocol)**
- AWS Transfer Family를 사용하여 반복되는 B2B 파일 전송을 AWS 스토리지 서비스로 안전하게 확장

>**SMB(Server Message Block)**
- 네트워크의 노드들 간에 자원을 공유할 수 있도록 설계된 프로토콜
- 온프레미스-AWS 간 스토리지 서비스 중 SMB 지원하는건 스토리지 게이트웨이, Fsx

# AWS Services

>**Region**
- 물리적으로 떨어진 지역에서의 여러개의 클라우드 인프라

>**Availabilty Zone**
- 리전들이 모여 구성하는 데이터 센터
- <span style="color:yellowgreen"> 가용성을 담당</span>

>**Edge Location**
- CDN(Content Delivery Network)을 이루는 캐시 서버
- 리전 에지 캐시를 통한 데이터 속도 개선 가능

>**EC2(Elastic Compute Cloud)**
- 컴퓨터 리소스에 대해 전반적 관리를 도와주는 가상 서버

>**Lambda**
- 특정한 이벤트를 통해 입력 인자가 발생하면 연산 과정으로 출력 인자를 바꾸는 이벤트 기반의 컴퓨팅 서비스

>**ECS**
- AWS에서 제공하는 컨테이너 서비스

>**AWS Fargate**
- 컨테이너를 실행하고 관리하기 위한 서버리스 컴퓨팅 엔진
- 직접 관리하지 않고 CPU, 메모링 등 리소스를 지정하면 자동으로 관리(운영 오버헤드⬇️)

>**Amazon EKS(Elastic Kubernetes Service)**
- kubernetes클러스터를 관리, 개별 pod에 IAM Role할당 가능

>**Lightsail**
- 완전 관리형 가상 서버 서비스

>**Elastic Beanstalk**
- EC2의 설정을 쉽게 돕는 서비스
- <span style="color:yellowgreen"> 사이트 자주 테스트 가능 / 운영 오버헤드 낮음</span>

>**S3**
- 서비스 운영시 생성되는 이미지, 동영상, 오디오 파일등을 저장하는 스토리지 서비스

>**Glacier**
- 사용 빈도가 낮을 때(예: 백업 데이터) 사용하기 좋은 스토리지
- 저렴하지만 트래픽 요금이 높다

>**Storage Gateway**
- 기존의 on-premise 환경과 AWS를 연결해주는 게이트웨이 서비스
- <span style="color:yellowgreen"> SMB 지원</span>

>**EBS(Elastic Block Storage)**
- EC2와 연결할 수 있는 저장장치 서비스
- EC2의 하드디스크, SSD 스냅샷을 통해 언제든 EC2를 백업&복원 가능
- Single AZ(가용성 ⬇️)

>**EFS(Elastic File System)**
- 클라우드 기반 파일 시스템
- Multi AZ(가용성 ⬆️)

>**RDS**
- 관계형 데이터베이스(RDBMS)를 구축하는 서비스
- SSD영역에서 입출력이 수행

>**DinamoDB**
- No-SQL 기반의 완전 관리형 데이터베이스
- SSD영역에서 입출력이 수행

>**Elasticcache**
- 메모리에 데이터를 저장하여 빠르게 입출력이 가능한 데이터베이
- <span style="color:yellowgreen"> 세션 데이터 관리 등에 사용 </span>
- 지속되어야 하는 데이터 -> Amazon ElastiCache for Redis 

>**Red Shift**
- 완전 관리형 SQL 데이터 웨어하우스로써 대용량의 정형 데이터를 처리하는데 사용

>**VPC(Virtual Private Cloud)**
- 가상 네트워크망 구축 지원 서비스
- 서비스 보안 수준을 결정하거나 적합한 권한이 있는 사용자들만 접속할 수 있도록 관리
- <span style="color:yellowgreen"> VPC 피어링으로 VPC간 연결, 다른 리전에 있는 경우에도 연결 가능하나, **CIDR**을 참조해야 함 </span>


>**Route53**
- AWS의 DNS(Domain Name System)서비스

>**CloudFront**
- AWS의 클라우드 CDN서비스로 에지 로케이션 서버를 이용하여 콘텐츠를 배포

>**Polly**
- 텍스트를 음성으로 바꾸는(TTS) 음성 합성 서비스

>**Lex**
- 대화형 챗봇(Chatbot) 서비스

>**Rekognition**
- 이미지 인식&분석 서비스

>**QuickSight**
- 태블로(Tableau)와 같이 데이터를 시각화하는 서비스

>**Athena**
- 서버리스 기반 SQL 쿼리 서비스

>**CloudSearch**
- 완전 관리형 검색 서비스

>**EMR(Amazon Elastic MapReduce)**
- 빅데이터 분석 플랫폼인 하둡 프레임워크를 연동하여 사용할 수 있는 서비스

>**Kinesis**
- 실시간 데이터 처리를 위한 서비스

>**Glue**
- 서버리스 ETL(추출(Extract), 로드(Load), 변환(Transform))서비스

>**SES(Simple Email Service)**
- SMTP(Simple Mail Transfer Protocol)방식과 API방식으로 이메일을 수신&발신

>**SNS(Simple notifications service)**
- A2A, A2p 방식으로 알림을 전송
- A2A: 분산된 시스템, 마이크로서비스 및 이벤트중심의 서버리스 애플리케이션 간 처리량이 많은 푸시 기반 다대다 메시징
- A2P: SMS 텍스트, 푸시 알림, 이메일을 통한 메시지 전송

>**EventBridge**
- Amazon CloudWatch Events기능 기반 상태 변화(이벤트) 감지
- 메일 전송, 인증서 감지 등에 사용

>**Amazon FSx**
- Windows Server에 구축되는 완전관리형 파일 스토리지
- <span style="color:yellowgreen"> SMB 지원</span>

>**DataSync**
- 온프레미스(On-premise)와 AWS 스토리지 서비스 사이 데이터 마이그레이션을 자동화/가속화하는 서비스

>**AWS Firewall Manager**
- AWS shield advanced의 속성, DDos 탐지 강화
- SQL Injection, XSS 공격 등 방어
- Region이 나누어져 있을 경우 일시 중앙에서 생성

>**SQS(Simple Queue Service)**
- 서비스가 커질수록 여러 서버에서 처리하게 되면서, 작업을 분리 할 때 등의 메시지를 주고받을 때 사용하는 서비스

>**오리진 액세스 제한**
- 원본 액세스 제어(OAC), 원본 액세스 ID(OAI) 제공

>**Amazon Athena**
- 표준 SQL을 사용하여 S3의 데이터를 분석하는 대화형 쿼리 서비스
- 서버리스 서비스이므로 일회성 쿼리에 사용

>**Amazon QuickSight**
- Amazon의 셀프 서비스 시각화 인텔리전스(BI) 도구

>**Amazon MSK(Amazon Managed Streaming for Apache Kafka)**
- 완전관리형 Kafka를 통한 실시간 스트리밍 데이터 처리 서비스

![](https://velog.velcdn.com/images/woongaa1/post/eb0ad643-aba9-4930-921f-d30dd1df062e/image.png)

---


