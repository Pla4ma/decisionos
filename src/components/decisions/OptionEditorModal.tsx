// OptionEditorModal — Modal for adding/editing decision options
import { View, Text, StyleSheet, ScrollView, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { DecisionOptionEditor } from './DecisionOptionEditor';
import { CreateOptionInput } from '@/features/decisions/decisionTypes';

interface OptionEditorModalProps {
  visible: boolean;
  editingIndex: number | null;
  options: CreateOptionInput[];
  onSave: (option: CreateOptionInput) => void;
  onCancel: () => void;
}

export function OptionEditorModal({
  visible,
  editingIndex,
  options,
  onSave,
  onCancel,
}: OptionEditorModalProps): JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onCancel}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Button title="Cancel" variant="ghost" onPress={onCancel} />
          <Text style={styles.title}>{editingIndex !== null ? 'Edit Option' : 'New Option'}</Text>
          <View style={styles.spacer} />
        </View>
        <ScrollView style={styles.content}>
          <DecisionOptionEditor
            onSave={onSave}
            onCancel={onCancel}
            existingOption={editingIndex !== null ? options[editingIndex] : undefined}
            optionNumber={editingIndex !== null ? editingIndex + 1 : options.length + 1}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  title: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.text.primary },
  spacer: { width: 60 },
  content: { flex: 1, padding: spacing.lg },
});
