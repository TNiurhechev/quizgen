package com.example.quizgenerator.services;

import com.example.quizgenerator.models.Deck;
import com.example.quizgenerator.models.DeckRequest;
import com.example.quizgenerator.repositories.DeckRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class DeckService {
    private final DeckRepository repository;
    private final ChatClient chatClient;

    public DeckService(DeckRepository repository, ChatClient.Builder builder) {
        this.repository = repository;
        this.chatClient = builder.build();
    }

    public List<Deck> getAllDecks() {
        return repository.findAll();
    }

    public Deck getDeckById(String id) {
        return repository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Couldn't find your deck!"
                ));
    }

    public Deck saveDeck(Deck deck) {
        return repository.save(deck);
    }

    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Cannot delete: Deck not found"
            );
        }
        repository.deleteById(id);
    }

    public Deck generateDeck(DeckRequest request, String username) {
        String language = (request.language() != null && !request.language().isBlank())
                ? request.language() : "English";
        String questionType = (request.questionType() != null)
                ? request.questionType().toLowerCase() : "both";
        String questionTypeInstruction = switch (questionType) {
            case "single" -> "All questions must be single-answer (only one correct option).";
            case "multiple" -> "All questions must be multiple-answer (more than one correct option).";
            default -> "Include a mix of single-answer and multiple-answer questions.";
        };
        String difficulty = (request.difficulty() != null && !request.difficulty().isBlank())
                ? request.difficulty() : "Standard";

        String prompt;

        if (request.source() != null && !request.source().isBlank()) {
            prompt = String.format(
                    "Analyze the following source text and create a study deck based strictly on its contents. " +
                            "Target difficulty level: %s. Write everything in %s. " +
                            "Provide exactly %d flashcards and %d quiz questions. %s " +
                            "Ensure the response is structured as a valid JSON matching the Deck schema.\n\n" +
                            "SOURCE TEXT:\n%s",
                    difficulty, language, request.flashcardCount(), request.questionCount(),
                    questionTypeInstruction, request.source()
            );
        }
        else {
            prompt = String.format(
                    "Create a study deck about the topic: '%s'. " +
                            "Target difficulty level: %s. Write everything in %s. " +
                            "Provide exactly %d flashcards and %d quiz questions. %s " +
                            "Ensure the response is structured as a valid JSON matching the Deck schema.",
                    request.topic(), difficulty, language, request.flashcardCount(),
                    request.questionCount(), questionTypeInstruction
            );
        }

        Deck generatedDeck = chatClient.prompt()
                .user(prompt)
                .call()
                .entity(Deck.class);
        generatedDeck.setUsername(username);
        return repository.save(generatedDeck);
    }

    public List<Deck> getUserDecks(String username) {
        return repository.findByUsername(username);
    }
}
