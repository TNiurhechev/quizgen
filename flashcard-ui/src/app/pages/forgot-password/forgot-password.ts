import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  email = '';
  code = '';
  newPassword = '';
  codeSent = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private auth: Auth, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  requestResetCode(): void {
    this.errorMessage = '';
    this.successMessage = '';
    
    if (!this.email) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }

    this.isLoading = true;
    this.auth.forgotPassword(this.email).subscribe({
      next: (res) => {
        console.log('Success response received:', res);
        this.successMessage = 'If an account exists, a reset code has been sent.';
        this.codeSent = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error response received:', err);
        this.errorMessage = err.error?.message || 'Failed to request reset code.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitNewPassword(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.code || !this.newPassword) {
      this.errorMessage = 'Please provide both the reset code and a new password.';
      return;
    }

    this.isLoading = true;
    this.auth.resetPassword(this.email, this.code, this.newPassword).subscribe({
      next: () => {
        this.successMessage = 'Password reset successfully! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Invalid code or failed to reset password.';
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }
}