// Decision Review — Outcome tracking and learning (Phase 12)
import { useCallback, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TextArea } from '@/components/ui/TextArea';
import { RadioButton } from '@/components/ui/RadioButton';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Slider } from '@/components/ui/Slider';
import {
  getDecision,
  getDecisionOptions,
  getDecisionReview,
  saveDecisionReview,
  updateDecisionStatus,
} from '@/features/decisions/decisionRepository';
import { useAuth } from '@/features/auth';

const SATISFACTION_OPTIONS = [
  { value: 1, label: 'Very dissatisfied' },
  { value: 2, label: 'Dissatisfied' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Satisfied' },
  { value: 5, label: 'Very satisfied' },
];

export default function ReviewScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  // Form state
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [satisfactionScore, setSatisfactionScore] = useState<number>(3);
  const [wouldChooseSame, setWouldChooseSame] = useState<boolean | null>(null);
  const [lessonsLearned, setLessonsLearned] = useState('');

  const { data: decision, isLoading: decisionLoading, error: decisionError } = useQuery({
    queryKey: ['decision', id],
    queryFn: () => getDecision(id),
    enabled: !!id,
  });

  const { data: options, isLoading: optionsLoading } = useQuery({
    queryKey: ['decision-options', id],
    queryFn: () => getDecisionOptions(id),
    enabled: !!id && !!decision,
  });

  const { data: existingReview, isLoading: reviewLoading } = useQuery({
    queryKey: ['decision-review', id],
    queryFn: () => getDecisionReview(id),
    enabled: !!id && !!decision,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const chosenOption = options?.find((o) => o.is_chosen);
      if (!chosenOption) {
        throw new Error('No option was chosen for this decision');
      }

      const reviewInput = {
        chosen_option_id: chosenOption.id,
        outcome_notes: outcomeNotes,
        satisfaction_score: satisfactionScore,
        would_choose_same: wouldChooseSame ?? undefined,
        lessons_learned: lessonsLearned || undefined,
      };

      await saveDecisionReview(id, reviewInput);
      await updateDecisionStatus(id, 'reviewed');
    },
    onSuccess: () => {
      Alert.alert('Review Saved', 'Thank you for reviewing your decision. This helps improve future recommendations.', [
        { text: 'Done', onPress: () => router.push(`/decisions/${id}`) },
      ]);
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleSave = useCallback(() => {
    if (!outcomeNotes.trim() || outcomeNotes.length < 10) {
      Alert.alert('Required', 'Please describe what happened with this decision (minimum 10 characters).');
      return;
    }
    if (wouldChooseSame === null) {
      Alert.alert('Required', 'Please indicate if you would choose the same option again.');
      return;
    }

    Alert.alert('Save Review', 'This will complete your decision review. You can view it anytime in your history.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Save', onPress: () => saveMutation.mutate() },
    ]);
  }, [outcomeNotes, wouldChooseSame, saveMutation]);

  if (decisionLoading || optionsLoading || reviewLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Link href={`/decisions/${id}`} asChild>
            <Button title="Back" variant="ghost" size="small" />
          </Link>
          <Text style={styles.headerTitle}>Review Decision</Text>
          <View style={styles.placeholder} />
        </View>
        <LoadingState message="Loading review..." />
      </View>
    );
  }

  if (decisionError || !decision) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Link href={`/decisions/${id}`} asChild>
            <Button title="Back" variant="ghost" size="small" />
          </Link>
          <Text style={styles.headerTitle}>Review Decision</Text>
          <View style={styles.placeholder} />
        </View>
        <ErrorState message="Decision not found" onRetry={() => router.back()} />
      </View>
    );
  }

  const chosenOption = options?.find((o) => o.is_chosen);

  if (existingReview) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Review Already Completed</Text>
          <Text style={styles.subtitle}>
            You reviewed this decision on {new Date(existingReview.created_at).toLocaleDateString()}
          </Text>
          <Button
            title="Back to Decision"
            variant="primary"
            onPress={() => router.push(`/decisions/${id}`)}
            style={styles.button}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Link href={`/decisions/${id}`} asChild>
          <Button title="Back" variant="ghost" size="small" />
        </Link>
        <Text style={styles.headerTitle}>Review Decision</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Review Your Decision</Text>
        <Text style={styles.subtitle}>
          Decision: {decision.title}
        </Text>
        
        {chosenOption && (
          <Text style={styles.chosenOption}>
            Chosen: {chosenOption.title}
          </Text>
        )}

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
            showLabels
            labels={['Very dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very satisfied']}
          />
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

        <Button
          title={saveMutation.isPending ? 'Saving...' : 'Save Review'}
          variant="primary"
          onPress={handleSave}
          disabled={saveMutation.isPending}
          style={styles.button}
        />

        <Link href={`/decisions/${id}`} asChild>
          <Button title="Back to Decision" variant="ghost" />
        </Link>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  chosenOption: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
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
  sameChoiceOptions: {
    gap: spacing.md,
  },
  button: {
    marginTop: spacing.lg,
  },
});
