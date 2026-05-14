export type QuickReviewFeeling = 1 | 2 | 3 | 4 | 5;

export interface QuickReview {
  id: string;
  decision_id: string;
  user_id: string;
  feeling: QuickReviewFeeling;
  created_at: string;
  is_complete: boolean;
}

export const QUICK_REVIEW_EMOJIS: Record<QuickReviewFeeling, { emoji: string; label: string }> = {
  1: { emoji: '😞', label: 'Regretting it' },
  2: { emoji: '😕', label: 'Not great' },
  3: { emoji: '😐', label: 'It\'s okay' },
  4: { emoji: '😊', label: 'Pretty good' },
  5: { emoji: '😄', label: 'Great choice' },
};

export function emojiToSatisfaction(feeling: QuickReviewFeeling): number {
  return feeling;
}
