package com.example.collabcode.controller;

import com.example.collabcode.model.Problem;
import com.example.collabcode.service.ProblemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/problem")
@CrossOrigin(origins = "http://localhost:5173") // Frontend Vite default port
public class ProblemController {

    private final ProblemService problemService;

    public ProblemController(ProblemService problemService) {
        this.problemService = problemService;
    }

    @GetMapping("/current")
    public Problem getCurrentProblem() {
        // For now always return first problem
        return problemService.getProblemById(1);
    }

    @GetMapping("/all")
    public List<Problem> getAllProblems() {
        return problemService.getAllProblems();
    }

    @GetMapping("/active")
    public Problem getActiveProblem() {
        Integer activeId = problemService.getActiveProblemId();
        if (activeId != null) {
            return problemService.getProblemById(activeId);
        } else {
            return null;
        }
    }

}
