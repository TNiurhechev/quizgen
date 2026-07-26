package com.example.quizgenerator.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "decks")
public class Deck {
    @Id
    private String id;
    private String title;
    private String subject;
    private String username;
    private List<FlashCard> flashCards;
    private List<Question> questions;
}
