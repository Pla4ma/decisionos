import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';

interface DailyClarityPracticeProps {
  prompt: { title: string; prompt: string; context: string | null; estimated_minutes: number } | null;
  streakCount: number;
  isCompleted: boolean;
  onComplete: (response: string, reflection?: string) => void;
  onSkip: () => void;
  isSubmitting: boolean;
}

export function DailyClarityPractice({ prompt, streakCount, isCompleted, onComplete, onSkip, isSubmitting }: DailyClarityPracticeProps): JSX.Element | null {
  const [response, setResponse] = useState('');
  const [reflection, setReflection] = useState('');
  const [showReflection, setShowReflection] = useState(false);

  if (!prompt) return null;
  if (isCompleted) return null;

  const handleSubmit = () => {
    if (!response.trim()) return;
    if (showReflection) {
      onComplete(response, reflection);
    } else {
      setShowReflection(true);
    }
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>🌅 Daily Clarity</Text>
          {streakCount > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>{streakCount} day streak</Text>
            </View>
          )}
        </View>
        <Text style={styles.timer}>{prompt.estimated_minutes} min</Text>
      </View>

      <Text style={styles.title}>{prompt.title}</Text>
      <Text style={styles.prompt}>{prompt.prompt}</Text>

      {prompt.context && (
        <View style={styles.contextBox}>
          <Text style={styles.contextIcon}>💡</Text>
          <Text style={styles.contextText}>{prompt.context}</Text>
        </View>
      )}

      {!showReflection ? (
        <>
          <TextInput
            style={styles.input}
            value={response}
            onChangeText={setResponse}
            placeholder="Write freely — no structure needed..."
            placeholderTextColor={colors.text.disabled}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.submitBtn, !response.trim() && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.7}
            disabled={!response.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Continue</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.doneBanner}>
            <Text style={styles.doneIcon}>✓</Text>
            <Text style={styles.doneText}>Written. Now take it a step deeper.</Text>
          </View>
          <TextInput
            style={styles.input}
            value={reflection}
            onChangeText={setReflection}
            placeholder="What is one insight from what you wrote?"
            placeholderTextColor={colors.text.disabled}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.submitBtn, !reflection.trim() && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.7}
            disabled={!reflection.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Complete practice</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipBtn} onPress={onSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip this one</Text>
          </TouchableOpacity>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, marginBottom: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  badge: { fontSize: typography.size.xs, fontWeight: '700', color: colors.status.info, textTransform: 'uppercase', letterSpacing: 1 },
  streakBadge: { backgroundColor: colors.accent.muted, borderRadius: 9999, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  streakText: { fontSize: 10, fontWeight: '600', color: colors.accent.primary },
  timer: { fontSize: typography.size.xs, color: colors.text.tertiary },
  title: { fontSize: typography.size.lg, fontWeight: '700', color: colors.text.primary, marginBottom: spacing.sm },
  prompt: { fontSize: typography.size.md, color: colors.text.secondary, lineHeight: 24, marginBottom: spacing.md },
  contextBox: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.background.tertiary, borderRadius: 10, padding: spacing.md, marginBottom: spacing.md },
  contextIcon: { fontSize: 16 },
  contextText: { flex: 1, fontSize: typography.size.sm, color: colors.text.tertiary, fontStyle: 'italic', lineHeight: 20 },
  input: { backgroundColor: colors.background.tertiary, borderRadius: 12, padding: spacing.md, minHeight: 100, fontSize: typography.size.md, color: colors.text.primary, borderWidth: 1, borderColor: colors.border.primary, marginBottom: spacing.md },
  submitBtn: { backgroundColor: colors.accent.primary, borderRadius: 12, padding: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.inverse },
  doneBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.status.success + '15', borderRadius: 10, padding: spacing.md, marginBottom: spacing.md },
  doneIcon: { fontSize: 16, color: colors.status.success, fontWeight: '700' },
  doneText: { fontSize: typography.size.sm, color: colors.status.success, fontWeight: '500' },
  skipBtn: { alignItems: 'center', padding: spacing.sm },
  skipText: { fontSize: typography.size.sm, color: colors.text.tertiary },
});