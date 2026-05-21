import { memo, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing, touchTargets } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';
import { lightImpact } from '@/lib/haptics';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  haptic?: boolean;
  accessibilityLabel?: string;
}

export const Button = memo(function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  haptic = true,
  accessibilityLabel,
}: ButtonProps): JSX.Element {
  const isDisabled = disabled || loading;

  const handlePress = useCallback(() => {
    if (haptic && !isDisabled) lightImpact();
    onPress?.();
  }, [onPress, haptic, isDisabled]);

  const variantStyles = { primary: styles.primary, secondary: styles.secondary, ghost: styles.ghost, danger: styles.danger };
  const sizeStyles = { small: styles.small, medium: styles.medium, large: styles.large };
  const textVariantStyles = { primary: styles.primaryText, secondary: styles.secondaryText, ghost: styles.ghostText, danger: styles.dangerText };
  const textSizeStyles = { small: styles.smallText, medium: styles.mediumText, large: styles.largeText };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      style={[styles.base, sizeStyles[size], variantStyles[variant], isDisabled && styles.disabled, style]}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' || variant === 'danger' ? colors.text.inverse : colors.text.primary} />
      ) : (
        <Text style={[textVariantStyles[variant], textSizeStyles[size], isDisabled && styles.disabledText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  small: { minHeight: touchTargets.minHeight, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  medium: { minHeight: touchTargets.minHeight, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  large: { minHeight: 52, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  primary: { backgroundColor: colors.accent.primary },
  secondary: { backgroundColor: colors.background.elevated, borderWidth: 1, borderColor: colors.border.primary },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.status.error },
  disabled: { opacity: 0.5 },
  primaryText: { color: colors.text.inverse, fontSize: typography.size.md, fontWeight: typography.weight.semibold as any },
  secondaryText: { color: colors.text.primary, fontSize: typography.size.md, fontWeight: typography.weight.semibold as any },
  ghostText: { color: colors.accent.primary, fontSize: typography.size.md, fontWeight: typography.weight.semibold as any },
  dangerText: { color: colors.text.inverse, fontSize: typography.size.md, fontWeight: typography.weight.semibold as any },
  disabledText: { color: colors.text.disabled },
  smallText: { fontSize: typography.size.sm },
  mediumText: { fontSize: typography.size.md },
  largeText: { fontSize: typography.size.lg },
});
