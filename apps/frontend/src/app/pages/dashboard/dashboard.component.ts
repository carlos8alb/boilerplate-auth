import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LayoutComponent } from '../../components/layout/layout.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="dashboard fade-in">
        <div class="page-header">
          <h1>Bienvenido, {{ authService.currentUser()?.firstName || 'Usuario' }}</h1>
          <p class="subtitle">Este es tu panel de control</p>
        </div>

        <div class="row g-4">
          <div class="col-md-6 col-xl-3">
            <div class="stat-card stagger-1">
              <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div class="stat-content">
                <span class="stat-value">1</span>
                <span class="stat-label">Perfil</span>
              </div>
            </div>
          </div>

          <div class="col-md-6 col-xl-3">
            <div class="stat-card stagger-2">
              <div class="stat-icon accent">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ authService.currentUser()?.isEmailVerified ? 'Verificado' : 'Pendiente' }}</span>
                <span class="stat-label">Email</span>
              </div>
            </div>
          </div>

          <div class="col-md-6 col-xl-3">
            <div class="stat-card stagger-3">
              <div class="stat-icon warning">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ authService.currentUser()?.role?.name }}</span>
                <span class="stat-label">Rol</span>
              </div>
            </div>
          </div>

          <div class="col-md-6 col-xl-3">
            <div class="stat-card stagger-4">
              <div class="stat-icon info">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ getJoinDate() }}</span>
                <span class="stat-label">Miembro desde</span>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4 mt-2">
          <div class="col-lg-8">
            <div class="card chart-card fade-in" style="animation-delay: 0.3s;">
              <div class="card-header">
                <h5>Actividad Reciente</h5>
              </div>
              <div class="card-body">
                <div class="chart-placeholder">
                  <div class="placeholder-content">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    <p>Aquí se mostrará tu actividad</p>
                    <span class="text-muted">Los gráficos se integrarán pronto</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card fade-in" style="animation-delay: 0.4s;">
              <div class="card-header">
                <h5>Información del Usuario</h5>
              </div>
              <div class="card-body">
                <div class="user-info-list">
                  <div class="info-item">
                    <span class="info-label">Email</span>
                    <span class="info-value">{{ authService.currentUser()?.email }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Nombre</span>
                    <span class="info-value">{{ authService.currentUser()?.fullName || 'No definido' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">ID</span>
                    <span class="info-value code">{{ authService.currentUser()?.id | slice:0:8 }}...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;

      h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--text-color);
        margin-bottom: 0.25rem;
      }

      .subtitle {
        color: var(--text-muted);
        font-size: 1rem;
      }
    }

    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
      opacity: 0;
      animation: fadeIn 0.5s ease forwards;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-hover);
      }
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      background: rgba(45, 52, 54, 0.1);
      color: var(--primary-color);
      display: flex;
      align-items: center;
      justify-content: center;

      &.accent {
        background: rgba(0, 184, 148, 0.15);
        color: var(--accent-color);
      }

      &.warning {
        background: rgba(253, 203, 110, 0.15);
        color: var(--warning-color);
      }

      &.info {
        background: rgba(9, 132, 227, 0.15);
        color: var(--info-color);
      }
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-color);
    }

    .stat-label {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .chart-card .card-header h5 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-color);
      margin: 0;
    }

    .chart-placeholder {
      height: 280px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .placeholder-content {
      text-align: center;
      color: var(--text-muted);

      svg {
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      p {
        font-weight: 500;
        margin-bottom: 0.25rem;
        color: var(--text-color);
      }

      span {
        font-size: 0.85rem;
      }
    }

    .card-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);

      h5 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-color);
        margin: 0;
      }
    }

    .card-body {
      padding: 1.5rem;
    }

    .user-info-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-color);

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
    }

    .info-label {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .info-value {
      font-weight: 500;
      color: var(--text-color);

      &.code {
        font-family: 'SF Mono', Monaco, monospace;
        font-size: 0.8rem;
        background: var(--body-bg);
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }
  `]
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe();
  }

  getJoinDate(): string {
    const date = this.authService.currentUser()?.createdAt;
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', {
      month: 'short',
      year: 'numeric'
    });
  }
}