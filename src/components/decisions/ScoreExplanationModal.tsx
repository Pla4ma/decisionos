// ScoreExplanationModal — Detailed explanation for decision scores
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { getScoreExplanation, interpretScore } from '@/features/decisions/decisionScoreExplanations';
import { DecisionScoreName } from '@/features/decisions/decisionTypes';

interface ScoreExplanationModalProps {
  visible: boolean;
  onClose: () => void;
  scoreName: DecisionScoreName;
  scoreValue?: number; // Optional actual score to interpret
}

export function ScoreExplanationModal({ 
  visible, 
  onClose, 
  scoreName, 
  scoreValue 
}: ScoreExplanationModalProps): JSX.Element {
  const explanation = getScoreExplanation(scoreName);
  const interpretation = scoreValue ? interpretScore(scoreName, scoreValue) : null;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={explanation.label}
      size="small"
    >
      <View style={styles.content}>
        <Text style={styles.description}>{explanation.description}</Text>
        
        <Card variant="outlined" style={styles.meaningCard}>
          <Text style={styles.sectionTitle}>What the scores mean</Text>
          <View style={styles.scoreMeaning}>
            <Text style={styles.highScore}>High Score:</Text>
            <Text style={styles.meaningText}>{explanation.highScoreMeaning}</Text>
          </View>
          <View style={styles.scoreMeaning}>
            <Text style={styles.lowScore}>Low Score:</Text>
            <Text style={styles.meaningText}>{explanation.lowScoreMeaning}</Text>
          </View>
        </Card>

        {scoreValue && (
          <Card variant="elevated" style={styles.interpretationCard}>
            <Text style={styles.sectionTitle}>Your score interpretation</Text>
            <Text style={styles.scoreValue}>{scoreValue}/100</Text>
            <Text style={styles.interpretation}>{interpretation}</Text>
          </Card>
        )}

        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            💡 {explanation.tooltipText}
          </Text>
        </View>

        <Text style={styles.disclaimer}>
          These scores are guidance, not absolute truth. Use them as one input in your decision process.
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  description: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  meaningCard: {
    backgroundColor: colors.background.secondary,
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  scoreMeaning: {
    marginBottom: spacing.sm,
  },
  highScore: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.status.success,
    marginBottom: spacing.xs,
  },
  lowScore: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.status.error,
    marginBottom: spacing.xs,
  },
  meaningText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  interpretationCard: {
    backgroundColor: colors.background.tertiary,
  },
  scoreValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  interpretation: {
    fontSize: typography.size.sm,
    color: colors.text.primary,
    lineHeight: 18,
  },
  noteContainer: {
    padding: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
  },
  noteText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  disclaimer: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.secondary,
  },
});
