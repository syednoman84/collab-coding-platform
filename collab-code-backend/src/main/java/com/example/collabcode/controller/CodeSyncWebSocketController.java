package com.example.collabcode.controller;

import com.example.collabcode.service.SessionManager;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class CodeSyncWebSocketController {

    private final SessionManager sessionManager;

    public CodeSyncWebSocketController(SessionManager sessionManager) {
        this.sessionManager = sessionManager;
    }

    @MessageMapping("/code.sync")
    @SendTo("/topic/code")
    public String syncCode(String code) {
        return code;
    }

    @MessageMapping("/user.join")
    public void userJoin(Map<String, Object> payload, Message<?> message) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getSessionAttributes() == null) {
            System.err.println("Missing session attributes. Aborting join.");
            return;
        }

        String sessionId = accessor.getSessionId(); // ✅ use WebSocket session ID
        String userName = (String) payload.get("userName");
        String loggedInUser = (String) accessor.getSessionAttributes().get("username");

        if (sessionId == null || userName == null || userName.isBlank() || loggedInUser == null) {
            System.err.println("Invalid session or payload. Aborting join.");
            return;
        }

        int problemId = -1;
        Object problemIdObj = payload.get("problemId");
        if (problemIdObj instanceof Number) {
            problemId = ((Number) problemIdObj).intValue();
        }

        sessionManager.addSession(sessionId, userName, problemId); // ✅ ensures correct cleanup
    }

    @MessageMapping("/user.solved")
    public void userSolved(Map<String, Object> payload, Message<?> message) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) return;

        String sessionId = accessor.getSessionId(); // ✅ use the correct session ID
        Integer finalTime = null;
        Object timeObj = payload.get("finalTime");
        if (timeObj instanceof Number) {
            finalTime = ((Number) timeObj).intValue();
        }

        sessionManager.markSolved(sessionId, finalTime);
    }
}
