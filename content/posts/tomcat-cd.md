---
layout:       post
title:        "jenkins - CD ( feat. tomcat )"
date: '2023-07-02'
excerpt: ''
---

## 서론
- 현재 상황
    - 실습자료에서의 CI(지속적 통합) 구축은 완료한 상태이다
    - VM은 2개 있는 상황에서, 1개(was)를 추가 생성하였다.
    - 30-psw-Gitlab, 31-psw-Jenkins, 32-psw-was(추가생성)로 구축하였다.

## 시스템 구현 과정

CD를 구현하려면, was 서버 및 Jenkins와의 연동이 필요했다.

그러므로 먼저 VM에서 docker 컨테이너로의 tomcat을 실행시켜주었다.

```bash
docker pull tomcat
docker run -d -i -t --restart=always --name was_tomcat 
-p 8080:8080 tomcat
```

Tomcat 내에는 배포된 프로젝트를 관리할 수 있는 페이지가 있는데, 이를 확인함과 동시에 Jenkins의 Credentials설정에서 ID와 PASSWD가 필요하므로 이를 설정해주도록 한다.
우선 컨테이너 셸에 이동해서, 루트 url에서의 404 오류를 먼저 없애주었다.

```bash
docker exec -it was_tomcat /bin/bash
mv webapps webapps2
mv webapps.dist/ webapps
```

후에는 “http://172.16.212.32:8080/manager/html/”(관리자 페이지)에 접속하기 위한 설정을 해주었다. 

***(*ID, PASSWORD 및 권한 설정)**

`/usr/local/tomcat/conf/tomcat-users.xml` 에 추가

```bash
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

**(내부 로컬에서만 접근이 가능하도록 하는 부분을 주석처리)**

`webapps/manager/META-INF/context.xml and /webapps/host-manager/META-INF/context.xml` 에 처리

```
<Context antiResourceLocking="false" privileged="true" >
  <CookieProcessor className="org.apache.tomcat.util.http.Rfc6265CookieProcessor"
                   sameSiteCookies="strict" />
  <!-- <Valve className="org.apache.catalina.valves.RemoteAddrValve"
         allow="127\.\d+\.\d+\.\d+|::1|0:0:0:0:0:0:0:1" />
  -->
  <Manager sessionAttributeValueClassNameFilter="java\.lang\.(?:Boolean|Integer|Long|Number|String)|org\.apache\.catalina\.filters\.CsrfPreventionFilter\$LruCache(?:\$1)?|java\.util\.(?:Linked)?HashMap"/>
</Context>
```

후에 접속하여 로그인한다.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/3d55a4ef-0757-4da2-b3ab-756df0263ba3/612c75dd-a6c1-4b92-98f4-a38958022f81/Untitled.png)

설정한 id, password로 로그인한다.

후에는 GitLab과 연결해놓았던 Jenkins Item 설정을 할 수 있도록 했다.

우선 나는 SpringBoot(Gradle) Project를 GitLab에 Push할 예정이므로 “**Add built step**”에서 “**Invoke Gradle script”**를 추가했다. 후에 Use Gradle Wrapper, Make Gradlew executable을 설정했다.

 

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/3d55a4ef-0757-4da2-b3ab-756df0263ba3/7430555e-1acc-4b9d-9e97-3f87636db8d9/Untitled.png)

후에는 “**Deploy war/ear to a container**” 설정을 했다.

SpringBoot로 war파일을 빌드해서 /demo로 베포한다는 내용 및,

Tomcat 8버전 Container 연결을 위한 Credentials도 추가해주었다( ID, PASSWORD 는 `tomcat-users.xml` 에서 설정한 값 )

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/3d55a4ef-0757-4da2-b3ab-756df0263ba3/76a83aa3-26a5-43c4-ad31-43266796d69a/Untitled.png)

후에는 GitLab에 파일을 Push하여 빌드/베포가 되는지 확인한다.

`**/*.war` 는 젠킨스에서 빌드된 war 파일을 가지고 온다.

springboot 의 **build.gradle** 파일에 밑의 내용을 추가한다.

```
bootWar{
    archiveBaseName = "test7-api"
    archiveFileName = "test7-api.war"
    archiveVersion = "0.0.0"
}
```

### 후에 **gradle > tasks > build > bootWar**을 실행하면 ( = **./gradlew bootWar** 명령어 실행)

war파일이 생성되는 디렉토리( /build/libs )에 test7-api.war 라는 이름의 war파일이 생성된다.

루트 디렉토리에서 간단하게 테스트하기위해 TestApplication.java 파일에 밑의 내용을 추가시켜줬다.

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

변경사항 저장 후 gitLab에 push 하면

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/3d55a4ef-0757-4da2-b3ab-756df0263ba3/fda89128-53db-4e74-ab43-15e0cfc70e9a/Untitled.png)

실습해서 구현한 CI를 Jenkins 에서 CD할 준비를 하는 것을 볼 수 있다.

후에 완료가 되면, http://172.16.212.32:8080/manager/html/ 파일에서

“**Deploy war/ear to a container**”에서의 “**Context path**”에서 작성했던 /demo 경로가 추가되어 있는것을 볼 수 있다

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/3d55a4ef-0757-4da2-b3ab-756df0263ba3/4832349a-9ea3-4cfc-9c44-1d2f4a4d437c/Untitled.png)

## 결론(구축결과 및 느낀점)

- **구축결과**
    - 해당 /demo 경로로 접속해보면 SpringBoot Application 파일에서 경로설정했던 내용을 볼 수 있다.
        
        ![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/3d55a4ef-0757-4da2-b3ab-756df0263ba3/1d64f304-ded3-4a0a-8600-5853fd6bef14/Untitled.png)
        
- **Trouble Shooting**
    - .gitignore
        - SpringBoot 프로젝트에서 빌드된 war 파일을 가져오기 위해서 build 디렉토리가 gitLab에 push되길 원했는데, 되지 않아서 방법을 찾던 중 .gitignore파일에서 build 내용을 삭제해주었더니 build 디렉토리가 push 되었다.
    - tomcat-users.xml
        - tomcat 의 manager 기능은 보안 관련 문제 때문에 통제되어있다는 사실을 알았다. brower 및 외부에서 접속하는 경우에는 권한을 추가해주어야 한다.