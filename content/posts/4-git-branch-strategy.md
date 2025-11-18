---
layout:       post
title:        "우리 팀에서 사용한 Git Branch 전략"
date: '2024-02-15'
section: 'etc'
excerpt: 'Github 협업을 위한 Git Flow 전략 및 Branch 관리 방법'
tags: ['Git', 'Collaboration', 'Github']
---

Github로 협업하는 과정에서 사용한 우리 팀의 Git-Branch 전략

[Github Repository](https://github.com/DKT-Kwanza/dmarket-back)

<br>

# ☑️ 우리가 사용한 브랜치 구조

- **메인 브랜치**: `master`, `develop`
- **보조 브랜치**: `feature`, `release`, `hotfix`

실제 개발 기간이 짧았기 때문에 대부분의 작업은 `develop`과 `feature`에서 일어났다.

구조 자체는 전형적인 Git Flow 이다.

![](https://velog.velcdn.com/images/woongaa1/post/76e9f57a-6ebf-489c-a066-d08650231ef9/image.png)

<br>


# ☑️ 1. 이슈 생성

모든 작업은 이슈 생성에서 출발했고, GitHub Issue 템플릿을 만들어 두어서 담당자(Assignee)와 라벨을 지정할 수 있도록 했다. 이슈에 할 일을 체크리스트로 적어두면 나중에 PR에서 자동으로 연결된다.

![](https://velog.velcdn.com/images/woongaa1/post/7ef06c7b-02b5-4b8f-9129-9967ab6fc512/image.png)


<br>


# ☑️ 2. 작업 브랜치 생성

이슈가 만들어지면 `feature/<이슈번호-핵심>` 형식으로 브랜치를 생성했다. GitHub의 "Create a branch" 버튼을 이용하면 UI에서 바로 만들 수 있다.

![](https://velog.velcdn.com/images/woongaa1/post/fb409af9-6f31-4a7a-941b-e300b4bd2a71/image.png)

<br>

# ☑️ 3. 커밋과 작업 기록

커밋 메시지에 `#이슈번호`를 붙이면 GitHub가 자동으로 이슈와 연결해 준다. 체크리스트에 맞춰 작업을 진행하고 완료한 항목은 바로 체크하도록 했다. 이렇게 해서 진행 상황을 팀 전체가 파악할 수 있었다.

![](https://velog.velcdn.com/images/woongaa1/post/cc759556-ee54-4917-b70b-734b27aa585c/image.png)
![](https://velog.velcdn.com/images/woongaa1/post/bffc7d6c-945e-4689-9520-7f27247a556e/image.png)


<br>


# ☑️ 4. Pull Request로 리뷰 요청


작업이 끝나면 PR을 만들고, `close #이슈번호` 문구를 넣어 병합 시 이슈가 자동으로 닫히도록 했다. 라벨을 붙여놔서 어떤 종류의 변경인지 리뷰할 수 있도록 했다.

![](https://velog.velcdn.com/images/woongaa1/post/7ad8d5dd-5caf-41a8-8ea7-5c295df0b834/image.png)
![](https://velog.velcdn.com/images/woongaa1/post/4046504d-082d-4a13-8fdd-2c26159d8a67/image.png)

<br>

# ☑️ 5. Release로 마무리

모든 기능이 모이면 실제 배포용 태그를 생성한다.

1. GitHub Releases에서 태그와 릴리스 노트를 작성
2. 포함된 이슈와 담당 멤버를 정리
![](https://velog.velcdn.com/images/woongaa1/post/9c4eb4a9-a23a-42d3-be1b-da2796f55857/image.png)

<br>

- 추가로, **Jenkins**의 `Branch Specifier`를 `tags/v1.0.0`처럼 태그를 바라보도록 변경해서 릴리즈 배포를 진행했다.
![](https://velog.velcdn.com/images/woongaa1/post/62e9a085-3c34-4729-b835-b40e43693354/image.png)

