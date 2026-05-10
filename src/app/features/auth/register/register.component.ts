import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AuthModalService } from '../../../core/services/auth-modal.service';
import { finalize } from 'rxjs/operators';
import { RegisterRequest } from '../../../core/models/models';
import { phoneValidator } from '../../../core/utils/phone.validator';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  imports: [ReactiveFormsModule, NgClass],
})
export class RegisterComponent {
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showPassword = signal(false);

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  public modalService = inject(AuthModalService);

  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: ['', [Validators.required, phoneValidator]],
  });

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  closeModal(): void {
    this.modalService.closeModal();
    this.registerForm.reset();
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  openLogin(): void {
    this.modalService.openLogin();
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService
      .register(this.registerForm.value as RegisterRequest)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.successMessage.set(response.data);
          setTimeout(() => {
            this.modalService.closeModal();
            this.registerForm.reset();
            this.router.navigate(['/']);
          }, 3000);
        },
      });
  }
}
