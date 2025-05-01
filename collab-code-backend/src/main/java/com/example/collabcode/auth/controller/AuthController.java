package com.example.collabcode.auth.controller;

import com.example.collabcode.auth.model.User;
import com.example.collabcode.auth.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest, HttpServletRequest request) {
        if (userService.isValidUser(loginRequest.getUsername(), loginRequest.getPassword())) {
            String role = userService.getRoleForUser(loginRequest.getUsername());

            // ✅ Force session to be created and store user info
            HttpSession session = request.getSession(true); // true means create if not exists
            session.setAttribute("username", loginRequest.getUsername());
            session.setAttribute("role", role);

            Map<String, String> response = new HashMap<>();
            response.put("username", loginRequest.getUsername());
            response.put("role", role);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body("Invalid username or password");
        }
    }


    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User newUser) {
        if (userService.userExists(newUser.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        newUser.setRole("user"); // default role is user
        userService.saveUser(newUser);
        return ResponseEntity.ok("User registered successfully");
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logged out");
    }

    @GetMapping("/me")
    public ResponseEntity<?> currentUser(HttpSession session) {
        Object username = session.getAttribute("username");
        Object role = session.getAttribute("role");

        if (username != null && role != null) {
            return ResponseEntity.ok(Map.of("username", username.toString(), "role", role.toString()));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");
        }
    }
}
