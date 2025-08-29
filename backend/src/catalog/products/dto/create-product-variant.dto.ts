import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID, IsObject, Min, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductVariantDto {
  @IsUUID(4)
  productId: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  sku?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  barcode?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  salePrice?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minStockLevel?: number = 0;

  @IsOptional()
  @IsBoolean()
  trackStock?: boolean = true;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  length?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  width?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  height?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  color?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  size?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  material?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  style?: string;

  @IsOptional()
  @IsObject()
  customAttributes?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number = 0;
}