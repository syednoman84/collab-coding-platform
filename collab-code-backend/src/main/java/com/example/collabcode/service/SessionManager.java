package com.example.collabcode.service;

import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SessionManager {

    private final Map<String, SessionInfo> sessions = new ConcurrentHashMap<>();
    private final SimpMessageSendingOperations messagingTemplate;

    public SessionManager(SimpMessageSendingOperations messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void addSession(String sessionId, String userName, int problemId) {
        sessions.put(sessionId, new SessionInfo(userName, false, null, problemId));
        broadcastUsers(); // 👈 Automatically broadcast on add
    }

    public void removeSession(String sessionId) {
        sessions.remove(sessionId);
        broadcastUsers(); // 👈 Automatically broadcast on remove
    }

    public void markSolved(String sessionId, Integer finalTime) {
        SessionInfo info = sessions.get(sessionId);
        if (info != null) {
            info.solved = true;
            info.finalTime = finalTime;
            broadcastUsers(); // 👈 Broadcast on solve
        }
    }

    public Map<String, SessionInfo> getAllSessions() {
        return sessions;
    }

    public void broadcastUsers() {
        Map<String, Object> users = new HashMap<>();
        for (var entry : sessions.entrySet()) {
            var session = entry.getValue();
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("userName", session.userName);
            userMap.put("solved", session.solved);
            userMap.put("finalTime", session.finalTime);
            users.put(entry.getKey(), userMap);
        }

//        System.out.println("Broadcasting users: " + users);
        messagingTemplate.convertAndSend("/topic/users", users);
    }

    public static class SessionInfo {
        public String userName;
        public boolean solved;
        public Integer finalTime;
        public int problemId;

        public SessionInfo(String userName, boolean solved, Integer finalTime, int problemId) {
            this.userName = userName;
            this.solved = solved;
            this.finalTime = finalTime;
            this.problemId = problemId;
        }
    }
}
