import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateProductImageDto } from './create-product-image.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateProductImageDto extends PartialType(
  OmitType(CreateProductImageDto, ['productId', 'variantId'] as const)
) {
  @IsOptional()
  @IsUUID(4)
  id?: string;
}