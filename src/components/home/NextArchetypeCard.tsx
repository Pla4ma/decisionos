import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { ARCHETYPE_DEFINITIONS, type DecisionArchetype } from '@/features/dq/dqTypes';

interface NextArchetypeCardProps {
  currentArchetype: DecisionArchetype;
  currentDq: number;
  nextArchetype: DecisionArchetype | null;
  progressToNext: number;
  requirements: string[];
}

const ARCHETYPE_EMOJIS: Record<DecisionArchetype, string> = {
  gambler: '🎲',
  overthinker: '🤔',
  learner: '📖',
  decisive: '🎯',
  sage: '🦉',
};

export function NextArchetypeCard({ currentArchetype, currentDq, nextArchetype, progressToNext, requirements }: NextArchetypeCardProps): JSX.Element {
  const currentDef = ARCHETYPE_DEFINITIONS[currentArchetype];
  const nextDef = nextArchetype ? ARCHETYPE_DEFINITIONS[nextArchetype] : null;

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>Your Archetype</Text>
      </View>

      <View style={styles.currentRow}>
        <View style={styles.archetypeIconLarge}>
          <Text style={styles.archetypeEmoji}>{ARCHETYPE_EMOJIS[currentArchetype]}</Text>
        </View>
        <View style={styles.archetypeInfo}>
          <Text style={styles.archetypeTitle}>{currentDef.title}</Text>
          <Text style={styles.archetypeDesc}>{currentDef.description}</Text>
        </View>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreText}>{currentDq}</Text>
          <Text style={styles.scoreLabel}>DQ</Text>
        </View>
      </View>

      {nextDef && (
        <>
          <View style={styles.divider} />
          <View style={styles.nextRow}>
            <Text style={styles.nextLabel}>Next: {nextDef.title}</Text>
            <Text style={styles.nextThreshold}>at {nextArchetype ? ARCHETYPE_DEFINITIONS[nextArchetype].minDq : '-'} DQ</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, progressToNext))}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progressToNext)}% to {nextDef.title}</Text>
          {requirements.length > 0 && (
            <View style={styles.requirements}>
              {requirements.map((req, i) => (
                <View key={i} style={styles.requirementRow}>
                  <Text style={styles.reqBullet}>•</Text>
                  <Text style={styles.reqText}>{req}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, marginBottom: spacing.md },
  header: { marginBottom: spacing.md },
  label: { fontSize: typography.size.xs, fontWeight: '700', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 1 },
  currentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  archetypeIconLarge: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accent.muted, alignItems: 'center', justifyContent: 'center' },
  archetypeEmoji: { fontSize: 26 },
  archetypeInfo: { flex: 1 },
  archetypeTitle: { fontSize: typography.size.lg, fontWeight: '700', color: colors.text.primary },
  archetypeDesc: { fontSize: typography.size.xs, color: colors.text.secondary, lineHeight: 16, marginTop: 2 },
  scoreCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.background.tertiary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.accent.primary },
  scoreText: { fontSize: typography.size.lg, fontWeight: '800', color: colors.accent.primary },
  scoreLabel: { fontSize: 9, color: colors.accent.primary, marginTop: -2 },
  divider: { height: 1, backgroundColor: colors.border.primary, marginVertical: spacing.md },
  nextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  nextLabel: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.secondary },
  nextThreshold: { fontSize: typography.size.xs, color: colors.text.tertiary },
  progressBar: { height: 6, backgroundColor: colors.background.tertiary, borderRadius: 3, overflow: 'hidden', marginBottom: spacing.xs },
  progressFill: { height: '100%', backgroundColor: colors.accent.primary, borderRadius: 3 },
  progressText: { fontSize: typography.size.xs, color: colors.text.tertiary, marginBottom: spacing.sm },
  requirements: { gap: spacing.xs },
  requirementRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  reqBullet: { fontSize: typography.size.sm, color: colors.accent.primary },
  reqText: { fontSize: typography.size.xs, color: colors.text.secondary },
});