// DecisionOptionEditor — Add/edit a single option
import { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { TextArea } from '@/components/ui/TextArea';
import { CreateOptionInput } from '@/features/decisions/decisionTypes';

interface DecisionOptionEditorProps {
  onSave: (option: CreateOptionInput) => void;
  onCancel: () => void;
  existingOption?: CreateOptionInput;
  optionNumber: number;
}

export function DecisionOptionEditor({
  onSave,
  onCancel,
  existingOption,
  optionNumber,
}: DecisionOptionEditorProps): JSX.Element {
  const [title, setTitle] = useState(existingOption?.title ?? '');
  const [description, setDescription] = useState(existingOption?.description ?? '');
  const [pros, setPros] = useState(existingOption?.pros?.join('\n') ?? '');
  const [cons, setCons] = useState(existingOption?.cons?.join('\n') ?? '');

  const handleSave = useCallback(() => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      pros: pros.split('\n').filter(p => p.trim()),
      cons: cons.split('\n').filter(c => c.trim()),
    });
  }, [title, description, pros, cons, onSave]);

  const isValid = title.trim().length >= 2;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Option {optionNumber}</Text>

      <TextField
        label="Option name *"
        value={title}
        onChangeText={setTitle}
        placeholder="e.g., Accept the job offer"
      />

      <TextArea
        label="Description (optional)"
        value={description}
        onChangeText={setDescription}
        placeholder="Any details about this option..."
        numberOfLines={2}
      />

      <TextArea
        label="Pros — one per line"
        value={pros}
        onChangeText={setPros}
        placeholder="Higher salary&#10;Better location&#10;Growth opportunities"
        numberOfLines={3}
      />

      <TextArea
        label="Cons — one per line"
        value={cons}
        onChangeText={setCons}
        placeholder="Longer commute&#10;More responsibility&#10;Unknown team"
        numberOfLines={3}
      />

      <View style={styles.actions}>
        <Button
          title="Cancel"
          variant="ghost"
          onPress={onCancel}
        />
        <Button
          title={existingOption ? 'Update' : 'Add Option'}
          variant="primary"
          onPress={handleSave}
          disabled={!isValid}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  header: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
