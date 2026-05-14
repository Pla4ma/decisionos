// Decision Read Repository
// All read operations for decision domain

import { supabase } from '@/lib/supabase';
import {
  Decision,
  DecisionOption,
  DecisionAnswer,
  DecisionAnalysis,
  DecisionReview,
  DecisionFilter,
  DecisionStatus,
} from './decisionTypes';

// Error wrapper for consistent error handling
class RepositoryError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'RepositoryError';
  }
}

// Get a single decision by ID (decision only)
export async function getDecision(decisionId: string): Promise<Decision | null> {
  try {
    const { data, error } = await supabase
      .from('decisions')
      .select('*')
      .eq('id', decisionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  } catch (error) {
    throw new RepositoryError('Failed to fetch decision', error);
  }
}

// Get a single decision by ID with all related data
export async function getDecisionById(decisionId: string): Promise<{
  decision: Decision | null;
  options: DecisionOption[];
  answers: DecisionAnswer[];
  analysis: DecisionAnalysis | null;
  review: DecisionReview | null;
}> {
  try {
    // Fetch decision
    const { data: decision, error: decisionError } = await supabase
      .from('decisions')
      .select('*')
      .eq('id', decisionId)
      .single();

    if (decisionError) {
      if (decisionError.code === 'PGRST116') {
        return { decision: null, options: [], answers: [], analysis: null, review: null };
      }
      throw decisionError;
    }

    // Fetch related data in parallel
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

    return {
      decision,
      options: optionsResult.data || [],
      answers: answersResult.data || [],
      analysis: analysisResult.data,
      review: reviewResult.data,
    };
  } catch (error) {
    throw new RepositoryError('Failed to fetch decision', error);
  }
}

// List user's decisions with optional filtering
export async function getUserDecisions(
  filter?: DecisionFilter,
  limit: number = 50,
  offset: number = 0
): Promise<{ decisions: Decision[]; count: number }> {
  try {
    let query = supabase
      .from('decisions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Exclude practice and archived by default
    if (!filter?.is_practice) {
      query = query.eq('is_practice', false);
    }
    if (filter?.is_practice === true) {
      query = query.eq('is_practice', true);
    }
    if (!filter?.archived) {
      query = query.neq('status', 'archived');
    }

    if (filter?.status) {
      query = query.eq('status', filter.status);
    }

    if (filter?.category) {
      query = query.eq('category', filter.category);
    }

    if (filter?.chapter_id) {
      query = query.eq('chapter_id', filter.chapter_id);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      decisions: data || [],
      count: count || 0,
    };
  } catch (error) {
    throw new RepositoryError('Failed to fetch decisions', error);
  }
}

// Get options for a specific decision
export async function getDecisionOptions(decisionId: string): Promise<DecisionOption[]> {
  try {
    const { data, error } = await supabase
      .from('decision_options')
      .select('*')
      .eq('decision_id', decisionId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    throw new RepositoryError('Failed to fetch options', error);
  }
}

// Get answers for a specific decision
export async function getDecisionAnswers(decisionId: string): Promise<DecisionAnswer[]> {
  try {
    const { data, error } = await supabase
      .from('decision_answers')
      .select('*')
      .eq('decision_id', decisionId);

    if (error) throw error;

    return data || [];
  } catch (error) {
    throw new RepositoryError('Failed to fetch answers', error);
  }
}

// Get analysis for a specific decision
export async function getDecisionAnalysis(decisionId: string): Promise<DecisionAnalysis | null> {
  try {
    const { data, error } = await supabase
      .from('decision_analysis')
      .select('*')
      .eq('decision_id', decisionId)
      .maybeSingle();

    if (error) throw error;

    return data;
  } catch (error) {
    throw new RepositoryError('Failed to fetch analysis', error);
  }
}

// Get review for a specific decision
export async function getDecisionReview(decisionId: string): Promise<DecisionReview | null> {
  try {
    const { data, error } = await supabase
      .from('decision_reviews')
      .select('*')
      .eq('decision_id', decisionId)
      .maybeSingle();

    if (error) throw error;

    return data;
  } catch (error) {
    throw new RepositoryError('Failed to fetch review', error);
  }
}

// Count decisions by status for dashboard
export async function getDecisionStatusCounts(): Promise<Record<DecisionStatus, number>> {
  try {
    const { data, error } = await supabase
      .from('decisions')
      .select('status');

    if (error) throw error;

    const counts: Record<string, number> = {
      draft: 0,
      questions: 0,
      ready_for_analysis: 0,
      analyzed: 0,
      chosen: 0,
      review_scheduled: 0,
      reviewed: 0,
      quick_reviewed: 0,
      archived: 0,
    };

    for (const row of data || []) {
      counts[row.status] = (counts[row.status] || 0) + 1;
    }

    return counts as Record<DecisionStatus, number>;
  } catch (error) {
    throw new RepositoryError('Failed to fetch status counts', error);
  }
}

// Check if user has reached free analysis limit
export async function checkAnalysisLimit(userId: string): Promise<{
  canAnalyze: boolean;
  used: number;
  limit: number;
}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('free_analyses_used, free_analyses_limit')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      canAnalyze: data.free_analyses_used < data.free_analyses_limit,
      used: data.free_analyses_used,
      limit: data.free_analyses_limit,
    };
  } catch (error) {
    throw new RepositoryError('Failed to check analysis limit', error);
  }
}
