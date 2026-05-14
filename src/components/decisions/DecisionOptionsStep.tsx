// DecisionOptionsStep — Step 2: Add/edit options
import { View, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { DecisionOptionList } from './DecisionOptionList';
import { CreateOptionInput } from '@/features/decisions/decisionTypes';

interface DecisionOptionsStepProps {
  options: CreateOptionInput[];
  onAddOption: () => void;
  onEditOption: (index: number) => void;
  onRemoveOption: (index: number) => void;
  onContinue: () => void;
  onBack: () => void;
  canContinue: boolean;
}

export function DecisionOptionsStep({
  options,
  onAddOption,
  onEditOption,
  onRemoveOption,
  onContinue,
  onBack,
  canContinue,
}: DecisionOptionsStepProps): JSX.Element {
  return (
    <View style={styles.container}>
      <DecisionOptionList
        options={options}
        onAddOption={onAddOption}
        onEditOption={onEditOption}
        onRemoveOption={onRemoveOption}
      />

      <View style={styles.navigation}>
        <Button title="Back" variant="ghost" onPress={onBack} />
        <Button
          title="Continue to Questions"
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
    gap: 16,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});
