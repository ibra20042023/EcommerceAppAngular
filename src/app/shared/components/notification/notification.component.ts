import { Component, computed, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  imports: [NgClass],
})
export class NotificationComponent {
  private readonly notificationService = inject(NotificationService);

  computedNotifications = computed(() => this.notificationService.notifications());

  remove(id: string) {
    this.notificationService.remove(id);
  }
}
