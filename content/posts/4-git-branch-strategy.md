---
layout:       post
title:        "[Project] 우리 팀에서 사용한 Git Branch 전략"
date: '2024-02-15'
section: 'etc'
excerpt: 'Github 협업을 위한 Git Flow 전략 및 Branch 관리 방법'
tags: ['Git', 'Collaboration', 'Github']
---

Github로 협업하는 과정에서 사용한 우리 팀의 Git-Branch 전략

[Github Repository](https://github.com/DKT-Kwanza/dmarket-back)

## 우리가 사용한 브랜치 구조

- **메인 브랜치**: `master`, `develop`
- **보조 브랜치**: `feature`, `release`, `hotfix`

실제 개발 기간이 짧았기 때문에 대부분의 작업은 `develop`과 `feature`에서 일어났습니다. 구조 자체는 전형적인 Git Flow지만, 어떻게 굴렸는지 과정을 따라가며 설명합니다.

![](https://velog.velcdn.com/images/woongaa1/post/76e9f57a-6ebf-489c-a066-d08650231ef9/image.png)

## 1. 이슈부터 시작하기

모든 작업은 이슈 생성에서 출발했습니다. GitHub Issue 템플릿을 만들어 두면 담당자(Assignee)와 라벨을 빠르게 지정할 수 있어 좋았습니다. 이슈에 할 일을 체크리스트로 적어두면 나중에 PR에서 자동으로 연결됩니다.

![](https://velog.velcdn.com/images/woongaa1/post/7ef06c7b-02b5-4b8f-9129-9967ab6fc512/image.png)

## 2. 작업 브랜치 생성

이슈가 만들어지면 `feature/<이슈번호-핵심>` 형식으로 브랜치를 생성했습니다. GitHub의 "Create a branch" 버튼을 이용하면 UI에서 바로 만들 수 있어 편했습니다.

![](https://velog.velcdn.com/images/woongaa1/post/fb409af9-6f31-4a7a-941b-e300b4bd2a71/image.png)

## 3. 커밋과 작업 기록

커밋 메시지에 `#이슈번호`를 붙이면 GitHub가 자동으로 이슈와 연결해 줍니다. 체크리스트에 맞춰 작업을 진행하고 완료한 항목은 바로 체크했습니다. 이렇게 하면 진행 상황을 팀 전체가 실시간으로 파악할 수 있었습니다.

![](https://velog.velcdn.com/images/woongaa1/post/cc759556-ee54-4917-b70b-734b27aa585c/image.png)
![](https://velog.velcdn.com/images/woongaa1/post/bffc7d6c-945e-4689-9520-7f27247a556e/image.png)

## 4. Pull Request로 리뷰 요청

작업이 끝나면 PR을 만들고, `close #이슈번호` 문구를 넣어 병합 시 이슈가 자동으로 닫히도록 했습니다. 라벨을 붙여두면 어떤 종류의 변경인지 한눈에 들어와서 리뷰하기가 훨씬 수월했습니다.

![](https://velog.velcdn.com/images/woongaa1/post/7ad8d5dd-5caf-41a8-8ea7-5c295df0b834/image.png)
![](https://velog.velcdn.com/images/woongaa1/post/4046504d-082d-4a13-8fdd-2c26159d8a67/image.png)

## 5. Release로 마무리

모든 기능이 모이면 실제 배포용 태그를 생성했습니다.

1. GitHub Releases에서 태그와 릴리스 노트를 작성
2. 포함된 이슈와 담당 멤버를 정리
3. Jenkins의 `Branch Specifier`를 `tags/v1.0.0`처럼 태그를 바라보도록 변경

![](https://velog.velcdn.com/images/woongaa1/post/9c4eb4a9-a23a-42d3-be1b-da2796f55857/image.png)
![](https://velog.velcdn.com/images/woongaa1/post/62e9a085-3c34-4729-b835-b40e43693354/image.png)

## 사용하며 느낀 점

- 라벨을 잘 정의해 두면 팀 내 작업 분류가 명확해집니다.
- 체크리스트 기반 커밋은 작업 누락을 줄여 줍니다.
- 시간에 쫓기더라도 최소한의 프로세스를 갖춰야 나중에 대규모 리팩토링이나 핫픽스가 필요할 때 흔들리지 않습니다.

## 마치며

이번 전략은 빠르게 결정을 내려야 했던 상황에서 선택한 현실적인 타협안입니다. 차후에는 Github Actions, Jira 등을 연계해 자동화와 협업 수준을 한 단계 더 끌어올리고 싶습니다. 비슷한 상황에 있는 팀이라면 가볍게 참고해 보세요.
