import { useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { SkeletonScreen } from '@/components/ui/Skeleton';
import { homeStyles } from './homeScreenStyles';
import { useHomeStage, HomeStage } from './useHomeStage';
import { useHomeActions } from './useHomeActions';
import { DecisionIQCard } from '@/components/home/DecisionIQCard';
import { XPBar } from '@/components/home/XPBar';
import { NewUserHome } from '@/components/home/NewUserHome';
import { ActiveDecisionHome } from '@/components/home/ActiveDecisionHome';
import { ReviewDueHome } from '@/components/home/ReviewDueHome';
import { ReviewingHome } from '@/components/home/ReviewingHome';
import { PowerUserHome } from '@/components/home/PowerUserHome';

const STAGE_COMPONENTS: Record<HomeStage, () => JSX.Element> = {
  new_user: NewUserHome,
  active_decision: ActiveDecisionHome,
  review_due: ReviewDueHome,
  reviewing: ReviewingHome,
  power_user: PowerUserHome,
};

function getSubtitle(stage: HomeStage): string {
  switch (stage) {
    case 'new_user': return 'Think clearly before choices you might regret';
    case 'active_decision': return 'Your decisions — pick up where you left off';
    case 'review_due': return 'Reviews build real decision intelligence';
    default: return 'Your Decision Intelligence Dashboard';
  }
}

export default function HomeScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const { stage, displayName, greeting, needsReviewCount, milestones, isLoading, refreshing, onRefresh, iqScore, xp, level, achievements } = useHomeStage();
  const { goToQuickDecision, goToFullAnalysis, goToHistory, goToSettings } = useHomeActions();
  const StageComponent = useMemo(() => STAGE_COMPONENTS[stage], [stage]);
  const hasCreatedDecisions = milestones.decisionsCreated > 0;
  const subtitle = useMemo(() => getSubtitle(stage), [stage]);
  const showIQ = hasCreatedDecisions && iqScore;

  if (isLoading) {
    return <SkeletonScreen />;
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={[homeStyles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={homeStyles.scroll}
        contentContainerStyle={[homeStyles.scrollContent, { paddingBottom: insets.bottom + spacing.lg }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={homeStyles.header}>
          <View>
            <Text style={homeStyles.greeting} accessibilityRole="header">{greeting}{displayName ? `, ${displayName}` : ''}</Text>
            <Text style={homeStyles.subtitle}>{subtitle}</Text>
          </View>
          <View style={homeStyles.headerRight}>
            {milestones.decisionsReviewed > 0 && (
              <View style={homeStyles.streakBadge}>
                <Text style={homeStyles.streakIcon}>✓</Text>
                <Text style={homeStyles.streakValue}>{milestones.decisionsReviewed} reviewed</Text>
              </View>
            )}
            {needsReviewCount > 0 && (
              <View style={[homeStyles.streakBadge, { backgroundColor: colors.status.warning + '20' }]}>
                <Text style={[homeStyles.streakValue, { color: colors.status.warning }]}>{needsReviewCount} due</Text>
              </View>
            )}
            <TouchableOpacity onPress={goToSettings} style={homeStyles.settingsBtn} accessibilityRole="button" accessibilityLabel="Settings">
              <Text style={homeStyles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showIQ && <DecisionIQCard score={iqScore} />}

        {hasCreatedDecisions && <XPBar xp={xp} stats={achievements.length > 0 ? (achievements[0] as any) : { decisionsCreated: milestones.decisionsCreated, decisionsAnalyzed: 0, decisionsReviewed: milestones.decisionsReviewed, quickReviewsDone: 0, currentStreak: 0, longestStreak: 0, biasesDetected: 0, biasesMitigated: 0, reflectionsWritten: 0, templatesUsed: 0, practicesCompleted: 0, secondOpinionsGiven: 0 }} />}

        <StageComponent />

        {hasCreatedDecisions && (
          <View style={homeStyles.quickActions}>
            <TouchableOpacity style={homeStyles.quickActionBtn} onPress={goToQuickDecision} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Quick Decision">
              <Text style={homeStyles.quickActionIcon}>⚡</Text>
              <Text style={homeStyles.quickActionLabel}>Quick Decision</Text>
            </TouchableOpacity>
            <TouchableOpacity style={homeStyles.quickActionBtn} onPress={goToFullAnalysis} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Full Analysis">
              <Text style={homeStyles.quickActionIcon}>+</Text>
              <Text style={homeStyles.quickActionLabel}>Full Analysis</Text>
            </TouchableOpacity>
            <TouchableOpacity style={homeStyles.quickActionBtn} onPress={goToHistory} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="History">
              <Text style={homeStyles.quickActionIcon}>📋</Text>
              <Text style={homeStyles.quickActionLabel}>History</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={homeStyles.footer}>Clarity is a daily practice, not a destination.</Text>
      </ScrollView>
    </Animated.View>
  );
}
