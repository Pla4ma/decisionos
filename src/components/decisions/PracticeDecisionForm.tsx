import { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { usePracticeMode } from '@/features/engagement/usePracticeMode';

interface PracticeDecisionFormProps {
  onExit: () => void;
}

export function PracticeDecisionForm({ onExit }: PracticeDecisionFormProps): JSX.Element {
  const { startSession, currentScenario, completeScenario, nextScenario, endSession, scenariosCompleted, totalScenarios, sessionActive } = usePracticeMode();
  const [selectedPracticeOption, setSelectedPracticeOption] = useState<number | null>(null);
  const practiceIndex = scenariosCompleted;

  useEffect(() => {
    if (!sessionActive) {
      startSession();
    }
  }, [sessionActive, startSession]);

  const handlePracticeSelect = useCallback((index: number) => {
    setSelectedPracticeOption(index);
    completeScenario(index);
  }, [completeScenario]);

  const handlePracticeNext = useCallback(() => {
    setSelectedPracticeOption(null);
    nextScenario();
  }, [nextScenario]);

  const handleExit = useCallback(() => {
    endSession();
    onExit();
  }, [endSession, onExit]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button title="Exit Practice" variant="ghost" size="small" onPress={handleExit} />
        <Text style={styles.headerTitle}>Practice Mode</Text>
        <Text style={styles.headerProgress}>{scenariosCompleted}/{totalScenarios}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: spacing.lg }}>
        {currentScenario ? (
          <View>
            <View style={styles.disclaimerBanner}>
              <Text style={styles.disclaimerIcon}>🧠</Text>
              <Text style={styles.disclaimerText}>
                This is a hypothetical scenario for skill practice — not a real decision. No data is stored or shared.
              </Text>
            </View>
            <Badge
              title={currentScenario.category}
              variant="info"
              size="small"
              style={styles.practiceBadge}
            />
            <Text style={styles.practiceTitle}>{currentScenario.title}</Text>
            <Text style={styles.practiceContext}>{currentScenario.context}</Text>

            <Text style={styles.practiceOptionsLabel}>Choose your approach:</Text>
            {currentScenario.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.practiceOption,
                  selectedPracticeOption === index && styles.practiceOptionSelected,
                ]}
                onPress={() => handlePracticeSelect(index)}
                disabled={selectedPracticeOption !== null}
                activeOpacity={0.7}
              >
                <Text style={styles.practiceOptionTitle}>{option.title}</Text>
                <Text style={styles.practiceOptionDesc}>{option.description}</Text>
                <View style={styles.practiceProsCons}>
                  <View style={styles.practicePros}>
                    {option.pros.slice(0, 2).map((pro, i) => (
                      <Text key={i} style={styles.practiceProText}>✓ {pro}</Text>
                    ))}
                  </View>
                  <View style={styles.practiceCons}>
                    {option.cons.slice(0, 2).map((con, i) => (
                      <Text key={i} style={styles.practiceConText}>✗ {con}</Text>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {selectedPracticeOption !== null && (
              <View style={styles.practiceResultContainer}>
                <Card variant="elevated" style={styles.practiceResultCard}>
                  <Text style={styles.practiceResultTitle}>Choice Recorded</Text>
                  <Text style={styles.practiceResultText}>
                    You chose: {currentScenario.options[selectedPracticeOption]?.title}
                  </Text>
                  {currentScenario.source === 'curated' && (
                    <Text style={styles.practiceInsight}>
                      This scenario has been analyzed by our team. In practice, most people who chose this option
                      reported higher satisfaction when they aligned their choice with their long-term values.
                    </Text>
                  )}
                </Card>
                <Button
                  title={practiceIndex < totalScenarios - 1 ? 'Next Scenario' : 'Finish Practice'}
                  variant="primary"
                  onPress={handlePracticeNext}
                />
              </View>
            )}
          </View>
        ) : (
          <View style={styles.practiceEndContainer}>
            <Text style={styles.practiceEndIcon}>🧠</Text>
            <Text style={styles.practiceEndTitle}>Practice Complete!</Text>
            <Text style={styles.practiceEndText}>
              You worked through {scenariosCompleted} scenarios. Each one strengthens your decision framework.
            </Text>
            <View style={styles.practiceEndActions}>
              <Button title="Try Again" variant="primary" onPress={() => { startSession(); setSelectedPracticeOption(null); }} />
              <Button title="Create a Real Decision" variant="ghost" onPress={handleExit} />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  disclaimerBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.background.tertiary, borderRadius: 10,
    padding: spacing.md, marginBottom: spacing.md,
  },
  disclaimerIcon: { fontSize: 18 },
  disclaimerText: {
    flex: 1, fontSize: typography.size.xs, color: colors.text.tertiary,
    lineHeight: 16, fontStyle: 'italic',
  },
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitle: { fontSize: typography.size.lg, fontWeight: '600', color: colors.text.primary },
  headerProgress: { fontSize: typography.size.sm, color: colors.accent.primary, fontWeight: '600' },
  scroll: { flex: 1 },
  practiceBadge: { alignSelf: 'flex-start', marginBottom: spacing.md },
  practiceTitle: { fontSize: typography.size.xl, fontWeight: '700', color: colors.text.primary, marginBottom: spacing.md },
  practiceContext: { fontSize: typography.size.md, color: colors.text.secondary, lineHeight: 22, marginBottom: spacing.lg, backgroundColor: colors.background.secondary, padding: spacing.md, borderRadius: 12 },
  practiceOptionsLabel: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md },
  practiceOption: { backgroundColor: colors.background.secondary, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border.primary },
  practiceOptionSelected: { borderColor: colors.accent.primary, backgroundColor: colors.accent.primary + '10' },
  practiceOptionTitle: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.xs },
  practiceOptionDesc: { fontSize: typography.size.sm, color: colors.text.secondary, marginBottom: spacing.sm, lineHeight: 18 },
  practiceProsCons: { flexDirection: 'row', gap: spacing.md },
  practicePros: { flex: 1 },
  practiceProText: { fontSize: 12, color: colors.status.success, marginBottom: 2 },
  practiceCons: { flex: 1 },
  practiceConText: { fontSize: 12, color: colors.status.error, marginBottom: 2 },
  practiceResultContainer: { marginTop: spacing.lg, gap: spacing.md },
  practiceResultCard: { backgroundColor: colors.accent.primary + '10' },
  practiceResultTitle: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.xs },
  practiceResultText: { fontSize: typography.size.md, color: colors.accent.primary, fontWeight: '600', marginBottom: spacing.md },
  practiceInsight: { fontSize: typography.size.sm, color: colors.text.secondary, lineHeight: 18, fontStyle: 'italic' },
  practiceEndContainer: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  practiceEndIcon: { fontSize: 48, marginBottom: spacing.md },
  practiceEndTitle: { fontSize: typography.size.xl, fontWeight: '700', color: colors.text.primary },
  practiceEndText: { fontSize: typography.size.md, color: colors.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  practiceEndActions: { gap: spacing.sm, width: '100%' },
});
