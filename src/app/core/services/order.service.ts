import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Order,
  CreateOrderRequest,
  GeneralResponse,
  PaginatedResponse,
  OrderStatus,
  OrderListParams,
} from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = environment.API_URL;
  private http = inject(HttpClient);

  // Create a new order
  createOrder(request: CreateOrderRequest): Observable<GeneralResponse<string>> {
    return this.http.post<GeneralResponse<string>>(`${this.apiUrl}/orders`, request);
  }

  // Get all orders for the current user
  getOrders(params: OrderListParams): Observable<GeneralResponse<PaginatedResponse<Order[]>>> {
    let queryParams = new HttpParams();

    if (params.searchTerm) {
      queryParams = queryParams.append('SearchTerm', params.searchTerm);
    }

    if (params.userId) {
      queryParams = queryParams.append('UserId', params.userId);
    }

    return this.http.get<GeneralResponse<PaginatedResponse<Order[]>>>(`${this.apiUrl}/orders`, {
      params: queryParams,
    });
  }

  // Get a specific order by ID (simulated)
  getOrderById(orderId: number): Observable<GeneralResponse<Order>> {
    return this.http.get<GeneralResponse<Order>>(`${this.apiUrl}/orders/${orderId}`);
  }

  // Cancel an order
  cancelOrder(orderId: number): Observable<GeneralResponse<string>> {
    return this.http.delete<GeneralResponse<string>>(`${this.apiUrl}/orders/${orderId}`);
  }

  // Update an order
  updateOrder(orderId: number, orderStatus: OrderStatus): Observable<GeneralResponse<string>> {
    return this.http.put<GeneralResponse<string>>(`${this.apiUrl}/orders/${orderId}`, {
      status: orderStatus,
    });
  }
}
