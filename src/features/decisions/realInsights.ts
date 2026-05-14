// Real Pattern Insights — Computed from actual user data, not mocked

import { supabase } from '@/lib/supabase';
import { DecisionCategory } from '@/features/decisions/decisionTypes';

export interface RealInsight {
  id: string;
  insight_type: 'strength' | 'bias' | 'pattern' | 'suggestion';
  title: string;
  description: string;
  evidence_count: number;
  confidence: number;
}

export async function fetchRealInsights(userId: string): Promise<RealInsight[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_pattern_insights', {
      p_user_id: userId,
    });

    if (error) throw error;
    return (data || []).map((d: Record<string, unknown>, i: number) => ({
      id: `insight-${i}`,
      insight_type: d.insight_type,
      title: d.title,
      description: d.description,
      evidence_count: d.evidence_count,
      confidence: getConfidenceFromCount(d.evidence_count as number),
    }));
  } catch (error) {
    console.error('Failed to fetch insights:', error);
    return [];
  }
}

function getConfidenceFromCount(count: number): number {
  if (count >= 10) return 90;
  if (count >= 7) return 75;
  if (count >= 5) return 60;
  if (count >= 3) return 40;
  return 20;
}

// Get insights for analysis context (what the AI should know about this user)
export async function getAnalysisContext(userId: string, category: DecisionCategory): Promise<string> {
  try {
    // Get all reviewed decisions in this category
    const { data: reviews } = await supabase
      .from('decision_reviews')
      .select(`
        satisfaction_score,
        would_choose_same,
        decision:decisions!inner(category, importance, urgency)
      `)
      .eq('decision.category', category)
      .eq('user_id', userId)
      .not('satisfaction_score', 'is', null)
      .limit(20);

    if (!reviews || reviews.length === 0) return '';

    const avgSatisfaction = reviews.reduce((sum, r) => sum + (r.satisfaction_score || 0), 0) / reviews.length;
    const wouldChooseSamePct = reviews.filter(r => r.would_choose_same).length / reviews.length;
    const highImportanceDecisions = reviews.filter(r => {
      const decision = r.decision as unknown as { importance: number };
      return decision.importance >= 7;
    });

    let context = `This user has ${reviews.length} reviewed decisions in this category. `;

    if (avgSatisfaction >= 4) {
      context += `They tend to be satisfied with their ${category} choices (avg: ${avgSatisfaction.toFixed(1)}/5). `;
    } else if (avgSatisfaction < 3) {
      context += `They tend to report lower satisfaction with ${category} choices (avg: ${avgSatisfaction.toFixed(1)}/5). `;
    }

    if (wouldChooseSamePct >= 0.7) {
      context += `They would choose the same option again ${Math.round(wouldChooseSamePct * 100)}% of the time. `;
    }

    return context;
  } catch {
    return '';
  }
}
