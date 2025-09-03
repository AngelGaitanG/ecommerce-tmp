import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  discount?: number;
  colors?: string[];
  sizes?: string[];
  isOnSale?: boolean;
  tags?: string[];
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  private router = inject(Router);
  
  @Input() product!: Product;
  @Input() viewMode: 'grid' | 'list' = 'grid';
  @Input() showDescription: boolean = false;
  @Input() showVariants: boolean = false;
  @Input() cartQuantity: number = 0;

  @Output() addToCart = new EventEmitter<Product>();
  @Output() addToFavorites = new EventEmitter<Product>();
  @Output() viewDetails = new EventEmitter<Product>();

  getFilledStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  getStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < Math.floor(rating));
  }

  onAddToCart(): void {
    if (this.product.inStock) {
      this.addToCart.emit(this.product);
    }
  }

  onAddToFavorites(): void {
    this.addToFavorites.emit(this.product);
  }

  onViewDetails(): void {
    this.router.navigate(['/product', this.product.id]);
    this.viewDetails.emit(this.product);
  }
}