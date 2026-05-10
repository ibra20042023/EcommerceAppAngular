// Validation request
export interface ValidationError {
  field: string;
  errors: string[];
}

// User Roles
export enum UserRole {
  CLIENTE = 'Cliente',
  ADMINISTRADOR = 'Administrador',
}

// User Interface
export interface User {
  id: number;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  useSameAddressForBilling?: boolean;
  shippingAddress?: Address;
  billingAddress?: Address;
}

// Auth Interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
  shoppingCart: CartItem[];
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  password: string;
  token: string;
}

// Product Interface
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  category?: Category;
  images: ProductImage[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: number;
  path: string;
  productId: number;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  featured?: boolean;
  images?: ProductImage[];
}

export interface ProductListParams extends PaginationParams {
  priceMax?: number;
  priceMin?: number;
  categoryId?: string;
  featured?: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

// Category Interface
export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

// Pagination
export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
}

export interface PaginatedResponse<T> {
  items: T;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Upload Interface
export interface UploadImageRequest {
  file: File;
  productId: string;
}

export interface UploadImageResponse {
  imageId: string;
  url: string;
}

export type ConfirmType = 'danger' | 'warning' | 'info';

export interface GeneralResponse<T> {
  data: T;
  message: string;
}

// Cart Interfaces
export interface CartItem {
  product: Product;
  quantity: number;
  disabledInStock?: boolean;
}

export interface CreateOrUpdateShoppingCartRequest {
  userId: number;
  items: { productId: number; quantity: number }[];
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// Address Interface
export interface Address {
  street: string;
  city: string;
  state: string;
  code: string;
  country: string;
}

// Payment Interfaces
export enum PaymentMethod {
  CREDIT_CARD = 'Credit Card',
  DEBIT_CARD = 'Debit Card',
}

export interface PaymentInfo {
  method: PaymentMethod;
  cardHolderName: string;
  cardLastFour: string;
}

// Order Interfaces
export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
}

export interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  items: OrderItem[];
  billingAddress: OrderAddress;
  shippingAddress: OrderAddress;
  paymentInfo: PaymentInfo;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  firstName: string;
  lastName: string;
}

export interface OrderAddress extends Address {
  email?: string;
  phone?: string;
}

export interface OrderListParams extends PaginationParams {
  userId?: string;
}

export interface CreateOrderRequest {
  userId: number;
  items: OrderItem[];
  billingAddress: OrderAddress;
  shippingAddress: OrderAddress;
  paymentInfo: PaymentInfo;
}

export interface UpdateUserAddressRequest {
  shippingAddress: Address;
  billingAddress: Address;
}
