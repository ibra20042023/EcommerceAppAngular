import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  User,
  PaginationParams,
  PaginatedResponse,
  GeneralResponse,
  UpdateUserAddressRequest,
} from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.API_URL;
  private http = inject(HttpClient);

  // Get users with pagination and filters
  getUsers(params: PaginationParams): Observable<GeneralResponse<PaginatedResponse<User[]>>> {
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

    return this.http.get<GeneralResponse<PaginatedResponse<User[]>>>(`${this.apiUrl}/users`, {
      params: queryParams,
    });
  }

  // Get user by ID
  getUserById(id: number): Observable<GeneralResponse<User>> {
    return this.http.get<GeneralResponse<User>>(`${this.apiUrl}/users/${id}`);
  }

  // Update user profile
  updateProfile(id: number, updateUser: Partial<User>): Observable<GeneralResponse<string>> {
    return this.http.put<GeneralResponse<string>>(`${this.apiUrl}/users/profile/${id}`, updateUser);
  }

  // Update user role (Admin only)
  updateUserRole(id: number): Observable<GeneralResponse<string>> {
    return this.http.put<GeneralResponse<string>>(`${this.apiUrl}/users/role/${id}`, {});
  }

  // Delete user (Admin only)
  deleteUser(id: number): Observable<GeneralResponse<string>> {
    return this.http.delete<GeneralResponse<string>>(`${this.apiUrl}/users/${id}`);
  }

  // Update user profile
  updateUserProfile(id: number, request: Partial<User>): Observable<GeneralResponse<string>> {
    return this.http.put<GeneralResponse<string>>(`${this.apiUrl}/users/profile/${id}`, request);
  }

  // Update user address
  updateUserAddress(
    id: number,
    request: UpdateUserAddressRequest
  ): Observable<GeneralResponse<string>> {
    return this.http.put<GeneralResponse<string>>(`${this.apiUrl}/users/address/${id}`, request);
  }
}
