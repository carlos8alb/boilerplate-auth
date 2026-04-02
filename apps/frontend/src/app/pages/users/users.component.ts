import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User, Role } from '../../models/auth.model';
import { API_URL } from '../../constants/api.constants';

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

  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  roles = signal<Role[]>([]);
  searchTerm = '';
  roleFilter = '';

  editingUser = signal<User | null>(null);
  saving = signal(false);
  editError = signal('');
  editSuccess = signal('');

  editForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    roleId: ['', [Validators.required]]
  });

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
    this.loadRoles();
  }

  loadUsers(page = 1): void {
    this.http.get<any>(`${API_URL}/users?page=${page}&pageSize=20`).subscribe({
      next: (res) => {
        this.users.set(res.data || []);
        this.filterUsers();
        if (res.pagination) {
          this.pagination.set({
            page: res.pagination.page,
            pageSize: res.pagination.pageSize,
            total: res.pagination.total,
            pages: res.pagination.pages,
            hasNextPage: res.pagination.page < res.pagination.pages,
            hasPreviousPage: res.pagination.page > 1
          });
        }
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