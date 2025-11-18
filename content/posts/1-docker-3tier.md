---
layout:       post
title:        "WAS(Web Application Server)와 DB 연결"
date: '2023-06-15'
section: 'infra'
excerpt: 'Docker 컨테이너를 활용한 3-Tier 아키텍처 구성 및 연결 방법'
tags: ['Docker', 'Database', 'MariaDB', 'Tomcat']
---

Docker 컨테이너 환경에서 Tomcat과 MariaDB를 연결해 데이터를 조회하는 과정

3-Tier 아키텍처의 세팅부터 확인까지의 전체 흐름 정리

<br>

# ☑️ 준비 사항

- Docker 가 설치된 로컬 환경
- MariaDB, Tomcat 컨테이너
- 컨테이너 내부 접속을 위한 bash 쉘 사용
- 테스트용 데이터베이스와 테이블 (예: `mydb.users`)

<br>



# ☑️ 1. MariaDB에 테스트 데이터 준비

```sql
CREATE DATABASE mydb;
USE mydb;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50),
  email VARCHAR(100)
);
```

<br>

# ☑️ 2. Tomcat 컨테이너에 JDBC 드라이버 설치

```bash
wget https://dlm.mariadb.com/2896635/Connectors/java/connector-java-2.7.9/mariadb-java-client-2.7.9.jar \
  -P /usr/local/tomcat/lib
```

<br>


# ☑️ 3. MariaDB 컨테이너 IP 확인

```bash
docker inspect mariadb | grep IPAddress
```

출력에서 `"IPAddress": "172.17.0.2"`처럼 확인되는 주소를 JDBC URL에 사용.

<br>


# ☑️ 4. Tomcat 시작 페이지 수정

아래 JSP 파일을 Tomcat 컨테이너에 배포해 DB 연결을 확인

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
  String url = "jdbc:mysql://172.17.0.2:3306/mydb";
  String id = "root";
  String pw = "qwer1234!";
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
    if (rs != null) rs.close();
    if (stmt != null) stmt.close();
    if (conn != null) conn.close();
  } catch (SQLException se) {
    se.printStackTrace();
  }
}
%>
</body>
</html>
```

<br>

# ☑️ 5. 결과 확인

브라우저에서 `http://localhost:8080`으로 접속하면 DB에서 조회한 사용자 목록이 테이블로 출력된다.

![](/blog-images/1/1.png)