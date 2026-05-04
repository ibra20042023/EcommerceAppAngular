import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, startWith } from 'rxjs';
import { Order, OrderStatus } from '../../../../core/models/models';
import { NotificationService } from '../../../../core/services/notification.service';
import { OrderService } from '../../../../core/services/order.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  imports: [ReactiveFormsModule, LoadingComponent, ConfirmModalComponent, NgClass, RouterLink],
})
export class AdminOrdersComponent implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(false);

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = signal(0);
  hasPreviousPage = signal(false);
  hasNextPage = signal(false);

  // Filter
  searchControl = new FormControl('');

  // Modals
  showCancelConfirm = signal(false);
  orderToCancel = signal<number | null>(null);

  // Order statuses
  OrderStatus = OrderStatus;
  Math = Math;

  private orderService = inject(OrderService);
  private notificationService = inject(NotificationService);

  ngOnInit() {
    this.loadOrders();

    // Setup search with debounce
    this.searchControl.valueChanges
      .pipe(startWith(''), debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadOrders();
      });
  }

  loadOrders() {
    this.loading.set(true);
    this.orderService
      .getOrders({
        pageNumber: this.currentPage(),
        pageSize: this.pageSize(),
        searchTerm: this.searchControl.value || undefined,
      })
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          this.orders.set(response.data.items);
          this.totalItems.set(response.data.totalCount);
          this.totalPages.set(response.data.totalPages);
          this.hasPreviousPage.set(response.data.hasPreviousPage);
          this.hasNextPage.set(response.data.hasNextPage);
        },
      });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadOrders();
  }

  confirmCancel(orderId: number) {
    this.orderToCancel.set(orderId);
    this.showCancelConfirm.set(true);
  }

  cancelOrder() {
    const orderId = this.orderToCancel();
    if (!orderId) return;

    this.orderService
      .cancelOrder(orderId)
      .pipe(
        finalize(() => {
          this.showCancelConfirm.set(false);
          this.orderToCancel.set(null);
        })
      )
      .subscribe({
        next: (response) => {
          this.notificationService.showSuccess(response.data);
          this.loadOrders();
        },
      });
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case OrderStatus.PROCESSING:
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case OrderStatus.SHIPPED:
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case OrderStatus.DELIVERED:
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case OrderStatus.CANCELLED:
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-surface-subtle text-text-muted border-border';
    }
  }

  canCancel(status: OrderStatus): boolean {
    return status !== OrderStatus.DELIVERED && status !== OrderStatus.CANCELLED;
  }

  getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
    switch (currentStatus) {
      case OrderStatus.PENDING:
        return OrderStatus.PROCESSING;
      case OrderStatus.PROCESSING:
        return OrderStatus.SHIPPED;
      case OrderStatus.SHIPPED:
        return OrderStatus.DELIVERED;
      default:
        return null;
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'En attente';
      case OrderStatus.PROCESSING:
        return 'Traitement en cours';
      case OrderStatus.SHIPPED:
        return 'Envoyé';
      case OrderStatus.DELIVERED:
        return 'Livré';
      case OrderStatus.CANCELLED:
        return 'Annulé';
      default:
        return 'Deconnecté';
    }
  }
}
