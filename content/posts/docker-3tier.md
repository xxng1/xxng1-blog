---
layout:       post
title:        "WAS - DB connect ( feat. docker )"
date: '2023-06-15'
excerpt: '#Docker #Tomcat'
---

## Docker 컨테이너를 활용한 3-Tier Architecture 구성

### WS - WAS - DB 연결 - (3) WAS - DB Connecting

기본적으로 도커 컨테이너를 실행시키고, 도커 컨테이너 쉘 bash로 작업한다.

- **WAS(Tomcat) - DB(MariaDB) 연결**
    - MariaDB 테스트테이블 생성
        - 데이터베이스 이름: mydb
        - 테이블 이름: users
        - 테이블 칼럼: id, username, email
    - 연결을 위한 JDBC(자바 프로그램이 데이터베이스와 연결되어 데이터를 주고 받을 수 있게 해주는 프로그래밍 인터페이스) 설치
        - 다운로드 명령어
        
        ```docker
        wget https://dlm.mariadb.com/2896635/Connectors/java/connector-java-2.7.9/mariadb-java-client-2.7.9.jar
        ```
        
        - 설치 경로: tomcat/lib
        예시) root@3a324624253c:/usr/local/tomcat/lib#
        * 기본적으로 Docker 컨테이너에서는 관리자 권한이 없기 때문에 타 디렉터리에서 설치 후 cp명령 혹은 mv명령어로 이동을 시도할 수 없으므로 Dockerfile 수정을 이용해야 하는데, 번거로우므로 경로에 이동 후 설치하는 과정을 가졌다.
    - MariaDB 주소 확인
        - 주소 확인 명령어
            
            ```docker
            docker inspect mariadb
            ```
            
            **"IPAddress": "172.17.0.2",** 부분에서 ip를 확인한다.
            
    - Tomcat서버에서 받아오기위한 시작페이지를 수정한다.
        
        ```java
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
        
    - localhost:8080으로 접속해서 확인한다.
    
    ## 실행화면
    ![image](https://github.com/xxng1/xxng1.github.io/assets/114065532/7fc54232-2e42-4508-9914-831115068cfb)