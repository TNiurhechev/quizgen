package com.example.quizgenerator.models;

import lombok.Data;

import java.util.List;

@Data
public class Question {
    private String text;
    private List<String> options;
    private List<String> answers;
}
