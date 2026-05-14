// FLOW: /decisions/new — Create Decision (3 modes)
// MODES: ?quick=true → Quick Mode (2 min, title + 2 options)
//        ?practice=true → Practice Mode (curated scenarios)
//        (no param) → Full Mode (4-step guided flow)
// FROM: / (home) — tap "Quick Decision" or "Full Analysis"
//       /decisions — tap "New Decision"
// TO: /decisions/[id] — after creation, navigates to detail
// See FLOW_ARCHITECTURE.md §2 — Decision Creation Flow
import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { TextArea } from '@/components/ui/TextArea';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { useDecisionDraftStore } from '@/stores/decisionDraftStore';
import { useCreateDecision } from '@/features/decisions/useCreateDecision';
import { useTemplates } from '@/features/decisions/useTemplates';
import { useBiasDetection } from '@/features/ai/useBiasDetection';
import { logBiasDetection } from '@/features/cbmi/cbmiService';
import { usePracticeMode } from '@/features/engagement/usePracticeMode';
import { DecisionBasicsStep, DecisionOptionsStep, DecisionQuestionsStep, DecisionReviewStep, StepIndicator } from '@/components/decisions';
import { PRACTICE_SCENARIOS, getRandomScenarios, getScenarioById, PracticeScenario } from '@/features/engagement/practiceModeTypes';

const STEP_LABELS: Record<string, string> = {
  basics: 'Basics',
  options: 'Options',
  questions: 'Reflect',
  review: 'Review',
};

type CreateMode = 'full' | 'quick' | 'practice';

