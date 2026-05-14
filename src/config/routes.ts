// Navigation Route Constants
// Single source of truth for ALL route strings.
// Every screen must use these constants for navigation — never hardcode route strings.

export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/auth/sign-in',
  SIGN_UP: '/auth/sign-up',
  ONBOARDING: '/onboarding',
  ONBOARDING_PRIVACY: '/onboarding/privacy',
  ONBOARDING_VALUES: '/onboarding/values',
  DECISIONS_LIST: '/decisions',
  DECISIONS_NEW: '/decisions/new',
  DECISIONS_NEW_QUICK: '/decisions/new?quick=true',
  DECISIONS_NEW_PRACTICE: '/decisions/new?practice=true',
  DECISION_DETAIL: (id: string) => `/decisions/${id}`,
  DECISION_ANALYSIS: (id: string) => `/decisions/${id}/analysis`,
  DECISION_COMMIT: (id: string) => `/decisions/${id}/commit`,
  DECISION_SCHEDULE: (id: string) => `/decisions/${id}/schedule`,
  DECISION_REVIEW: (id: string) => `/decisions/${id}/review`,
  PAYWALL: '/paywall',
  SETTINGS: '/settings',
} as const;

// Route parameter types for type-safe navigation
export type RouteName = keyof typeof ROUTES;

export interface RouteMap {
  HOME: undefined;
  SIGN_IN: undefined;
  SIGN_UP: undefined;
  ONBOARDING: undefined;
  ONBOARDING_PRIVACY: undefined;
  ONBOARDING_VALUES: undefined;
  DECISIONS_LIST: undefined;
  DECISIONS_NEW: { template?: string; quick?: string; practice?: string; thought?: string };
  DECISION_DETAIL: { id: string };
  DECISION_ANALYSIS: { id: string };
  DECISION_COMMIT: { id: string; optionId?: string };
  DECISION_SCHEDULE: { id: string };
  DECISION_REVIEW: { id: string };
  PAYWALL: undefined;
  SETTINGS: undefined;
}

// Flow transitions — which screens connect to which
export const FLOW_TRANSITIONS: Record<string, string[]> = {
  HOME: ['DECISIONS_NEW', 'DECISIONS_NEW_QUICK', 'DECISION_DETAIL', 'SETTINGS', 'DECISIONS_LIST', 'PAYWALL'],
  DECISIONS_NEW: ['DECISION_DETAIL', 'HOME'],
  DECISION_DETAIL: ['DECISION_ANALYSIS', 'DECISION_COMMIT', 'DECISION_SCHEDULE', 'DECISION_REVIEW', 'HOME', 'DECISIONS_LIST'],
  DECISION_ANALYSIS: ['DECISION_COMMIT', 'DECISION_DETAIL'],
  DECISION_COMMIT: ['DECISION_SCHEDULE', 'DECISION_DETAIL'],
  DECISION_SCHEDULE: ['HOME', 'DECISION_DETAIL'],
  DECISION_REVIEW: ['DECISION_DETAIL', 'HOME'],
  SETTINGS: ['HOME', 'SIGN_IN'],
  SIGN_IN: ['HOME', 'SIGN_UP'],
  SIGN_UP: ['HOME', 'SIGN_IN'],
  ONBOARDING: ['ONBOARDING_PRIVACY', 'ONBOARDING_VALUES', 'HOME'],
  PAYWALL: ['HOME', 'SETTINGS'],
};
