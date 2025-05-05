package com.example.collabcode.controller;

import com.example.collabcode.dto.NotifyAdminRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;


@RestController
@RequestMapping("/api")
public class EmailController {

    @Value("${admin.email}")
    private String adminEmail;

    private final JavaMailSender mailSender;

    public EmailController(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @PostMapping("/notify-admin")
    public ResponseEntity<?> notifyAdmin(@RequestBody NotifyAdminRequest request, HttpSession session) {
        String username = (String) session.getAttribute("username");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(adminEmail);
            helper.setSubject("User " + username + " solved: " + request.problemTitle);

            StringBuilder html = new StringBuilder();
            html.append("<p><strong>User:</strong> ").append(username).append("</p>");
            html.append("<p><strong>Problem:</strong> ").append(request.problemTitle).append("</p>");

            html.append("<p><strong>Submitted Code:</strong></p>");
            html.append("<pre style='background:#f4f4f4; padding:10px; border-radius:6px;'>")
                    .append(escapeHtml(request.code)).append("</pre>");

            html.append("<p><strong>Test Case Results:</strong></p>");
            html.append("<table style='width:100%; border-collapse: collapse;'>");
            html.append("<tr>")
                    .append("<th style='border: 1px solid #ccc; padding: 8px;'>Input</th>")
                    .append("<th style='border: 1px solid #ccc; padding: 8px;'>Expected Output</th>")
                    .append("<th style='border: 1px solid #ccc; padding: 8px;'>Actual Output</th>")
                    .append("<th style='border: 1px solid #ccc; padding: 8px;'>Passed</th>")
                    .append("</tr>");

            for (NotifyAdminRequest.TestCaseResult tc : request.testCases) {
                html.append("<tr>")
                        .append("<td style='border: 1px solid #ccc; padding: 8px;'>").append(escapeHtml(tc.input)).append("</td>")
                        .append("<td style='border: 1px solid #ccc; padding: 8px;'>").append(escapeHtml(tc.expectedOutput)).append("</td>")
                        .append("<td style='border: 1px solid #ccc; padding: 8px;'>").append(escapeHtml(tc.actualOutput)).append("</td>")
                        .append("<td style='border: 1px solid #ccc; padding: 8px;'>").append(tc.passed ? "✅" : "❌").append("</td>")
                        .append("</tr>");
            }

            html.append("</table>");

            helper.setText(html.toString(), true); // true enables HTML

            mailSender.send(message);
            return ResponseEntity.ok().build();

        } catch (MessagingException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to send email");
        }
    }


    private String escapeHtml(String input) {
        if (input == null) return "";
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }
}
