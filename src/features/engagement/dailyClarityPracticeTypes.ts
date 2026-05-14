// Daily Clarity Practice — The core daily habit, not a side feature
// Replaces practice mode. This is what users open the app for.

export type PracticeType =
  | 'morning_reflection'   // "What's on your mind today?" — free-form clarity exercise
  | 'daily_dilemma'        // AI-generated scenario based on user's categories
  | 'values_check'         // "Does your current decision align with X value?"
  | 'bias_spotting'        // "Which bias might be affecting your thinking today?"
  | 'future_self_message'; // A letter from future you about today

export interface DailyPractice {
  id: string;
  user_id: string;
  date: string;
  practice_type: PracticeType;
  title: string;
  prompt: string;
  context: string | null;
  is_completed: boolean;
  user_response: string | null;
  reflection: string | null;
  time_spent_seconds: number;
  created_at: string;
  completed_at: string | null;
}

export interface PracticePrompt {
  type: PracticeType;
  title: string;
  prompt: string;
  context: string | null;
  estimated_minutes: number;
}

export const PRACTICE_TYPES_CONFIG: Record<PracticeType, { label: string; icon: string; description: string }> = {
  morning_reflection: {
    label: 'Morning Clarity',
    icon: '🌅',
    description: 'Clear your mind before the day\'s decisions',
  },
  daily_dilemma: {
    label: 'Today\'s Dilemma',
    icon: '⚖️',
    description: 'Sharpen your thinking on a real-world scenario',
  },
  values_check: {
    label: 'Values Alignment',
    icon: '🎯',
    description: 'Are your choices matching what matters to you?',
  },
  bias_spotting: {
    label: 'Bias Check',
    icon: '🔍',
    description: 'Train your bias detection muscle',
  },
  future_self_message: {
    label: 'Future Self',
    icon: '📜',
    description: 'A perspective from your future self',
  },
};

export function generateDailyPracticePrompt(userId: string, recentDecisions: number, activeBiases: string[], values: string[]): PracticePrompt {
  const dayOfYear = new Date().getDate();
  const types: PracticeType[] = ['morning_reflection', 'daily_dilemma', 'values_check', 'bias_spotting', 'future_self_message'];
  const selectedType = types[dayOfYear % types.length];

  switch (selectedType) {
    case 'morning_reflection':
      return {
        type: 'morning_reflection',
        title: 'Morning Clarity Exercise',
        prompt: recentDecisions > 0
          ? 'What decision are you most likely to face today? Take 60 seconds to write what comes to mind.'
          : 'What\'s one question you\'d like clarity on today? Write freely — no structure needed.',
        context: null,
        estimated_minutes: 2,
      };

    case 'daily_dilemma': {
      const scenarios = [
        { title: 'The Opportunity Cost', prompt: 'You have two good opportunities but can only pursue one. What matters more: the potential upside of the unknown, or the certainty of what you have?', context: 'Based on thousands of decisions: most people regret the path not taken more than the path taken. Does knowing this change your thinking?' },
        { title: 'The Advice Test', prompt: 'If your best friend came to you with exactly this situation, what would you tell them? Now ask yourself: why is it harder to take your own advice?', context: 'Psychological distance reduces emotional bias. The advice you give others is often better than the decisions you make for yourself.' },
        { title: 'The 10-10-10 Rule', prompt: 'How will you feel about this decision in 10 minutes? 10 months? 10 years?', context: 'Temporal distance reveals what truly matters. Short-term emotions fade; long-term values persist.' },
        { title: 'The Regret Test', prompt: 'If you chose Option A, what would you regret most? If you chose Option B, what would you regret most? Which regret is heavier?', context: 'Regret is not symmetrical. One path\'s regret is usually more painful than the other\'s.' },
      ];
      const scenario = scenarios[dayOfYear % scenarios.length];
      return {
        type: 'daily_dilemma',
        title: scenario.title,
        prompt: scenario.prompt,
        context: scenario.context,
        estimated_minutes: 3,
      };
    }

    case 'values_check': {
      const valuePrompts = values.length > 0
        ? [
            { title: 'Values Check', prompt: `One of your core values is "${values[0]}". Does your current biggest decision honor this value?`, context: 'Values are only meaningful when they guide choices, not just when they feel good.' },
            { title: 'Values in Conflict', prompt: 'When two values conflict (e.g., security vs. freedom), how do you choose which to prioritize?', context: 'The most difficult decisions aren\'t between good and bad — they\'re between two goods.' },
          ]
        : [{ title: 'Discover Your Values', prompt: 'When have you felt most aligned with yourself? What values were present in that moment?', context: 'Your values are the compass. Most regrets come from ignoring them.' }];
      return {
        type: 'values_check',
        title: valuePrompts[0].title,
        prompt: valuePrompts[0].prompt,
        context: valuePrompts[0].context,
        estimated_minutes: 3,
      };
    }

    case 'bias_spotting': {
      const biasName = activeBiases.length > 0 ? activeBiases[Math.floor(Math.random() * activeBiases.length)] : 'Confirmation Bias';
      return {
        type: 'bias_spotting',
        title: 'Spot the Bias',
        prompt: activeBiases.length > 0
          ? `You've shown a tendency toward "${biasName}" in past decisions. Think about today's biggest open question — is this bias influencing you?`
          : 'Think about a recent choice. Did you seek out information that confirmed what you already wanted to believe?',
        context: 'Bias awareness is the first step. The second step is asking "what would I think if I wanted the opposite?"',
        estimated_minutes: 2,
      };
    }

    case 'future_self_message':
      return {
        type: 'future_self_message',
        title: 'Letter From Future You',
        prompt: 'Imagine yourself 5 years from now, having made today\'s decision. What would that version of you want you to know right now?',
        context: 'Your future self has clarity that your present self lacks. They can see which fears were overblown and which risks were worth it.',
        estimated_minutes: 3,
      };
  }
}
