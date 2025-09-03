import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { LoginRequest } from '../../../../core/models/auth.interface';

@Component({
  selector: 'app-layout1',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './layout1.component.html',
  styleUrls: ['./layout1.component.scss']
})
export class Layout1Component implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  errorMessage: string = '';
  returnUrl: string = '/';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoginMode: boolean = true; // true = login, false = register
  // LoadingService is now public for template access

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public loadingService: LoadingService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Obtener URL de retorno si existe
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.errorMessage = '';
      this.loadingService.show();
      
      const loginData: LoginRequest = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.loadingService.hide();
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.loadingService.hide();
          this.errorMessage = error.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} es requerido`;
      }
      if (field.errors['email']) {
        return 'Ingresa un email válido';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'email': 'Email',
      'password': 'Contraseña'
    };
    return displayNames[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  navigateToRegister(): void {
    this.toggleMode();
  }

  navigateToForgotPassword(): void {
    // Implementar navegación a recuperar contraseña
    console.log('Navegar a recuperar contraseña');
  }

  // Métodos para el registro
  onRegisterSubmit(): void {
    if (this.registerForm.valid) {
      this.errorMessage = '';
      this.loadingService.show();
      
      const registerData = {
        firstName: this.registerForm.get('firstName')?.value,
        lastName: this.registerForm.get('lastName')?.value,
        email: this.registerForm.get('email')?.value,
        password: this.registerForm.get('password')?.value
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.loadingService.hide();
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.loadingService.hide();
          this.errorMessage = error.error?.message || 'Error al registrarse. Intenta nuevamente.';
        }
      });
    } else {
      this.markRegisterFormGroupTouched();
    }
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    // Reset forms when switching
    this.loginForm.reset();
    this.registerForm.reset();
  }

  isRegisterFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getRegisterFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getRegisterFieldDisplayName(fieldName)} es requerido`;
      }
      if (field.errors['email']) {
        return 'Ingresa un email válido';
      }
      if (field.errors['minlength']) {
        return `${this.getRegisterFieldDisplayName(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
    }
    
    // Check for password mismatch
    if (fieldName === 'confirmPassword' && this.registerForm.errors?.['passwordMismatch']) {
      return 'Las contraseñas no coinciden';
    }
    
    return '';
  }

  private getRegisterFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'firstName': 'Nombre',
      'lastName': 'Apellido',
      'email': 'Email',
      'password': 'Contraseña',
      'confirmPassword': 'Confirmar contraseña'
    };
    return displayNames[fieldName] || fieldName;
  }

  private markRegisterFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  private passwordMatchValidator(form: any) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }
}