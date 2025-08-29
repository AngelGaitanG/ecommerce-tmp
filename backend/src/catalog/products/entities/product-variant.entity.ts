import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { ProductImage } from './product-image.entity';
import { v4 as uuidv4 } from 'uuid';

export enum VariantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
}

@Entity('product_variants')
@Index(['sku'], { unique: true })
@Index(['productId', 'status'])
@Index(['status', 'isActive'])
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  // Atributos de variación
  @Column({ type: 'varchar', length: 100, nullable: true })
  color: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  size: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  material: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  style: string;

  @Column({ type: 'json', nullable: true })
  attributes: Record<string, any>;

  // Precios específicos de la variante
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPrice: number;

  // Inventario específico
  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'int', nullable: true })
  lowStockThreshold: number;

  @Column({ type: 'boolean', default: true })
  trackQuantity: boolean;

  @Column({ type: 'boolean', default: false })
  allowBackorder: boolean;

  // Dimensiones específicas (si difieren del producto base)
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  length: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  width: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  height: number;

  // Estado y configuración
  @Column({
    type: 'enum',
    enum: VariantStatus,
    default: VariantStatus.ACTIVE,
  })
  status: VariantStatus;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: true })
  isDefault: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  // Relaciones
  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @OneToMany(() => ProductImage, (image) => image.variant, {
    cascade: true,
  })
  images: ProductImage[];

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos utilitarios
  isInStock(): boolean {
    if (!this.trackQuantity) return true;
    return this.stockQuantity > 0 || this.allowBackorder;
  }

  isLowStock(): boolean {
    if (!this.trackQuantity || !this.lowStockThreshold) return false;
    return this.stockQuantity <= this.lowStockThreshold;
  }

  getCurrentPrice(): number {
    // Si la variante tiene precio específico, usarlo
    if (this.price !== null && this.price !== undefined) {
      return this.salePrice && this.salePrice > 0 ? this.salePrice : this.price;
    }
    // Si no, usar el precio del producto base
    return this.product?.getCurrentPrice() || 0;
  }

  hasDiscount(): boolean {
    if (this.price !== null && this.salePrice !== null) {
      return this.salePrice > 0 && this.salePrice < this.price;
    }
    return this.product?.hasDiscount() || false;
  }

  getDiscountPercentage(): number {
    if (this.price !== null && this.salePrice !== null && this.hasDiscount()) {
      return Math.round(((this.price - this.salePrice) / this.price) * 100);
    }
    return this.product?.getDiscountPercentage() || 0;
  }

  isPublished(): boolean {
    return (
      this.status === VariantStatus.ACTIVE &&
      this.isActive &&
      this.product?.isPublished()
    );
  }

  getDisplayName(): string {
    const parts = [];
    if (this.color) parts.push(this.color);
    if (this.size) parts.push(this.size);
    if (this.material) parts.push(this.material);
    if (this.style) parts.push(this.style);
    
    return parts.length > 0 ? parts.join(' - ') : this.name;
  }

  getFullName(): string {
    return `${this.product?.name || ''} - ${this.getDisplayName()}`;
  }

  getMainImage(): ProductImage | null {
    return this.images?.find(img => img.isMain) || this.images?.[0] || null;
  }

  getWeight(): number {
    return this.weight || this.product?.weight || 0;
  }

  getDimensions(): { length: number; width: number; height: number } {
    return {
      length: this.length || this.product?.length || 0,
      width: this.width || this.product?.width || 0,
      height: this.height || this.product?.height || 0,
    };
  }

  hasCustomAttributes(): boolean {
    return this.attributes && Object.keys(this.attributes).length > 0;
  }

  getAttribute(key: string): any {
    return this.attributes?.[key] || null;
  }

  setAttribute(key: string, value: any): void {
    if (!this.attributes) {
      this.attributes = {};
    }
    this.attributes[key] = value;
  }
}