import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.primary },
  title: { fontSize: typography.size.xl, fontWeight: typography.weight.bold, color: colors.text.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.lg },
  section: { gap: spacing.md },
  sectionTitle: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 1 },
  settingsCard: { gap: spacing.md },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLabel: { fontSize: typography.size.md, color: colors.text.primary },
  settingValue: { fontSize: typography.size.sm, color: colors.accent.primary },
  version: { fontSize: typography.size.xs, color: colors.text.tertiary, textAlign: 'center', marginTop: spacing.xl },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  settingInfo: { flex: 1 },
  settingDescription: { fontSize: typography.size.sm, color: colors.text.secondary, marginTop: spacing.xs },
  privacyNote: { fontSize: typography.size.sm, color: colors.text.tertiary, fontStyle: 'italic', marginTop: spacing.sm },
  settingAction: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  settingActionText: { fontSize: typography.size.md, color: colors.text.primary },
  securityCard: { gap: spacing.sm },
  securityItem: { fontSize: typography.size.sm, color: colors.text.secondary },
});
