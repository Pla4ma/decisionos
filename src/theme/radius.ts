// DecisionOS — Border Radius Tokens

export const radius = {
  // Sharp
  none: 0,
  
  // Subtle rounding
  sm: 6,
  
  // Standard rounding
  md: 12,
  
  // Prominent rounding
  lg: 16,
  
  // Maximum rounding
  xl: 24,
  
  // Full rounding (pills, circles)
  full: 9999,
} as const;

export type Radius = typeof radius;
