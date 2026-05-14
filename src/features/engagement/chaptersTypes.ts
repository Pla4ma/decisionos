export interface LifeChapter {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  emoji: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  decision_count: number;
  reviewed_count: number;
  average_satisfaction: number | null;
  created_at: string;
  updated_at: string;
}

export const CHAPTER_EMOJIS = ['🌟', '🚀', '💼', '🏠', '🎓', '❤️', '🌍', '🎯', '📈', '🔄', '🏔️', '🌈'];

export function generateChapterGrade(chapter: Pick<LifeChapter, 'average_satisfaction' | 'reviewed_count' | 'decision_count'>): { grade: string; label: string } {
  if (chapter.decision_count === 0) return { grade: '—', label: 'No decisions yet' };
  const reviewRate = chapter.reviewed_count / chapter.decision_count;
  const sat = chapter.average_satisfaction ?? 3;

  let score = 0;
  if (reviewRate >= 0.8) score += 40;
  else if (reviewRate >= 0.5) score += 25;
  else score += 10;

  score += (sat / 5) * 60;

  if (score >= 85) return { grade: 'A', label: 'Decisive Chapter' };
  if (score >= 70) return { grade: 'B', label: 'Solid Chapter' };
  if (score >= 50) return { grade: 'C', label: 'Mixed Chapter' };
  if (score >= 30) return { grade: 'D', label: 'Tough Chapter' };
  return { grade: 'F', label: 'Learning Chapter' };
}

export const SUGGESTED_CHAPTERS = [
  { title: 'Career Pivot', emoji: '💼', description: 'Major career decisions and professional moves' },
  { title: 'Life Moves', emoji: '🏠', description: 'Relocation, housing, and lifestyle changes' },
  { title: 'Money Matters', emoji: '📈', description: 'Financial decisions and investments' },
  { title: 'Growth Year', emoji: '🌟', description: 'Personal development and growth decisions' },
  { title: 'Relationship Chapter', emoji: '❤️', description: 'Relationship and family decisions' },
  { title: 'Adventure Mode', emoji: '🚀', description: 'Bold moves and life changes' },
];
