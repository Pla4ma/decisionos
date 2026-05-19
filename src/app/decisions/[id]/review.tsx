import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { ROUTES } from '@/config/routes';

export default function ReviewScreen(): JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [wouldChooseSame, setWouldChooseSame] = useState<boolean | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [lessons, setLessons] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (satisfaction === null || wouldChooseSame === null) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    setIsSubmitting(false);
    router.push(ROUTES.HOME);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" style={styles.introCard}>
          <Text style={styles.introIcon}>📋</Text>
          <Text style={styles.introTitle}>How did it go?</Text>
          <Text style={styles.introText}>
            Closing the loop on your decision. Every review makes your next decision better.
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>Satisfaction</Text>
        <View style={styles.emojiRow}>
          {[1, 2, 3, 4, 5].map(n => (
            <TouchableOpacity
              key={n}
              style={[styles.emojiBtn, satisfaction === n && styles.emojiActive]}
              onPress={() => setSatisfaction(n)}
              activeOpacity={0.7}
            >
              <Text style={styles.emoji}>{['😞', '😕', '😐', '😊', '😄'][n - 1]}</Text>
              <Text style={[styles.emojiLabel, satisfaction === n && styles.emojiLabelActive]}>
                {['Regret', 'Meh', 'Okay', 'Good', 'Great'][n - 1]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Would you choose the same again?</Text>
        <View style={styles.binaryRow}>
          <TouchableOpacity
            style={[styles.binaryBtn, wouldChooseSame === true && styles.binaryActive]}
            onPress={() => setWouldChooseSame(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.binaryIcon, wouldChooseSame === true && styles.binaryIconActive]}>✓</Text>
            <Text style={[styles.binaryLabel, wouldChooseSame === true && styles.binaryLabelActive]}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.binaryBtn, wouldChooseSame === false && styles.binaryActiveNo]}
            onPress={() => setWouldChooseSame(false)}
            activeOpacity={0.7}
          >
            <Text style={[styles.binaryIcon, wouldChooseSame === false && styles.binaryIconActiveNo]}>✕</Text>
            <Text style={[styles.binaryLabel, wouldChooseSame === false && styles.binaryLabelActive]}>No</Text>
          </TouchableOpacity>
        </View>

        <Card variant="elevated" style={styles.notesCard}>
          <Text style={styles.notesLabel}>What actually happened?</Text>
          <TextInput
            style={styles.notesInput}
            value={outcomeNotes}
            onChangeText={setOutcomeNotes}
            placeholder="Describe the outcome — what happened after you chose?"
            placeholderTextColor={colors.text.disabled}
            multiline
            textAlignVertical="top"
          />
        </Card>

        <Card variant="elevated" style={styles.notesCard}>
          <Text style={styles.notesLabel}>Lessons learned</Text>
          <TextInput
            style={styles.notesInput}
            value={lessons}
            onChangeText={setLessons}
            placeholder="What would you do differently? What did you learn?"
            placeholderTextColor={colors.text.disabled}
            multiline
            textAlignVertical="top"
          />
        </Card>

        {satisfaction !== null && wouldChooseSame !== null && (
          <Card variant="elevated" style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Review Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Satisfaction:</Text>
              <Text style={styles.summaryValue}>{['😞 Regret', '😕 Meh', '😐 Okay', '😊 Good', '😄 Great'][satisfaction - 1]}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Choose again?</Text>
              <Text style={styles.summaryValue}>{wouldChooseSame ? '✓ Yes' : '✕ No'}</Text>
            </View>
          </Card>
        )}

        <View style={styles.actions}>
          <Button
            title={isSubmitting ? 'Saving...' : 'Complete Review'}
            variant="primary"
            onPress={handleSubmit}
            disabled={satisfaction === null || wouldChooseSame === null || isSubmitting}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backBtn: { minWidth: 60 },
  backText: { fontSize: typography.size.md, color: colors.accent.primary, fontWeight: '500' },
  headerTitle: { fontSize: typography.size.lg, fontWeight: '700', color: colors.text.primary },
  scrollContent: { padding: spacing.md, paddingBottom: 120 },
  introCard: { padding: spacing.lg, marginBottom: spacing.md, alignItems: 'center' },
  introIcon: { fontSize: 40, marginBottom: spacing.md },
  introTitle: { fontSize: typography.size.xl, fontWeight: '700', color: colors.text.primary, marginBottom: spacing.sm },
  introText: { fontSize: typography.size.sm, color: colors.text.secondary, textAlign: 'center', lineHeight: 20 },
  sectionTitle: { fontSize: typography.size.sm, fontWeight: '700', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md },
  emojiRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  emojiBtn: { flex: 1, alignItems: 'center', padding: spacing.md, borderRadius: 12, backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.border.primary },
  emojiActive: { borderColor: colors.accent.primary, backgroundColor: colors.accent.muted },
  emoji: { fontSize: 28, marginBottom: spacing.xs },
  emojiLabel: { fontSize: typography.size.xs, color: colors.text.tertiary },
  emojiLabelActive: { color: colors.accent.primary, fontWeight: '600' },
  binaryRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  binaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: 12, backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.border.primary },
  binaryActive: { borderColor: colors.status.success, backgroundColor: colors.status.success + '15' },
  binaryActiveNo: { borderColor: colors.status.error, backgroundColor: colors.status.error + '15' },
  binaryIcon: { fontSize: typography.size.lg, color: colors.text.tertiary },
  binaryIconActive: { color: colors.status.success },
  binaryIconActiveNo: { color: colors.status.error },
  binaryLabel: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.tertiary },
  binaryLabelActive: { color: colors.text.primary },
  notesCard: { padding: spacing.lg, marginBottom: spacing.md },
  notesLabel: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.sm },
  notesInput: { backgroundColor: colors.background.tertiary, borderRadius: 10, padding: spacing.md, fontSize: typography.size.sm, color: colors.text.primary, minHeight: 80, borderWidth: 1, borderColor: colors.border.primary },
  summaryCard: { padding: spacing.lg, marginBottom: spacing.md },
  summaryTitle: { fontSize: typography.size.md, fontWeight: '700', color: colors.text.primary, marginBottom: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  summaryLabel: { fontSize: typography.size.sm, color: colors.text.secondary },
  summaryValue: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.primary },
  actions: { paddingTop: spacing.md },
});