package com.example.collabcode.service;

import com.example.collabcode.model.Problem;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProblemService {

    private final List<Problem> problems = new ArrayList<>();
    private Integer activeProblemId = null;


    public ProblemService() {
        // Load problems into memory

        Problem p1 = new Problem();
        p1.setId(1);
        p1.setTitle("Add Two Numbers");
        p1.setDescription("Given two integers, return their sum.");
        p1.setTestCases(List.of(
                new Problem.TestCase("2 3", "5"),
                new Problem.TestCase("10 15", "25")
        ));

        Problem p2 = new Problem();
        p2.setId(2);
        p2.setTitle("Multiply Two Numbers");
        p2.setDescription("Given two integers, return their product.");
        p2.setTestCases(List.of(
                new Problem.TestCase("2 3", "6"),
                new Problem.TestCase("10 5", "50")
        ));

        problems.add(p1);
        problems.add(p2);
    }

    public Problem getProblemById(int id) {
        return problems.stream().filter(p -> p.getId() == id).findFirst().orElse(null);
    }

    public List<Problem> getAllProblems() {
        return problems;
    }

    public Integer getActiveProblemId() {
        return activeProblemId;
    }

    public void setActiveProblemId(Integer id) {
        activeProblemId = id;
    }

    public void clearActiveProblem() {
        activeProblemId = null;
    }

}
