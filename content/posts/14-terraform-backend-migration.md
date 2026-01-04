---
layout:       post
title:        "terraform.tfstate 파일 Backend로 관리하기"
date: '2026-01-04'
section: 'infra'
excerpt: 'Terraform State Backend 마이그레이션 (local → S3+DynamoDB → S3 Native Lock)'
tags: ['Terraform', 'Cloud', 'S3', 'DynamoDB']
githubUrl: 'https://github.com/xxng1/terraform-backend-migration'
---

Terraform은 IaC(Infrastructure as Code)를 통해 리소스를 관리한다. 이 과정에서 `terraform.tfstate` 파일은 실제 프로비저닝된 리소스의 현재 상태를 기록하는 핵심 메타데이터이다.

Terraform은 코드에 선언된 리소스와 `tfstate` 파일을 비교하여 변경사항을 감지하고, `terraform apply`를 실행 할 때 실제 인프라와의 차이를 동기화한다. 이 파일에는 리소스 ID, 속성 값, 민감 정보 등이 포함되므로 보안상 Git 등에 업로드 하지 않는다.

개인 프로젝트나 개발 환경에서는 로컬에서의 `tfstate` 파일로 충분하지만, **협업 환경**에서는 **동시성 문제**, **State 불일치 문제** 등 때문에, 원격 백엔드(Remote Backend)를 통해 State를 중앙 관리한다.

<br>

---

Terraform은 본래 **AWS S3**를 원격 상태 저장소로 사용하고, **AWS DynamoDB** 테이블을 State Locking 메커니즘으로 활용해서 동시 작업을 보장해왔는데, S3가 조건부 쓰기 기능을 지원하게 되면서 DynamoDB는 사용하지 않게 되었다.


![](/blog-images/14/docs.png)
<sub>[docs: State Locking](https://developer.hashicorp.com/terraform/language/backend/s3#state-locking)</sub>

이에 도입 된 것이 Terraform **S3 Native Lock**인데, `use_lockfile = true` 옵션을 통해 S3만 사용해서 State Locking을 구현하는 방식이다.


이 글에서는 Terraform State Backend를 아래 단계로 구성하려고 한다.
1. **Local** 환경에서 tfstate 구축
2. **Local → S3+DynamoDB** 환경으로 마이그레이션
3. **S3+DynamoDB → S3 Native Lock** 환경으로 마이그레이션


<br>

# ☑️ 1. 로컬 백엔드로 시작

먼저 로컬 백엔드를 사용하여 리소스를 생성하고, State 파일이 로컬 디렉토리에 저장되는 것을 확인한다. 이 단계에서는 백엔드 설정 없이 기본 동작을 확인한다.

## 1-1. 리소스 생성

```bash
cd 00-local-backend
terraform init
terraform plan
terraform apply
```

**생성되는 리소스**
- S3 버킷: `sangwoong-tf-state-v1` (나중에 백엔드로 사용)
- DynamoDB 테이블: `terraform-lock` (나중에 백엔드로 사용)
- VPC 인프라: VPC, Subnet, Internet Gateway 등

**백엔드 설정:**
- `backend.tf` 파일 없음 → 기본적으로 로컬 백엔드 사용
- State 파일은 로컬에 `terraform.tfstate`로 저장됨

<br>

## 1-2. 로컬 State 파일 확인

```bash
# State 파일 내용 확인
terraform state list
```

![](/blog-images/14/terraform_state_list.png)

<br>


# ☑️ 2. S3 + DynamoDB 백엔드로 마이그레이션

로컬에 저장된 State를 AWS S3와 DynamoDB를 활용한 원격 백엔드로 마이그레이션한다.  
이 방식은 State 파일을 S3에 저장하고, DynamoDB 테이블을 통해 State Locking을 구현한다.

## 2-1. State 파일 복사 및 마이그레이션

```bash
# 01 디렉토리로 이동
cd 01-s3-dynamodb-backend

# 00 디렉토리의 State 파일을 현재 디렉토리로 복사 (중요)
cp ../00-local-backend/terraform.tfstate .

# 초기화 및 마이그레이션 실행
terraform init
```

**동작 원리**
- `terraform init` 실행 시 Terraform은 현재 디렉토리의 `terraform.tfstate` 파일을 감지한다.
- 동시에 `backend.tf`에 정의된 S3 백엔드 설정을 확인한다.

 → **로컬에 State 파일이 있고, 동시에 원격 백엔드(S3) 설정도 존재하는 경우**, 기존 로컬 State를 새로운 S3 백엔드로 복사하길 원하냐는 마이그레이션 프롬프트를 표시한다.

![](/blog-images/14/terraform_init_backend.png)
<sub>State 마이그레이션 프롬프트</sub>

<br>


`01-s3-dynamodb-backend` 단계 코드에도 S3 버킷과 DynamoDB 테이블 정의가 있다.

따라서 `terraform plan` 시 불필요한 destroy가 발생하지 않으며, 리소스는 그대로 유지된 채 백엔드만 이동한다.

![](/blog-images/14/terraform_plan_nochange.png)
<sub>terraform plan: No changes</sub>

<br>

## 2-2. 백엔드 설정 확인

`backend.tf` 파일 내용:

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # S3 + DynamoDB 백엔드 설정
  backend "s3" {
    bucket         = "sangwoong-tf-state-v1"
    key            = "terraform/terraform.tfstate"
    region         = "ap-northeast-2"
    dynamodb_table = "terraform-lock"
    encrypt        = true
  }
}
```

**백엔드 설정**
- State 파일은 `s3://sangwoong-tf-state-v1/terraform/terraform.tfstate`에 저장
- State Lock은 DynamoDB 테이블 `terraform-lock` 사용

