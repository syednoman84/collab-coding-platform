/*
package com.example.collabcode.auth.service;

import com.example.collabcode.auth.model.User;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

@Service
public class JsonUserService implements UserService {

    private final File userFile = new File("data/users.json");
    private final ObjectMapper mapper = new ObjectMapper();
    private List<User> users = new ArrayList<>();

    @PostConstruct
    public void init() {
        try {
            if (userFile.exists()) {
                users = mapper.readValue(userFile, new TypeReference<>() {});
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to load users.json", e);
        }
    }

    private void saveUsers() {
        try {
            mapper.writeValue(userFile, users);
        } catch (Exception e) {
            throw new RuntimeException("Failed to write users.json", e);
        }
    }

    @Override
    public User findByUsername(String username) {
        return users.stream()
                .filter(u -> u.getUsername().equalsIgnoreCase(username))
                .findFirst().orElse(null);
    }

    @Override
    public boolean validateCredentials(String username, String password) {
        User user = findByUsername(username);
        return user != null && user.getPassword().equals(password);
    }

    @Override
    public boolean registerUser(User user) {
        if (findByUsername(user.getUsername()) != null) return false;
        users.add(user);
        saveUsers();
        return true;
    }

    @Override
    public List<User> getAllUsers() {
        return users;
    }
}
*/
