export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku: string;
  stock: number;
  isActive: boolean;
  categoryId: string;
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para crear/actualizar productos
export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  sku: string;
  stock: number;
  categoryId: string;
  isActive?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  sku?: string;
  stock?: number;
  categoryId?: string;
  isActive?: boolean;
}

export interface CreateProductVariantDto {
  productId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, any>;
  isActive?: boolean;
}

export interface UpdateProductVariantDto {
  name?: string;
  sku?: string;
  price?: number;
  stock?: number;
  attributes?: Record<string, any>;
  isActive?: boolean;
}

export interface CreateProductImageDto {
  productId: string;
  url: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface UpdateProductImageDto {
  url?: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}