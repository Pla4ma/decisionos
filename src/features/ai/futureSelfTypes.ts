// Future Self AI Character — A persistent persona that builds continuity
// This is DecisionOS's moat. No competitor has "your future self" as a relationship.

export interface FutureSelfMessage {
  id: string;
  user_id: string;
  message_type: 'weekly_letter' | 'decision_prompt' | 'review_response' | 'milestone_congratulations' | 'warning';
  subject: string;
  body: string;
  context: {
    triggered_by?: string;
    referenced_decision_id?: string;
    prediction_accuracy?: number;
    days_since_last_message?: number;
  };
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  read_at: string | null;
}

export interface FutureSelfProfile {
  user_id: string;
  first_message_at: string;
  total_messages_sent: number;
  total_messages_read: number;
  tone: 'wise' | 'stern' | 'encouraging' | 'philosophical';
  last_topic: string | null;
  knowledge_breadth: number;
}

export const FUTURE_SELF_TONES: Record<FutureSelfProfile['tone'], { description: string; style: string }> = {
  wise: { description: 'Calm, reflective, timeless', style: 'Speaks with the patience of someone who has seen it all play out.' },
  stern: { description: 'Direct, no-nonsense, accountability', style: 'Tells you what you need to hear, not what you want to hear.' },
  encouraging: { description: 'Supportive, warm, affirming', style: 'Believes in you and reminds you of your growth.' },
  philosophical: { description: 'Abstract, thought-provoking, deep', style: 'Poses questions more than gives answers.' },
};

export function generateFutureSelfLetter(
  userName: string,
  recentDecisionCount: number,
  dqScore: number,
  archetype: string,
  isReviewOverdue: boolean,
  streakCount: number,
): { subject: string; body: string; tone: FutureSelfProfile['tone'] } {
  const tone: FutureSelfProfile['tone'] = dqScore > 60 ? 'encouraging' : dqScore > 30 ? 'wise' : 'stern';

  if (isReviewOverdue) {
    return {
      subject: 'There\'s something you haven\'t looked at',
      tone: 'stern',
      body: `Hey ${userName},
      
I've been waiting to hear how that decision turned out. I know — life moves fast. But every choice you don't review is a lesson you don't learn.

Future you (me) needs past you (you) to close the loop. Take 2 minutes today.

— Future You (${Math.floor(Math.random() * 20 + 5)} years from now)`,
    };
  }

  if (recentDecisionCount >= 3 && streakCount >= 5) {
    return {
      subject: 'You\'re building something rare',
      tone: 'encouraging',
      body: `${userName},

Most people never look back at their decisions. You've reviewed ${recentDecisionCount} of them. That puts you in the top 1% of deliberate thinkers.

Keep going. The person you're becoming thanks you.

— Future You`,
    };
  }

  if (recentDecisionCount === 0) {
    return {
      subject: 'A quiet moment of clarity',
      tone: 'philosophical',
      body: `Hello,

You don't need a big decision to practice clarity. Sometimes the most important choice is simply choosing to pay attention today.

What's one small thing you've been putting off? That's your answer.

— Future You`,
    };
  }

  const messages = [
    {
      subject: 'The decisions you make today...',
      tone: 'wise' as const,
      body: `...are the memories you'll live with tomorrow. I know that sounds dramatic. But I'm writing from the future, so trust me on this.

The choice that feels impossible right now? It's going to work out. The one that feels easy? Think twice.

You've got this.

— Future You`,
    },
    {
      subject: `A ${archetype}'s reflection`,
      tone: 'encouraging' as const,
      body: `${userName},

You've earned the "${archetype}" archetype for a reason. Your DQ of ${dqScore} shows real growth.

But here's the thing about clarity: it's not a destination. It's a daily practice. Keep showing up.

— Future You`,
    },
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}
