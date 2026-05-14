// Blind Spot Alert Card — Shows detected decision biases
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { UserBlindSpot } from '@/features/decisions/deepDecisionTypes';

interface BlindSpotAlertCardProps {
  blindSpot: UserBlindSpot;
}

export function BlindSpotAlertCard({ blindSpot }: BlindSpotAlertCardProps): JSX.Element {
  const severityColor = blindSpot.severity === 'significant'
    ? colors.accent.error
    : blindSpot.severity === 'moderate'
    ? colors.accent.warning
    : colors.text.secondary;

  return (
    <Card variant="outlined" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>🔍</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{blindSpot.title}</Text>
          <Text style={[styles.severity, { color: severityColor }]}>
            {blindSpot.severity.toUpperCase()}
          </Text>
        </View>
        {blindSpot.evidence_count > 1 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{blindSpot.evidence_count}</Text>
          </View>
        )}
      </View>
      <Text style={styles.description}>{blindSpot.description}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    borderColor: colors.accent.warning + '40',
    backgroundColor: colors.accent.warning + '05',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: { fontSize: 18, marginRight: spacing.sm },
  headerText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  severity: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    letterSpacing: 1,
  },
  countBadge: {
    backgroundColor: colors.accent.warning + '20',
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 12,
    fontWeight: typography.weight.semibold,
    color: colors.accent.warning,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
