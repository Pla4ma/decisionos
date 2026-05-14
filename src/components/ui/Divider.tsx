// Divider — Visual separator
import { View, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'small' | 'medium' | 'large';
  style?: object;
}

export function Divider({
  orientation = 'horizontal',
  spacing: spacingProp = 'medium',
  style,
}: DividerProps): JSX.Element {
  const spacingStyles = {
    none: styles.spacingNone,
    small: styles.spacingSmall,
    medium: styles.spacingMedium,
    large: styles.spacingLarge,
  };

  if (orientation === 'vertical') {
    return (
      <View
        style={[
          styles.vertical,
          spacingStyles[spacingProp],
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.horizontal,
        spacingStyles[spacingProp],
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    backgroundColor: colors.border.primary,
    width: '100%',
  },
  vertical: {
    width: 1,
    backgroundColor: colors.border.primary,
    alignSelf: 'stretch',
  },
  // Spacing
  spacingNone: {
    marginVertical: 0,
    marginHorizontal: 0,
  },
  spacingSmall: {
    marginVertical: spacing.sm,
    marginHorizontal: spacing.sm,
  },
  spacingMedium: {
    marginVertical: spacing.md,
    marginHorizontal: spacing.md,
  },
  spacingLarge: {
    marginVertical: spacing.lg,
    marginHorizontal: spacing.lg,
  },
});