export default function NewDecisionScreen(): JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { template, quick, practice } = useLocalSearchParams<{ template?: string; quick?: string; practice?: string }>();
  const { templates } = useTemplates();
  const { draft, startNewDraft, updateDraft, clearDraft, setAnswer } = useDecisionDraftStore();
  const { currentStep, stepOrder, submitDecision, isSubmitting, isSuccess, createdDecisionId, goToNextStep, goToPreviousStep } = useCreateDecision();
  const { startSession, currentScenario, completeScenario, nextScenario, endSession, scenariosCompleted, totalScenarios, sessionActive } = usePracticeMode();
  const [selectedPracticeOption, setSelectedPracticeOption] = useState<number | null>(null);
  const practiceIndex = scenariosCompleted; // current scenario index = number already completed
  const [mode, setMode] = useState<CreateMode>(quick === 'true' ? 'quick' : practice === 'true' ? 'practice' : 'full');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickOptionA, setQuickOptionA] = useState('');
  const [quickOptionB, setQuickOptionB] = useState('');

  const combinedDraftContext = [
    draft?.context || '',
    draft?.desiredOutcome || '',
    draft?.biggestFear || '',
  ].filter(Boolean).join('\n');

  const biasDetection = useBiasDetection(
    draft?.title || 'Untitled Decision',
    combinedDraftContext,
    draft?.answers || {},
    { enabled: currentStep === 'questions' && mode === 'full', debounceMs: 2000 },
  );

  useEffect(() => {
    if (!draft && mode === 'full') {
      startNewDraft();
      if (template) {
        const t = templates.find(t => t.id === template);
        if (t) updateDraft({ title: t.example_title || '', category: t.category as any, context: t.example_context || '' });
      }
    }
  }, [draft, startNewDraft, template, templates, updateDraft, mode]);

  // Start practice session
  useEffect(() => {
    if (mode === 'practice' && !sessionActive) {
      startSession();
    }
  }, [mode, sessionActive, startSession]);

  const handleSubmitFull = useCallback(() => {
    if (!draft || !draft.category) return;
    biasDetection.reset();
    submitDecision({
      ...draft,
      answers: draft.answers,
    });
    if (isSuccess) clearDraft();
  }, [draft, submitDecision, isSuccess, clearDraft, biasDetection]);

  const handleQuickSubmit = useCallback(async () => {
    if (!quickTitle.trim() || !quickOptionA.trim() || !quickOptionB.trim()) return;

    submitDecision({
      title: quickTitle.trim(),
      category: 'other',
      context: 'Quick decision',
      desiredOutcome: '',
      biggestFear: '',
      inactionOutcome: '',
      importance: 5,
      urgency: 5,
      options: [
        { title: quickOptionA.trim(), pros: [], cons: [] },
        { title: quickOptionB.trim(), pros: [], cons: [] },
      ],
      answers: { quick_mode: 'true' },
      skip_questions: true,
    });

    if (isSuccess) {
      setQuickTitle('');
      setQuickOptionA('');
      setQuickOptionB('');
    }
  }, [quickTitle, quickOptionA, quickOptionB, submitDecision, isSuccess]);

  const handlePracticeSelect = useCallback((index: number) => {
    setSelectedPracticeOption(index);
    completeScenario(index);
  }, [completeScenario]);

  const handlePracticeNext = useCallback(() => {
    setSelectedPracticeOption(null);
    nextScenario();
  }, [nextScenario]);

  const handleCancel = useCallback(() => {
    clearDraft();
    biasDetection.reset();
    endSession();
    router.back();
  }, [clearDraft, router, biasDetection, endSession]);

  const handleAnswerChange = useCallback((questionKey: string, answer: string) => {
    setAnswer(questionKey, answer);
  }, [setAnswer]);

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

  // Quick Mode Screen
  if (mode === 'quick') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Button title="Cancel" variant="ghost" size="small" onPress={() => { router.back(); }} />
          <Text style={styles.headerTitle}>Quick Decision</Text>
          <Button
            title="Create"
            variant="primary"
            size="small"
            onPress={handleQuickSubmit}
            disabled={!quickTitle.trim() || !quickOptionA.trim() || !quickOptionB.trim() || isSubmitting}
          />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={{ padding: spacing.lg }}>
          <Card variant="outlined" style={styles.quickTipCard}>
            <Text style={styles.quickTipTitle}>⚡ 2-Minute Decision</Text>
            <Text style={styles.quickTipText}>Just name your decision and two options. We'll handle the rest.</Text>
          </Card>

          <TextField
            label="What decision are you facing?"
            value={quickTitle}
            onChangeText={setQuickTitle}
            placeholder="e.g., Should I take the new job?"
            maxLength={200}
          />

          <View style={styles.quickOptionsRow}>
            <View style={styles.quickOptionCol}>
              <Text style={styles.quickOptionLabel}>Option A</Text>
              <TextField
                label=""
                value={quickOptionA}
                onChangeText={setQuickOptionA}
                placeholder="e.g., Accept the offer"
                maxLength={100}
              />
            </View>
            <View style={styles.quickOptionCol}>
              <Text style={styles.quickOptionLabel}>Option B</Text>
              <TextField
                label=""
                value={quickOptionB}
                onChangeText={setQuickOptionB}
                placeholder="e.g., Stay and negotiate"
                maxLength={100}
              />
            </View>
          </View>

          <Text style={styles.quickHelper}>
            Need a deeper analysis?{' '}
            <Text style={styles.quickHelperLink} onPress={() => setMode('full')}>
              Switch to Full Mode
            </Text>
          </Text>
        </ScrollView>
      </View>
    );
  }

  // Practice Mode Screen
  if (mode === 'practice') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Button title="Exit Practice" variant="ghost" size="small" onPress={handleCancel} />
          <Text style={styles.headerTitle}>Practice Mode</Text>
          <Text style={styles.headerProgress}>{scenariosCompleted}/{totalScenarios}</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={{ padding: spacing.lg }}>
          {currentScenario ? (
            <View>
              <Badge
                title={currentScenario.category}
                variant="info"
                size="small"
                style={styles.practiceBadge}
              />
              <Text style={styles.practiceTitle}>{currentScenario.title}</Text>
              <Text style={styles.practiceContext}>{currentScenario.context}</Text>

              <Text style={styles.practiceOptionsLabel}>Choose your approach:</Text>
              {currentScenario.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.practiceOption,
                    selectedPracticeOption === index && styles.practiceOptionSelected,
                  ]}
                  onPress={() => handlePracticeSelect(index)}
                  disabled={selectedPracticeOption !== null}
                  activeOpacity={0.7}
                >
                  <Text style={styles.practiceOptionTitle}>{option.title}</Text>
                  <Text style={styles.practiceOptionDesc}>{option.description}</Text>
                  <View style={styles.practiceProsCons}>
                    <View style={styles.practicePros}>
                      {option.pros.slice(0, 2).map((pro, i) => (
                        <Text key={i} style={styles.practiceProText}>✓ {pro}</Text>
                      ))}
                    </View>
                    <View style={styles.practiceCons}>
                      {option.cons.slice(0, 2).map((con, i) => (
                        <Text key={i} style={styles.practiceConText}>✗ {con}</Text>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {selectedPracticeOption !== null && (
                <View style={styles.practiceResultContainer}>
                  <Card variant="elevated" style={styles.practiceResultCard}>
                    <Text style={styles.practiceResultTitle}>Choice Recorded</Text>
                    <Text style={styles.practiceResultText}>
                      You chose: {currentScenario.options[selectedPracticeOption]?.title}
                    </Text>
                    {currentScenario.source === 'curated' && (
                      <Text style={styles.practiceInsight}>
                        This scenario has been analyzed by our team. In practice, most people who chose this option
                        reported higher satisfaction when they aligned their choice with their long-term values.
                      </Text>
                    )}
                  </Card>
                  <Button
                    title={practiceIndex < totalScenarios - 1 ? 'Next Scenario' : 'Finish Practice'}
                    variant="primary"
                    onPress={handlePracticeNext}
                  />
                </View>
              )}
            </View>
          ) : (
            <View style={styles.practiceEndContainer}>
              <Text style={styles.practiceEndIcon}>🧠</Text>
              <Text style={styles.practiceEndTitle}>Practice Complete!</Text>
              <Text style={styles.practiceEndText}>
                You worked through {scenariosCompleted} scenarios. Each one strengthens your decision framework.
              </Text>
              <View style={styles.practiceEndActions}>
                <Button title="Try Again" variant="primary" onPress={() => { startSession(); setSelectedPracticeOption(null); }} />
                <Button title="Create a Real Decision" variant="ghost" onPress={() => { endSession(); setMode('full'); startNewDraft(); }} />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // Full Mode Screen
  if (!draft) return <View style={[styles.container, { paddingTop: insets.top }]}><LoadingState message="Initializing..." /></View>;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Cancel" variant="ghost" size="small" onPress={handleCancel} />
        {isSubmitting ? (
          <LoadingState message="Saving..." />
        ) : (
          <Button title="Save" variant="primary" size="small" onPress={handleSubmitFull} />
        )}
      </View>
      <StepIndicator steps={stepOrder} currentStep={currentStep} stepLabels={STEP_LABELS} />
      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: spacing.lg }}>
        {currentStep === 'basics' && <DecisionBasicsStep draft={draft} onUpdateDraft={updateDraft} onContinue={goToNextStep} />}
        {currentStep === 'options' && <DecisionOptionsStep onContinue={goToNextStep} onBack={goToPreviousStep} />}
        {currentStep === 'questions' && (
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
        {currentStep === 'review' && <DecisionReviewStep onSave={handleSubmitFull} onBack={goToPreviousStep} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitle: { fontSize: typography.size.lg, fontWeight: '600', color: colors.text.primary },
  headerProgress: { fontSize: typography.size.sm, color: colors.accent.primary, fontWeight: '600' },
  scroll: { flex: 1 },
  quickTipCard: { marginBottom: spacing.lg, borderColor: colors.accent.primary + '40' },
  quickTipTitle: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.xs },
  quickTipText: { fontSize: typography.size.sm, color: colors.text.secondary, lineHeight: 18 },
  quickOptionsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  quickOptionCol: { flex: 1 },
  quickOptionLabel: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.secondary, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  quickHelper: { fontSize: typography.size.sm, color: colors.text.tertiary, marginTop: spacing.lg, textAlign: 'center' },
  quickHelperLink: { color: colors.accent.primary, fontWeight: '600' },
  practiceBadge: { alignSelf: 'flex-start', marginBottom: spacing.md },
  practiceTitle: { fontSize: typography.size.xl, fontWeight: '700', color: colors.text.primary, marginBottom: spacing.md },
  practiceContext: { fontSize: typography.size.md, color: colors.text.secondary, lineHeight: 22, marginBottom: spacing.lg, backgroundColor: colors.background.secondary, padding: spacing.md, borderRadius: 12 },
  practiceOptionsLabel: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md },
  practiceOption: { backgroundColor: colors.background.secondary, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border.primary },
  practiceOptionSelected: { borderColor: colors.accent.primary, backgroundColor: colors.accent.primary + '10' },
  practiceOptionTitle: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.xs },
  practiceOptionDesc: { fontSize: typography.size.sm, color: colors.text.secondary, marginBottom: spacing.sm, lineHeight: 18 },
  practiceProsCons: { flexDirection: 'row', gap: spacing.md },
  practicePros: { flex: 1 },
  practiceProText: { fontSize: 12, color: colors.status.success, marginBottom: 2 },
  practiceCons: { flex: 1 },
  practiceConText: { fontSize: 12, color: colors.status.error, marginBottom: 2 },
  practiceResultContainer: { marginTop: spacing.lg, gap: spacing.md },
  practiceResultCard: { backgroundColor: colors.accent.primary + '10' },
  practiceResultTitle: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.xs },
  practiceResultText: { fontSize: typography.size.md, color: colors.accent.primary, fontWeight: '600', marginBottom: spacing.md },
  practiceInsight: { fontSize: typography.size.sm, color: colors.text.secondary, lineHeight: 18, fontStyle: 'italic' },
  practiceEndContainer: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  practiceEndIcon: { fontSize: 48, marginBottom: spacing.md },
  practiceEndTitle: { fontSize: typography.size.xl, fontWeight: '700', color: colors.text.primary },
  practiceEndText: { fontSize: typography.size.md, color: colors.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  practiceEndActions: { gap: spacing.sm, width: '100%' },
});
