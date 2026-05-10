import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../../core/models/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { NotificationService } from '../../../core/services/notification.service';
import { debounceTime, distinctUntilChanged, finalize, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [ReactiveFormsModule, LoadingComponent, ModalComponent, ConfirmModalComponent],
  templateUrl: './admin-categories.component.html',
  styles: [],
})
export class AdminCategoriesComponent implements OnInit {
  categories = signal<Category[]>([]);
  loading = signal(true);
  saving = signal(false);
  showForm = signal(false);
  editingCategory = signal<Category | null>(null);

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
  categoryToDelete = signal<number | null>(null);

  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private notificationService = inject(NotificationService);

  categoryForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
  });
  searchControl = new FormControl('');

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(startWith(''), debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadCategories();
      });
  }

  loadCategories() {
    this.loading.set(true);
    this.categoryService
      .getCategories({
        pageNumber: this.currentPage(),
        pageSize: this.pageSize(),
        searchTerm: this.searchControl.value || undefined,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.categories.set(response.data.items);
          this.totalItems.set(response.data.totalCount);
          this.totalPages.set(response.data.totalPages);
          this.hasPreviousPage.set(response.data.hasPreviousPage);
          this.hasNextPage.set(response.data.hasNextPage);
        },
      });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadCategories();
  }

  resetForm() {
    this.categoryForm.reset();
  }

  editCategory(category: Category) {
    this.editingCategory.set(category);
    this.categoryForm.patchValue(category);
    this.showForm.set(true);
  }

  saveCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const request = this.editingCategory()
      ? this.categoryService.updateCategory(
          this.editingCategory()!.id,
          this.categoryForm.value as UpdateCategoryRequest
        )
      : this.categoryService.createCategory(this.categoryForm.value as CreateCategoryRequest);

    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (response) => {
        this.loadCategories();
        this.showForm.set(false);
        this.resetForm();
        this.notificationService.showSuccess(response.data);
      },
    });
  }

  confirmDelete(id: number) {
    this.categoryToDelete.set(id);
    this.showDeleteConfirm.set(true);
  }

  deleteCategory() {
    const id = this.categoryToDelete();
    if (!id) return;

    this.categoryService.deleteCategory(id).subscribe({
      next: (response) => {
        this.loadCategories();
        this.showDeleteConfirm.set(false);
        this.categoryToDelete.set(null);
        this.notificationService.showSuccess(response.data);
      },
    });
  }
}
