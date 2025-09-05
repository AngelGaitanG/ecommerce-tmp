import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsPhoneNumber,
  Length,
  IsObject,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { AddressType } from '../entities/address.entity';

/**
 * DTO para crear una nueva dirección
 */
export class CreateAddressDto {
  @IsUUID()
  customerId: string;

  @IsEnum(AddressType)
  type: AddressType;

  @IsString()
  @Length(1, 100)
  firstName: string;

  @IsString()
  @Length(1, 100)
  lastName: string;

  @IsOptional()
  @IsString()
  @Length(1, 150)
  company?: string;

  @IsString()
  @Length(1, 200)
  addressLine1: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  addressLine2?: string;

  @IsString()
  @Length(1, 100)
  city: string;

  @IsString()
  @Length(1, 100)
  state: string;

  @IsString()
  @Length(1, 20)
  postalCode: string;

  @IsString()
  @Length(2, 2)
  country: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  neighborhood?: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  landmark?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  deliveryInstructions?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}