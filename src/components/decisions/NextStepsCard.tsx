// NextStepsCard — Actionable next steps from analysis
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';

interface NextStepsCardProps {
  steps: string[];
}

export function NextStepsCard({ steps }: NextStepsCardProps): JSX.Element {
  if (!steps || steps.length === 0) return <></>;

  return (
    <Card variant="outlined" style={styles.card}>
      <Text style={styles.title}>Recommended Next Steps</Text>
      <Text style={styles.subtitle}>Concrete actions you can take now</Text>

      <View style={styles.list}>
        {steps.map((step, index) => (
          <View key={index} style={styles.item}>
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>
            <Text style={styles.text}>{step}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.lg },
  title: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.text.primary, marginBottom: spacing.xs },
  subtitle: { fontSize: typography.size.sm, color: colors.text.secondary, marginBottom: spacing.md },
  list: {},
  item: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  numberBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accent.primary, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm, marginTop: 2 },
  numberText: { fontSize: typography.size.sm, color: colors.background.primary, fontWeight: typography.weight.bold },
  text: { flex: 1, fontSize: typography.size.sm, color: colors.text.primary, lineHeight: 20 },
});
