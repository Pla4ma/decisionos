// DecisionQuickActions — Horizontal quick action buttons for home
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface QuickAction {
  id: string;
  label: string;
  onPress: () => void;
}

interface DecisionQuickActionsProps {
  onNewDecision: () => void;
  onViewHistory: () => void;
  onSettings: () => void;
  onViewTimeline?: () => void;
  onViewPlaybook?: () => void;
}

export function DecisionQuickActions({
  onNewDecision,
  onViewHistory,
  onSettings,
  onViewTimeline,
  onViewPlaybook,
}: DecisionQuickActionsProps): JSX.Element {
  const actions: QuickAction[] = [
    { id: 'new', label: 'New', onPress: onNewDecision },
    { id: 'history', label: 'History', onPress: onViewHistory },
    ...(onViewPlaybook ? [{ id: 'playbook', label: 'Playbook', onPress: onViewPlaybook }] : []),
    ...(onViewTimeline ? [{ id: 'timeline', label: 'Timeline', onPress: onViewTimeline }] : []),
    { id: 'settings', label: 'Settings', onPress: onSettings },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionButton}
            onPress={action.onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.primary,
    minHeight: 60,
  },
  actionLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },
});
