import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { GRAVEYARD_REASONS, DecisionGraveyardEntry } from '@/features/engagement/graveyardTypes';

interface GraveyardCardProps {
  entries: DecisionGraveyardEntry[];
  onViewGraveyard: () => void;
}

export function GraveyardCard({ entries, onViewGraveyard }: GraveyardCardProps) {
  if (entries.length === 0) return null;

  const recentEntries = entries.slice(0, 3);

  return (
    <TouchableOpacity style={styles.container} onPress={onViewGraveyard} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.icon}>🪦</Text>
        <Text style={styles.title}>Decision Graveyard</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{entries.length}</Text>
        </View>
      </View>
      {recentEntries.map(entry => (
        <View key={entry.id} style={styles.entryRow}>
          <Text style={styles.entryIcon}>
            {GRAVEYARD_REASONS[entry.reason]?.icon || '❓'}
          </Text>
          <Text style={styles.entryTitle} numberOfLines={1}>{entry.original_title}</Text>
        </View>
      ))}
      {entries.length > 3 && (
        <Text style={styles.moreText}>+{entries.length - 3} more buried decisions</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12, padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border.primary,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: { fontSize: 16, marginRight: spacing.sm },
  title: {
    flex: 1,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 9999, paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
  countText: {
    fontSize: 11, fontWeight: '600', color: colors.text.secondary,
  },
  entryRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  entryIcon: { fontSize: 12, marginRight: spacing.sm },
  entryTitle: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  moreText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});
