import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Order, OrderListParams, OrderStatus } from '../../../../core/models/models';
import { OrderService } from '../../../../core/services/order.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  imports: [PaginationComponent],
})
export class OrderListComponent implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  pageSize = 5;
  totalPages = signal(0);
  totalCount = signal(0);
  hasPreviousPage = signal(false);
  hasNextPage = signal(true);

  OrderStatus = OrderStatus;

  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    const orderParams: OrderListParams = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize,
      userId: this.authService.currentUser()?.id.toString(),
    };
    this.orderService
      .getOrders(orderParams)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.orders.set(response.data.items);
          this.totalPages.set(response.data.totalPages);
          this.totalCount.set(response.data.totalCount);
          this.hasPreviousPage.set(response.data.hasPreviousPage);
          this.hasNextPage.set(response.data.hasNextPage);
        },
      });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadOrders();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  viewOrderDetail(orderId: number): void {
    this.router.navigate(['/orders', orderId]);
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case OrderStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case OrderStatus.SHIPPED:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  getStatusIcon(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return '⏳';
      case OrderStatus.PROCESSING:
        return '⚙️';
      case OrderStatus.SHIPPED:
        return '🚚';
      case OrderStatus.DELIVERED:
        return '✅';
      case OrderStatus.CANCELLED:
        return '❌';
      default:
        return '📦';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
