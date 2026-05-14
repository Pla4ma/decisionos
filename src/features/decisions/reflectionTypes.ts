// Decision Reflection Types — Weekly mini-check-ins
export type ReflectionFeeling = 'confident' | 'uncertain' | 'regretful' | 'relieved' | 'anxious' | 'neutral';

export interface DecisionReflection {
  id: string;
  decision_id: string;
  user_id: string;
  week_number: number;
  feeling: ReflectionFeeling | null;
  thought: string | null;
  would_choose_same_so_far: boolean | null;
  created_at: string;
}

export interface WeeklyReflectionSummary {
  decision_id: string;
  decision_title: string;
  weeks_since_choice: number;
  latest_feeling: string | null;
  total_reflections: number;
  reflection_trend: string;
}
