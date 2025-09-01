import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User, 
  JwtPayload, 
  TokenInfo 
} from '../models/auth.interface';
import { ApiResponse } from '../models/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  /**
   * Inicializar el estado de autenticación al cargar la aplicación
   */
  private initializeAuth(): void {
    const token = this.getToken();
    const userData = this.getUserData();

    if (token && userData && !this.isTokenExpired(token)) {
      this.currentUserSubject.next(userData);
      this.isAuthenticatedSubject.next(true);
    } else {
      this.clearAuth();
    }
  }

  /**
   * Iniciar sesión
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Error en el login');
          }
          return response.data;
        }),
        tap(authResponse => {
          this.setAuthData(authResponse.access_token, authResponse.user);
        }),
        catchError(error => {
          console.error('Error en login:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Registrar nuevo usuario
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/auth/register`, userData)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Error en el registro');
          }
          return response.data;
        }),
        tap(authResponse => {
          this.setAuthData(authResponse.access_token, authResponse.user);
        }),
        catchError(error => {
          console.error('Error en registro:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.clearAuth();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Obtener información del usuario actual desde el backend
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.API_URL}/users/me`)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Error al obtener usuario');
          }
          return response.data;
        }),
        tap(user => {
          this.setUserData(user);
        }),
        catchError(error => {
          console.error('Error al obtener usuario actual:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  /**
   * Obtener el token actual
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener información del token
   */
  getTokenInfo(): TokenInfo | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = this.decodeToken(token);
      const expiresAt = new Date(payload.exp * 1000);
      const isExpired = Date.now() >= payload.exp * 1000;

      return {
        token,
        expiresAt,
        isExpired
      };
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }

  /**
   * Obtener datos del usuario actual
   */
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(roleName: string): boolean {
    const user = this.getCurrentUserValue();
    return user?.roles?.some(role => role.name === roleName) || false;
  }

  /**
   * Verificar si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Establecer datos de autenticación
   */
  private setAuthData(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.setUserData(user);
  }

  /**
   * Establecer datos del usuario
   */
  private setUserData(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Obtener datos del usuario del localStorage
   */
  private getUserData(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Limpiar datos de autenticación
   */
  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Verificar si el token está expirado
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      return Date.now() >= payload.exp * 1000;
    } catch (error) {
      console.error('Error al verificar expiración del token:', error);
      return true;
    }
  }

  /**
   * Decodificar token JWT
   */
  private decodeToken(token: string): JwtPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token JWT inválido');
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  }
}