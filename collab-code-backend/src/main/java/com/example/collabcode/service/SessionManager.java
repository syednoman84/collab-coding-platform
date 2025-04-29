package com.example.collabcode.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionManager {

    public static class UserSession {
        public String userName;
        public int problemId;
        public boolean solved;
        public Integer finalTime;  // ✅ <-- New field

        public UserSession(String userName, int problemId) {
            this.userName = userName;
            this.problemId = problemId;
            this.solved = false;
            this.finalTime = null;
        }
    }

    private final Map<String, UserSession> sessions = new ConcurrentHashMap<>();

    public void addSession(String sessionId, String userName, int problemId) {
        sessions.put(sessionId, new UserSession(userName, problemId));
    }

    public void markSolved(String sessionId, Integer finalTime) {
        UserSession session = sessions.get(sessionId);
        if (session == null) {
            System.out.println("No session found for sessionId: " + sessionId);
        } else {
            session.solved = true;
            session.finalTime = finalTime;
            System.out.println("Marked as solved: " + session.userName + ", time: " + finalTime);
        }

    }

    public void removeSession(String sessionId) {
        sessions.remove(sessionId);
    }

    public Map<String, UserSession> getAllSessions() {
        return sessions;
    }

    public Map<String, Map<String, Object>> getSessionDataForBroadcast() {
        Map<String, Map<String, Object>> allSessions = new ConcurrentHashMap<>();
        for (Map.Entry<String, UserSession> entry : sessions.entrySet()) {
            UserSession session = entry.getValue();
            Map<String, Object> sessionMap = new ConcurrentHashMap<>();
            sessionMap.put("userName", session.userName);
            sessionMap.put("solved", session.solved);
            sessionMap.put("finalTime", session.finalTime);
            allSessions.put(entry.getKey(), sessionMap);
        }
        return allSessions;
    }

}
