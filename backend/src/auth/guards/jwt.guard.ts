import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JsonWebTokenError, TokenExpiredError, NotBeforeError } from 'jsonwebtoken';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar si el endpoint es público
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException({
        success: false,
        message: 'Token de acceso requerido',
        error: {
          code: 'TOKEN_REQUIRED',
          message: 'Se requiere un token de acceso para acceder a este recurso.',
          timestamp: new Date().toISOString(),
        },
        data: null,
      });
    }

    try {
      // Verificar y decodificar el token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Obtener información completa del usuario
      const user = await this.usersService.findById(payload.sub);
      
      if (!user.isActive) {
        throw new UnauthorizedException({
          success: false,
          message: 'Usuario inactivo',
          error: {
            code: 'USER_INACTIVE',
            message: 'El usuario está inactivo y no puede acceder al sistema.',
            timestamp: new Date().toISOString(),
          },
          data: null,
        });
      }

      // Agregar el usuario al request para uso posterior
      request['user'] = user;
      
      return true;
    } catch (error) {
      // Si ya es una UnauthorizedException, la propagamos
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      // Manejar errores específicos de JWT
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException({
          success: false,
          message: 'Token expirado',
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'El token de acceso ha expirado. Por favor, inicia sesión nuevamente.',
            timestamp: new Date().toISOString(),
          },
          data: null,
        });
      }
      
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException({
          success: false,
          message: 'Token inválido',
          error: {
            code: 'INVALID_TOKEN',
            message: 'El token proporcionado no es válido.',
            timestamp: new Date().toISOString(),
          },
          data: null,
        });
      }
      
      if (error instanceof NotBeforeError) {
        throw new UnauthorizedException({
          success: false,
          message: 'Token no válido aún',
          error: {
            code: 'TOKEN_NOT_ACTIVE',
            message: 'El token aún no es válido.',
            timestamp: new Date().toISOString(),
          },
          data: null,
        });
      }
      
      // Para otros errores, respuesta genérica
      throw new UnauthorizedException({
        success: false,
        message: 'Error de autenticación',
        error: {
          code: 'AUTH_ERROR',
          message: 'Ha ocurrido un error durante la autenticación.',
          timestamp: new Date().toISOString(),
        },
        data: null,
      });
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}