import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../shared/services/cart.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems$: Observable<CartItem[]>;
  cartTotal$: Observable<number>;
  cartCount$: Observable<number>;
  
  // Cupón de descuento
  couponCode: string = '';
  appliedCoupon: any = null;
  couponError: string = '';
  
  // Cupones disponibles (en una aplicación real, esto vendría del backend)
  availableCoupons = [
    { code: 'DESCUENTO10', discount: 10, type: 'percentage', description: '10% de descuento' },
    { code: 'AHORRA50', discount: 50, type: 'fixed', description: '$50 de descuento' },
    { code: 'BIENVENIDO', discount: 15, type: 'percentage', description: '15% de descuento para nuevos usuarios' }
  ];

  constructor(private cartService: CartService) {
    this.cartItems$ = this.cartService.cartItems$;
    this.cartTotal$ = this.cartService.cartTotal$;
    this.cartCount$ = this.cartService.cartCount$;
  }

  ngOnInit(): void {}

  updateQuantity(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      this.cartService.clearCart();
    }
  }

  increaseQuantity(productId: number, currentQuantity: number): void {
    this.updateQuantity(productId, currentQuantity + 1);
  }

  decreaseQuantity(productId: number, currentQuantity: number): void {
    if (currentQuantity > 1) {
      this.updateQuantity(productId, currentQuantity - 1);
    }
  }

  proceedToCheckout(): void {
    // TODO: Implementar checkout
    alert('Funcionalidad de checkout próximamente');
  }

  continueShopping(): void {
    // Navegar de vuelta a productos
    window.history.back();
  }

  // Métodos para cupones
  applyCoupon(): void {
    if (!this.couponCode.trim()) {
      this.couponError = 'Por favor ingresa un código de cupón';
      return;
    }

    const coupon = this.availableCoupons.find(c => 
      c.code.toLowerCase() === this.couponCode.trim().toLowerCase()
    );

    if (coupon) {
      this.appliedCoupon = coupon;
      this.couponError = '';
      this.couponCode = '';
    } else {
      this.couponError = 'Código de cupón inválido';
      this.appliedCoupon = null;
    }
  }

  removeCoupon(): void {
    this.appliedCoupon = null;
    this.couponError = '';
    this.couponCode = '';
  }

  calculateDiscount(subtotal: number): number {
    if (!this.appliedCoupon) return 0;
    
    if (this.appliedCoupon.type === 'percentage') {
      return subtotal * (this.appliedCoupon.discount / 100);
    } else {
      return Math.min(this.appliedCoupon.discount, subtotal);
    }
  }

  calculateFinalTotal(subtotal: number): number {
    const taxes = subtotal * 0.16;
    const discount = this.calculateDiscount(subtotal);
    return subtotal + taxes - discount;
  }
}