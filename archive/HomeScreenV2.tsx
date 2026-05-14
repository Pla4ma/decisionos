/**
 * HomeScreenV2
 *
 * Rebuilt Home screen with AI-powered recommendation engine.
 * Primary goal: Answer "What should I work on right now?"
 *
 * @phase 1 - Foundation
 */

import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { Text } from '../../components/primitives/Text';
import { HomeHeroCard } from './components/HomeHeroCard';
import { QuickActionsRail } from './components/QuickActionsRail';
import { ContextBar } from './components/ContextBar';
import { MiniBossPreview } from './components/MiniBossPreview';
import { useHomeRecommendation } from './services/HomeRecommendationEngine';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { useActiveStudyPlan } from '../../features/content-study/hooks/useActiveStudyPlan';
import { useHaptics } from '../../utils/haptics';
import { useAuthStore } from '../../store';
import { useDailyLoginReward } from '../../features/rewards/hooks';
import { DailyLoginCard } from '../../features/rewards/components/DailyLoginCard';

export function HomeScreenV2(): JSX.Element {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const haptics = useHaptics();
  const { user } = useAuthStore();
  const userId = user?.id ?? '';

  const {
    recommendation,
    isLoading: recLoading,
    refresh: refreshRec,
  } = useHomeRecommendation();

  // Daily login reward
  const {
    canClaim,
    reward,
    isLoading: dailyLoading,
    isClaiming,
    claim,
  } = useDailyLoginReward(userId);

  const { data: activeStudyPlan, refetch: refetchStudyPlan } = useActiveStudyPlan();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    haptics.pullToRefresh();
    await Promise.all([refreshRec(), refetchStudyPlan()]);
    setRefreshing(false);
  }, [refreshRec, refetchStudyPlan, haptics]);

  const handleRecommendationPress = React.useCallback(
    (rec: typeof recommendation) => {
      if (!rec) {return;}

      haptics.primaryAction();

      switch (rec.ctaAction) {
        case 'start_focus':
          navigation.navigate('SessionSetup', {
            duration: rec.ctaParams?.duration as number | undefined,
            reason: rec.ctaParams?.reason as string | undefined,
          });
          break;

        case 'start_study':
          if (activeStudyPlan) {
            navigation.navigate('StudyFocusSession', {
              planId: activeStudyPlan.generationId,
            });
          } else {
            navigation.navigate('Focus');
          }
          break;

        case 'view_boss':
          navigation.navigate('Boss');
          break;

        case 'view_streak':
          navigation.navigate('Progress');
          break;

        default:
          navigation.navigate('SessionSetup');
      }
    },
    [navigation, haptics, activeStudyPlan]
  );

  const handleCustomizePress = React.useCallback(() => {
    haptics.light();
    navigation.navigate('SessionSetup');
  }, [navigation, haptics]);

  const handleQuickAction = React.useCallback(
    (action: string) => {
      haptics.medium();
      switch (action) {
        case 'focus':
          navigation.navigate('SessionSetup');
          break;
        case 'study':
          navigation.navigate('ContentStudy');
          break;
        case 'boss':
          navigation.navigate('Boss');
          break;
        case 'progress':
          navigation.navigate('Progress');
          break;
      }
    },
    [navigation, haptics]
  );

  const styles = React.useMemo(
    () => ({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
      },
      scrollContent: {
        paddingBottom: insets.bottom + theme.spacing[8],
      },
      content: {
        paddingTop: theme.spacing[4],
      },
      quickActionsSection: {
        marginTop: theme.spacing[6],
        paddingHorizontal: theme.spacing[4],
        marginBottom: theme.spacing[4],
      },
      sectionTitle: {
        marginBottom: theme.spacing[3],
      },
      bossSection: {
        marginTop: theme.spacing[4],
        paddingHorizontal: theme.spacing[4],
      },
    }),
    [theme, insets]
  );

  return (
    <View style={styles.container}>
      <ContextBar userId={userId} />

      {/* Daily Login Reward Card */}
      <DailyLoginCard
        reward={reward}
        canClaim={canClaim}
        isLoading={dailyLoading}
        isClaiming={isClaiming}
        onClaim={claim}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Primary Recommendation */}
          <HomeHeroCard
            recommendation={recommendation}
            isLoading={recLoading}
            onPressCta={handleRecommendationPress}
            onPressSecondary={handleCustomizePress}
            userId={userId}
          />

          {/* Quick Actions Rail */}
          <View style={styles.quickActionsSection}>
            <Text
              variant="h4"
              color={theme.colors.text.primary}
              style={styles.sectionTitle}
            >
              Quick Start
            </Text>
            <QuickActionsRail onAction={handleQuickAction} />
          </View>

          {/* Boss Preview (if active) */}
          {recommendation?.type !== 'boss_battle' && (
            <View style={styles.bossSection}>
              <MiniBossPreview userId={userId} />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
