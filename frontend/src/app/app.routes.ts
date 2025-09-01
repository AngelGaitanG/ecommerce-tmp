import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'welcome',
    loadComponent: () => import('./shared/components/welcome/welcome.component').then(m => m.WelcomeComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent)
  },
  {
    path: 'categories',
    loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent)
  },
  {
    path: 'cart',
    loadChildren: () => import('./features/cart/cart.routes').then(m => m.cartRoutes),
  },
  //   canActivate: [AuthGuard]
  // },
  // {
  //   path: 'orders',
  //   loadChildren: () => import('./features/orders/orders.routes').then(m => m.ordersRoutes),
  //   canActivate: [AuthGuard]
  // },
  // {
  //   path: 'admin',
  //   loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
  //   canActivate: [AuthGuard, AdminGuard]
  // },
  // {
  //   path: 'profile',
  //   loadChildren: () => import('./features/profile/profile.routes').then(m => m.profileRoutes),
  //   canActivate: [AuthGuard]
  // },
  // {
  //   path: 'access-denied',
  //   loadComponent: () => import('./shared/components/access-denied/access-denied.component').then(m => m.AccessDeniedComponent)
  // },
  // {
  //   path: '**',
  //   loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  // }
];
