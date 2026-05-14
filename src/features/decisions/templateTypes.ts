// Decision Template Types — Pre-built decision frameworks
export interface DecisionTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  example_title: string | null;
  example_context: string | null;
  guided_questions: TemplateQuestion[];
  suggested_options: TemplateOption[];
  score_weights: Record<string, number>;
  recommended_review_days: number;
  tier: 'free' | 'plus';
  times_used: number;
  is_active: boolean;
}

export interface TemplateQuestion {
  question_key: string;
  question_text: string;
  is_required: boolean;
}

export interface TemplateOption {
  title: string;
  description?: string;
  pros?: string[];
  cons?: string[];
}
