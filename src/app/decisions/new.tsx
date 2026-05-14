// new.tsx - Final implementation with template, quick mode, and real-time bias detection
import { useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { useDecisionDraftStore } from '@/stores/decisionDraftStore';
import { useCreateDecision } from '@/features/decisions/useCreateDecision';
import { useTemplates } from '@/features/decisions/useTemplates';
import { useBiasDetection } from '@/features/ai/useBiasDetection';
import { logBiasDetection } from '@/features/cbmi/cbmiService';
import { DecisionBasicsStep, DecisionOptionsStep, DecisionQuestionsStep, DecisionReviewStep, StepIndicator } from '@/components/decisions';

const STEP_LABELS: Record<string, string> = {
  basics: 'Basics',
  options: 'Options',
  questions: 'Reflect',
  review: 'Review',
};

export default function NewDecisionScreen(): JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { template, quick } = useLocalSearchParams<{ template?: string; quick?: string }>();
  const { templates } = useTemplates();
  const { draft, startNewDraft, updateDraft, clearDraft, setAnswer } = useDecisionDraftStore();
  const { currentStep, stepOrder, submitDecision, isSubmitting, isSuccess, createdDecisionId, goToNextStep, goToPreviousStep } = useCreateDecision();

  // Real-time bias detection during the questions step
  const combinedDraftContext = [
    draft?.context || '',
    draft?.desiredOutcome || '',
    draft?.biggestFear || '',
  ].filter(Boolean).join('\n');

  const biasDetection = useBiasDetection(
    draft?.title || 'Untitled Decision',
    combinedDraftContext,
    draft?.answers || {},
    { enabled: currentStep === 'questions' && quick !== 'true', debounceMs: 2000 },
  );

  useEffect(() => {
    if (!draft) {
      startNewDraft();
      if (template) {
        const t = templates.find(t => t.id === template);
        if (t) updateDraft({ title: t.example_title || '', category: t.category as any, context: t.example_context || '' });
      }
    }
  }, [draft, startNewDraft, template, templates, updateDraft]);

  const handleSave = useCallback(() => {
    if (!draft || !draft.category) return;
    biasDetection.reset();
    submitDecision({
      ...draft,
      answers: quick === 'true' ? { quick_mode: 'true' } : draft.answers,
    });
    if (isSuccess) clearDraft();
  }, [draft, submitDecision, isSuccess, clearDraft, quick, biasDetection]);

  const handleCancel = useCallback(() => { clearDraft(); biasDetection.reset(); router.back(); }, [clearDraft, router, biasDetection]);

  const handleAnswerChange = useCallback((questionKey: string, answer: string) => {
    setAnswer(questionKey, answer);
  }, [setAnswer]);

  // Log bias detection events when a decision is successfully created
  useEffect(() => {
    if (isSuccess && createdDecisionId && biasDetection.warnings.length > 0) {
      biasDetection.warnings.forEach(warning => {
        logBiasDetection({
          decisionId: createdDecisionId,
          biasName: warning.bias_name,
          description: warning.description,
          contextExcerpt: warning.context_in_decision,
          mitigationStrategy: warning.mitigation_strategy,
        });
      });
    }
  }, [isSuccess, createdDecisionId, biasDetection.warnings]);

  if (!draft) return <View style={[styles.container, { paddingTop: insets.top }]}><LoadingState message="Initializing..." /></View>;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Cancel" variant="ghost" size="small" onPress={handleCancel} />
        {isSubmitting ? (
          <LoadingState message="Saving..." />
        ) : (
          <Button title="Save" variant="primary" size="small" onPress={handleSave} />
        )}
      </View>
      <StepIndicator steps={stepOrder} currentStep={currentStep} stepLabels={STEP_LABELS} />
      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: spacing.lg }}>
        {currentStep === 'basics' && <DecisionBasicsStep draft={draft} onUpdateDraft={updateDraft} onContinue={goToNextStep} />}
        {currentStep === 'options' && <DecisionOptionsStep onContinue={goToNextStep} onBack={goToPreviousStep} />}
        {currentStep === 'questions' && quick !== 'true' && (
          <DecisionQuestionsStep
            answers={draft.answers}
            onAnswerChange={handleAnswerChange}
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            canContinue={true}
            biasWarnings={biasDetection.warnings}
            isAnalyzingBias={biasDetection.isAnalyzing}
            hasBiasDetected={biasDetection.hasDetected}
            totalBiasesDetected={biasDetection.totalDetected}
          />
        )}
        {currentStep === 'review' && <DecisionReviewStep onSave={handleSave} onBack={goToPreviousStep} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  scroll: { flex: 1 },
});
