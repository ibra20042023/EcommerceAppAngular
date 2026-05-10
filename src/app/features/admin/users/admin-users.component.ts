import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, startWith } from 'rxjs/operators';
import { UserService } from '../../../core/services/user.service';
import { User, UserRole } from '../../../core/models/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  imports: [LoadingComponent, DatePipe, ConfirmModalComponent, ReactiveFormsModule],
})
export class AdminUsersComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal(true);

  // Pagination & Search
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = signal(0);
  hasPreviousPage = signal(false);
  hasNextPage = signal(false);
  Math = Math;

  // Role toggle confirmation state
  showRoleConfirm = signal(false);
  userToToggleRole = signal<User | null>(null);

  // Delete confirmation state
  showDeleteConfirm = signal(false);
  userToDelete = signal<number | null>(null);
  searchControl = new FormControl('');

  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(startWith(''), debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadUsers();
      });
  }

  loadUsers() {
    this.loading.set(true);
    this.userService
      .getUsers({
        pageNumber: this.currentPage(),
        pageSize: this.pageSize(),
        searchTerm: this.searchControl.value || undefined,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.users.set(response.data.items);
          this.totalItems.set(response.data.totalCount);
          this.totalPages.set(response.data.totalPages);
          this.hasPreviousPage.set(this.currentPage() > 1);
          this.hasNextPage.set(this.currentPage() < this.totalPages());
        },
      });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadUsers();
  }

  confirmToggleRole(user: User) {
    this.userToToggleRole.set(user);
    this.showRoleConfirm.set(true);
  }

  toggleRole() {
    const user = this.userToToggleRole();
    if (!user) return;

    this.userService.updateUserRole(user.id).subscribe({
      next: (response) => {
        this.loadUsers();
        this.showRoleConfirm.set(false);
        this.userToToggleRole.set(null);
        this.notificationService.showSuccess(response.data);
      },
    });
  }

  confirmDelete(id: number) {
    this.userToDelete.set(id);
    this.showDeleteConfirm.set(true);
  }

  deleteUser() {
    const id = this.userToDelete();
    if (!id) return;

    this.userService.deleteUser(id).subscribe({
      next: (response) => {
        this.loadUsers();
        this.showDeleteConfirm.set(false);
        this.userToDelete.set(null);
        this.notificationService.showSuccess(response.data);
      },
    });
  }
}
