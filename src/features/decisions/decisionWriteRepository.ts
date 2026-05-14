// Decision Write Repository
// All write operations for decision domain

import { supabase } from '@/lib/supabase';
import {
  Decision,
  DecisionOption,
  DecisionAnswer,
  DecisionAnalysis,
  DecisionReview,
} from './decisionTypes';
import {
  CreateDecisionInput,
  DecisionOptionInput,
  DecisionAnswerInput,
  DecisionAnalysisInput,
  DecisionReviewInput,
} from './decisionSchemas';

// Error wrapper for consistent error handling
class RepositoryError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'RepositoryError';
  }
}

// Create a new decision
export async function createDecision(
  input: CreateDecisionInput
): Promise<Decision> {
  try {
    const { data, error } = await supabase
      .from('decisions')
      .insert({
        title: input.title,
        context: input.context,
        category: input.category,
        importance: input.importance,
        urgency: input.urgency,
        is_practice: input.is_practice || false,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');

    return data;
  } catch (error) {
    throw new RepositoryError('Failed to create decision', error);
  }
}

// Update a decision
export async function updateDecision(
  decisionId: string,
  updates: Partial<CreateDecisionInput>
): Promise<Decision> {
  try {
    const { data, error } = await supabase
      .from('decisions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', decisionId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from update');

    return data;
  } catch (error) {
    throw new RepositoryError('Failed to update decision', error);
  }
}

// Delete a decision (cascades to options, answers, analysis, review)
export async function deleteDecision(decisionId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('decisions')
      .delete()
      .eq('id', decisionId);

    if (error) throw error;
  } catch (error) {
    throw new RepositoryError('Failed to delete decision', error);
  }
}

// Add an option to a decision
export async function addDecisionOption(
  decisionId: string,
  input: DecisionOptionInput
): Promise<DecisionOption> {
  try {
    const { data, error } = await supabase
      .from('decision_options')
      .insert({
        decision_id: decisionId,
        title: input.title,
        description: input.description,
        pros: input.pros || [],
        cons: input.cons || [],
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');

    return data;
  } catch (error) {
    throw new RepositoryError('Failed to add option', error);
  }
}

// Update an option
export async function updateDecisionOption(
  optionId: string,
  updates: Partial<DecisionOptionInput>
): Promise<DecisionOption> {
  try {
    const { data, error } = await supabase
      .from('decision_options')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', optionId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from update');

    return data;
  } catch (error) {
    throw new RepositoryError('Failed to update option', error);
  }
}

// Delete an option
export async function deleteDecisionOption(optionId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('decision_options')
      .delete()
      .eq('id', optionId);

    if (error) throw error;
  } catch (error) {
    throw new RepositoryError('Failed to delete option', error);
  }
}

// Mark an option as chosen
export async function chooseDecisionOption(
  decisionId: string,
  optionId: string
): Promise<void> {
  try {
    // First, unchoose all options for this decision
    await supabase
      .from('decision_options')
      .update({ is_chosen: false })
      .eq('decision_id', decisionId);

    // Then mark the chosen one
    const { error } = await supabase
      .from('decision_options')
      .update({ is_chosen: true })
      .eq('id', optionId);

    if (error) throw error;
  } catch (error) {
    throw new RepositoryError('Failed to choose option', error);
  }
}

// Save answers for a decision
export async function saveDecisionAnswers(
  decisionId: string,
  answers: DecisionAnswerInput[]
): Promise<DecisionAnswer[]> {
  try {
    const answersWithDecisionId = answers.map((a) => ({
      decision_id: decisionId,
      question_key: a.question_key,
      answer: a.answer,
    }));

    const { data, error } = await supabase
      .from('decision_answers')
      .upsert(answersWithDecisionId, { onConflict: 'decision_id,question_key' })
      .select();

    if (error) throw error;

    return data || [];
  } catch (error) {
    throw new RepositoryError('Failed to save answers', error);
  }
}

// Save analysis for a decision
export async function saveDecisionAnalysis(
  decisionId: string,
  input: DecisionAnalysisInput
): Promise<DecisionAnalysis> {
  try {
    const { data, error } = await supabase
      .from('decision_analysis')
      .upsert({
        decision_id: decisionId,
        option_scores: input.option_scores,
        summary: input.summary,
        factors_considered: input.factors_considered,
        confidence_level: input.confidence_level,
      }, { onConflict: 'decision_id' })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from upsert');

    return data;
  } catch (error) {
    throw new RepositoryError('Failed to save analysis', error);
  }
}

// Schedule a review for a decision
export async function scheduleDecisionReview(
  decisionId: string,
  reviewDate: Date
): Promise<Decision> {
  try {
    const { data, error } = await supabase
      .from('decisions')
      .update({
        scheduled_review_at: reviewDate.toISOString(),
        status: 'review_scheduled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', decisionId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from update');

    return data;
  } catch (error) {
    throw new RepositoryError('Failed to schedule review', error);
  }
}

// Save a review for a decision
export async function saveDecisionReview(
  decisionId: string,
  input: DecisionReviewInput
): Promise<DecisionReview> {
  try {
    const { data, error } = await supabase
      .from('decision_reviews')
      .upsert({
        decision_id: decisionId,
        chosen_option_id: input.chosen_option_id,
        outcome_notes: input.outcome_notes,
        satisfaction_score: input.satisfaction_score,
        would_choose_same: input.would_choose_same,
        lessons_learned: input.lessons_learned,
      }, { onConflict: 'decision_id' })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from upsert');

    return data;
  } catch (error) {
    throw new RepositoryError('Failed to save review', error);
  }
}

// Update decision status
export async function updateDecisionStatus(
  decisionId: string,
  status: Decision['status']
): Promise<void> {
  try {
    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'reviewed') {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('decisions')
      .update(updates)
      .eq('id', decisionId);

    if (error) throw error;
  } catch (error) {
    throw new RepositoryError('Failed to update status', error);
  }
}
