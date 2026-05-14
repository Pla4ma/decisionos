// Badge — Status indicator and label component
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';

interface BadgeProps {
  title: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'accent';
  size?: 'small' | 'medium';
  style?: object;
}

export function Badge({
  title,
  variant = 'default',
  size = 'small',
  style,
}: BadgeProps): JSX.Element {
  const variantStyles = {
    default: styles.default,
    primary: styles.primary,
    success: styles.success,
    warning: styles.warning,
    error: styles.error,
    info: styles.info,
    accent: styles.accent,
  };

  const textVariantStyles = {
    default: styles.defaultText,
    primary: styles.primaryText,
    success: styles.successText,
    warning: styles.warningText,
    error: styles.errorText,
    info: styles.infoText,
    accent: styles.accentText,
  };

  const sizeStyles = {
    small: styles.small,
    medium: styles.medium,
  };

  return (
    <View style={[styles.base, variantStyles[variant], sizeStyles[size], style]}>
      <Text style={[textVariantStyles[variant], size === 'small' ? styles.smallText : styles.mediumText]}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
  },
  // Sizes
  small: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  medium: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  // Variants
  default: {
    backgroundColor: colors.background.tertiary,
  },
  primary: {
    backgroundColor: colors.accent.muted,
  },
  success: {
    backgroundColor: `${colors.status.success}20`,
  },
  warning: {
    backgroundColor: `${colors.status.warning}20`,
  },
  error: {
    backgroundColor: `${colors.status.error}20`,
  },
  info: {
    backgroundColor: `${colors.status.info}20`,
  },
  accent: {
    backgroundColor: colors.accent.muted,
  },
  // Text variants
  defaultText: {
    color: colors.text.secondary,
  },
  primaryText: {
    color: colors.accent.primary,
  },
  successText: {
    color: colors.status.success,
  },
  warningText: {
    color: colors.status.warning,
  },
  errorText: {
    color: colors.status.error,
  },
  infoText: {
    color: colors.status.info,
  },
  accentText: {
    color: colors.accent.primary,
  },
  // Text sizes
  smallText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  mediumText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
});
