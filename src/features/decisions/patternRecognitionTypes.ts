export interface PatternInsight {
  id: string;
  user_id: string;
  insight_type: 'bias_pattern' | 'category_tendency' | 'velocity_pattern' | 'satisfaction_trend' | 'value_alignment' | 'blind_spot_emerging';
  title: string;
  description: string;
  evidence_summary: string;
  evidence_count: number;
  severity: 'mild' | 'moderate' | 'significant';
  is_actionable: boolean;
  suggested_action: string | null;
  is_dismissed: boolean;
  is_used: boolean;
  created_at: string;
  confidence?: 'low' | 'medium' | 'high';
}

export function generatePatternInsights(
  userId: string,
  decisions: Array<{
    category: string;
    importance: number;
    satisfaction: number | null;
    time_to_decide_hours: number;
    options_count: number;
    status: string;
  }>,
  biases: Array<{ bias_name: string; count: number }>,
): PatternInsight[] {
  const insights: PatternInsight[] = [];

  if (decisions.length >= 3) {
    const categoryCounts: Record<string, number> = {};
    decisions.forEach(d => { categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1; });
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
    if (topCategory && topCategory[1] >= 2) {
      const catDecisions = decisions.filter(d => d.category === topCategory[0]);
      const avgSat = catDecisions.filter(d => d.satisfaction !== null).reduce((sum, d) => sum + (d.satisfaction || 0), 0) / Math.max(1, catDecisions.filter(d => d.satisfaction !== null).length);
      if (avgSat > 0 && avgSat < 3) {
        const evidenceCount = topCategory[1];
        const confidence: PatternInsight['confidence'] = evidenceCount >= 5 ? 'high' : evidenceCount >= 3 ? 'medium' : 'low';
        const isLowEvidence = evidenceCount < 3;
        insights.push({
          id: `pattern_${Date.now()}_category`,
          user_id: userId,
          insight_type: 'category_tendency',
          title: isLowEvidence
            ? `Early signal: ${topCategory[0]} satisfaction`
            : `Your ${topCategory[0]} decisions aren't satisfying`,
          description: isLowEvidence
            ? `You've made ${topCategory[1]} decision${topCategory[1] > 1 ? 's' : ''} in this area with below-average satisfaction. This is an early signal — watch for a pattern as you log more decisions.`
            : `You've made ${topCategory[1]} decisions in this area with below-average satisfaction. Consider slowing down and using the full analysis framework.`,
          evidence_summary: `${topCategory[1]} decisions, avg satisfaction ${avgSat.toFixed(1)}/5`,
          evidence_count: evidenceCount,
          severity: avgSat < 2 ? 'significant' : 'moderate',
          is_actionable: true,
          suggested_action: 'Try the full analysis flow next time instead of quick mode',
          is_dismissed: false,
          is_used: false,
          created_at: new Date().toISOString(),
          confidence,
        });
      }
    }
  }

  if (decisions.length >= 2) {
    const fastDecisions = decisions.filter(d => d.time_to_decide_hours < 1 && d.importance >= 7);
    if (fastDecisions.length >= 2) {
      const evidenceCount = fastDecisions.length;
      const confidence: PatternInsight['confidence'] = evidenceCount >= 5 ? 'high' : evidenceCount >= 3 ? 'medium' : 'low';
      const isLowEvidence = evidenceCount < 3;
      insights.push({
        id: `pattern_${Date.now()}_velocity`,
        user_id: userId,
        insight_type: 'velocity_pattern',
        title: isLowEvidence
          ? 'Early signal: rushing high-stakes decisions'
          : 'You rush high-stakes decisions',
        description: isLowEvidence
          ? `${fastDecisions.length} important decision${fastDecisions.length > 1 ? 's were' : ' was'} made in under an hour. This is an early signal — continue monitoring your pacing.`
          : `${fastDecisions.length} important decisions were made in under an hour. High-importance choices benefit from deliberate pacing.`,
        evidence_summary: `${fastDecisions.length} rushed high-importance decisions`,
        evidence_count: evidenceCount,
        severity: 'significant',
        is_actionable: true,
        suggested_action: 'High-importance decisions (7+) should marinate for at least 24 hours',
        is_dismissed: false,
        is_used: false,
        created_at: new Date().toISOString(),
        confidence,
      });
    }
  }

  if (biases.length > 0) {
    const topBias = biases.sort((a, b) => b.count - a.count)[0];
    if (topBias && topBias.count >= 2) {
      const evidenceCount = topBias.count;
      const confidence: PatternInsight['confidence'] = evidenceCount >= 5 ? 'high' : evidenceCount >= 3 ? 'medium' : 'low';
      const isLowEvidence = evidenceCount < 3;
      insights.push({
        id: `pattern_${Date.now()}_bias`,
        user_id: userId,
        insight_type: 'bias_pattern',
        title: isLowEvidence
          ? `Early signal: ${topBias.bias_name}`
          : `${topBias.bias_name} is a recurring pattern`,
        description: isLowEvidence
          ? `This bias has appeared in ${topBias.count} of your decisions. This is an early signal — track it as you make more decisions.`
          : `This bias has appeared in ${topBias.count} of your decisions. Awareness is the first step — try actively counter-arguing before deciding.`,
        evidence_summary: `Detected ${topBias.count} times across your decisions`,
        evidence_count: evidenceCount,
        severity: topBias.count >= 4 ? 'significant' : 'moderate',
        is_actionable: true,
        suggested_action: 'Before your next decision, write down the opposite of what you believe',
        is_dismissed: false,
        is_used: false,
        created_at: new Date().toISOString(),
        confidence,
      });
    }
  }

  return insights;
}
