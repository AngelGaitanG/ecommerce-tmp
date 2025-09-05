import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsPhoneNumber,
  Length,
  IsObject,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CustomerType, CustomerStatus } from '../entities/customer.entity';

/**
 * DTO para crear un nuevo cliente
 */
export class CreateCustomerDto {
  @IsString()
  @Length(1, 100)
  firstName: string;

  @IsString()
  @Length(1, 100)
  lastName: string;

  @IsEmail()
  @Length(1, 150)
  email: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;

  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  // Información de empresa (para clientes B2B)
  @IsOptional()
  @IsString()
  @Length(1, 150)
  companyName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  taxId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  department?: string;

  // Preferencias
  @IsOptional()
  @IsBoolean()
  acceptsMarketing?: boolean;

  @IsOptional()
  @IsString()
  @Length(2, 10)
  preferredLanguage?: string;

  @IsOptional()
  @IsString()
  @Length(2, 10)
  preferredCurrency?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  timezone?: string;

  // Información adicional
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}