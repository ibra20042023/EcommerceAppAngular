import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Address, User } from '../../../core/models/models';
import { AuthService } from '../../../core/services/auth.service';
import { phoneValidator } from '../../../core/utils/phone.validator';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [ReactiveFormsModule],
})
export class ProfileComponent implements OnInit {
  activeTab = signal<'personal' | 'shipping' | 'billing'>('personal');
  loading = signal(false);
  saving = signal(false);
  currentUser = signal<User | null>(null);
  profile = signal<User | null>(null);
  sameAsShipping = signal(false);

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  personalForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, phoneValidator]],
  });

  shippingForm = this.fb.group({
    street: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    code: ['', Validators.required],
    country: ['', Validators.required],
  });

  billingForm = this.fb.group({
    street: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    code: ['', Validators.required],
    country: ['', Validators.required],
  });

  ngOnInit(): void {
    this.currentUser.set(this.authService.getUser());
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.userService
      .getUserById(this.currentUser()?.id!)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          this.profile.set(response.data);
          this.authService.updateUser(response.data);
          this.populateForms(response.data);
        },
      });
  }

  populateForms(profile: User): void {
    this.personalForm.patchValue({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
    });

    if (profile.shippingAddress) {
      this.shippingForm.patchValue(profile.shippingAddress);
    }

    if (profile.billingAddress) {
      this.billingForm.patchValue(profile.billingAddress);
      this.sameAsShipping.set(profile.useSameAddressForBilling ?? false);

      if (this.sameAsShipping()) {
        this.billingForm.disable();
      }
    }
  }

  setActiveTab(tab: 'personal' | 'shipping' | 'billing'): void {
    this.activeTab.set(tab);
  }

  toggleSameAsShipping(): void {
    const newValue = !this.sameAsShipping();
    this.sameAsShipping.set(newValue);

    if (newValue) {
      this.billingForm.patchValue(this.shippingForm.value);
      this.billingForm.disable();
    } else {
      this.billingForm.enable();
    }
  }

  savePersonalInfo(): void {
    if (this.personalForm.invalid) {
      this.notificationService.showError('Por favor completa todos los campos correctamente');
      return;
    }

    this.saving.set(true);
    this.userService
      .updateUserProfile(this.currentUser()?.id!, this.personalForm.value as Partial<User>)
      .pipe(
        finalize(() => {
          this.saving.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          this.loadProfile();
          this.notificationService.showSuccess(response.data);
        },
      });
  }

  saveShippingAddress(): void {
    if (this.shippingForm.invalid) {
      this.notificationService.showError('Por favor completa todos los campos correctamente');
      return;
    }

    this.updaterUserAddress();
  }

  saveBillingAddress(): void {
    if (this.billingForm.invalid) {
      this.notificationService.showError('Por favor completa todos los campos correctamente');
      return;
    }

    this.updaterUserAddress();
  }

  updaterUserAddress(): void {
    this.saving.set(true);

    const shippingForm = this.shippingForm.value as Address;
    const billingAddress = this.billingForm.value as Address;

    this.userService
      .updateUserAddress(this.currentUser()?.id!, {
        shippingAddress: shippingForm,
        billingAddress:
          this.profile()?.billingAddress?.city == null ? shippingForm : billingAddress,
      })
      .pipe(
        finalize(() => {
          this.saving.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          this.loadProfile();
          this.notificationService.showSuccess(response.data);
        },
      });
  }
}
