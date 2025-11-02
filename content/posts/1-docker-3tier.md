---
layout:       post
title:        "[DevOps] WAS - DB connect ( feat. docker )"
date: '2023-06-15'
section: 'infra'
excerpt: 'Docker 컨테이너를 활용한 3-Tier 아키텍처 구성 및 WAS-DB 연결 방법'
tags: ['Docker', 'Database', 'MariaDB', 'WAS', 'Tomcat']
---

## Docker 컨테이너를 활용한 3-Tier Architecture 구성

### WS - WAS - DB 연결 - (3) WAS - DB Connecting

기본적으로 도커 컨테이너를 실행시키고, 도커 컨테이너 쉘 bash로 작업합니다.

#### WAS(Tomcat) - DB(MariaDB) 연결

**1. MariaDB 테스트 테이블 생성**

- 데이터베이스 이름: `mydb`
- 테이블 이름: `users`
- 테이블 칼럼: `id`, `username`, `email`

**2. JDBC 드라이버 설치**

JDBC는 자바 프로그램이 데이터베이스와 연결되어 데이터를 주고 받을 수 있게 해주는 프로그래밍 인터페이스입니다.

다운로드 명령어:

```docker
wget https://dlm.mariadb.com/2896635/Connectors/java/connector-java-2.7.9/mariadb-java-client-2.7.9.jar
```

설치 경로: `tomcat/lib`
예시: `root@3a324624253c:/usr/local/tomcat/lib#`

> **참고**: Docker 컨테이너에서는 관리자 권한이 없기 때문에 타 디렉터리에서 설치 후 `cp` 또는 `mv` 명령어로 이동을 시도할 수 없으므로 Dockerfile 수정을 이용해야 합니다. 하지만 번거로우므로 경로에 이동 후 설치하는 과정을 따릅니다.

**3. MariaDB 주소 확인**

MariaDB 컨테이너의 IP 주소를 확인합니다:

```docker
docker inspect mariadb
```

출력 결과에서 `"IPAddress": "172.17.0.2"` 부분의 IP를 확인합니다.

**4. Tomcat 서버 시작 페이지 수정**

Tomcat 서버에서 데이터베이스 데이터를 받아오기 위한 JSP 페이지를 작성합니다.
        
        ```jsp
        <%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" %>
        <%@ page import = "java.sql.*" %>
        <html>
        <head>
            <title>Users Table</title>
            <style>
                table, th, td {
                    border: 1px solid black;
                    border-collapse: collapse;
                    padding: 10px;
                }
            </style>
        </head>
        <body>
        
        <%
        Connection conn = null;
        Statement stmt = null;
        ResultSet rs = null;
        
        try {
            String url = "jdbc:mysql://172.17.0.2:3306/mydb"; // 명령어를 통해 확인한 mariadb 주소
            String id = "root";     // 접속을 위한 계정의 ID
            String pw = "qwer1234!"; // 접속을 위한 계정의 암호
            Class.forName("org.mariadb.jdbc.Driver");
            conn = DriverManager.getConnection(url, id, pw);
        
            out.println("<h1>MariaDB DB 연결 성공</h1>");
        
            stmt = conn.createStatement();
            rs = stmt.executeQuery("SELECT id, username, email FROM users");
        
            out.println("<table>");
            out.println("<tr><th>ID</th><th>Username</th><th>Email</th></tr>");
        
            while (rs.next()) {
                int userId = rs.getInt("id");
                String username = rs.getString("username");
                String email = rs.getString("email");
        
                out.println("<tr><td>" + userId + "</td><td>" + username + "</td><td>" + email + "</td></tr>");
            }
        
            out.println("</table>");
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (rs != null) {
                    rs.close();
                }
                if (stmt != null) {
                    stmt.close();
                }
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException se) {
                se.printStackTrace();
            }
        }
        %>
        
        </body>
        </html>
        ```

`jdbc:mysql://172.17.0.2:3306/mydb`는 `docker inspect` 명령어를 통해 확인한 MariaDB 주소를 사용합니다.

**5. 결과 확인**

`localhost:8080`으로 접속하여 데이터베이스 연결 및 데이터 조회를 확인합니다.

## 실행 화면
    ![image](https://github.com/xxng1/xxng1.github.io/assets/114065532/7fc54232-2e42-4508-9914-831115068cfb)