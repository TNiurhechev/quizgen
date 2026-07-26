package com.example.quizgenerator.repositories;

import com.example.quizgenerator.models.Deck;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeckRepository extends MongoRepository<Deck, String> {
    List<Deck> findByUsername(String username);
}
