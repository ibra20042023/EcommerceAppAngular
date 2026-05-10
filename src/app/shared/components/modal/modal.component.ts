import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  title = input<string>('');
  onClose = output<void>();

  close() {
    this.onClose.emit();
  }
}
