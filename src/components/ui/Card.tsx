import { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
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
  animated?: boolean;
  accessibilityLabel?: string;
}

export const Card = memo(function Card({
  children,
  onPress,
  variant = 'default',
  padding = 'medium',
  style,
  animated = false,
  accessibilityLabel,
}: CardProps): JSX.Element {
  const variantStyles = { default: styles.default, elevated: styles.elevated, outlined: styles.outlined };
  const paddingStyles = { none: styles.paddingNone, small: styles.paddingSmall, medium: styles.paddingMedium, large: styles.paddingLarge };

  const inner = (
    <View style={[styles.base, variantStyles[variant], paddingStyles[padding], style]}>
      {children}
    </View>
  );

  const Wrapper = animated ? Animated.View : View;
  const wrapperProps = animated ? { entering: FadeIn.duration(300) } : {};

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
        <Wrapper {...wrapperProps}>{inner}</Wrapper>
      </TouchableOpacity>
    );
  }

  return <Wrapper {...wrapperProps}>{inner}</Wrapper>;
});

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, backgroundColor: colors.background.secondary },
  default: { backgroundColor: colors.background.secondary },
  elevated: { backgroundColor: colors.background.elevated, ...shadows.md },
  outlined: { backgroundColor: colors.background.primary, borderWidth: 1, borderColor: colors.border.primary },
  paddingNone: { padding: 0 },
  paddingSmall: { padding: spacing.sm },
  paddingMedium: { padding: spacing.md },
  paddingLarge: { padding: spacing.lg },
});
