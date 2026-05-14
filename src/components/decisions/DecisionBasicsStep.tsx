// DecisionBasicsStep — Step 1: Basic decision information
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { TextArea } from '@/components/ui/TextArea';
import { Slider } from '@/components/ui/Slider';
import { DecisionCategorySelector } from './DecisionCategorySelector';
import { DecisionCategory } from '@/features/decisions/decisionTypes';
import { DraftDecision } from '@/stores/decisionDraftStore';

interface DecisionBasicsStepProps {
  draft: DraftDecision;
  onUpdateDraft: (updates: Partial<DraftDecision>) => void;
  onSelectCategory: (category: DecisionCategory) => void;
  onContinue: () => void;
  canContinue: boolean;
}

export function DecisionBasicsStep({
  draft,
  onUpdateDraft,
  onSelectCategory,
  onContinue,
  canContinue,
}: DecisionBasicsStepProps): JSX.Element {
  return (
    <View style={styles.container}>
      <TextField
        label="What decision are you making?"
        value={draft.title}
        onChangeText={(text: string) => onUpdateDraft({ title: text })}
        placeholder="e.g., Should I take the new job offer?"
      />

      <DecisionCategorySelector
        selectedCategory={draft.category}
        onSelectCategory={onSelectCategory}
      />

      <TextArea
        label="Context"
        value={draft.context}
        onChangeText={(text: string) => onUpdateDraft({ context: text })}
        placeholder="What\'s the situation? Who else is involved? What\'s at stake?"
        numberOfLines={4}
      />

      <TextArea
        label="What would a great outcome look like?"
        value={draft.desiredOutcome}
        onChangeText={(text: string) => onUpdateDraft({ desiredOutcome: text })}
        placeholder="If everything goes perfectly, what happens?"
        numberOfLines={3}
      />

      <TextArea
        label="What are you most afraid of?"
        value={draft.biggestFear}
        onChangeText={(text: string) => onUpdateDraft({ biggestFear: text })}
        placeholder="What\'s the worst thing that could happen?"
        numberOfLines={3}
      />

      <TextArea
        label="What happens if you do nothing?"
        value={draft.inactionOutcome}
        onChangeText={(text: string) => onUpdateDraft({ inactionOutcome: text })}
        placeholder="The status quo isn\'t free — what\'s the cost of waiting?"
        numberOfLines={3}
      />

      <View style={styles.slidersSection}>
        <Text style={styles.sectionTitle}>How important is this?</Text>
        <Slider
          value={draft.importance}
          onValueChange={(value: number) => onUpdateDraft({ importance: value })}
          minimumValue={1}
          maximumValue={10}
          step={1}
          labels={['Minor', 'Life-changing']}
        />

        <Text style={styles.sectionTitle}>How urgent is this?</Text>
        <Slider
          value={draft.urgency}
          onValueChange={(value: number) => onUpdateDraft({ urgency: value })}
          minimumValue={1}
          maximumValue={10}
          step={1}
          labels={['Can wait', 'Decide today']}
        />
      </View>

      <Button
        title="Continue to Options"
        variant="primary"
        onPress={onContinue}
        disabled={!canContinue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  slidersSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },
});
