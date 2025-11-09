---
layout:       post
title:        "[DevOps] jenkins - CD ( feat. tomcat )"
date: '2023-07-02'
section: 'infra'
excerpt: 'Jenkins와 Tomcat을 활용한 자동 배포(CD) 파이프라인 구성 방법'
tags: ['Jenkins', 'Tomcat', 'CI/CD', 'Docker']
---

## 서론

CI 파이프라인을 어느 정도 갖춰 놓고 나니, 이제는 "코드가 변경될 때 자동으로 배포까지 흘러가면 좋겠다"는 생각이 들었습니다. 이 글은 Jenkins와 Tomcat을 이용해 Spring Boot 애플리케이션을 자동 배포하는 과정을 단계별로 정리한 기록입니다. 실습 환경은 Docker 기반이며, 전체 흐름을 따라가면 동일한 구성을 재현할 수 있습니다.

## 전체 흐름

1. Tomcat 컨테이너 준비 및 초기 설정
2. Tomcat Manager 접속 권한 구성
3. Jenkins Item에서 빌드·배포 파이프라인 설정
4. Spring Boot 프로젝트를 war로 패키징
5. GitLab → Jenkins → Tomcat으로 이어지는 배포 검증

## 1. Tomcat 컨테이너 실행

```bash
docker pull tomcat
docker run -d --restart=always --name was_tomcat -p 8080:8080 tomcat
```

컨테이너 실행 후 기본 페이지가 404로 보이면 다음처럼 디렉터리를 교체합니다.

```bash
docker exec -it was_tomcat /bin/bash
mv webapps webapps2
mv webapps.dist/ webapps
```

## 2. Tomcat Manager 접근 설정

### 2-1. 관리자 계정 추가

`/usr/local/tomcat/conf/tomcat-users.xml`에 아래 역할(Role)과 사용자(User)를 등록합니다.

```xml
<role rolename="admin"/>
<role rolename="admin-gui"/>
<role rolename="admin-script"/>
<role rolename="manager"/>
<role rolename="manager-gui"/>
<role rolename="manager-script"/>
<role rolename="manager-jmx"/>
<role rolename="manager-status"/>
<user username="admin" password="admin"
      roles="admin,manager,admin-gui,admin-script,manager-gui,manager-script,manager-jmx,manager-status" />
```

### 2-2. 로컬 접근 제한 해제

`webapps/manager/META-INF/context.xml`과 `webapps/host-manager/META-INF/context.xml`에서 `RemoteAddrValve` 부분을 주석처리하면 외부에서도 Manager 페이지에 접속할 수 있습니다.

```xml
<!--
<Valve className="org.apache.catalina.valves.RemoteAddrValve"
       allow="127\.\d+\.\d+\.\d+|::1|0:0:0:0:0:0:0:1" />
-->
```

이제 `http://<Tomcat_IP>:8080/manager/html/`로 접속하면 앞에서 생성한 계정으로 로그인할 수 있습니다.

설정 완료 후 `http://172.16.212.32:8080/manager/html/`에 접속하여 로그인합니다.

![](https://velog.velcdn.com/images/xxng1/post/4e022a98-8785-4080-8b25-313941362608/image.png)

설정한 ID, PASSWORD로 로그인합니다.

## 3. Jenkins Item 구성

Jenkins에서 GitLab과 연동된 Item을 생성한 뒤 다음을 설정했습니다.

### Build 단계

- **Invoke Gradle script** 추가
- `Use Gradle Wrapper`, `Make Gradlew executable` 옵션 활성화

![](https://velog.velcdn.com/images/xxng1/post/878b1e79-7728-45ed-9c04-e7a64d3bc7eb/image.png)

### Deploy 단계

- **Deploy war/ear to a container** 추가
- `**/*.war` 패턴으로 빌드 아티팩트 선택
- Tomcat 8.x Container 추가 후 Credentials에 앞서 만든 `admin` 계정 사용

![](https://velog.velcdn.com/images/xxng1/post/ce7cf08d-73f8-4749-b9f9-fcc0db009c0e/image.png)

## 4. Spring Boot 프로젝트 설정

`build.gradle`에 war 패키징 옵션을 지정했습니다.

```gradle
bootWar {
    archiveBaseName = "test7-api"
    archiveFileName = "test7-api.war"
    archiveVersion = "0.0.0"
}
```

샘플 엔드포인트는 다음과 같이 구성했습니다.

```java
@SpringBootApplication
@RestController
public class TestApplication {

    public static void main(String[] args) {
        SpringApplication.run(TestApplication.class, args);
    }

    @RequestMapping("/")
    String home() {
        return "psw(scott) CI/CD 테스트 출력입니다.";
    }
}
```

`./gradlew bootWar` 실행 시 `/build/libs/test7-api.war`가 생성됩니다.

## 5. 배포 검증

1. 변경 사항을 GitLab에 Push
2. Jenkins가 자동으로 빌드 후 war 파일 배포
3. Tomcat Manager에서 `/demo` 컨텍스트가 등록된 것을 확인
4. `http://<Tomcat_IP>:8080/demo` 접속 → "psw(scott) CI/CD 테스트 출력입니다." 문구 확인

변경 사항을 GitLab에 Push하면 Jenkins가 Job을 실행합니다.

![](https://velog.velcdn.com/images/xxng1/post/bbdd35be-9c57-4a03-b873-b82c8d10a7a2/image.png)

배포 완료 후 `http://172.16.212.32:8080/manager/html/`에서 `Context path`에 `/demo`가 추가된 것을 확인합니다.

![](https://velog.velcdn.com/images/xxng1/post/b7f206f7-de31-46cc-b675-8098110d9a65/image.png)

`http://172.16.212.32:8080/demo`에 접속하면 Spring Boot 애플리케이션이 응답합니다.

![](https://velog.velcdn.com/images/xxng1/post/5fc40d7c-000d-42f3-ab77-812e998beb49/image.png)

## Trouble Shooting 메모

- **.gitignore**: 빌드 결과물을 리포지토리에 올리기 위해 `.gitignore`에서 `build` 항목을 일시 제거했습니다.
- **tomcat-users.xml**: Tomcat Manager는 기본적으로 보안 때문에 외부 접속이 차단되어 있으니, 필요한 권한을 직접 추가해야 합니다.

## 마무리

이 구성을 통해 코드 Push → Jenkins 빌드 → Tomcat 배포까지의 흐름이 완성되었습니다. 환경이 정리되면 Blue/Green, Canary 같은 배포 전략도 Jenkins 파이프라인에서 자연스럽게 확장할 수 있습니다. 다음 단계는 Terraform으로 인프라를 코드화하고, 모니터링을 붙여보는 것입니다.