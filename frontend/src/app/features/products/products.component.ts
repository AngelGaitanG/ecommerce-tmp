import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../shared/services/cart.service';
import { ProductCardComponent, Product } from '../../shared/components/product-card/product-card.component';
import { Observable } from 'rxjs';



export interface Category {
  id: number;
  name: string;
  count: number;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductCardComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
 export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  
  // Filtros
  searchTerm: string = '';
  selectedCategory: number | null = null;
  priceRange = { min: 0, max: 1000 };
  minRating: number = 0;
  selectedRating: number = 0;
  sortBy: string = 'name';
  
  // Vista
  viewMode: 'grid' | 'list' = 'grid';
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 1;
  
  // Carrito
  cartCount$: Observable<number>;
  
  constructor(
    private router: Router,
    private cartService: CartService
  ) {
    this.cartCount$ = this.cartService.cartCount$;
  }
  
  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }
  
  loadProducts(): void {
    // Datos de ejemplo - en una aplicación real, esto vendría de un servicio
    this.products = [
      {
         id: 1,
         name: 'Smartphone Premium',
         description: 'Último modelo con cámara de alta resolución',
         price: 699,
         originalPrice: 799,
         image: 'https://via.placeholder.com/300x300?text=Smartphone',
         category: 'Electrónicos',
         rating: 4.5,
         reviews: 128,
         inStock: true,
         discount: 12,
         tags: ['nuevo', 'popular'],
         colors: ['Negro', 'Blanco', 'Azul'],
         isNew: true,
         isFeatured: true
       },
      {
         id: 2,
         name: 'Laptop Gaming',
         description: 'Potente laptop para gaming y trabajo',
         price: 1299,
         image: 'https://via.placeholder.com/300x300?text=Laptop',
         category: 'Electrónicos',
         rating: 4.8,
         reviews: 89,
         inStock: true,
         tags: ['gaming', 'profesional'],
         colors: ['Negro', 'Gris'],
         isFeatured: true
       },
      {
        id: 3,
        name: 'Auriculares Bluetooth',
        description: 'Auriculares inalámbricos con cancelación de ruido',
        price: 199,
        originalPrice: 249,
        image: 'https://via.placeholder.com/300x300?text=Auriculares',
        category: 'Audio',
        rating: 4.3,
        reviews: 256,
        inStock: true,
        discount: 20
      },
      {
         id: 4,
         name: 'Camiseta Deportiva',
         description: 'Camiseta transpirable para ejercicio',
         price: 29,
         image: 'https://via.placeholder.com/300x300?text=Camiseta',
         category: 'Ropa',
         rating: 4.1,
         reviews: 45,
         inStock: true,
         tags: ['deportivo'],
         colors: ['Rojo', 'Azul', 'Negro'],
         sizes: ['S', 'M', 'L', 'XL']
       },
      {
         id: 5,
         name: 'Zapatillas Running',
         description: 'Zapatillas cómodas para correr',
         price: 89,
         originalPrice: 119,
         image: 'https://via.placeholder.com/300x300?text=Zapatillas',
         category: 'Ropa',
         rating: 4.6,
         reviews: 178,
         inStock: false,
         discount: 25,
         colors: ['Blanco', 'Negro', 'Gris'],
         sizes: ['38', '39', '40', '41', '42', '43']
       },
      {
        id: 6,
        name: 'Cafetera Automática',
        description: 'Cafetera con múltiples opciones de preparación',
        price: 159,
        image: 'https://via.placeholder.com/300x300?text=Cafetera',
        category: 'Hogar',
        rating: 4.4,
        reviews: 92,
        inStock: true
      }
    ];
    
    this.applyFilters();
  }
  
  loadCategories(): void {
    this.categories = [
      { id: 1, name: 'Electrónicos', count: 2 },
      { id: 2, name: 'Audio', count: 1 },
      { id: 3, name: 'Ropa', count: 2 },
      { id: 4, name: 'Hogar', count: 1 }
    ];
  }
  
  applyFilters(): void {
    let filtered = [...this.products];
    
    // Filtro por búsqueda
    if (this.searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }
    
    // Filtro por categoría
    if (this.selectedCategory) {
      const categoryName = this.categories.find(cat => cat.id === this.selectedCategory)?.name;
      if (categoryName) {
        filtered = filtered.filter(product => product.category === categoryName);
      }
    }
    
    // Filtro por precio
    filtered = filtered.filter(product => 
      product.price >= this.priceRange.min && product.price <= this.priceRange.max
    );
    
    // Filtro por rating
    filtered = filtered.filter(product => product.rating >= this.minRating);
    
    // Ordenamiento
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
    
    this.filteredProducts = filtered;
    this.updatePagination();
  }
  
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }
  
  get paginatedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProducts.slice(start, end);
  }
  
  getPaginatedProducts(): Product[] {
    return this.paginatedProducts;
  }
  
  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }
  
  onCategoryChange(categoryId: number): void {
    this.selectedCategory = this.selectedCategory === categoryId ? null : categoryId;
    this.currentPage = 1;
    this.applyFilters();
  }
  
  onPriceRangeChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }
  
  onRatingChange(rating: number): void {
    this.selectedRating = rating;
    this.minRating = rating;
    this.currentPage = 1;
    this.applyFilters();
  }
  
  onSortChange(): void {
    this.applyFilters();
  }
  
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }
  
  addToCart(product: Product): void {
    this.cartService.addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }
  
  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId);
  }
  
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = null;
    this.priceRange = { min: 0, max: 1000 };
    this.minRating = 0;
    this.selectedRating = 0;
    this.sortBy = 'name';
    this.currentPage = 1;
    this.applyFilters();
  }
  

  
  getTotalCartItems(): number {
    return this.cartService.getTotalItems();
  }
  
  getCartQuantity(productId: number): number {
    return this.cartService.getItemQuantity(productId);
  }
  
  getTotalPages(): number {
    return this.totalPages;
  }
  
  changePage(page: number): void {
    this.goToPage(page);
  }

  addToFavorites(product: Product): void {
    // TODO: Implementar funcionalidad de favoritos
    console.log('Agregado a favoritos:', product.name);
  }

  viewProductDetails(product: Product): void {
    // TODO: Navegar a la página de detalles del producto
    console.log('Ver detalles del producto:', product.name);
  }

  // Métodos para el filtro de rating
  getFilledStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }
}