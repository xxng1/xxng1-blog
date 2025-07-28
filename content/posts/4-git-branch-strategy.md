---
layout:       post
title:        "[Project] 우리 팀에서 사용한 Git Branch 전략"
date: '2024-02-15'
section: 'etc'
# excerpt: ''
# categories: ['Database/redis', 'Go']
---

> Github로 협업하는 과정에서 사용한 우리 팀의 Git-Branch 전략

> https://github.com/DKT-Kwanza/dmarket-back

## Branch
브랜치는 용도에 맞게 **master(main), develop, feature, release, hotfix** 브랜치를 분리해서 사용한다.

메인 브랜치: **master, develop**
보조 브랜치: **feature, release, hotfix**

개발기간이 1달 남짓되는 짧은 기간이었기 때문에, 99% develop, feature 브랜치를 사용했다.

먼저 사진으로 보면 다음과 같다.
![](https://velog.velcdn.com/images/woongaa1/post/76e9f57a-6ebf-489c-a066-d08650231ef9/image.png)

Git Flow 전략을 사용했는데, 각 과정에 대해 자세히 알아보도록 하자.


## 1. 이슈 생성

진행해야 될 작업에 대해서 Issue를 생성한다.
Settings -> Issues > Set up templates 에서 템플릿을 생성할 수 있다.

다음과 같이 작성할 수 있다.
![](https://velog.velcdn.com/images/woongaa1/post/7ef06c7b-02b5-4b8f-9129-9967ab6fc512/image.png) Assignees: 이 작업의 담당자를 설정한다.
Labels: 작업의 특징에 대해 설정한다. ( Labels -> New Labels 로 새로 생성할 수 있다.)

## 2. 브랜치 생성

![](https://velog.velcdn.com/images/woongaa1/post/fb409af9-6f31-4a7a-941b-e300b4bd2a71/image.png) 하단의 Create a branch 를 통해서 브랜치를 생성한다.
기능 개발할 브랜치기 때문에, feature로 만들 수 있도록 하고, (#이슈번호)를 남기는 형태로 생성한다.

## 3. 작업
![](https://velog.velcdn.com/images/woongaa1/post/cc759556-ee54-4917-b70b-734b27aa585c/image.png)
이제, 커밋 메시지에 (#이슈번호)를 적어주게 되면 해당 이슈에 기록이 남는다.

작업을 완료했으면 tasks를 체크해줄 수 있도록 한다.
![](https://velog.velcdn.com/images/woongaa1/post/bffc7d6c-945e-4689-9520-7f27247a556e/image.png)

## 4. PR(Pull Request)
작업이 다 완료되면, PR을 생성한다.
이 때, `-closed #(이슈번호)` 를 통해서 병합이 되었을 때 자동으로 이슈가 닫히도록 한다.

---

이렇게 이슈를 통해서 작업을 진행한 결과 사진이다.
![](https://velog.velcdn.com/images/woongaa1/post/7ad8d5dd-5caf-41a8-8ea7-5c295df0b834/image.png)


라벨을 통해서 내가 한 작업을 볼 수도 있고, 커밋 타입별 작업을 볼 수 있어서 편리하다.
![](https://velog.velcdn.com/images/woongaa1/post/4046504d-082d-4a13-8fdd-2c26159d8a67/image.png)

## 5. Create Release
![](https://velog.velcdn.com/images/woongaa1/post/9c4eb4a9-a23a-42d3-be1b-da2796f55857/image.png)
모든 작업이 종료된 후에는, Releases를 만들어 배포할 수 있도록 했다. 

진행했던 Issue와 작업했던 member를 적어주고, 태그를 생성해 준다.


릴리즈 태그를 통해서 배포할 것이기 때문에,
우리 팀에서 CI/CD에 사용한 Jenkins에서
![](https://velog.velcdn.com/images/woongaa1/post/62e9a085-3c34-4729-b835-b40e43693354/image.png) Brnach Specifier (blank for 'any') 부분을
***/master*** 에서 ***tags/v1.0.0*** 으로 적어주도록 한다.



## 마치며
이슈를 통한 간단한 Github Branch 전략을 정리해 보았다.
Github Actions, Jira 등 협업 전략을 효율적으로 사용하는 많은 방법이 있지만,
시간 관계상 빠르게 전략을 정해야 했기 때문에, 더 나은 방법에 대해서는 차차 알아가보도록 하려고 한다.
