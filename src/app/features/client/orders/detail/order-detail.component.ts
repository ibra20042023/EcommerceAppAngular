import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Order } from '../../../../core/models/models';
import { OrderService } from '../../../../core/services/order.service';
import { OrderDetailComponent } from '../../../../shared/components/order-detail/order-detail';

@Component({
  selector: 'app-order-client-detail',
  templateUrl: './order-detail.component.html',
  imports: [OrderDetailComponent],
})
export class OrderClientDetailComponent implements OnInit {
  order = signal<Order | null>(null);
  loading = signal(false);

  private orderService = inject(OrderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetail(orderId);
    }
  }

  loadOrderDetail(orderId: string): void {
    this.loading.set(true);
    this.orderService
      .getOrderById(Number(orderId))
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          this.order.set(response.data);
        },
        error: () => {
          this.router.navigate(['/orders']);
        },
      });
  }
}
