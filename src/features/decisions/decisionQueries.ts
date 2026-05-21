import { supabase } from '@/lib/supabase';
import { Decision, DecisionOption, DecisionAnswer, DecisionAnalysis, DecisionReview, DecisionFilter, DecisionStatus } from './decisionTypes';
import { RepositoryError } from '@/lib/errors';

export async function getDecision(decisionId: string): Promise<Decision | null> {
  try {
    const { data, error } = await supabase.from('decisions').select('*').eq('id', decisionId).single();
    if (error) { if (error.code === 'PGRST116') return null; throw error; }
    return data;
  } catch (error) { throw new RepositoryError('Failed to fetch decision', error); }
}

export async function getDecisionById(decisionId: string): Promise<{
  decision: Decision | null; options: DecisionOption[]; answers: DecisionAnswer[];
  analysis: DecisionAnalysis | null; review: DecisionReview | null;
}> {
  try {
    const { data: decision, error: decisionError } = await supabase.from('decisions').select('*').eq('id', decisionId).single();
    if (decisionError) { if (decisionError.code === 'PGRST116') return { decision: null, options: [], answers: [], analysis: null, review: null }; throw decisionError; }
    const [optionsResult, answersResult, analysisResult, reviewResult] = await Promise.all([
      supabase.from('decision_options').select('*').eq('decision_id', decisionId),
      supabase.from('decision_answers').select('*').eq('decision_id', decisionId),
      supabase.from('decision_analysis').select('*').eq('decision_id', decisionId).maybeSingle(),
      supabase.from('decision_reviews').select('*').eq('decision_id', decisionId).maybeSingle(),
    ]);
    if (optionsResult.error) throw optionsResult.error;
    if (answersResult.error) throw answersResult.error;
    if (analysisResult.error) throw analysisResult.error;
    if (reviewResult.error) throw reviewResult.error;
    return { decision, options: optionsResult.data || [], answers: answersResult.data || [], analysis: analysisResult.data, review: reviewResult.data };
  } catch (error) { throw new RepositoryError('Failed to fetch decision', error); }
}

export async function getUserDecisions(
  filter?: DecisionFilter, limit: number = 50, offset: number = 0
): Promise<{ decisions: Decision[]; count: number }> {
  try {
    let query = supabase.from('decisions').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (!filter?.is_practice) query = query.eq('is_practice', false);
    if (filter?.is_practice === true) query = query.eq('is_practice', true);
    if (!filter?.archived) query = query.neq('status', 'archived');
    if (filter?.status) query = query.eq('status', filter.status);
    if (filter?.category) query = query.eq('category', filter.category);
    if (filter?.chapter_id) query = query.eq('chapter_id', filter.chapter_id);
    const { data, error, count } = await query;
    if (error) throw error;
    return { decisions: data || [], count: count || 0 };
  } catch (error) { throw new RepositoryError('Failed to fetch decisions', error); }
}

export async function getDecisionOptions(decisionId: string): Promise<DecisionOption[]> {
  try {
    const { data, error } = await supabase.from('decision_options').select('*').eq('decision_id', decisionId).order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (error) { throw new RepositoryError('Failed to fetch options', error); }
}

export async function getDecisionAnswers(decisionId: string): Promise<DecisionAnswer[]> {
  try {
    const { data, error } = await supabase.from('decision_answers').select('*').eq('decision_id', decisionId);
    if (error) throw error;
    return data || [];
  } catch (error) { throw new RepositoryError('Failed to fetch answers', error); }
}

export async function getDecisionAnalysis(decisionId: string): Promise<DecisionAnalysis | null> {
  try {
    const { data, error } = await supabase.from('decision_analysis').select('*').eq('decision_id', decisionId).maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) { throw new RepositoryError('Failed to fetch analysis', error); }
}

export async function getDecisionReview(decisionId: string): Promise<DecisionReview | null> {
  try {
    const { data, error } = await supabase.from('decision_reviews').select('*').eq('decision_id', decisionId).maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) { throw new RepositoryError('Failed to fetch review', error); }
}

export async function getDecisionStatusCounts(userId: string): Promise<Record<DecisionStatus, number>> {
  try {
    const { data, error } = await supabase.rpc('get_decision_status_counts', { p_user_id: userId });
    if (error) throw error;
    const counts: Record<string, number> = { draft: 0, questions: 0, ready_for_analysis: 0, analyzed: 0, chosen: 0, review_scheduled: 0, reviewed: 0, quick_reviewed: 0, archived: 0 };
    if (data) {
      for (const row of data as Array<{ status: string; count: number }>) {
        counts[row.status] = row.count;
      }
    }
    return counts as Record<DecisionStatus, number>;
  } catch (error) { throw new RepositoryError('Failed to fetch status counts', error); }
}

export async function checkAnalysisLimit(userId: string): Promise<{ canAnalyze: boolean; used: number; limit: number }> {
  try {
    const { data, error } = await supabase.from('profiles').select('free_analyses_used, free_analyses_limit').eq('id', userId).single();
    if (error) throw error;
    return { canAnalyze: data.free_analyses_used < data.free_analyses_limit, used: data.free_analyses_used, limit: data.free_analyses_limit };
  } catch (error) { throw new RepositoryError('Failed to check analysis limit', error); }
}
