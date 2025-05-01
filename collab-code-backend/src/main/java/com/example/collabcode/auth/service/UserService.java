package com.example.collabcode.auth.service;

import com.example.collabcode.auth.model.User;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class UserService {

    private static final String USERS_FILE = "data/users.json";
    private final ObjectMapper mapper = new ObjectMapper();
    private final List<User> users;

    public UserService() {
        users = loadUsers();
    }

    public boolean userExists(String username) {
        return users.stream().anyMatch(u -> u.getUsername().equalsIgnoreCase(username));
    }

    public boolean isValidUser(String username, String password) {
        return users.stream().anyMatch(u -> u.getUsername().equalsIgnoreCase(username)
                && u.getPassword().equals(password));
    }

    public String getRoleForUser(String username) {
        return users.stream()
                .filter(u -> u.getUsername().equalsIgnoreCase(username))
                .map(User::getRole)
                .findFirst()
                .orElse("user");
    }

    public void saveUser(User newUser) {
        users.add(newUser);
        persistUsers();
    }

    private List<User> loadUsers() {
        try {
            File file = new File(USERS_FILE);
            if (file.exists()) {
                return mapper.readValue(file, new TypeReference<>() {});
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return new CopyOnWriteArrayList<>();
    }

    private void persistUsers() {
        try {
            mapper.writerWithDefaultPrettyPrinter().writeValue(new File(USERS_FILE), users);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public List<User> getAllUsers() {
        return users;
    }
}
