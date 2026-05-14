// FLOW: /decisions/[id]/review — Full Outcome Review
// FROM: /decisions/[id] — tap "Review"
//       Home screen — review_due recommendation card
//       Notification — "Review due" push
// TO: /decisions/[id] — after saving
// TRIGGERS: streak update, prediction calibration, hindsight generation,
//           blind spot re-detection, playbook regeneration, earned analysis
// See FLOW_ARCHITECTURE.md §2 — Decision Status State Machine
// Also: Quick Review (emoji-based, 48h) handled by QuickReviewPrompt on home screen
import { useCallback, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, Alert, Pressable, ActivityIndicator } from 'react-native';
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
import {
  getDecision,
  getDecisionOptions,
  getDecisionReview,
  saveDecisionReview,
  updateDecisionStatus,
  getDecisionAnalysis,
} from '@/features/decisions/decisionRepository';
import { useAuth } from '@/features/auth';
import { recordVelocityDirect } from '@/features/decisions/useDecisionVelocity';
import { supabase } from '@/lib/supabase';
import type { DecisionForecast, RegretForecastItem } from '@/features/decisions/deepDecisionTypes';
import { generateHindsightComparison, saveHindsightReport } from '@/features/decisions/hindsightService';
import { resolvePredictionCalibration } from '@/features/dq/dqService';

