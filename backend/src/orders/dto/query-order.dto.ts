import {
  IsOptional,
  IsEnum,
  IsString,
  IsDateString,
  IsUUID,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import {
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
  PaymentMethod,
} from '../entities/order.entity';
import { CustomerType } from '../entities/customer.entity';

/**
 * DTO para consultas de pedidos con filtros
 */
export class QueryOrderDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

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
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  orderNumber?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minTotal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxTotal?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  shippingCarrier?: string;

  @IsOptional()
  @IsEnum(CustomerType)
  customerType?: CustomerType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}