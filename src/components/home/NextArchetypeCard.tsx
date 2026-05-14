import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { ARCHETYPE_DEFINITIONS, DecisionArchetype } from '@/features/dq/dqTypes';

interface NextArchetypeCardProps {
  currentArchetype: DecisionArchetype;
  currentDq: number;
  nextArchetype: DecisionArchetype | null;
  progressToNext: number;
  requirements: string[];
}

export function NextArchetypeCard({ currentArchetype, currentDq, nextArchetype, progressToNext, requirements }: NextArchetypeCardProps) {
  const currentDef = ARCHETYPE_DEFINITIONS[currentArchetype];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Decision Persona</Text>
      <View style={styles.scoreRow}>
        <Text style={styles.archetypeTitle}>{currentDef?.title || 'Getting started'}</Text>
        <Text style={styles.dqScore}>{currentDq > 0 ? currentDq : '—'}</Text>
      </View>
      <Text style={styles.description}>{currentDef?.description || 'Make your first decision to discover your style.'}</Text>

      {nextArchetype && (
        <View style={styles.nextSection}>
          <View style={styles.nextHeader}>
            <Text style={styles.nextLabel}>Next: {ARCHETYPE_DEFINITIONS[nextArchetype]?.title}</Text>
            <Text style={styles.nextPct}>{Math.round(progressToNext)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(100, progressToNext)}%` }]} />
          </View>
          {requirements.length > 0 && (
            <View style={styles.requirements}>
              {requirements.map((req, i) => (
                <Text key={i} style={styles.reqItem}>• {req}</Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12, padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border.primary,
  },
  title: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.xs,
  },
  archetypeTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    flex: 1,
  },
  dqScore: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.accent.primary,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  nextSection: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 8, padding: spacing.md,
  },
  nextHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  nextLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },
  nextPct: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.accent.secondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.background.primary,
    borderRadius: 3,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.secondary,
    borderRadius: 3,
  },
  requirements: {
    gap: 2,
  },
  reqItem: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
});
