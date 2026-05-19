import { supabase } from '@/lib/supabase';
import { Decision } from './decisionTypes';
import { CreateDecisionInput } from './decisionSchemas';

class RepositoryError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export async function createDecision(input: CreateDecisionInput): Promise<Decision> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('decisions').insert({
      user_id: user?.id, title: input.title, context: input.context,
      category: input.category, importance: input.importance, urgency: input.urgency,
      is_practice: input.is_practice || false,
    }).select().single();
    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');
    return data;
  } catch (error) { throw new RepositoryError('Failed to create decision', error); }
}

export async function updateDecision(decisionId: string, updates: Partial<CreateDecisionInput>): Promise<Decision> {
  try {
    const { data, error } = await supabase.from('decisions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', decisionId).select().single();
    if (error) throw error;
    if (!data) throw new Error('No data returned from update');
    return data;
  } catch (error) { throw new RepositoryError('Failed to update decision', error); }
}

export async function deleteDecision(decisionId: string): Promise<void> {
  try {
    const { error } = await supabase.from('decisions').delete().eq('id', decisionId);
    if (error) throw error;
  } catch (error) { throw new RepositoryError('Failed to delete decision', error); }
}

export async function updateDecisionStatus(decisionId: string, status: Decision['status']): Promise<void> {
  try {
    const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === 'reviewed') updates.completed_at = new Date().toISOString();
    const { error } = await supabase.from('decisions').update(updates).eq('id', decisionId);
    if (error) throw error;
  } catch (error) { throw new RepositoryError('Failed to update status', error); }
}
