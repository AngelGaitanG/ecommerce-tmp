import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto';
import { IsOptional, IsBoolean, IsDateString } from 'class-validator';

/**
 * DTO para actualizar un cliente existente
 */
export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsDateString()
  lastLoginAt?: string;
}