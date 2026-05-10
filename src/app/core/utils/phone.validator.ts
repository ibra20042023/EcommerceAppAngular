import { AbstractControl, ValidationErrors } from '@angular/forms';

// Custom validator for international phone numbers
export function phoneValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null; // Let the required validator handle empty values
  }

  // International phone format: +[country code][number]
  // Accepts: +34612345678, +1234567890, etc.
  const phoneRegex = /^\+\d{1,4}\d{6,14}$/;

  if (!phoneRegex.test(control.value)) {
    return { invalidPhone: true };
  }

  return null;
}
