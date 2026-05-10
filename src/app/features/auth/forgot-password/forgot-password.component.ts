import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AuthModalService } from '../../../core/services/auth-modal.service';
import { ForgotPasswordRequest } from '../../../core/models/models';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  imports: [ReactiveFormsModule, NgClass],
})
export class ForgotPasswordComponent {
  loading = signal(false);
  successMessage = signal<string | null>(null);

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  public modalService = inject(AuthModalService);

  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  isFieldInvalid(fieldName: string): boolean {
    const field = this.forgotPasswordForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  closeModal(): void {
    this.modalService.closeModal();
    this.forgotPasswordForm.reset();
    this.successMessage.set(null);
  }

  openLogin(): void {
    this.modalService.openLogin();
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.successMessage.set(null);

    const email = this.forgotPasswordForm.value.email as string;

    this.authService.forgotPassword({ email } as ForgotPasswordRequest).subscribe({
      next: (response) => {
        this.successMessage.set(
          'Se ha solicitado restablecer tu contraseña correctamente. Revisa tu correo electrónico para continuar.'
        );
        // Transition to reset password modal with email
        setTimeout(() => {
          this.forgotPasswordForm.reset();
          this.modalService.openResetPassword(email, response.data);
          this.loading.set(false);
        }, 3000);
      },
      error: () => {
        this.loading.set(false);
        this.successMessage.set(null);
      },
    });
  }
}
