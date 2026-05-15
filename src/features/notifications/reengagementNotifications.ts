import { supabase } from '@/lib/supabase';

export interface ReEngagementSequence {
  userId: string;
  daySinceLastVisit: number;
  decisionCount: number;
  hasDrafts: boolean;
  hasUnreviewedDecisions: boolean;
  lastStreak: number;
}

export async function getReEngagementSequence(userId: string): Promise<ReEngagementSequence | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('last_active_at, updated_at')
    .eq('id', userId)
    .single();
  if (!profile) return null;

  const lastActive = profile.last_active_at ? new Date(profile.last_active_at) : new Date(profile.updated_at);
  const daysSince = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

  const { count: decisionCount } = await supabase
    .from('decisions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const { count: draftCount } = await supabase
    .from('decisions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'draft');

  const { count: unreviewedCount } = await supabase
    .from('decisions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'chosen');

  const { data: streak } = await supabase
    .from('daily_streaks')
    .select('current_streak')
    .eq('user_id', userId)
    .single();

  return {
    userId,
    daySinceLastVisit: daysSince,
    decisionCount: decisionCount || 0,
    hasDrafts: (draftCount || 0) > 0,
    hasUnreviewedDecisions: (unreviewedCount || 0) > 0,
    lastStreak: streak?.current_streak || 0,
  };
}

export function getReEngagementMessage(seq: ReEngagementSequence): { title: string; body: string; deeplink?: string } {
  // Priority 1: Unfinished draft
  if (seq.hasDrafts) {
    return {
      title: 'Complete your draft',
      body: 'You left a decision half-written. Finishing it now takes less time than starting over later.',
      deeplink: '/decisions',
    };
  }

  // Priority 2: Unreviewed decision
  if (seq.hasUnreviewedDecisions) {
    return {
      title: 'How did that choice work out?',
      body: 'A quick 10-second check-in helps you learn and improves future analysis.',
      deeplink: '/decisions',
    };
  }

  // Priority 3: New user who hasn't created a decision yet
  if (seq.decisionCount === 0) {
    return {
      title: 'One question can change everything',
      body: 'What decision have you been putting off? Try a quick decision to see how it works.',
      deeplink: '/decisions/new?quick=true',
    };
  }

  // Priority 4: Returning user with history (gentle reminders)
  return {
    title: 'Your decision history is ready',
    body: `You have ${seq.decisionCount} past decision${seq.decisionCount > 1 ? 's' : ''}. Reviewing old choices reveals patterns that help with new ones.`,
    deeplink: '/decisions',
  };
}
