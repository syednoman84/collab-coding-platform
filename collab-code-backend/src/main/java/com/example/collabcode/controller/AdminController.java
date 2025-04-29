package com.example.collabcode.controller;

import com.example.collabcode.model.Problem;
import com.example.collabcode.service.ProblemService;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ProblemService problemService;
    private final SimpMessageSendingOperations messagingTemplate;

    public AdminController(ProblemService problemService, SimpMessageSendingOperations messagingTemplate) {
        this.problemService = problemService;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        boolean success = "admin".equals(username) && "secret123".equals(password);
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        return response;
    }

    @PostMapping("/selectProblem")
    public void selectProblem(@RequestBody Map<String, Integer> payload) {
        Integer problemId = payload.get("problemId");
        problemService.setActiveProblemId(problemId);

        // Notify all clients via WebSocket
        messagingTemplate.convertAndSend("/topic/problem", Map.of("action", "start", "problemId", problemId));
    }

    @PostMapping("/clearProblem")
    public void clearProblem() {
        problemService.clearActiveProblem();

        // Notify all clients via WebSocket
        messagingTemplate.convertAndSend("/topic/problem", Map.of("action", "clear"));
    }
}
