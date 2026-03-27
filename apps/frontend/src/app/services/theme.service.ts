import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';
export type ColorPalette = 'default' | 'ocean' | 'sunset' | 'forest' | 'lavender';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  light: string;
  dark: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'app_theme';
  private readonly PALETTE_KEY = 'app_palette';

  currentTheme = signal<Theme>(this.getStoredTheme());
  currentPalette = signal<ColorPalette>(this.getStoredPalette());

  palettes: Record<ColorPalette, ThemeColors> = {
    default: {
      primary: '#4f46e5',
      secondary: '#6366f1',
      accent: '#06b6d4',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
      light: '#e2e8f0',
      dark: '#1e293b'
    },
    ocean: {
      primary: '#0284c7',
      secondary: '#38bdf8',
      accent: '#0891b2',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#0284c7',
      light: '#e2e8f0',
      dark: '#1e293b'
    },
    sunset: {
      primary: '#ea580c',
      secondary: '#fb923c',
      accent: '#db2777',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
      light: '#e2e8f0',
      dark: '#1e293b'
    },
    forest: {
      primary: '#059669',
      secondary: '#34d399',
      accent: '#0d9488',
      success: '#059669',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
      light: '#e2e8f0',
      dark: '#1e293b'
    },
    lavender: {
      primary: '#7c3aed',
      secondary: '#a78bfa',
      accent: '#c026d3',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
      light: '#e2e8f0',
      dark: '#1e293b'
    }
  };

  constructor() {
    effect(() => {
      this.applyTheme(this.currentTheme());
      this.applyPalette(this.currentPalette());
    });
  }

  private getStoredTheme(): Theme {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return (stored as Theme) || 'light';
  }

  private getStoredPalette(): ColorPalette {
    const stored = localStorage.getItem(this.PALETTE_KEY);
    return (stored as ColorPalette) || 'default';
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
  }

  private applyPalette(palette: ColorPalette): void {
    const colors = this.palettes[palette];
    const root = document.documentElement;

    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--secondary-color', colors.secondary);
    root.style.setProperty('--accent-color', colors.accent);
    root.style.setProperty('--success-color', colors.success);
    root.style.setProperty('--warning-color', colors.warning);
    root.style.setProperty('--danger-color', colors.danger);
    root.style.setProperty('--info-color', colors.info);
    root.style.setProperty('--light-color', colors.light);
    root.style.setProperty('--dark-color', colors.dark);

    localStorage.setItem(this.PALETTE_KEY, palette);
  }

  toggleTheme(): void {
    this.currentTheme.update(t => t === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  setPalette(palette: ColorPalette): void {
    this.currentPalette.set(palette);
  }

  getPaletteColors(): ThemeColors {
    return this.palettes[this.currentPalette()];
  }
}