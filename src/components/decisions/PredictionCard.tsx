// PredictionCard — The gambling loop: User predicts outcome before committing
// This creates VARIABLE REWARD — the core of compulsion looping
import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { Slider } from '@/components/ui/Slider';

interface PredictionCardProps {
  onPredictionChange: (satisfaction: number, confidence: number) => void;
  initialSatisfaction?: number;
  initialConfidence?: number;
}

const EMOJI_LEVELS = [
  { value: 1, emoji: '😞', label: 'Bad' },
  { value: 2, emoji: '😕', label: 'Meh' },
  { value: 3, emoji: '😐', label: 'OK' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
];

export function PredictionCard({
  onPredictionChange,
  initialSatisfaction = 3,
  initialConfidence = 70,
}: PredictionCardProps): JSX.Element {
  const [satisfaction, setSatisfaction] = useState(initialSatisfaction);
  const [confidence, setConfidence] = useState(initialConfidence);

  const handleSatisfactionChange = (val: number) => {
    setSatisfaction(val);
    onPredictionChange(val, confidence);
  };

  const handleConfidenceChange = (val: number) => {
    setConfidence(val);
    onPredictionChange(satisfaction, val);
  };

  const selectedEmoji = EMOJI_LEVELS.find(e => e.value === satisfaction);

  return (
    <View style={styles.container}>
      <Card variant="elevated">
        <View style={styles.header}>
          <Text style={styles.emoji}>🎯</Text>
          <View style={styles.headerText}>
            <Text style={styles.title}>Predict Your Outcome</Text>
            <Text style={styles.subtitle}>Lock in your prediction now. When you review, we'll compare.</Text>
          </View>
        </View>

        {/* Satisfaction prediction */}
        <Text style={styles.label}>How satisfied will you be with this choice?</Text>
        <View style={styles.emojiRow}>
          {EMOJI_LEVELS.map((level) => (
            <Pressable
              key={level.value}
              style={[
                styles.emojiBtn,
                satisfaction === level.value && styles.emojiBtnSelected,
              ]}
              onPress={() => handleSatisfactionChange(level.value)}
            >
              <Text style={[styles.emojiIcon, satisfaction === level.value && styles.emojiIconSelected]}>
                {level.emoji}
              </Text>
              <Text style={[styles.emojiLabel, satisfaction === level.value && styles.emojiLabelSelected]}>
                {level.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Confidence slider */}
        <View style={styles.confidenceSection}>
          <View style={styles.confidenceHeader}>
            <Text style={styles.label}>Confidence level</Text>
            <Text style={styles.confidenceValue}>{confidence}%</Text>
          </View>
          <Slider
            value={confidence}
            onValueChange={handleConfidenceChange}
            minimumValue={0}
            maximumValue={100}
            step={5}
          />
          <View style={styles.confidenceLabels}>
            <Text style={styles.confidenceLabelText}>Just guessing</Text>
            <Text style={styles.confidenceLabelText}>Absolutely certain</Text>
          </View>
        </View>

        {/* Prediction summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            You predict you'll feel <Text style={styles.summaryEmoji}>{selectedEmoji?.emoji}</Text> ({selectedEmoji?.label}) 
            with <Text style={styles.summaryBold}>{confidence}%</Text> confidence.
          </Text>
          <Text style={styles.summaryNote}>
            When you review this decision, we'll calculate your calibration accuracy.
            Accurate predictions = higher DQ score.
          </Text>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: spacing.md },
  header: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  emoji: { fontSize: 28 },
  headerText: { flex: 1, gap: 4 },
  title: { fontSize: typography.size.lg, fontWeight: '700', color: colors.text.primary },
  subtitle: { fontSize: typography.size.sm, color: colors.text.tertiary, lineHeight: 18 },
  label: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.secondary, marginBottom: spacing.sm },
  emojiRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs, marginBottom: spacing.lg },
  emojiBtn: { alignItems: 'center', padding: spacing.sm, borderRadius: 10, backgroundColor: colors.background.tertiary, flex: 1 },
  emojiBtnSelected: { backgroundColor: colors.accent.muted, borderWidth: 2, borderColor: colors.accent.primary },
  emojiIcon: { fontSize: 24, opacity: 0.5 },
  emojiIconSelected: { opacity: 1 },
  emojiLabel: { fontSize: 10, color: colors.text.tertiary, marginTop: 2 },
  emojiLabelSelected: { color: colors.accent.primary, fontWeight: '600' },
  confidenceSection: { marginBottom: spacing.lg },
  confidenceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  confidenceValue: { fontSize: typography.size.lg, fontWeight: '700', color: colors.accent.primary },
  confidenceLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  confidenceLabelText: { fontSize: typography.size.xs, color: colors.text.tertiary },
  summary: { backgroundColor: colors.background.tertiary, borderRadius: 10, padding: spacing.md, gap: spacing.sm },
  summaryText: { fontSize: typography.size.sm, color: colors.text.secondary, lineHeight: 20 },
  summaryEmoji: { fontSize: 16 },
  summaryBold: { fontWeight: '700', color: colors.accent.primary },
  summaryNote: { fontSize: typography.size.xs, color: colors.text.tertiary, fontStyle: 'italic' },
});
