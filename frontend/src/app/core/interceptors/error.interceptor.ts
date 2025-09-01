import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoadingService } from '../services/loading.service';
import { ApiResponse } from '../models/api-response.interface';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private loadingService: LoadingService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Asegurar que se oculte el loading en caso de error
        this.loadingService.hide();

        let errorMessage = 'Ha ocurrido un error inesperado';

        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Error del lado del servidor
          const apiResponse = error.error as ApiResponse;
          
          // Manejar errores JWT específicos
          if (error.status === 401 && apiResponse?.error?.code) {
            this.handleJwtError(apiResponse.error.code, apiResponse.message);
            errorMessage = apiResponse.message;
          } else if (apiResponse && apiResponse.message) {
            errorMessage = apiResponse.message;
          } else {
            switch (error.status) {
              case 400:
                errorMessage = 'Solicitud incorrecta';
                break;
              case 401:
                errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
                this.handleUnauthorized();
                break;
              case 403:
                errorMessage = 'Acceso prohibido';
                break;
              case 404:
                errorMessage = 'Recurso no encontrado';
                break;
              case 422:
                errorMessage = 'Datos de entrada inválidos';
                break;
              case 500:
                errorMessage = 'Error interno del servidor';
                break;
              case 503:
                errorMessage = 'Servicio no disponible';
                break;
              default:
                errorMessage = `Error ${error.status}: ${error.statusText}`;
            }
          }
        }

        // Log del error para debugging
        console.error('HTTP Error:', {
          status: error.status,
          message: errorMessage,
          url: error.url,
          error: error.error
        });

        // Mostrar notificación de error (aquí podrías integrar un servicio de notificaciones)
        // this.notificationService.showError(errorMessage);

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  private handleJwtError(errorCode: string, message: string): void {
    switch (errorCode) {
      case 'TOKEN_EXPIRED':
        console.warn('Token expirado, redirigiendo al login');
        this.clearAuthAndRedirect();
        break;
      case 'INVALID_TOKEN':
        console.warn('Token inválido, redirigiendo al login');
        this.clearAuthAndRedirect();
        break;
      case 'TOKEN_REQUIRED':
        console.warn('Token requerido, redirigiendo al login');
        this.clearAuthAndRedirect();
        break;
      case 'USER_INACTIVE':
        console.warn('Usuario inactivo');
        this.clearAuthAndRedirect();
        break;
      case 'TOKEN_NOT_ACTIVE':
        console.warn('Token no válido aún');
        break;
      default:
        console.warn('Error de autenticación:', message);
        this.clearAuthAndRedirect();
    }
  }

  private handleUnauthorized(): void {
    this.clearAuthAndRedirect();
  }

  private clearAuthAndRedirect(): void {
    // Limpiar token del localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Redirigir al login
    this.router.navigate(['/auth/login']);
  }
}