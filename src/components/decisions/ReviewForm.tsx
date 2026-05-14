// Review Form Component - Extracted from review.tsx to meet 200-line limit
import { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TextArea } from '@/components/ui/TextArea';
import { RadioButton } from '@/components/ui/RadioButton';
import { Slider } from '@/components/ui/Slider';
import { z } from 'zod';
import { decisionReviewSchema } from '@/features/decisions/decisionSchemas';

const REGRET_OPTIONS = [
  { value: 1, label: 'No regret', description: 'Would make the same choice again' },
  { value: 2, label: 'Minor regret', description: 'Small things could be better' },
  { value: 3, label: 'Some regret', description: 'Mixed feelings about the outcome' },
  { value: 4, label: 'Significant regret', description: 'Wish I chose differently' },
  { value: 5, label: 'Strong regret', description: 'Clear mistake in hindsight' },
];

const SATISFACTION_OPTIONS = [
  { value: 1, label: 'Very dissatisfied' },
  { value: 2, label: 'Dissatisfied' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Satisfied' },
  { value: 5, label: 'Very satisfied' },
];

interface ReviewFormProps {
  initialData?: Partial<z.infer<typeof decisionReviewSchema>>;
  onSubmit: (data: z.infer<typeof decisionReviewSchema>) => void;
  isSubmitting?: boolean;
}

export function ReviewForm({ initialData, onSubmit, isSubmitting }: ReviewFormProps) {
  const [outcomeNotes, setOutcomeNotes] = useState(initialData?.outcome_notes || '');
  const [satisfactionScore, setSatisfactionScore] = useState(initialData?.satisfaction_score || 3);
  const [regretLevel, setRegretLevel] = useState(3);
  const [wouldChooseSame, setWouldChooseSame] = useState<boolean | null>(null);
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [allowMemory, setAllowMemory] = useState(true);

  const handleSubmit = () => {
    if (!outcomeNotes.trim() || outcomeNotes.length < 10) {
      return; // Validation will be handled by parent
    }

    onSubmit({
      chosen_option_id: '', // This will be provided by parent
      outcome_notes: outcomeNotes.trim(),
      satisfaction_score: satisfactionScore,
      would_choose_same: wouldChooseSame ?? undefined,
      lessons_learned: lessonsLearned.trim() || undefined,
    });
  };

  return (
    <View style={styles.form}>
      <Card variant="default">
        <Text style={styles.sectionTitle}>What Actually Happened?</Text>
        <TextArea
          value={outcomeNotes}
          onChangeText={setOutcomeNotes}
          placeholder="Describe the outcome of your decision..."
          numberOfLines={4}
          maxLength={2000}
        />
        <Text style={styles.helperText}>Minimum 10 characters</Text>
      </Card>

      <Card variant="default">
        <Text style={styles.sectionTitle}>How Satisfied Are You?</Text>
        <Slider
          value={satisfactionScore}
          onValueChange={setSatisfactionScore}
          minimumValue={1}
          maximumValue={5}
          step={1}
          labels={[SATISFACTION_OPTIONS[0].label, SATISFACTION_OPTIONS[SATISFACTION_OPTIONS.length - 1].label]}
        />
      </Card>

      <Card variant="default">
        <Text style={styles.sectionTitle}>Regret Level</Text>
        <View style={styles.regretOptions}>
          {REGRET_OPTIONS.map((option) => (
            <RadioButton
              key={option.value}
              selected={regretLevel === option.value}
              onPress={() => setRegretLevel(option.value)}
              label={option.label}
              description={option.description}
            />
          ))}
        </View>
      </Card>

      <Card variant="default">
        <Text style={styles.sectionTitle}>Would You Choose the Same Option Again?</Text>
        <View style={styles.sameChoiceOptions}>
          <RadioButton
            selected={wouldChooseSame === true}
            onPress={() => setWouldChooseSame(true)}
            label="Yes"
            description="I would make the same choice"
          />
          <RadioButton
            selected={wouldChooseSame === false}
            onPress={() => setWouldChooseSame(false)}
            label="No"
            description="I would choose differently"
          />
        </View>
      </Card>

      <Card variant="default">
        <Text style={styles.sectionTitle}>Lessons Learned</Text>
        <TextArea
          value={lessonsLearned}
          onChangeText={setLessonsLearned}
          placeholder="What did you learn from this decision? (Optional)"
          numberOfLines={3}
          maxLength={1000}
        />
      </Card>

      <Card variant="default">
        <View style={styles.memorySection}>
          <Text style={styles.sectionTitle}>Decision Memory</Text>
          <Text style={styles.memoryDescription}>
            Allow DecisionOS to learn from your patterns to provide better insights
          </Text>
          <RadioButton
            selected={allowMemory}
            onPress={() => setAllowMemory(true)}
            label="Yes, use for insights"
            description="Use anonymous patterns to improve future analysis"
          />
          <RadioButton
            selected={!allowMemory}
            onPress={() => setAllowMemory(false)}
            label="Not now"
            description="Keep my decisions completely private"
          />
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  helperText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  regretOptions: {
    gap: spacing.md,
  },
  sameChoiceOptions: {
    gap: spacing.md,
  },
  memorySection: {
    gap: spacing.md,
  },
  memoryDescription: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
});
