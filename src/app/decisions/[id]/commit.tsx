import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { ROUTES } from '@/config/routes';

export default function CommitScreen(): JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, optionId } = useLocalSearchParams<{ id: string; optionId?: string }>();
  const [selectedOption, setSelectedOption] = useState<string | null>(optionId || null);
  const [predictedSatisfaction, setPredictedSatisfaction] = useState(3);
  const [predictedConfidence, setPredictedConfidence] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const options = [
    { id: 'opt_1', title: 'Option 1' },
    { id: 'opt_2', title: 'Option 2' },
  ];

  const handleCommit = async () => {
    if (!selectedOption) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    setIsSubmitting(false);
    router.push(ROUTES.DECISION_SCHEDULE(id));
  };

  const handleSkip = () => {
    router.push(ROUTES.DECISION_SCHEDULE(id));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commit</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" style={styles.introCard}>
          <Text style={styles.introIcon}>🎯</Text>
          <Text style={styles.introTitle}>Time to choose</Text>
          <Text style={styles.introText}>
            Analysis gives you clarity. Commitment gives you direction. Pick an option and predict how it will turn out.
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>Choose Your Option</Text>

        {options.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[styles.optionRow, selectedOption === option.id && styles.optionRowSelected]}
            onPress={() => setSelectedOption(option.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.radioOuter, selectedOption === option.id && styles.radioOuterSelected]}>
              {selectedOption === option.id && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.optionLabel}>{option.title}</Text>
          </TouchableOpacity>
        ))}

        {selectedOption && (
          <Card variant="elevated" style={styles.predictionCard}>
            <Text style={styles.predictionTitle}>Prediction</Text>
            <Text style={styles.predictionSubtitle}>How do you expect this to turn out?</Text>

            <Text style={styles.sliderLabel}>Expected satisfaction: {predictedSatisfaction}/5</Text>
            <View style={styles.sliderGroup}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity
                  key={n}
                  style={[styles.satisfactionBtn, predictedSatisfaction === n && styles.satisfactionBtnActive]}
                  onPress={() => setPredictedSatisfaction(n)}
                >
                  <Text style={[styles.satisfactionText, predictedSatisfaction === n && styles.satisfactionTextActive]}>
                    {['😞', '😕', '😐', '😊', '😄'][n - 1]}
                  </Text>
                  <Text style={[styles.satisfactionLabel, predictedSatisfaction === n && styles.satisfactionLabelActive]}>
                    {['Poor', 'Below avg', 'Okay', 'Good', 'Great'][n - 1]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sliderLabel}>Confidence: {predictedConfidence}%</Text>
            <View style={styles.confidenceButtons}>
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(n => (
                <TouchableOpacity
                  key={n}
                  style={[styles.confDot, predictedConfidence === n && styles.confDotActive]}
                  onPress={() => setPredictedConfidence(n)}
                >
                  <Text style={[styles.confDotText, predictedConfidence === n && styles.confDotTextActive]}>
                    {n === 0 ? '0%' : n === 50 ? '50' : n === 100 ? '100%' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        <View style={styles.actions}>
          <Button
            title={isSubmitting ? 'Saving...' : 'Commit to this option'}
            variant="primary"
            onPress={handleCommit}
            disabled={!selectedOption || isSubmitting}
          />
          <Button
            title="Skip — go to scheduling"
            variant="ghost"
            onPress={handleSkip}
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
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: colors.background.secondary, borderRadius: 12, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border.primary },
  optionRowSelected: { borderColor: colors.accent.primary, backgroundColor: colors.accent.muted },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border.primary, alignItems: 'center', justifyContent: 'center' },
  radioOuterSelected: { borderColor: colors.accent.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent.primary },
  optionLabel: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.primary },
  predictionCard: { padding: spacing.lg, marginBottom: spacing.md, marginTop: spacing.md },
  predictionTitle: { fontSize: typography.size.md, fontWeight: '700', color: colors.text.primary, marginBottom: spacing.xs },
  predictionSubtitle: { fontSize: typography.size.xs, color: colors.text.tertiary, marginBottom: spacing.lg },
  sliderLabel: { fontSize: typography.size.xs, color: colors.text.secondary, fontWeight: '600', marginBottom: spacing.sm },
  sliderGroup: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  satisfactionBtn: { flex: 1, alignItems: 'center', padding: spacing.sm, borderRadius: 10, backgroundColor: colors.background.tertiary, borderWidth: 1, borderColor: colors.border.primary },
  satisfactionBtnActive: { borderColor: colors.accent.primary, backgroundColor: colors.accent.muted },
  satisfactionText: { fontSize: 24, marginBottom: 2 },
  satisfactionTextActive: {},
  satisfactionLabel: { fontSize: 9, color: colors.text.tertiary },
  satisfactionLabelActive: { color: colors.accent.primary, fontWeight: '600' },
  confidenceButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.lg },
  confDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.background.tertiary, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border.primary },
  confDotActive: { backgroundColor: colors.accent.primary, borderColor: colors.accent.primary },
  confDotText: { fontSize: 7, color: 'transparent' },
  confDotTextActive: { color: colors.text.inverse, fontSize: 7, fontWeight: '700' },
  actions: { gap: spacing.sm, paddingTop: spacing.md },
});