// src/components/decisions/DecisionDetail.tsx
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Text } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/ui/Badge';
import { Link } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Decision, DecisionOption, DecisionAnswer, DecisionAnalysis } from '@/features/decisions/decisionTypes';
import { HindsightComparison } from '@/features/decisions/hindsightTypes';
import { HindsightComparisonCard } from './HindsightComparisonCard';
import { ROUTES } from '@/config/routes';

interface DecisionDetailProps {
  decision: Decision;
  options: DecisionOption[];
  answers: DecisionAnswer[];
  analysis: DecisionAnalysis | null;
  id: string;
  hindsightComparison?: HindsightComparison | null;
}

export function DecisionDetail({ decision, options, answers, analysis, id, hindsightComparison }: DecisionDetailProps) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      {decision.context && (
        <Card style={styles.card}>
          <Text style={styles.label}>Context</Text>
          <Text style={styles.text}>{decision.context}</Text>
        </Card>
      )}

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Options ({options.length})</Text>
        {options.map((opt, index) => (
          <View key={opt.id} style={styles.item}>
            <Text style={styles.number}>{index + 1}.</Text>
            <View style={styles.content}>
              <Text style={styles.title}>{opt.title}</Text>
              {opt.is_chosen && <Badge label="Chosen" variant="success" size="small" />}
            </View>
          </View>
        ))}
      </Card>
      {analysis && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Latest Analysis</Text>
          <Text style={styles.summary} numberOfLines={3}>{analysis.summary}</Text>
          <Link href={ROUTES.DECISION_ANALYSIS(id)} asChild>
            <Button title="View Full Analysis" variant="secondary" size="small" />
          </Link>
        </Card>
      )}

      {/* Hindsight Feedback — "Path Not Taken" analysis for reviewed decisions */}
      {hindsightComparison && (
        <View style={styles.hindsightSection}>
          <Text style={styles.hindsightLabel}>HINDSIGHT ANALYSIS</Text>
          <HindsightComparisonCard comparison={hindsightComparison} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  card: { marginBottom: spacing.md },
  label: { fontSize: typography.size.sm, color: colors.text.secondary, marginBottom: spacing.xs },
  text: { fontSize: typography.size.md, color: colors.text.primary, lineHeight: 22 },
  sectionTitle: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.md },
  item: { flexDirection: 'row', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border.secondary },
  number: { width: 28, fontSize: typography.size.md, color: colors.text.tertiary },
  content: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: typography.size.md, color: colors.text.primary },
  summary: { fontSize: typography.size.md, color: colors.text.primary, lineHeight: 22, marginBottom: spacing.md },
  hindsightSection: { marginTop: spacing.lg },
  hindsightLabel: { fontSize: typography.size.xs, fontWeight: typography.weight.bold, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: spacing.md },
});
