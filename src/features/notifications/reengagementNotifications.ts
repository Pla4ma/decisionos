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
  if (seq.decisionCount === 0) {
    return {
      title: 'One question can change everything',
      body: 'What decision have you been putting off? DecisionOS helps you think it through in 5 minutes.',
      deeplink: '/decisions/new?quick=true',
    };
  }

  if (seq.hasDrafts) {
    return {
      title: 'You left a decision unfinished',
      body: 'Your draft is waiting. Come back and finish it — you were making progress.',
      deeplink: '/decisions',
    };
  }

  if (seq.hasUnreviewedDecisions) {
    return {
      title: 'How did that turn out?',
      body: 'You chose an option but haven\'t checked in. A quick 10-second review helps you learn.',
      deeplink: '/decisions',
    };
  }

  if (seq.daySinceLastVisit <= 7) {
    return {
      title: 'Your decisions are waiting',
      body: `It's been ${seq.daySinceLastVisit} days. Check in to keep your perspective sharp.`,
    };
  }

  if (seq.daySinceLastVisit <= 30) {
    return {
      title: 'Life keeps happening',
      body: 'New decisions come up every day. DecisionOS helps you make them with clarity.',
    };
  }

  const messages = [
    { title: 'Your future self will thank you', body: 'The best time to start thinking clearly was yesterday. The second best time is now.' },
    { title: 'Still making decisions without a framework?', body: 'Most regrets come from rushed choices. DecisionOS gives you clarity in minutes.' },
    { title: 'We saved your spot', body: 'Your decision history is still here when you\'re ready. No pressure, just clarity.' },
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}
