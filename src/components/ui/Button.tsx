// Button — Primary action component with variants and states
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing, touchTargets } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: object;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
}: ButtonProps): JSX.Element {
  const isDisabled = disabled || loading;

  const variantStyles = {
    primary: styles.primary,
    secondary: styles.secondary,
    ghost: styles.ghost,
    danger: styles.danger,
  };

  const sizeStyles = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  };

  const textVariantStyles = {
    primary: styles.primaryText,
    secondary: styles.secondaryText,
    ghost: styles.ghostText,
    danger: styles.dangerText,
  };

  const textSizeStyles = {
    small: styles.smallText,
    medium: styles.mediumText,
    large: styles.largeText,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? colors.text.inverse : colors.text.primary}
        />
      ) : (
        <Text style={[textVariantStyles[variant], textSizeStyles[size], isDisabled && styles.disabledText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  // Sizes
  small: {
    minHeight: touchTargets.minHeight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  medium: {
    minHeight: touchTargets.minHeight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  large: {
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  // Variants
  primary: {
    backgroundColor: colors.accent.primary,
  },
  secondary: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.status.error,
  },
  disabled: {
    opacity: 0.5,
  },
  // Text variants
  primaryText: {
    color: colors.text.inverse,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  secondaryText: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  ghostText: {
    color: colors.accent.primary,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  dangerText: {
    color: colors.text.inverse,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  disabledText: {
    color: colors.text.disabled,
  },
  // Text sizes
  smallText: {
    fontSize: typography.size.sm,
  },
  mediumText: {
    fontSize: typography.size.md,
  },
  largeText: {
    fontSize: typography.size.lg,
  },
});
