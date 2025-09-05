import { PartialType } from '@nestjs/mapped-types';
import { CreateAddressDto } from './create-address.dto';
import { IsOptional, IsBoolean } from 'class-validator';

/**
 * DTO para actualizar una dirección existente
 */
export class UpdateAddressDto extends PartialType(CreateAddressDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}