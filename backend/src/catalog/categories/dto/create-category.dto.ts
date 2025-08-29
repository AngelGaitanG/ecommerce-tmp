import { IsString, IsOptional, IsUUID, IsBoolean, IsNumber, MinLength, MaxLength } from 'class-validator';

export class CreateCategoryDto {

  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60, { message: 'El título meta no puede exceder 60 caracteres' })
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160, { message: 'La descripción meta no puede exceder 160 caracteres' })
  metaDescription?: string;

  @IsOptional()
  @IsUUID(4, { message: 'El ID de la categoría padre debe ser un UUID válido' })
  parentId?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El orden debe ser un número' })
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}