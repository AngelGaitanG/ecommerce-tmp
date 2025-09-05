import { IsString, IsOptional, Length } from 'class-validator';

export class AcknowledgeAlertDto {
  @IsString()
  @Length(1, 100)
  acknowledgedBy: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  notes?: string;
}