import { HttpStatus, HttpException } from '@nestjs/common';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  statusCode: number;
}

export class CustomResponse {
  private static createResponse<T>(
    success: boolean,
    message: string,
    statusCode: number,
    data?: T,
    error?: string,
  ): ApiResponse<T> {
    return {
      success,
      message,
      data,
      error,
      timestamp: new Date().toISOString(),
      statusCode,
    };
  }

  static success<T>(
    message: string = 'Operación exitosa',
    data?: T,
    statusCode: number = HttpStatus.OK,
  ): ApiResponse<T> {
    return this.createResponse(true, message, statusCode, data);
  }

  static created<T>(
    message: string = 'Recurso creado exitosamente',
    data?: T,
  ): ApiResponse<T> {
    return this.createResponse(true, message, HttpStatus.CREATED, data);
  }

  // ✨ Método que lanza HttpException con el código correcto
  static error(
    messageOrError: string | Error | HttpException,
    statusCode?: number,
  ): never {
    // Si es una HttpException de NestJS, re-lanzarla
    if (messageOrError instanceof HttpException) {
      throw messageOrError;
    }
    
    // Si es un Error genérico
    if (messageOrError instanceof Error) {
      throw new HttpException(
        {
          success: false,
          message: messageOrError.message,
          error: messageOrError.name,
          timestamp: new Date().toISOString(),
          statusCode: statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        },
        statusCode || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    
    // Si es un string
    throw new HttpException(
      {
        success: false,
        message: messageOrError,
        error: 'Error',
        timestamp: new Date().toISOString(),
        statusCode: statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      },
      statusCode || HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  static badRequest(
    message: string = 'Solicitud incorrecta',
    error?: string,
  ): ApiResponse {
    return this.createResponse(false, message, HttpStatus.BAD_REQUEST, undefined, error);
  }

  static unauthorized(
    message: string = 'No autorizado',
    error?: string,
  ): ApiResponse {
    return this.createResponse(false, message, HttpStatus.UNAUTHORIZED, undefined, error);
  }

  static forbidden(
    message: string = 'Acceso prohibido',
    error?: string,
  ): ApiResponse {
    return this.createResponse(false, message, HttpStatus.FORBIDDEN, undefined, error);
  }

  static notFound(
    message: string = 'Recurso no encontrado',
    error?: string,
  ): ApiResponse {
    return this.createResponse(false, message, HttpStatus.NOT_FOUND, undefined, error);
  }

  static conflict(
    message: string = 'Conflicto en la solicitud',
    error?: string,
  ): ApiResponse {
    return this.createResponse(false, message, HttpStatus.CONFLICT, undefined, error);
  }
}