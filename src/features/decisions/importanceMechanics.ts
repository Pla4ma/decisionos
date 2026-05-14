// Importance & Urgency Mechanics — Make sliders actually affect gameplay

import { Decision } from './decisionTypes';

export interface ImportanceEffect {
  requiresMoreOptions: boolean;
  requiresMoreQuestions: boolean;
  suggestsSleepOnIt: boolean;
  unlocksDeeperAnalysis: boolean;
  reviewUrgency: number; // multiplier for how soon to suggest review
}

export function getImportanceEffects(importance: number, urgency: number): ImportanceEffect {
  return {
    requiresMoreOptions: importance >= 7,
    requiresMoreQuestions: importance >= 8,
    suggestsSleepOnIt: importance >= 8 && urgency <= 3,
    unlocksDeeperAnalysis: importance >= 6,
    reviewUrgency: Math.max(1, urgency / 3),
  };
}

// Adjust AI analysis depth based on importance
export function getAnalysisDepth(importance: number): 'quick' | 'standard' | 'deep' {
  if (importance <= 3) return 'quick';
  if (importance <= 6) return 'standard';
  return 'deep';
}

// Get recommended review interval based on importance/urgency
export function getRecommendedReviewDays(decision: Pick<Decision, 'importance' | 'urgency'>): number {
  const score = decision.importance + decision.urgency;

  if (score >= 17) return 7;  // High importance + high urgency = review soon
  if (score >= 13) return 30;  // Moderate
  if (score >= 9) return 90;   // Lower stakes
  return 180;  // Very low stakes = review much later
}

// Get priority score for sorting/recommendation
export function getDecisionPriority(decision: Decision): number {
  // Higher score = higher priority
  const importanceWeight = decision.importance * 10;
  const urgencyWeight = decision.urgency * 5;

  // Reviews that are overdue get massive priority
  let reviewBonus = 0;
  if (decision.scheduled_review_at) {
    const reviewDate = new Date(decision.scheduled_review_at);
    const now = new Date();
    const daysOverdue = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysOverdue > 0) {
      reviewBonus = Math.min(daysOverdue * 50, 500);
    }
  }

  return importanceWeight + urgencyWeight + reviewBonus;
}

// Suggested "sleep on it" prompt for high-importance decisions
export function getSleepOnItPrompt(importance: number): string | null {
  if (importance >= 8) {
    return 'This is a high-stakes decision. Consider saving a draft and sleeping on it before committing.';
  }
  return null;
}

// Analysis confidence modifier based on input quality
export function getAnalysisConfidenceModifier(optionsCount: number, answersCount: number): number {
  let modifier = 1.0;

  // Fewer options = less confidence
  if (optionsCount < 3) modifier -= 0.1;
  if (optionsCount >= 4) modifier += 0.05;

  // More answers = more confidence
  if (answersCount >= 6) modifier += 0.1;
  if (answersCount >= 4) modifier += 0.05;

  return Math.max(0.5, Math.min(1.0, modifier));
}
