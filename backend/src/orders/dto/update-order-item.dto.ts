import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { OrderItemStatus } from '../entities/order-item.entity';

/**
 * DTO para actualizar un item del pedido
 */
export class UpdateOrderItemDto {
  @IsOptional()
  @IsEnum(OrderItemStatus)
  status?: OrderItemStatus;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

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
  @IsNumber()
  @Min(0)
  shippedQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveredQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  returnedQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  refundedQuantity?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}