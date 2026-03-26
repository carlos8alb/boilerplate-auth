import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../components/layout/layout.component';
import { User } from '../../models/auth.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="users-page fade-in">
        <div class="page-header d-flex justify-content-between align-items-center">
          <div>
            <h1>Gestión de Usuarios</h1>
            <p class="subtitle">Administra los usuarios del sistema</p>
          </div>
        </div>

        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div class="search-box">
              <input 
                type="text" 
                class="form-control" 
                placeholder="Buscar usuarios..."
                [(ngModel)]="searchTerm"
                (input)="filterUsers()"
              />
            </div>
            <div class="filters">
              <select class="form-select" [(ngModel)]="roleFilter" (change)="filterUsers()">
                <option value="">Todos los roles</option>
                <option value="ADMIN">Admin</option>
                <option value="USER">Usuario</option>
                <option value="MODERATOR">Moderador</option>
              </select>
            </div>
          </div>

          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table mb-0">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (user of filteredUsers(); track user.id) {
                    <tr>
                      <td>
                        <div class="user-cell">
                          <div class="user-avatar">{{ getInitials(user) }}</div>
                          <div class="user-info">
                            <span class="user-name">{{ user.fullName || 'Sin nombre' }}</span>
                            <span class="user-id">{{ user.id | slice:0:8 }}...</span>
                          </div>
                        </div>
                      </td>
                      <td>{{ user.email }}</td>
                      <td>
                        <span class="badge" [class]="getRoleBadgeClass(user.role?.name)">
                          {{ user.role?.name }}
                        </span>
                      </td>
                      <td>
                        @if (user.isEmailVerified) {
                          <span class="badge bg-success">Verificado</span>
                        } @else {
                          <span class="badge bg-warning">Pendiente</span>
                        }
                      </td>
                      <td>{{ formatDate(user.createdAt) }}</td>
                      <td>
                        <div class="action-buttons">
                          <button class="btn btn-sm btn-outline-primary" (click)="editUser(user)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button class="btn btn-sm btn-outline-danger" (click)="confirmDelete(user)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="text-center py-4 text-muted">
                        No se encontraron usuarios
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          @if (pagination().pages > 1) {
            <div class="card-footer d-flex justify-content-between align-items-center">
              <span class="text-muted">
                Mostrando {{ (pagination().page - 1) * pagination().pageSize + 1 }} - 
                {{ Math.min(pagination().page * pagination().pageSize, pagination().total) }} 
                de {{ pagination().total }} usuarios
              </span>
              <nav>
                <ul class="pagination mb-0">
                  <li class="page-item" [class.disabled]="pagination().page === 1">
                    <button class="page-link" (click)="changePage(pagination().page - 1)">Anterior</button>
                  </li>
                  @for (p of [].constructor(pagination().pages); track $index) {
                    <li class="page-item" [class.active]="pagination().page === $index + 1">
                      <button class="page-link" (click)="changePage($index + 1)">{{ $index + 1 }}</button>
                    </li>
                  }
                  <li class="page-item" [class.disabled]="pagination().page === pagination().pages">
                    <button class="page-link" (click)="changePage(pagination().page + 1)">Siguiente</button>
                  </li>
                </ul>
              </nav>
            </div>
          }
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .users-page {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 1.5rem;
      h1 { font-size: 1.75rem; font-weight: 700; color: var(--text-color); margin-bottom: 0.25rem; }
      .subtitle { color: var(--text-muted); }
    }

    .search-box {
      width: 300px;
      .form-control { border-radius: 10px; }
    }

    .filters .form-select {
      width: 180px;
      border-radius: 10px;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: var(--accent-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.85rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 500;
      color: var(--text-color);
    }

    .user-id {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-family: monospace;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;

      .btn {
        padding: 0.4rem 0.6rem;
        border-radius: 8px;
      }
    }

    .pagination .page-link {
      border-radius: 8px;
      margin: 0 2px;
      border: none;
      color: var(--text-color);
      &:hover { background: var(--accent-color); color: white; }
    }

    .pagination .page-item.active .page-link {
      background: var(--accent-color);
      color: white;
    }
  `]
})
export class UsersComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1`;

  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  searchTerm = '';
  roleFilter = '';
  
  pagination = signal({
    page: 1,
    pageSize: 20,
    total: 0,
    pages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  Math = Math;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page = 1): void {
    this.http.get<any>(`${this.apiUrl}/users?page=${page}&pageSize=20`).subscribe({
      next: (res) => {
        this.users.set(res.data);
        this.filterUsers();
        this.pagination.set(res.pagination);
      },
      error: (err) => console.error('Error loading users:', err)
    });
  }

  filterUsers(): void {
    let filtered = this.users();
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.email.toLowerCase().includes(term) || 
        u.fullName?.toLowerCase().includes(term)
      );
    }
    
    if (this.roleFilter) {
      filtered = filtered.filter(u => u.role?.name === this.roleFilter);
    }
    
    this.filteredUsers.set(filtered);
  }

  changePage(page: number): void {
    this.loadUsers(page);
  }

  getInitials(user: User): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email?.[0]?.toUpperCase() || 'U';
  }

  getRoleBadgeClass(role?: string): string {
    if (role === 'ADMIN') return 'bg-danger';
    if (role === 'MODERATOR') return 'bg-warning';
    return 'bg-primary';
  }

  formatDate(date?: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  editUser(user: User): void {
    console.log('Edit user:', user);
  }

  confirmDelete(user: User): void {
    if (confirm(`¿Estás seguro de eliminar a ${user.email}?`)) {
      this.http.delete(`${this.apiUrl}/users/${user.id}`).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Error deleting user:', err)
      });
    }
  }
}