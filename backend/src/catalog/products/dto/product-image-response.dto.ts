import { Expose } from 'class-transformer';
import { ImageType } from '../entities/product-image.entity';

export class ProductImageResponseDto {
  @Expose()
  id: string;

  @Expose()
  productId?: string;

  @Expose()
  variantId?: string;

  @Expose()
  thumbnailUrl: string;

  @Expose()
  mediumUrl?: string;

  @Expose()
  largeUrl?: string;

  @Expose()
  originalUrl?: string;

  @Expose()
  altText?: string;

  @Expose()
  title?: string;

  @Expose()
  description?: string;

  @Expose()
  fileName?: string;

  @Expose()
  mimeType?: string;

  @Expose()
  fileSize?: number;

  @Expose()
  width?: number;

  @Expose()
  height?: number;

  @Expose()
  dominantColor?: string;

  @Expose()
  type: ImageType;

  @Expose()
  displayOrder: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  // Computed properties
  @Expose()
  get displayUrl(): string {
    return this.largeUrl || this.mediumUrl || this.thumbnailUrl;
  }

  @Expose()
  get aspectRatio(): number {
    if (!this.width || !this.height) return 1;
    return this.width / this.height;
  }

  @Expose()
  get formattedFileSize(): string {
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

  @Expose()
  get isValidImage(): boolean {
    return this.thumbnailUrl != null && this.thumbnailUrl.length > 0;
  }

  @Expose()
  get hasMultipleSizes(): boolean {
    return !!(this.mediumUrl || this.largeUrl || this.originalUrl);
  }

  @Expose()
  get typeLabel(): string {
    switch (this.type) {
      case ImageType.MAIN:
        return 'Principal';
      case ImageType.GALLERY:
        return 'Galería';
      case ImageType.THUMBNAIL:
        return 'Miniatura';
      case ImageType.VARIANT:
        return 'Variante';
      case ImageType.ZOOM:
        return 'Zoom';
      default:
        return 'Desconocido';
    }
  }
}