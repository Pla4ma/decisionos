import { Text, View, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import { resetAnalytics } from '@/lib/analytics';
import { ROUTES } from '@/config/routes';
import { styles } from './styles';
import { useState, useCallback } from 'react';

interface AccountSectionProps {
  hasPlus: boolean;
  isAnalyzing: boolean;
  analysisCount: number;
}

export function AccountSection({ hasPlus, isAnalyzing, analysisCount }: AccountSectionProps): JSX.Element {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSignOut = useCallback(async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive', onPress: async () => {
          setIsSigningOut(true);
          try {
            resetAnalytics();
            await supabase.auth.signOut();
            signOut();
            router.replace(ROUTES.SIGN_IN);
          } catch { Alert.alert('Error', 'Failed to sign out.'); }
          finally { setIsSigningOut(false); }
        },
      },
    ]);
  }, [router, signOut]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert('Delete Account', 'This will permanently delete your account and all data.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete Everything', style: 'destructive', onPress: async () => {
          setIsDeleting(true);
          try {
            const { error } = await supabase.rpc('delete_user_data', { p_user_id: user?.id });
            if (error) throw error;
            await supabase.auth.signOut();
            signOut();
            router.replace(ROUTES.SIGN_IN);
          } catch { Alert.alert('Error', 'Failed to delete account.'); }
          finally { setIsDeleting(false); }
        },
      },
    ]);
  }, [user, router, signOut]);

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Card style={styles.settingsCard}>
          <Text style={styles.settingLabel}>{user?.email || 'Not signed in'}</Text>
          <View style={styles.tierRow}>
            <Text style={styles.settingValue}>{hasPlus ? 'Plus Plan' : 'Free Plan'}</Text>
            {hasPlus && <Badge title="Plus" variant="success" size="small" />}
          </View>
        </Card>
        {!hasPlus && analysisCount > 0 && (
          <Link href={ROUTES.PAYWALL} asChild>
            <Button title="Upgrade to Plus" variant="secondary" />
          </Link>
        )}
        {!hasPlus && analysisCount === 0 && (
          <Button title="Create a decision first" variant="secondary" disabled />
        )}
      </View>

      <Divider />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        <Button title={isSigningOut ? 'Signing Out...' : 'Sign Out'} variant="secondary" onPress={handleSignOut} disabled={isSigningOut} />
        <Button title={isDeleting ? 'Deleting...' : 'Delete Account'} variant="danger" onPress={handleDeleteAccount} disabled={isDeleting} />
      </View>
    </>
  );
}
