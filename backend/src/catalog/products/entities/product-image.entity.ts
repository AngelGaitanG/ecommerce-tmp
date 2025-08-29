import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { v4 as uuidv4 } from 'uuid';

export enum ImageType {
  MAIN = 'main',
  GALLERY = 'gallery',
  THUMBNAIL = 'thumbnail',
  VARIANT = 'variant',
  ZOOM = 'zoom',
}

@Entity('product_images')
@Index(['productId', 'sortOrder'])
@Index(['variantId', 'sortOrder'])
@Index(['type', 'isActive'])
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  mediumUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  largeUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  originalUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  altText: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ImageType,
    default: ImageType.GALLERY,
  })
  type: ImageType;

  @Column({ type: 'boolean', default: false })
  isMain: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  // Metadatos de la imagen
  @Column({ type: 'varchar', length: 100, nullable: true })
  fileName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mimeType: string;

  @Column({ type: 'int', nullable: true })
  fileSize: number;

  @Column({ type: 'int', nullable: true })
  width: number;

  @Column({ type: 'int', nullable: true })
  height: number;

  // Información de color dominante (para UI)
  @Column({ type: 'varchar', length: 7, nullable: true })
  dominantColor: string;

  // Relaciones
  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'uuid', nullable: true })
  variantId: string;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => ProductVariant, (variant) => variant.images, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'variantId' })
  variant: ProductVariant;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos utilitarios
  getDisplayUrl(size: 'thumbnail' | 'medium' | 'large' | 'original' = 'medium'): string {
    switch (size) {
      case 'thumbnail':
        return this.thumbnailUrl || this.url;
      case 'medium':
        return this.mediumUrl || this.url;
      case 'large':
        return this.largeUrl || this.url;
      case 'original':
        return this.originalUrl || this.url;
      default:
        return this.url;
    }
  }

  getAspectRatio(): number {
    if (!this.width || !this.height) return 1;
    return this.width / this.height;
  }

  isLandscape(): boolean {
    return this.getAspectRatio() > 1;
  }

  isPortrait(): boolean {
    return this.getAspectRatio() < 1;
  }

  isSquare(): boolean {
    return this.getAspectRatio() === 1;
  }

  getFileSizeFormatted(): string {
    if (!this.fileSize) return 'Unknown';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.fileSize;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  getDimensions(): string {
    if (!this.width || !this.height) return 'Unknown';
    return `${this.width} × ${this.height}`;
  }

  isMainImage(): boolean {
    return this.isMain && this.type === ImageType.MAIN;
  }

  isVariantSpecific(): boolean {
    return this.variantId !== null && this.variantId !== undefined;
  }

  belongsToVariant(variantId: string): boolean {
    return this.variantId === variantId;
  }

  belongsToProduct(productId: string): boolean {
    return this.productId === productId;
  }

  getImageInfo(): {
    url: string;
    alt: string;
    title: string;
    dimensions: string;
    size: string;
    type: ImageType;
  } {
    return {
      url: this.getDisplayUrl(),
      alt: this.altText || this.title || `${this.product?.name || 'Product'} image`,
      title: this.title || this.altText || '',
      dimensions: this.getDimensions(),
      size: this.getFileSizeFormatted(),
      type: this.type,
    };
  }

  // Métodos para generar URLs responsivas
  getResponsiveUrls(): {
    thumbnail: string;
    medium: string;
    large: string;
    original: string;
  } {
    return {
      thumbnail: this.getDisplayUrl('thumbnail'),
      medium: this.getDisplayUrl('medium'),
      large: this.getDisplayUrl('large'),
      original: this.getDisplayUrl('original'),
    };
  }

  // Método para generar srcset para imágenes responsivas
  getSrcSet(): string {
    const urls = this.getResponsiveUrls();
    const srcSet = [];
    
    if (urls.thumbnail) srcSet.push(`${urls.thumbnail} 150w`);
    if (urls.medium) srcSet.push(`${urls.medium} 400w`);
    if (urls.large) srcSet.push(`${urls.large} 800w`);
    if (urls.original) srcSet.push(`${urls.original} 1200w`);
    
    return srcSet.join(', ');
  }

  // Validación de URL
  isValidImageUrl(): boolean {
    if (!this.url) return false;
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const urlLower = this.url.toLowerCase();
    
    return imageExtensions.some(ext => urlLower.includes(ext)) || 
           urlLower.startsWith('data:image/') ||
           urlLower.startsWith('http');
  }

  // Método para clonar imagen (útil para variantes)
  clone(newProductId?: string, newVariantId?: string): Partial<ProductImage> {
    return {
      url: this.url,
      thumbnailUrl: this.thumbnailUrl,
      mediumUrl: this.mediumUrl,
      largeUrl: this.largeUrl,
      originalUrl: this.originalUrl,
      altText: this.altText,
      title: this.title,
      description: this.description,
      type: this.type,
      isMain: false, // Solo una imagen puede ser principal
      isActive: this.isActive,
      sortOrder: this.sortOrder,
      fileName: this.fileName,
      mimeType: this.mimeType,
      fileSize: this.fileSize,
      width: this.width,
      height: this.height,
      dominantColor: this.dominantColor,
      productId: newProductId || this.productId,
      variantId: newVariantId || this.variantId,
    };
  }
}