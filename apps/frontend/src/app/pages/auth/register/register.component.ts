import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-bg">
        <div class="bg-shape bg-shape-1"></div>
        <div class="bg-shape bg-shape-2"></div>
        <div class="bg-shape bg-shape-3"></div>
      </div>
      
      <div class="auth-card fade-in">
        <div class="auth-header">
          <h1 class="font-display">Crear cuenta</h1>
          <p>Únete a nuestra plataforma</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label for="firstName" class="form-label">Nombre</label>
                <input
                  type="text"
                  id="firstName"
                  class="form-control"
                  formControlName="firstName"
                  placeholder="Juan"
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label for="lastName" class="form-label">Apellido</label>
                <input
                  type="text"
                  id="lastName"
                  class="form-control"
                  formControlName="lastName"
                  placeholder="Pérez"
                />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Correo electrónico</label>
            <input
              type="email"
              id="email"
              class="form-control"
              formControlName="email"
              placeholder="tu@email.com"
              [class.is-invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
            />
            @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
              <div class="invalid-feedback">Por favor ingresa un correo válido</div>
            }
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <div class="password-input">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                id="password"
                class="form-control"
                formControlName="password"
                placeholder="••••••••"
                [class.is-invalid]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
              />
              <button type="button" class="toggle-password" (click)="togglePassword()">
                @if (showPassword()) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
              <div class="invalid-feedback">La contraseña debe tener al menos 8 caracteres</div>
            }
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              class="form-control"
              formControlName="confirmPassword"
              placeholder="••••••••"
              [class.is-invalid]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
            />
            @if (registerForm.get('confirmPassword')?.touched && registerForm.get('confirmPassword')?.value !== registerForm.get('password')?.value) {
              <div class="invalid-feedback">Las contraseñas no coinciden</div>
            }
          </div>

          @if (error()) {
            <div class="alert alert-danger">{{ error() }}</div>
          }

          @if (success()) {
            <div class="alert alert-success">{{ success() }}</div>
          }

          <button type="submit" class="btn btn-primary w-100" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner-border spinner-border-sm me-2"></span>
            }
            Crear cuenta
          </button>
        </form>

        <div class="auth-footer">
          <p>¿Ya tienes cuenta? <a routerLink="/auth/login">Inicia sesión</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }

    .auth-bg {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .bg-shape {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.5;
    }

    .bg-shape-1 {
      width: 400px;
      height: 400px;
      background: var(--accent-color);
      top: -100px;
      left: -100px;
      animation: float 20s ease-in-out infinite;
    }

    .bg-shape-2 {
      width: 300px;
      height: 300px;
      background: var(--primary-color);
      bottom: -50px;
      right: -50px;
      animation: float 25s ease-in-out infinite reverse;
    }

    .bg-shape-3 {
      width: 200px;
      height: 200px;
      background: var(--secondary-color);
      top: 60%;
      left: 20%;
      animation: pulse 15s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(30px, 30px); }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(1.2); opacity: 0.5; }
    }

    .auth-card {
      background: var(--card-bg);
      border-radius: 24px;
      padding: 2.5rem;
      width: 100%;
      max-width: 500px;
      box-shadow: var(--shadow-hover);
      position: relative;
      z-index: 1;
      border: 1px solid var(--border-color);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;

      h1 {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        color: var(--text-color);
      }

      p {
        color: var(--text-muted);
        font-size: 0.95rem;
      }
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .password-input {
      position: relative;

      .form-control {
        padding-right: 3rem;
      }
    }

    .toggle-password {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      transition: color 0.2s;

      &:hover {
        color: var(--accent-color);
      }
    }

    .invalid-feedback {
      color: var(--danger-color);
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }

    .alert-danger {
      background: rgba(214, 48, 49, 0.1);
      border: 1px solid var(--danger-color);
      color: var(--danger-color);
      border-radius: 10px;
      padding: 0.75rem 1rem;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }

    .alert-success {
      background: rgba(0, 184, 148, 0.1);
      border: 1px solid var(--success-color);
      color: var(--success-color);
      border-radius: 10px;
      padding: 0.75rem 1rem;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }

    .w-100 {
      width: 100%;
    }

    .auth-footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);

      p {
        color: var(--text-muted);
        font-size: 0.95rem;

        a {
          color: var(--accent-color);
          text-decoration: none;
          font-weight: 500;

          &:hover {
            opacity: 0.8;
          }
        }
      }
    }

    @media (max-width: 480px) {
      .auth-card {
        padding: 2rem 1.5rem;
      }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');
  success = signal('');
  showPassword = signal(false);

  registerForm = this.fb.group({
    firstName: [''],
    lastName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { confirmPassword, ...data } = this.registerForm.value;
    
    if (data.password !== confirmPassword) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.authService.register(data as { email: string; password: string; firstName?: string; lastName?: string })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.success.set(res.message + ' Revisa tu correo para verificar tu cuenta.');
          this.registerForm.reset();
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Error al crear la cuenta');
        }
      });
  }
}