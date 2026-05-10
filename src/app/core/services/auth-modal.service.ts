import { Injectable, signal } from '@angular/core';

export type AuthModalType = 'login' | 'register' | 'forgot-password' | 'reset-password' | null;

@Injectable({
  providedIn: 'root',
})
export class AuthModalService {
  private currentModal = signal<AuthModalType>(null);
  private resetPasswordEmail = signal<string>('');
  private resetPasswordToken = signal<string>('');

  // Public readonly signals
  readonly activeModal = this.currentModal.asReadonly();
  readonly email = this.resetPasswordEmail.asReadonly();
  readonly token = this.resetPasswordToken.asReadonly();

  openLogin(): void {
    this.currentModal.set('login');
  }

  openRegister(): void {
    this.currentModal.set('register');
  }

  openForgotPassword(): void {
    this.currentModal.set('forgot-password');
  }

  openResetPassword(email: string, token: string): void {
    this.resetPasswordEmail.set(email);
    this.resetPasswordToken.set(token);
    this.currentModal.set('reset-password');
  }

  closeModal(): void {
    this.currentModal.set(null);
    this.resetPasswordEmail.set('');
  }

  isOpen(modalType: AuthModalType): boolean {
    return this.currentModal() === modalType;
  }
}
