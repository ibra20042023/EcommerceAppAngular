import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PaymentMethod, PaymentInfo } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  // Get available payment methods
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return of([PaymentMethod.CREDIT_CARD, PaymentMethod.DEBIT_CARD]);
  }

  // Simulate payment processing
  processPayment(
    paymentInfo: PaymentInfo,
    amount: number
  ): Observable<{ success: boolean; message: string }> {
    // Simulate API delay
    return of({
      success: true,
      message: `Pago de $${amount.toFixed(2)} procesado exitosamente con ${paymentInfo.method}`,
    }).pipe(delay(1500));
  }

  // Validate card details (basic simulation)
  validateCardDetails(cardNumber: string, cvv: string, expiryDate: string): Observable<boolean> {
    // Simple validation: check if fields are not empty and have reasonable length
    const isValid = cardNumber.length >= 13 && cvv.length >= 3 && expiryDate.length >= 5;
    return of(isValid).pipe(delay(500));
  }
}
