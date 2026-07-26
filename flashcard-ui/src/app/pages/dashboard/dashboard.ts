import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeckService, Deck } from '../../services/deck.service';
import { Auth } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  decks: Deck[] = [];
  username: string | null = '';
  deckToDelete: Deck | null = null;

  constructor(
    private deckService: DeckService,
    private auth: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {} 

  ngOnInit(): void {
    this.username = this.auth.getUsername();
    this.loadDecks();
  }

  loadDecks(): void {
    this.deckService.getAll().subscribe({
      next: (data) => {
        this.decks = data.filter(deck => deck.username === this.username);
        this.cdr.detectChanges();
      }, 
      error: (err) => console.error('Error while loading decks', err)
    });
  }

  viewDeck(deckId: string | undefined): void {
    if (deckId) {
      this.router.navigate(['/deck', deckId]);
    }
  }

  openDeleteConfirm(event: Event, deck: Deck): void {
    event.stopPropagation();
    this.deckToDelete = deck;
  }

  closeDeleteConfirm(): void {
    this.deckToDelete = null;
  }

  confirmDelete(): void {
    if (!this.deckToDelete || !this.deckToDelete.id) return;

    this.deckService.delete(this.deckToDelete.id).subscribe({
      next: () => {
        this.decks = this.decks.filter(d => d.id !== this.deckToDelete?.id);
        this.closeDeleteConfirm();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to delete deck:', err);
        this.closeDeleteConfirm();
      }
    });
  }
}