// DecisionOS — Color Tokens
// Dark premium aesthetic with muted, trustworthy palette

export const colors = {
  // Backgrounds
  background: {
    primary: '#0D0D0F',
    secondary: '#16171A',
    tertiary: '#1E1F23',
    elevated: '#25262B',
  },

  // Text
  text: {
    primary: '#F5F5F7',
    secondary: '#A1A1AA',
    tertiary: '#71717A',
    disabled: '#52525B',
    inverse: '#0D0D0F',
  },

  // Accent - Muted teal/indigo blend
  accent: {
    primary: '#5EE7D4',
    secondary: '#7C9CEE',
    muted: 'rgba(94, 231, 212, 0.15)',
    gradient: ['#5EE7D4', '#7C9CEE'] as const,
    warning: '#FBBF24',
    error: '#F87171',
  },

  // Status colors - Muted, not neon
  status: {
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
  },

  // Borders and dividers
  border: {
    primary: 'rgba(255, 255, 255, 0.08)',
    secondary: 'rgba(255, 255, 255, 0.04)',
    accent: 'rgba(94, 231, 212, 0.3)',
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.15)',
  },

  // Overlays
  overlay: {
    light: 'rgba(255, 255, 255, 0.04)',
    medium: 'rgba(0, 0, 0, 0.5)',
    heavy: 'rgba(0, 0, 0, 0.8)',
  },

  // Top-level color aliases for component use
  warning: '#FBBF24',
  error: '#F87171',
  light: 'rgba(255, 255, 255, 0.1)',
  medium: '#A1A1AA',
} as const;

export type Colors = typeof colors;
