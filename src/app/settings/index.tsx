// FLOW: /settings — Account & Preferences
// FROM: / (home) — tap gear icon
// TO: /paywall — tap "Upgrade"
//     /auth/sign-in — tap "Sign Out"
// This is a utility screen. Core flow happens on home + decisions screens.
// See FLOW_ARCHITECTURE.md §9 — Navigation Decision Tree
import { Text, View, StyleSheet, ScrollView, Switch, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Divider } from '@/components/ui/Divider';
import { useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { useEntitlements } from '@/features/monetization';
import { supabase } from '@/lib/supabase';
import { resetAnalytics } from '@/lib/analytics';

export default function SettingsScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { hasPlus, tier } = useEntitlements(user?.id || null);

  // Privacy settings state
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleMemoryToggle = useCallback((value: boolean) => {
    setMemoryEnabled(value);
    // TODO: Persist to user profile when backend supports it
    Alert.alert(
      value ? 'Memory Enabled' : 'Memory Disabled',
      value
        ? 'DecisionOS will use your reviews to personalize future analysis.'
        : 'DecisionOS will not learn from your decisions. Your reviews remain private.'
    );
  }, []);

  const handleSignOut = useCallback(async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsSigningOut(true);
            try {
              // Reset analytics on sign out
              resetAnalytics();
              // Sign out from Supabase
              await supabase.auth.signOut();
              // Clear local auth state
              signOut();
              // Navigate to auth screen
              router.replace('/auth/sign-in');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  }, [router, signOut]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all decision data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Coming Soon',
              'Account deletion will be available in a future update. Contact support for assistance.'
            );
          },
        },
      ]
    );
  }, []);

  const handleExport = useCallback(() => {
    Alert.alert(
      'Export Data',
      'Data export will be available in a future update. Your data remains secure until then.'
    );
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card style={styles.settingsCard}>
            <Text style={styles.settingLabel}>{user?.email || 'Not signed in'}</Text>
            <View style={styles.tierRow}>
              <Text style={styles.settingValue}>{hasPlus ? 'Plus Plan' : 'Free Plan'}</Text>
              {hasPlus && <Badge title="Plus" variant="success" size="small" />}
            </View>
          </Card>
          {!hasPlus && (
            <Link href="/paywall" asChild>
              <Button title="Upgrade to Plus" variant="secondary" />
            </Link>
          )}
        </View>

        <Divider />

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Memory</Text>
          <Card style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Decision Memory</Text>
                <Text style={styles.settingDescription}>
                  Allow DecisionOS to learn from your reviews and personalize future analysis
                </Text>
              </View>
              <Switch
                value={memoryEnabled}
                onValueChange={handleMemoryToggle}
                trackColor={{ false: colors.background.tertiary, true: colors.accent.primary }}
              />
            </View>
          </Card>
          <Text style={styles.privacyNote}>
            Your decision content is never shared. Only anonymized patterns are used for improvement.
          </Text>
        </View>

        <Divider />

        {/* Decision Intelligence */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Decision Intelligence</Text>
          <Card style={styles.settingsCard}>
            <Link href="/playbook" asChild>
              <Pressable style={styles.settingAction}>
                <Text style={styles.settingActionText}>📖 Decision Playbook</Text>
                <Text style={styles.settingActionArrow}>→</Text>
              </Pressable>
            </Link>
            <Divider />
            <Link href="/timeline" asChild>
              <Pressable style={styles.settingAction}>
                <Text style={styles.settingActionText}>📈 Decision Timeline</Text>
                <Text style={styles.settingActionArrow}>→</Text>
              </Pressable>
            </Link>
          </Card>
        </View>

        <Divider />

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Card style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Review Reminders</Text>
                <Text style={styles.settingDescription}>
                  Get notified when decisions are ready for review
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.background.tertiary, true: colors.accent.primary }}
              />
            </View>
          </Card>
        </View>

        <Divider />

        {/* Data & Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <Card style={styles.settingsCard}>
            <Pressable onPress={handleExport} style={styles.settingAction}>
              <Text style={styles.settingActionText}>Export Decision History</Text>
              <Text style={styles.comingSoonBadge}>Coming Soon</Text>
            </Pressable>
            <Divider />
            <Pressable style={styles.settingAction}>
              <Text style={styles.settingActionText}>Privacy Policy</Text>
            </Pressable>
            <Divider />
            <Pressable style={styles.settingAction}>
              <Text style={styles.settingActionText}>Terms of Service</Text>
            </Pressable>
          </Card>
        </View>

        <Divider />

        {/* Security Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <Card variant="outlined" style={styles.securityCard}>
            <Text style={styles.securityItem}>✓ Encrypted in transit (TLS 1.3)</Text>
            <Text style={styles.securityItem}>✓ Encrypted at rest</Text>
            <Text style={styles.securityItem}>✓ Row Level Security enforced</Text>
            <Text style={styles.securityItem}>○ End-to-End Encryption (Future)</Text>
            <Text style={styles.securityItem}>○ Biometric App Lock (Future)</Text>
          </Card>
        </View>

        <Divider />

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          <Button
            title={isSigningOut ? 'Signing Out...' : 'Sign Out'}
            variant="secondary"
            onPress={handleSignOut}
            disabled={isSigningOut}
          />
          <Button title="Delete Account" variant="danger" onPress={handleDeleteAccount} />
        </View>

        <Text style={styles.version}>DecisionOS v1.0.0 (Phase 14)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingsCard: {
    gap: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: typography.size.md,
    color: colors.text.primary,
  },
  settingValue: {
    fontSize: typography.size.sm,
    color: colors.accent.primary,
  },
  oldSettingAction: {
    fontSize: typography.size.md,
    color: colors.accent.primary,
    paddingVertical: spacing.sm,
  },
  version: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  settingInfo: {
    flex: 1,
  },
  settingDescription: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  privacyNote: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  settingAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingActionText: {
    fontSize: typography.size.md,
    color: colors.text.primary,
  },
  comingSoonBadge: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  securityCard: {
    gap: spacing.sm,
  },
  securityItem: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  settingActionArrow: {
    fontSize: typography.size.md,
    color: colors.text.tertiary,
  },
});
