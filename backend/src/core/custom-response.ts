import { HttpStatus } from '@nestjs/common';

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

  static error(
    message: string = 'Ha ocurrido un error',
    error?: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
  ): ApiResponse {
    return this.createResponse(false, message, statusCode, undefined, error);
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