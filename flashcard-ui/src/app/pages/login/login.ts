import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  credentials = {username: '', password: ''};
  errorMessage = '';

  constructor(private auth: Auth, private router: Router){}

  onSubmit(): void {
    this.auth.login(this.credentials).subscribe({
      next: (response: any) => {
        this.auth.setSession(response.token, this.credentials.username);
        this.router.navigate(['/']);
      },
      error: (err) => {
        if (err.status === 403 && err.error?.requiresVerification) 
          this.router.navigate(['/verify-email'], { queryParams: { email: this.credentials.username } });
        else 
          this.errorMessage = err.error?.message || 'Invalid username or password!';
        console.error(err);
      }
    });
  }
}
