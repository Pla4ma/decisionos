import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';

interface Insight {
  id: string;
  insight_type?: string;
  title: string;
  description: string;
  evidence_count?: number;
}

interface PatternInsightCardProps {
  insights: Insight[];
  onDismiss: (id: string) => void;
  onAction: () => void;
}

const insightConfig: Record<string, { icon: string; color: string }> = {
  strength: { icon: '⭐', color: colors.status.success },
  bias: { icon: '⚠️', color: colors.status.warning },
  pattern: { icon: '🔄', color: colors.status.info },
  suggestion: { icon: '💡', color: colors.accent.secondary },
};

export function PatternInsightCard({ insights, onDismiss, onAction }: PatternInsightCardProps): JSX.Element | null {
  if (insights.length === 0) return null;

  return (
    <Card variant="elevated" style={styles.card}>
      <Text style={styles.sectionLabel}>Pattern Insight</Text>
      {insights.slice(0, 2).map((insight) => {
        const config = insightConfig[insight.insight_type || 'pattern'] || insightConfig.pattern;
        return (
          <View key={insight.id} style={styles.insightRow}>
            <View style={[styles.iconCircle, { backgroundColor: config.color + '20' }]}>
              <Text style={styles.insightIcon}>{config.icon}</Text>
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDesc} numberOfLines={2}>{insight.description}</Text>
              {insight.evidence_count && insight.evidence_count > 0 && (
                <Text style={styles.evidence}>Seen in {insight.evidence_count} decision{insight.evidence_count > 1 ? 's' : ''}</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => onDismiss(insight.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.dismissIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        );
      })}
      <TouchableOpacity style={styles.actionBtn} onPress={onAction} activeOpacity={0.7}>
        <Text style={styles.actionText}>Create a decision with this in mind</Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, marginBottom: spacing.md },
  sectionLabel: { fontSize: typography.size.xs, fontWeight: '700', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  insightIcon: { fontSize: 16 },
  insightContent: { flex: 1 },
  insightTitle: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.primary },
  insightDesc: { fontSize: typography.size.xs, color: colors.text.secondary, lineHeight: 16, marginTop: 2 },
  evidence: { fontSize: 10, color: colors.text.tertiary, marginTop: 4, fontStyle: 'italic' },
  dismissIcon: { fontSize: 12, color: colors.text.disabled, padding: 4 },
  actionBtn: { borderTopWidth: 1, borderTopColor: colors.border.primary, paddingTop: spacing.md, alignItems: 'center' },
  actionText: { fontSize: typography.size.sm, color: colors.accent.primary, fontWeight: '500' },
});