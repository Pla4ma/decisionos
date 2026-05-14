// BlindSpotContextCard — Shows blind spot warnings during analysis
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { UserBlindSpot } from '@/features/decisions/deepDecisionTypes';

interface BlindSpotContextCardProps {
  blindSpots: UserBlindSpot[];
}

export function BlindSpotContextCard({ blindSpots }: BlindSpotContextCardProps): JSX.Element | null {
  if (!blindSpots || blindSpots.length === 0) return null;

  const significantSpots = blindSpots.filter(b => b.severity === 'significant' || b.severity === 'moderate');

  if (significantSpots.length === 0) return null;

  return (
    <Card variant="outlined" style={styles.container}>
      <Text style={styles.header}>⚠️ Your Blind Spots (active during analysis)</Text>
      <Text style={styles.subtitle}>The AI was aware of these patterns when analyzing your options:</Text>
      {significantSpots.map((spot, i) => (
        <View key={spot.id || i} style={styles.spot}>
          <Text style={styles.spotTitle}>{spot.title}</Text>
          <Text style={styles.spotDesc}>{spot.description}</Text>
        </View>
      ))}
      <Text style={styles.footer}>Keep these in mind as you review the scores. Your blind spots may be influencing how certain options appear.</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    backgroundColor: colors.accent.warning + '05',
    borderColor: colors.accent.warning + '30',
  },
  header: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.text.primary, marginBottom: spacing.xs },
  subtitle: { fontSize: typography.size.xs, color: colors.text.tertiary, marginBottom: spacing.md },
  spot: { marginBottom: spacing.sm, paddingLeft: spacing.sm, borderLeftWidth: 2, borderLeftColor: colors.accent.warning },
  spotTitle: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.text.primary },
  spotDesc: { fontSize: typography.size.xs, color: colors.text.secondary, marginTop: 2 },
  footer: { fontSize: 11, color: colors.text.tertiary, fontStyle: 'italic', marginTop: spacing.sm },
});
