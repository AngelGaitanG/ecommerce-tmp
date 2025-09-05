import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import {
  IsOptional,
  IsEnum,
  IsString,
  IsDateString,
  IsNumber,
  Min,
  Length,
} from 'class-validator';
import {
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
} from '../entities/order.entity';

/**
 * DTO para actualizar un pedido existente
 */
export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsEnum(ShippingStatus)
  shippingStatus?: ShippingStatus;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  paymentTransactionId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  shippingCarrier?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  trackingNumber?: string;

  @IsOptional()
  @IsDateString()
  estimatedDeliveryDate?: string;

  @IsOptional()
  @IsString()
  adminNotes?: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  cancellationReason?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  refundedAmount?: number;
}