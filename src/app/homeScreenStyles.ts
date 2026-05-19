import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export const homeStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  greeting: {
    fontSize: typography.size.xxl, fontWeight: typography.weight.bold, color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.size.sm, color: colors.text.tertiary, marginTop: spacing.xs,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.background.secondary,
    borderRadius: 9999, paddingHorizontal: spacing.sm, paddingVertical: 4,
  },
  streakIcon: { fontSize: 14 },
  streakValue: { fontSize: typography.size.sm, fontWeight: '700', color: colors.accent.primary },
  settingsBtn: { padding: spacing.sm },
  settingsIcon: { fontSize: 20 },
  quickActions: {
    flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg,
  },
  quickActionBtn: {
    flex: 1, backgroundColor: colors.background.secondary, borderRadius: 10,
    padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border.primary,
  },
  quickActionIcon: { fontSize: 18, marginBottom: spacing.xs },
  quickActionLabel: { fontSize: typography.size.xs, fontWeight: typography.weight.medium, color: colors.text.primary },
  footer: {
    fontSize: typography.size.sm, color: colors.text.tertiary,
    textAlign: 'center', fontStyle: 'italic', marginTop: spacing.md,
  },
});
