// DecisionScoreRow — Single dimension score with label
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { ScoreExplanationModal } from './ScoreExplanationModal';
import { DecisionScoreName } from '@/features/decisions/decisionTypes';

interface DecisionScoreRowProps {
  label: string;
  score: number; // 0-100
  description?: string;
  inverted?: boolean; // Lower is better (for risk/regret)
  scoreName?: DecisionScoreName; // For help modal
}

export function DecisionScoreRow({ label, score, description, inverted = false, scoreName }: DecisionScoreRowProps): JSX.Element {
  const [showExplanation, setShowExplanation] = useState(false);
  // Color based on score and inversion
  const getColor = (s: number): string => {
    if (inverted) {
      // For inverted scores (risk, regret), lower is better
      if (s <= 30) return colors.status.success;
      if (s <= 60) return colors.status.warning;
      return colors.status.error;
    }
    // Normal scores: higher is better
    if (s >= 70) return colors.status.success;
    if (s >= 40) return colors.status.warning;
    return colors.status.error;
  };

  const color = getColor(score);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.scoreContainer}>
            <Text style={[styles.score, { color }]}>{score}</Text>
            {scoreName && (
              <TouchableOpacity
                onPress={() => setShowExplanation(true)}
                style={styles.helpButton}
              >
                <Text style={styles.helpText}>?</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: `${score}%`, backgroundColor: color }]} />
        </View>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      
      {scoreName && (
        <ScoreExplanationModal
          visible={showExplanation}
          onClose={() => setShowExplanation(false)}
          scoreName={scoreName}
          scoreValue={score}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  label: { fontSize: typography.size.sm, color: colors.text.primary, fontWeight: typography.weight.medium },
  scoreContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  score: { fontSize: typography.size.md, fontWeight: typography.weight.bold },
  helpButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    fontSize: typography.size.xs,
    color: colors.text.secondary,
    fontWeight: typography.weight.medium,
  },
  barContainer: { height: 6, backgroundColor: colors.background.tertiary, borderRadius: 3, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 3 },
  description: { fontSize: typography.size.xs, color: colors.text.secondary, marginTop: spacing.xs },
});
