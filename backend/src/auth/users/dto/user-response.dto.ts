import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { RoleResponseDto } from 'src/auth/roles/dto/role-response.dto';
export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  @Transform(({ obj }) => `${obj.firstName} ${obj.lastName}`)
  fullName: string;

  @Expose()
  isActive: boolean;

  @Expose()
  @Type(() => RoleResponseDto)
  roles: RoleResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}