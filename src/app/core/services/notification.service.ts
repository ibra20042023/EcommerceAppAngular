import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  notifications = signal<Notification[]>([]);

  show(message: string, type: NotificationType = 'info', duration: number = 3000) {
    const id = crypto.randomUUID();
    const notification: Notification = { id, message, type, duration };

    this.notifications.update((current) => [...current, notification]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  showSuccess(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  showError(message: string, duration?: number) {
    this.show(message, 'error', duration);
  }

  showInfo(message: string, duration?: number) {
    this.show(message, 'info', duration);
  }

  showWarning(message: string, duration?: number) {
    this.show(message, 'warning', duration);
  }

  remove(id: string) {
    this.notifications.update((current) => current.filter((n) => n.id !== id));
  }
}
