import {
  IsUUID,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  Length,
  Min,
  Max,
  IsObject,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { AlertType, AlertPriority, AlertStatus } from '../entities/stock-alert.entity';

export class CreateStockAlertDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsUUID()
  productVariantId?: string;

  @IsEnum(AlertType)
  type: AlertType;

  @IsOptional()
  @IsEnum(AlertPriority)
  priority?: AlertPriority = AlertPriority.MEDIUM;

  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus = AlertStatus.ACTIVE;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  currentStock: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  thresholdValue?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  recommendedAction?: number;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  location?: string;

  @IsString()
  @Length(1, 255)
  title: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  actionRequired?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsBoolean()
  emailSent?: boolean = false;

  @IsOptional()
  @IsBoolean()
  smsSent?: boolean = false;

  @IsOptional()
  @IsBoolean()
  pushNotificationSent?: boolean = false;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  notes?: string;
}