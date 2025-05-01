package com.example.collabcode.controller;

import com.example.collabcode.auth.annotation.RequireAuth;
import com.example.collabcode.model.CodeSubmission;
import com.example.collabcode.model.ExecutionResult;
import com.example.collabcode.service.CodeExecutionService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/code")
@CrossOrigin(origins = "http://localhost:5173")
public class CodeExecutionController {

    private final CodeExecutionService codeExecutionService;

    public CodeExecutionController(CodeExecutionService codeExecutionService) {
        this.codeExecutionService = codeExecutionService;
    }

    @RequireAuth
    @PostMapping("/execute")
    public ExecutionResult executeCode(@RequestBody CodeSubmission submission) {
        return codeExecutionService.executeCode(submission.getProblemId(), submission.getCode());
    }
}
