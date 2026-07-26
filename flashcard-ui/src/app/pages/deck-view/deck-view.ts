import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DeckService, Deck, Question } from '../../services/deck.service';

@Component({
  selector: 'app-deck-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './deck-view.html',
  styleUrl: './deck-view.css'
})
export class DeckView implements OnInit {
  deck: Deck | null = null;
  isLoading = true;
  errorMessage = '';
  activeView: 'flashcards' | 'quiz' = 'flashcards';

  currentCardIndex = 0;
  isFlipped = false;

  selectedAnswers: { [questionText: string]: string[] } = {};
  quizGraded = false;
  score = 0;

  constructor(
    private route: ActivatedRoute,
    private deckService: DeckService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.deckService.getById(id).subscribe({
        next: (data: Deck) => {
          this.deck = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Could not load this deck. It may have been deleted.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  flipCard(): void {
    this.isFlipped = !this.isFlipped;
  }

  nextCard(): void {
    if (this.deck?.flashCards && this.currentCardIndex < this.deck.flashCards.length - 1) {
      this.isFlipped = false;
      setTimeout(() => {
        this.currentCardIndex++;
        this.cdr.detectChanges();
      }, 150); 
    }
  }

  prevCard(): void {
    if (this.currentCardIndex > 0) {
      this.isFlipped = false;
      setTimeout(() => {
        this.currentCardIndex--;
        this.cdr.detectChanges();
      }, 150);
    }
  }

  toggleOption(question: Question, option: string, isMultiple: boolean): void {
    if (this.quizGraded) return;

    const questionText = question.text;
    if (!this.selectedAnswers[questionText]) {
      this.selectedAnswers[questionText] = [];
    }

    const currentSelections = this.selectedAnswers[questionText];

    if (isMultiple) {
      if (currentSelections.includes(option)) {
        this.selectedAnswers[questionText] = currentSelections.filter(o => o !== option);
      } else {
        this.selectedAnswers[questionText] = [...currentSelections, option];
      }
    } else {
      if (currentSelections.includes(option)) {
        this.selectedAnswers[questionText] = [];
      } else {
        this.selectedAnswers[questionText] = [option];
      }
    }
    this.cdr.detectChanges();
  }

  isOptionSelected(questionText: string, option: string): boolean {
    return this.selectedAnswers[questionText]?.includes(option) || false;
  }

  gradeQuiz(): void {
    if (!this.deck?.questions) return;
    this.quizGraded = true;
    let correctCount = 0;

    this.deck.questions.forEach((q) => {
      const userSelections = this.selectedAnswers[q.text] || [];
      const correctOptionStrings = this.getCorrectOptionStrings(q);
      const isCorrect = userSelections.length === correctOptionStrings.length &&
        userSelections.every(val => correctOptionStrings.includes(val));

      if (isCorrect) {
        correctCount++;
      }
    });

    this.score = correctCount;
    this.cdr.detectChanges();
  }

  resetQuiz(): void {
    this.selectedAnswers = {};
    this.quizGraded = false;
    this.score = 0;
    this.cdr.detectChanges();
  }

  getCorrectOptionStrings(question: Question): string[] {
    if (!question.answers) return [];
    
    const rawAnswers: string[] = [];
    question.answers.forEach(ans => {
      const ansStr = String(ans);
      if (ansStr.includes(',')) {
        ansStr.split(',').forEach(subAns => rawAnswers.push(subAns.trim()));
      } else {
        rawAnswers.push(ansStr.trim());
      }
    });

    return rawAnswers.map(ansStr => {
      if (question.options.includes(ansStr)) {
        return ansStr;
      }
      const idx = parseInt(ansStr, 10);
      if (!isNaN(idx) && idx >= 0 && idx < question.options.length) {
        return question.options[idx];
      }
      return ansStr;
    });
  }

  getOptionClass(question: Question, option: string): string {
    const isSelected = this.isOptionSelected(question.text, option);
    const correctOptionStrings = this.getCorrectOptionStrings(question);
    const isCorrect = correctOptionStrings.includes(option);

    if (!this.quizGraded) {
      return isSelected 
        ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300' 
        : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800';
    }
    
    if (isCorrect) {
      return 'bg-emerald-950/40 border-emerald-500 text-emerald-300';
    }
    if (isSelected && !isCorrect) {
      return 'bg-rose-950/40 border-rose-500 text-rose-300';
    }
    return 'bg-slate-800/20 border-slate-800 text-slate-500 cursor-not-allowed';
  }

  isMultipleChoice(question: Question): boolean {
    return this.getCorrectOptionStrings(question).length > 1;
  }
}