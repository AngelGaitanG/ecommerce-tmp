import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  ratingCount: number;
  image: string;
  featured?: boolean;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home2',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home2.component.html',
  styleUrls: ['./home2.component.scss']
})
export class Home2Component implements OnInit {
  activeTab: string = 'featured';
  
  // Hero stats data
  stats = [
    { number: '50K+', label: 'Productos' },
    { number: '25K+', label: 'Clientes' },
    { number: '99%', label: 'Satisfacción' }
  ];

  // Features data
  features: Feature[] = [
    {
      icon: '🚚',
      title: 'Envío Gratis',
      description: 'Envío gratuito en pedidos superiores a $50. Entrega rápida y segura a tu puerta.'
    },
    {
      icon: '🔒',
      title: 'Pago Seguro',
      description: 'Transacciones 100% seguras con encriptación SSL y múltiples métodos de pago.'
    },
    {
      icon: '↩️',
      title: 'Devoluciones Fáciles',
      description: 'Política de devolución de 30 días sin preguntas. Tu satisfacción es nuestra prioridad.'
    },
    {
      icon: '🎧',
      title: 'Soporte 24/7',
      description: 'Atención al cliente disponible las 24 horas del día, los 7 días de la semana.'
    },
    {
      icon: '⭐',
      title: 'Calidad Premium',
      description: 'Productos cuidadosamente seleccionados con los más altos estándares de calidad.'
    },
    {
      icon: '🎁',
      title: 'Ofertas Exclusivas',
      description: 'Acceso a descuentos especiales y ofertas exclusivas para miembros registrados.'
    }
  ];

  // Sample products data
  allProducts: Product[] = [
    {
      id: 1,
      name: 'Smartphone Pro Max',
      category: 'Electrónicos',
      price: 999,
      originalPrice: 1199,
      rating: 4.8,
      ratingCount: 324,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
      featured: true
    },
    {
      id: 2,
      name: 'Auriculares Inalámbricos',
      category: 'Audio',
      price: 199,
      originalPrice: 249,
      rating: 4.6,
      ratingCount: 156,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      featured: true
    },
    {
      id: 3,
      name: 'Laptop Gaming',
      category: 'Computadoras',
      price: 1299,
      originalPrice: 1499,
      rating: 4.9,
      ratingCount: 89,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
      featured: true
    },
    {
      id: 4,
      name: 'Smartwatch Elite',
      category: 'Wearables',
      price: 399,
      rating: 4.7,
      ratingCount: 234,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop'
    },
    {
      id: 5,
      name: 'Cámara Profesional',
      category: 'Fotografía',
      price: 899,
      originalPrice: 1099,
      rating: 4.8,
      ratingCount: 167,
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop'
    },
    {
      id: 6,
      name: 'Tablet Pro',
      category: 'Tablets',
      price: 649,
      rating: 4.5,
      ratingCount: 298,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop'
    }
  ];

  // Floating cards data for hero section
  floatingCards = [
    {
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=150&fit=crop',
      price: '$199',
      rating: '4.8★'
    },
    {
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=150&fit=crop',
      price: '$999',
      rating: '4.9★'
    },
    {
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=150&fit=crop',
      price: '$399',
      rating: '4.7★'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Component initialization logic
  }

  // Get products based on active tab
  get filteredProducts(): Product[] {
    switch (this.activeTab) {
      case 'featured':
        return this.allProducts.filter(product => product.featured);
      case 'new':
        return this.allProducts.slice(0, 3); // Show first 3 as "new"
      case 'bestsellers':
        return this.allProducts.filter(product => product.rating >= 4.7);
      default:
        return this.allProducts.slice(0, 6);
    }
  }

  // Set active tab
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Generate star rating array
  getStarArray(rating: number): boolean[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < 5; i++) {
      stars.push(i < fullStars);
    }
    
    return stars;
  }

  // Handle newsletter subscription
  onNewsletterSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
    
    if (emailInput && emailInput.value) {
      // Here you would typically send the email to your backend
      console.log('Newsletter subscription:', emailInput.value);
      
      // Show success message (you can implement a toast notification)
      alert('¡Gracias por suscribirte a nuestro newsletter!');
      
      // Clear the input
      emailInput.value = '';
    }
  }

  // Handle quick view
  onQuickView(product: Product): void {
    console.log('Quick view for product:', product);
    // Here you would typically open a modal or navigate to product details
  }

  // Handle CTA buttons
  onShopNow(): void {
    console.log('Shop now clicked');
    // Navigate to products page or scroll to products section
  }

  onWatchDemo(): void {
    console.log('Watch demo clicked');
    // Open demo video or modal
  }
}
