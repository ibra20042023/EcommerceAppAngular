import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Order } from '../../../../core/models/models';
import { OrderService } from '../../../../core/services/order.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { OrderDetailComponent } from '../../../../shared/components/order-detail/order-detail';

@Component({
  selector: 'app-admin-order-detail',
  templateUrl: './admin-order-detail.component.html',
  imports: [RouterModule, LoadingComponent, OrderDetailComponent],
})
export class AdminOrderDetailComponent implements OnInit {
  order = signal<Order | null>(null);
  loading = signal(true);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    } else {
      this.router.navigate(['/admin/orders']);
    }
  }

  loadOrder(orderId: string) {
    this.loading.set(true);
    this.orderService
      .getOrderById(Number(orderId))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.order.set(response.data);
        },
        error: () => {
          this.router.navigate(['/admin/orders']);
        },
      });
  }
}
