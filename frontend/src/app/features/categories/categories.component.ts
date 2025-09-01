import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  productCount: number;
  featured: boolean;
  color: string;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  featuredCategories: Category[] = [];
  allCategories: Category[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categories = [
      {
        id: 1,
        name: 'Electrónicos',
        description: 'Dispositivos y gadgets tecnológicos de última generación',
        image: 'https://via.placeholder.com/400x300?text=Electrónicos',
        productCount: 156,
        featured: true,
        color: '#3B82F6'
      },
      {
        id: 2,
        name: 'Audio',
        description: 'Auriculares, altavoces y equipos de sonido premium',
        image: 'https://via.placeholder.com/400x300?text=Audio',
        productCount: 89,
        featured: true,
        color: '#8B5CF6'
      },
      {
        id: 3,
        name: 'Ropa',
        description: 'Moda y vestimenta para todas las ocasiones',
        image: 'https://via.placeholder.com/400x300?text=Ropa',
        productCount: 234,
        featured: true,
        color: '#EF4444'
      },
      {
        id: 4,
        name: 'Hogar',
        description: 'Decoración y artículos para el hogar',
        image: 'https://via.placeholder.com/400x300?text=Hogar',
        productCount: 167,
        featured: false,
        color: '#10B981'
      },
      {
        id: 5,
        name: 'Deportes',
        description: 'Equipamiento deportivo y fitness',
        image: 'https://via.placeholder.com/400x300?text=Deportes',
        productCount: 98,
        featured: false,
        color: '#F59E0B'
      },
      {
        id: 6,
        name: 'Libros',
        description: 'Literatura, educación y entretenimiento',
        image: 'https://via.placeholder.com/400x300?text=Libros',
        productCount: 312,
        featured: false,
        color: '#6366F1'
      },
      {
        id: 7,
        name: 'Belleza',
        description: 'Cosméticos y productos de cuidado personal',
        image: 'https://via.placeholder.com/400x300?text=Belleza',
        productCount: 145,
        featured: true,
        color: '#EC4899'
      },
      {
        id: 8,
        name: 'Juguetes',
        description: 'Diversión y entretenimiento para todas las edades',
        image: 'https://via.placeholder.com/400x300?text=Juguetes',
        productCount: 76,
        featured: false,
        color: '#14B8A6'
      }
    ];

    this.featuredCategories = this.categories.filter(cat => cat.featured);
    this.allCategories = this.categories;
  }

  navigateToCategory(categoryId: number): void {
    this.router.navigate(['/products'], { 
      queryParams: { category: categoryId } 
    });
  }

  getTotalProducts(): number {
    return this.categories.reduce((total, category) => total + category.productCount, 0);
  }
}