import { View, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { DecisionQuestionForm } from './DecisionQuestionForm';
import { BiasAnalysisStatus } from '@/features/ai/useBiasDetection';
import { BiasWarning } from '@/features/ai/geminiSchemas';

interface DecisionQuestionsStepProps {
  answers: Record<string, string>;
  onAnswerChange: (questionKey: string, answer: string) => void;
  onContinue: () => void;
  onBack: () => void;
  canContinue: boolean;
  biasWarnings?: BiasWarning[];
  biasStatus?: BiasAnalysisStatus;
  biasReasoning?: string;
  totalBiasesDetected?: number;
  onCheckBiases?: () => void;
}

export function DecisionQuestionsStep({
  answers, onAnswerChange, onContinue, onBack, canContinue,
  biasWarnings = [], biasStatus = 'idle', biasReasoning = '',
  totalBiasesDetected = 0, onCheckBiases,
}: DecisionQuestionsStepProps): JSX.Element {
  return (
    <View style={styles.container}>
      <DecisionQuestionForm
        answers={answers} onAnswerChange={onAnswerChange}
        biasWarnings={biasWarnings} biasStatus={biasStatus}
        biasReasoning={biasReasoning} totalBiasesDetected={totalBiasesDetected}
        onCheckBiases={onCheckBiases}
      />
      <View style={styles.navigation}>
        <Button title="Back" variant="ghost" onPress={onBack} />
        <Button title="Review & Save" variant="primary" onPress={onContinue} disabled={!canContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navigation: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#e0e0e0',
  },
});
