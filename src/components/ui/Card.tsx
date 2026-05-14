// Card — Surface container for content grouping
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { shadows } from '@/theme/shadows';

interface CardProps {
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: object;
}

export function Card({
  children,
  onPress,
  variant = 'default',
  padding = 'medium',
  style,
}: CardProps): JSX.Element {
  const variantStyles = {
    default: styles.default,
    elevated: styles.elevated,
    outlined: styles.outlined,
  };

  const paddingStyles = {
    none: styles.paddingNone,
    small: styles.paddingSmall,
    medium: styles.paddingMedium,
    large: styles.paddingLarge,
  };

  const cardContent = (
    <View style={[styles.base, variantStyles[variant], paddingStyles[padding], style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    backgroundColor: colors.background.secondary,
  },
  // Variants
  default: {
    backgroundColor: colors.background.secondary,
  },
  elevated: {
    backgroundColor: colors.background.elevated,
    ...shadows.md,
  },
  outlined: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  // Padding
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: spacing.sm,
  },
  paddingMedium: {
    padding: spacing.md,
  },
  paddingLarge: {
    padding: spacing.lg,
  },
});
