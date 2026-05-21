import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { DecisionCategory } from '@/features/decisions/decisionTypes';
import { DECISION_RULES, CATEGORY_LABELS } from '@/features/decisions/decisionRules';
import { useCreateDecision } from '@/features/decisions/useCreateDecision';

interface QuickDecisionFormProps {
  onSwitchToFull: () => void;
  onCancel: () => void;
  initialTitle?: string;
}

const CATEGORIES: { key: DecisionCategory; label: string }[] = [
  { key: 'career', label: 'Career' },
  { key: 'money', label: 'Money' },
  { key: 'school', label: 'School' },
  { key: 'moving', label: 'Moving' },
  { key: 'business', label: 'Business' },
  { key: 'personal_goals', label: 'Personal' },
  { key: 'other', label: 'Other' },
];

const URGENCY_OPTIONS = [
  { value: 3, label: 'Low', desc: 'No rush — can wait' },
  { value: 5, label: 'Medium', desc: 'Soon but not critical' },
  { value: 8, label: 'High', desc: 'Time-sensitive' },
];

export function QuickDecisionForm({ onSwitchToFull, onCancel, initialTitle }: QuickDecisionFormProps): JSX.Element {
  const { submitDecision, isSubmitting } = useCreateDecision();
  const [quickTitle, setQuickTitle] = useState(initialTitle || '');
  const [quickOptionA, setQuickOptionA] = useState('');
  const [quickOptionB, setQuickOptionB] = useState('');
  const [category, setCategory] = useState<DecisionCategory | null>(null);
  const [urgency, setUrgency] = useState(5);
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
        title: quickTitle.trim().slice(0, DECISION_RULES.MAX_TITLE_LENGTH),
        category: category || 'other',
        context: quickContext || 'Quick decision',
        desiredOutcome: quickPriorities.trim() || '',
        biggestFear: quickWorries.trim() || '',
        inactionOutcome: '',
        importance: 5,
        urgency,
        options: [
          {
            title: quickOptionA.trim().slice(0, DECISION_RULES.MAX_OPTION_TITLE_LENGTH),
            pros: [], cons: [],
          },
          {
            title: quickOptionB.trim().slice(0, DECISION_RULES.MAX_OPTION_TITLE_LENGTH),
            pros: [], cons: [],
          },
        ],
        answers: { quick_mode: 'true' },
        skip_questions: true,
      });
    } catch (err) {
      Alert.alert('Save failed', err instanceof Error ? err.message : 'Could not save your decision. Please try again.');
    }
  }, [quickTitle, quickOptionA, quickOptionB, category, urgency, quickPriorities, quickWorries, submitDecision]);

  const isValid = quickTitle.trim().length >= DECISION_RULES.MIN_TITLE_LENGTH &&
    quickOptionA.trim().length >= DECISION_RULES.MIN_OPTION_TITLE_LENGTH &&
    quickOptionB.trim().length >= DECISION_RULES.MIN_OPTION_TITLE_LENGTH;

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
          disabled={!isValid || isSubmitting}
        />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: spacing.lg }}>
        <Card variant="outlined" style={styles.quickTipCard}>
          <Text style={styles.quickTipTitle}>2-Minute Decision</Text>
          <Text style={styles.quickTipText}>
            Name your decision, pick two options, and we'll handle the rest. Optional fields help the AI give better insight.
          </Text>
        </Card>

        <TextField
          label="What decision are you facing?"
          value={quickTitle}
          onChangeText={setQuickTitle}
          placeholder="Should I...?"
          maxLength={DECISION_RULES.MAX_TITLE_LENGTH}
        />

        <Text style={styles.sectionLabel}>Category (optional)</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat.key}
              style={[styles.categoryChip, category === cat.key && styles.categoryChipActive]}
              onPress={() => setCategory(cat.key)}
            >
              <Text style={[styles.categoryLabel, category === cat.key && styles.categoryLabelActive]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Urgency</Text>
        <View style={styles.urgencyRow}>
          {URGENCY_OPTIONS.map(opt => (
            <Pressable
              key={opt.value}
              style={[styles.urgencyBtn, urgency === opt.value && styles.urgencyBtnActive]}
              onPress={() => setUrgency(opt.value)}
            >
              <Text style={[styles.urgencyLabel, urgency === opt.value && styles.urgencyLabelActive]}>
                {opt.label}
              </Text>
              <Text style={styles.urgencyDesc}>{opt.desc}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.quickOptionsRow}>
          <View style={styles.quickOptionCol}>
            <Text style={styles.quickOptionLabel}>Option A</Text>
            <TextField
              label=""
              value={quickOptionA}
              onChangeText={setQuickOptionA}
              placeholder="e.g., Accept offer"
              maxLength={DECISION_RULES.MAX_OPTION_TITLE_LENGTH}
            />
          </View>
          <View style={styles.quickOptionCol}>
            <Text style={styles.quickOptionLabel}>Option B</Text>
            <TextField
              label=""
              value={quickOptionB}
              onChangeText={setQuickOptionB}
              placeholder="e.g., Stay & negotiate"
              maxLength={DECISION_RULES.MAX_OPTION_TITLE_LENGTH}
            />
          </View>
        </View>

        <TextField
          label="What matters most (optional)"
          value={quickPriorities}
          onChangeText={setQuickPriorities}
          placeholder="e.g., Stability, growth, family"
          maxLength={200}
        />

        <TextField
          label="What worries you? (optional)"
          value={quickWorries}
          onChangeText={setQuickWorries}
          placeholder="e.g., Making a mistake"
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
  sectionLabel: { fontSize: typography.size.xs, fontWeight: '700', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm, marginTop: spacing.md },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  categoryChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20, backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.border.primary },
  categoryChipActive: { backgroundColor: colors.accent.muted, borderColor: colors.accent.primary },
  categoryLabel: { fontSize: typography.size.xs, color: colors.text.secondary, fontWeight: '500' },
  categoryLabelActive: { color: colors.accent.primary, fontWeight: '600' },
  urgencyRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  urgencyBtn: { flex: 1, padding: spacing.md, borderRadius: 10, backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.border.primary, alignItems: 'center' },
  urgencyBtnActive: { borderColor: colors.accent.primary, backgroundColor: colors.accent.muted },
  urgencyLabel: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.secondary },
  urgencyLabelActive: { color: colors.accent.primary },
  urgencyDesc: { fontSize: 9, color: colors.text.disabled, marginTop: 2 },
  quickOptionsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  quickOptionCol: { flex: 1 },
  quickOptionLabel: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.secondary, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  quickHelper: { fontSize: typography.size.sm, color: colors.text.tertiary, marginTop: spacing.lg, textAlign: 'center' },
  quickHelperLink: { color: colors.accent.primary, fontWeight: '600' },
});
