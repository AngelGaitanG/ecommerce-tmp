import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Product,
  ProductVariant,
  ProductImage,
  Category,
  CreateProductDto,
  UpdateProductDto,
  CreateProductVariantDto,
  UpdateProductVariantDto,
  CreateProductImageDto,
  UpdateProductImageDto,
  ApiResponse,
  PaginatedResponse,
  QueryParams
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly baseUrl = '/products';
  private readonly categoriesUrl = '/categories';

  constructor(private apiService: ApiService) {}

  // Product CRUD operations
  getProducts(params?: QueryParams): Observable<ApiResponse<PaginatedResponse<Product>>> {
    return this.apiService.get<PaginatedResponse<Product>>(this.baseUrl, params);
  }

  getProduct(id: string): Observable<ApiResponse<Product>> {
    return this.apiService.get<Product>(`${this.baseUrl}/${id}`);
  }

  createProduct(product: CreateProductDto): Observable<ApiResponse<Product>> {
    return this.apiService.post<Product>(this.baseUrl, product);
  }

  updateProduct(id: string, product: UpdateProductDto): Observable<ApiResponse<Product>> {
    return this.apiService.patch<Product>(`${this.baseUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Product search
  searchProducts(query: string, params?: QueryParams): Observable<ApiResponse<PaginatedResponse<Product>>> {
    const searchParams = { ...params, search: query };
    return this.apiService.get<PaginatedResponse<Product>>(`${this.baseUrl}/search`, searchParams);
  }

  // Product variants
  getProductVariants(productId: string): Observable<ApiResponse<ProductVariant[]>> {
    return this.apiService.get<ProductVariant[]>(`${this.baseUrl}/${productId}/variants`);
  }

  getProductVariant(productId: string, variantId: string): Observable<ApiResponse<ProductVariant>> {
    return this.apiService.get<ProductVariant>(`${this.baseUrl}/${productId}/variants/${variantId}`);
  }

  createProductVariant(productId: string, variant: CreateProductVariantDto): Observable<ApiResponse<ProductVariant>> {
    return this.apiService.post<ProductVariant>(`${this.baseUrl}/${productId}/variants`, variant);
  }

  updateProductVariant(productId: string, variantId: string, variant: UpdateProductVariantDto): Observable<ApiResponse<ProductVariant>> {
    return this.apiService.patch<ProductVariant>(`${this.baseUrl}/${productId}/variants/${variantId}`, variant);
  }

  deleteProductVariant(productId: string, variantId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`${this.baseUrl}/${productId}/variants/${variantId}`);
  }

  // Product images
  getProductImages(productId: string): Observable<ApiResponse<ProductImage[]>> {
    return this.apiService.get<ProductImage[]>(`${this.baseUrl}/${productId}/images`);
  }

  createProductImage(productId: string, image: CreateProductImageDto): Observable<ApiResponse<ProductImage>> {
    return this.apiService.post<ProductImage>(`${this.baseUrl}/${productId}/images`, image);
  }

  updateProductImage(productId: string, imageId: string, image: UpdateProductImageDto): Observable<ApiResponse<ProductImage>> {
    return this.apiService.patch<ProductImage>(`${this.baseUrl}/${productId}/images/${imageId}`, image);
  }

  deleteProductImage(productId: string, imageId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`${this.baseUrl}/${productId}/images/${imageId}`);
  }

  // Upload product image
  uploadProductImage(productId: string, file: File, altText?: string): Observable<ApiResponse<ProductImage>> {
    const additionalData = altText ? { altText } : undefined;
    return this.apiService.uploadFile<ProductImage>(`${this.baseUrl}/${productId}/images/upload`, file, additionalData);
  }

  // Categories
  getCategories(params?: QueryParams): Observable<ApiResponse<PaginatedResponse<Category>>> {
    return this.apiService.get<PaginatedResponse<Category>>(this.categoriesUrl, params);
  }

  getCategory(id: string): Observable<ApiResponse<Category>> {
    return this.apiService.get<Category>(`${this.categoriesUrl}/${id}`);
  }

  // Get products by category
  getProductsByCategory(categoryId: string, params?: QueryParams): Observable<ApiResponse<PaginatedResponse<Product>>> {
    return this.apiService.get<PaginatedResponse<Product>>(`${this.categoriesUrl}/${categoryId}/products`, params);
  }
}