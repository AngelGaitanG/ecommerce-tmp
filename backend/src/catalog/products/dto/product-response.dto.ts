import { Expose, Type } from 'class-transformer';
import { ProductStatus } from '../entities/product.entity';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';
import { ProductVariantResponseDto } from './product-variant-response.dto';
import { ProductImageResponseDto } from './product-image-response.dto';

export class ProductResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  slug: string;

  @Expose()
  sku?: string;

  @Expose()
  barcode?: string;

  @Expose()
  basePrice: number;

  @Expose()
  salePrice?: number;

  @Expose()
  costPrice?: number;

  @Expose()
  stockQuantity: number;

  @Expose()
  minStockLevel: number;

  @Expose()
  trackStock: boolean;

  @Expose()
  weight?: number;

  @Expose()
  length?: number;

  @Expose()
  width?: number;

  @Expose()
  height?: number;

  @Expose()
  metaTitle?: string;

  @Expose()
  metaDescription?: string;

  @Expose()
  metaKeywords?: string[];

  @Expose()
  status: ProductStatus;

  @Expose()
  isActive: boolean;

  @Expose()
  isFeatured: boolean;

  @Expose()
  featuredOrder?: number;

  @Expose()
  tags?: string[];

  @Expose()
  shortDescription?: string;

  @Expose()
  brand?: string;

  @Expose()
  model?: string;

  @Expose()
  condition?: string;

  @Expose()
  rating?: number;

  @Expose()
  reviewCount: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt?: Date;

  @Expose()
  @Type(() => CategoryResponseDto)
  categories?: CategoryResponseDto[];

  @Expose()
  @Type(() => ProductVariantResponseDto)
  variants?: ProductVariantResponseDto[];

  @Expose()
  @Type(() => ProductImageResponseDto)
  images?: ProductImageResponseDto[];

  // Computed properties
  @Expose()
  get currentPrice(): number {
    return this.salePrice && this.salePrice > 0 ? this.salePrice : this.basePrice;
  }

  @Expose()
  get isOnSale(): boolean {
    return this.salePrice != null && this.salePrice > 0 && this.salePrice < this.basePrice;
  }

  @Expose()
  get discountPercentage(): number {
    if (!this.isOnSale) return 0;
    return Math.round(((this.basePrice - this.salePrice!) / this.basePrice) * 100);
  }

  @Expose()
  get isInStock(): boolean {
    if (!this.trackStock) return true;
    return this.stockQuantity > 0;
  }

  @Expose()
  get isLowStock(): boolean {
    if (!this.trackStock) return false;
    return this.stockQuantity <= this.minStockLevel;
  }

  @Expose()
  get totalVariants(): number {
    return this.variants?.length || 0;
  }

  @Expose()
  get totalImages(): number {
    return this.images?.length || 0;
  }
}