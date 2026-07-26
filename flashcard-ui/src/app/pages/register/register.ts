import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  user = { username: '', email: '', password: '' };
  errorMessage = '';
  successMessage = '';

  constructor(private auth: Auth, private router: Router) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.auth.register(this.user).subscribe({
      next: () => {
        this.successMessage = 'Registration successful! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/verify-email'], { queryParams: { email: this.user.email }});
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Username or email already exists.';
        console.error(err);
      }
    });
  }
}