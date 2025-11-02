---
layout:       post
title:        "[DevOps] jenkins - CD ( feat. tomcat )"
date: '2023-07-02'
section: 'infra'
excerpt: 'Jenkins와 Tomcat을 활용한 자동 배포(CD) 파이프라인 구성 방법'
tags: ['Jenkins', 'Tomcat', 'CI/CD', 'Docker']
---

## 서론

**현재 상황**
- 실습자료에서의 CI(지속적 통합) 구축은 완료한 상태
- VM은 2개 있는 상황에서, 1개(was)를 추가 생성

## 시스템 구현 과정

CD를 구현하려면 WAS 서버 및 Jenkins와의 연동이 필요합니다.

### 1. Tomcat 컨테이너 실행

VM에서 Docker 컨테이너로 Tomcat을 실행합니다:

```bash
docker pull tomcat
docker run -d -i -t --restart=always --name was_tomcat -p 8080:8080 tomcat
```

### 2. Tomcat 초기 설정

Tomcat 내에는 배포된 프로젝트를 관리할 수 있는 Manager 페이지가 있습니다. Jenkins의 Credentials 설정에서 ID와 PASSWORD가 필요하므로 이를 설정합니다.

먼저 컨테이너 셸에 이동하여 루트 URL에서의 404 오류를 해결합니다:

```shell
docker exec -it was_tomcat /bin/bash
mv webapps webapps2
mv webapps.dist/ webapps
```

### 3. Tomcat Manager 접근 설정

`http://172.16.212.32:8080/manager/html/`(관리자 페이지)에 접속하기 위한 설정을 진행합니다.

#### ID, PASSWORD 및 권한 설정

`/usr/local/tomcat/conf/tomcat-users.xml`에 다음 내용을 추가합니다:

```xml
<role rolename="admin"/>
<role rolename="admin-gui"/>
<role rolename="admin-script"/>
<role rolename="manager"/>
<role rolename="manager-gui"/>
<role rolename="manager-script"/>
<role rolename="manager-jmx"/>
<role rolename="manager-status"/>
<user username="admin" password="admin" roles="admin,manager,admin-gui,admin-script,manager-gui,manager-script,manager-jmx,manager-status" />
```

#### 내부 로컬에서만 접근 가능하도록 하는 부분 주석처리

`webapps/manager/META-INF/context.xml`과 `webapps/host-manager/META-INF/context.xml`에서 다음 부분을 주석처리합니다:

```xml
<Context antiResourceLocking="false" privileged="true" >
  <CookieProcessor className="org.apache.tomcat.util.http.Rfc6265CookieProcessor"
                   sameSiteCookies="strict" />
  <!-- <Valve className="org.apache.catalina.valves.RemoteAddrValve"
         allow="127\.\d+\.\d+\.\d+|::1|0:0:0:0:0:0:0:1" />
  -->
  <Manager sessionAttributeValueClassNameFilter="java\.lang\.(?:Boolean|Integer|Long|Number|String)|org\.apache\.catalina\.filters\.CsrfPreventionFilter\$LruCache(?:\$1)?|java\.util\.(?:Linked)?HashMap"/>
</Context>
```

설정 완료 후 `http://172.16.212.32:8080/manager/html/`에 접속하여 로그인합니다.

![](https://velog.velcdn.com/images/xxng1/post/4e022a98-8785-4080-8b25-313941362608/image.png)

설정한 ID, PASSWORD로 로그인합니다.

### 4. Jenkins Item 설정

GitLab과 연결해놓았던 Jenkins Item 설정을 진행합니다.

#### Build 단계 설정

SpringBoot(Gradle) Project를 GitLab에 Push할 예정이므로 "Add build step"에서 **"Invoke Gradle script"**를 추가합니다.

- Use Gradle Wrapper: 체크
- Make Gradlew executable: 체크

![](https://velog.velcdn.com/images/xxng1/post/878b1e79-7728-45ed-9c04-e7a64d3bc7eb/image.png)

#### Deploy 단계 설정

"Deploy war/ear to a container" 설정을 추가합니다:
- SpringBoot로 war 파일을 빌드하여 `/demo`로 배포
- Tomcat 8 버전 Container 연결을 위한 Credentials 추가 (ID, PASSWORD는 `tomcat-users.xml`에서 설정한 값 사용)

![](https://velog.velcdn.com/images/xxng1/post/ce7cf08d-73f8-4749-b9f9-fcc0db009c0e/image.png)

> **참고**: `**/*.war`는 Jenkins에서 빌드된 war 파일을 가져오는 경로입니다.

### 5. SpringBoot 프로젝트 설정

SpringBoot의 `build.gradle` 파일에 다음 내용을 추가합니다:

```gradle
bootWar {
    archiveBaseName = "test7-api"
    archiveFileName = "test7-api.war"
    archiveVersion = "0.0.0"
}
```

**gradle > tasks > build > bootWar**을 실행하면 (`./gradlew bootWar` 명령어 실행)

`/build/libs` 디렉토리에 `test7-api.war` 파일이 생성됩니다.

루트 디렉토리에서 간단하게 테스트하기 위해 `TestApplication.java` 파일에 다음 내용을 추가합니다:

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

### 6. 배포 테스트

변경사항 저장 후 GitLab에 Push하면:

![](https://velog.velcdn.com/images/xxng1/post/bbdd35be-9c57-4a03-b873-b82c8d10a7a2/image.png)

실습해서 구현한 CI를 Jenkins에서 CD할 준비를 하는 것을 볼 수 있습니다.

배포 완료 후 `http://172.16.212.32:8080/manager/html/`에서 "Deploy war/ear to a container"의 "Context path"에 작성했던 `/demo` 경로가 추가되어 있는 것을 확인할 수 있습니다.

![](https://velog.velcdn.com/images/xxng1/post/b7f206f7-de31-46cc-b675-8098110d9a65/image.png)

`http://172.16.212.32:8080/demo` 경로로 접속하면 SpringBoot Application에서 설정한 내용을 확인할 수 있습니다.

![](https://velog.velcdn.com/images/xxng1/post/5fc40d7c-000d-42f3-ab77-812e998beb49/image.png)

## Trouble Shooting

### .gitignore

SpringBoot 프로젝트에서 빌드된 war 파일을 가져오기 위해서 `build` 디렉토리가 GitLab에 push되길 원했는데, 되지 않아서 방법을 찾던 중 `.gitignore` 파일에서 `build` 내용을 삭제해주었더니 `build` 디렉토리가 push되었습니다.

### tomcat-users.xml

Tomcat의 manager 기능은 보안 관련 문제 때문에 통제되어 있다는 사실을 알았습니다. 브라우저 및 외부에서 접속하는 경우에는 권한을 추가해주어야 합니다.