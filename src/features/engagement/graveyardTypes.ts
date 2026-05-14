export interface DecisionGraveyardEntry {
  id: string;
  decision_id: string;
  user_id: string;
  original_title: string;
  original_category: string;
  abandoned_at: string;
  reason: 'deleted' | 'postponed' | 'irrelevant' | 'resolved_naturally' | 'other';
  note: string | null;
  created_at: string;
}

export const GRAVEYARD_REASONS: Record<string, { label: string; icon: string }> = {
  deleted: { label: 'Deleted', icon: '🗑️' },
  postponed: { label: 'Decided Later', icon: '⏰' },
  irrelevant: { label: 'No Longer Matters', icon: '🌊' },
  resolved_naturally: { label: 'Resolved Itself', icon: '🍃' },
  other: { label: 'Other', icon: '❓' },
};
