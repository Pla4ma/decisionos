import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PRACTICE_TYPES_CONFIG, PracticePrompt } from '@/features/engagement/dailyClarityPracticeTypes';

interface DailyClarityPracticeProps {
  prompt: PracticePrompt;
  streakCount: number;
  isCompleted: boolean;
  onComplete: (response: string, reflection?: string) => void;
  onSkip: () => void;
  isSubmitting: boolean;
}

export function DailyClarityPractice({ prompt, streakCount, isCompleted, onComplete, onSkip, isSubmitting }: DailyClarityPracticeProps) {
  const [response, setResponse] = useState('');
  const [reflection, setReflection] = useState('');
  const [step, setStep] = useState<'prompt' | 'write' | 'reflect' | 'done'>('prompt');

  const config = PRACTICE_TYPES_CONFIG[prompt.type];

  if (isCompleted || step === 'done') {
    return (
      <Card variant="elevated" style={styles.completedCard}>
        <Text style={styles.completedIcon}>✓</Text>
        <Text style={styles.completedTitle}>Today's Practice Complete</Text>
        {streakCount > 0 && (
          <Text style={styles.streakText}>{streakCount} day streak</Text>
        )}
      </Card>
    );
  }

  if (step === 'write') {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Card variant="elevated" style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.typeLabel}>{config.icon} {config.label}</Text>
            <Text style={styles.timer}>{prompt.estimated_minutes} min</Text>
          </View>
          <Text style={styles.prompt}>{prompt.prompt}</Text>
          {prompt.context && (
            <Text style={styles.context}>{prompt.context}</Text>
          )}
          <TextInput
            style={styles.input}
            value={response}
            onChangeText={setResponse}
            placeholder="Write freely..."
            placeholderTextColor={colors.text.disabled}
            multiline
            autoFocus
          />
          <View style={styles.actions}>
            <Button
              title="Continue"
              variant="primary"
              onPress={() => setStep('reflect')}
              disabled={response.trim().length < 10}
            />
            <Button title="Skip" variant="ghost" onPress={onSkip} />
          </View>
        </Card>
      </KeyboardAvoidingView>
    );
  }

  if (step === 'reflect') {
    return (
      <Card variant="elevated" style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.typeLabel}>💭 One insight</Text>
          <Text style={styles.timer}>Optional</Text>
        </View>
        <Text style={styles.prompt}>What's one thing this exercise showed you?</Text>
        <TextInput
          style={styles.input}
          value={reflection}
          onChangeText={setReflection}
          placeholder="Optional insight..."
          placeholderTextColor={colors.text.disabled}
          multiline
        />
        <View style={styles.actions}>
          <Button
            title="Complete Practice"
            variant="primary"
            onPress={() => {
              onComplete(response, reflection || undefined);
              setStep('done');
            }}
            disabled={isSubmitting}
          />
        </View>
      </Card>
    );
  }

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.typeLabel}>{config.icon} {config.label}</Text>
        <Text style={styles.timer}>{prompt.estimated_minutes} min</Text>
      </View>
      <Text style={styles.title}>{prompt.title}</Text>
      <Text style={styles.prompt}>{prompt.prompt}</Text>
      {prompt.context && (
        <Text style={styles.context}>{prompt.context}</Text>
      )}
      <View style={styles.actions}>
        <Button
          title="Start Writing"
          variant="primary"
          onPress={() => setStep('write')}
        />
        <Button title="Skip" variant="ghost" onPress={onSkip} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  completedCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.status.success + '10',
    alignItems: 'center', padding: spacing.xl,
  },
  completedIcon: { fontSize: 32, color: colors.status.success, marginBottom: spacing.sm },
  completedTitle: { fontSize: typography.size.lg, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.xs },
  streakText: { fontSize: typography.size.sm, color: colors.accent.primary, fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  typeLabel: { fontSize: typography.size.sm, fontWeight: '600', color: colors.accent.secondary },
  timer: { fontSize: typography.size.xs, color: colors.text.tertiary },
  title: { fontSize: typography.size.xl, fontWeight: '700', color: colors.text.primary, marginBottom: spacing.sm, lineHeight: 30 },
  prompt: { fontSize: typography.size.md, color: colors.text.primary, lineHeight: 24, marginBottom: spacing.md },
  context: { fontSize: typography.size.sm, color: colors.text.tertiary, fontStyle: 'italic', lineHeight: 20, marginBottom: spacing.md, backgroundColor: colors.background.tertiary, padding: spacing.md, borderRadius: 8 },
  input: { backgroundColor: colors.background.tertiary, borderRadius: 8, padding: spacing.md, color: colors.text.primary, fontSize: typography.size.md, lineHeight: 22, minHeight: 120, textAlignVertical: 'top', marginBottom: spacing.md },
  actions: { gap: spacing.sm },
});