<br>

## 2-3. 검증 절차

### DynamoDB Lock & 동시성 검증

```bash
cd 01-s3-dynamodb-backend
terraform apply
# "yes"를 입력하기 전에 대기
```
`terraform apply`명령어 실행 후, "yes"를 입력하기전에 대기한다 (Lock 상태)

AWS DynamoDB → `terraform-lock` 테이블 → 항목 탐색에서, LockID 항목이 생성된 것을 확인

![](/blog-images/14/그룹1.png)
<sub>DynamoDB Console</sub>

<br>

추가로, 터미널을 추가 실행해 동시성을 검증한다.

![](/blog-images/14/terminal_s3_dynamo.png)
<sub>동시성 검증(State Lock 충돌)</sub>

<br>


# ☑️ 3. S3 Native Lock으로 마이그레이션


Terraform v1.10.0 이상이어야 한다.



## 3-1. 마이그레이션 실행

`terraform init -reconfigure`는 Terraform을 초기화할 때, 기존에 저장된 백엔드(Backend) 연결 설정을 무시하고 현재 작성된 설정 파일(.tf)을 기준으로 강제로 다시 설정하는 명령어이다.

```bash
cd ../02-s3-native-lock

# 초기화 (Reconfigure 옵션)
terraform init -reconfigure
```

S3 Natvie Lock 단계에서는 Backend 블록의 설정(DynamoDB 제거, `use_lockfile` 추가)이 변경되기 때문에 Terraform 백엔드를 재설정해 줘야 한다.

![](/blog-images/14/terraform_init_reconfigure.png)
<sub>terraform init -reconfigure 명령</sub>

<br>

## 3-2. 백엔드 설정 변경 사항

`backend.tf` 파일 내용:

```hcl
terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # S3 Native Lock 백엔드 설정 (DynamoDB 제거)
  backend "s3" {
    bucket         = "sangwoong-tf-state-v1"
    key            = "terraform/terraform.tfstate"
    region         = "ap-northeast-2"
    # dynamodb_table = "terraform-lock" # 제거됨
    use_lockfile   = true             # S3 Native Lock 활성화 (v1.10+)
    encrypt        = true
  }
}
```

**변경 사항**
- `dynamodb_table` 제거
- `use_lockfile = true` 추가 (S3 Native Lock 활성화)
- `required_version = ">= 1.10.0"` 추가

<br>



## 3-3. 검증 절차

### S3 Native Lock

```bash
cd 02-s3-native-lock
terraform apply
# "yes"를 입력하기 전에 대기
```

마찬가지로, `terraform apply`명령어 실행 후, "yes"를 입력하기전에 대기한다 (Lock 상태)

AWS S3 → `sangwoong-tf-state-v1` 버킷에서, `terraform.tfstate.tflock` 항목이 생성된 것을 확인

![](/blog-images/14/그룹2.png)
<sub>S3 Console</sub>

<br>

`terraform apply` 명령어 실행/종료 후, S3의 `.tflock` 파일이 자동으로 삭제됨을 확인한다.

![](/blog-images/14/nonobj.png)
<sub>terraform.tfstate.tflock 파일 새로고침</sub>

<br>

---

# ✚ 같은 디렉토리에서 마이그레이션하는 경우

실제 프로덕션 환경에서는 디렉토리를 분리하지 않고, 같은 프로젝트 디렉토리 내에서 백엔드를 변경하는 경우가 많은데, 이 경우 `-migrate-state` 옵션을 사용하여 더 간편하게 마이그레이션할 수 있다.

```bash
# 1단계: 로컬 백엔드로 시작
terraform init
terraform apply
# → terraform.tfstate 파일이 로컬에 생성됨

# 2단계: backend.tf 파일 추가 (S3 백엔드 설정)
# backend.tf 파일 생성/수정

# 3단계: 백엔드 마이그레이션
terraform init -migrate-state
# → 같은 디렉토리의 terraform.tfstate를 S3로 자동 마이그레이션
```

<br>

---


<sub>[참고 자료1 - AWS: S3 조건부 쓰기 지원](https://aws.amazon.com/ko/about-aws/whats-new/2024/08/amazon-s3-conditional-writes/) 
</sub>

<sub>[참고 자료2 - Terraform PR #35661: S3-native state locking](https://github.com/hashicorp/terraform/pull/35661)
</sub>

