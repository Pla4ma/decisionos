// DecisionInfo — Decision metadata and status
import { View, Text, StyleSheet } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Decision } from '@/features/decisions/decisionTypes';

interface DecisionInfoProps {
  decision: Decision;
  categoryLabel: string;
  statusConfig: { label: string; variant: 'default' | 'info' | 'warning' | 'success' };
}

export function DecisionInfo({ decision, categoryLabel, statusConfig }: DecisionInfoProps) {
  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <View style={styles.container}>
      <Badge label={categoryLabel} variant="default" size="small" />
      <Text style={styles.title}>{decision.title}</Text>
      <View style={styles.metaRow}>
        <Badge label={statusConfig.label} variant={statusConfig.variant} />
        <Text style={styles.dateText}>Created {formatDate(decision.created_at)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  title: { fontSize: typography.size.xl, fontWeight: typography.weight.bold, color: colors.text.primary, marginTop: spacing.sm, marginBottom: spacing.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dateText: { fontSize: typography.size.sm, color: colors.text.secondary },
});
