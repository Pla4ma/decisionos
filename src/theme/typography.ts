// DecisionOS — Typography Tokens
// System font stack with semantic sizing

export const typography = {
  // Font families
  family: {
    primary: 'System',
    mono: 'Courier', // System mono fallback
  },

  // Font sizes
  size: {
    xxs: 11,
    xs: 13,
    sm: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Font weights
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Semantic presets
  preset: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 17,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    caption: {
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 18,
    },
    label: {
      fontSize: 13,
      fontWeight: '600' as const,
      lineHeight: 18,
      letterSpacing: 0.5,
    },
  },
} as const;

export type Typography = typeof typography;
