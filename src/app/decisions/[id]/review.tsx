import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { ReviewForm } from '@/components/decisions/ReviewForm';
import { useDecisionReview } from '@/features/decisions/useDecisionReview';
import { ROUTES } from '@/config/routes';

export default function ReviewScreen(): JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    decision, options, existingReview, chosenOption,
    isLoading, isSubmitting, canReview, handleSubmitReview,
  } = useDecisionReview(id);

  if (isLoading) {
    return <LoadingState message="Loading decision..." />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="← Back" variant="ghost" size="small" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Review</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" style={styles.introCard}>
          <Text style={styles.introIcon}>📋</Text>
          <Text style={styles.introTitle}>How did it go?</Text>
          <Text style={styles.introText}>
            Closing the loop on your decision. Every review makes your next decision better.
          </Text>
        </Card>

        {decision && (
          <Card variant="default" style={styles.decisionInfo}>
            <Text style={styles.decisionTitle}>{decision.title}</Text>
            {chosenOption && (
              <View style={styles.chosenBadge}>
                <Text style={styles.chosenLabel}>You chose: </Text>
                <Text style={styles.chosenValue}>{chosenOption.title}</Text>
              </View>
            )}
          </Card>
        )}

        {existingReview ? (
          <Card variant="elevated" style={styles.alreadyReviewed}>
            <Text style={styles.alreadyReviewedTitle}>Already Reviewed</Text>
            <Text style={styles.alreadyReviewedText}>
              This decision has already been reviewed.{'\n'}
              You can view it in your decision history.
            </Text>
            <Button
              title="Back to Decision"
              variant="primary"
              onPress={() => router.push(ROUTES.DECISION_DETAIL(id))}
            />
          </Card>
        ) : chosenOption ? (
          <ReviewForm
            initialData={{
              outcome_notes: '',
              satisfaction_score: undefined,
              would_choose_same: undefined,
              lessons_learned: '',
            }}
            onSubmit={(data) => {
              handleSubmitReview({
                ...data,
                chosen_option_id: chosenOption.id,
              });
            }}
            isSubmitting={isSubmitting}
          />
        ) : (
          <Card variant="outlined" style={styles.noChoiceCard}>
            <Text style={styles.noChoiceText}>
              No option has been chosen yet. Please commit to an option before reviewing.
            </Text>
            <Button
              title="Go to Commit"
              variant="primary"
              onPress={() => router.push(ROUTES.DECISION_COMMIT(id))}
            />
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  headerSpacer: { minWidth: 60 },
  headerTitle: { fontSize: typography.size.lg, fontWeight: '700', color: colors.text.primary },
  scrollContent: { padding: spacing.md, paddingBottom: 120, gap: spacing.md },
  introCard: { padding: spacing.lg, alignItems: 'center' },
  introIcon: { fontSize: 40, marginBottom: spacing.md },
  introTitle: { fontSize: typography.size.xl, fontWeight: '700', color: colors.text.primary, marginBottom: spacing.sm },
  introText: { fontSize: typography.size.sm, color: colors.text.secondary, textAlign: 'center', lineHeight: 20 },
  decisionInfo: { padding: spacing.md },
  decisionTitle: { fontSize: typography.size.lg, fontWeight: '700', color: colors.text.primary, marginBottom: spacing.sm },
  chosenBadge: { flexDirection: 'row', alignItems: 'center' },
  chosenLabel: { fontSize: typography.size.sm, color: colors.text.secondary },
  chosenValue: { fontSize: typography.size.sm, fontWeight: '600', color: colors.accent.primary },
  alreadyReviewed: { padding: spacing.lg, alignItems: 'center', gap: spacing.md },
  alreadyReviewedTitle: { fontSize: typography.size.lg, fontWeight: '700', color: colors.text.primary },
  alreadyReviewedText: { fontSize: typography.size.sm, color: colors.text.secondary, textAlign: 'center', lineHeight: 20 },
  noChoiceCard: { padding: spacing.lg, alignItems: 'center', gap: spacing.md },
  noChoiceText: { fontSize: typography.size.sm, color: colors.text.secondary, textAlign: 'center', lineHeight: 20 },
});
