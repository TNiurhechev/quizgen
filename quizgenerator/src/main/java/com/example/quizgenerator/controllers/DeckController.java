package com.example.quizgenerator.controllers;

import com.example.quizgenerator.models.Deck;
import com.example.quizgenerator.models.DeckRequest;
import com.example.quizgenerator.services.DeckService;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/decks")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DeckController {


    private final DeckService deckService;

    @GetMapping
    public List<Deck> getAllDecks() {
        return deckService.getAllDecks();
    }

    @GetMapping("/{id}")
    public Deck getDeckById(@PathVariable String id) {
        return deckService.getDeckById(id);
    }

    @PostMapping
    public Deck createDeck(@RequestBody Deck deck) {
        return deckService.saveDeck(deck);
    }

    @DeleteMapping("/{id}")
    public void deleteDeck(@PathVariable String id) {
        deckService.delete(id);
    }

    @PostMapping("/generate")
    public Deck generateDeck(@RequestBody DeckRequest request, Principal principal) {
        return deckService.generateDeck(request, principal.getName());
    }

    @PostMapping(value = "/generate/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Deck generateFromFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "difficulty", defaultValue = "Standard") String difficulty,
            @RequestParam(value = "flashcardCount", defaultValue = "5") int flashcardCount,
            @RequestParam(value = "questionCount", defaultValue = "3") int questionCount,
            @RequestParam(value = "questionType", defaultValue = "both") String questionType,
            @RequestParam(value = "language", defaultValue = "English") String language,
            Principal principal
    ) throws java.io.IOException {

        String extractedText = "";
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

        if (filename.endsWith(".pdf")) {
            try (PDDocument document = PDDocument.load(file.getInputStream())) {
                PDFTextStripper stripper = new PDFTextStripper();
                extractedText = stripper.getText(document);
            }
        } else if(filename.endsWith(".docx")) {
            try (InputStream is = file.getInputStream()) {
                XWPFDocument document = new XWPFDocument(is);
                XWPFWordExtractor extractor = new XWPFWordExtractor(document);
                extractedText = extractor.getText();
            }
        } else if (filename.endsWith(".txt")) {
            extractedText = new String(file.getBytes(), StandardCharsets.UTF_8);
        } else {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Only .txt, .docx and .pdf extensions are supported"
            );
        }

        if (extractedText.isBlank())
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "The uploaded file is empty or contains no readable text"
            );

        DeckRequest request = new DeckRequest(
                null,
                extractedText,
                difficulty,
                flashcardCount,
                questionCount,
                questionType,
                language
        );
        return deckService.generateDeck(request, principal.getName());
    }

    @PostMapping("/my-decks")
    public List<Deck> getUserDecks(Principal principal) {
        return deckService.getUserDecks(principal.getName());
    }
}
