import { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '@/theme/colors';
import { useCreateDecision } from '@/features/decisions/useCreateDecision';
import { useDecisionDraftStore } from '@/stores/decisionDraftStore';
import { CreateOptionInput } from '@/features/decisions/decisionTypes';
import { DECISION_RULES } from '@/features/decisions/decisionRules';
import {
  validateDecisionBasicsFields, validateDecisionOptionsFields, validateDecisionQuestionsFields,
  FieldError,
} from '@/features/decisions/decisionValidation';
import { DecisionBasicsStep } from './DecisionBasicsStep';
import { DecisionOptionsStep } from './DecisionOptionsStep';
import { DecisionOptionEditor } from './DecisionOptionEditor';
import { DecisionQuestionsStep } from './DecisionQuestionsStep';
import { DecisionReviewStep } from './DecisionReviewStep';
import { DecisionStepIndicator, StepKey } from './DecisionStepIndicator';
import { useBiasDetection } from '@/features/ai/useBiasDetection';
import { styles } from './FullDecisionWizard.styles';

interface FullDecisionWizardProps {
  onCancel: () => void;
}

function sanitizeOption(option: CreateOptionInput): CreateOptionInput {
  return {
    title: option.title.trim(),
    description: option.description?.trim().slice(0, DECISION_RULES.MAX_OPTION_DESCRIPTION_LENGTH) || undefined,
    pros: (option.pros || []).map(p => p.trim()).filter(p => p.length > 0).slice(0, DECISION_RULES.MAX_PROS_CONS).map(p => p.slice(0, DECISION_RULES.MAX_PRO_CON_LENGTH)),
    cons: (option.cons || []).map(c => c.trim()).filter(c => c.length > 0).slice(0, DECISION_RULES.MAX_PROS_CONS).map(c => c.slice(0, DECISION_RULES.MAX_PRO_CON_LENGTH)),
  };
}

export function FullDecisionWizard({ onCancel }: FullDecisionWizardProps): JSX.Element {
  const draft = useDecisionDraftStore(s => s.draft);
  const startNewDraft = useDecisionDraftStore(s => s.startNewDraft);
  const updateDraft = useDecisionDraftStore(s => s.updateDraft);
  const addOption = useDecisionDraftStore(s => s.addOption);
  const removeOption = useDecisionDraftStore(s => s.removeOption);
  const updateOption = useDecisionDraftStore(s => s.updateOption);
  const setAnswer = useDecisionDraftStore(s => s.setAnswer);
  const clearDraft = useDecisionDraftStore(s => s.clearDraft);

  const { currentStep, setCurrentStep, goToNextStep, goToPreviousStep, submitDecision, isSubmitting, error: submitError } = useCreateDecision();

  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => { if (!draft) startNewDraft(); }, [startNewDraft, draft]);

  const questionsAnswers = draft?.answers || {};
  const biasDetection = useBiasDetection(draft?.title || '', draft?.context || '', questionsAnswers);

  const handleSelectCategory = useCallback((category: import('@/features/decisions/decisionTypes').DecisionCategory) => { updateDraft({ category }); setFieldErrors(prev => prev.filter(e => e.field !== 'category')); }, [updateDraft]);
  const handleBasicsContinue = useCallback(() => { const errors = validateDecisionBasicsFields(draft); if (errors.length > 0) { setFieldErrors(errors); return; } setFieldErrors([]); goToNextStep(); }, [draft, goToNextStep]);
  const handleAddOption = useCallback(() => { if (draft && draft.options.length < DECISION_RULES.MAX_OPTIONS) { addOption({ title: '', description: '', pros: [], cons: [] }); setEditingOptionIndex(draft.options.length); } }, [draft, addOption]);
  const handleEditOption = useCallback((index: number) => { setEditingOptionIndex(index); }, []);
  const handleRemoveOption = useCallback((index: number) => { removeOption(index); setFieldErrors([]); }, [removeOption]);
  const handleOptionSave = useCallback((option: CreateOptionInput) => { const sanitized = sanitizeOption(option); if (editingOptionIndex !== null && draft) { if (editingOptionIndex < draft.options.length) updateOption(editingOptionIndex, sanitized); else addOption(sanitized); } setEditingOptionIndex(null); setFieldErrors([]); }, [editingOptionIndex, draft, updateOption, addOption]);
  const handleOptionsContinue = useCallback(() => { const errors = validateDecisionOptionsFields(draft?.options); if (errors.length > 0) { setFieldErrors(errors); return; } setFieldErrors([]); goToNextStep(); }, [draft, goToNextStep]);
  const handleQuestionsContinue = useCallback(() => { const errors = validateDecisionQuestionsFields(draft?.answers, draft?.context); if (errors.length > 0) { setFieldErrors(errors); return; } setFieldErrors([]); goToNextStep(); }, [draft, goToNextStep]);

  const handleSave = useCallback(async () => {
    if (!draft || !draft.category) return;
    setSaveError(null);
    const errors = validateDecisionBasicsFields(draft);
    if (errors.length > 0) { setFieldErrors(errors); return; }
    const sanitizedOptions = (draft.options || []).map(sanitizeOption);
    const filteredAnswers = Object.fromEntries(Object.entries(draft.answers).filter(([, v]) => v.trim().length > 0));
    try {
      await submitDecision({ title: draft.title.trim(), category: draft.category, context: draft.context.trim(), desiredOutcome: draft.desiredOutcome.trim(), biggestFear: draft.biggestFear.trim(), inactionOutcome: draft.inactionOutcome.trim(), importance: draft.importance, urgency: draft.urgency, options: sanitizedOptions, answers: filteredAnswers, skip_questions: false });
      clearDraft();
    } catch (err) { setSaveError(err instanceof Error ? err.message : 'Failed to save decision'); }
  }, [draft, submitDecision, clearDraft]);

  const displayError = saveError || (submitError ? submitError.message : null);

  if (!draft) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.accent.primary} /></View>;
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.headerBtn}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>New Decision</Text>
        <View style={styles.headerBtn} />
      </View>

      <DecisionStepIndicator currentStep={currentStep as StepKey} onStepPress={(step) => setCurrentStep(step)} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
        {currentStep === 'basics' && <DecisionBasicsStep draft={draft!} onUpdateDraft={(updates) => { updateDraft(updates); setFieldErrors([]); }} onSelectCategory={handleSelectCategory} onContinue={handleBasicsContinue} canContinue={true} />}

        {currentStep === 'options' && (editingOptionIndex !== null ? (
          <View>
            <TouchableOpacity onPress={() => setEditingOptionIndex(null)} style={{ marginBottom: 16 }}><Text style={{ fontSize: 14, color: colors.accent.primary, fontWeight: '500' }}>← Back to options</Text></TouchableOpacity>
            <DecisionOptionEditor onSave={handleOptionSave} onCancel={() => setEditingOptionIndex(null)} existingOption={editingOptionIndex < (draft?.options.length ?? 0) ? draft?.options[editingOptionIndex] : undefined} optionNumber={editingOptionIndex < (draft?.options.length ?? 0) ? editingOptionIndex + 1 : (draft?.options.length ?? 0) + 1} />
          </View>
        ) : (
          <DecisionOptionsStep options={draft?.options || []} onAddOption={handleAddOption} onEditOption={handleEditOption} onRemoveOption={handleRemoveOption} onContinue={handleOptionsContinue} onBack={goToPreviousStep} canContinue={true} />
        ))}

        {currentStep === 'questions' && <DecisionQuestionsStep answers={draft?.answers || {}} onAnswerChange={(key, answer) => setAnswer(key, answer)} onContinue={handleQuestionsContinue} onBack={goToPreviousStep} canContinue={true} biasWarnings={biasDetection.warnings} biasStatus={biasDetection.status} biasReasoning={biasDetection.reasoning} totalBiasesDetected={biasDetection.totalDetected} onCheckBiases={biasDetection.analyze} />}

        {currentStep === 'review' && draft && <DecisionReviewStep draft={draft} onSave={handleSave} onBack={goToPreviousStep} canSave={true} />}

        {fieldErrors.length > 0 && <View style={styles.errorsContainer}>{fieldErrors.map((err, i) => <Text key={i} style={styles.errorText}>• {err.message}</Text>)}</View>}
        {displayError && <View style={styles.errorBanner}><Text style={styles.errorBannerText}>{displayError}</Text></View>}
      </ScrollView>

      {currentStep === 'review' && (
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]} onPress={handleSave} activeOpacity={0.7} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.saveBtnText}>Save & Analyze</Text>}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
