// DecisionQuestionsStep — Step 3: Answer guided questions with bias detection
import { View, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { DecisionQuestionForm } from './DecisionQuestionForm';
import { BiasWarning } from '@/features/ai/geminiSchemas';

interface DecisionQuestionsStepProps {
  answers: Record<string, string>;
  onAnswerChange: (questionKey: string, answer: string) => void;
  onContinue: () => void;
  onBack: () => void;
  canContinue: boolean;
  biasWarnings?: BiasWarning[];
  isAnalyzingBias?: boolean;
  hasBiasDetected?: boolean;
  totalBiasesDetected?: number;
}

export function DecisionQuestionsStep({
  answers,
  onAnswerChange,
  onContinue,
  onBack,
  canContinue,
  biasWarnings = [],
  isAnalyzingBias = false,
  hasBiasDetected = false,
  totalBiasesDetected = 0,
}: DecisionQuestionsStepProps): JSX.Element {
  return (
    <View style={styles.container}>
      <DecisionQuestionForm
        answers={answers}
        onAnswerChange={onAnswerChange}
        biasWarnings={biasWarnings}
        isAnalyzingBias={isAnalyzingBias}
        hasBiasDetected={hasBiasDetected}
        totalBiasesDetected={totalBiasesDetected}
      />

      <View style={styles.navigation}>
        <Button title="Back" variant="ghost" onPress={onBack} />
        <Button
          title="Review & Save"
          variant="primary"
          onPress={onContinue}
          disabled={!canContinue}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});
