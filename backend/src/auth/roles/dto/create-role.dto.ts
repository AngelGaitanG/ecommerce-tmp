import { IsEnum, IsString, IsOptional, MaxLength } from 'class-validator';
import { Role } from '../enums/role.enum';
import { Transform } from 'class-transformer';

export class CreateRoleDto {
  @IsEnum(Role, { message: 'El nombre del rol debe ser uno de los valores permitidos' })
  name: Role;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(255, { message: 'La descripción no puede tener más de 255 caracteres' })
  @Transform(({ value }) => value?.trim())
  description?: string;
}