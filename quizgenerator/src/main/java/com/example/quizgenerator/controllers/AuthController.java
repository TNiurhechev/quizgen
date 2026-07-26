package com.example.quizgenerator.controllers;

import com.example.quizgenerator.models.AuthRequest;
import com.example.quizgenerator.models.AuthResponse;
import com.example.quizgenerator.models.User;
import com.example.quizgenerator.repositories.UserRepository;
import com.example.quizgenerator.security.JwtService;
import com.example.quizgenerator.services.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String username = request.get("username");
        String password = request.get("password");

        if (userRepository.findByEmail(email).isPresent())
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use."));
        if (userRepository.findByUsername(username).isPresent())
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken."));

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setVerified(false);

        String code = User.generate6DigitCode();
        user.setVerificationCode(code);
        userRepository.save(user);

        emailService.sendSimpleEmail(
                email,
                "Verify Your Flashcard Account",
                "Your verification code is: " + code + "\n\nPlease enter this code in the app to activate your account."
        );

        return ResponseEntity.ok(Map.of("message", "Registration successful. Please check your email."));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found."));
        User user = userOpt.get();
        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code))
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid verification code."));

        user.setVerified(true);
        user.setVerificationCode(null);
        userRepository.save(user);
        String token = jwtService.generateToken(user.getUsername());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        String usernameOrEmail = request.username();
        Optional<User> userOpt = userRepository.findByUsername(usernameOrEmail);
        if (userOpt.isEmpty())
            userOpt = userRepository.findByEmail(usernameOrEmail);

        if (userOpt.isEmpty())
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials."));

        User user = userOpt.get();
        if (!user.isVerified()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "message", "Account is not verified. Please verify your email first.",
                    "requiresVerification", "true"
            ));
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.password())
        );

        String token = jwtService.generateToken(user.getUsername());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String code = User.generate6DigitCode();

            user.setPasswordResetCode(code);
            user.setResetCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
            userRepository.save(user);

            emailService.sendSimpleEmail(
                    email,
                    "Password Reset Code",
                    "Your password reset code is: " + code + "\n\nThis code expires in 15 minutes."
            );
        }
        return ResponseEntity.ok(Map.of("message", "If an account with that email exists, a reset code was sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        String newPassword = request.get("newPassword");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid request."));
        User user = userOpt.get();
        if (user.getPasswordResetCode() == null || !user.getPasswordResetCode().equals(code))
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid reset code."));
        if (user.getResetCodeExpiresAt() == null || user.getResetCodeExpiresAt().isBefore(LocalDateTime.now()))
            return ResponseEntity.badRequest().body(Map.of("message", "Reset code has expired."));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetCode(null);
        user.setResetCodeExpiresAt(null);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now log in."));
    }
}