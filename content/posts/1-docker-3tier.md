---
layout:       post
title:        "[DevOps] WAS - DB connect ( feat. docker )"
date: '2023-06-15'
section: 'infra'
excerpt: 'Docker 컨테이너를 활용한 3-Tier 아키텍처 구성 및 WAS-DB 연결 방법'
tags: ['Docker', 'Database', 'MariaDB', 'WAS', 'Tomcat']
---

## 개요

3-Tier 아키텍처를 실습하면서 가장 먼저 확인하고 싶었던 것은 "애플리케이션(WAS)과 데이터베이스(DB)가 정말로 잘 연결되는가?"였습니다. 이 글은 Docker 컨테이너 환경에서 Tomcat과 MariaDB를 연결해 데이터를 조회하는 과정을 정리한 기록입니다. 세팅부터 확인까지의 전체 흐름을 적어 두었으니, 비슷한 환경을 구축할 때 참고하면 좋습니다.

## 준비 사항

- Docker 가 설치된 로컬 환경
- MariaDB, Tomcat 컨테이너
- 컨테이너 내부 접속을 위한 bash 쉘 사용
- 테스트용 데이터베이스와 테이블 (예: `mydb.users`)

> **TIP**: Docker 컨테이너는 권한 제약이 있기 때문에 파일을 직접 이동하기보다는 필요한 위치에서 바로 다운로드하는 편이 편합니다.

## 연결 절차

### 1. MariaDB에 테스트 데이터 준비

```sql
CREATE DATABASE mydb;
USE mydb;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50),
  email VARCHAR(100)
);
```

### 2. Tomcat 컨테이너에 JDBC 드라이버 설치

```bash
wget https://dlm.mariadb.com/2896635/Connectors/java/connector-java-2.7.9/mariadb-java-client-2.7.9.jar \
  -P /usr/local/tomcat/lib
```

### 3. MariaDB 컨테이너 IP 확인

```bash
docker inspect mariadb | grep IPAddress
```

> 출력에서 `"IPAddress": "172.17.0.2"`처럼 확인되는 주소를 JDBC URL에 사용합니다.

### 4. Tomcat 시작 페이지 수정

아래 JSP 파일을 Tomcat 컨테이너에 배포해 DB 연결을 확인했습니다.

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

### 5. 결과 확인

브라우저에서 `http://localhost:8080`으로 접속하면 DB에서 조회한 사용자 목록이 테이블로 출력됩니다.

![](https://github.com/xxng1/xxng1.github.io/assets/114065532/7fc54232-2e42-4508-9914-831115068cfb)

## 마무리

Docker 컨테이너로 3-Tier 구조를 구성할 때 핵심은 각 계층 간 네트워크 연결을 명확히 검증하는 것입니다. 특히 IP 주소와 포트, JDBC 드라이버 위치를 정확히 지정하면 대부분의 이슈를 피할 수 있습니다. 이번 실습을 통해 아키텍처를 확인했고, 이후에는 인프라 자동화(Terraform)와 배포 파이프라인(Jenkins)에도 확장할 계획입니다.