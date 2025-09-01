import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../services/cart.service';
import { User } from '../../../core/models/auth.interface';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isAuthenticated = false;
  isMenuOpen = false;
  isUserMenuOpen = false;
  cartCount$: Observable<number>;
  currentRoute = '';
  headerTheme = 'default';
  isScrolled = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {
    this.cartCount$ = this.cartService.cartCount$;
  }

  ngOnInit(): void {
    // Suscribirse al estado de autenticación
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      });

    // Suscribirse al usuario actual
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Suscribirse a los cambios de ruta para aplicar temas dinámicos
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
        this.updateHeaderTheme();
      });

    // Establecer tema inicial
    this.currentRoute = this.router.url;
    this.updateHeaderTheme();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isScrolled = scrollTop > 50;
  }

  private updateHeaderTheme(): void {
    if (this.currentRoute === '/' || this.currentRoute === '') {
      this.headerTheme = 'home';
    } else if (this.currentRoute.includes('/products')) {
      this.headerTheme = 'products';
    } else if (this.currentRoute.includes('/categories')) {
      this.headerTheme = 'categories';
    } else if (this.currentRoute.includes('/cart')) {
      this.headerTheme = 'cart';
    } else if (this.currentRoute.includes('/auth')) {
      this.headerTheme = 'auth';
    } else {
      this.headerTheme = 'default';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.isUserMenuOpen = false; // Cerrar menú de usuario si está abierto
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.isMenuOpen = false; // Cerrar menú móvil si está abierto
  }

  logout(): void {
    this.authService.logout();
    this.isUserMenuOpen = false;
  }
}