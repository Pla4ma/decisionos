// RegretForecastCard — Shows AI's regret prediction with time horizon
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface RegretForecastData {
  regretLikelihood: number;
  why: string;
  whatWouldCauseRegret: string;
  timeHorizon: string;
}

interface RegretForecastCardProps {
  optionTitle: string;
  forecast: RegretForecastData;
}

function getRegretColor(likelihood: number): string {
  if (likelihood >= 70) return colors.accent.error;
  if (likelihood >= 40) return colors.accent.warning;
  return colors.accent.success;
}

function getRegretLabel(likelihood: number): string {
  if (likelihood >= 70) return 'May carry higher regret risk';
  if (likelihood >= 40) return 'Possible regret to consider';
  return 'Seems lower risk for regret';
}

function getTimeLabel(horizon: string): string {
  switch (horizon) {
    case 'short_term': return 'within weeks';
    case 'medium_term': return 'within months';
    case 'long_term': return 'in the long run';
    default: return horizon;
  }
}

export function RegretForecastCard({ optionTitle, forecast }: RegretForecastCardProps): JSX.Element {
  const color = getRegretColor(forecast.regretLikelihood);

  return (
    <Card variant="outlined" style={[styles.container, { borderColor: color + '40' }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>🔮</Text>
        <Text style={styles.title}>Regret Forecast</Text>
        <View style={[styles.scoreBadge, { backgroundColor: color + '20' }]}>
          <Text style={[styles.scoreText, { color }]}>{forecast.regretLikelihood}%</Text>
        </View>
      </View>

      <Text style={styles.optionRef}>For: {optionTitle}</Text>
      <Text style={styles.label}>{getRegretLabel(forecast.regretLikelihood)} — {getTimeLabel(forecast.timeHorizon)}</Text>
      <Text style={styles.body}>{forecast.why}</Text>

      {forecast.whatWouldCauseRegret && (
        <View style={styles.causeBox}>
          <Text style={styles.causeLabel}>What would cause regret:</Text>
          <Text style={styles.causeText}>{forecast.whatWouldCauseRegret}</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  icon: { fontSize: 18, marginRight: spacing.sm },
  title: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.text.primary, flex: 1 },
  scoreBadge: { borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  scoreText: { fontSize: 16, fontWeight: typography.weight.bold },
  optionRef: { fontSize: typography.size.sm, color: colors.text.tertiary, fontStyle: 'italic', marginBottom: spacing.xs },
  label: { fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.text.primary, marginBottom: spacing.sm },
  body: { fontSize: typography.size.sm, color: colors.text.secondary, lineHeight: 20, marginBottom: spacing.sm },
  causeBox: { backgroundColor: colors.background.secondary, borderRadius: 8, padding: spacing.sm, marginTop: spacing.xs },
  causeLabel: { fontSize: 11, fontWeight: typography.weight.semibold, color: colors.text.tertiary, marginBottom: 4 },
  causeText: { fontSize: typography.size.sm, color: colors.text.secondary, fontStyle: 'italic' },
});
