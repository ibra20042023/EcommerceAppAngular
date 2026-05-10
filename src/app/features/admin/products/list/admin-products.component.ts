import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, startWith } from 'rxjs/operators';
import {
  Product,
  Category,
  CreateProductRequest,
  UpdateProductRequest,
} from '../../../../core/models/models';
import { CategoryService } from '../../../../core/services/category.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProductService } from '../../../../core/services/product.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  imports: [
    ReactiveFormsModule,
    LoadingComponent,
    ModalComponent,
    ConfirmModalComponent,
    RouterModule,
  ],
})
export class AdminProductsComponent implements OnInit {
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  saving = signal(false);
  showForm = signal(false);
  editingProduct = signal<Product | null>(null);

  // Pagination & Search
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = signal(0);
  hasPreviousPage = signal(false);
  hasNextPage = signal(false);
  Math = Math;

  // Delete confirmation state
  showDeleteConfirm = signal(false);
  productToDelete = signal<number | null>(null);
  searchControl = new FormControl('');

  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private notificationService = inject(NotificationService);

  productForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoryId: ['', Validators.required],
    featured: [false],
  });

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(startWith(''), debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadData();
      });
  }

  loadData() {
    this.loading.set(true);
    forkJoin({
      productsRes: this.productService.getProducts({
        pageNumber: this.currentPage(),
        pageSize: this.pageSize(),
        searchTerm: this.searchControl.value || undefined,
      }),
      categoriesRes: this.categoryService.getCategories({
        pageNumber: 1,
        pageSize: 99999999,
        searchTerm: undefined,
      }),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ productsRes, categoriesRes }) => {
          this.products.set(productsRes.data.items);
          this.totalItems.set(productsRes.data.totalCount);
          this.totalPages.set(productsRes.data.totalPages);
          this.hasPreviousPage.set(productsRes.data.hasPreviousPage);
          this.hasNextPage.set(productsRes.data.hasNextPage);
          this.categories.set(categoriesRes.data.items);
        },
      });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadData();
  }

  resetForm() {
    this.productForm.reset({ price: 0, stock: 0, featured: false });
  }

  editProduct(product: Product) {
    this.editingProduct.set(product);
    this.productForm.patchValue({ ...product, categoryId: product.categoryId.toString() });
    this.showForm.set(true);
  }

  saveProduct() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    this.editingProduct() === null ? this.createProduct() : this.updateProduct();
  }

  createProduct() {
    const newProduct: CreateProductRequest = {
      name: this.productForm.value.name!,
      description: this.productForm.value.description!,
      price: this.productForm.value.price!,
      stock: this.productForm.value.stock!,
      categoryId: Number(this.productForm.value.categoryId!),
      featured: this.productForm.value.featured!,
    };

    this.productService
      .createProduct(newProduct)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (response) => {
          this.loadData();
          this.showForm.set(false);
          this.resetForm();
          this.notificationService.showSuccess(response.data);
        },
      });
  }

  updateProduct() {
    const updatedProduct: UpdateProductRequest = {
      name: this.productForm.value.name!,
      description: this.productForm.value.description!,
      price: this.productForm.value.price!,
      stock: this.productForm.value.stock!,
      categoryId: Number(this.productForm.value.categoryId!),
      featured: this.productForm.value.featured!,
    };

    this.productService
      .updateProduct(this.editingProduct()!.id, updatedProduct)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (response) => {
          this.loadData();
          this.showForm.set(false);
          this.resetForm();
          this.notificationService.showSuccess(response.data);
          this.editingProduct.set(null);
        },
      });
  }

  confirmDelete(id: number) {
    this.productToDelete.set(id);
    this.showDeleteConfirm.set(true);
  }

  deleteProduct() {
    const id = this.productToDelete();
    if (!id) return;

    this.productService.deleteProduct(id).subscribe({
      next: (response) => {
        this.loadData();
        this.showDeleteConfirm.set(false);
        this.productToDelete.set(null);
        this.notificationService.showSuccess(response.data);
      },
    });
  }

  getCategoryName(categoryId: number): string {
    return this.categories().find((c) => c.id === categoryId)?.name || 'Sin categoría';
  }
}
