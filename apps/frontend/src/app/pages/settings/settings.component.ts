import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ThemeService, ColorPalette, Theme } from '../../services/theme.service';
import { LayoutComponent } from '../../components/layout/layout.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="settings-page fade-in">
        <div class="page-header">
          <h1>Configuración</h1>
          <p class="subtitle">Administra tu cuenta y preferencias</p>
        </div>

        <div class="row g-4">
          <div class="col-lg-4">
            <div class="card profile-card fade-in" style="animation-delay: 0.1s;">
              <div class="card-body text-center">
                <div class="avatar-wrapper">
                  <div class="avatar">
                    {{ getUserInitials() }}
                  </div>
                  <button class="avatar-edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                </div>
                <h4 class="mt-3 mb-1">{{ authService.currentUser()?.fullName || 'Usuario' }}</h4>
                <p class="text-muted mb-3">{{ authService.currentUser()?.email }}</p>
                <span class="badge" [class]="getRoleBadgeClass()">
                  {{ authService.currentUser()?.role?.name }}
                </span>
              </div>
            </div>
          </div>

          <div class="col-lg-8">
            <div class="card fade-in" style="animation-delay: 0.2s;">
              <div class="card-header">
                <ul class="nav nav-tabs" role="tablist">
                  <li class="nav-item">
                    <button class="nav-link" [class.active]="activeTab() === 'profile'" (click)="activeTab.set('profile')">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Perfil
                    </button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link" [class.active]="activeTab() === 'theme'" (click)="activeTab.set('theme')">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                      Apariencia
                    </button>
                  </li>
                </ul>
              </div>

              <div class="card-body">
                @if (activeTab() === 'profile') {
                  <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label">Nombre</label>
                        <input type="text" class="form-control" formControlName="firstName" />
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Apellido</label>
                        <input type="text" class="form-control" formControlName="lastName" />
                      </div>
                      <div class="col-12">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" formControlName="email" [attr.disabled]="true" />
                        <small class="text-muted">El email no se puede cambiar</small>
                      </div>
                    </div>

                    <div class="mt-4 d-flex gap-2">
                      <button type="submit" class="btn btn-primary" [disabled]="saving()">
                        @if (saving()) {
                          <span class="spinner-border spinner-border-sm me-2"></span>
                        }
                        Guardar cambios
                      </button>
                      <button type="button" class="btn btn-outline-secondary" (click)="resetProfileForm()">
                        Cancelar
                      </button>
                    </div>
                  </form>
                }

                @if (activeTab() === 'theme') {
                  <div class="theme-settings">
                    <div class="theme-option">
                      <label class="form-label">Modo</label>
                      <div class="theme-modes">
                        <button 
                          class="mode-btn" 
                          [class.active]="themeService.currentTheme() === 'light'"
                          (click)="themeService.setTheme('light')"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                          Claro
                        </button>
                        <button 
                          class="mode-btn" 
                          [class.active]="themeService.currentTheme() === 'dark'"
                          (click)="themeService.setTheme('dark')"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                          Oscuro
                        </button>
                      </div>
                    </div>

                    <div class="theme-option mt-4">
                      <label class="form-label">Paleta de colores</label>
                      <div class="palette-grid">
                        @for (palette of palettes; track palette.key) {
                          <button 
                            class="palette-btn"
                            [class.active]="themeService.currentPalette() === palette.key"
                            (click)="themeService.setPalette(palette.key)"
                            [style.--preview-primary]="palette.colors.primary"
                            [style.--preview-secondary]="palette.colors.secondary"
                            [style.--preview-accent]="palette.colors.accent"
                          >
                            <span class="palette-preview">
                              <span class="preview-dot" style="background: var(--preview-primary)"></span>
                              <span class="preview-dot" style="background: var(--preview-secondary)"></span>
                              <span class="preview-dot" style="background: var(--preview-accent)"></span>
                            </span>
                            <span class="palette-name">{{ palette.label }}</span>
                          </button>
                        }
                      </div>
                    </div>

                    <div class="theme-preview mt-4">
                      <label class="form-label">Vista previa</label>
                      <div class="preview-card">
                        <div class="preview-header">
                          <span class="preview-btn"></span>
                          <span class="preview-btn"></span>
                          <span class="preview-btn"></span>
                        </div>
                        <div class="preview-body">
                          <div class="preview-sidebar"></div>
                          <div class="preview-content">
                            <div class="preview-line" style="width: 60%"></div>
                            <div class="preview-line" style="width: 80%"></div>
                            <div class="preview-line" style="width: 40%"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .settings-page {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
      h1 { font-size: 1.75rem; font-weight: 700; color: var(--text-color); margin-bottom: 0.25rem; }
      .subtitle { color: var(--text-muted); }
    }

    .profile-card {
      .avatar-wrapper {
        position: relative;
        display: inline-block;
      }
      .avatar {
        width: 100px;
        height: 100px;
        border-radius: 20px;
        background: var(--accent-color);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: 600;
      }
      .avatar-edit {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        &:hover { background: var(--accent-color); color: white; }
      }
      h4 { color: var(--text-color); font-weight: 600; }
    }

    .nav-tabs {
      border: none;
      gap: 0.5rem;
      padding: 0.5rem;
      .nav-link {
        border: none;
        border-radius: 10px;
        padding: 0.75rem 1.25rem;
        color: var(--text-muted);
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s;
        &:hover { background: var(--body-bg); color: var(--text-color); }
        &.active { background: var(--accent-color); color: white; }
      }
    }

    .theme-modes {
      display: flex;
      gap: 1rem;
    }

    .mode-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      border: 2px solid var(--border-color);
      border-radius: 12px;
      background: var(--card-bg);
      color: var(--text-muted);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      &:hover { border-color: var(--accent-color); }
      &.active { border-color: var(--accent-color); background: var(--accent-color); color: white; }
    }

    .palette-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 1rem;
    }

    .palette-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border: 2px solid var(--border-color);
      border-radius: 12px;
      background: var(--card-bg);
      cursor: pointer;
      transition: all 0.2s;
      &:hover { border-color: var(--accent-color); }
      &.active { border-color: var(--accent-color); }
    }

    .palette-preview {
      display: flex;
      gap: 4px;
      .preview-dot {
        width: 24px;
        height: 24px;
        border-radius: 6px;
      }
    }

    .palette-name {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .preview-card {
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
    }

    .preview-header {
      display: flex;
      gap: 6px;
      padding: 0.75rem;
      background: var(--body-bg);
      .preview-btn {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--border-color);
      }
    }

    .preview-body {
      display: flex;
      height: 120px;
    }

    .preview-sidebar {
      width: 60px;
      background: var(--card-bg);
      border-right: 1px solid var(--border-color);
    }

    .preview-content {
      flex: 1;
      padding: 1rem;
      background: var(--body-bg);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .preview-line {
      height: 8px;
      border-radius: 4px;
      background: var(--border-color);
    }

    @media (max-width: 768px) {
      .palette-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class SettingsComponent implements OnInit {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private fb = inject(FormBuilder);

  activeTab = signal<'profile' | 'theme'>('profile');
  saving = signal(false);

  profileForm = this.fb.group({
    firstName: [''],
    lastName: [''],
    email: [{ value: '', disabled: true }]
  });

  palettes: { key: ColorPalette; label: string; colors: { primary: string; secondary: string; accent: string } }[] = [
    { key: 'default', label: 'Default', colors: { primary: '#2d3436', secondary: '#636e72', accent: '#00b894' } },
    { key: 'ocean', label: 'Ocean', colors: { primary: '#0984e3', secondary: '#74b9ff', accent: '#00cec9' } },
    { key: 'sunset', label: 'Sunset', colors: { primary: '#e17055', secondary: '#fdcb6e', accent: '#fd79a8' } },
    { key: 'forest', label: 'Forest', colors: { primary: '#00b894', secondary: '#55efc4', accent: '#81ecec' } },
    { key: 'lavender', label: 'Lavender', colors: { primary: '#6c5ce7', secondary: '#a29bfe', accent: '#fd79a8' } }
  ];

  ngOnInit(): void {
    this.initForm();
    this.authService.getCurrentUser().subscribe();
  }

  initForm(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email
      });
    }
  }

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  }

  getRoleBadgeClass(): string {
    const role = this.authService.currentUser()?.role?.name;
    if (role === 'ADMIN') return 'bg-danger';
    if (role === 'MODERATOR') return 'bg-warning';
    return 'bg-primary';
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.saving.set(true);
    setTimeout(() => {
      this.saving.set(false);
    }, 1000);
  }

  resetProfileForm(): void {
    this.initForm();
  }
}