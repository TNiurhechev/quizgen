package com.example.quizgenerator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class QuizgeneratorApplication {

    public static void main(String[] args) {
        SpringApplication.run(QuizgeneratorApplication.class, args);
    }

}
