package com.example.collabcode.service;

import com.example.collabcode.model.Problem;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProblemService {

    private final List<Problem> problems = new ArrayList<>();
    private final Path filePath = Paths.get("data/questions.json");

    private Integer activeProblemId = null;

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
        this.activeProblemId = id;
    }

    public void clearActiveProblem() {
        this.activeProblemId = null;
    }

    public Problem getActiveProblem() {
        if (activeProblemId == null) return null;
        return getProblemById(activeProblemId);
    }

    @PostConstruct
    public void loadProblemsFromJson() {
        try {
            if (Files.exists(filePath)) {
                ObjectMapper mapper = new ObjectMapper();
                List<Problem> loaded = mapper.readValue(
                        Files.readAllBytes(filePath),
                        new TypeReference<List<Problem>>() {}
                );
                problems.clear();
                problems.addAll(loaded);

                System.out.println("✅ Loaded " + problems.size() + " problems from questions.json");
                System.out.println("✅ Loaded Problems: \n" + problems.get(0).getId());


                // ✅ Validate loaded problems (optional)
                for (Problem problem : problems) {
                    if (problem.getClassName() == null) {
                        problem.setClassName("Solution");
                    }
                    if (problem.getMethodName() == null) {
                        problem.setMethodName("solve");
                    }
                    if (problem.getParameters() == null) {
                        problem.setParameters(new ArrayList<>());
                    }
                    if (problem.getReturnType() == null) {
                        problem.setReturnType("void");
                    }
                }
            }
        } catch (IOException e) {
            System.err.println("❌ Failed to load questions.json: " + e.getMessage());
        }
    }
}

