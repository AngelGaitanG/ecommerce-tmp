import {
  IsUUID,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
  Min,
  Max,
  Length,
  IsDecimal,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { MovementType, MovementReason } from '../entities/inventory-movement.entity';

export class CreateInventoryMovementDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsUUID()
  productVariantId?: string;

  @IsEnum(MovementType)
  type: MovementType;

  @IsEnum(MovementReason)
  reason: MovementReason;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  quantity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  previousStock: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  newStock: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  unitCost?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  totalCost?: number;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  location?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  referenceType?: string;

  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  notes?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  performedBy?: string;
}