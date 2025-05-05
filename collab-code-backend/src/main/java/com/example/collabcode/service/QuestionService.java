package com.example.collabcode.service;

import com.example.collabcode.model.Question;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.*;

@Service
public class QuestionService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final List<Question> questions = new ArrayList<>();
    private final String filePath;
    private Integer activeQuestionId = null;


    public QuestionService(@Value("${questions.file.path}") String filePath) {
        this.filePath = filePath;
        loadQuestions();
    }

    private void loadQuestions() {
        try {
            File file = new File(filePath);
            if (file.exists()) {
                questions.addAll(objectMapper.readValue(file, new TypeReference<List<Question>>() {}));
                System.out.println("LOADED QUESTIONS:");
                System.out.println(questions.toString());
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void saveQuestions() {
        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(filePath), questions);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public List<Question> getAllQuestions() {
        return questions;
    }

    public Question addQuestion(Question question) {
        question.setId(generateRandomId());
        questions.add(question);
        saveQuestions();
        return question;
    }

    public Question updateQuestion(Integer id, Question updatedQuestion) {
        for (int i = 0; i < questions.size(); i++) {
            if (Objects.equals(questions.get(i).getId(), id)) {
                updatedQuestion.setId(id);  // maintain same id
                questions.set(i, updatedQuestion);
                saveQuestions();
                return updatedQuestion;
            }
        }
        return null;
    }

    public boolean deleteQuestion(Integer id) {
        boolean removed = questions.removeIf(q -> Objects.equals(q.getId(), id));
        if (removed) saveQuestions();
        return removed;
    }

    private int generateRandomId() {
        Random random = new Random();
        int id;
        Set<Integer> existingIds = new HashSet<>();
        if (questions != null) {
            for (Question q : questions) {
                existingIds.add(q.getId());
            }
        }
        do {
            id = 1000 + random.nextInt(9000); // random 4-digit id
        } while (existingIds.contains(id));
        return id;
    }

    public void setActiveQuestionId(Integer id) {
        this.activeQuestionId = id;
    }

    public void clearActiveQuestion() {
        this.activeQuestionId = null;
    }

    public Question getActiveQuestion() {
        if (activeQuestionId == null) return null;
        return questions.stream()
                .filter(q -> Objects.equals(q.getId(), activeQuestionId))
                .findFirst()
                .orElse(null);
    }

    public Question getQuestionById(int id) {
        return questions.stream()
                .filter(q -> q.getId() == id)
                .findFirst()
                .orElse(null);
    }

    public void setPairedProgramming(int id, boolean paired) {
        Question q = getQuestionById(id);
        if (q != null) {
            q.setPaired(paired);
        }
    }

}
