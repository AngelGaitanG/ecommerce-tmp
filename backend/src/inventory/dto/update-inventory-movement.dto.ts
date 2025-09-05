import { PartialType } from '@nestjs/mapped-types';
import { IsUUID, IsOptional } from 'class-validator';
import { CreateInventoryMovementDto } from './create-inventory-movement.dto';

export class UpdateInventoryMovementDto extends PartialType(CreateInventoryMovementDto) {
  @IsOptional()
  @IsUUID()
  id?: string;
}