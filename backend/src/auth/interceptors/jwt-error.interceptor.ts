import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JsonWebTokenError, TokenExpiredError, NotBeforeError } from 'jsonwebtoken';
import { CustomResponse } from '../../core/custom-response';

@Injectable()
export class JwtErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Manejar errores específicos de JWT
        if (error instanceof TokenExpiredError) {
          const response = {
            success: false,
            message: 'Token expirado',
            error: {
              code: 'TOKEN_EXPIRED',
              message: 'El token de acceso ha expirado. Por favor, inicia sesión nuevamente.',
              timestamp: new Date().toISOString(),
            },
            data: null,
          };
          
          return throwError(() => new UnauthorizedException(response));
        }
        
        if (error instanceof JsonWebTokenError) {
          const response = {
            success: false,
            message: 'Token inválido',
            error: {
              code: 'INVALID_TOKEN',
              message: 'El token proporcionado no es válido.',
              timestamp: new Date().toISOString(),
            },
            data: null,
          };
          
          return throwError(() => new UnauthorizedException(response));
        }
        
        if (error instanceof NotBeforeError) {
          const response = {
            success: false,
            message: 'Token no válido aún',
            error: {
              code: 'TOKEN_NOT_ACTIVE',
              message: 'El token aún no es válido.',
              timestamp: new Date().toISOString(),
            },
            data: null,
          };
          
          return throwError(() => new UnauthorizedException(response));
        }
        
        // Si es un UnauthorizedException ya formateado, mantenerlo
        if (error instanceof UnauthorizedException) {
          return throwError(() => error);
        }
        
        // Para otros errores, mantener el comportamiento original
        return throwError(() => error);
      }),
    );
  }
}