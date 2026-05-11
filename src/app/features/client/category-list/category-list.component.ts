import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-category-list',
  imports: [RouterLink, LoadingComponent, PaginationComponent],
  templateUrl: './category-list.component.html',
  styles: [],
})
export class CategoryListComponent implements OnInit {
  categories = signal<Category[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  pageSize = signal(5);
  totalPages = signal(0);
  hasPreviousPage = signal(false);
  hasNextPage = signal(false);

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading.set(true);
    this.categoryService
      .getCategories({
        pageNumber: this.currentPage(),
        pageSize: this.pageSize(),
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.categories.set(response.data.items);
          this.totalPages.set(response.data.totalPages);
          this.hasPreviousPage.set(response.data.hasPreviousPage);
          this.hasNextPage.set(response.data.hasNextPage);
        },
      });
  }

  changePage(page: number) {
    this.currentPage.set(page);
    this.loadCategories();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
