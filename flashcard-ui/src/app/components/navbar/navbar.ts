import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    :host {
      display: block;
    }
  `],
  template: `
    <nav class="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-6">
        <h1 class="text-xl font-black text-indigo-500 tracking-wider">QUIZGEN</h1>
        <a routerLink="/" class="text-slate-300 hover:text-white font-medium transition-colors">My Decks</a>
        <a routerLink="/create" class="text-slate-300 hover:text-white font-medium transition-colors">New Deck</a>
      </div>

      <div class="flex items-center gap-4">
        <span class="text-sm text-slate-400">
        Logged in as <span class="text-indigo-400 font-semibold">{{ username }}</span>
      </span>
      <button (click)="logout()" 
        class="bg-transparent border border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium py-1.5 px-4 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900">
        Logout
      </button>
      </div>
    </nav>
  `
})
export class Navbar implements OnInit {
  username: string | null = '';

  constructor(private auth: Auth, private router: Router) {}

  ngOnInit(): void {
    this.username = this.auth.getUsername();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}