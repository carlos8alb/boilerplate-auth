import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
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