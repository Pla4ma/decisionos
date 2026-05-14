// DecisionOS — Spacing Tokens
// Base 8px grid system

export const spacing = {
  // Base unit: 4px
  xs: 4,
  
  // Base unit: 8px
  sm: 8,
  
  // Base unit: 16px
  md: 16,
  
  // Base unit: 24px
  lg: 24,
  
  // Base unit: 32px
  xl: 32,
  
  // Base unit: 48px
  xxl: 48,
  
  // Base unit: 64px
  xxxl: 64,
} as const;

// Touch targets
export const touchTargets = {
  minHeight: 44,
  minWidth: 44,
} as const;

// Screen padding
export const screenPadding = {
  horizontal: 20,
  vertical: 16,
} as const;

export type Spacing = typeof spacing;
