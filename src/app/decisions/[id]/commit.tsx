// FLOW: /decisions/[id]/commit — Choose Option + Prediction Calibration
// FROM: /decisions/[id]/analysis (tap "Choose Top Option")
//       /decisions/[id] (tap "Make Your Choice")
// TO: /decisions/[id]/schedule (after confirming)
// STATE: decision.status → "chosen"
//        PredictionCalibration saved → feeds DQ score
//        48h later → QuickReviewPrompt fires on home screen
// See FLOW_ARCHITECTURE.md §2 — Decision Status State Machine
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
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { RadioButton } from '@/components/ui/RadioButton';
import { getDecision, getDecisionOptions, chooseDecisionOption, updateDecisionStatus } from '@/features/decisions/decisionRepository';
import { useAuth } from '@/features/auth';
import { useBlindSpots } from '@/features/decisions/useBlindSpots';
import { recordVelocityDirect } from '@/features/decisions/useDecisionVelocity';
import { getImportanceEffects } from '@/features/decisions/importanceMechanics';
import { PredictionCard } from '@/components/decisions/PredictionCard';
import { savePredictionCalibration, logDecisionVelocity } from '@/features/dq/dqService';

export default function CommitScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, optionId } = useLocalSearchParams<{ id: string; optionId?: string }>();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(optionId || null);
  const [predictedSatisfaction, setPredictedSatisfaction] = useState(3);
  const [predictedConfidence, setPredictedConfidence] = useState(70);
  const { user } = useAuth();
  const { blindSpots } = useBlindSpots(user?.id ?? null);

  const significantSpots = (blindSpots || []).filter(b => b.severity === 'significant' || b.severity === 'moderate');
  const importanceEffects = decision ? getImportanceEffects(decision.importance, decision.urgency) : null;

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

  const chooseMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOptionId) throw new Error('No option selected');
      await chooseDecisionOption(id, selectedOptionId);
      await updateDecisionStatus(id, 'chosen');
    },
    onSuccess: () => {
      if (user?.id && decision) {
        const createdDate = new Date(decision.created_at);
        const now = new Date();
        const hours = Math.round((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60));
        recordVelocityDirect(user.id, id, hours, null).catch(() => {});

        // Save Prediction Calibration + Velocity Log (DQ inputs)
        savePredictionCalibration(user.id, id, predictedSatisfaction, predictedConfidence).catch(() => {});
        logDecisionVelocity(user.id, id, hours, decision.importance).catch(() => {});
      }
      router.push(`/decisions/${id}/schedule`);
    },
    onError: (error) => {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to choose option');
    },
  });

  const handleConfirm = useCallback(() => {
    if (!selectedOptionId) {
      Alert.alert('Select an Option', 'Please choose which option you want to commit to.');
      return;
    }
    Alert.alert(
      'Confirm Your Choice',
      'After committing, you can do a quick check-in in 2 days to see how you feel.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => chooseMutation.mutate() },
      ]
    );
  }, [selectedOptionId, chooseMutation]);

  if (decisionLoading || optionsLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Link href={`/decisions/${id}`} asChild>
            <Button title="Back" variant="ghost" size="small" />
          </Link>
          <Text style={styles.headerTitle}>Choose Option</Text>
          <View style={styles.placeholder} />
        </View>
        <LoadingState message="Loading decision..." />
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
          <Text style={styles.headerTitle}>Choose Option</Text>
          <View style={styles.placeholder} />
        </View>
        <ErrorState message="Decision not found" onRetry={() => router.back()} />
      </View>
    );
  }

  const selectedOption = options?.find((o) => o.id === selectedOptionId);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Link href={`/decisions/${id}`} asChild>
          <Button title="Back" variant="ghost" size="small" />
        </Link>
        <Text style={styles.headerTitle}>Choose Option</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.decisionTitle}>{decision.title}</Text>
        <Text style={styles.subtitle}>Which option are you committing to?</Text>

        <Card variant="outlined" style={styles.optionsCard}>
          <Text style={styles.optionsLabel}>Available Options</Text>
          {options?.map((option) => (
            <RadioButton
              key={option.id}
              label={option.title}
              selected={selectedOptionId === option.id}
              onPress={() => setSelectedOptionId(option.id)}
              description={option.description || undefined}
            />
          ))}
        </Card>

        {selectedOption && (
          <Card variant="elevated" style={styles.confirmCard}>
            <Text style={styles.confirmLabel}>You are choosing:</Text>
            <Text style={styles.confirmOptionTitle}>{selectedOption.title}</Text>
            {selectedOption.description && (
              <Text style={styles.confirmDescription}>{selectedOption.description}</Text>
            )}
            <Badge title="Ready to commit" variant="success" size="small" style={styles.readyBadge} />
          </Card>
        )}

        {/* Pre-Decision Checklist — powered by blind spots */}
        {(significantSpots.length > 0 || importanceEffects?.suggestsSleepOnIt) && (
          <Card variant="outlined" style={styles.checklistCard}>
            <Text style={styles.checklistTitle}>Before you commit...</Text>

            {importanceEffects?.suggestsSleepOnIt && (
              <View style={styles.checkItem}>
                <Text style={styles.checkIcon}>🛏️</Text>
                <Text style={styles.checkText}>This is a high-importance, low-urgency decision. Consider saving and sleeping on it.</Text>
              </View>
            )}

            {significantSpots.map(spot => (
              <View key={spot.id} style={styles.checkItem}>
                <Text style={styles.checkIcon}>⚠️</Text>
                <View style={styles.checkContent}>
                  <Text style={styles.checkLabel}>{spot.title}</Text>
                  <Text style={styles.checkDesc}>
                    {spot.blind_spot_type === 'impulsivity' ? 'Are you rushing this? Take 5 minutes to sit with your choice.' :
                     spot.blind_spot_type === 'overoptimism' ? 'Are you being realistic about outcomes? Consider the worst case.' :
                     spot.blind_spot_type === 'urgency_bias' ? 'Is urgency pushing you toward a choice you might regret?' :
                     spot.blind_spot_type === 'analysis_paralysis' ? 'You have enough information. Trust yourself.' :
                     spot.blind_spot_type === 'status_quo_bias' ? 'Are you choosing the safe option out of habit rather than merit?' :
                     spot.description}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Prediction Calibration — The gambling loop: predict your outcome */}
        {selectedOption && (
          <PredictionCard
            onPredictionChange={(sat, conf) => {
              setPredictedSatisfaction(sat);
              setPredictedConfidence(conf);
            }}
          />
        )}

        <View style={styles.actions}>
          <Button
            title={chooseMutation.isPending ? 'Saving...' : 'Confirm Choice'}
            variant="primary"
            onPress={handleConfirm}
            disabled={!selectedOptionId || chooseMutation.isPending}
          />
          <Link href={`/decisions/${id}`} asChild>
            <Button title="Cancel" variant="ghost" />
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.primary },
  headerTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.semibold, color: colors.text.primary },
  placeholder: { width: 60 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  decisionTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.semibold, color: colors.text.primary, marginBottom: spacing.sm },
  subtitle: { fontSize: typography.size.md, color: colors.text.secondary, marginBottom: spacing.lg },
  optionsCard: { marginBottom: spacing.lg },
  optionsLabel: { fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.text.secondary, marginBottom: spacing.md },
  confirmCard: { marginBottom: spacing.lg, backgroundColor: colors.status.success + '15' },
  confirmLabel: { fontSize: typography.size.sm, color: colors.text.secondary, marginBottom: spacing.xs },
  confirmOptionTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.text.primary, marginBottom: spacing.sm },
  confirmDescription: { fontSize: typography.size.sm, color: colors.text.secondary, marginBottom: spacing.md, lineHeight: 20 },
  readyBadge: { alignSelf: 'flex-start' },
  checklistCard: { marginBottom: spacing.lg, borderColor: colors.status.warning + '40', backgroundColor: colors.status.warning + '05' },
  checklistTitle: { fontSize: 14, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.md },
  checkItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md },
  checkIcon: { fontSize: 16, marginTop: 2 },
  checkContent: { flex: 1 },
  checkText: { fontSize: 13, color: colors.text.secondary, lineHeight: 19 },
  checkLabel: { fontSize: 13, fontWeight: '600', color: colors.text.primary },
  checkDesc: { fontSize: 12, color: colors.text.secondary, lineHeight: 18, marginTop: 2 },
  actions: { gap: spacing.md, marginTop: spacing.lg },
});
