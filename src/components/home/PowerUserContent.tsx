import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { NextArchetypeCard } from './NextArchetypeCard';
import { FutureSelfMessageCard } from './FutureSelfMessage';
import { PatternInsightCard } from './PatternInsightCard';
import { DailyClarityPractice } from './DailyClarityPractice';
import { LifeChapterCard } from './LifeChapterCard';
import { GraveyardCard } from './GraveyardCard';

interface DecisionItem {
  id: string;
  title: string;
  status: string;
}

interface PowerUserContentProps {
  pendingDecisions: DecisionItem[];
  dq: any;
  dqScore: number;
  progression: any;
  futureSelfMessages: any[];
  onReadFutureSelf: (msg: any) => void;
  onDismissFutureSelf: (id: string) => void;
  activeInsights: any[];
  onDismissInsight: (id: string) => void;
  onInsightAction: () => void;
  todayPrompt: any;
  practiceStreak: number;
  practiceCompleted: boolean;
  onCompletePractice: () => void;
  onSkipPractice: () => void;
  activeChapter: any;
  graveyardEntries: any[];
  onViewGraveyard: () => void;
  onCreateChapter: () => void;
  onReview: (id: string) => void;
}

export function PowerUserContent({
  pendingDecisions, dq, dqScore, progression,
  futureSelfMessages, onReadFutureSelf, onDismissFutureSelf,
  activeInsights, onDismissInsight, onInsightAction,
  todayPrompt, practiceStreak, practiceCompleted, onCompletePractice, onSkipPractice,
  activeChapter, graveyardEntries, onViewGraveyard, onCreateChapter, onReview,
}: PowerUserContentProps): JSX.Element {
  const needsReviewCount = pendingDecisions.filter(d => d.status === 'review_scheduled').length;

  return (
    <>
      {needsReviewCount > 0 && (
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Review Due</Text>
            <View style={s.countBadge}><Text style={s.countText}>{needsReviewCount}</Text></View>
          </View>
          {pendingDecisions.filter(d => d.status === 'review_scheduled').slice(0, 2).map((decision) => (
            <TouchableOpacity
              key={decision.id}
              style={[s.decisionCard, s.reviewCard]}
              onPress={() => onReview(decision.id)}
              activeOpacity={0.7}
            >
              <View style={s.cardIconBox}><Text style={s.cardIcon}>📋</Text></View>
              <View style={s.cardCenter}>
                <Text style={s.decisionTitle} numberOfLines={1}>{decision.title}</Text>
                <Text style={s.decisionSub}>Review your outcome</Text>
              </View>
              <Text style={s.reviewArrow}>Review →</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {dq && (
        <NextArchetypeCard
          currentArchetype={progression.currentArchetype}
          currentDq={dqScore}
          nextArchetype={progression.nextArchetype}
          progressToNext={progression.progressToNext}
          requirements={progression.requirements}
        />
      )}

      {futureSelfMessages.length > 0 && (
        <FutureSelfMessageCard
          messages={futureSelfMessages}
          unreadCount={futureSelfMessages.length}
          onRead={(msg) => onReadFutureSelf(msg)}
          onDismiss={(id) => onDismissFutureSelf(id)}
        />
      )}

      {activeInsights.length > 0 && (
        <PatternInsightCard
          insights={activeInsights}
          onDismiss={(id) => onDismissInsight(id)}
          onAction={() => onInsightAction()}
        />
      )}

      {todayPrompt && (
        <DailyClarityPractice
          prompt={todayPrompt}
          streakCount={practiceStreak}
          isCompleted={practiceCompleted}
          onComplete={onCompletePractice}
          onSkip={onSkipPractice}
          isSubmitting={false}
        />
      )}

      {activeChapter && (
        <LifeChapterCard
          chapter={activeChapter}
          onCreateChapter={onCreateChapter}
        />
      )}

      {graveyardEntries.length > 0 && (
        <GraveyardCard
          entries={graveyardEntries}
          onViewGraveyard={onViewGraveyard}
        />
      )}
    </>
  );
}

const s = StyleSheet.create({
  section: { marginBottom: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 1 },
  countBadge: { backgroundColor: colors.status.warning, borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 1 },
  countText: { fontSize: typography.size.xs, fontWeight: '700', color: colors.text.inverse },
  decisionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.secondary, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border.primary },
  reviewCard: { borderLeftWidth: 3, borderLeftColor: colors.accent.primary },
  cardIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.background.tertiary, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  cardIcon: { fontSize: 16 },
  cardCenter: { flex: 1, marginRight: spacing.md },
  decisionTitle: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.primary },
  decisionSub: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 2 },
  reviewArrow: { fontSize: typography.size.sm, fontWeight: '600', color: colors.accent.primary },
});