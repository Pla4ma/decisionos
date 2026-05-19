import { Text, View, ScrollView, TouchableOpacity, Alert, Switch, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/features/auth';
import { useEntitlements } from '@/features/monetization';
import { useFeatureAccess } from '@/features/progression/useFeatureAccess';
import { supabase } from '@/lib/supabase';
import { resetAnalytics } from '@/lib/analytics';
import { ROUTES } from '@/config/routes';

type Section = { id: string; icon: string; label: string; onPress: () => void; destructive?: boolean };

export default function SettingsScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { hasPlus } = useEntitlements(user?.id || null);
  const { milestones } = useFeatureAccess(user?.id ?? null);
  const [notifications, setNotifications] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => {
        setIsSigningOut(true);
        try { resetAnalytics(); await supabase.auth.signOut(); signOut(); router.replace(ROUTES.SIGN_IN); }
        catch { Alert.alert('Error', 'Failed to sign out.'); }
        finally { setIsSigningOut(false); }
      }},
    ]);
  }, [router, signOut]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert('Delete Account', 'Permanently delete your account and all data?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete Everything', style: 'destructive', onPress: async () => {
        setIsDeleting(true);
        try { const { error } = await supabase.rpc('delete_user_data', { p_user_id: user?.id }); if (error) throw error; await supabase.auth.signOut(); signOut(); router.replace(ROUTES.SIGN_IN); }
        catch { Alert.alert('Error', 'Failed to delete account.'); }
        finally { setIsDeleting(false); }
      }},
    ]);
  }, [user, router, signOut]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-user-data');
      if (error) throw error;
      Alert.alert('Export Complete', 'Your data has been exported successfully.');
    } catch { Alert.alert('Export Failed', 'Unable to export data.'); }
    finally { setIsExporting(false); }
  }, []);

  const sections: Section[][] = [
    [
      { id: 'profile', icon: '👤', label: 'Edit Profile', onPress: () => {} },
      { id: 'notifications', icon: '🔔', label: 'Notifications', onPress: () => {} },
      { id: 'paywall', icon: '⭐', label: hasPlus ? 'Manage Subscription' : 'Upgrade to Plus', onPress: () => router.push(ROUTES.PAYWALL) },
    ],
    [
      { id: 'export', icon: '📥', label: 'Export My Data', onPress: handleExport },
      { id: 'delete', icon: '🗑️', label: 'Delete Account', destructive: true, onPress: handleDeleteAccount },
      { id: 'signout', icon: '🚪', label: 'Sign Out', destructive: true, onPress: handleSignOut },
    ],
  ];

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" style={s.profileCard}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarText}>{user?.email?.charAt(0).toUpperCase() || '?'}</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{user?.email || 'Not signed in'}</Text>
            <View style={s.tierRow}>
              <Text style={s.tierText}>{hasPlus ? 'Plus Plan' : 'Free Plan'}</Text>
              {hasPlus && <Badge title="Plus" variant="success" size="small" />}
            </View>
          </View>
        </Card>

        <Card variant="default" style={s.statsCard}>
          <View style={s.statItem}>
            <Text style={s.statValue}>{milestones.decisionsCreated ?? 0}</Text>
            <Text style={s.statLabel}>Decisions</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statValue}>{milestones.analysesRun ?? 0}</Text>
            <Text style={s.statLabel}>Analyses</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statValue}>{milestones.currentStreak ?? 0}</Text>
            <Text style={s.statLabel}>Day Streak</Text>
          </View>
        </Card>

        {sections.map((group, gi) => (
          <View key={gi} style={s.sectionGroup}>
            {group.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[s.settingRow, item.destructive && s.settingRowDanger]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={s.settingRowLeft}>
                  <Text style={s.settingRowIcon}>{item.icon}</Text>
                  <Text style={[s.settingRowLabel, item.destructive && s.settingRowLabelDanger]}>
                    {item.label}
                  </Text>
                </View>
                <Text style={s.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <Card variant="default" style={s.notificationCard}>
          <View style={s.settingRow}>
            <View style={s.settingRowLeft}>
              <Text style={s.settingRowIcon}>🔔</Text>
              <Text style={s.settingRowLabel}>Review Reminders</Text>
            </View>
            <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: colors.background.tertiary, true: colors.accent.primary }} thumbColor={colors.text.primary} />
          </View>
          <Text style={s.notificationSub}>Get notified when decisions are ready for review</Text>
        </Card>

        <Card variant="default" style={s.securityCard}>
          <View style={s.securityHeader}>
            <Text style={s.settingRowIcon}>🔒</Text>
            <Text style={s.securityTitle}>Your data is protected</Text>
          </View>
          <Text style={s.securityText}>
            All data encrypted with Supabase row-level security. You control your data — export or delete at any time.
          </Text>
        </Card>

        <Text style={s.version}>DecisionOS v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitle: { fontSize: typography.size.xl, fontWeight: '700', color: colors.text.primary },
  scrollContent: { padding: spacing.md, paddingBottom: 100, gap: spacing.md },
  profileCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accent.muted, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: typography.size.lg, fontWeight: '700', color: colors.accent.primary },
  profileInfo: { flex: 1 },
  profileName: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.primary },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  tierText: { fontSize: typography.size.sm, color: colors.accent.primary },
  statsCard: { flexDirection: 'row', padding: spacing.md },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: typography.size.lg, fontWeight: '700', color: colors.text.primary },
  statLabel: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.border.primary },
  sectionGroup: { backgroundColor: colors.background.secondary, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.border.primary },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border.primary },
  settingRowDanger: { borderBottomColor: colors.border.primary },
  settingRowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  settingRowIcon: { fontSize: 18, width: 28 },
  settingRowLabel: { fontSize: typography.size.md, color: colors.text.primary },
  settingRowLabelDanger: { color: colors.status.error },
  chevron: { fontSize: 20, color: colors.text.tertiary },
  notificationCard: { padding: spacing.md },
  notificationSub: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: spacing.xs, marginLeft: 36 },
  securityCard: { padding: spacing.lg },
  securityHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  securityTitle: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.primary },
  securityText: { fontSize: typography.size.sm, color: colors.text.tertiary, lineHeight: 18, marginLeft: 36 },
  version: { fontSize: typography.size.xs, color: colors.text.disabled, textAlign: 'center', marginTop: spacing.md },
});