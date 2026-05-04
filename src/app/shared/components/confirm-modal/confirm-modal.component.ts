import { Component, input, output } from '@angular/core';
import { ConfirmType } from '../../../core/models/models';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  imports: [NgClass],
})
export class ConfirmModalComponent {
  title = input<string>('Confirmar acción');
  message = input<string>('¿Estás seguro de realizar esta acción?');
  type = input<ConfirmType>('danger');
  confirmText = input<string>('Confirmar');
  cancelText = input<string>('annuler');

  onConfirm = output<void>();
  onCancel = output<void>();

  confirm() {
    this.onConfirm.emit();
  }

  cancel() {
    this.onCancel.emit();
  }
}
