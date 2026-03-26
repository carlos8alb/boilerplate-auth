import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
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
          <h1 class="font-display">Nueva contraseña</h1>
          <p>Ingresa tu nueva contraseña</p>
        </div>

        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="newPassword" class="form-label">Nueva contraseña</label>
            <div class="password-input">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                id="newPassword"
                class="form-control"
                formControlName="newPassword"
                placeholder="••••••••"
                [class.is-invalid]="resetForm.get('newPassword')?.invalid && resetForm.get('newPassword')?.touched"
              />
              <button type="button" class="toggle-password" (click)="togglePassword()">
                @if (showPassword()) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            @if (resetForm.get('newPassword')?.invalid && resetForm.get('newPassword')?.touched) {
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
              [class.is-invalid]="resetForm.get('confirmPassword')?.invalid && resetForm.get('confirmPassword')?.touched"
            />
            @if (resetForm.get('confirmPassword')?.touched && resetForm.get('newPassword')?.value !== resetForm.get('confirmPassword')?.value) {
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
            Restablecer contraseña
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

      p { color: var(--text-muted); font-size: 0.95rem; }
    }

    .form-group { margin-bottom: 1.5rem; }

    .password-input {
      position: relative;
      .form-control { padding-right: 3rem; }
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
      &:hover { color: var(--accent-color); }
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
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');
  success = signal('');
  showPassword = signal(false);

  resetForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const token = this.route.snapshot.queryParams['token'];
    if (!token) {
      this.error.set('Token inválido');
      return;
    }

    if (this.resetForm.value.newPassword !== this.resetForm.value.confirmPassword) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.authService.resetPassword({
      token,
      newPassword: this.resetForm.value.newPassword!
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Contraseña actualizada correctamente');
        setTimeout(() => this.router.navigate(['/auth/login']), 3000);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al restablecer la contraseña');
      }
    });
  }
}