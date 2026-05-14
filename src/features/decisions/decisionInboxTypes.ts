// Decision Inbox — The lowest-friction entry point
// "Just write it down" — no structure required

export interface DecisionInboxItem {
  id: string;
  user_id: string;
  thought: string;
  context: string | null;
  category: string | null;
  source: 'manual' | 'widget' | 'siri' | 'notification' | 'share_extension';
  is_processed: boolean;
  processed_to_decision_id: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateInboxInput {
  thought: string;
  context?: string;
  source?: 'manual' | 'widget' | 'siri' | 'notification' | 'share_extension';
}

export function extractCategoryFromThought(thought: string): string | null {
  const lower = thought.toLowerCase();
  if (lower.includes('job') || lower.includes('career') || lower.includes('work') || lower.includes('quit')) return 'career';
  if (lower.includes('money') || lower.includes('buy') || lower.includes('invest') || lower.includes('save')) return 'money';
  if (lower.includes('move') || lower.includes('relocat') || lower.includes('city') || lower.includes('house')) return 'moving';
  if (lower.includes('school') || lower.includes('class') || lower.includes('degree') || lower.includes('study')) return 'school';
  if (lower.includes('business') || lower.includes('startup') || lower.includes('company')) return 'business';
  if (lower.includes('goal') || lower.includes('habit') || lower.includes('health') || lower.includes('relationship')) return 'personal_goals';
  return 'other';
}
