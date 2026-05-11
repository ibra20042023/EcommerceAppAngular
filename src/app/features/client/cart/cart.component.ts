import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { AuthModalService } from '../../../core/services/auth-modal.service';
import { ProductService } from '../../../core/services/product.service';
import { CartItem, Product } from '../../../core/models/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  imports: [RouterLink, LoadingComponent],
})
export class CartComponent {
  cartService = inject(CartService);
  productService = inject(ProductService);
  loading = signal(false);
  private authService = inject(AuthService);
  private authModalService = inject(AuthModalService);
  private router = inject(Router);

  // Increase quantity
  increaseQuantity(productId: number, currentQuantity: number): void {
    this.cartService.updateQuantity(productId, currentQuantity + 1);
  }

  // Get product stock
  getProductStock(productId: number, item: CartItem) {
    this.loading.set(true);
    const product = this.productService
      .getProductById(productId)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          this.validateStock(response.data, item.quantity + 1)
            ? this.increaseQuantity(productId, item.quantity)
            : (item.disabledInStock = true);
        },
      });
  }

  // Validate stock
  validateStock(product: Product, quantity: number): boolean {
    return quantity <= product.stock!;
  }

  // Decrease quantity
  decreaseQuantity(productId: number, currentQuantity: number, item: CartItem): void {
    if (currentQuantity > 1) {
      this.cartService.updateQuantity(productId, currentQuantity - 1);
      item.disabledInStock = false;
    }
  }

  // Remove item from cart
  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  // Proceed to checkout
  proceedToCheckout(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/checkout']);
    } else {
      // Open login modal if not authenticated
      this.authModalService.openLogin();
    }
  }
}
