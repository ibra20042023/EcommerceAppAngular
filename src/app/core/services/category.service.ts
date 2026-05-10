import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  PaginationParams,
  PaginatedResponse,
  GeneralResponse,
} from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = environment.API_URL;
  private http = inject(HttpClient);

  // Get categories with pagination and filters
  getCategories(
    params: PaginationParams
  ): Observable<GeneralResponse<PaginatedResponse<Category[]>>> {
    let queryParams = new HttpParams();

    if (params.searchTerm) {
      queryParams = queryParams.append('SearchTerm', params.searchTerm);
    }
    // Pagination parameters
    if (params.pageNumber !== undefined) {
      queryParams = queryParams.append('PageNumber', params.pageNumber.toString());
    }

    if (params.pageSize !== undefined) {
      queryParams = queryParams.append('PageSize', params.pageSize.toString());
    }

    return this.http.get<GeneralResponse<PaginatedResponse<Category[]>>>(
      `${this.apiUrl}/categories`,
      {
        params: queryParams,
      }
    );
  }

  // Get category by ID
  getCategoryById(id: number): Observable<GeneralResponse<Category>> {
    return this.http.get<GeneralResponse<Category>>(`${this.apiUrl}/categories/${id}`);
  }

  // Create product
  createCategory(request: CreateCategoryRequest): Observable<GeneralResponse<string>> {
    return this.http.post<GeneralResponse<string>>(`${this.apiUrl}/categories/`, request);
  }

  // Update product
  updateCategory(id: number, request: UpdateCategoryRequest): Observable<GeneralResponse<string>> {
    return this.http.put<GeneralResponse<string>>(`${this.apiUrl}/categories/${id}`, request);
  }

  // Delete category
  deleteCategory(id: number): Observable<GeneralResponse<string>> {
    return this.http.delete<GeneralResponse<string>>(`${this.apiUrl}/categories/${id}`);
  }
}
