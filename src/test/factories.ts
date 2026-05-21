import { Decision, DecisionStatus, DecisionCategory } from '@/features/decisions/decisionTypes';

export function buildMockDecision(overrides: Partial<Decision> = {}): Decision {
  return {
    id: 'test-decision-id',
    user_id: 'test-user-id',
    title: 'Test Decision',
    context: null,
    category: 'career' as DecisionCategory,
    status: 'draft' as DecisionStatus,
    importance: 5,
    urgency: 5,
    is_practice: false,
    chapter_id: null,
    graveyard_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    scheduled_review_at: null,
    completed_at: null,
    ...overrides,
  };
}

export function buildMockUsageLimitStatus(overrides: Record<string, unknown> = {}) {
  return {
    tier: 'free' as const,
    analysesUsed: 0,
    analysesLimit: 3,
    analysesRemaining: 3,
    periodStart: new Date().toISOString(),
    periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    canAnalyze: true,
    isBackendVerified: true,
    ...overrides,
  };
}

export function buildMockStatusCounts() {
  return {
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
}
