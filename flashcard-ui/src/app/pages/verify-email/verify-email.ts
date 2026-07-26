import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css'
})
export class VerifyEmail implements OnInit {
  email = '';
  code = '';
  errorMessage = '';
  successMessage = '';

  constructor(
    private auth: Auth, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email || !this.code) {
      this.errorMessage = 'Please provide both email and verification code.';
      return;
    }

    this.auth.verifyEmail(this.email, this.code).subscribe({
      next: () => {
        this.successMessage = 'Email verified successfully! Redirecting...';
        setTimeout(() => this.router.navigate(['/']), 1500);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Invalid verification code.';
        console.error(err);
      }
    });
  }
}