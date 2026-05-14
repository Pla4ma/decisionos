// DecisionScoreCard — Full option scoring with all dimensions
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { DecisionScoreRow } from './DecisionScoreRow';
import { DecisionScoreName } from '@/features/decisions/decisionTypes';

interface OptionScore {
  optionId: string;
  optionTitle: string;
  overallScore: number;
  scores: {
    regretRisk: number;
    confidence: number;
    valuesAlignment: number;
    reversibility: number;
    risk: number;
  };
  reasoning: string;
}

interface DecisionScoreCardProps {
  score: OptionScore;
  rank: number; // 1st, 2nd, 3rd...
}

export function DecisionScoreCard({ score, rank }: DecisionScoreCardProps): JSX.Element {
  const getRankColor = (r: number): string => {
    if (r === 1) return colors.status.success;
    if (r === 2) return colors.status.warning;
    return colors.text.tertiary;
  };

  return (
    <Card variant="outlined" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.rankContainer}>
          <Text style={[styles.rank, { color: getRankColor(rank) }]}>#{rank}</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{score.optionTitle}</Text>
          <View style={styles.overallContainer}>
            <Text style={styles.overallLabel}>Overall</Text>
            <Text style={[styles.overallScore, { color: getRankColor(rank) }]}>{score.overallScore}</Text>
          </View>
        </View>
      </View>

      <View style={styles.scoresContainer}>
        <DecisionScoreRow
          label="Confidence"
          score={score.scores.confidence}
          description="How certain are the outcomes?"
          scoreName="confidence"
        />
        <DecisionScoreRow
          label="Values Alignment"
          score={score.scores.valuesAlignment}
          description="Does this match what matters to you?"
          scoreName="values_alignment"
        />
        <DecisionScoreRow
          label="Reversibility"
          score={score.scores.reversibility}
          description="How easy to undo if wrong?"
          scoreName="reversibility"
        />
        <DecisionScoreRow
          label="Risk Level"
          score={score.scores.risk}
          description="What's the worst realistic case?"
          inverted
          scoreName="risk"
        />
        <DecisionScoreRow
          label="Regret Risk"
          score={score.scores.regretRisk}
          description="How likely you'll regret this?"
          inverted
          scoreName="regret_risk"
        />
      </View>

      <View style={styles.reasoningContainer}>
        <Text style={styles.reasoningLabel}>Why</Text>
        <Text style={styles.reasoning}>{score.reasoning}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  header: { flexDirection: 'row', marginBottom: spacing.md },
  rankContainer: { marginRight: spacing.md, justifyContent: 'center' },
  rank: { fontSize: typography.size.xxl, fontWeight: typography.weight.bold },
  titleContainer: { flex: 1 },
  title: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.text.primary, marginBottom: spacing.xs },
  overallContainer: { flexDirection: 'row', alignItems: 'center' },
  overallLabel: { fontSize: typography.size.xs, color: colors.text.secondary, marginRight: spacing.xs },
  overallScore: { fontSize: typography.size.lg, fontWeight: typography.weight.bold },
  scoresContainer: { marginBottom: spacing.md },
  reasoningContainer: { backgroundColor: colors.background.secondary, padding: spacing.md, borderRadius: 8 },
  reasoningLabel: { fontSize: typography.size.xs, color: colors.text.secondary, marginBottom: spacing.xs, textTransform: 'uppercase' },
  reasoning: { fontSize: typography.size.sm, color: colors.text.primary, lineHeight: 20 },
});
