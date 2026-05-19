import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { GRAVEYARD_REASONS } from '@/features/engagement/graveyardTypes';

interface GraveyardEntry {
  id: string;
  original_title: string;
  reason: string;
  abandoned_at: string;
}

interface GraveyardCardProps {
  entries: GraveyardEntry[];
  onViewGraveyard: () => void;
}

export function GraveyardCard({ entries, onViewGraveyard }: GraveyardCardProps): JSX.Element | null {
  if (entries.length === 0) return null;

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>🪦</Text>
          <View>
            <Text style={styles.title}>Decision Graveyard</Text>
            <Text style={styles.subtitle}>{entries.length} past decision{entries.length > 1 ? 's' : ''}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onViewGraveyard}>
          <Text style={styles.viewAll}>View all</Text>
        </TouchableOpacity>
      </View>

      {entries.slice(0, 3).map((entry) => (
        <View key={entry.id} style={styles.entryRow}>
          <Text style={styles.entryIcon}>{GRAVEYARD_REASONS[entry.reason]?.icon || '🪦'}</Text>
          <View style={styles.entryInfo}>
            <Text style={styles.entryTitle} numberOfLines={1}>{entry.original_title}</Text>
            <Text style={styles.entryReason}>{GRAVEYARD_REASONS[entry.reason]?.label || 'Other'}</Text>
          </View>
          <Text style={styles.entryDate}>
            {new Date(entry.abandoned_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, marginBottom: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  headerLeft: { flexDirection: 'row', gap: spacing.md },
  icon: { fontSize: 24 },
  title: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.primary },
  subtitle: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 1 },
  viewAll: { fontSize: typography.size.sm, color: colors.accent.primary, fontWeight: '500' },
  entryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border.secondary },
  entryIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  entryInfo: { flex: 1 },
  entryTitle: { fontSize: typography.size.sm, fontWeight: '500', color: colors.text.primary },
  entryReason: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 1 },
  entryDate: { fontSize: typography.size.xs, color: colors.text.disabled },
});