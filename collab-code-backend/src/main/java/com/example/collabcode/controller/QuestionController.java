package com.example.collabcode.controller;

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

    @GetMapping
    public List<Question> getAllQuestions() {
        return questionService.getAllQuestions();
    }

    @PostMapping
    public Question addQuestion(@RequestBody Question question) {
        return questionService.addQuestion(question);
    }

    @PutMapping("/{id}")
    public Question updateQuestion(@PathVariable Integer id, @RequestBody Question question) {
        return questionService.updateQuestion(id, question);
    }

    @DeleteMapping("/{id}")
    public void deleteQuestion(@PathVariable Integer id) {
        questionService.deleteQuestion(id);
    }

    @PostMapping("/activate/{id}")
    public void activateQuestion(@PathVariable Integer id) {
        questionService.setActiveQuestionId(id);
        messagingTemplate.convertAndSend("/topic/problem", Map.of("action", "start"));
    }


    @PostMapping("/clear")
    public void clearActiveQuestion() {
        questionService.clearActiveQuestion();
        messagingTemplate.convertAndSend("/topic/problem", Map.of("action", "clear"));  // ✅ broadcast to users
    }

    @GetMapping("/active")
    public ResponseEntity<Question> getActiveQuestion() {
        Question active = questionService.getActiveQuestion();
        return (active != null)
                ? ResponseEntity.ok(active)
                : ResponseEntity.noContent().build(); // HTTP 204
    }





}
