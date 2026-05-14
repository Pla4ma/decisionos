// WeeklyReflectionCard — Quick weekly check-in prompt
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { WeeklyReflectionSummary } from '@/features/decisions/reflectionTypes';

interface WeeklyReflectionCardProps {
  reflection: WeeklyReflectionSummary;
  onReflect: (decisionId: string) => void;
}

const feelingIcons: Record<string, string> = {
  confident: '(+)',
  uncertain: '(?)',
  regretful: '(-)',
  relieved: '(v)',
  anxious: '(!)',
  neutral: '(o)',
};

export function WeeklyReflectionCard({ reflection, onReflect }: WeeklyReflectionCardProps): JSX.Element {
  const weeksText = reflection.weeks_since_choice === 1
    ? '1 week ago'
    : `${reflection.weeks_since_choice} weeks ago`;

  return (
    <Card variant="outlined" style={styles.container}>
      <View style={styles.row}>
        <View style={styles.iconCol}>
          <Text style={styles.feelingIcon}>
            {feelingIcons[reflection.latest_feeling || 'neutral'] || '(o)'}
          </Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.decisionTitle} numberOfLines={1}>{reflection.decision_title}</Text>
          <Text style={styles.meta}>
            Chosen {weeksText}
            {reflection.total_reflections > 0 ? ` · ${reflection.total_reflections} check-in${reflection.total_reflections > 1 ? 's' : ''}` : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.checkInBtn} onPress={() => onReflect(reflection.decision_id)}>
          <Text style={styles.checkInText}>Check in</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconCol: { width: 36, alignItems: 'center' },
  feelingIcon: { fontSize: 18, color: colors.text.secondary },
  infoCol: { flex: 1, marginLeft: spacing.sm },
  decisionTitle: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.primary },
  meta: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 2 },
  checkInBtn: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: 6, backgroundColor: colors.accent.primary + '15',
  },
  checkInText: { fontSize: typography.size.xs, fontWeight: '600', color: colors.accent.primary },
});
