---
layout:       post
title:        "Jenkins와 Tomcat을 활용한 자동 배포(CD)"
date: '2023-07-02'
section: 'infra'
excerpt: 'Docker 기반 Spring Boot 애플리케이션 자동 배포 파이프라인 구성'
tags: ['Jenkins', 'Tomcat', 'CI/CD', 'Docker']
---

Jenkins와 Tomcat을 이용해 Spring Boot 애플리케이션을 자동 배포하는 과정

<br>

# ☑️ 전체 흐름

1. Tomcat 컨테이너 준비 및 초기 설정
2. Tomcat Manager 접속 권한 구성
3. Jenkins Item에서 빌드·배포 파이프라인 설정
4. Spring Boot 프로젝트를 war로 패키징
5. GitLab → Jenkins → Tomcat으로 이어지는 배포 검증

<br>

# ☑️ 1. Tomcat 컨테이너 실행

- 컨테이너 실행
```bash
docker pull tomcat
docker run -d --restart=always --name was_tomcat -p 8080:8080 tomcat
```

<br>


- 컨테이너 실행 후 기본 페이지가 404로 보이면 다음처럼 디렉터리를 교체.

```bash
docker exec -it was_tomcat /bin/bash
mv webapps webapps2
mv webapps.dist/ webapps
```

<br>

# ☑️ 2. Tomcat Manager 접근 설정

### 2-1. 관리자 계정 추가

`/usr/local/tomcat/conf/tomcat-users.xml`에 아래 역할(Role)과 사용자(User)를 등록.

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

<br>

### 2-2. 로컬 접근 제한 해제

`webapps/manager/META-INF/context.xml`과 `webapps/host-manager/META-INF/context.xml`에서 `RemoteAddrValve` 부분을 주석처리하면 외부에서도 Manager 페이지에 접속할 수 있다.

```xml
<!--
<Valve className="org.apache.catalina.valves.RemoteAddrValve"
       allow="127\.\d+\.\d+\.\d+|::1|0:0:0:0:0:0:0:1" />
-->
```

이제 `http://<Tomcat_IP>:8080/manager/html/`로 접속하면 앞에서 생성한 계정으로 로그인할 수 있다.

<br>

- 설정 완료 후 `http://172.16.212.32:8080/manager/html/`에 접속하여 로그인

![](https://velog.velcdn.com/images/xxng1/post/4e022a98-8785-4080-8b25-313941362608/image.png)

<br>

# ☑️ 3. Jenkins Item 구성

Jenkins에서 GitLab과 연동된 Item을 생성한 후 단계별 설정.

### Build 단계

- **Invoke Gradle script** 추가
- `Use Gradle Wrapper`, `Make Gradlew executable` 옵션 활성화

![](https://velog.velcdn.com/images/xxng1/post/878b1e79-7728-45ed-9c04-e7a64d3bc7eb/image.png)

<br>

### Deploy 단계

- **Deploy war/ear to a container** 추가
- `**/*.war` 패턴으로 빌드 아티팩트 선택
- Tomcat 8.x Container 추가 후 Credentials에 앞서 만든 `admin` 계정 사용

![](https://velog.velcdn.com/images/xxng1/post/ce7cf08d-73f8-4749-b9f9-fcc0db009c0e/image.png)

<br>


# ☑️ 4. Spring Boot 프로젝트 설정

`build.gradle`에 war 패키징 옵션을 지정.

```gradle
bootWar {
    archiveBaseName = "test7-api"
    archiveFileName = "test7-api.war"
    archiveVersion = "0.0.0"
}
```

<br>


- 샘플 엔드포인트 구성
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

`./gradlew bootWar` 실행 시 `/build/libs/test7-api.war`가 생성된다.


<br>


# ☑️ 5. 배포 검증

1. 변경 사항을 GitLab에 Push
2. Jenkins가 자동으로 빌드 후 war 파일 배포
3. Tomcat Manager에서 `/demo` 컨텍스트가 등록된 것을 확인
4. `http://<Tomcat_IP>:8080/demo` 접속 → "psw(scott) CI/CD 테스트 출력입니다." 문구 확인

변경 사항을 GitLab에 Push하면 Jenkins가 Job을 실행합니다.

![](https://velog.velcdn.com/images/xxng1/post/bbdd35be-9c57-4a03-b873-b82c8d10a7a2/image.png)

<br>


배포 완료 후 `http://172.16.212.32:8080/manager/html/`에서 `Context path`에 `/demo`가 추가된 것을 확인합니다.

![](https://velog.velcdn.com/images/xxng1/post/b7f206f7-de31-46cc-b675-8098110d9a65/image.png)

<br>


`http://172.16.212.32:8080/demo`에 접속하면 Spring Boot 애플리케이션이 응답합니다.

![](https://velog.velcdn.com/images/xxng1/post/5fc40d7c-000d-42f3-ab77-812e998beb49/image.png)


<br>


# ☑️ TroubleShooting

- **.gitignore**: SpringBoot 프로젝트에서 빌드된 war 파일을 가져오기 위해서 build 디렉토리가 gitLab에 push되길 원했는데, 되지 않아서 방법을 찾던 중 .gitignore파일에서 build 내용을 삭제해주었더니 build 디렉토리가 push 되었다.

- **tomcat-users.xml**: tomcat 의 manager 기능은 보안 관련 문제 때문에 통제되어있다는 사실을 알았다. brower 및 외부에서 접속하는 경우에는 권한을 추가해주어야 한다.