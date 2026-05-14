// Analytics Tests
// Tests for privacy-safe analytics wrapper

import {
  trackEvent,
  identifyUser,
  resetAnalytics,
  configureAnalytics,
  analytics,
  type AnalyticsBackend,
} from './analytics';

describe('analytics', () => {
  // Mock backend for testing
  const mockBackend: AnalyticsBackend = {
    track: jest.fn(),
    identify: jest.fn(),
    reset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    configureAnalytics(mockBackend);
  });

  describe('trackEvent', () => {
    test('tracks allowed events', () => {
      trackEvent('decision_created', { decision_id: '550e8400-e29b-41d4-a716-446655440000' });
      expect(mockBackend.track).toHaveBeenCalledWith(
        'decision_created',
        expect.objectContaining({ decision_id: '550e8400-e29b-41d4-a716-446655440000' })
      );
    });

    test('sanitizes long text in properties', () => {
      const longText = 'a'.repeat(150);
      trackEvent('decision_created', { category: longText });
      // Long text should be removed during sanitization
      const callArgs = (mockBackend.track as jest.Mock).mock.calls[0];
      expect(callArgs[1].category).toBeUndefined();
    });

    test('validates UUID format for decision_id', () => {
      trackEvent('decision_created', { decision_id: 'not-a-uuid' });
      const callArgs = (mockBackend.track as jest.Mock).mock.calls[0];
      expect(callArgs[1].decision_id).toBeUndefined();
    });

    test('allows valid UUID', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      trackEvent('decision_created', { decision_id: validUuid });
      const callArgs = (mockBackend.track as jest.Mock).mock.calls[0];
      expect(callArgs[1].decision_id).toBe(validUuid);
    });

    test('tracks screen views', () => {
      trackEvent('screen_viewed', { screen_name: 'decision-detail' });
      expect(mockBackend.track).toHaveBeenCalledWith(
        'screen_viewed',
        expect.objectContaining({ screen_name: 'decision-detail' })
      );
    });

    test('tracks paywall view', () => {
      trackEvent('paywall_viewed', { tier: 'free' });
      expect(mockBackend.track).toHaveBeenCalledWith(
        'paywall_viewed',
        expect.objectContaining({ tier: 'free' })
      );
    });
  });

  describe('identifyUser', () => {
    test('identifies with userId', () => {
      identifyUser('user-123');
      expect(mockBackend.identify).toHaveBeenCalledWith('user-123', {});
    });

    test('identifies with tier', () => {
      identifyUser('user-123', 'plus');
      expect(mockBackend.identify).toHaveBeenCalledWith('user-123', { tier: 'plus' });
    });

    test('identifies with free tier', () => {
      identifyUser('user-123', 'free');
      expect(mockBackend.identify).toHaveBeenCalledWith('user-123', { tier: 'free' });
    });
  });

  describe('resetAnalytics', () => {
    test('calls backend reset', () => {
      resetAnalytics();
      expect(mockBackend.reset).toHaveBeenCalled();
    });
  });

  describe('analytics helper functions', () => {
    test('analytics.decisionCreated tracks correctly', () => {
      const decisionId = '550e8400-e29b-41d4-a716-446655440000';
      analytics.decisionCreated(decisionId, 'career');
      expect(mockBackend.track).toHaveBeenCalledWith(
        'decision_created',
        expect.objectContaining({
          decision_id: decisionId,
          category: 'career',
        })
      );
    });

    test('analytics.decisionAnalyzed tracks with tier', () => {
      const decisionId = '550e8400-e29b-41d4-a716-446655440000';
      analytics.decisionAnalyzed(decisionId, 'plus');
      expect(mockBackend.track).toHaveBeenCalledWith(
        'decision_analyzed',
        expect.objectContaining({
          decision_id: decisionId,
          tier: 'plus',
        })
      );
    });

    test('analytics.paywallViewed tracks correctly', () => {
      analytics.paywallViewed('free');
      expect(mockBackend.track).toHaveBeenCalledWith(
        'paywall_viewed',
        expect.objectContaining({ tier: 'free' })
      );
    });

    test('analytics.subscriptionStarted tracks correctly', () => {
      analytics.subscriptionStarted('plus');
      expect(mockBackend.track).toHaveBeenCalledWith(
        'subscription_started',
        expect.objectContaining({ tier: 'plus' })
      );
    });

    test('analytics.screenViewed tracks correctly', () => {
      analytics.screenViewed('home');
      expect(mockBackend.track).toHaveBeenCalledWith(
        'screen_viewed',
        expect.objectContaining({ screen_name: 'home' })
      );
    });

    test('analytics.appOpened tracks correctly', () => {
      analytics.appOpened();
      expect(mockBackend.track).toHaveBeenCalledWith('app_opened', undefined);
    });
  });

  describe('privacy protections', () => {
    test('does not track decision titles', () => {
      // Simulate trying to track with title (should be stripped)
      const properties = {
        decision_id: '550e8400-e29b-41d4-a716-446655440000',
        // @ts-expect-error - Testing invalid property
        title: 'Should I quit my job?',
      };
      trackEvent('decision_created', properties);
      const callArgs = (mockBackend.track as jest.Mock).mock.calls[0];
      expect(callArgs[1].title).toBeUndefined();
    });

    test('does not track context content', () => {
      const properties = {
        decision_id: '550e8400-e29b-41d4-a716-446655440000',
        // @ts-expect-error - Testing invalid property
        context: 'Detailed personal information about my life situation...',
      };
      trackEvent('decision_created', properties);
      const callArgs = (mockBackend.track as jest.Mock).mock.calls[0];
      expect(callArgs[1].context).toBeUndefined();
    });

    test('allows safe numeric metadata', () => {
      trackEvent('decision_created', {
        decision_id: '550e8400-e29b-41d4-a716-446655440000',
        option_count: 3,
        has_context: true,
      });
      const callArgs = (mockBackend.track as jest.Mock).mock.calls[0];
      expect(callArgs[1].option_count).toBe(3);
      expect(callArgs[1].has_context).toBe(true);
    });
  });
});
