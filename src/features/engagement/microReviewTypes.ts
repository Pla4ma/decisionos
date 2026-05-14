export type MicroReviewFeeling = 'great' | 'good' | 'okay' | 'worried' | 'regret';

export interface MicroReview {
  id: string;
  decision_id: string;
  user_id: string;
  feeling: MicroReviewFeeling;
  note?: string;
  created_at: string;
  days_since_commit: number;
}

export const MICRO_REVIEW_CONFIG = {
  TRIGGER_HOURS_AFTER_COMMIT: 48,
  REMINDER_FREQUENCY_DAYS: 3,
  MAX_NOTE_LENGTH: 280,
};

export const FEELING_LABELS: Record<MicroReviewFeeling, { label: string; emoji: string }> = {
  great: { label: 'Feeling Great', emoji: '😄' },
  good: { label: 'Good So Far', emoji: '😊' },
  okay: { label: 'It\'s Okay', emoji: '😐' },
  worried: { label: 'A Bit Worried', emoji: '😟' },
  regret: { label: 'Having Regrets', emoji: '😞' },
};
