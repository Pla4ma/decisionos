// ReflectionModal — Modal for weekly check-ins
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { ReflectionFeeling } from '@/features/decisions/reflectionTypes';

interface ReflectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (feeling: ReflectionFeeling) => void;
}

const feelings: ReflectionFeeling[] = ['confident', 'uncertain', 'regretful', 'relieved', 'anxious', 'neutral'];

export function ReflectionModal({ visible, onClose, onSubmit }: ReflectionModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Weekly Check-In</Text>
          <Text style={styles.subtitle}>How are you feeling about your choice?</Text>
          <View style={styles.feelingsGrid}>
            {feelings.map(feeling => (
              <TouchableOpacity key={feeling} style={styles.feelingBtn} onPress={() => onSubmit(feeling)}>
                <Text style={styles.feelingText}>{feeling}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button title="Close" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.lg },
  content: { backgroundColor: colors.background.primary, padding: spacing.xl, borderRadius: 16 },
  title: { fontSize: typography.size.lg, fontWeight: '700', marginBottom: spacing.xs },
  subtitle: { fontSize: typography.size.sm, color: colors.text.secondary, marginBottom: spacing.lg },
  feelingsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  feelingBtn: { padding: spacing.sm, backgroundColor: colors.background.secondary, borderRadius: 8 },
  feelingText: { textTransform: 'capitalize' },
});
