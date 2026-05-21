import { useRouter } from 'expo-router';
import { ROUTES } from '@/config/routes';

export function useHomeActions() {
  const router = useRouter();

  return {
    goToQuickDecision: () => router.push(ROUTES.DECISIONS_NEW_QUICK),
    goToFullAnalysis: () => router.push(ROUTES.DECISIONS_NEW),
    goToHistory: () => router.push(ROUTES.DECISIONS_LIST),
    goToSettings: () => router.push(ROUTES.SETTINGS),
    goToDecisionDetail: (id: string) => router.push(ROUTES.DECISION_DETAIL(id)),
    goToDecisionReview: (id: string) => router.push(ROUTES.DECISION_REVIEW(id)),
  };
}
