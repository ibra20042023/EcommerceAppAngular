import { Component, signal, effect, inject } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { NgClass } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { AuthModalService } from '../../../core/services/auth-modal.service';
import { email } from '@angular/forms/signals';
import { ResetPasswordRequest } from '../../../core/models/models';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  imports: [ReactiveFormsModule, NgClass],
})
export class ResetPasswordComponent {
  loading = signal(false);
  token = signal<string | null>(null);
  email = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  public modalService = inject(AuthModalService);

  resetPasswordForm = this.fb.group(
    {
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: this.passwordMatchValidator,
    }
  );

  constructor() {
    effect(() => {
      const email = this.modalService.email();
      if (email) {
        this.resetPasswordForm.patchValue({ email });
        this.email.set(email);
      }
    });

    effect(() => {
      const token = this.modalService.token();
      if (token) {
        this.token.set(token);
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.resetPasswordForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  hasPasswordMismatch(): boolean {
    return !!(
      this.resetPasswordForm.hasError('passwordMismatch') &&
      this.resetPasswordForm.get('confirmPassword')?.touched
    );
  }

  closeModal(): void {
    this.modalService.closeModal();
    this.resetPasswordForm.reset();
    this.successMessage.set(null);
  }

  openLogin(): void {
    this.modalService.openLogin();
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.successMessage.set(null);

    this.authService
      .resetPassword(this.token()!, {
        password: this.resetPasswordForm.value.password,
        email: this.email()!,
      } as ResetPasswordRequest)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.successMessage.set(response.data);
          // Transition to login modal after success
          setTimeout(() => {
            this.resetPasswordForm.reset();
            this.modalService.openLogin();
          }, 3000);
        },
      });
  }
}
