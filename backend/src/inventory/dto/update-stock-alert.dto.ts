import { PartialType } from '@nestjs/mapped-types';
import { IsUUID, IsOptional } from 'class-validator';
import { CreateStockAlertDto } from './create-stock-alert.dto';

export class UpdateStockAlertDto extends PartialType(CreateStockAlertDto) {
  @IsOptional()
  @IsUUID()
  id?: string;
}