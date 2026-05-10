import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap, BehaviorSubject, filter, take, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { ValidationError } from '../models/models';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  // Get the token from the auth service
  const token = authService.getToken();

  // Clone the request and add the Authorization header if token exists
  let authReq = req;
  if (token && authService.isAuthenticated()) {
    authReq = addTokenToRequest(req, token);
  }

  // Handle the request and catch any errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 errors with token refresh
      if (error.status === 401) {
        return handle401Error(authReq, next, authService, notificationService, router);
      }

      // Handle other errors
      return handleOtherErrors(error, notificationService);
    })
  );
};

function addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function handle401Error(
  request: HttpRequest<any>,
  next: any,
  authService: AuthService,
  notificationService: NotificationService,
  router: Router
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response): Observable<HttpEvent<unknown>> => {
        isRefreshing = false;
        const newToken = response.data.accessToken;
        refreshTokenSubject.next(newToken);

        // Retry the original request with the new token
        return next(addTokenToRequest(request, newToken));
      }),
      catchError((refreshError) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);

        // Refresh token failed, logout user
        notificationService.showError(
          'Sesión expirada. Por favor, inicia sesión nuevamente.',
          5000
        );
        router.navigate(['/']);
        return throwError(() => refreshError);
      })
    );
  } else {
    // Wait for the token to be refreshed
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token): Observable<HttpEvent<unknown>> => {
        return next(addTokenToRequest(request, token!));
      })
    );
  }
}

function handleOtherErrors(
  error: HttpErrorResponse,
  notificationService: NotificationService
): Observable<HttpEvent<unknown>> {
  let errorMessage = 'Ha ocurrido un error';

  if (error.error instanceof ErrorEvent) {
    // Client-side or network error
    errorMessage = `Error de red: ${error.error.message}`;
  } else {
    // Backend error
    // Try to get error message from backend response
    if (error.status === 422) {
      errorMessage = error.error.data
        .map((error: ValidationError) => error.errors.join(', '))
        .join(', ');
    } else if (error.error?.Message) {
      errorMessage = error.error.Message;
    } else if (error.message) {
      errorMessage = error.message;
    } else {
      errorMessage = `Error ${error.status}: ${error.statusText}`;
    }
  }

  // Show error notification
  notificationService.showError(errorMessage, 5000);

  // Re-throw the error so components can handle it if needed
  return throwError(() => error);
}
