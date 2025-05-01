package com.example.collabcode.auth.session;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SessionStore {

    private final Map<String, String> userRoles = new ConcurrentHashMap<>();

    public String createSession(String username, String role) {
        String token = UUID.randomUUID().toString();
        userRoles.put(token, role + ":" + username);
        return token;
    }

    public String getRole(String token) {
        String val = userRoles.get(token);
        return val != null ? val.split(":")[0] : null;
    }

    public String getUsername(String token) {
        String val = userRoles.get(token);
        return val != null ? val.split(":")[1] : null;
    }

    public boolean isAdmin(String token) {
        return "ADMIN".equals(getRole(token));
    }
}

