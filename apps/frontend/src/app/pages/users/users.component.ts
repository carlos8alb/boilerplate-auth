import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User, Role } from '../../models/auth.model';
import { API_URL } from '../../constants/api.constants';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  users = signal<User[]>([]);
  roles = signal<Role[]>([]);
  searchTerm = '';
  roleFilter = '';

  editingUser = signal<User | null>(null);
  saving = signal(false);
  editError = signal('');
  editSuccess = signal('');

  resendingEmail = signal<string | null>(null);
  resendMessage = signal<{ email: string; message: string; success: boolean } | null>(null);

  editForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    roleId: ['', [Validators.required]]
  });

  pagination = signal({
    page: 1,
    pageSize: 10,
    total: 0,
    pages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  pageSizeOptions = [5, 10, 20, 50, 100];
  sortBy = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';
  currentSortColumn = '';

  Math = Math;

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(page = 1, pageSize?: number): void {
    const size = pageSize || this.pagination().pageSize;
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('pageSize', size.toString());
    params.set('sortBy', this.sortBy);
    params.set('sortOrder', this.sortOrder);
    if (this.searchTerm) params.set('search', this.searchTerm);
    if (this.roleFilter) params.set('role', this.roleFilter);

    this.http.get<any>(`${API_URL}/users?${params}`).subscribe({
      next: (res) => {
        const data = res.data || [];
        this.users.set(data);
        const paginationData = res.pagination;
        const total = paginationData?.total ?? data.length;
        const pages = paginationData?.pages ?? 1;
        const pageSize = paginationData?.pageSize ?? size;
        this.pagination.set({
          page: paginationData?.page ?? page,
          pageSize,
          total,
          pages,
          hasNextPage: page < pages,
          hasPreviousPage: page > 1
        });
      },
      error: (err) => console.error('Error loading users:', err)
    });
  }

  loadRoles(): void {
    this.http.get<any>(`${API_URL}/roles`).subscribe({
      next: (res) => {
        this.roles.set(res.data || []);
      },
      error: (err) => console.error('Error loading roles:', err)
    });
  }

  filterUsers(): void {
    this.loadUsers(1);
  }

  changePage(page: number): void {
    this.loadUsers(page);
  }

  sortByColumn(column: string): void {
    if (this.currentSortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortColumn = column;
      this.sortOrder = 'asc';
    }
    this.sortBy = column;
    this.loadUsers(1);
  }

  onPageSizeChange(size: number): void {
    this.pagination.update(p => ({ ...p, pageSize: size, page: 1 }));
    this.loadUsers(1, size);
  }

  onPageSizeChangeFromEvent(event: Event): void {
    const size = parseInt((event.target as HTMLSelectElement).value, 10);
    this.onPageSizeChange(size);
  }

  getInitials(user: User): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email?.[0]?.toUpperCase() || 'U';
  }

  getRoleBadgeClass(role?: string): string {
    const colors: Record<string, string> = {
      ADMIN: 'bg-danger',
      MODERATOR: 'bg-warning',
      USER: 'bg-primary',
      CLIENT: 'bg-success',
      COMPANY: 'bg-info',
      GUEST: 'bg-secondary',
    };
    return colors[role || ''] || 'bg-primary';
  }

  formatDate(date?: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  resendVerificationEmail(user: User): void {
    this.resendingEmail.set(user.id);
    this.resendMessage.set(null);

    this.http.post<any>(`${API_URL}/auth/resend-verification`, { email: user.email }).subscribe({
      next: (res) => {
        this.resendingEmail.set(null);
        this.resendMessage.set({ email: user.email, message: res.message, success: true });
        setTimeout(() => this.resendMessage.set(null), 3000);
      },
      error: (err) => {
        this.resendingEmail.set(null);
        this.resendMessage.set({ email: user.email, message: err.error?.message || 'Error al enviar email', success: false });
        setTimeout(() => this.resendMessage.set(null), 3000);
      }
    });
  }

  editUser(user: User): void {
    this.editingUser.set(user);
    this.editError.set('');
    this.editSuccess.set('');
    this.editForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      roleId: user.roleId
    });
    document.body.classList.add('modal-open');
  }

  closeModal(): void {
    this.editingUser.set(null);
    this.editForm.reset();
    this.editError.set('');
    this.editSuccess.set('');
    document.body.classList.remove('modal-open');
  }

  saveUser(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const user = this.editingUser();
    if (!user) return;

    this.saving.set(true);
    this.editError.set('');
    this.editSuccess.set('');

    const data = {
      firstName: this.editForm.value.firstName,
      lastName: this.editForm.value.lastName,
      roleId: this.editForm.value.roleId
    };

    this.http.put(`${API_URL}/users/${user.id}`, data).subscribe({
      next: () => {
        this.saving.set(false);
        this.editSuccess.set('Usuario actualizado correctamente');
        this.loadUsers();
        setTimeout(() => this.closeModal(), 1000);
      },
      error: (err) => {
        this.saving.set(false);
        this.editError.set(err.error?.message || 'Error al actualizar el usuario');
      }
    });
  }

  confirmDelete(user: User): void {
    if (confirm(`¿Estás seguro de eliminar a ${user.email}?`)) {
      this.http.delete(`${API_URL}/users/${user.id}`).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Error deleting user:', err)
      });
    }
  }
}
