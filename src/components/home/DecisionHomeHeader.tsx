// DecisionHomeHeader — Clean, powerful header with real metrics
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface DecisionHomeHeaderProps {
  userName?: string | null;
  regretRate?: number | null;
  reviewCount?: number;
  avgSatisfaction?: number | null;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function DecisionHomeHeader({
  userName,
  regretRate,
  reviewCount = 0,
  avgSatisfaction,
}: DecisionHomeHeaderProps): JSX.Element {
  const greeting = getGreeting();
  const displayName = userName ? `, ${userName}` : '';

  const statLine = [
    reviewCount > 0 ? `${reviewCount} reviews` : null,
    regretRate != null ? `${Math.round(regretRate)}% regret rate` : null,
    avgSatisfaction != null ? `${avgSatisfaction.toFixed(1)}/5 avg` : null,
  ].filter(Boolean).join(' · ');

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{greeting}{displayName}</Text>
      {reviewCount > 0 ? (
        <Text style={styles.stats}>{statLine}</Text>
      ) : (
        <Text style={styles.subtitle}>
          Every decision becomes clearer with structure. Your first review unlocks personal insights.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  greeting: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.tight * typography.size.xxl,
  },
  stats: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
});
