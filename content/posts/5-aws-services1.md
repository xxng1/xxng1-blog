---
layout:       post
title:        "AWS SAA-C03 Services"
date: '2024-04-11'
section: 'infra'
excerpt: 'AWS Certified Solutions Architect - Associate 시험을 공부하며 많이 봤던 서비스들 정리'
tags: ['AWS', 'Network', 'Cloud']
---

AWS 서비스 중 AWS SAA 시험에서 자주 언급되는 서비스들 정리. 

<br>

# ☑️ 네트워크 & 트래픽 제어

| 서비스 | 핵심 포인트 | 활용 메모 |
| --- | --- | --- |
| **ALB** | HTTP/HTTPS 로드 밸런서 | 리스너 규칙으로 HTTP를 HTTPS로 리디렉션 |
| **NLB** | 4계층(TCP/UDP) 로드 밸런서 | TLS Listener 구성으로 보안 강화 |
| **Gateway Load Balancer** | 보안/네트워크 어플라이언스 통합 | VPC 간 트래픽을 투명하게 전달 |
| **NAT Gateway** | 사설 서브넷 아웃바운드 인터넷 통신 | 퍼블릭 서브넷에 배치 |
| **Route 53** | DNS 관리 | 도메인 라우팅 및 헬스 체크 |
| **CloudFront** | CDN | 전 세계 Edge Location으로 콘텐츠 전송 |

<br>

# ☑️ 파일 전송 & 하이브리드 연결

- **SFTP (AWS Transfer Family)**: 파트너사와 파일을 안전하게 주고받을 때 사용
- **SMB 지원**: Storage Gateway, Amazon FSx로 온프레미스와 파일 시스템 연동
- **DataSync**: 온프레미스 ↔ AWS 스토리지 간 데이터 마이그레이션 자동화


<br>

# ☑️ 컴퓨트 & 컨테이너

| 서비스 | 설명 |
| --- | --- |
| **EC2** | 가장 기본적인 가상 서버. 세밀한 제어가 필요할 때 사용 |
| **Lambda** | 이벤트 기반 서버리스 함수. 운영 부담이 거의 없음 |
| **ECS / Fargate** | 컨테이너 오케스트레이션. Fargate는 서버 관리가 필요 없는 모드 |
| **EKS** | 완전 관리형 Kubernetes. Pod 단위 IAM 권한 부여 가능 |
| **Elastic Beanstalk** | EC2 구성을 자동화해주는 PaaS. 빠른 배포와 테스트에 유용 |
| **Lightsail** | 간단한 애플리케이션을 위한 가벼운 VPS |

<br>

# ☑️ 스토리지 & 데이터베이스

| 서비스 | 특징 |
| --- | --- |
| **S3** | 이미지, 동영상 등 정적 자산 저장소 |
| **Glacier** | 장기 보관용 아카이브 스토리지 (저가 / 느린 조회) |
| **EBS** | EC2 전용 디스크. 스냅샷으로 백업 가능 (단일 AZ) |
| **EFS** | 다중 AZ 지원 네트워크 파일 시스템 |
| **RDS** | 관리형 관계형 데이터베이스 |
| **DynamoDB** | 서버리스 NoSQL 데이터베이스 |
| **ElastiCache** | 메모리 기반 캐시 (Redis, Memcached) |
| **Redshift** | 대규모 데이터 웨어하우스 |

<br>

# ☑️ 애널리틱스 & 검색

- **Athena**: S3 데이터를 표준 SQL로 분석하는 서버리스 쿼리 서비스
- **Glue**: ETL 작업을 자동화하는 서버리스 데이터 통합 도구
- **Kinesis**: 실시간 스트리밍 데이터 수집 및 처리
- **EMR**: Hadoop 기반 빅데이터 처리 플랫폼
- **QuickSight**: BI 대시보드. Tableau처럼 시각화 제공
- **CloudSearch**: 완전 관리형 검색 서비스


<br>

# ☑️ 메시징 & 이벤트

- **SNS**: 다대다 메시징(A2A) 및 문자·메일 같은 A2P 알림을 모두 지원
- **SQS**: 비동기 처리 큐. 마이크로서비스 간 작업을 분리할 때 활용
- **EventBridge**: CloudWatch Events의 확장판. 서비스 간 이벤트 라우팅을 단일 도구로 정리


<br>

# ☑️ 보안 & 운영

- **AWS Firewall Manager**: WAF, Shield Advanced 정책을 중앙에서 관리
- **AWS Shield / WAF**: DDoS 공격과 웹 공격(SQL Injection, XSS 등) 방어
- **Origin Access Control / Identity**: CloudFront에서 원본 접근을 제한해 보안 강화

<br>

# ☑️ AI & 미디어 서비스

- **Polly**: 텍스트를 자연스러운 음성으로 변환(TTS)
- **Lex**: 대화형 챗봇 서비스
- **Rekognition**: 이미지·영상 분석

<br>


# ☑️ Kafka & 스트리밍

- **Amazon MSK**: 완전 관리형 Apache Kafka. 스트리밍 데이터 파이프라인 구축에 적합

![AWS 서비스 개요](https://velog.velcdn.com/images/woongaa1/post/eb0ad643-aba9-4930-921f-d30dd1df062e/image.png)