export default function ReviewScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [satisfactionScore, setSatisfactionScore] = useState<number>(3);
  const [wouldChooseSame, setWouldChooseSame] = useState<boolean | null>(null);
  const [lessonsLearned, setLessonsLearned] = useState('');

  const { data: decision, isLoading: decisionLoading, error: decisionError } = useQuery({
    queryKey: ['decision', id], queryFn: () => getDecision(id), enabled: !!id,
  });

  const { data: options, isLoading: optionsLoading } = useQuery({
    queryKey: ['decision-options', id], queryFn: () => getDecisionOptions(id), enabled: !!id && !!decision,
  });

  const { data: existingReview, isLoading: reviewLoading } = useQuery({
    queryKey: ['decision-review', id], queryFn: () => getDecisionReview(id), enabled: !!id && !!decision,
  });

  // Load analysis to show what was predicted
  const { data: analysis } = useQuery({
    queryKey: ['decision-analysis', id], queryFn: () => getDecisionAnalysis(id), enabled: !!id,
  });

  // Load forecast (regret predictions)
  const { data: forecastData } = useQuery({
    queryKey: ['decision-forecast', id],
    queryFn: async (): Promise<DecisionForecast | null> => {
      const { data } = await supabase.from('decision_forecasts').select('*').eq('decision_id', id).single();
      return data as DecisionForecast | null;
    },
    enabled: !!id && !!analysis,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const chosenOption = options?.find((o) => o.is_chosen);
      if (!chosenOption) throw new Error('No option was chosen');

      await saveDecisionReview(id, {
        chosen_option_id: chosenOption.id,
        outcome_notes: outcomeNotes,
        satisfaction_score: satisfactionScore,
        would_choose_same: wouldChooseSame ?? undefined,
        lessons_learned: lessonsLearned || undefined,
      });
      await updateDecisionStatus(id, 'reviewed');

      // Resolve prediction calibration — closes the gambling loop
      resolvePredictionCalibration(id, satisfactionScore).catch(() => {});

      if (user?.id && decision) {
        const now = new Date();
        const hours = Math.round((now.getTime() - new Date(decision.created_at).getTime()) / (1000 * 60 * 60));
        recordVelocityDirect(user.id, id, hours, hours).catch(() => {});

        // Save prediction accuracy
        if (forecastData) {
          const chosenForecast = (forecastData.regret_forecast as RegretForecastItem[])
            ?.find((f: RegretForecastItem) => f.option_id === chosenOption.id);
          if (chosenForecast) {
            const didRegret = wouldChooseSame === false;
            const wasPredicted = chosenForecast.regret_likelihood >= 50;
            const regretAcc = didRegret === wasPredicted ? 80 : 30;
            supabase.from('prediction_accuracy').insert({
              user_id: user.id, forecast_id: forecastData.id, decision_id: id,
              regret_accuracy: regretAcc,
              satisfaction_predicted: chosenForecast.regret_likelihood < 30 ? 4 : chosenForecast.regret_likelihood < 60 ? 3 : 2,
              satisfaction_actual: satisfactionScore,
              did_regret: didRegret, was_regret_predicted: wasPredicted,
              analysis_accuracy: didRegret === wasPredicted ? 75 : 35,
            }).then(() => {});
          }
        }

        // Update stats and re-detect blind spots
        supabase.rpc('update_regret_rate', { p_user_id: user.id }).then(() => {});
        supabase.rpc('update_avg_decision_hours', { p_user_id: user.id }).then(() => {});
        supabase.rpc('detect_user_blind_spots', { p_user_id: user.id }).then(() => {});
        supabase.rpc('generate_decision_playbook', { p_user_id: user.id }).then(() => {});

        // Generate Hindsight Comparison — the "path not taken" analysis
        if (analysis) {
          const chosenOption = options?.find((o) => o.is_chosen);
          const rejectedOptions = options?.filter((o) => !o.is_chosen) || [];
          generateHindsightComparison(id, {
            decisionTitle: decision.title,
            originalContext: decision.context || '',
            chosenOptionTitle: chosenOption?.title || '',
            rejectedOptions: rejectedOptions.map(o => o.title),
            originalAnalysisSummary: analysis.summary || '',
            outcomeNotes: outcomeNotes,
            satisfactionScore: satisfactionScore,
            wouldChooseSame: wouldChooseSame,
          }).then(result => {
            if (result) {
              saveHindsightReport(id, result);
            }
          }).catch(() => {});
        }
      }
    },
    onSuccess: () => {
      Alert.alert('Review Saved', 'Your blind spots and playbook have been updated with this new data.', [
        { text: 'Done', onPress: () => router.push(`/decisions/${id}`) },
      ]);
    },
    onError: (error: Error) => { Alert.alert('Error', error.message); },
  });

  const handleSave = useCallback(() => {
    if (!outcomeNotes.trim() || outcomeNotes.length < 10) {
      Alert.alert('Required', 'Please describe what happened (minimum 10 characters).'); return;
    }
    if (wouldChooseSame === null) {
      Alert.alert('Required', 'Please indicate if you would choose the same option again.'); return;
    }
    saveMutation.mutate();
  }, [outcomeNotes, wouldChooseSame, saveMutation]);

  if (decisionLoading || optionsLoading || reviewLoading) {
    return <View style={[s.container, { paddingTop: insets.top }]}><LoadingState message="Loading review..." /></View>;
  }

  if (decisionError || !decision) {
    return <View style={[s.container, { paddingTop: insets.top }]}><ErrorState message="Decision not found" onRetry={() => router.back()} /></View>;
  }

  const chosenOption = options?.find((o) => o.is_chosen);
  const chosenForecast = forecastData
    ? (forecastData.regret_forecast as RegretForecastItem[])?.find((f: RegretForecastItem) => f.option_id === chosenOption?.id)
    : null;

  if (existingReview) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={s.scrollContent}>
          <Text style={s.title}>Review Already Completed</Text>
          <Text style={s.subtitle}>Reviewed on {new Date(existingReview.created_at).toLocaleDateString()}</Text>
          {existingReview.satisfaction_score && (
            <Text style={s.statText}>Satisfaction: {existingReview.satisfaction_score}/5</Text>
          )}
          {existingReview.would_choose_same !== null && (
            <Text style={s.statText}>{existingReview.would_choose_same ? 'Would choose same again' : 'Would choose differently'}</Text>
          )}
          <Button title="Back to Decision" variant="primary" onPress={() => router.push(`/decisions/${id}`)} style={s.button} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Link href={`/decisions/${id}`} asChild><Button title="Back" variant="ghost" size="small" /></Link>
        <Text style={s.headerTitle}>Review Decision</Text>
        <View style={s.placeholder} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        <Text style={s.title}>Review Your Decision</Text>
        <Text style={s.subtitle}>{decision.title}</Text>
        {chosenOption && <Text style={s.chosenOption}>Chosen: {chosenOption.title}</Text>}

        {/* PREDICTION VS REALITY — The killer feature */}
        {chosenForecast && (
          <Card variant="outlined" style={s.forecastCard}>
            <Text style={s.forecastTitle}>🔮 Prediction vs Reality</Text>
            <Text style={s.forecastSub}>
              The AI predicted {chosenForecast.regret_likelihood}% regret likelihood for "{chosenForecast.option_title}".
              {chosenForecast.regret_likelihood >= 50
                ? ' It warned: ' + chosenForecast.why
                : ' It was optimistic about this choice.'}
            </Text>
            <View style={s.forecastDivider} />
            <Text style={s.forecastLabel}>
              Now tell us what actually happened. This is how DecisionOS learns — and gets better for you.
            </Text>
          </Card>
        )}

        <Card variant="default">
          <Text style={s.sectionTitle}>What Actually Happened?</Text>
          <TextArea value={outcomeNotes} onChangeText={setOutcomeNotes} placeholder="Describe the outcome..." numberOfLines={4} maxLength={2000} />
          <Text style={s.helperText}>Minimum 10 characters</Text>
        </Card>

        <Card variant="default">
          <Text style={s.sectionTitle}>How Satisfied Are You?</Text>
          <View style={s.sliderContainer}>
            {[1, 2, 3, 4, 5].map((val) => (
              <Pressable
                key={val}
                style={[s.satBtn, satisfactionScore === val && s.satBtnSel]}
                onPress={() => setSatisfactionScore(val)}
              >
                <Text style={s.satEmoji}>{['', '😞', '😕', '😐', '😊', '😄'][val]}</Text>
                <Text style={s.satLabel}>{['', 'Bad', 'Meh', 'OK', 'Good', 'Great'][val]}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card variant="default">
          <Text style={s.sectionTitle}>Would You Choose the Same Option Again?</Text>
          <View style={s.sameChoiceOptions}>
            <RadioButton selected={wouldChooseSame === true} onPress={() => setWouldChooseSame(true)} label="Yes" description="I would make the same choice" />
            <RadioButton selected={wouldChooseSame === false} onPress={() => setWouldChooseSame(false)} label="No" description="I would choose differently" />
          </View>
        </Card>

        <Card variant="default">
          <Text style={s.sectionTitle}>Lessons Learned</Text>
          <TextArea value={lessonsLearned} onChangeText={setLessonsLearned} placeholder="What did you learn? (Optional)" numberOfLines={3} maxLength={1000} />
        </Card>

        <Button title={saveMutation.isPending ? 'Saving...' : 'Save Review'} variant="primary" onPress={handleSave} disabled={saveMutation.isPending} style={s.button} />
        <Link href={`/decisions/${id}`} asChild><Button title="Back to Decision" variant="ghost" /></Link>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.primary },
  headerTitle: { fontSize: typography.size.lg, fontWeight: '600', color: colors.text.primary },
  placeholder: { width: 60 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.lg },
  title: { fontSize: typography.size.xl, fontWeight: '600', color: colors.text.primary },
  subtitle: { fontSize: typography.size.md, color: colors.text.secondary, marginTop: spacing.xs },
  chosenOption: { fontSize: typography.size.sm, color: colors.text.tertiary, fontStyle: 'italic' },
  statText: { fontSize: 14, color: colors.text.secondary, marginTop: 4 },
  forecastCard: { borderColor: colors.accent.primary + '40', backgroundColor: colors.accent.primary + '05', marginBottom: 0 },
  forecastTitle: { fontSize: 15, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.sm },
  forecastSub: { fontSize: 13, color: colors.text.secondary, lineHeight: 20 },
  forecastDivider: { height: 1, backgroundColor: colors.border.primary, marginVertical: spacing.sm },
  forecastLabel: { fontSize: 12, color: colors.text.tertiary, fontStyle: 'italic' },
  sectionTitle: { fontSize: typography.size.lg, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.md },
  helperText: { fontSize: typography.size.sm, color: colors.text.tertiary, marginTop: spacing.xs },
  sameChoiceOptions: { gap: spacing.md },
  button: { marginTop: spacing.lg },
  sliderContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs },
  satBtn: { alignItems: 'center', padding: spacing.sm, borderRadius: 10, backgroundColor: colors.background.tertiary, flex: 1 },
  satBtnSel: { backgroundColor: colors.accent.primary + '20', borderWidth: 2, borderColor: colors.accent.primary },
  satEmoji: { fontSize: 24 },
  satLabel: { fontSize: 10, color: colors.text.secondary, marginTop: 2 },
});
