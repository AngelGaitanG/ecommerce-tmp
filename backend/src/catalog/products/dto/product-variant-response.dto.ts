import { Expose, Type } from 'class-transformer';
import { ProductImageResponseDto } from './product-image-response.dto';

export class ProductVariantResponseDto {
  @Expose()
  id: string;

  @Expose()
  productId: string;

  @Expose()
  sku?: string;

  @Expose()
  barcode?: string;

  @Expose()
  price?: number;

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
  isActive: boolean;

  @Expose()
  color?: string;

  @Expose()
  size?: string;

  @Expose()
  material?: string;

  @Expose()
  style?: string;

  @Expose()
  customAttributes?: Record<string, any>;

  @Expose()
  displayOrder: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => ProductImageResponseDto)
  images?: ProductImageResponseDto[];

  // Computed properties
  @Expose()
  get currentPrice(): number {
    return this.salePrice && this.salePrice > 0 ? this.salePrice : this.price || 0;
  }

  @Expose()
  get isOnSale(): boolean {
    return this.salePrice != null && this.salePrice > 0 && this.price != null && this.salePrice < this.price;
  }

  @Expose()
  get discountPercentage(): number {
    if (!this.isOnSale || !this.price) return 0;
    return Math.round(((this.price - this.salePrice!) / this.price) * 100);
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
  get displayName(): string {
    const parts = [];
    if (this.color) parts.push(this.color);
    if (this.size) parts.push(this.size);
    if (this.material) parts.push(this.material);
    if (this.style) parts.push(this.style);
    return parts.join(' / ') || 'Default Variant';
  }

  @Expose()
  get hasCustomAttributes(): boolean {
    return this.customAttributes != null && Object.keys(this.customAttributes).length > 0;
  }
}