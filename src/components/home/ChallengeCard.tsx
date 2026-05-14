// ChallengeCard — Daily micro-engagement puzzles
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { DecisionChallenge } from '@/features/engagement/challengeTypes';

interface ChallengeCardProps {
  challenge: DecisionChallenge;
  hasResponded: boolean;
  onSelectOption: (challengeId: string, optionId: string) => void;
  onViewExplanation?: () => void;
  selectedOptionId?: string;
}

const typeLabels: Record<string, string> = {
  quick_poll: 'Quick Poll',
  blind_spot_quiz: 'Blind Spot Quiz',
  what_would_you_do: 'What Would You Do?',
  tradeoff_puzzle: 'Tradeoff Puzzle',
  values_check: 'Values Check',
};

export function ChallengeCard({
  challenge,
  hasResponded,
  onSelectOption,
  onViewExplanation,
  selectedOptionId,
}: ChallengeCardProps): JSX.Element {
  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.header}>
        <Badge text={typeLabels[challenge.challenge_type] || challenge.challenge_type} variant="primary" />
        <Text style={styles.difficulty}>{challenge.difficulty}</Text>
      </View>
      <Text style={styles.title}>{challenge.title}</Text>
      <Text style={styles.scenario}>{challenge.scenario}</Text>
      <View style={styles.options}>
        {(challenge.options || []).map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isDisabled = hasResponded && !isSelected;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.option, isSelected && styles.optionSelected, isDisabled && styles.optionDisabled]}
              onPress={() => !hasResponded && onSelectOption(challenge.id, option.id)}
              disabled={hasResponded || isDisabled}
              activeOpacity={0.7}
            >
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.optionText, isDisabled && styles.optionTextDisabled]}>
                {option.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {hasResponded && onViewExplanation && (
        <TouchableOpacity style={styles.explanationLink} onPress={onViewExplanation}>
          <Text style={styles.explanationText}>View explanation</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  difficulty: { fontSize: typography.size.xs, color: colors.text.tertiary, textTransform: 'uppercase' },
  title: { fontSize: typography.size.lg, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.sm },
  scenario: { fontSize: typography.size.sm, color: colors.text.secondary, lineHeight: 20, marginBottom: spacing.md },
  options: { gap: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  optionSelected: { borderColor: colors.accent.primary, backgroundColor: colors.accent.primary + '10' },
  optionDisabled: { opacity: 0.5 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: colors.border.medium,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm,
  },
  radioSelected: { borderColor: colors.accent.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent.primary },
  optionText: { flex: 1, fontSize: typography.size.sm, color: colors.text.primary },
  optionTextDisabled: { color: colors.text.tertiary },
  explanationLink: { marginTop: spacing.md, alignItems: 'center' },
  explanationText: { fontSize: typography.size.sm, color: colors.accent.primary, fontWeight: '500' },
});
