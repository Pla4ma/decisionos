import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { DecisionCategory } from '@/features/decisions/decisionTypes';

interface FullDecisionWizardProps {
  onCancel: () => void;
  templateId?: string;
}

interface OptionInput {
  title: string;
  description: string;
  pros: string[];
  cons: string[];
}

const CATEGORIES: { key: DecisionCategory; label: string; icon: string }[] = [
  { key: 'career', label: 'Career', icon: '💼' },
  { key: 'school', label: 'School', icon: '🎓' },
  { key: 'money', label: 'Money', icon: '💰' },
  { key: 'moving', label: 'Moving', icon: '🏠' },
  { key: 'business', label: 'Business', icon: '🚀' },
  { key: 'personal_goals', label: 'Personal', icon: '🎯' },
  { key: 'other', label: 'Other', icon: '📌' },
];

const GUIDED_QUESTIONS = [
  { key: 'desired_outcome', question: 'What outcome do you want from this decision?', hint: 'Describe the ideal result, not the path to get there.' },
  { key: 'biggest_fear', question: 'What is your biggest fear about this decision?', hint: 'Naming the fear reduces its power over you.' },
  { key: 'inaction_cost', question: 'What happens if you do nothing?', hint: 'Indecision is itself a decision with consequences.' },
  { key: 'advice', question: 'What would you tell a friend in this situation?', hint: 'Psychological distance reduces bias.' },
  { key: 'values', question: 'Which of your values does this decision touch?', hint: 'Stability, growth, freedom, family, health, etc.' },
];

