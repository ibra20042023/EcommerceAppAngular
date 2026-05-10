import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Client routes
  {
    path: '',
    loadComponent: () =>
      import('./features/client/client-layout/client-layout.component').then(
        (m) => m.ClientLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/client/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/client/products/list/product-catalog.component').then(
            (m) => m.ProductCatalogComponent
          ),
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./features/client/products/detail/product-detail.component').then(
            (m) => m.ProductDetailComponent
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/client/category-list/category-list.component').then(
            (m) => m.CategoryListComponent
          ),
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./features/client/cart/cart.component').then((m) => m.CartComponent),
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./features/client/checkout/checkout.component').then((m) => m.CheckoutComponent),
        canActivate: [authGuard],
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/client/orders/list/order-list.component').then(
            (m) => m.OrderListComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./features/client/orders/detail/order-detail.component').then(
            (m) => m.OrderClientDetailComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/client/profile/profile.component').then((m) => m.ProfileComponent),
        canActivate: [authGuard],
      },
      {
        path: 'wishlist',
        loadComponent: () =>
          import('./features/client/wishlist/wishlist.component').then((m) => m.WishlistComponent),
        canActivate: [authGuard],
      },
    ],
  },

  // Admin routes
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/products/list/admin-products.component').then(
            (m) => m.AdminProductsComponent
          ),
      },
      {
        path: 'products/:id/images',
        loadComponent: () =>
          import('./features/admin/products/product-images/admin-product-images.component').then(
            (m) => m.AdminProductImagesComponent
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/categories/admin-categories.component').then(
            (m) => m.AdminCategoriesComponent
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users/admin-users.component').then((m) => m.AdminUsersComponent),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/admin/orders/list/admin-orders.component').then(
            (m) => m.AdminOrdersComponent
          ),
      },
      {
        path: 'orders/:id/detail',
        loadComponent: () =>
          import('./features/admin/orders/detail/admin-order-detail.component').then(
            (m) => m.AdminOrderDetailComponent
          ),
      },
    ],
  },

  // Redirect unknown routes
  {
    path: '**',
    redirectTo: '',
  },
];
