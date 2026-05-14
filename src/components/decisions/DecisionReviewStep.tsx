// DecisionReviewStep — Step 4: Review and save
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DraftDecision } from '@/stores/decisionDraftStore';

interface DecisionReviewStepProps {
  draft: DraftDecision;
  onSave: () => void;
  onBack: () => void;
  canSave: boolean;
}

export function DecisionReviewStep({
  draft,
  onSave,
  onBack,
  canSave,
}: DecisionReviewStepProps): JSX.Element {
  const answeredCount = Object.values(draft.answers).filter(
    (a: string) => a.trim().length > 0
  ).length;

  return (
    <View style={styles.container}>
      <Card variant="elevated" style={styles.reviewCard}>
        <Text style={styles.reviewTitle}>{draft.title}</Text>
        <Text style={styles.reviewCategory}>
          {draft.category?.replace('_', ' ')}
        </Text>

        <View style={styles.reviewStats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{draft.options.length}</Text>
            <Text style={styles.statLabel}>Options</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{answeredCount}</Text>
            <Text style={styles.statLabel}>Questions answered</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{draft.importance}/10</Text>
            <Text style={styles.statLabel}>Importance</Text>
          </View>
        </View>
      </Card>

      <Text style={styles.reviewHint}>
        Your decision will be saved and ready for AI analysis.
      </Text>

      <View style={styles.navigation}>
        <Button title="Back" variant="ghost" onPress={onBack} />
        <Button
          title="Save Decision"
          variant="primary"
          onPress={onSave}
          disabled={!canSave}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  reviewCard: {
    padding: 16,
    gap: 12,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  reviewCategory: {
    fontSize: 14,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  reviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  reviewHint: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});
