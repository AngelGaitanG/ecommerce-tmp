import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateProductVariantDto } from './create-product-variant.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateProductVariantDto extends PartialType(
  OmitType(CreateProductVariantDto, ['productId'] as const)
) {
  @IsOptional()
  @IsUUID(4)
  id?: string;
}