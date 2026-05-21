import { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { TextArea } from '@/components/ui/TextArea';
import { Badge } from '@/components/ui/Badge';
import {
  DEFAULT_DECISION_QUESTIONS,
  DecisionQuestion,
} from '@/features/decisions/defaultDecisionQuestions';
import { BiasWarning } from '@/features/ai/geminiSchemas';
import { BiasAnalysisStatus } from '@/features/ai/useBiasDetection';
import { BiasWarningsPanel } from './BiasWarningsPanel';

interface DecisionQuestionFormProps {
  answers: Record<string, string>;
  onAnswerChange: (questionKey: string, answer: string) => void;
  biasWarnings?: BiasWarning[];
  biasStatus?: BiasAnalysisStatus;
  biasReasoning?: string;
  totalBiasesDetected?: number;
  onCheckBiases?: () => void;
}

export function DecisionQuestionForm({
  answers, onAnswerChange,
  biasWarnings = [], biasStatus = 'idle', biasReasoning = '',
  totalBiasesDetected = 0, onCheckBiases,
}: DecisionQuestionFormProps): JSX.Element {
  const requiredQuestions = DEFAULT_DECISION_QUESTIONS.filter(q => q.required);
  const optionalQuestions = DEFAULT_DECISION_QUESTIONS.filter(q => !q.required);

  const renderQuestion = useCallback((question: DecisionQuestion) => {
    const value = answers[question.key] ?? '';
    return (
      <View key={question.key} style={styles.questionContainer}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionText}>{question.question}</Text>
          <Badge title={question.required ? 'Required' : 'Optional'} variant={question.required ? 'primary' : 'default'} size="small" />
        </View>
        {question.hint && <Text style={styles.hintText}>{question.hint}</Text>}
        <TextArea value={value} onChangeText={(text) => onAnswerChange(question.key, text)} placeholder="Your answer..." numberOfLines={3} />
      </View>
    );
  }, [answers, onAnswerChange]);

  const answeredRequired = requiredQuestions.filter(q => (answers[q.key] ?? '').trim().length > 0).length;

  const isAnalyzingBias = biasStatus === 'checking';
  const hasBiasDetected = biasStatus === 'biases_found';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Guided Reflection</Text>
        <Text style={styles.progressText}>{answeredRequired} of {requiredQuestions.length} required answered</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Required Questions</Text>
        {requiredQuestions.map(renderQuestion)}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Optional Questions</Text>
        {optionalQuestions.map(renderQuestion)}
      </View>

      <View style={styles.biasSection}>
        <Text style={styles.biasTitle}>Thinking Traps Check</Text>
        <Text style={styles.biasDescription}>
          Cognitive biases are mental shortcuts that can lead to flawed decisions.
          Check your answers for common thinking traps.
        </Text>

        <TouchableOpacity
          style={[styles.checkButton, isAnalyzingBias && styles.checkButtonDisabled]}
          onPress={onCheckBiases}
          activeOpacity={0.7}
          disabled={isAnalyzingBias || !onCheckBiases}
        >
          {isAnalyzingBias ? (
            <View style={styles.checkButtonLoading}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.checkButtonText}>Analyzing...</Text>
            </View>
          ) : (
            <Text style={styles.checkButtonText}>Check for Thinking Traps</Text>
          )}
        </TouchableOpacity>

        {biasStatus !== 'idle' && biasReasoning ? (
          <Text style={[
            styles.biasReasoning,
            biasStatus === 'biases_found' && styles.biasReasoningWarning,
            biasStatus === 'no_biases_found' && styles.biasReasoningPositive,
            (biasStatus === 'quota_exceeded' || biasStatus === 'unavailable' || biasStatus === 'input_too_short') && styles.biasReasoningInfo,
          ]}>
            {biasReasoning}
          </Text>
        ) : null}

        {(biasWarnings.length > 0 || isAnalyzingBias || hasBiasDetected) && (
          <BiasWarningsPanel
            warnings={biasWarnings}
            isAnalyzing={isAnalyzingBias}
            hasDetected={hasBiasDetected}
            totalDetected={totalBiasesDetected}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  progressHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  progressTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e' },
  progressText: { fontSize: 13, color: '#666' },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 14, fontWeight: '600', color: '#666',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12,
  },
  questionContainer: { marginBottom: 16 },
  questionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 4,
  },
  questionText: { fontSize: 15, fontWeight: '600', color: '#1a1a2e', flex: 1, marginRight: 8 },
  hintText: { fontSize: 12, color: '#888', marginBottom: 8, fontStyle: 'italic' },
  biasSection: {
    marginTop: 8, marginBottom: 24,
    backgroundColor: '#f8f9ff', borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: '#e8eaff',
  },
  biasTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  biasDescription: { fontSize: 13, color: '#666', marginBottom: 12, lineHeight: 18 },
  checkButton: {
    backgroundColor: '#6c5ce7', borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 20,
    alignItems: 'center',
  },
  checkButtonDisabled: { opacity: 0.5 },
  checkButtonLoading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  biasReasoning: {
    fontSize: 13, marginTop: 10, lineHeight: 18, paddingHorizontal: 2,
  },
  biasReasoningWarning: { color: '#e67e22' },
  biasReasoningPositive: { color: '#27ae60' },
  biasReasoningInfo: { color: '#666' },
});
