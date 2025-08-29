import { Product } from '../entities/product.entity';
import { ProductQueryDto } from '../dto/product-query.dto';
import { CreateProductDto, UpdateProductDto } from '../dto';

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  featuredProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  averagePrice: number;
  totalValue: number;
}

export interface ProductsByCategory {
  categoryId: string;
  categoryName: string;
  productCount: number;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface IProductRepository {
  // CRUD básico
  create(createProductDto: CreateProductDto): Promise<Product>;
  findAll(queryDto?: ProductQueryDto): Promise<PaginatedProducts>;
  findById(id: string, relations?: string[]): Promise<Product | null>;
  findBySlug(slug: string, relations?: string[]): Promise<Product | null>;
  findBySku(sku: string, relations?: string[]): Promise<Product | null>;
  update(id: string, updateProductDto: UpdateProductDto): Promise<Product>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;

  // Búsquedas avanzadas
  search(query: string, options?: ProductQueryDto): Promise<PaginatedProducts>;
  findByCategory(categoryId: string, options?: ProductQueryDto): Promise<PaginatedProducts>;
  findByCategories(categoryIds: string[], options?: ProductQueryDto): Promise<PaginatedProducts>;
  findByPriceRange(minPrice: number, maxPrice: number, options?: ProductQueryDto): Promise<PaginatedProducts>;
  findByTags(tags: string[], options?: ProductQueryDto): Promise<PaginatedProducts>;
  findByBrand(brand: string, options?: ProductQueryDto): Promise<PaginatedProducts>;
  findFeatured(options?: ProductQueryDto): Promise<PaginatedProducts>;
  findInStock(options?: ProductQueryDto): Promise<PaginatedProducts>;
  findOutOfStock(options?: ProductQueryDto): Promise<PaginatedProducts>;
  findLowStock(options?: ProductQueryDto): Promise<PaginatedProducts>;
  findOnSale(options?: ProductQueryDto): Promise<PaginatedProducts>;
  findNew(days?: number, options?: ProductQueryDto): Promise<PaginatedProducts>;
  findPopular(options?: ProductQueryDto): Promise<PaginatedProducts>;
  findRelated(productId: string, limit?: number): Promise<Product[]>;
  findSimilar(productId: string, limit?: number): Promise<Product[]>;

  // Estadísticas y reportes
  getStats(): Promise<ProductStats>;
  getProductsByCategory(): Promise<ProductsByCategory[]>;
  getTopSellingProducts(limit?: number): Promise<Product[]>;
  getMostViewedProducts(limit?: number): Promise<Product[]>;
  getRecentProducts(limit?: number): Promise<Product[]>;
  getPriceStatistics(): Promise<{ min: number; max: number; avg: number; median: number }>;

  // Gestión de stock
  updateStock(productId: string, quantity: number): Promise<Product>;
  incrementStock(productId: string, quantity: number): Promise<Product>;
  decrementStock(productId: string, quantity: number): Promise<Product>;
  checkStock(productId: string): Promise<{ inStock: boolean; quantity: number; isLowStock: boolean }>;
  bulkUpdateStock(updates: Array<{ productId: string; quantity: number }>): Promise<void>;

  // Gestión de estado
  activate(id: string): Promise<Product>;
  deactivate(id: string): Promise<Product>;
  toggleStatus(id: string): Promise<Product>;
  setFeatured(id: string, featured: boolean, order?: number): Promise<Product>;
  bulkUpdateStatus(ids: string[], status: boolean): Promise<void>;

  // Utilidades
  exists(id: string): Promise<boolean>;
  existsBySlug(slug: string, excludeId?: string): Promise<boolean>;
  existsBySku(sku: string, excludeId?: string): Promise<boolean>;
  count(options?: ProductQueryDto): Promise<number>;
  generateSlug(name: string, excludeId?: string): Promise<string>;
  generateSku(prefix?: string): Promise<string>;
}