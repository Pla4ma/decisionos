// Safe Analytics Wrapper
// Privacy-preserving analytics that NEVER logs sensitive decision content

// Allowed analytics events (no sensitive data)
type AllowedEvent =
  | 'decision_created'
  | 'decision_analyzed'
  | 'decision_option_chosen'
  | 'decision_reviewed'
  | 'paywall_viewed'
  | 'subscription_started'
  | 'app_opened'
  | 'screen_viewed';

// Safe properties that can be logged (no decision content)
interface SafeProperties {
  // Decision metadata only (no content)
  decision_id?: string; // UUID only, not title
  category?: string; // e.g., 'career', 'money' (not sensitive)
  status?: string; // e.g., 'draft', 'analyzed'
  option_count?: number; // Count only, no titles
  has_context?: boolean; // Boolean only, no text

  // Screen/feature analytics
  screen_name?: string;
  feature_name?: string;

  // Subscription/tier
  tier?: 'free' | 'plus' | 'pro';

  // Timing (for performance)
  duration_ms?: number;

  // Error tracking (no stack traces with data)
  error_type?: string;
  error_code?: string;
}

// Analytics interface for pluggable backends
export interface AnalyticsBackend {
  track(event: string, properties?: SafeProperties): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
  reset(): void;
}

// Console backend (for development)
const consoleBackend: AnalyticsBackend = {
  track(event: string, properties?: SafeProperties) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[Analytics]', event, properties);
    }
  },
  identify(userId: string, traits?: Record<string, unknown>) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[Analytics] Identify:', userId, traits);
    }
  },
  reset() {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[Analytics] Reset');
    }
  },
};

// No-op backend (production default until real analytics configured)
const noopBackend: AnalyticsBackend = {
  track() { /* no-op */ },
  identify() { /* no-op */ },
  reset() { /* no-op */ },
};

// Active backend (can be swapped for PostHog, Amplitude, etc.)
let activeBackend: AnalyticsBackend = process.env.NODE_ENV === 'development' ? consoleBackend : noopBackend;

// Configure analytics backend
export function configureAnalytics(backend: AnalyticsBackend): void {
  activeBackend = backend;
}

// Track a safe event
export function trackEvent(event: AllowedEvent, properties?: SafeProperties): void {
  // Validate no sensitive content in properties
  const sanitized = sanitizeProperties(properties);
  activeBackend.track(event, sanitized);
}

// Identify user (no PII except userId which is UUID)
export function identifyUser(userId: string, tier?: 'free' | 'plus' | 'pro'): void {
  activeBackend.identify(userId, { tier });
}

// Reset analytics on sign out
export function resetAnalytics(): void {
  activeBackend.reset();
}

// Sanitize properties to ensure no sensitive content
function sanitizeProperties(properties?: SafeProperties): SafeProperties | undefined {
  if (!properties) return undefined;

  // Clone to avoid mutation
  const sanitized: SafeProperties = { ...properties };

  // Validate string fields don't contain long text (likely content)
  const stringFields: (keyof SafeProperties)[] = ['decision_id', 'category', 'status', 'screen_name', 'feature_name', 'error_type', 'error_code'];

  for (const field of stringFields) {
    const value = sanitized[field];
    if (typeof value === 'string' && value.length > 100) {
      // Likely contains content, remove it
      delete sanitized[field];
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn(`[Analytics] Removed potentially sensitive field: ${field}`);
      }
    }
  }

  // Ensure decision_id is UUID format only (not title)
  if (sanitized.decision_id && !isValidUUID(sanitized.decision_id)) {
    delete sanitized.decision_id;
  }

  return sanitized;
}

// Validate UUID format
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Pre-defined safe tracking functions
export const analytics = {
  // Decision lifecycle
  decisionCreated: (decisionId: string, category: string) =>
    trackEvent('decision_created', { decision_id: decisionId, category }),

  decisionAnalyzed: (decisionId: string, tier: 'free' | 'plus' | 'pro') =>
    trackEvent('decision_analyzed', { decision_id: decisionId, tier }),

  decisionOptionChosen: (decisionId: string) =>
    trackEvent('decision_option_chosen', { decision_id: decisionId }),

  decisionReviewed: (decisionId: string) =>
    trackEvent('decision_reviewed', { decision_id: decisionId }),

  // Monetization
  paywallViewed: (tier: 'free' | 'plus' | 'pro') =>
    trackEvent('paywall_viewed', { tier }),

  subscriptionStarted: (tier: 'plus' | 'pro') =>
    trackEvent('subscription_started', { tier }),

  // App lifecycle
  appOpened: () => trackEvent('app_opened'),

  screenViewed: (screenName: string) =>
    trackEvent('screen_viewed', { screen_name: screenName }),
};

// Development flag — uses global __DEV__ from React Native
