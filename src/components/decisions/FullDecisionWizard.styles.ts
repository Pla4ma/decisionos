import { StyleSheet, Platform } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
  },
  headerBtn: { minWidth: 60 },
  cancelText: { fontSize: typography.size.md, color: colors.accent.primary, fontWeight: '500' },
  headerTitle: { fontSize: typography.size.lg, fontWeight: '700', color: colors.text.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: Platform.OS === 'ios' ? 250 : 200 },
  errorsContainer: {
    backgroundColor: colors.status.error + '15',
    borderRadius: 10, padding: spacing.md,
    borderWidth: 1, borderColor: colors.status.error, marginTop: spacing.md,
  },
  errorText: { fontSize: typography.size.sm, color: colors.status.error, fontWeight: '500', marginBottom: 2 },
  errorBanner: {
    backgroundColor: colors.status.error + '15',
    borderRadius: 10, padding: spacing.md,
    borderWidth: 1, borderColor: colors.status.error, marginTop: spacing.md,
  },
  errorBannerText: { fontSize: typography.size.sm, color: colors.status.error, fontWeight: '500', textAlign: 'center' },
  footer: {
    padding: spacing.md, paddingBottom: spacing.xl,
    borderTopWidth: 1, borderTopColor: colors.border.primary,
  },
  saveBtn: { backgroundColor: colors.accent.primary, borderRadius: 12, padding: spacing.md, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.inverse },
});
