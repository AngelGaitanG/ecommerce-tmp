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
import { Category } from '../../categories/entities/category.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductImage } from './product-image.entity';
import { v4 as uuidv4 } from 'uuid';

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
}

@Entity('products')
@Index(['slug'], { unique: true })
@Index(['sku'], { unique: true })
@Index(['status', 'isActive'])
@Index(['categoryId', 'status'])
@Index(['isFeatured', 'status'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  shortDescription: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  // Precios
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPrice: number;

  // Inventario
  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'int', nullable: true })
  lowStockThreshold: number;

  @Column({ type: 'boolean', default: true })
  trackQuantity: boolean;

  @Column({ type: 'boolean', default: false })
  allowBackorder: boolean;

  // Dimensiones y peso
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  length: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  width: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  height: number;

  // SEO
  @Column({ type: 'varchar', length: 255, nullable: true })
  metaTitle: string;

  @Column({ type: 'text', nullable: true })
  metaDescription: string;

  @Column({ type: 'simple-array', nullable: true })
  metaKeywords: string[];

  // Estado y configuración
  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'boolean', default: true })
  isVisible: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  // Relaciones
  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => Category, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants: ProductVariant[];

  @OneToMany(() => ProductImage, (image) => image.product, {
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
    return this.salePrice && this.salePrice > 0 ? this.salePrice : this.basePrice;
  }

  hasDiscount(): boolean {
    return this.salePrice && this.salePrice > 0 && this.salePrice < this.basePrice;
  }

  getDiscountPercentage(): number {
    if (!this.hasDiscount()) return 0;
    return Math.round(((this.basePrice - this.salePrice) / this.basePrice) * 100);
  }

  isPublished(): boolean {
    return this.status === ProductStatus.ACTIVE && this.isActive && this.isVisible;
  }

  getMainImage(): ProductImage | null {
    return this.images?.find(img => img.isMain) || this.images?.[0] || null;
  }

  hasVariants(): boolean {
    return this.variants && this.variants.length > 0;
  }

  getTotalStock(): number {
    if (!this.hasVariants()) return this.stockQuantity;
    return this.variants.reduce((total, variant) => total + variant.stockQuantity, 0);
  }
}