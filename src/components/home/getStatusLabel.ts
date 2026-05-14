import { colors } from '@/theme/colors';

export function getStatusLabel(decision: any): { label: string; variant: 'default' | 'warning' | 'success' | 'info' | 'accent' } {
  if (decision.is_quick_review_due) return { label: 'Check-in', variant: 'accent' };
  if (decision.status === 'review_scheduled') return { label: 'Review due', variant: 'warning' };
  if (decision.status === 'analyzed') return { label: 'Ready', variant: 'success' };
  if (decision.status === 'draft' || decision.status === 'questions') return { label: 'Draft', variant: 'info' };
  if (decision.status === 'chosen') return { label: 'Chosen', variant: 'success' };
  if (decision.status === 'reviewed') return { label: 'Done', variant: 'default' };
  return { label: decision.status || 'Draft', variant: 'default' };
}
