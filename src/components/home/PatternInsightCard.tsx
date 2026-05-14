import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PatternInsight } from '@/features/decisions/patternRecognitionTypes';

interface PatternInsightCardProps {
  insights: PatternInsight[];
  onDismiss: (id: string) => void;
  onAction: (insight: PatternInsight) => void;
}

export function PatternInsightCard({ insights, onDismiss, onAction }: PatternInsightCardProps) {
  if (insights.length === 0) return null;

  const top = insights[0];

  return (
    <Card variant="outlined" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>🧠</Text>
        <Text style={styles.title}>Your Patterns</Text>
        {insights.length > 1 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{insights.length}</Text>
          </View>
        )}
      </View>
      <View style={styles.insightBody}>
        <Badge
          title={top.insight_type.replace(/_/g, ' ')}
          variant={top.severity === 'significant' ? 'warning' : 'info'}
          size="small"
        />
        <Text style={styles.insightTitle}>{top.title}</Text>
        <Text style={styles.insightDesc}>{top.description}</Text>
        {top.is_actionable && top.suggested_action && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => onAction(top)}>
            <Text style={styles.actionText}>{top.suggested_action}</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.dismissBtn} onPress={() => onDismiss(top.id)}>
        <Text style={styles.dismissText}>Dismiss</Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md, borderColor: colors.border.accent },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  icon: { fontSize: 16 },
  title: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 },
  countBadge: { backgroundColor: colors.background.tertiary, borderRadius: 9999, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  countText: { fontSize: 11, fontWeight: '600', color: colors.text.secondary },
  insightBody: { gap: spacing.sm },
  insightTitle: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.primary },
  insightDesc: { fontSize: typography.size.sm, color: colors.text.secondary, lineHeight: 20 },
  actionBtn: { backgroundColor: colors.accent.primary + '15', borderRadius: 8, padding: spacing.md, marginTop: spacing.xs },
  actionText: { fontSize: typography.size.sm, color: colors.accent.primary, fontWeight: '500' },
  dismissBtn: { alignSelf: 'flex-end', marginTop: spacing.sm },
  dismissText: { fontSize: typography.size.xs, color: colors.text.tertiary },
});
