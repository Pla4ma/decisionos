// RecommendationCard — Most aligned option based on user's inputs
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RegretRiskBadge } from './RegretRiskBadge';

interface RecommendationCardProps {
  optionTitle: string;
  overallScore: number;
  regretRisk: number;
  reasoning: string;
  onChoose: () => void;
}

export function RecommendationCard({ optionTitle, overallScore, regretRisk, reasoning, onChoose }: RecommendationCardProps): JSX.Element {
  return (
    <Card variant="elevated" style={styles.card}>
      <Text style={styles.recommendationLabel}>Most Aligned Option</Text>

      <View style={styles.header}>
        <Text style={styles.optionTitle}>{optionTitle}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Reflection Score</Text>
          <Text style={styles.scoreValue}>{overallScore}</Text>
        </View>
      </View>

      <View style={styles.badgeContainer}>
        <RegretRiskBadge score={regretRisk} />
      </View>

      <Text style={styles.reasoning}>{reasoning}</Text>

      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimer}>All scores are structured reflection aids, not predictions or guarantees. The highest-scoring option is not necessarily the right choice for you.</Text>
      </View>

      <Button title="Consider This Option" variant="primary" onPress={onChoose} style={styles.chooseButton} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.lg },
  recommendationLabel: { fontSize: typography.size.xs, color: colors.accent.primary, fontWeight: typography.weight.semibold, textTransform: 'uppercase', marginBottom: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  optionTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.text.primary, flex: 1, marginRight: spacing.md },
  scoreContainer: { alignItems: 'center' },
  scoreLabel: { fontSize: typography.size.xs, color: colors.text.secondary, marginBottom: spacing.xs },
  scoreValue: { fontSize: typography.size.xxl, fontWeight: typography.weight.bold, color: colors.status.success },
  badgeContainer: { marginBottom: spacing.md },
  reasoning: { fontSize: typography.size.md, color: colors.text.primary, lineHeight: 22, marginBottom: spacing.md },
  disclaimerContainer: { backgroundColor: colors.background.secondary, padding: spacing.md, borderRadius: 8, marginBottom: spacing.md },
  disclaimer: { fontSize: typography.size.sm, color: colors.text.secondary, fontStyle: 'italic', textAlign: 'center' },
  chooseButton: { marginTop: spacing.sm },
});
