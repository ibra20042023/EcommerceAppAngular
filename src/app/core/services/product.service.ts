import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListParams,
  PaginatedResponse,
  GeneralResponse,
} from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = environment.API_URL;
  private http = inject(HttpClient);

  // Get products with pagination and filters
  getProducts(
    params: ProductListParams
  ): Observable<GeneralResponse<PaginatedResponse<Product[]>>> {
    let queryParams = new HttpParams();

    if (params.searchTerm) {
      queryParams = queryParams.append('SearchTerm', params.searchTerm);
    }

    if (params.categoryId) {
      queryParams = queryParams.append('CategoryId', params.categoryId);
    }

    if (params.featured !== undefined) {
      queryParams = queryParams.append('Featured', params.featured.toString());
    }

    if (params.priceMin !== undefined) {
      queryParams = queryParams.append('PriceMin', params.priceMin.toString());
    }

    if (params.priceMax !== undefined) {
      queryParams = queryParams.append('PriceMax', params.priceMax.toString());
    }

    // Pagination parameters
    if (params.pageNumber !== undefined) {
      queryParams = queryParams.append('PageNumber', params.pageNumber.toString());
    }

    if (params.pageSize !== undefined) {
      queryParams = queryParams.append('PageSize', params.pageSize.toString());
    }

    return this.http.get<GeneralResponse<PaginatedResponse<Product[]>>>(`${this.apiUrl}/products`, {
      params: queryParams,
    });
  }

  // Get product by ID
  getProductById(id: number): Observable<GeneralResponse<Product>> {
    return this.http.get<GeneralResponse<Product>>(`${this.apiUrl}/products/${id}`);
  }

  // Get featured products
  getFeaturedProducts(): Observable<GeneralResponse<PaginatedResponse<Product[]>>> {
    let queryParams = new HttpParams();

    queryParams = queryParams.append('Featured', 'true');
    queryParams = queryParams.append('PageNumber', '1');
    queryParams = queryParams.append('PageSize', '8');

    return this.http.get<GeneralResponse<PaginatedResponse<Product[]>>>(`${this.apiUrl}/products`, {
      params: queryParams,
    });
  }

  // Create product
  createProduct(request: CreateProductRequest): Observable<GeneralResponse<string>> {
    return this.http.post<GeneralResponse<string>>(`${this.apiUrl}/products/`, request);
  }

  // Update product
  updateProduct(id: number, request: UpdateProductRequest): Observable<GeneralResponse<string>> {
    return this.http.put<GeneralResponse<string>>(`${this.apiUrl}/products/${id}`, request);
  }

  // Delete product
  deleteProduct(id: number): Observable<GeneralResponse<string>> {
    return this.http.delete<GeneralResponse<string>>(`${this.apiUrl}/products/${id}`);
  }
}
