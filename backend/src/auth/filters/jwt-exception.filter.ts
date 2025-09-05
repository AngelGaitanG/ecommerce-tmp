import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class JwtExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    
    // Obtener el mensaje de la excepción
    const exceptionResponse = exception.getResponse();
    
    // Si ya tiene el formato correcto, usarlo directamente
    if (typeof exceptionResponse === 'object' && exceptionResponse['success'] === false) {
      return response.status(status).json(exceptionResponse);
    }
    
    // Si es un string simple, formatear la respuesta
    const errorMessage = typeof exceptionResponse === 'string' 
      ? exceptionResponse 
      : exceptionResponse['message'] || 'Error de autenticación';
    
    const errorResponse = {
      success: false,
      message: errorMessage,
      error: {
        code: 'UNAUTHORIZED',
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      data: null,
    };
    
    response.status(status).json(errorResponse);
  }
}