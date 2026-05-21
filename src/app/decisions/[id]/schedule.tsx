import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { scheduleDecisionReview } from '@/features/decisions/decisionRepository';
import { ROUTES } from '@/config/routes';

const REVIEW_OPTIONS = [
  { days: 7, label: '1 week', desc: 'Quick check-in after a short period' },
  { days: 14, label: '2 weeks', desc: 'Standard — enough time to see initial results' },
  { days: 30, label: '1 month', desc: 'Best for most decisions — see real outcomes' },
  { days: 90, label: '3 months', desc: 'For major life changes with long feedback loops' },
  { days: 180, label: '6 months', desc: 'Hindsight is clearest at distance' },
];

export default function ScheduleScreen(): JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedDays, setSelectedDays] = useState<number | null>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSchedule = async () => {
    if (!selectedDays || !id) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const reviewDate = new Date();
      reviewDate.setDate(reviewDate.getDate() + selectedDays);
      await scheduleDecisionReview(id, reviewDate);
      router.push(ROUTES.HOME);
    } catch (err) {
      setError('Failed to schedule review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" style={styles.introCard}>
          <Text style={styles.introIcon}>📅</Text>
          <Text style={styles.introTitle}>Set a review date</Text>
          <Text style={styles.introText}>
            The best decisions include a plan to look back. Choose when to review how this turned out.
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>When should we check back?</Text>

        {REVIEW_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.days}
            style={[styles.optionRow, selectedDays === option.days && styles.optionRowSelected]}
            onPress={() => setSelectedDays(option.days)}
            activeOpacity={0.7}
          >
            <View style={styles.optionInfo}>
              <Text style={[styles.optionLabel, selectedDays === option.days && styles.optionLabelSelected]}>
                {option.label}
              </Text>
              <Text style={styles.optionDesc}>{option.desc}</Text>
            </View>
            <View style={[styles.radioOuter, selectedDays === option.days && styles.radioOuterSelected]}>
              {selectedDays === option.days && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}

        <Card variant="elevated" style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Why schedule a review?</Text>
            <Text style={styles.tipText}>
              Research shows that people who review their decisions within the first month are 2x more likely to improve their decision-making over time.
            </Text>
          </View>
        </Card>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title={isSubmitting ? 'Scheduling...' : 'Schedule Review'}
            variant="primary"
            onPress={handleSchedule}
            disabled={!selectedDays || isSubmitting}
          />
          <Button
            title="Skip — back to home"
            variant="ghost"
            onPress={() => router.push(ROUTES.HOME)}
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
  optionRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.background.secondary, borderRadius: 12, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border.primary },
  optionRowSelected: { borderColor: colors.accent.primary, backgroundColor: colors.accent.muted },
  optionInfo: { flex: 1, marginRight: spacing.md },
  optionLabel: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.primary },
  optionLabelSelected: { color: colors.accent.primary },
  optionDesc: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 2 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border.primary, alignItems: 'center', justifyContent: 'center' },
  radioOuterSelected: { borderColor: colors.accent.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent.primary },
  tipCard: { flexDirection: 'row', padding: spacing.lg, marginTop: spacing.md, gap: spacing.md },
  tipIcon: { fontSize: 24 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.xs },
  tipText: { fontSize: typography.size.xs, color: colors.text.tertiary, lineHeight: 18 },
  errorBanner: { backgroundColor: colors.status.error + '15', borderRadius: 10, padding: spacing.md, borderWidth: 1, borderColor: colors.status.error },
  errorText: { fontSize: typography.size.sm, color: colors.status.error, fontWeight: '500', textAlign: 'center' },
  actions: { gap: spacing.sm, paddingTop: spacing.lg },
});
