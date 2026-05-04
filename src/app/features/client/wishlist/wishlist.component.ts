import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product } from '../../../core/models/models';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  imports: [ProductCardComponent, LoadingComponent, RouterLink],
})
export class WishlistComponent {
  products = signal<Product[]>([]);
  loading = signal(true);

  totalItems = computed(() => this.products().length);

  private wishlistService = inject(WishlistService);
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      const products = this.wishlistService.wishlist();
      this.loadWishlist(products);
    });
  }

  loadWishlist(products: Product[]): void {
    this.loading.set(true);
    setTimeout(() => {
      this.products.set(products);
      this.loading.set(false);
    }, 100);
  }

  addToCart(item: Product): void {
    this.cartService.addToCart(item, 1);
    this.notificationService.showSuccess('Produit ajouté au panier');
  }

  viewProductDetail(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  getProductImage(item: Product): string {
    if (item.images && item.images.length > 0) {
      return item.images[0].path;
    }
    return 'https://via.placeholder.com/300x300?text=No+Image';
  }
}
