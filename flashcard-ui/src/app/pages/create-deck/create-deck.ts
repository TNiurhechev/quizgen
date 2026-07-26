import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeckService, DeckRequest } from '../../services/deck.service';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-create-deck',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-deck.html'
})
export class CreateDeck {
  activeTab: 'topic' | 'text' | 'file' = 'topic';
  isGenerating = false;
  errorMessage = '';

  // Match your Java defaults
  config = {
    difficulty: 'Standard',
    flashcardCount: 5,
    questionCount: 3,
    questionType: 'both', // 'single' | 'multiple' | 'both'
    language: 'English'
  };

  // Raw values from the forms
  topicInput = '';
  sourceInput = '';
  selectedFile: File | null = null;

  constructor(
    private deckService: DeckService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    this.isGenerating = true;
    this.errorMessage = '';

    if (this.activeTab === 'topic') {
      if (!this.topicInput.trim()) {
        this.errorMessage = 'Please specify a topic.';
        this.isGenerating = false;
        return;
      }
      const request: DeckRequest = {
        topic: this.topicInput,
        source: null,
        ...this.config
      };
      this.deckService.generateFromText(request).subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => this.handleError(err)
      });

    } else if (this.activeTab === 'text') {
      if (!this.sourceInput.trim()) {
        this.errorMessage = 'Please paste some source text.';
        this.isGenerating = false;
        return;
      }
      const request: DeckRequest = {
        topic: this.topicInput || null, // Optional topic container
        source: this.sourceInput,
        ...this.config
      };
      this.deckService.generateFromText(request).subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => this.handleError(err)
      });

    } else {
      if (!this.selectedFile) {
        this.errorMessage = 'Please select a file to upload.';
        this.isGenerating = false;
        return;
      }
      this.deckService.generateFromFile(this.selectedFile, this.config).subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleError(err: any): void {
    console.error('Generation failed', err);
    this.errorMessage = err.error?.message || 'Failed to generate study materials.';
    this.isGenerating = false;
    this.cdr.detectChanges();
  }
}