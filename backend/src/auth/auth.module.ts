import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    UsersModule,
    RolesModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService],
  exports: [JwtService, AuthService]
})
export class AuthModule {}
