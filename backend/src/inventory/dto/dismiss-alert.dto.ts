import { IsString, IsOptional, Length } from 'class-validator';

export class DismissAlertDto {
  @IsString()
  @Length(1, 100)
  dismissedBy: string;

  @IsString()
  @Length(1, 500)
  reason: string;
}