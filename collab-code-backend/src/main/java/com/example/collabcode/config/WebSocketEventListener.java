package com.example.collabcode.listener;

import com.example.collabcode.service.SessionManager;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {

    private final SessionManager sessionManager;

    public WebSocketEventListener(SessionManager sessionManager) {
        this.sessionManager = sessionManager;
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();  // ✅ correct WebSocket ID

        if (sessionId != null) {
            sessionManager.removeSession(sessionId);
        }
    }
}
