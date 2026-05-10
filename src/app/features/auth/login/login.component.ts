import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { AuthModalService } from '../../../core/services/auth-modal.service';
import { LoginRequest } from '../../../core/models/models';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private wishlistService = inject(WishlistService);
  private router = inject(Router);
  public modalService = inject(AuthModalService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  closeModal(): void {
    this.modalService.closeModal();
    this.loginForm.reset();
    this.errorMessage.set(null);
  }

  openRegister(): void {
    this.modalService.openRegister();
  }

  openForgotPassword(): void {
    this.modalService.openForgotPassword();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService
      .login(this.loginForm.value as LoginRequest)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          // Close modal and navigate based on user role
          this.modalService.closeModal();
          this.loginForm.reset();
          if (response.data.user.role === 'Administrador') {
            this.router.navigate(['/admin']);
          } else {
            this.wishlistService.getWishlist(response.data.user.id).subscribe();
            this.router.navigate(['/']);
          }
        },
      });
  }
}
