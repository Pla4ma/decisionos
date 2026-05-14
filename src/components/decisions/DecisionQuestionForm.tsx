// DecisionQuestionForm — Guided questions for decision clarity
// Now includes real-time cognitive bias detection feedback
import { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
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
import { BiasWarningsPanel } from './BiasWarningsPanel';

interface DecisionQuestionFormProps {
  answers: Record<string, string>;
  onAnswerChange: (questionKey: string, answer: string) => void;
  /** Optional: bias warnings from real-time detection */
  biasWarnings?: BiasWarning[];
  /** Optional: is the AI currently analyzing */
  isAnalyzingBias?: boolean;
  /** Optional: has bias detection ever fired */
  hasBiasDetected?: boolean;
  /** Optional: total biases found */
  totalBiasesDetected?: number;
}

export function DecisionQuestionForm({
  answers,
  onAnswerChange,
  biasWarnings = [],
  isAnalyzingBias = false,
  hasBiasDetected = false,
  totalBiasesDetected = 0,
}: DecisionQuestionFormProps): JSX.Element {
  const requiredQuestions = DEFAULT_DECISION_QUESTIONS.filter(q => q.required);
  const optionalQuestions = DEFAULT_DECISION_QUESTIONS.filter(q => !q.required);

  const renderQuestion = useCallback((question: DecisionQuestion) => {
    const value = answers[question.key] ?? '';

    return (
      <View key={question.key} style={styles.questionContainer}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionText}>{question.question}</Text>
          <Badge
            title={question.required ? 'Required' : 'Optional'}
            variant={question.required ? 'primary' : 'default'}
            size="small"
          />
        </View>
        {question.hint && (
          <Text style={styles.hintText}>{question.hint}</Text>
        )}
        <TextArea
          value={value}
          onChangeText={(text) => onAnswerChange(question.key, text)}
          placeholder="Your answer..."
          numberOfLines={3}
        />
      </View>
    );
  }, [answers, onAnswerChange]);

  const answeredRequired = requiredQuestions.filter(
    q => (answers[q.key] ?? '').trim().length > 0
  ).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Guided Reflection</Text>
        <Text style={styles.progressText}>
          {answeredRequired} of {requiredQuestions.length} required answered
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Required Questions</Text>
        {requiredQuestions.map(renderQuestion)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Optional Questions</Text>
        {optionalQuestions.map(renderQuestion)}
      </View>

      <BiasWarningsPanel
        warnings={biasWarnings}
        isAnalyzing={isAnalyzingBias}
        hasDetected={hasBiasDetected}
        totalDetected={totalBiasesDetected}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  progressText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  questionContainer: {
    gap: spacing.xs,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  questionText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
    flex: 1,
    flexWrap: 'wrap',
  },
  hintText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
});
