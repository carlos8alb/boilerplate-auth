import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/auth.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
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
