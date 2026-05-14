/**
 * IntegrationRepository Tests
 * 
 * Comprehensive test suite for IntegrationRepository functionality including
 * third-party integrations, credentials, webhooks, synchronization, and monitoring.
 */

import { IntegrationRepository } from '../repositories/IntegrationRepository';
import { CacheManager } from '../cache/CacheManager';
import { Logger } from '../logging/Logger';
import { DatabaseConnection } from '../database/DatabaseConnection';

// Mock dependencies
const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
} as unknown as CacheManager;

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

const mockDbConnection = {
  query: jest.fn(),
  beginTransaction: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
} as unknown as DatabaseConnection;

describe('IntegrationRepository', () => {
  let integrationRepository: IntegrationRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    integrationRepository = new IntegrationRepository(mockDbConnection, mockCacheManager, mockLogger);
  });

  describe('Integration Management', () => {
    it('should create integration', async () => {
      // Arrange
      const integrationData = {
        name: 'Stripe Payment Gateway',
        type: 'payment',
        provider: 'stripe',
        version: 'v1.0',
        configuration: {
          apiKey: 'sk_test_123',
          webhookSecret: 'whsec_123',
          environment: 'test',
        },
        credentials: {
          type: 'api_key',
          encrypted: true,
        },
        webhooks: [
          {
            url: 'https://example.com/webhooks/stripe',
            events: ['payment.completed', 'payment.failed'],
            secret: 'whsec_123',
            active: true,
          },
        ],
        syncSettings: {
          enabled: true,
          frequency: 'hourly',
          lastSync: null,
        },
        metadata: {
          description: 'Stripe payment integration',
          owner: 'admin-123',
        },
      };

      const mockResult = {
        rows: [{
          id: 'integration-123',
          name: 'Stripe Payment Gateway',
          type: 'payment',
          provider: 'stripe',
          version: 'v1.0',
          status: 'active',
          configuration: JSON.stringify(integrationData.configuration),
          credentials: JSON.stringify(integrationData.credentials),
          webhooks: JSON.stringify(integrationData.webhooks),
          sync_settings: JSON.stringify(integrationData.syncSettings),
          metadata: JSON.stringify(integrationData.metadata),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.createIntegration(integrationData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(integrationData.name);
      expect(result.type).toBe(integrationData.type);
      expect(result.provider).toBe(integrationData.provider);
      expect(result.status).toBe('active');
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO integrations'),
        expect.arrayContaining([
          integrationData.name,
          integrationData.type,
          integrationData.provider,
          integrationData.version,
          JSON.stringify(integrationData.configuration),
          JSON.stringify(integrationData.credentials),
          JSON.stringify(integrationData.webhooks),
          JSON.stringify(integrationData.syncSettings),
          JSON.stringify(integrationData.metadata),
        ])
      );
    });

    it('should find integration by ID', async () => {
      // Arrange
      const integrationId = 'integration-123';
      const mockResult = {
        rows: [{
          id: integrationId,
          name: 'Stripe Payment Gateway',
          type: 'payment',
          provider: 'stripe',
          version: 'v1.0',
          status: 'active',
          configuration: JSON.stringify({ apiKey: 'sk_test_123' }),
          credentials: JSON.stringify({ type: 'api_key', encrypted: true }),
          webhooks: JSON.stringify([{ url: 'https://example.com/webhooks/stripe' }]),
          sync_settings: JSON.stringify({ enabled: true, frequency: 'hourly' }),
          metadata: JSON.stringify({ description: 'Stripe payment integration' }),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.findById(integrationId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(integrationId);
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        expect.stringContaining('findById'),
        integrationId
      );
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should update integration', async () => {
      // Arrange
      const integrationId = 'integration-123';
      const updates = {
        name: 'Updated Stripe Integration',
        configuration: {
          apiKey: 'sk_test_456',
          webhookSecret: 'whsec_456',
          environment: 'production',
        },
        status: 'inactive',
      };

      const mockResult = {
        rows: [{
          id: integrationId,
          name: 'Updated Stripe Integration',
          type: 'payment',
          provider: 'stripe',
          version: 'v1.0',
          status: 'inactive',
          configuration: JSON.stringify(updates.configuration),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.updateIntegration(integrationId, updates);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(updates.name);
      expect(result.status).toBe(updates.status);
      expect(mockCacheManager.delete).toHaveBeenCalled();
    });

    it('should delete integration', async () => {
      // Arrange
      const integrationId = 'integration-123';
      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      const result = await integrationRepository.deleteIntegration(integrationId);

      // Assert
      expect(result).toBe(true);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        'DELETE FROM integrations WHERE id = $1',
        [integrationId]
      );
      expect(mockCacheManager.delete).toHaveBeenCalled();
    });
  });

  describe('Integration Queries', () => {
    it('should get integrations by type', async () => {
      // Arrange
      const type = 'payment';
      const mockResult = {
        rows: [
          {
            id: 'integration-1',
            name: 'Stripe Payment Gateway',
            type: type,
            provider: 'stripe',
            status: 'active',
          },
          {
            id: 'integration-2',
            name: 'PayPal Payment Gateway',
            type: type,
            provider: 'paypal',
            status: 'active',
          },
        ],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.getIntegrationsByType(type);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].type).toBe(type);
      expect(result[1].type).toBe(type);
    });

    it('should get integrations by provider', async () => {
      // Arrange
      const provider = 'stripe';
      const mockResult = {
        rows: [
          {
            id: 'integration-1',
            name: 'Stripe Payment Gateway',
            type: 'payment',
            provider: provider,
            status: 'active',
          },
          {
            id: 'integration-2',
            name: 'Stripe Connect',
            type: 'oauth',
            provider: provider,
            status: 'inactive',
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.getIntegrationsByProvider(provider);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].provider).toBe(provider);
      expect(result[1].provider).toBe(provider);
    });

    it('should get active integrations', async () => {
      // Arrange
      const mockResult = {
        rows: [
          {
            id: 'integration-1',
            name: 'Stripe Payment Gateway',
            type: 'payment',
            provider: 'stripe',
            status: 'active',
          },
          {
            id: 'integration-2',
            name: 'Email Service',
            type: 'communication',
            provider: 'sendgrid',
            status: 'active',
          },
        ],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.getActiveIntegrations();

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].status).toBe('active');
      expect(result[1].status).toBe('active');
    });

    it('should search integrations', async () => {
      // Arrange
      const searchTerm = 'stripe';
      const filters = {
        type: 'payment',
        status: 'active',
      };
      const options = {
        limit: 10,
        offset: 0,
      };

      const mockResult = {
        rows: [
          {
            id: 'integration-1',
            name: 'Stripe Payment Gateway',
            type: 'payment',
            provider: 'stripe',
            status: 'active',
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.searchIntegrations(searchTerm, filters, options);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name.toLowerCase()).toContain(searchTerm);
    });
  });

  describe('Connection Testing', () => {
    it('should test integration connection', async () => {
      // Arrange
      const integrationId = 'integration-123';
      const testConfig = {
        endpoint: 'https://api.stripe.com/v1/account',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer sk_test_123',
        },
      };

      const mockResult = {
        rows: [{
          id: 'test-123',
          integration_id: integrationId,
          status: 'success',
          response: JSON.stringify({ status: 'connected', account_id: 'acct_123' }),
          latency: 150,
          timestamp: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.testConnection(integrationId, testConfig);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('success');
      expect(result.latency).toBe(150);
    });

    it('should handle failed connection test', async () => {
      // Arrange
      const integrationId = 'integration-123';
      const testConfig = {
        endpoint: 'https://api.stripe.com/v1/account',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid_key',
        },
      };

      const mockResult = {
        rows: [{
          id: 'test-123',
          integration_id: integrationId,
          status: 'failed',
          error: 'Invalid API key',
          latency: 500,
          timestamp: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.testConnection(integrationId, testConfig);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('failed');
      expect(result.error).toBe('Invalid API key');
    });

    it('should get connection test history', async () => {
      // Arrange
      const integrationId = 'integration-123';
      const mockResult = {
        rows: [
          {
            id: 'test-1',
            integration_id: integrationId,
            status: 'success',
            latency: 150,
            timestamp: new Date('2023-01-15'),
          },
          {
            id: 'test-2',
            integration_id: integrationId,
            status: 'failed',
            error: 'Timeout',
            latency: 5000,
            timestamp: new Date('2023-01-14'),
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.getConnectionTestHistory(integrationId);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].status).toBe('success');
      expect(result[1].status).toBe('failed');
    });
  });

  describe('Synchronization', () => {
    it('should trigger integration sync', async () => {
      // Arrange
      const integrationId = 'integration-123';
      const syncConfig = {
        type: 'full',
        entities: ['customers', 'payments'],
        filters: {
          startDate: '2023-01-01',
          endDate: '2023-01-31',
        },
      };

      const mockResult = {
        rows: [{
          id: 'sync-123',
          integration_id: integrationId,
          type: 'full',
          status: 'running',
          started_at: new Date(),
          progress: 0,
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.triggerSync(integrationId, syncConfig);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('running');
      expect(result.type).toBe(syncConfig.type);
    });

    it('should update sync status', async () => {
      // Arrange
      const syncId = 'sync-123';
      const status = 'completed';
      const results = {
        entitiesProcessed: 1000,
        entitiesCreated: 100,
        entitiesUpdated: 50,
        entitiesDeleted: 5,
        errors: 2,
      };

      const mockResult = {
        rows: [{
          id: syncId,
          integration_id: 'integration-123',
          type: 'full',
          status: status,
          started_at: new Date('2023-01-15'),
          completed_at: new Date('2023-01-15'),
          progress: 100,
          results: JSON.stringify(results),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.updateSyncStatus(syncId, status, results);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(status);
      expect(result.progress).toBe(100);
    });

    it('should get sync history', async () => {
      // Arrange
      const integrationId = 'integration-123';
      const mockResult = {
        rows: [
          {
            id: 'sync-1',
            integration_id: integrationId,
            type: 'full',
            status: 'completed',
            started_at: new Date('2023-01-15'),
            completed_at: new Date('2023-01-15'),
            progress: 100,
            results: JSON.stringify({ entitiesProcessed: 1000 }),
          },
          {
            id: 'sync-2',
            integration_id: integrationId,
            type: 'incremental',
            status: 'failed',
            started_at: new Date('2023-01-14'),
            completed_at: new Date('2023-01-14'),
            progress: 45,
            error: 'API rate limit exceeded',
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.getSyncHistory(integrationId);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].status).toBe('completed');
      expect(result[1].status).toBe('failed');
    });
  });

  describe('Webhook Management', () => {
    it('should create webhook', async () => {
      // Arrange
      const webhookData = {
        integrationId: 'integration-123',
        url: 'https://example.com/webhooks/stripe',
        events: ['payment.completed', 'payment.failed'],
        secret: 'whsec_123',
        active: true,
        retryConfig: {
          maxRetries: 3,
          retryDelay: 1000,
        },
      };

      const mockResult = {
        rows: [{
          id: 'webhook-123',
          integration_id: 'integration-123',
          url: 'https://example.com/webhooks/stripe',
          events: JSON.stringify(webhookData.events),
          secret: 'whsec_123',
          active: true,
          retry_config: JSON.stringify(webhookData.retryConfig),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.createWebhook(webhookData);

      // Assert
      expect(result).toBeDefined();
      expect(result.integrationId).toBe(webhookData.integrationId);
      expect(result.url).toBe(webhookData.url);
      expect(result.active).toBe(webhookData.active);
    });

    it('should get webhooks by integration', async () => {
      // Arrange
      const integrationId = 'integration-123';
      const mockResult = {
        rows: [
          {
            id: 'webhook-1',
            integration_id: integrationId,
            url: 'https://example.com/webhooks/stripe',
            events: JSON.stringify(['payment.completed']),
            active: true,
          },
          {
            id: 'webhook-2',
            integration_id: integrationId,
            url: 'https://example.com/webhooks/stripe/events',
            events: JSON.stringify(['payment.failed']),
            active: false,
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.getWebhooksByIntegration(integrationId);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].integrationId).toBe(integrationId);
      expect(result[1].integrationId).toBe(integrationId);
    });

    it('should update webhook status', async () => {
      // Arrange
      const webhookId = 'webhook-123';
      const active = false;
      const mockResult = {
        rows: [{
          id: webhookId,
          integration_id: 'integration-123',
          url: 'https://example.com/webhooks/stripe',
          active: active,
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.updateWebhookStatus(webhookId, active);

      // Assert
      expect(result).toBeDefined();
      expect(result.active).toBe(active);
    });

    it('should log webhook delivery', async () => {
      // Arrange
      const deliveryData = {
        webhookId: 'webhook-123',
        eventId: 'evt_123',
        payload: { type: 'payment.completed', data: { id: 'pay_123' } },
        response: {
          statusCode: 200,
          body: 'OK',
          duration: 150,
        },
        attempt: 1,
        status: 'delivered',
      };

      const mockResult = {
        rows: [{
          id: 'delivery-123',
          webhook_id: 'webhook-123',
          event_id: 'evt_123',
          payload: JSON.stringify(deliveryData.payload),
          response: JSON.stringify(deliveryData.response),
          attempt: 1,
          status: 'delivered',
          delivered_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.logWebhookDelivery(deliveryData);

      // Assert
      expect(result).toBeDefined();
      expect(result.webhookId).toBe(deliveryData.webhookId);
      expect(result.status).toBe(deliveryData.status);
    });

    it('should get webhook delivery logs', async () => {
      // Arrange
      const webhookId = 'webhook-123';
      const mockResult = {
        rows: [
          {
            id: 'delivery-1',
            webhook_id: webhookId,
            event_id: 'evt_123',
            status: 'delivered',
            attempt: 1,
            delivered_at: new Date('2023-01-15'),
          },
          {
            id: 'delivery-2',
            webhook_id: webhookId,
            event_id: 'evt_456',
            status: 'failed',
            attempt: 3,
            delivered_at: new Date('2023-01-14'),
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.getWebhookDeliveryLogs(webhookId);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].status).toBe('delivered');
      expect(result[1].status).toBe('failed');
    });
  });

  describe('Monitoring and Analytics', () => {
    it('should get integration statistics', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [{
          total_integrations: 25,
          integrations_by_type: { payment: 8, communication: 6, analytics: 5, crm: 6 },
          integrations_by_status: { active: 20, inactive: 3, error: 2 },
          integrations_by_provider: { stripe: 5, sendgrid: 3, google: 4, salesforce: 2 },
          total_webhooks: 45,
          active_webhooks: 40,
          successful_deliveries: 1000,
          failed_deliveries: 50,
          delivery_rate: 95.2,
          total_syncs: 100,
          successful_syncs: 95,
          average_sync_duration: 1200,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.getIntegrationStats(timeRange);

      // Assert
      expect(result).toBeDefined();
      expect(result.totalIntegrations).toBe(25);
      expect(result.integrationsByType.payment).toBe(8);
      expect(result.deliveryRate).toBe(95.2);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should get integration health status', async () => {
      // Arrange
      const mockResult = {
        rows: [
          {
            integration_id: 'integration-1',
            name: 'Stripe Payment Gateway',
            status: 'healthy',
            last_connection_test: new Date('2023-01-15'),
            last_sync: new Date('2023-01-15'),
            error_count: 0,
          },
          {
            integration_id: 'integration-2',
            name: 'Email Service',
            status: 'warning',
            last_connection_test: new Date('2023-01-10'),
            last_sync: new Date('2023-01-14'),
            error_count: 3,
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.getIntegrationHealthStatus();

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].status).toBe('healthy');
      expect(result[1].status).toBe('warning');
    });

    it('should get webhook analytics', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [
          {
            webhook_id: 'webhook-1',
            url: 'https://example.com/webhooks/stripe',
            total_deliveries: 500,
            successful_deliveries: 475,
            failed_deliveries: 25,
            delivery_rate: 95.0,
            average_response_time: 150,
          },
          {
            webhook_id: 'webhook-2',
            url: 'https://example.com/webhooks/paypal',
            total_deliveries: 300,
            successful_deliveries: 270,
            failed_deliveries: 30,
            delivery_rate: 90.0,
            average_response_time: 200,
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.getWebhookAnalytics(timeRange);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].deliveryRate).toBe(95.0);
      expect(result[1].deliveryRate).toBe(90.0);
    });
  });

  describe('Validation', () => {
    it('should validate integration data', async () => {
      // Arrange
      const invalidIntegrationData = {
        name: '',
        type: '',
        provider: '',
        version: '',
        configuration: null,
        credentials: null,
      };

      // Act & Assert
      await expect(integrationRepository.createIntegration(invalidIntegrationData)).rejects.toThrow('Integration name is required');
    });

    it('should validate integration type', async () => {
      // Arrange
      const invalidIntegrationData = {
        name: 'Test Integration',
        type: 'invalid_type',
        provider: 'test',
        version: '1.0',
        configuration: {},
        credentials: {},
      };

      // Act & Assert
      await expect(integrationRepository.createIntegration(invalidIntegrationData)).rejects.toThrow('Invalid integration type');
    });

    it('should validate webhook URL', async () => {
      // Arrange
      const invalidWebhookData = {
        integrationId: 'integration-123',
        url: 'invalid-url',
        events: ['test'],
        secret: 'secret',
        active: true,
      };

      // Act & Assert
      await expect(integrationRepository.createWebhook(invalidWebhookData)).rejects.toThrow('Invalid webhook URL');
    });
  });

  describe('Caching', () => {
    it('should cache integration statistics', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [{
          total_integrations: 25,
          integrations_by_type: { payment: 8, communication: 6 },
          delivery_rate: 95.2,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await integrationRepository.getIntegrationStats(timeRange);

      // Assert
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('integrationStats'),
        expect.any(Object),
        expect.any(Number)
      );
    });

    it('should return cached integration statistics', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const cachedStats = {
        totalIntegrations: 25,
        integrationsByType: { payment: 8, communication: 6 },
        deliveryRate: 95.2,
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(cachedStats);

      // Act
      const result = await integrationRepository.getIntegrationStats(timeRange);

      // Assert
      expect(result).toEqual(cachedStats);
      expect(mockDbConnection.query).not.toHaveBeenCalled();
    });

    it('should clear cache on integration update', async () => {
      // Arrange
      const integrationId = 'integration-123';
      const updates = { name: 'Updated Integration' };
      const mockResult = {
        rows: [{
          id: integrationId,
          name: 'Updated Integration',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await integrationRepository.updateIntegration(integrationId, updates);

      // Assert
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        expect.stringContaining('integrationStats')
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      const integrationId = 'integration-123';
      const dbError = new Error('Database connection failed');
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockRejectedValue(dbError);

      // Act & Assert
      await expect(integrationRepository.findById(integrationId)).rejects.toThrow('Database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({
          integrationId,
          error: dbError.message,
        })
      );
    });

    it('should handle validation errors gracefully', async () => {
      // Arrange
      const invalidIntegrationData = {
        name: '',
        type: '',
        provider: '',
        version: '',
        configuration: null,
        credentials: null,
      };

      // Act & Assert
      await expect(integrationRepository.createIntegration(invalidIntegrationData)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });
  });

  describe('Performance', () => {
    it('should handle large result sets efficiently', async () => {
      // Arrange
      const largeResult = {
        rows: Array.from({ length: 1000 }, (_, i) => ({
          id: `integration-${i}`,
          name: `Integration ${i}`,
          type: 'payment',
          provider: 'stripe',
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        })),
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(largeResult);

      // Act
      const startTime = Date.now();
      const result = await integrationRepository.getActiveIntegrations();
      const endTime = Date.now();

      // Assert
      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should use parameterized queries for security', async () => {
      // Arrange
      const integrationId = "integration-123'; DROP TABLE integrations; --";
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      await integrationRepository.findById(integrationId);

      // Assert
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM integrations WHERE id = $1'),
        [integrationId]
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values gracefully', async () => {
      // Arrange
      const integrationId = 'integration-123';
      const mockResult = {
        rows: [{
          id: integrationId,
          name: 'Test Integration',
          type: 'payment',
          provider: 'stripe',
          configuration: null,
          credentials: null,
          webhooks: null,
          sync_settings: null,
          metadata: null,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await integrationRepository.findById(integrationId);

      // Assert
      expect(result).toBeDefined();
      expect(result.configuration).toBeNull();
      expect(result.credentials).toBeNull();
      expect(result.webhooks).toBeNull();
    });

    it('should handle empty result sets', async () => {
      // Arrange
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await integrationRepository.findById('nonexistent');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle concurrent operations', async () => {
      // Arrange
      const integrationId = 'integration-123';
      const updates = { name: 'Concurrent Update' };
      const mockResult = {
        rows: [{
          id: integrationId,
          name: 'Concurrent Update',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const promises = Array.from({ length: 10 }, () => 
        integrationRepository.updateIntegration(integrationId, updates)
      );
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.name).toBe(updates.name);
      });
    });
  });
});
