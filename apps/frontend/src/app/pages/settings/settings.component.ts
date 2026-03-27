import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LayoutComponent } from '../../components/layout/layout.component';
import { AuthService } from '../../services/auth.service';
import { ColorPalette, ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LayoutComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
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
