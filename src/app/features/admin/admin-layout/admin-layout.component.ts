import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
})
export class AdminLayoutComponent {
  sidebarOpen = signal(false);
  isMobile = signal(false);

  private authService = inject(AuthService);
  private router = inject(Router);
  public themeService = inject(ThemeService);

  constructor() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  checkScreenSize() {
    this.isMobile.set(window.innerWidth < 768);
    if (!this.isMobile()) {
      this.sidebarOpen.set(true);
    } else {
      this.sidebarOpen.set(false);
    }
  }

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
