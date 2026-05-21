// useHomeDecisionRecommendation — Hook for home screen decision recommendations
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserDecisions, getDecisionStatusCounts } from './decisionQueries';
import { Decision, DecisionStatus } from './decisionTypes';
import { RecommendationType } from '@/components/home/RecommendedActionCard';

export interface HomeRecommendation {
  type: RecommendationType;
  title: string;
  description: string;
  decisionId?: string;
  decisionTitle?: string;
}

export interface DecisionWithMeta extends Decision {
  is_quick_review_due?: boolean;
}

export interface HomeDecisionData {
  recommendation: HomeRecommendation | null;
  pendingDecisions: Decision[];
  activeDecisionCount: number;
  statusCounts: Record<DecisionStatus, number>;
  isLoading: boolean;
  error: Error | null;
}

const RECOMMENDATION_PRIORITY: DecisionStatus[] = [
  'review_scheduled', // 1. review due
  'chosen',           // 2. needs quick check-in (48h)
  'draft',            // 3. draft missing options
  'questions',        // 4. needs questions answered
  'ready_for_analysis', // 5. ready for analysis
  'analyzed',         // 6. analyzed but not chosen
  'quick_reviewed',   // 7. had quick check-in, may need full review
];

function isQuickReviewDue(decision: Decision): boolean {
  if (decision.status !== 'chosen') return false;
  const chosenDate = new Date(decision.updated_at);
  const hoursSince = (Date.now() - chosenDate.getTime()) / (1000 * 60 * 60);
  return hoursSince >= 48 && hoursSince <= 168;
}

export function generateRecommendation(
  decisions: Decision[],
  statusCounts: Record<DecisionStatus, number>
): HomeRecommendation | null {
  // Priority 1: Review due
  const reviewDue = decisions.find(d => d.status === 'review_scheduled');
  if (reviewDue) {
    return {
      type: 'review_due',
      title: 'Review a past decision',
      description: 'See how your choice played out and capture what you learned.',
      decisionId: reviewDue.id,
      decisionTitle: reviewDue.title,
    };
  }

  // Priority 2: Quick check-in due (48h after commit)
  const needsCheckIn = decisions.find(d => isQuickReviewDue(d));
  if (needsCheckIn) {
    return {
      type: 'quick_check_in',
      title: 'Quick check-in needed',
      description: 'You committed 2 days ago. How are you feeling about your choice?',
      decisionId: needsCheckIn.id,
      decisionTitle: needsCheckIn.title,
    };
  }

  // Priority 3: Draft missing options
  const draftMissingOptions = decisions.find(d => d.status === 'draft');
  if (draftMissingOptions) {
    return {
      type: 'add_options',
      title: 'Add options to your decision',
      description: 'What choices are you considering? Add them to get clearer analysis.',
      decisionId: draftMissingOptions.id,
      decisionTitle: draftMissingOptions.title,
    };
  }

  // Priority 4: Needs questions answered
  const needsQuestions = decisions.find(d => d.status === 'questions');
  if (needsQuestions) {
    return {
      type: 'answer_questions',
      title: 'Continue your decision',
      description: 'Answer a few guided questions to help the AI understand your situation.',
      decisionId: needsQuestions.id,
      decisionTitle: needsQuestions.title,
    };
  }

  // Priority 5: Ready for analysis
  const readyForAnalysis = decisions.find(d => d.status === 'ready_for_analysis');
  if (readyForAnalysis) {
    return {
      type: 'run_analysis',
      title: 'Ready for AI analysis',
      description: 'You have enough information. Run the analysis to see your options scored.',
      decisionId: readyForAnalysis.id,
      decisionTitle: readyForAnalysis.title,
    };
  }

  // Priority 6: Analyzed but not chosen
  const analyzedNotChosen = decisions.find(d => d.status === 'analyzed');
  if (analyzedNotChosen) {
    return {
      type: 'choose_option',
      title: 'Make your choice',
      description: 'The analysis is complete. Review the scores and commit to a decision.',
      decisionId: analyzedNotChosen.id,
      decisionTitle: analyzedNotChosen.title,
    };
  }

  // Priority 7: First time user - no decisions
  if (decisions.length === 0) {
    return {
      type: 'create_first',
      title: 'Create your first decision',
      description: 'Start with something on your mind. Big or small, every decision gets clearer with structure.',
    };
  }

  return null;
}

export function useHomeDecisionRecommendation(userId: string | null): HomeDecisionData {
  const now = Date.now();
  const {
    data: decisionsData,
    isLoading: decisionsLoading,
    error: decisionsError,
  } = useQuery({
    queryKey: ['decisions', userId],
    queryFn: () => getUserDecisions({ archived: false }, 10),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: statusCounts,
    isLoading: countsLoading,
    error: countsError,
  } = useQuery({
    queryKey: ['decisionCounts', userId],
    queryFn: () => getDecisionStatusCounts(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const recommendation = useMemo(() => {
    if (!decisionsData?.decisions || !statusCounts) return null;
    return generateRecommendation(decisionsData.decisions, statusCounts);
  }, [decisionsData, statusCounts]);

  const pendingDecisions = useMemo(() => {
    if (!decisionsData?.decisions) return [];
    return decisionsData.decisions.filter(d =>
      d.status !== 'reviewed'
    ).map(d => ({
      ...d,
      is_quick_review_due: isQuickReviewDue(d),
    })).slice(0, 10);
  }, [decisionsData]);

  const activeDecisionCount = useMemo(() => {
    if (!statusCounts) return 0;
    return statusCounts.draft + 
           statusCounts.questions + 
           statusCounts.ready_for_analysis + 
           statusCounts.analyzed;
  }, [statusCounts]);

  return {
    recommendation,
    pendingDecisions,
    activeDecisionCount,
    statusCounts: statusCounts || {
      draft: 0,
      questions: 0,
      ready_for_analysis: 0,
      analyzed: 0,
      chosen: 0,
      review_scheduled: 0,
      reviewed: 0,
      quick_reviewed: 0,
      archived: 0,
    },
    isLoading: decisionsLoading || countsLoading,
    error: (decisionsError || countsError) as Error | null,
  };
}
