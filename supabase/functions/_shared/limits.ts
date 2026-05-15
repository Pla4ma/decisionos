// Shared usage limits for Edge Functions

export const FREE_MONTHLY_DEEP_ANALYSES = 3;
export const PLUS_MONTHLY_DEEP_ANALYSES = 50;
export const PRO_MONTHLY_DEEP_ANALYSES = 200;

export const FREE_MONTHLY_BIAS_CHECKS = 10;
export const PLUS_MONTHLY_BIAS_CHECKS = 100;
export const PRO_MONTHLY_BIAS_CHECKS = 500;

export const FREE_MONTHLY_HINDSIGHT = 3;
export const PLUS_MONTHLY_HINDSIGHT = 25;
export const PRO_MONTHLY_HINDSIGHT = 100;

export type AiEventType = 'deep_analysis' | 'bias_detection' | 'hindsight_comparison';

export function getMonthlyLimit(tier: string, eventType: AiEventType): number {
  switch (eventType) {
    case 'deep_analysis':
      switch (tier) {
        case 'pro': return PRO_MONTHLY_DEEP_ANALYSES;
        case 'plus': return PLUS_MONTHLY_DEEP_ANALYSES;
        default: return FREE_MONTHLY_DEEP_ANALYSES;
      }
    case 'bias_detection':
      switch (tier) {
        case 'pro': return PRO_MONTHLY_BIAS_CHECKS;
        case 'plus': return PLUS_MONTHLY_BIAS_CHECKS;
        default: return FREE_MONTHLY_BIAS_CHECKS;
      }
    case 'hindsight_comparison':
      switch (tier) {
        case 'pro': return PRO_MONTHLY_HINDSIGHT;
        case 'plus': return PLUS_MONTHLY_HINDSIGHT;
        default: return FREE_MONTHLY_HINDSIGHT;
      }
  }
}

export function getLimitExceededMessage(eventType: AiEventType): string {
  switch (eventType) {
    case 'deep_analysis':
      return 'Monthly deep analysis limit reached. Upgrade to Plus for more analyses.';
    case 'bias_detection':
      return 'Monthly bias check limit reached. Upgrade to Plus for more checks.';
    case 'hindsight_comparison':
      return 'Monthly hindsight comparison limit reached. Upgrade to Plus for more comparisons.';
  }
}
