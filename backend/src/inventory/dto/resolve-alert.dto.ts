import { IsString, IsOptional, Length } from 'class-validator';

export class ResolveAlertDto {
  @IsString()
  @Length(1, 100)
  resolvedBy: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  notes?: string;
}