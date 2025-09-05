import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../guards/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';
import { Role } from '../roles/enums/role.enum';

export function Auth(...roles: Role[]) {
  const decorators = [UseGuards(JwtGuard)];
  
  if (roles.length > 0) {
    decorators.push(Roles(...roles));
    decorators.push(UseGuards(RolesGuard));
  }
  
  return applyDecorators(...decorators);
}