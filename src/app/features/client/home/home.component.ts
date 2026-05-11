import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product, Category } from '../../../core/models/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [RouterLink, LoadingComponent, ProductCardComponent],
})
export class HomeComponent implements OnInit {
  featuredProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);

  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);

  ngOnInit() {
    forkJoin({
      featuredResponse: this.productService.getFeaturedProducts(),
      categoriesResponse: this.categoryService.getCategories({ pageNumber: 1, pageSize: 5 }),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ featuredResponse, categoriesResponse }) => {
          this.featuredProducts.set(featuredResponse.data.items);
          this.categories.set(categoriesResponse.data.items);
        },
      });
  }

  onAddToCart(product: Product) {
    this.cartService.addToCart(product, 1);
    this.notificationService.show(`${product.name} Ajouté au panier`, 'success');
  }
}
