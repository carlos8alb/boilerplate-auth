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
      primary: '#2d3436',
      secondary: '#636e72',
      accent: '#00b894',
      success: '#00b894',
      warning: '#fdcb6e',
      danger: '#d63031',
      info: '#0984e3',
      light: '#dfe6e9',
      dark: '#2d3436'
    },
    ocean: {
      primary: '#0984e3',
      secondary: '#74b9ff',
      accent: '#00cec9',
      success: '#00b894',
      warning: '#ffeaa7',
      danger: '#ff7675',
      info: '#0984e3',
      light: '#dfe6e9',
      dark: '#2d3436'
    },
    sunset: {
      primary: '#e17055',
      secondary: '#fdcb6e',
      accent: '#fd79a8',
      success: '#00b894',
      warning: '#fdcb6e',
      danger: '#d63031',
      info: '#74b9ff',
      light: '#ffeaa7',
      dark: '#2d3436'
    },
    forest: {
      primary: '#00b894',
      secondary: '#55efc4',
      accent: '#81ecec',
      success: '#00b894',
      warning: '#fdcb6e',
      danger: '#ff7675',
      info: '#00cec9',
      light: '#dfe6e9',
      dark: '#2d3436'
    },
    lavender: {
      primary: '#6c5ce7',
      secondary: '#a29bfe',
      accent: '#fd79a8',
      success: '#00b894',
      warning: '#ffeaa7',
      danger: '#ff7675',
      info: '#74b9ff',
      light: '#dfe6e9',
      dark: '#2d3436'
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