// HiddenAssumptionsCard — Displays unstated assumptions identified by AI
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';

interface HiddenAssumptionsCardProps {
  assumptions: string[];
}

export function HiddenAssumptionsCard({ assumptions }: HiddenAssumptionsCardProps): JSX.Element {
  if (!assumptions || assumptions.length === 0) return <></>;

  return (
    <Card variant="outlined" style={styles.card}>
      <Text style={styles.title}>Hidden Assumptions</Text>
      <Text style={styles.subtitle}>Things you might be taking for granted</Text>

      <View style={styles.list}>
        {assumptions.map((assumption, index) => (
          <View key={index} style={styles.item}>
            <View style={styles.bullet}>
              <Text style={styles.bulletText}>?</Text>
            </View>
            <Text style={styles.text}>{assumption}</Text>
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
  item: { flexDirection: 'row', marginBottom: spacing.sm },
  bullet: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.status.warning + '20', alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  bulletText: { fontSize: typography.size.sm, color: colors.status.warning, fontWeight: typography.weight.bold },
  text: { flex: 1, fontSize: typography.size.sm, color: colors.text.primary, lineHeight: 20 },
});
