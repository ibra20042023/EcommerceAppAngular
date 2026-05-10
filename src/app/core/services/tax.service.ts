import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaxService {
  // Tax rates by state (percentage)
  private taxRate = environment.TAX_RATE;

  // Calculate tax based on subtotal and state
  calculateTax(subtotal: number): Observable<number> {
    const taxAmount = subtotal * (this.taxRate / 100);
    return of(parseFloat(taxAmount.toFixed(2)));
  }

  // Calculate shipping cost based on subtotal (free shipping over $100)
  calculateShipping(subtotal: number): Observable<number> {
    // const shippingCost = subtotal >= 100 ? 0 : 10;
    return of(0);
  }
}
