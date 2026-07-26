package com.example.quizgenerator.controllers;

import com.example.quizgenerator.services.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mail")
public class EMailController {
    @Autowired
    private EmailService emailService;
    @GetMapping("/test")
    public String testEmail(@RequestParam String target) {
        emailService.sendSimpleEmail(
                target,
                "Hello from your Flashcard App!",
                "Mail check"
        );
        return "Email triggered for " + target + "! Check your logs/inbox.";
    }
}
