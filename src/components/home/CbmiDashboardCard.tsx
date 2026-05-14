// CbmiDashboardCard — Shows CBMI score, persona, and trend on the home screen
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UserBiasProfile, getPersonaForScore, PERSONA_TIERS } from '@/features/cbmi/cbmiTypes';

interface CbmiDashboardCardProps {
  profile: UserBiasProfile;
  onPress?: () => void;
}

function CbmiScoreBar({ score, maxScore = 100 }: { score: number; maxScore?: number }): JSX.Element {
  const percentage = Math.min(100, (score / maxScore) * 100);
  const barColor = score >= 70 ? colors.status.success : score >= 40 ? colors.status.warning : colors.status.error;

  return (
    <View style={styles.scoreBarContainer}>
      <View style={styles.scoreBarBackground}>
        <View style={[styles.scoreBarFill, { width: `${percentage}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={[styles.scoreText, { color: barColor }]}>{score.toFixed(0)}</Text>
    </View>
  );
}

export function CbmiDashboardCard({ profile, onPress }: CbmiDashboardCardProps): JSX.Element {
  const persona = getPersonaForScore(profile.current_cbmi);
  const trendIcon = profile.cbmi_trend === 'improving' ? '↑' : profile.cbmi_trend === 'declining' ? '↓' : '→';

  const nextTier = PERSONA_TIERS.find(t => t.level === persona.level + 1);
  const progressToNext = nextTier
    ? ((profile.current_cbmi - persona.minScore) / (nextTier.minScore - persona.minScore)) * 100
    : 100;

  return (
    <Card onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Rationality Score</Text>
            <Text style={styles.personaTitle}>{persona.title}</Text>
          </View>
          <Badge
            title={profile.cbmi_trend === 'improving' ? 'Improving' : profile.cbmi_trend === 'declining' ? 'Declining' : 'Stable'}
            variant={profile.cbmi_trend === 'improving' ? 'primary' : profile.cbmi_trend === 'declining' ? 'error' : 'default'}
            size="small"
          />
        </View>

        <CbmiScoreBar score={profile.current_cbmi} />

        {nextTier && (
          <View style={styles.nextTierContainer}>
            <Text style={styles.nextTierText}>
              Next: {nextTier.title} ({nextTier.minScore} points)
            </Text>
            <View style={styles.progressBarSmall}>
              <View style={[styles.progressFillSmall, { width: `${Math.min(100, progressToNext)}%` }]} />
            </View>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile.total_bias_mitigations}</Text>
            <Text style={styles.statLabel}>Biases Mitigated</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile.total_decisions_with_bias_checks}</Text>
            <Text style={styles.statLabel}>Decisions Checked</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>Lv.{persona.level}</Text>
            <Text style={styles.statLabel}>Persona Level</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: typography.size.sm, color: colors.text.secondary, fontWeight: typography.weight.medium },
  personaTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.text.primary, marginTop: 2 },
  scoreBarContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  scoreBarBackground: { flex: 1, height: 8, backgroundColor: colors.background.tertiary, borderRadius: 4, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 4 },
  scoreText: { fontSize: typography.size.xl, fontWeight: typography.weight.bold, minWidth: 40, textAlign: 'right' },
  nextTierContainer: { gap: 4 },
  nextTierText: { fontSize: typography.size.xs, color: colors.text.tertiary },
  progressBarSmall: { height: 4, backgroundColor: colors.background.tertiary, borderRadius: 2, overflow: 'hidden' },
  progressFillSmall: { height: '100%', backgroundColor: colors.accent.primary, borderRadius: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border.primary },
  stat: { alignItems: 'center' },
  statValue: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.text.primary },
  statLabel: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.border.primary },
});
