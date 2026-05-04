import { Component, computed, inject, input, output, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Order, OrderStatus } from '../../../core/models/models';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { OrderService } from '../../../core/services/order.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.html',
  imports: [RouterLink, ConfirmModalComponent, NgClass, FormsModule],
})
export class OrderDetailComponent {
  order = input<Order | null>(null);
  reloadOrder = output<string>();

  loading = signal(false);
  OrderStatus = OrderStatus;
  showCancelModal = signal(false);
  showUpdateModal = signal(false);
  newStatus = signal<OrderStatus | null>(null);

  isAdmin = computed(() => this.authService.isAdmin());

  // Admin functionality
  statusOptions = [
    { value: OrderStatus.PENDING, label: 'En attente' },
    { value: OrderStatus.PROCESSING, label: 'Traitement en cours' },
    { value: OrderStatus.SHIPPED, label: 'Envoyé' },
    { value: OrderStatus.DELIVERED, label: 'Livré' },
    { value: OrderStatus.CANCELLED, label: 'Annulé' },
  ];

  private orderService = inject(OrderService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  openCancelModal(): void {
    this.showCancelModal.set(true);
  }

  closeCancelModal(): void {
    this.showCancelModal.set(false);
  }

  confirmCancelOrder(): void {
    const currentOrder = this.order();
    if (!currentOrder) return;

    this.loading.set(true);
    this.orderService
      .cancelOrder(currentOrder.id)
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.closeCancelModal();
        })
      )
      .subscribe({
        next: (response) => {
          this.notificationService.show(response.message, 'success');
          this.reloadOrder.emit(this.order()!.id.toString());
        },
      });
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

  getStatusSteps(): { label: string; status: OrderStatus; completed: boolean }[] {
    const currentOrder = this.order();
    if (!currentOrder) return [];

    const statusOrder = [
      OrderStatus.PENDING,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ];

    const currentIndex = statusOrder.indexOf(currentOrder.status);

    return statusOrder.map((status, index) => ({
      label: this.getStatus(status),
      status,
      completed: index <= currentIndex,
    }));
  }

  getProgressWidth(): string {
    const steps = this.getStatusSteps();
    const completedCount = steps.filter((step) => step.completed).length;
    const percentage = (completedCount - 1) * 33.33;
    return `${percentage}%`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatus(status: OrderStatus) {
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
        return 'État deconnecté';
    }
  }

  // Admin functionality
  canChangeStatus(): boolean {
    return (
      this.authService.isAdmin() &&
      this.order()?.status !== OrderStatus.DELIVERED &&
      this.order()?.status !== OrderStatus.CANCELLED
    );
  }

  toggleUpdateModal(newStatus: OrderStatus | null): void {
    this.showUpdateModal.set(!this.showUpdateModal());
    this.newStatus.set(newStatus);
  }

  getStatusOptionClass(status: OrderStatus): string {
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

  updateStatus() {
    const currentOrder = this.order();
    if (!currentOrder) return;

    this.loading.set(true);
    this.orderService
      .updateOrder(currentOrder.id, this.newStatus()!)
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.toggleUpdateModal(null);
        })
      )
      .subscribe({
        next: (response) => {
          this.notificationService.showSuccess(response.data);
          this.reloadOrder.emit(this.order()!.id.toString());
        },
      });
  }
}
