import { IsString, IsOptional, IsNumber, IsEnum, IsUUID, IsUrl, Min, Max, Length } from 'class-validator';
import { ImageType } from '../entities/product-image.entity';

export class CreateProductImageDto {
  @IsOptional()
  @IsUUID(4)
  productId?: string;

  @IsOptional()
  @IsUUID(4)
  variantId?: string;

  @IsUrl()
  thumbnailUrl: string;

  @IsOptional()
  @IsUrl()
  mediumUrl?: string;

  @IsOptional()
  @IsUrl()
  largeUrl?: string;

  @IsOptional()
  @IsUrl()
  originalUrl?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  altText?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  fileName?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  mimeType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSize?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  width?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  height?: number;

  @IsOptional()
  @IsString()
  @Length(0, 7)
  dominantColor?: string;

  @IsOptional()
  @IsEnum(ImageType)
  type?: ImageType = ImageType.GALLERY;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(999)
  displayOrder?: number = 0;
}