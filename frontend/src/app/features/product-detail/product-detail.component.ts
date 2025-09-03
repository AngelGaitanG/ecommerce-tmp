import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  description: string;
  image: string;
  images: string[];
  category: string;
  brand: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  features: string[];
  specifications: { [key: string]: string };
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  product: Product | null = null;
  selectedImageIndex = 0;
  quantity = 1;
  relatedProducts: Product[] = [];
  loading = true;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      this.loadProduct(productId);
    });
  }

  loadProduct(id: number) {
    this.loading = true;
    // Simulamos datos del producto
    setTimeout(() => {
      this.product = {
        id: id,
        name: 'Smartphone Premium XYZ',
        price: 899.99,
        originalPrice: 1199.99,
        discount: 25,
        description: 'Un smartphone de última generación con características premium. Pantalla OLED de 6.7 pulgadas, cámara triple de 108MP, procesador de alta gama y batería de larga duración.',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
        images: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
          'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600',
          'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600'
        ],
        category: 'Smartphones',
        brand: 'TechBrand',
        rating: 4.5,
        reviews: 1247,
        inStock: true,
        features: [
          'Pantalla OLED 6.7"',
          'Cámara 108MP',
          'Batería 5000mAh',
          'Carga rápida 65W',
          'Resistente al agua IP68',
          '256GB almacenamiento'
        ],
        specifications: {
          'Pantalla': '6.7" OLED, 120Hz',
          'Procesador': 'Snapdragon 8 Gen 2',
          'RAM': '12GB',
          'Almacenamiento': '256GB',
          'Cámara': '108MP + 12MP + 8MP',
          'Batería': '5000mAh',
          'Sistema': 'Android 14',
          'Conectividad': '5G, WiFi 6E, Bluetooth 5.3'
        }
      };
      this.loadRelatedProducts();
      this.loading = false;
    }, 1000);
  }

  loadRelatedProducts() {
    // Simulamos productos relacionados
    this.relatedProducts = [
      {
        id: 2,
        name: 'Smartphone Pro ABC',
        price: 749.99,
        originalPrice: 899.99,
        discount: 17,
        description: 'Otro excelente smartphone',
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300',
        images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300'],
        category: 'Smartphones',
        brand: 'TechBrand',
        rating: 4.3,
        reviews: 892,
        inStock: true,
        features: [],
        specifications: {}
      },
      {
        id: 3,
        name: 'Tablet Ultra DEF',
        price: 599.99,
        description: 'Tablet de alta gama',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300',
        images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300'],
        category: 'Tablets',
        brand: 'TechBrand',
        rating: 4.4,
        reviews: 567,
        inStock: true,
        features: [],
        specifications: {}
      }
    ];
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  changeQuantity(delta: number) {
    const newQuantity = this.quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 10) {
      this.quantity = newQuantity;
    }
  }

  addToCart() {
    if (this.product) {
      console.log(`Agregando ${this.quantity} unidades del producto ${this.product.name} al carrito`);
      // Aquí implementarías la lógica para agregar al carrito
    }
  }

  addToWishlist() {
    if (this.product) {
      console.log(`Agregando ${this.product.name} a la lista de deseos`);
      // Aquí implementarías la lógica para agregar a wishlist
    }
  }

  goBack() {
    this.router.navigate(['/products']);
  }
}