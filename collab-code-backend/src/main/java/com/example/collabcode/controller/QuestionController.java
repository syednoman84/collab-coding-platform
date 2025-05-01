package com.example.collabcode.controller;

import com.example.collabcode.auth.annotation.RequireAdmin;
import com.example.collabcode.auth.annotation.RequireAuth;
import com.example.collabcode.model.Question;
import com.example.collabcode.service.QuestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;


import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService questionService;

    private final SimpMessagingTemplate messagingTemplate;

    public QuestionController(QuestionService questionService, SimpMessagingTemplate messagingTemplate) {
        this.questionService = questionService;
        this.messagingTemplate = messagingTemplate;
    }

    @RequireAdmin
    @GetMapping
    public List<Question> getAllQuestions() {
        return questionService.getAllQuestions();
    }

    @RequireAdmin
    @PostMapping
    public Question addQuestion(@RequestBody Question question) {
        return questionService.addQuestion(question);
    }

    @RequireAdmin
    @PutMapping("/{id}")
    public Question updateQuestion(@PathVariable Integer id, @RequestBody Question question) {
        return questionService.updateQuestion(id, question);
    }

    @RequireAdmin
    @DeleteMapping("/{id}")
    public void deleteQuestion(@PathVariable Integer id) {
        questionService.deleteQuestion(id);
    }

    @RequireAdmin
    @PostMapping("/activate/{id}")
    public void activateQuestion(@PathVariable Integer id) {
        questionService.setActiveQuestionId(id);
        Question q = questionService.getQuestionById(id);
        messagingTemplate.convertAndSend("/topic/problem", Map.of(
                "action", "start",
                "paired", q != null && q.isPaired()
        ));

    }

    @RequireAdmin
    @PostMapping("/clear")
    public void clearActiveQuestion() {
        questionService.clearActiveQuestion();
        messagingTemplate.convertAndSend("/topic/problem", Map.of("action", "clear"));  // ✅ broadcast to users
    }

    @RequireAuth
    @GetMapping("/active")
    public ResponseEntity<Question> getActiveQuestion() {
        Question active = questionService.getActiveQuestion();
        return (active != null)
                ? ResponseEntity.ok(active)
                : ResponseEntity.noContent().build(); // HTTP 204
    }





}
