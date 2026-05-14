// ReviewLoopHighlight — Component highlighting the importance of the review loop
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';

interface ReviewLoopHighlightProps {
  variant?: 'card' | 'banner' | 'tip';
  showAction?: boolean;
  onLearnMore?: () => void;
}

export function ReviewLoopHighlight({ 
  variant = 'card', 
  showAction = false, 
  onLearnMore 
}: ReviewLoopHighlightProps): JSX.Element {
  const content = (
    <View style={variant === 'banner' ? styles.bannerContent : styles.content}>
      <View style={styles.header}>
        <Text style={styles.icon}>🔄</Text>
        <Text style={styles.title}>The Review Loop</Text>
      </View>
      
      <Text style={styles.description}>
        DecisionOS gets better when you review what actually happened. 
        Your reviews help you learn patterns and improve future decisions.
      </Text>

      <View style={styles.benefitsContainer}>
        <Text style={styles.benefit}>• Learn your decision patterns over time</Text>
        <Text style={styles.benefit}>• Identify what matters most to you</Text>
        <Text style={styles.benefit}>• Build confidence in your choices</Text>
      </View>

      {showAction && onLearnMore && (
        <Text style={styles.actionText} onPress={onLearnMore}>
          Learn more about reviewing →
        </Text>
      )}
    </View>
  );

  if (variant === 'banner') {
    return (
      <View style={styles.banner}>
        {content}
      </View>
    );
  }

  return (
    <Card variant="outlined" style={styles.card}>
      {content}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.accent.muted,
    marginBottom: spacing.md,
  },
  banner: {
    backgroundColor: colors.accent.muted,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  content: {
    gap: spacing.sm,
  },
  bannerContent: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  icon: {
    fontSize: typography.size.lg,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  benefitsContainer: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  benefit: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  actionText: {
    fontSize: typography.size.sm,
    color: colors.accent.primary,
    fontWeight: typography.weight.medium,
    marginTop: spacing.sm,
  },
});
