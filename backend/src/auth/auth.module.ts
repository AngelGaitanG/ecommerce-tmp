import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { JwtService } from '@nestjs/jwt';
import { JwtGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtErrorInterceptor } from './interceptors/jwt-error.interceptor';
import { JwtExceptionFilter } from './filters/jwt-exception.filter';

@Module({
  imports: [
    UsersModule,
    RolesModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtService,
    JwtGuard,
    RolesGuard,
    JwtErrorInterceptor,
    JwtExceptionFilter,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: JwtErrorInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: JwtExceptionFilter,
    },
  ],
  exports: [JwtService, AuthService, JwtGuard, RolesGuard]
})
export class AuthModule {}
