import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { useCreateDecision } from '@/features/decisions/useCreateDecision';

interface QuickDecisionFormProps {
  onSwitchToFull: () => void;
  onCancel: () => void;
  initialTitle?: string;
}

export function QuickDecisionForm({ onSwitchToFull, onCancel, initialTitle }: QuickDecisionFormProps): JSX.Element {
  const { submitDecision, isSubmitting } = useCreateDecision();
  const [quickTitle, setQuickTitle] = useState(initialTitle || '');
  const [quickOptionA, setQuickOptionA] = useState('');
  const [quickOptionB, setQuickOptionB] = useState('');
  const [quickPriorities, setQuickPriorities] = useState('');
  const [quickWorries, setQuickWorries] = useState('');

  const handleQuickSubmit = useCallback(async () => {
    if (!quickTitle.trim() || !quickOptionA.trim() || !quickOptionB.trim()) return;

    const quickContext = [
      quickPriorities.trim() && `What matters most: ${quickPriorities.trim()}`,
      quickWorries.trim() && `Biggest worry: ${quickWorries.trim()}`,
    ].filter(Boolean).join('\n');

    try {
      await submitDecision({
        title: quickTitle.trim(),
        category: 'other',
        context: quickContext || 'Quick decision',
        desiredOutcome: quickPriorities.trim() || '',
        biggestFear: quickWorries.trim() || '',
        inactionOutcome: '',
        importance: 5,
        urgency: 5,
        options: [
          { title: quickOptionA.trim(), pros: [], cons: [] },
          { title: quickOptionB.trim(), pros: [], cons: [] },
        ],
        answers: { quick_mode: 'true' },
        skip_questions: true,
      });
    } catch {}
  }, [quickTitle, quickOptionA, quickOptionB, quickPriorities, quickWorries, submitDecision]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button title="Cancel" variant="ghost" size="small" onPress={onCancel} />
        <Text style={styles.headerTitle}>Quick Decision</Text>
        <Button
          title="Create"
          variant="primary"
          size="small"
          onPress={handleQuickSubmit}
          disabled={!quickTitle.trim() || !quickOptionA.trim() || !quickOptionB.trim() || isSubmitting}
        />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: spacing.lg }}>
        <Card variant="outlined" style={styles.quickTipCard}>
          <Text style={styles.quickTipTitle}>2-Minute Decision</Text>
          <Text style={styles.quickTipText}>Just name your decision and two options. We will handle the rest.</Text>
        </Card>

        <TextField
          label="What decision are you facing?"
          value={quickTitle}
          onChangeText={setQuickTitle}
          placeholder="e.g., Should I take the new job?"
          maxLength={200}
        />

        <View style={styles.quickOptionsRow}>
          <View style={styles.quickOptionCol}>
            <Text style={styles.quickOptionLabel}>Option A</Text>
            <TextField
              label=""
              value={quickOptionA}
              onChangeText={setQuickOptionA}
              placeholder="e.g., Accept the offer"
              maxLength={100}
            />
          </View>
          <View style={styles.quickOptionCol}>
            <Text style={styles.quickOptionLabel}>Option B</Text>
            <TextField
              label=""
              value={quickOptionB}
              onChangeText={setQuickOptionB}
              placeholder="e.g., Stay and negotiate"
              maxLength={100}
            />
          </View>
        </View>

        <TextField
          label="What matters most in this decision?"
          value={quickPriorities}
          onChangeText={setQuickPriorities}
          placeholder="e.g., Stability, growth, location, family"
          maxLength={200}
        />

        <TextField
          label="What are you most worried about?"
          value={quickWorries}
          onChangeText={setQuickWorries}
          placeholder="e.g., Making a mistake I cannot undo"
          maxLength={200}
        />

        <Text style={styles.quickHelper}>
          Need a deeper analysis?{' '}
          <Text style={styles.quickHelperLink} onPress={onSwitchToFull}>
            Switch to Full Mode
          </Text>
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitle: { fontSize: typography.size.lg, fontWeight: '600', color: colors.text.primary },
  scroll: { flex: 1 },
  quickTipCard: { marginBottom: spacing.lg, borderColor: colors.accent.primary + '40' },
  quickTipTitle: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.xs },
  quickTipText: { fontSize: typography.size.sm, color: colors.text.secondary, lineHeight: 18 },
  quickOptionsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  quickOptionCol: { flex: 1 },
  quickOptionLabel: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.secondary, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  quickHelper: { fontSize: typography.size.sm, color: colors.text.tertiary, marginTop: spacing.lg, textAlign: 'center' },
  quickHelperLink: { color: colors.accent.primary, fontWeight: '600' },
});
