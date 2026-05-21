import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface RegretForecastData {
  regretLikelihood?: number;
  regretRisk?: string;
  why: string;
  whatWouldCauseRegret: string;
  timeHorizon: string;
}

interface RegretForecastCardProps {
  optionTitle: string;
  forecast: RegretForecastData;
}

function getRegretLevel(forecast: RegretForecastData): { level: 'low' | 'medium' | 'high'; color: string; label: string; nuance: string } {
  if (forecast.regretRisk === 'high' || (forecast.regretLikelihood != null && forecast.regretLikelihood >= 70)) {
    return { level: 'high', color: colors.status.warning, label: 'Worth extra reflection', nuance: 'Consider what might change if you chose differently.' };
  }
  if (forecast.regretRisk === 'medium' || (forecast.regretLikelihood != null && forecast.regretLikelihood >= 40)) {
    return { level: 'medium', color: colors.accent.secondary, label: 'Something to keep in mind', nuance: 'Not a prediction — just a perspective to factor in.' };
  }
  return { level: 'low', color: colors.status.success, label: 'Alignment seems strong', nuance: 'This option appears to match what matters to you.' };
}

function getTimeLabel(horizon: string): string {
  switch (horizon) {
    case 'short_term': return 'over the next few weeks';
    case 'medium_term': return 'in the coming months';
    case 'long_term': return 'looking back years from now';
    default: return horizon;
  }
}

export function RegretForecastCard({ optionTitle, forecast }: RegretForecastCardProps): JSX.Element {
  const { color, label, nuance } = getRegretLevel(forecast);

  return (
    <Card variant="outlined" style={[styles.container, { borderColor: color + '30' }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>💭</Text>
        <Text style={styles.title}>Tradeoff Perspective</Text>
      </View>

      <Text style={styles.optionRef}>About: {optionTitle}</Text>
      <Text style={[styles.label, { color }]}>{label}</Text>
      <Text style={styles.body}>{forecast.why}</Text>

      <Text style={styles.timeContext}>
        This reflection focuses on {getTimeLabel(forecast.timeHorizon)}.
      </Text>

      {forecast.whatWouldCauseRegret && (
        <View style={styles.causeBox}>
          <Text style={styles.causeLabel}>What could change your view:</Text>
          <Text style={styles.causeText}>{forecast.whatWouldCauseRegret}</Text>
        </View>
      )}

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          This is a reflection aid, not a prediction. Use it to explore tradeoffs, not to forecast outcomes.
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  icon: { fontSize: 18, marginRight: spacing.sm },
  title: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.text.primary, flex: 1 },
  optionRef: { fontSize: typography.size.sm, color: colors.text.tertiary, fontStyle: 'italic', marginBottom: spacing.xs },
  label: { fontSize: typography.size.sm, fontWeight: typography.weight.medium, marginBottom: spacing.sm },
  body: { fontSize: typography.size.sm, color: colors.text.secondary, lineHeight: 20, marginBottom: spacing.sm },
  timeContext: { fontSize: typography.size.xs, color: colors.text.tertiary, fontStyle: 'italic', marginBottom: spacing.sm },
  causeBox: { backgroundColor: colors.background.secondary, borderRadius: 8, padding: spacing.sm, marginTop: spacing.xs, marginBottom: spacing.sm },
  causeLabel: { fontSize: 11, fontWeight: typography.weight.semibold, color: colors.text.tertiary, marginBottom: 4 },
  causeText: { fontSize: typography.size.sm, color: colors.text.secondary, fontStyle: 'italic' },
  disclaimer: { borderTopWidth: 1, borderTopColor: colors.border.primary, paddingTop: spacing.sm, marginTop: spacing.xs },
  disclaimerText: { fontSize: 10, color: colors.text.disabled, fontStyle: 'italic', lineHeight: 14 },
});
