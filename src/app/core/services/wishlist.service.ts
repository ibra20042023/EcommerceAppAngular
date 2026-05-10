import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { GeneralResponse, Product } from '../models/models';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private apiUrl = environment.API_URL;
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private productsInWishlist = signal<Product[]>([]);

  // Computed signals
  wishlist = this.productsInWishlist.asReadonly();
  totalItems = computed(() => this.productsInWishlist().length);

  // Get wishlist
  getWishlist(userId: number): Observable<GeneralResponse<Product[]>> {
    return this.http
      .get<GeneralResponse<Product[]>>(`${this.apiUrl}/users/wishlist/${userId}`)
      .pipe(
        tap((response) => {
          this.productsInWishlist.set(response.data);
        })
      );
  }

  // Add product to wishlist
  toggleWishlist(productId: number, userId: number): Observable<GeneralResponse<string>> {
    return this.http
      .post<GeneralResponse<string>>(`${this.apiUrl}/users/wishlist/${userId}`, {
        productId,
      })
      .pipe(
        tap(() => {
          this.clearWishlist();
        })
      );
  }

  // Check if product is in wishlist
  isInWishlist(productId: number): boolean {
    return this.wishlist().some((item) => item.id === productId);
  }

  // Clear wishlist
  clearWishlist(): void {
    this.productsInWishlist.set([]);
    if (this.authService.isAuthenticated())
      this.getWishlist(this.authService.currentUser()?.id!).subscribe();
  }
}
