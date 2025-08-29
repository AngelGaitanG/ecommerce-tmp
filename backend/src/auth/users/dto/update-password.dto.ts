import { IsString, IsNotEmpty } from 'class-validator';

export class UpdatePasswordDto {
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;
}