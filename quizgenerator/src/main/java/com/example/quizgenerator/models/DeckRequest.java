package com.example.quizgenerator.models;

public record DeckRequest (
        String topic,
        String source,
        String difficulty,
        int flashcardCount,
        int questionCount,
        String questionType,
        String language
){ }
