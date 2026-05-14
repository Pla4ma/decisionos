/**
 * RepositoryWebhooks Tests
 * 
 * Comprehensive test suite for RepositoryWebhooks functionality including
 * webhook management, event handling, webhook delivery, and webhook security.
 */

import { RepositoryWebhooks } from '../repositories/RepositoryWebhooks';
import { Logger } from '../logging/Logger';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

describe('RepositoryWebhooks', () => {
  let repositoryWebhooks: RepositoryWebhooks;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryWebhooks = new RepositoryWebhooks(mockLogger);
  });

  describe('Webhook Management', () => {
    it('should create webhook configuration', async () => {
      // Arrange
      const webhookConfig = {
        name: 'user_created_webhook',
        url: 'https://api.example.com/webhooks/user-created',
        events: ['user.created', 'user.updated'],
        repository: 'UserRepository',
        secret: 'webhook-secret-key',
        active: true,
        retryConfig: {
          maxRetries: 3,
          retryDelay: 1000,
          backoffMultiplier: 2,
        },
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Source': 'vex-app',
        },
      };

      // Act
      const webhook = await repositoryWebhooks.createWebhook(webhookConfig);

      // Assert
      expect(webhook).toBeDefined();
      expect(webhook.name).toBe('user_created_webhook');
      expect(webhook.url).toBe('https://api.example.com/webhooks/user-created');
      expect(webhook.events).toEqual(['user.created', 'user.updated']);
      expect(webhook.repository).toBe('UserRepository');
      expect(webhook.active).toBe(true);
      expect(webhook.id).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('webhook_created', expect.objectContaining({
        name: 'user_created_webhook',
        url: 'https://api.example.com/webhooks/user-created',
      }));
    });

    it('should update webhook configuration', async () => {
      // Arrange
      const webhookId = 'webhook-123';
      const updateConfig = {
        url: 'https://new-api.example.com/webhooks/user-created',
        events: ['user.created', 'user.updated', 'user.deleted'],
        active: false,
        retryConfig: {
          maxRetries: 5,
          retryDelay: 2000,
          backoffMultiplier: 1.5,
        },
      };

      // Act
      const webhook = await repositoryWebhooks.updateWebhook(webhookId, updateConfig);

      // Assert
      expect(webhook).toBeDefined();
      expect(webhook.id).toBe(webhookId);
      expect(webhook.url).toBe('https://new-api.example.com/webhooks/user-created');
      expect(webhook.events).toEqual(['user.created', 'user.updated', 'user.deleted']);
      expect(webhook.active).toBe(false);
      expect(webhook.retryConfig.maxRetries).toBe(5);
    });

    it('should delete webhook', async () => {
      // Arrange
      const webhookId = 'webhook-456';

      // Act
      const result = await repositoryWebhooks.deleteWebhook(webhookId);

      // Assert
      expect(result).toBeDefined();
      expect(result.webhookId).toBe(webhookId);
      expect(result.deleted).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('webhook_deleted', expect.objectContaining({
        webhookId,
        deleted: true,
      }));
    });

    it('should list webhooks', async () => {
      // Arrange
      const filterConfig = {
        repository: 'UserRepository',
        active: true,
        events: ['user.created'],
      };

      // Act
      const webhooks = await repositoryWebhooks.listWebhooks(filterConfig);

      // Assert
      expect(webhooks).toBeDefined();
      expect(webhooks.webhooks).toBeDefined();
      expect(webhooks.total).toBeGreaterThan(0);
      expect(webhooks.webhooks[0]).toHaveProperty('id');
      expect(webhooks.webhooks[0]).toHaveProperty('name');
      expect(webhooks.webhooks[0]).toHaveProperty('url');
    });

    it('should get webhook details', async () => {
      // Arrange
      const webhookId = 'webhook-789';

      // Act
      const webhook = await repositoryWebhooks.getWebhook(webhookId);

      // Assert
      expect(webhook).toBeDefined();
      expect(webhook.id).toBe(webhookId);
      expect(webhook.name).toBeDefined();
      expect(webhook.url).toBeDefined();
      expect(webhook.events).toBeDefined();
      expect(webhook.deliveryStats).toBeDefined();
    });
  });

  describe('Event Handling', () => {
    it('should trigger webhook event', async () => {
      // Arrange
      const eventData = {
        event: 'user.created',
        repository: 'UserRepository',
        data: {
          id: 123,
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: new Date(),
        },
        metadata: {
          source: 'api',
          userId: 'admin',
        },
      };

      // Act
      const result = await repositoryWebhooks.triggerEvent(eventData);

      // Assert
      expect(result).toBeDefined();
      expect(result.event).toBe('user.created');
      expect(result.repository).toBe('UserRepository');
      expect(result.triggeredWebhooks).toBeGreaterThan(0);
      expect(result.deliveries).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('webhook_event_triggered', expect.objectContaining({
        event: 'user.created',
        repository: 'UserRepository',
        triggeredWebhooks: expect.any(Number),
      }));
    });

    it('should handle multiple webhook events', async () => {
      // Arrange
      const events = [
        {
          event: 'user.created',
          repository: 'UserRepository',
          data: { id: 123, name: 'John Doe' },
        },
        {
          event: 'user.updated',
          repository: 'UserRepository',
          data: { id: 123, name: 'John Smith' },
        },
        {
          event: 'product.created',
          repository: 'ProductRepository',
          data: { id: 456, name: 'New Product' },
        },
      ];

      // Act
      const result = await repositoryWebhooks.triggerMultipleEvents(events);

      // Assert
      expect(result).toBeDefined();
      expect(result.events).toHaveLength(3);
      expect(result.totalDeliveries).toBeGreaterThan(0);
      expect(result.successfulDeliveries).toBeGreaterThan(0);
      expect(result.failedDeliveries).toBeGreaterThanOrEqual(0);
    });

    it('should filter events by webhook configuration', async () => {
      // Arrange
      const eventData = {
        event: 'order.created',
        repository: 'OrderRepository',
        data: {
          id: 789,
          userId: 123,
          total: 99.99,
          items: [],
        },
      };

      const webhookFilters = [
        {
          webhookId: 'webhook-1',
          events: ['order.created', 'order.updated'],
          repository: 'OrderRepository',
        },
        {
          webhookId: 'webhook-2',
          events: ['user.created'],
          repository: 'UserRepository',
        },
      ];

      // Act
      const filtered = repositoryWebhooks.filterWebhooksForEvent(eventData, webhookFilters);

      // Assert
      expect(filtered).toBeDefined();
      expect(filtered.matchingWebhooks).toHaveLength(1);
      expect(filtered.matchingWebhooks[0].webhookId).toBe('webhook-1');
    });

    it('should validate event data', async () => {
      // Arrange
      const eventData = {
        event: 'user.created',
        repository: 'UserRepository',
        data: {
          id: 123,
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      const validationRules = {
        'user.created': {
          required: ['id', 'name', 'email'],
          types: {
            id: 'number',
            name: 'string',
            email: 'string',
          },
          formats: {
            email: 'email',
          },
        },
      };

      // Act
      const validation = repositoryWebhooks.validateEventData(eventData, validationRules);

      // Assert
      expect(validation).toBeDefined();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid event data', async () => {
      // Arrange
      const invalidEventData = {
        event: 'user.created',
        repository: 'UserRepository',
        data: {
          id: 123,
          name: 'John Doe',
          // Missing required email field
        },
      };

      const validationRules = {
        'user.created': {
          required: ['id', 'name', 'email'],
          types: {
            id: 'number',
            name: 'string',
            email: 'string',
          },
        },
      };

      // Act
      const validation = repositoryWebhooks.validateEventData(invalidEventData, validationRules);

      // Assert
      expect(validation).toBeDefined();
      expect(validation.valid).toBe(false);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0]).toContain('Missing required field: email');
    });
  });

  describe('Webhook Delivery', () => {
    it('should deliver webhook successfully', async () => {
      // Arrange
      const deliveryConfig = {
        webhookId: 'webhook-123',
        url: 'https://api.example.com/webhooks/user-created',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Source': 'vex-app',
        },
        payload: {
          event: 'user.created',
          data: { id: 123, name: 'John Doe' },
        },
        secret: 'webhook-secret',
        timeout: 10000,
      };

      // Act
      const delivery = await repositoryWebhooks.deliverWebhook(deliveryConfig);

      // Assert
      expect(delivery).toBeDefined();
      expect(delivery.webhookId).toBe('webhook-123');
      expect(delivery.url).toBe('https://api.example.com/webhooks/user-created');
      expect(delivery.method).toBe('POST');
      expect(delivery.status).toBe('success');
      expect(delivery.responseCode).toBe(200);
      expect(delivery.responseTime).toBeGreaterThan(0);
    });

    it('should handle webhook delivery failure', async () => {
      // Arrange
      const deliveryConfig = {
        webhookId: 'webhook-456',
        url: 'https://invalid-url.example.com/webhooks',
        method: 'POST',
        payload: {
          event: 'user.created',
          data: { id: 123, name: 'John Doe' },
        },
        timeout: 5000,
      };

      // Act
      const delivery = await repositoryWebhooks.deliverWebhook(deliveryConfig);

      // Assert
      expect(delivery).toBeDefined();
      expect(delivery.status).toBe('failed');
      expect(delivery.error).toBeDefined();
      expect(delivery.attempts).toBe(1);
    });

    it('should retry failed webhook deliveries', async () => {
      // Arrange
      const retryConfig = {
        webhookId: 'webhook-789',
        url: 'https://flaky-api.example.com/webhooks',
        method: 'POST',
        payload: {
          event: 'user.created',
          data: { id: 123, name: 'John Doe' },
        },
        retryConfig: {
          maxRetries: 3,
          retryDelay: 1000,
          backoffMultiplier: 2,
        },
        timeout: 5000,
      };

      // Act
      const delivery = await repositoryWebhooks.deliverWebhookWithRetry(retryConfig);

      // Assert
      expect(delivery).toBeDefined();
      expect(delivery.attempts).toBeGreaterThan(1);
      expect(delivery.retryAttempts).toBeGreaterThan(0);
      expect(delivery.totalRetryTime).toBeGreaterThan(0);
    });

    it('should sign webhook payload', async () => {
      // Arrange
      const payload = {
        event: 'user.created',
        data: { id: 123, name: 'John Doe' },
      };
      const secret = 'webhook-secret-key';

      // Act
      const signature = repositoryWebhooks.signPayload(payload, secret);

      // Assert
      expect(signature).toBeDefined();
      expect(signature.algorithm).toBe('sha256');
      expect(signature.signature).toBeDefined();
      expect(signature.timestamp).toBeDefined();
    });

    it('should verify webhook signature', async () => {
      // Arrange
      const payload = {
        event: 'user.created',
        data: { id: 123, name: 'John Doe' },
      };
      const secret = 'webhook-secret-key';
      const signature = repositoryWebhooks.signPayload(payload, secret);

      // Act
      const verification = repositoryWebhooks.verifySignature(payload, signature.signature, secret);

      // Assert
      expect(verification).toBeDefined();
      expect(verification.valid).toBe(true);
    });

    it('should detect invalid webhook signature', async () => {
      // Arrange
      const payload = {
        event: 'user.created',
        data: { id: 123, name: 'John Doe' },
      };
      const secret = 'webhook-secret-key';
      const wrongSecret = 'wrong-secret';
      const signature = repositoryWebhooks.signPayload(payload, secret);

      // Act
      const verification = repositoryWebhooks.verifySignature(payload, signature.signature, wrongSecret);

      // Assert
      expect(verification).toBeDefined();
      expect(verification.valid).toBe(false);
    });
  });

  describe('Webhook Security', () => {
    it('should validate webhook URL', () => {
      // Arrange
      const validUrls = [
        'https://api.example.com/webhooks',
        'https://webhook.example.com:8443/endpoint',
        'http://localhost:3000/webhooks',
      ];

      const invalidUrls = [
        'ftp://example.com/webhooks',
        'not-a-url',
        'javascript:alert(1)',
        'https://example.com/../etc/passwd',
      ];

      // Act & Assert
      validUrls.forEach(url => {
        const validation = repositoryWebhooks.validateWebhookUrl(url);
        expect(validation.valid).toBe(true);
      });

      invalidUrls.forEach(url => {
        const validation = repositoryWebhooks.validateWebhookUrl(url);
        expect(validation.valid).toBe(false);
      });
    });

    it('should sanitize webhook headers', () => {
      // Arrange
      const headers = {
        'Content-Type': 'application/json',
        'X-Webhook-Source': 'vex-app',
        'Authorization': 'Bearer token123',
        'X-Custom-Header': 'custom-value',
      };

      const allowedHeaders = [
        'Content-Type',
        'X-Webhook-Source',
        'X-Custom-Header',
      ];

      // Act
      const sanitized = repositoryWebhooks.sanitizeHeaders(headers, allowedHeaders);

      // Assert
      expect(sanitized).toBeDefined();
      expect(sanitized['Content-Type']).toBe('application/json');
      expect(sanitized['X-Webhook-Source']).toBe('vex-app');
      expect(sanitized['X-Custom-Header']).toBe('custom-value');
      expect(sanitized['Authorization']).toBeUndefined(); // Should be removed
    });

    it('should rate limit webhook deliveries', async () => {
      // Arrange
      const webhookId = 'webhook-123';
      const rateLimitConfig = {
        maxDeliveries: 100,
        windowMs: 60000, // 1 minute
      };

      // Act
      const rateLimit = repositoryWebhooks.checkRateLimit(webhookId, rateLimitConfig);

      // Assert
      expect(rateLimit).toBeDefined();
      expect(rateLimit.allowed).toBe(true);
      expect(rateLimit.remaining).toBeGreaterThan(0);
    });

    it('should block webhook deliveries exceeding rate limit', async () => {
      // Arrange
      const webhookId = 'webhook-456';
      const rateLimitConfig = {
        maxDeliveries: 1, // Very low limit for testing
        windowMs: 60000,
      };

      // First delivery
      repositoryWebhooks.checkRateLimit(webhookId, rateLimitConfig);

      // Act - Second delivery should be blocked
      const rateLimit = repositoryWebhooks.checkRateLimit(webhookId, rateLimitConfig);

      // Assert
      expect(rateLimit).toBeDefined();
      expect(rateLimit.allowed).toBe(false);
      expect(rateLimit.remaining).toBe(0);
    });

    it('should validate webhook secret strength', () => {
      // Arrange
      const strongSecrets = [
        'very-strong-secret-key-with-multiple-words-and-numbers-12345',
        'webhook-secret-abcdef1234567890',
        'secure-webhook-key-!@#$%^&*()',
      ];

      const weakSecrets = [
        'weak',
        '123',
        'password',
        'secret',
        'webhook',
      ];

      // Act & Assert
      strongSecrets.forEach(secret => {
        const validation = repositoryWebhooks.validateSecretStrength(secret);
        expect(validation.valid).toBe(true);
      });

      weakSecrets.forEach(secret => {
        const validation = repositoryWebhooks.validateSecretStrength(secret);
        expect(validation.valid).toBe(false);
      });
    });
  });

  describe('Webhook Monitoring', () => {
    it('should track webhook delivery statistics', async () => {
      // Arrange
      const webhookId = 'webhook-123';
      const timeRange = {
        start: new Date('2023-01-15T00:00:00Z'),
        end: new Date('2023-01-15T23:59:59Z'),
      };

      // Act
      const stats = await repositoryWebhooks.getDeliveryStats(webhookId, timeRange);

      // Assert
      expect(stats).toBeDefined();
      expect(stats.webhookId).toBe(webhookId);
      expect(stats.totalDeliveries).toBeGreaterThan(0);
      expect(stats.successfulDeliveries).toBeGreaterThanOrEqual(0);
      expect(stats.failedDeliveries).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeGreaterThanOrEqual(0);
      expect(stats.averageResponseTime).toBeGreaterThan(0);
    });

    it('should generate webhook health report', async () => {
      // Arrange
      const reportConfig = {
        webhookIds: ['webhook-123', 'webhook-456', 'webhook-789'],
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
        includeTrends: true,
        includeRecommendations: true,
      };

      // Act
      const report = await repositoryWebhooks.generateHealthReport(reportConfig);

      // Assert
      expect(report).toBeDefined();
      expect(report.webhookIds).toEqual(['webhook-123', 'webhook-456', 'webhook-789']);
      expect(report.summary).toBeDefined();
      expect(report.webhookReports).toHaveLength(3);
      expect(report.recommendations).toBeDefined();
    });

    it('should identify webhook performance issues', async () => {
      // Arrange
      const analysisConfig = {
        webhookId: 'webhook-123',
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
        metrics: ['response_time', 'success_rate', 'error_rate'],
        thresholds: {
          response_time: 5000, // 5 seconds
          success_rate: 0.95, // 95%
          error_rate: 0.05, // 5%
        },
      };

      // Act
      const analysis = await repositoryWebhooks.analyzePerformance(analysisConfig);

      // Assert
      expect(analysis).toBeDefined();
      expect(analysis.webhookId).toBe('webhook-123');
      expect(analysis.issues).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
    });

    it('should monitor webhook delivery in real-time', async () => {
      // Arrange
      const monitoringConfig = {
        webhookIds: ['webhook-123', 'webhook-456'],
        interval: 30000, // 30 seconds
        metrics: ['delivery_count', 'success_rate', 'response_time'],
        alerts: {
          success_rate: { threshold: 0.9, severity: 'warning' },
          response_time: { threshold: 10000, severity: 'critical' },
        },
      };

      // Act
      const monitoring = repositoryWebhooks.startRealTimeMonitoring(monitoringConfig);

      // Assert
      expect(monitoring).toBeDefined();
      expect(monitoring.webhookIds).toEqual(['webhook-123', 'webhook-456']);
      expect(monitoring.interval).toBe(30000);
      expect(monitoring.active).toBe(true);
    });
  });

  describe('Webhook Configuration', () => {
    it('should configure webhook settings', () => {
      // Arrange
      const settings = {
        defaultTimeout: 10000, // 10 seconds
        defaultRetryConfig: {
          maxRetries: 3,
          retryDelay: 1000,
          backoffMultiplier: 2,
        },
        rateLimiting: {
          enabled: true,
          maxDeliveries: 1000,
          windowMs: 3600000, // 1 hour
        },
        security: {
          requireHTTPS: true,
          allowedHosts: ['api.example.com', 'webhook.example.com'],
          maxPayloadSize: 1024 * 1024, // 1MB
        },
        logging: {
          level: 'info',
          includePayloads: false,
          includeHeaders: false,
        },
      };

      // Act
      repositoryWebhooks.configureSettings(settings);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('webhook_settings_configured', expect.objectContaining({
        defaultTimeout: 10000,
        rateLimiting: expect.any(Object),
        security: expect.any(Object),
      }));
    });

    it('should configure webhook event mappings', () => {
      // Arrange
      const eventMappings = {
        'UserRepository': {
          'user.created': ['user_created_webhook', 'analytics_webhook'],
          'user.updated': ['user_updated_webhook'],
          'user.deleted': ['user_deleted_webhook', 'cleanup_webhook'],
        },
        'ProductRepository': {
          'product.created': ['product_created_webhook', 'inventory_webhook'],
          'product.updated': ['product_updated_webhook'],
        },
        'OrderRepository': {
          'order.created': ['order_created_webhook', 'notification_webhook'],
          'order.completed': ['order_completed_webhook', 'analytics_webhook'],
        },
      };

      // Act
      repositoryWebhooks.configureEventMappings(eventMappings);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('webhook_event_mappings_configured', expect.objectContaining({
        repositories: expect.any(Object),
      }));
    });

    it('should configure webhook delivery strategies', () => {
      // Arrange
      const strategies = {
        default: 'sequential',
        strategies: {
          'sequential': {
            description: 'Deliver webhooks one after another',
            timeout: 10000,
            retry: true,
          },
          'parallel': {
            description: 'Deliver webhooks in parallel',
            timeout: 5000,
            retry: false,
          },
          'batch': {
            description: 'Batch multiple events together',
            batchSize: 10,
            batchTimeout: 5000,
            retry: true,
          },
        },
        repositoryStrategies: {
          'UserRepository': 'parallel',
          'OrderRepository': 'sequential',
          'AnalyticsRepository': 'batch',
        },
      };

      // Act
      repositoryWebhooks.configureDeliveryStrategies(strategies);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('webhook_delivery_strategies_configured', expect.objectContaining({
        default: 'sequential',
        strategies: expect.any(Object),
      }));
    });
  });

  describe('Webhook Testing', () => {
    it('should test webhook endpoint', async () => {
      // Arrange
      const testConfig = {
        webhookId: 'webhook-123',
        url: 'https://api.example.com/webhooks/test',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        payload: {
          event: 'test.event',
          data: { test: true },
        },
        timeout: 5000,
      };

      // Act
      const test = await repositoryWebhooks.testWebhook(testConfig);

      // Assert
      expect(test).toBeDefined();
      expect(test.webhookId).toBe('webhook-123');
      expect(test.status).toBe('success');
      expect(test.responseCode).toBe(200);
      expect(test.responseTime).toBeGreaterThan(0);
    });

    it('should simulate webhook event', async () => {
      // Arrange
      const simulationConfig = {
        event: 'user.created',
        repository: 'UserRepository',
        data: {
          id: 123,
          name: 'Test User',
          email: 'test@example.com',
        },
        webhookIds: ['webhook-123', 'webhook-456'],
        dryRun: true,
      };

      // Act
      const simulation = await repositoryWebhooks.simulateEvent(simulationConfig);

      // Assert
      expect(simulation).toBeDefined();
      expect(simulation.event).toBe('user.created');
      expect(simulation.repository).toBe('UserRepository');
      expect(simulation.dryRun).toBe(true);
      expect(simulation.simulatedDeliveries).toHaveLength(2);
    });

    it('should validate webhook configuration', () => {
      // Arrange
      const webhookConfig = {
        name: 'test_webhook',
        url: 'https://api.example.com/webhooks',
        events: ['user.created'],
        repository: 'UserRepository',
        secret: 'strong-secret-key-12345',
        active: true,
      };

      // Act
      const validation = repositoryWebhooks.validateWebhookConfig(webhookConfig);

      // Assert
      expect(validation).toBeDefined();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.warnings).toHaveLength(0);
    });

    it('should detect webhook configuration issues', () => {
      // Arrange
      const invalidWebhookConfig = {
        name: '', // Empty name
        url: 'invalid-url', // Invalid URL
        events: [], // No events
        repository: '', // Empty repository
        secret: 'weak', // Weak secret
        active: true,
      };

      // Act
      const validation = repositoryWebhooks.validateWebhookConfig(invalidWebhookConfig);

      // Assert
      expect(validation).toBeDefined();
      expect(validation.valid).toBe(false);
      expect(validation.errors).toHaveLength(4); // name, url, events, repository
      expect(validation.warnings).toHaveLength(1); // weak secret
    });
  });
});
