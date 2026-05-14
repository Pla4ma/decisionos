import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface DraftInfo {
  title: string;
  step: number;
  totalSteps: number;
  decisionId?: string;
}

interface DraftContinuationCardProps {
  draft: DraftInfo | null;
  onResume: () => void;
  onDismiss: () => void;
}

export function DraftContinuationCard({ draft, onResume, onDismiss }: DraftContinuationCardProps) {
  if (!draft) return null;

  const progress = draft.totalSteps > 0 ? Math.round((draft.step / draft.totalSteps) * 100) : 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onResume} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.icon}>📝</Text>
        <Text style={styles.label}>Unfinished Decision</Text>
        <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
          <Text style={styles.dismissIcon}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title} numberOfLines={1}>{draft.title || 'New decision'}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{progress}% complete — 2 min to finish</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12, padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.accent.primary + '30',
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: { fontSize: 16, marginRight: spacing.xs },
  label: {
    flex: 1,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.accent.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dismissBtn: { padding: spacing.xs },
  dismissIcon: { fontSize: 12, color: colors.text.tertiary },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.primary,
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
});
