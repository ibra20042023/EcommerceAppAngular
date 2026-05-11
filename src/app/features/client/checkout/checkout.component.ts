import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TaxService } from '../../../core/services/tax.service';
import { Address, CreateOrderRequest, PaymentMethod, User } from '../../../core/models/models';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { phoneValidator } from '../../../core/utils/phone.validator';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  imports: [RouterLink, ReactiveFormsModule],
})
export class CheckoutComponent implements OnInit {
  cartService = inject(CartService);

  private userService = inject(UserService);
  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  private notificationService = inject(NotificationService);
  private taxService = inject(TaxService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Billing Address Form
  billingAddressForm = this.fb.group({
    street: ['', [Validators.required, Validators.minLength(5)]],
    city: ['', [Validators.required, Validators.minLength(2)]],
    state: ['', [Validators.required, Validators.minLength(2)]],
    code: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    country: ['', [Validators.required]],
  });

  // Forms

  // Shipping Address Form
  shippingAddressForm = this.fb.group({
    street: ['', [Validators.required, Validators.minLength(5)]],
    city: ['', [Validators.required, Validators.minLength(2)]],
    state: ['', [Validators.required, Validators.minLength(2)]],
    code: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    country: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, phoneValidator]],
  });

  // Payment Form
  paymentForm = this.fb.group({
    cardHolderName: ['', [Validators.required, Validators.minLength(3)]],
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{13,19}$/)]],
    expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });

  isProcessing = signal(false);
  sameAsBilling = signal(false);
  currentUser = signal<User | null>(null);
  profile = signal<User | null>(null);

  // Price calculations
  subtotal = signal(0);
  tax = signal(0);
  shippingCost = signal(0);
  total = signal(0);

  // Payment methods
  paymentMethods = Object.values(PaymentMethod);
  selectedPaymentMethod = signal<PaymentMethod>(PaymentMethod.CREDIT_CARD);

  ngOnInit(): void {
    this.currentUser.set(this.authService.getUser());
    this.loadProfile();
    this.calculatePrices();

    // Watch for shipping address state changes to recalculate tax
    this.shippingAddressForm.get('state')?.valueChanges.subscribe(() => {
      this.calculatePrices();
    });
  }

  loadProfile(): void {
    this.isProcessing.set(true);
    this.userService
      .getUserById(this.currentUser()?.id!)
      .pipe(
        finalize(() => {
          this.isProcessing.set(false);
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
    if (profile.shippingAddress) {
      this.shippingAddressForm.patchValue({
        email: profile.email,
        phone: profile.phone,
        ...profile.shippingAddress,
      });
    }

    if (profile.billingAddress) {
      this.billingAddressForm.patchValue(profile.billingAddress);
      this.sameAsBilling.set(profile.useSameAddressForBilling ?? false);

      if (this.sameAsBilling()) {
        this.billingAddressForm.disable();
      }
    }
  }

  calculatePrices(): void {
    const cartTotal = this.cartService.totalPrice();
    this.subtotal.set(cartTotal);

    // Calculate shipping
    this.taxService.calculateShipping(cartTotal).subscribe((shipping) => {
      this.shippingCost.set(shipping);
      this.updateTotal();
    });

    // Calculate tax based on shipping state
    this.taxService.calculateTax(cartTotal).subscribe((taxAmount) => {
      this.tax.set(taxAmount);
      this.updateTotal();
    });
  }

  updateTotal(): void {
    const totalAmount = this.subtotal() + this.tax() + this.shippingCost();
    this.total.set(totalAmount);
  }

  toggleSameAsBilling(): void {
    const formValue = this.shippingAddressForm.value;
    const newValue = !this.sameAsBilling();
    this.sameAsBilling.set(newValue);

    if (newValue) {
      this.shippingAddressForm.reset();
      this.shippingAddressForm.patchValue({
        email: formValue.email,
        phone: formValue.phone,
      });
    } else {
      this.shippingAddressForm.patchValue({
        email: formValue.email,
        phone: formValue.phone,
        ...this.profile()?.shippingAddress,
      });
    }
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod.set(method);

    // Update payment form validators based on method
    if (method === PaymentMethod.CREDIT_CARD || method === PaymentMethod.DEBIT_CARD) {
      this.paymentForm
        .get('cardHolderName')
        ?.setValidators([Validators.required, Validators.minLength(3)]);
      this.paymentForm
        .get('cardNumber')
        ?.setValidators([Validators.required, Validators.pattern(/^\d{13,19}$/)]);
      this.paymentForm
        .get('expiryDate')
        ?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]);
      this.paymentForm
        .get('cvv')
        ?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
    } else {
      // For PayPal and Bank Transfer, card details are not required
      this.paymentForm.get('cardHolderName')?.clearValidators();
      this.paymentForm.get('cardNumber')?.clearValidators();
      this.paymentForm.get('expiryDate')?.clearValidators();
      this.paymentForm.get('cvv')?.clearValidators();
    }

    this.paymentForm.get('cardHolderName')?.updateValueAndValidity();
    this.paymentForm.get('cardNumber')?.updateValueAndValidity();
    this.paymentForm.get('expiryDate')?.updateValueAndValidity();
    this.paymentForm.get('cvv')?.updateValueAndValidity();
  }

  isFormValid(): boolean {
    const billingValid = this.billingAddressForm.valid;
    const shippingValid = this.sameAsBilling()
      ? (this.shippingAddressForm.get('email')?.valid ?? false) &&
        (this.shippingAddressForm.get('phone')?.valid ?? false)
      : this.shippingAddressForm.valid;
    const paymentValid =
      this.selectedPaymentMethod() === PaymentMethod.CREDIT_CARD ||
      this.selectedPaymentMethod() === PaymentMethod.DEBIT_CARD
        ? this.paymentForm.valid
        : true;

    return billingValid && shippingValid && paymentValid && this.cartService.cartItems().length > 0;
  }

  toggleDisableForms(disable: boolean): void {
    if (disable) {
      this.billingAddressForm.disable();
      this.shippingAddressForm.disable();
      this.paymentForm.disable();
    } else {
      this.billingAddressForm.enable();
      this.shippingAddressForm.enable();
      this.paymentForm.enable();
    }
  }

  // Place order
  placeOrder(): void {
    if (!this.isFormValid()) {
      this.notificationService.show('Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    if (this.cartService.cartItems().length === 0) {
      this.notificationService.show('El carrito está vacío', 'warning');
      return;
    }

    this.isProcessing.set(true);

    // Get last 4 digits of card if applicable
    let cardLastFour = '';
    if (
      this.selectedPaymentMethod() === PaymentMethod.CREDIT_CARD ||
      this.selectedPaymentMethod() === PaymentMethod.DEBIT_CARD
    ) {
      const cardNumber = this.paymentForm.get('cardNumber')?.value || '';
      cardLastFour = cardNumber.slice(-4);
    }

    this.toggleDisableForms(true);

    // Prepare order request
    const orderRequest: CreateOrderRequest = {
      items: this.cartService.cartItems().map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        productName: item.product.name,
        price: item.product.price,
      })),
      billingAddress: this.billingAddressForm.value as Address,
      shippingAddress: this.sameAsBilling()
        ? {
            email: this.shippingAddressForm.value.email || '',
            phone: this.shippingAddressForm.value.phone || '',
            ...(this.billingAddressForm.value as Address),
          }
        : (this.shippingAddressForm.value as Address),
      paymentInfo: {
        method: this.selectedPaymentMethod(),
        cardHolderName: this.paymentForm.get('cardHolderName')?.value!,
        cardLastFour: cardLastFour,
      },
      userId: this.authService.currentUser()?.id!,
    };

    // Create order
    this.orderService
      .createOrder(orderRequest)
      .pipe(
        finalize(() => {
          this.isProcessing.set(false);
          this.toggleDisableForms(false);
        })
      )
      .subscribe({
        next: (response) => {
          this.notificationService.show(response.message, 'success');
          this.cartService.clearCart();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.router.navigate(['/orders']);
        },
      });
  }
}
