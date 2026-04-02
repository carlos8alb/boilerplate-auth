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