package com.example.collabcode.controller;

import com.example.collabcode.service.SessionManager;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;

@Controller
public class CodeSyncWebSocketController {

    private final SessionManager sessionManager;
    private final SimpMessageSendingOperations messagingTemplate;

    public CodeSyncWebSocketController(SessionManager sessionManager, SimpMessageSendingOperations messagingTemplate) {
        this.sessionManager = sessionManager;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/code.sync")
    @SendTo("/topic/code")
    public String syncCode(String code) {
        return code;
    }

    @MessageMapping("/user.join")
    public void userJoin(Map<String, Object> payload) {
        String sessionId = (String) payload.get("sessionId");
        String userName = (String) payload.get("userName");
        Object problemIdObj = payload.get("problemId");

        int problemId = -1;
        if (problemIdObj != null) {
            problemId = ((Number) problemIdObj).intValue();
        }

        sessionManager.addSession(sessionId, userName, problemId);
        broadcastUsers();
    }


    @MessageMapping("/user.solved")
    public void userSolved(Map<String, Object> payload) {
        String sessionId = (String) payload.get("sessionId");
        Integer finalTime = null;
        Object timeObj = payload.get("finalTime");
        if (timeObj instanceof Number) {
            finalTime = ((Number) timeObj).intValue();
        }
        sessionManager.markSolved(sessionId, finalTime);
        broadcastUsers();
    }


    private void broadcastUsers() {
        Map<String, Object> users = new HashMap<>();
        for (var entry : sessionManager.getAllSessions().entrySet()) {
            var session = entry.getValue();
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("userName", session.userName);
            userMap.put("solved", session.solved);
            userMap.put("finalTime", session.finalTime);
            users.put(entry.getKey(), userMap);
        }
        messagingTemplate.convertAndSend("/topic/users", users);
    }

}
