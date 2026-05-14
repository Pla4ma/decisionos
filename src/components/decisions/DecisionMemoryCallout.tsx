// DecisionMemoryCallout — Shows personalized insights from past reviewed decisions
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';

interface DecisionMemoryCalloutProps {
  visible: boolean;
  insights: string[];
  category?: string;
}

export function DecisionMemoryCallout({ visible, insights, category }: DecisionMemoryCalloutProps): JSX.Element {
  if (!visible || insights.length === 0) {
    return <></>;
  }

  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>🧠</Text>
        <Text style={styles.title}>Based on your past reviewed decisions...</Text>
      </View>
      
      <View style={styles.insightsContainer}>
        {insights.map((insight, index) => (
          <Text key={index} style={styles.insight}>
            • {insight}
          </Text>
        ))}
      </View>

      {category && (
        <Text style={styles.categoryNote}>
          Insights from similar {category} decisions
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.accent.muted,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: typography.size.lg,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  insightsContainer: {
    gap: spacing.xs,
  },
  insight: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  categoryNote: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.secondary,
  },
});
