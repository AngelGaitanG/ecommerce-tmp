import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsArray,
  ValidateNested,
  IsObject,
  Min,
  Max,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/order.entity';

/**
 * DTO para crear un item del pedido
 */
export class CreateOrderItemDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsUUID()
  productVariantId?: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  discountRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  taxRate?: number;

  @IsOptional()
  @IsBoolean()
  isCustomized?: boolean;

  @IsOptional()
  @IsObject()
  customizations?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  customizationCost?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * DTO para crear un nuevo pedido
 */
export class CreateOrderDto {
  @IsUUID()
  customerId: string;

  @IsUUID()
  shippingAddressId: string;

  @IsUUID()
  billingAddressId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  shippingMethod?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  taxRate?: number;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  couponCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  discountRate?: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsBoolean()
  isGift?: boolean;

  @IsOptional()
  @IsString()
  giftMessage?: string;

  @IsOptional()
  @IsBoolean()
  requiresSignature?: boolean;

  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}