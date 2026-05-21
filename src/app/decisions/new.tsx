// FLOW: /decisions/new — Create Decision (3 modes)
// MODES: ?quick=true → Quick Mode (2 min, title + 2 options)
//        ?practice=true → Practice Mode (curated scenarios)
//        (no param) → Full Mode (4-step guided flow)
// FROM: / (home) — tap "Quick Decision" or "Full Analysis"
//       /decisions — tap "New Decision"
// TO: /decisions/[id] — after creation, navigates to detail
import { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/theme/colors';
import { useAuth } from '@/features/auth/useAuth';
import { useFeatureAccess } from '@/features/progression/useFeatureAccess';
import { QuickDecisionForm } from '@/components/decisions/QuickDecisionForm';
import { PracticeDecisionForm } from '@/components/decisions/PracticeDecisionForm';
import { FullDecisionWizard } from '@/components/decisions/FullDecisionWizard';
import { ROUTES } from '@/config/routes';

type CreateMode = 'full' | 'quick' | 'practice';

export default function NewDecisionScreen(): JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { template, quick, practice, title: presetTitle } = useLocalSearchParams<{ template?: string; quick?: string; practice?: string; title?: string }>();
  const mode: CreateMode = quick === 'true' ? 'quick' : practice === 'true' ? 'practice' : 'full';
  const { user } = useAuth();
  const { milestones } = useFeatureAccess(user?.id ?? null);

  // Practice mode is blocked until core flow is stable (3+ reviewed decisions)
  if (mode === 'practice' && (milestones.decisionsReviewed ?? 0) < 3) {
    router.replace(ROUTES.DECISIONS_NEW);
    return <View />;
  }

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  if (mode === 'quick') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <QuickDecisionForm
          onCancel={handleCancel}
          onSwitchToFull={() => router.replace(ROUTES.DECISIONS_NEW)}
          initialTitle={presetTitle}
        />
      </View>
    );
  }

  if (mode === 'practice') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <PracticeDecisionForm onExit={handleCancel} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FullDecisionWizard onCancel={handleCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
});
