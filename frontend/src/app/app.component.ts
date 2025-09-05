import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingSpinnerComponent, HeaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'E-commerce Template';
  showHeader = true;
  private routerSubscription: Subscription = new Subscription();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateHeaderVisibility(event.url);
      });
    
    // Check initial route
    this.updateHeaderVisibility(this.router.url);
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }

  private updateHeaderVisibility(url: string): void {
    // Hide header on auth routes
    this.showHeader = !url.includes('/auth/');
  }
}
