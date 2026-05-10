import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ProductService } from '../../../../core/services/product.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Product, ProductImage } from '../../../../core/models/models';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { ImageService } from '../../../../core/services/image.service';

@Component({
  selector: 'app-admin-product-images',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ConfirmModalComponent],
  templateUrl: './admin-product-images.component.html',
})
export class AdminProductImagesComponent implements OnInit {
  product = signal<Product | null>(null);
  images = signal<ProductImage[]>([]);
  loading = signal(true);
  uploading = signal(false);
  deleting = signal(false);

  // Delete confirmation
  showDeleteConfirm = signal(false);
  imageToDelete = signal<number | null>(null);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private imageService = inject(ImageService);
  private notificationService = inject(NotificationService);

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    } else {
      this.router.navigate(['/admin/products']);
    }
  }

  loadProduct(id: string) {
    this.loading.set(true);
    this.productService
      .getProductById(Number(id))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.product.set(response.data);
          this.images.set(response.data.images || []);
        },
        error: (error) => {
          this.router.navigate(['/admin/products']);
        },
      });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadImage(file);
    }
  }

  uploadImage(file: File) {
    const product = this.product();
    if (!product) return;

    this.uploading.set(true);
    this.imageService
      .uploadImage(file, product.id)
      .pipe(finalize(() => this.uploading.set(false)))
      .subscribe({
        next: (response) => {
          this.loadProduct(product.id.toString());
          this.notificationService.showSuccess(response.data);
        },
      });
  }

  confirmDelete(imageId: number) {
    this.imageToDelete.set(imageId);
    this.showDeleteConfirm.set(true);
  }

  deleteImage() {
    const imageId = this.imageToDelete();
    const product = this.product();

    this.deleting.set(true);
    if (!imageId || !product) return;

    this.imageService
      .deleteImage(imageId)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        next: (response) => {
          this.loadProduct(product.id.toString());
          this.showDeleteConfirm.set(false);
          this.imageToDelete.set(null);
          this.notificationService.showSuccess(response.data);
        },
      });
  }
}