export function FullDecisionWizard({ onCancel, templateId }: FullDecisionWizardProps): JSX.Element {
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [category, setCategory] = useState<DecisionCategory | null>(null);
  const [importance, setImportance] = useState(5);
  const [urgency, setUrgency] = useState(5);
  const [options, setOptions] = useState<OptionInput[]>([
    { title: '', description: '', pros: [], cons: [] },
    { title: '', description: '', pros: [], cons: [] },
  ]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateOption = (index: number, updates: Partial<OptionInput>) => {
    setOptions(prev => prev.map((opt, i) => i === index ? { ...opt, ...updates } : opt));
  };

  const addOption = () => {
    if (options.length >= 5) return;
    setOptions(prev => [...prev, { title: '', description: '', pros: [], cons: [] }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  const setAnswer = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const isComplete = title.trim().length >= 3 && options.every(o => o.title.trim().length >= 2);

  const handleSave = useCallback(async () => {
    if (!isComplete) return;
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 500));
    setIsSaving(false);
  }, [isComplete]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backBtn}>
          <Text style={styles.backText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Decision</Text>
        <View style={styles.backBtn} />
      </View>

      <Card variant="elevated" style={styles.section}>
        <Text style={styles.sectionLabel}>What are you deciding?</Text>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Should I...?"
          placeholderTextColor={colors.text.disabled}
          autoFocus
        />
        <TextInput
          style={styles.contextInput}
          value={context}
          onChangeText={setContext}
          placeholder="Give some context — what led to this decision?"
          placeholderTextColor={colors.text.disabled}
          multiline
          textAlignVertical="top"
        />
      </Card>

      <View style={styles.categoryRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.categoryChip, category === cat.key && styles.categoryChipActive]}
            onPress={() => setCategory(cat.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text style={[styles.categoryLabel, category === cat.key && styles.categoryLabelActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.slidersRow}>
        <View style={styles.sliderGroup}>
          <Text style={styles.sliderLabel}>Importance: {importance}</Text>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${importance * 10}%`, backgroundColor: importance > 7 ? colors.status.error : importance > 4 ? colors.status.warning : colors.status.success }]} />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderEndText}>Trivial</Text>
            <Text style={styles.sliderEndText}>Life-changing</Text>
          </View>
        </View>
        <View style={styles.sliderGroup}>
          <Text style={styles.sliderLabel}>Urgency: {urgency}</Text>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${urgency * 10}%`, backgroundColor: urgency > 7 ? colors.status.error : urgency > 4 ? colors.status.warning : colors.status.success }]} />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderEndText}>No rush</Text>
            <Text style={styles.sliderEndText}>Time-sensitive</Text>
          </View>
        </View>
        <View style={styles.sliderButtons}>
          <View style={styles.sliderBtnGroup}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.sliderDot, importance === n && styles.sliderDotActive]}
                onPress={() => setImportance(n)}
              />
            ))}
          </View>
          <View style={styles.sliderBtnGroup}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.sliderDot, urgency === n && styles.sliderDotActive]}
                onPress={() => setUrgency(n)}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Options</Text>
        <TouchableOpacity onPress={addOption} style={styles.addOptionBtn} disabled={options.length >= 5}>
          <Text style={styles.addOptionText}>+ Add option</Text>
        </TouchableOpacity>
      </View>

      {options.map((option, index) => (
        <Card key={index} variant="elevated" style={styles.optionCard}>
          <View style={styles.optionHeader}>
            <Text style={styles.optionNumber}>Option {index + 1}</Text>
            {options.length > 2 && (
              <TouchableOpacity onPress={() => removeOption(index)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={styles.optionTitleInput}
            value={option.title}
            onChangeText={(t) => updateOption(index, { title: t })}
            placeholder="e.g. Stay at current job"
            placeholderTextColor={colors.text.disabled}
          />
          <TextInput
            style={styles.optionDetailInput}
            value={option.description}
            onChangeText={(d) => updateOption(index, { description: d })}
            placeholder="Brief description of this option..."
            placeholderTextColor={colors.text.disabled}
            multiline
          />
          <View style={styles.prosConsRow}>
            <View style={styles.prosColumn}>
              <Text style={styles.prosConsLabel}>Pros</Text>
              {option.pros.map((pro, pi) => (
                <View key={pi} style={styles.bulletRow}>
                  <Text style={styles.bulletIcon}>+</Text>
                  <TextInput
                    style={styles.bulletInput}
                    value={pro}
                    onChangeText={(t) => {
                      const newPros = [...option.pros];
                      newPros[pi] = t;
                      updateOption(index, { pros: newPros });
                    }}
                    placeholder="Add pro..."
                    placeholderTextColor={colors.text.disabled}
                  />
                </View>
              ))}
              <TouchableOpacity
                style={styles.addBulletBtn}
                onPress={() => updateOption(index, { pros: [...option.pros, ''] })}
              >
                <Text style={styles.addBulletText}>+ Add pro</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.consColumn}>
              <Text style={styles.prosConsLabel}>Cons</Text>
              {option.cons.map((con, ci) => (
                <View key={ci} style={styles.bulletRow}>
                  <Text style={[styles.bulletIcon, { color: colors.status.error }]}>-</Text>
                  <TextInput
                    style={styles.bulletInput}
                    value={con}
                    onChangeText={(t) => {
                      const newCons = [...option.cons];
                      newCons[ci] = t;
                      updateOption(index, { cons: newCons });
                    }}
                    placeholder="Add con..."
                    placeholderTextColor={colors.text.disabled}
                  />
                </View>
              ))}
              <TouchableOpacity
                style={styles.addBulletBtn}
                onPress={() => updateOption(index, { cons: [...option.cons, ''] })}
              >
                <Text style={styles.addBulletText}>+ Add con</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      ))}

      <TouchableOpacity
        style={styles.advancedToggle}
        onPress={() => setShowAdvanced(!showAdvanced)}
        activeOpacity={0.7}
      >
        <Text style={styles.advancedToggleText}>
          {showAdvanced ? '− Hide guided questions' : '+ Answer guided questions (optional)'}
        </Text>
      </TouchableOpacity>

      {showAdvanced && (
        <Card variant="elevated" style={styles.questionsCard}>
          <Text style={styles.questionsTitle}>Guided Questions</Text>
          <Text style={styles.questionsSubtitle}>
            These help the AI give you better analysis. Answer what feels relevant.
          </Text>
          {GUIDED_QUESTIONS.map(q => (
            <View key={q.key} style={styles.questionBlock}>
              <Text style={styles.questionText}>{q.question}</Text>
              <Text style={styles.questionHint}>{q.hint}</Text>
              <TextInput
                style={styles.questionInput}
                value={answers[q.key] || ''}
                onChangeText={(t) => setAnswer(q.key, t)}
                placeholder="Write your thoughts..."
                placeholderTextColor={colors.text.disabled}
                multiline
                textAlignVertical="top"
              />
            </View>
          ))}
        </Card>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, !isComplete && styles.saveBtnDisabled]}
          onPress={handleSave}
          activeOpacity={0.7}
          disabled={!isComplete || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Save & Analyze</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelFooterBtn} onPress={onCancel} activeOpacity={0.7}>
          <Text style={styles.cancelFooterText}>Discard</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: 120 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.lg, paddingHorizontal: spacing.sm,
  },
  backBtn: { minWidth: 60 },
  backText: { fontSize: typography.size.md, color: colors.accent.primary, fontWeight: '500' },
  headerTitle: { fontSize: typography.size.lg, fontWeight: '700', color: colors.text.primary },
  section: { padding: spacing.lg, marginBottom: spacing.md },
  sectionLabel: { fontSize: typography.size.xs, fontWeight: '700', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  titleInput: { fontSize: typography.size.xl, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.md, padding: 0 },
  contextInput: { fontSize: typography.size.md, color: colors.text.secondary, minHeight: 80, padding: 0, lineHeight: 22 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.background.secondary, borderRadius: 9999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border.primary },
  categoryChipActive: { backgroundColor: colors.accent.muted, borderColor: colors.accent.primary },
  categoryIcon: { fontSize: 14 },
  categoryLabel: { fontSize: typography.size.xs, color: colors.text.secondary, fontWeight: '500' },
  categoryLabelActive: { color: colors.accent.primary },
  slidersRow: { marginBottom: spacing.lg },
  sliderGroup: { marginBottom: spacing.sm },
  sliderLabel: { fontSize: typography.size.xs, color: colors.text.secondary, marginBottom: spacing.xs },
  sliderTrack: { height: 4, backgroundColor: colors.background.tertiary, borderRadius: 2, overflow: 'hidden' },
  sliderFill: { height: '100%', borderRadius: 2 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  sliderEndText: { fontSize: 10, color: colors.text.disabled },
  sliderButtons: { gap: spacing.xs, marginTop: spacing.sm },
  sliderBtnGroup: { flexDirection: 'row', gap: spacing.xs, justifyContent: 'center' },
  sliderDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.background.tertiary, borderWidth: 1, borderColor: colors.border.primary },
  sliderDotActive: { backgroundColor: colors.accent.primary, borderColor: colors.accent.primary },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.size.sm, fontWeight: '700', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 1 },
  addOptionBtn: {},
  addOptionText: { fontSize: typography.size.sm, color: colors.accent.primary, fontWeight: '600' },
  optionCard: { padding: spacing.md, marginBottom: spacing.md },
  optionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  optionNumber: { fontSize: typography.size.sm, fontWeight: '700', color: colors.accent.secondary },
  removeText: { fontSize: typography.size.xs, color: colors.status.error },
  optionTitleInput: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.sm, padding: 0 },
  optionDetailInput: { fontSize: typography.size.sm, color: colors.text.secondary, minHeight: 40, marginBottom: spacing.md, padding: 0 },
  prosConsRow: { flexDirection: 'row', gap: spacing.md },
  prosColumn: { flex: 1 },
  consColumn: { flex: 1 },
  prosConsLabel: { fontSize: typography.size.xs, fontWeight: '700', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 2 },
  bulletIcon: { fontSize: typography.size.sm, color: colors.status.success, fontWeight: '700', width: 14 },
  bulletInput: { flex: 1, fontSize: typography.size.sm, color: colors.text.secondary, padding: 2, margin: 0, minHeight: 20, borderBottomWidth: 1, borderBottomColor: colors.border.secondary },
  addBulletBtn: { marginTop: spacing.xs },
  addBulletText: { fontSize: typography.size.xs, color: colors.accent.primary },
  advancedToggle: { alignItems: 'center', padding: spacing.md, marginBottom: spacing.md },
  advancedToggleText: { fontSize: typography.size.sm, color: colors.accent.primary, fontWeight: '500' },
  questionsCard: { padding: spacing.lg, marginBottom: spacing.lg },
  questionsTitle: { fontSize: typography.size.md, fontWeight: '700', color: colors.text.primary, marginBottom: spacing.xs },
  questionsSubtitle: { fontSize: typography.size.xs, color: colors.text.tertiary, marginBottom: spacing.lg, lineHeight: 16 },
  questionBlock: { marginBottom: spacing.lg },
  questionText: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.xs },
  questionHint: { fontSize: typography.size.xs, color: colors.text.tertiary, fontStyle: 'italic', marginBottom: spacing.sm },
  questionInput: { backgroundColor: colors.background.tertiary, borderRadius: 10, padding: spacing.md, fontSize: typography.size.sm, color: colors.text.primary, minHeight: 60, borderWidth: 1, borderColor: colors.border.primary },
  footer: { gap: spacing.sm, paddingTop: spacing.md },
  saveBtn: { backgroundColor: colors.accent.primary, borderRadius: 12, padding: spacing.md, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.inverse },
  cancelFooterBtn: { alignItems: 'center', padding: spacing.sm },
  cancelFooterText: { fontSize: typography.size.sm, color: colors.text.tertiary },
});