import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-bg">
        <div class="bg-shape bg-shape-1"></div>
        <div class="bg-shape bg-shape-2"></div>
      </div>
      
      <div class="auth-card fade-in">
        <div class="auth-header">
          <h1 class="font-display">¿Olvidaste tu contraseña?</h1>
          <p>Ingresa tu correo y te enviaremos un enlace para restaurarla</p>
        </div>

        <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email" class="form-label">Correo electrónico</label>
            <input
              type="email"
              id="email"
              class="form-control"
              formControlName="email"
              placeholder="tu@email.com"
              [class.is-invalid]="forgotForm.get('email')?.invalid && forgotForm.get('email')?.touched"
            />
            @if (forgotForm.get('email')?.invalid && forgotForm.get('email')?.touched) {
              <div class="invalid-feedback">Por favor ingresa un correo válido</div>
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
            Enviar enlace
          </button>
        </form>

        <div class="auth-footer">
          <p><a routerLink="/auth/login">← Volver a iniciar sesión</a></p>
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
      right: -100px;
      animation: float 20s ease-in-out infinite;
    }

    .bg-shape-2 {
      width: 300px;
      height: 300px;
      background: var(--primary-color);
      bottom: -50px;
      left: -50px;
      animation: float 25s ease-in-out infinite reverse;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(30px, 30px); }
    }

    .auth-card {
      background: var(--card-bg);
      border-radius: 24px;
      padding: 3rem;
      width: 100%;
      max-width: 440px;
      box-shadow: var(--shadow-hover);
      position: relative;
      z-index: 1;
      border: 1px solid var(--border-color);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;

      h1 {
        font-size: 1.75rem;
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
      margin-bottom: 1.5rem;
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

    .w-100 { width: 100%; }

    .auth-footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);

      p a {
        color: var(--accent-color);
        text-decoration: none;
        font-weight: 500;

        &:hover { opacity: 0.8; }
      }
    }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loading = signal(false);
  error = signal('');
  success = signal('');

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.authService.forgotPassword({ email: this.forgotForm.value.email! })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set('Si el correo existe, recibirás un enlace para restablecer tu contraseña.');
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Error al procesar la solicitud');
        }
      });
  }
}