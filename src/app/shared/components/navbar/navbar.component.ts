import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthModalService } from '../../../core/services/auth-modal.service';
import { ThemeService } from '../../../core/services/theme.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [RouterLink],
})
export class NavbarComponent {
  mobileMenuOpen = signal(false);
  userMenuOpen = signal(false);

  public authService = inject(AuthService);
  public themeService = inject(ThemeService);
  public modalService = inject(AuthModalService);
  public cartService = inject(CartService);
  public wishlistService = inject(WishlistService);

  logout(): void {
    this.authService.logout().subscribe();
    this.userMenuOpen.set(false);
  }

  toggleUserMenu(): void {
    this.userMenuOpen.set(!this.userMenuOpen());
  }

  openLoginModal(): void {
    this.modalService.openLogin();
    this.mobileMenuOpen.set(false);
  }

  openRegisterModal(): void {
    this.modalService.openRegister();
    this.mobileMenuOpen.set(false);
  }
}
