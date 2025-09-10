import { Component, OnInit, OnDestroy } from '@angular/core';
import { Product } from '../../shared/components/product-card/product-card.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  // Carousel properties
  currentSlide = 0;
  totalSlides = 3;
  autoPlayInterval: any;
  
  // Productos destacados para el carrusel
  featuredCarouselProducts: Product[] = [];
  
  categories = [
    {
      name: 'Vestidos',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=200&fit=crop',
      count: 45
    },
    {
      name: 'Camisetas',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=200&fit=crop',
      count: 32
    },
    {
      name: 'Pantalones',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=200&fit=crop',
      count: 28
    },
    {
      name: 'Accesorios',
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=200&fit=crop',
      count: 67
    }
  ];
  
  ngOnInit() {
    this.startAutoPlay();
    // Inicializar productos destacados para el carrusel
    this.featuredCarouselProducts = this.featuredProducts.slice(0, 8);
  }
  
  ngOnDestroy() {
    this.stopAutoPlay();
  }
  
  // Carousel methods
  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateSlideDisplay();
    this.resetAutoPlay();
  }
  
  previousSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
    this.updateSlideDisplay();
    this.resetAutoPlay();
  }
  
  goToSlide(index: number) {
    this.currentSlide = index;
    this.updateSlideDisplay();
    this.resetAutoPlay();
  }
  
  private updateSlideDisplay() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    
    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === this.currentSlide);
    });
    
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentSlide);
    });
  }
  
  private startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }
  
  private stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }
  
  private resetAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  featuredProducts: Product[] = [
    {
      id: 1,
      name: 'Vestido Elegante de Verano',
      price: 89.99,
      originalPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
      category: 'Vestidos',
      rating: 4.8,
      reviews: 124,
      isOnSale: true,
      discount: 31,
      inStock: true
    },
    {
      id: 2,
      name: 'Camiseta Básica Premium',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
      category: 'Camisetas',
      rating: 4.5,
      reviews: 89,
      inStock: true
    },
    {
      id: 3,
      name: 'Pantalón Casual',
      price: 59.99,
      image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop',
      category: 'Pantalones',
      rating: 4.3,
      reviews: 156,
      inStock: true
    },
    {
      id: 4,
      name: 'Bolso de Cuero',
      price: 89.99,
      originalPrice: 119.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop',
      category: 'Accesorios',
      rating: 4.8,
      reviews: 203,
      isOnSale: true,
      discount: 25,
      inStock: true
    },
    {
      id: 5,
      name: 'Chaqueta Denim',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
      category: 'Chaquetas',
      rating: 4.6,
      reviews: 98,
      inStock: true
    },
    {
      id: 6,
      name: 'Zapatos Deportivos',
      price: 119.99,
      originalPrice: 149.99,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop',
      category: 'Calzado',
      rating: 4.7,
      reviews: 167,
      isOnSale: true,
      discount: 20,
      inStock: true
    },
    {
      id: 7,
      name: 'Falda Midi',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1583496661160-fb5886a13d27?w=400&h=500&fit=crop',
      category: 'Faldas',
      rating: 4.4,
      reviews: 76,
      inStock: true
    },
    {
      id: 8,
      name: 'Reloj Clásico',
      price: 199.99,
      originalPrice: 249.99,
      image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=500&fit=crop',
      category: 'Accesorios',
      rating: 4.9,
      reviews: 234,
      isOnSale: true,
      discount: 20,
      inStock: true
    },
    {
      id: 9,
      name: 'Suéter de Lana',
      price: 69.99,
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop',
      category: 'Suéteres',
      rating: 4.5,
      reviews: 112,
      inStock: true
    },
    {
      id: 10,
      name: 'Gafas de Sol',
      price: 39.99,
      originalPrice: 59.99,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop',
      category: 'Accesorios',
      rating: 4.3,
      reviews: 89,
      isOnSale: true,
      discount: 33,
      inStock: true
    },
    {
      id: 11,
      name: 'Blusa Elegante',
      price: 54.99,
      image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=500&fit=crop',
      category: 'Blusas',
      rating: 4.6,
      reviews: 145,
      inStock: true
    },
    {
      id: 12,
      name: 'Shorts de Verano',
      price: 34.99,
      image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=500&fit=crop',
      category: 'Shorts',
      rating: 4.2,
      reviews: 67,
      inStock: true
    },
    {
      id: 13,
      name: 'Collar de Perlas',
      price: 89.99,
      originalPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=500&fit=crop',
      category: 'Joyería',
      rating: 4.8,
      reviews: 178,
      isOnSale: true,
      discount: 31,
      inStock: true
    },
    {
      id: 14,
      name: 'Botas de Cuero',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=500&fit=crop',
      category: 'Calzado',
      rating: 4.7,
      reviews: 201,
      inStock: true
    }
  ];

  constructor() {}

  // Método para manejar la navegación a categorías
  navigateToCategory(category: string) {
    // TODO: Implementar navegación a la página de categoría
    console.log('Navegar a categoría:', category);
  }

  // Método para manejar la adición al carrito
  addToCart(product: Product) {
    // TODO: Implementar lógica de carrito
    console.log('Agregar al carrito:', product.name);
  }

  // Método para agregar a favoritos
  addToFavorites(product: Product) {
    // TODO: Implementar lógica de favoritos
    console.log('Agregar a favoritos:', product.name);
  }

  // Método para manejar la navegación a detalles del producto
  viewProductDetails(product: Product) {
    // TODO: Navegar a la página de detalles del producto
    console.log('Ver detalles de:', product.name);
  }
}