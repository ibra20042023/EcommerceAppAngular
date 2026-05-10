import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { UserService } from '../../../core/services/user.service';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  imports: [RouterLink],
})
export class AdminDashboardComponent implements OnInit {
  stats = signal({
    totalProducts: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalOrders: 0,
  });

  pageNumber = signal(1);
  pageSize = signal(99999999);

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private userService: UserService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    forkJoin({
      productsResponse: this.productService.getProducts({
        pageNumber: this.pageNumber(),
        pageSize: this.pageSize(),
      }),
      categoriesResponse: this.categoryService.getCategories({
        pageNumber: this.pageNumber(),
        pageSize: this.pageSize(),
      }),
      usersResponse: this.userService.getUsers({
        pageNumber: this.pageNumber(),
        pageSize: this.pageSize(),
      }),
      ordersResponse: this.orderService.getOrders({
        pageNumber: this.pageNumber(),
        pageSize: this.pageSize(),
      }),
    }).subscribe({
      next: ({ productsResponse, categoriesResponse, usersResponse, ordersResponse }) => {
        this.stats.set({
          totalProducts: productsResponse.data.totalCount,
          totalCategories: categoriesResponse.data.totalCount,
          totalUsers: usersResponse.data.totalCount,
          totalOrders: ordersResponse.data.totalCount,
        });
      },
    });
  }
}
