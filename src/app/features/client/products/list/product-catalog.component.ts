import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { combineLatestWith, debounceTime, finalize, startWith } from 'rxjs/operators';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card';
import { Product, Category, ProductListParams } from '../../../../core/models/models';
import { CartService } from '../../../../core/services/cart.service';
import { CategoryService } from '../../../../core/services/category.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProductService } from '../../../../core/services/product.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-product-catalog',
  templateUrl: './product-catalog.component.html',
  imports: [ReactiveFormsModule, LoadingComponent, ProductCardComponent, PaginationComponent],
})
export class ProductCatalogComponent implements OnInit {
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  hasPreviousPage = signal(false);
  hasNextPage = signal(false);

  searchControl = new FormControl('');
  categoryControl = new FormControl('');
  minPriceControl = new FormControl<number | null>(null);
  maxPriceControl = new FormControl<number | null>(null);

  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    // Load categories
    this.categoryService
      .getCategories({ pageNumber: 1, pageSize: 999999 })
      .subscribe((response) => {
        this.categories.set(response.data.items);
      });

    // Check for category filter from query params
    this.route.queryParams.subscribe((params) => {
      if (params['categoryId']) {
        this.categoryControl.setValue(params['categoryId']);
      }
    });

    // Subscribe to filter changes
    this.searchControl.valueChanges
      .pipe(
        startWith(''),
        combineLatestWith(
          this.categoryControl.valueChanges.pipe(startWith('')),
          this.minPriceControl.valueChanges.pipe(startWith(null)),
          this.maxPriceControl.valueChanges.pipe(startWith(null))
        ),
        debounceTime(400)
      )
      .subscribe(() => this.loadProducts());

    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);

    const params: ProductListParams = {
      pageNumber: this.currentPage(),
      pageSize: 12,
      searchTerm: this.searchControl.value || undefined,
      categoryId: this.categoryControl.value || undefined,
      priceMin: this.minPriceControl.value || undefined,
      priceMax: this.maxPriceControl.value || undefined,
    };

    this.productService
      .getProducts(params)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.products.set(response.data.items);
          this.totalPages.set(response.data.totalPages);
          this.hasPreviousPage.set(response.data.hasPreviousPage);
          this.hasNextPage.set(response.data.hasNextPage);
        },
      });
  }

  changePage(page: number) {
    this.currentPage.set(page);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product, 1);
    this.notificationService.show(`${product.name} Ajouté au panier`, 'success');
  }
}
