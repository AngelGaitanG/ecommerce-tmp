import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="welcome-container">
      <div class="welcome-content">
        <div class="welcome-header">
          <h1 class="welcome-title">
            <span class="gradient-text">Bienvenido a</span>
            <span class="brand-name">E-Commerce</span>
          </h1>
          <p class="welcome-subtitle">
            Tu tienda online moderna y segura
          </p>
        </div>
        
        <div class="welcome-features">
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"/>
              </svg>
            </div>
            <h3>Catálogo de Productos</h3>
            <p>Explora nuestra amplia selección de productos</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3>Compras Seguras</h3>
            <p>Transacciones protegidas y datos seguros</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3>Soporte 24/7</h3>
            <p>Estamos aquí para ayudarte cuando lo necesites</p>
          </div>
        </div>
        
        <div class="welcome-actions">
          <a routerLink="/auth/login" class="btn btn-primary">
            Iniciar Sesión
          </a>
          <a routerLink="/auth/register" class="btn btn-secondary">
            Registrarse
          </a>
        </div>
        
        <div class="welcome-status">
          <p class="status-text">
            <span class="status-indicator"></span>
            Sistema en desarrollo - Funcionalidades básicas disponibles
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-container {
      min-height: calc(100vh - 80px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
    
    .welcome-content {
      max-width: 800px;
      text-align: center;
      background: white;
      border-radius: 20px;
      padding: 3rem 2rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    
    .welcome-header {
      margin-bottom: 3rem;
    }
    
    .welcome-title {
      font-size: 3rem;
      font-weight: 800;
      margin-bottom: 1rem;
      line-height: 1.2;
    }
    
    .gradient-text {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: block;
    }
    
    .brand-name {
      color: #1f2937;
      display: block;
    }
    
    .welcome-subtitle {
      font-size: 1.25rem;
      color: #6b7280;
      margin: 0;
    }
    
    .welcome-features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }
    
    .feature-card {
      padding: 2rem 1.5rem;
      border-radius: 12px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      transition: all 0.3s ease;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      border-color: #667eea;
    }
    
    .feature-icon {
      width: 3rem;
      height: 3rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }
    
    .feature-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }
    
    .feature-card p {
      color: #6b7280;
      margin: 0;
    }
    
    .welcome-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 0.75rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(102, 126, 234, 0.4);
    }
    
    .btn-secondary {
      background: white;
      color: #667eea;
      border-color: #667eea;
    }
    
    .btn-secondary:hover {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
    }
    
    .welcome-status {
      padding-top: 2rem;
      border-top: 1px solid #e5e7eb;
    }
    
    .status-text {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: #6b7280;
      font-size: 0.875rem;
      margin: 0;
    }
    
    .status-indicator {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
    
    @media (max-width: 768px) {
      .welcome-content {
        padding: 2rem 1.5rem;
      }
      
      .welcome-title {
        font-size: 2.5rem;
      }
      
      .welcome-subtitle {
        font-size: 1.125rem;
      }
      
      .welcome-features {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
      
      .welcome-actions {
        flex-direction: column;
        align-items: center;
      }
      
      .btn {
        width: 100%;
        max-width: 300px;
      }
    }
  `]
})
export class WelcomeComponent {}