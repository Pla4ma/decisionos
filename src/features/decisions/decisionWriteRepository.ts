import { supabase } from '@/lib/supabase';
import { DecisionOption, DecisionAnswer, DecisionAnalysis, DecisionReview, Decision } from './decisionTypes';
import { DecisionOptionInput, DecisionAnswerInput, DecisionAnalysisInput, DecisionReviewInput } from './decisionSchemas';

class RepositoryError extends Error {
  constructor(message: string, public originalError?: unknown) { super(message); this.name = 'RepositoryError'; }
}

export async function addDecisionOption(decisionId: string, input: DecisionOptionInput): Promise<DecisionOption> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('decision_options').insert({
      decision_id: decisionId, user_id: user?.id, title: input.title,
      description: input.description, pros: input.pros || [], cons: input.cons || [],
    }).select().single();
    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');
    return data;
  } catch (error) { throw new RepositoryError('Failed to add option', error); }
}

export async function updateDecisionOption(optionId: string, updates: Partial<DecisionOptionInput>): Promise<DecisionOption> {
  try {
    const { data, error } = await supabase.from('decision_options').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', optionId).select().single();
    if (error) throw error;
    if (!data) throw new Error('No data returned from update');
    return data;
  } catch (error) { throw new RepositoryError('Failed to update option', error); }
}

export async function deleteDecisionOption(optionId: string): Promise<void> {
  try { const { error } = await supabase.from('decision_options').delete().eq('id', optionId); if (error) throw error; }
  catch (error) { throw new RepositoryError('Failed to delete option', error); }
}

export async function chooseDecisionOption(decisionId: string, optionId: string): Promise<void> {
  try {
    await supabase.from('decision_options').update({ is_chosen: false }).eq('decision_id', decisionId);
    const { error } = await supabase.from('decision_options').update({ is_chosen: true }).eq('id', optionId);
    if (error) throw error;
  } catch (error) { throw new RepositoryError('Failed to choose option', error); }
}

export async function saveDecisionAnswers(decisionId: string, answers: DecisionAnswerInput[]): Promise<DecisionAnswer[]> {
  try {
    const { data, error } = await supabase.from('decision_answers').upsert(
      answers.map((a) => ({ decision_id: decisionId, question_key: a.question_key, answer: a.answer })),
      { onConflict: 'decision_id,question_key' }
    ).select();
    if (error) throw error;
    return data || [];
  } catch (error) { throw new RepositoryError('Failed to save answers', error); }
}

export async function saveDecisionAnalysis(decisionId: string, input: DecisionAnalysisInput): Promise<DecisionAnalysis> {
  try {
    const { data, error } = await supabase.from('decision_analysis').upsert({
      decision_id: decisionId, option_scores: input.option_scores, summary: input.summary,
      factors_considered: input.factors_considered, confidence_level: input.confidence_level,
    }, { onConflict: 'decision_id' }).select().single();
    if (error) throw error;
    if (!data) throw new Error('No data returned from upsert');
    return data;
  } catch (error) { throw new RepositoryError('Failed to save analysis', error); }
}

export async function scheduleDecisionReview(decisionId: string, reviewDate: Date): Promise<Decision> {
  try {
    const { data, error } = await supabase.from('decisions').update({
      scheduled_review_at: reviewDate.toISOString(), status: 'review_scheduled', updated_at: new Date().toISOString(),
    }).eq('id', decisionId).select().single();
    if (error) throw error;
    if (!data) throw new Error('No data returned from update');
    return data;
  } catch (error) { throw new RepositoryError('Failed to schedule review', error); }
}

export async function saveDecisionReview(decisionId: string, input: DecisionReviewInput): Promise<DecisionReview> {
  try {
    const { data, error } = await supabase.from('decision_reviews').upsert({
      decision_id: decisionId, chosen_option_id: input.chosen_option_id, outcome_notes: input.outcome_notes,
      satisfaction_score: input.satisfaction_score, would_choose_same: input.would_choose_same, lessons_learned: input.lessons_learned,
    }, { onConflict: 'decision_id' }).select().single();
    if (error) throw error;
    if (!data) throw new Error('No data returned from upsert');
    return data;
  } catch (error) { throw new RepositoryError('Failed to save review', error); }
}
