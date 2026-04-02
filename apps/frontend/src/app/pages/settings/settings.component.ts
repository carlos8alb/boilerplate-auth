import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ColorPalette, ThemeService } from '../../services/theme.service';
import { API_URL } from '../../constants/api.constants';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  activeTab = signal<'profile' | 'password' | 'theme'>('profile');

  savingProfile = signal(false);
  profileSuccess = signal('');
  profileError = signal('');

  savingPassword = signal(false);
  passwordSuccess = signal('');
  passwordError = signal('');

  profileForm = this.fb.group({
    firstName: [''],
    lastName: [''],
    email: [{ value: '', disabled: true }]
  });

  passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  palettes: { key: ColorPalette; label: string; colors: { primary: string; secondary: string; accent: string } }[] = [
    { key: 'default', label: 'Default', colors: { primary: '#4f46e5', secondary: '#6366f1', accent: '#06b6d4' } },
    { key: 'ocean', label: 'Ocean', colors: { primary: '#0284c7', secondary: '#38bdf8', accent: '#0891b2' } },
    { key: 'sunset', label: 'Sunset', colors: { primary: '#ea580c', secondary: '#fb923c', accent: '#db2777' } },
    { key: 'forest', label: 'Forest', colors: { primary: '#059669', secondary: '#34d399', accent: '#0d9488' } },
    { key: 'lavender', label: 'Lavender', colors: { primary: '#7c3aed', secondary: '#a78bfa', accent: '#c026d3' } }
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

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    const user = this.authService.currentUser();
    if (!user) return;

    this.savingProfile.set(true);
    this.profileSuccess.set('');
    this.profileError.set('');

    const data = {
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName
    };

    this.http.put(`${API_URL}/users/${user.id}`, data).subscribe({
      next: (res: any) => {
        this.savingProfile.set(false);
        this.profileSuccess.set('Perfil actualizado correctamente');
        if (res.data) {
          this.authService.currentUser.set(res.data);
        }
      },
      error: (err) => {
        this.savingProfile.set(false);
        this.profileError.set(err.error?.message || 'Error al actualizar el perfil');
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.passwordError.set('Las contraseñas no coinciden');
      return;
    }

    if (currentPassword === newPassword) {
      this.passwordError.set('La nueva contraseña no puede ser igual a la actual');
      return;
    }

    this.savingPassword.set(true);
    this.passwordSuccess.set('');
    this.passwordError.set('');

    this.http.post(`${API_URL}/auth/change-password`, { currentPassword, newPassword }).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordSuccess.set('Contraseña actualizada correctamente');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.savingPassword.set(false);
        this.passwordError.set(err.error?.message || 'Error al cambiar la contraseña');
      }
    });
  }
}