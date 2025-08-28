import { Expose, Transform } from 'class-transformer';
import { Role } from '../enums/role.enum';

export class RoleResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: Role;

  @Expose()
  description: string;

  @Expose()
  @Transform(({ obj }) => obj.users?.length || 0)
  userCount: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}