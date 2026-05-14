// share.tsx - Final Type-Safe implementation
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { useDecisionPartner } from '@/features/social/useDecisionPartner';
import { useAuth } from '@/features/auth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function ShareDecisionScreen(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { createShare, isCreating } = useDecisionPartner(user?.id ?? null);
  const [partnerLabel, setPartnerLabel] = useState<string>('');

  const handleShare = async () => {
    if (!id || !partnerLabel.trim()) return;
    try {
      const token = await createShare({ decisionId: id, partnerLabel });
      Alert.alert('Link Generated', `Share this token: ${token}`);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to generate share link.');
      console.error(error);
    }
  };

  return (
    <Screen title="Share Decision" onBack={router.back}>
      <TextField
        label="Who are you sharing with?"
        placeholder="e.g., My Mentor"
        value={partnerLabel}
        onChangeText={setPartnerLabel}
      />
      <Button
        title="Generate Share Link"
        onPress={handleShare}
        isLoading={isCreating}
        variant="primary"
        style={styles.button}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: { marginTop: spacing.lg },
});
