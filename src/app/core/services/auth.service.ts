import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UserRole,
  GeneralResponse,
  CartItem,
} from '../models/models';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);

  // Signals
  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);

  // Computed signals
  currentUser = this.currentUserSignal.asReadonly();
  isAuthenticated = computed(
    () => this.currentUserSignal() !== null && this.tokenSignal() !== null
  );
  isAdmin = computed(() => this.currentUserSignal()?.role === UserRole.ADMINISTRADOR);

  private apiUrl = environment.API_URL;
  private http = inject(HttpClient);

  setAuthenticatedUser(user: User): void {
    this.currentUserSignal.set(user);
  }

  setAccessToken(token: string): void {
    this.tokenSignal.set(token);
  }

  // Login
  login(request: LoginRequest): Observable<GeneralResponse<AuthResponse>> {
    return this.http
      .post<GeneralResponse<AuthResponse>>(`${this.apiUrl}/auth/sign-in`, request, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          this.currentUserSignal.set(response.data.user);
          this.tokenSignal.set(response.data.accessToken);
          this.updateShoppingCart(response.data.shoppingCart);
        })
      );
  }

  // Register
  register(request: RegisterRequest): Observable<GeneralResponse<string>> {
    return this.http.post<GeneralResponse<string>>(`${this.apiUrl}/auth/sign-up`, request);
  }

  // Logout
  logout(): Observable<GeneralResponse<string>> {
    return this.http
      .post<GeneralResponse<string>>(`${this.apiUrl}/auth/sign-out`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.currentUserSignal.set(null);
          this.tokenSignal.set(null);
          localStorage.removeItem('shopping_cart');
          this.router.navigate(['/']);
        })
      );
  }

  // Forgot Password
  forgotPassword(request: ForgotPasswordRequest): Observable<GeneralResponse<string>> {
    return this.http.post<GeneralResponse<string>>(`${this.apiUrl}/auth/forgot-password`, request);
  }

  // Reset Password
  resetPassword(token: string, request: ResetPasswordRequest): Observable<GeneralResponse<string>> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post<GeneralResponse<string>>(`${this.apiUrl}/auth/reset-password`, request, {
      headers,
    });
  }

  // Refresh Token
  refreshToken(): Observable<GeneralResponse<AuthResponse>> {
    return this.http
      .post<GeneralResponse<AuthResponse>>(
        `${this.apiUrl}/auth/refresh-token`,
        {},
        { withCredentials: true }
      )
      .pipe(
        tap((response) => {
          this.currentUserSignal.set(response.data.user);
          this.tokenSignal.set(response.data.accessToken);
          this.updateShoppingCart(response.data.shoppingCart);
        })
      );
  }

  private updateShoppingCart(cartItems: CartItem[]): void {
    const getShoppingCart = localStorage.getItem('shopping_cart');

    if (getShoppingCart == null) {
      localStorage.setItem('shopping_cart', JSON.stringify(cartItems));
    }
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  getUser(): User | null {
    return this.currentUserSignal();
  }

  updateUser(user: User): void {
    this.currentUserSignal.set(user);
  }
}
