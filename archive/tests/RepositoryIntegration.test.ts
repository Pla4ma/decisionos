/**
 * RepositoryIntegration Tests
 * 
 * Comprehensive test suite for RepositoryIntegration functionality including
 * third-party integrations, API connections, webhooks, and data synchronization.
 */

import { RepositoryIntegration } from '../repositories/RepositoryIntegration';
import { DatabaseConnection } from '../database/DatabaseConnection';
import { Logger } from '../logging/Logger';

// Mock dependencies
const mockDbConnection = {
  query: jest.fn(),
  beginTransaction: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
} as unknown as DatabaseConnection;

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

describe('RepositoryIntegration', () => {
  let repositoryIntegration: RepositoryIntegration;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryIntegration = new RepositoryIntegration(mockDbConnection, mockLogger);
  });

  describe('Third-Party API Integration', () => {
    it('should connect to external API', async () => {
      // Arrange
      const apiConfig = {
        name: 'payment-gateway',
        baseUrl: 'https://api.payment-provider.com/v1',
        apiKey: 'sk_test_123456789',
        timeout: 30000,
        retries: 3,
      };

      const mockApiResponse = {
        status: 'connected',
        version: 'v1',
        rateLimit: { remaining: 1000, resetTime: new Date() },
      };

      // Act
      const connection = await repositoryIntegration.connectToAPI(apiConfig);

      // Assert
      expect(connection).toBeDefined();
      expect(connection.name).toBe('payment-gateway');
      expect(connection.status).toBe('connected');
      expect(connection.version).toBe('v1');
      expect(mockLogger.info).toHaveBeenCalledWith('api_connection_established', expect.objectContaining({
        apiName: 'payment-gateway',
        baseUrl: 'https://api.payment-provider.com/v1',
      }));
    });

    it('should handle API connection failures', async () => {
      // Arrange
      const apiConfig = {
        name: 'email-service',
        baseUrl: 'https://api.email-service.com/v1',
        apiKey: 'invalid-key',
        timeout: 30000,
        retries: 3,
      };

      // Act
      const connection = await repositoryIntegration.connectToAPI(apiConfig);

      // Assert
      expect(connection).toBeDefined();
      expect(connection.name).toBe('email-service');
      expect(connection.status).toBe('failed');
      expect(connection.error).toBeDefined();
      expect(mockLogger.error).toHaveBeenCalledWith('api_connection_failed', expect.objectContaining({
        apiName: 'email-service',
        error: expect.any(String),
      }));
    });

    it('should make API requests with authentication', async () => {
      // Arrange
      const apiConnection = {
        name: 'payment-gateway',
        baseUrl: 'https://api.payment-provider.com/v1',
        apiKey: 'sk_test_123456789',
        status: 'connected',
      };

      const requestConfig = {
        method: 'POST',
        endpoint: '/charges',
        data: {
          amount: 2000,
          currency: 'usd',
          source: 'tok_123456789',
        },
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const mockResponse = {
        id: 'ch_123456789',
        amount: 2000,
        currency: 'usd',
        status: 'succeeded',
      };

      // Act
      const response = await repositoryIntegration.makeAPIRequest(apiConnection, requestConfig);

      // Assert
      expect(response).toBeDefined();
      expect(response.id).toBe('ch_123456789');
      expect(response.amount).toBe(2000);
      expect(response.status).toBe('succeeded');
      expect(mockLogger.debug).toHaveBeenCalledWith('api_request_completed', expect.objectContaining({
        apiName: 'payment-gateway',
        method: 'POST',
        endpoint: '/charges',
        status: 'success',
      }));
    });

    it('should handle API request retries', async () => {
      // Arrange
      const apiConnection = {
        name: 'analytics-service',
        baseUrl: 'https://api.analytics.com/v1',
        apiKey: 'key_123456789',
        status: 'connected',
      };

      const requestConfig = {
        method: 'GET',
        endpoint: '/events',
        retries: 3,
        retryDelay: 1000,
      };

      // Act
      const response = await repositoryIntegration.makeAPIRequest(apiConnection, requestConfig);

      // Assert
      expect(response).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('api_request_retried', expect.objectContaining({
        apiName: 'analytics-service',
        attempt: expect.any(Number),
        maxRetries: 3,
      }));
    });

    it('should validate API response format', () => {
      // Arrange
      const validResponse = {
        data: [{ id: 1, name: 'Test' }],
        meta: { total: 1, page: 1 },
        status: 200,
      };

      const invalidResponse = {
        error: 'Invalid request',
        message: 'Missing required field',
      };

      // Act
      const validValidation = repositoryIntegration.validateAPIResponse(validResponse);
      const invalidValidation = repositoryIntegration.validateAPIResponse(invalidResponse);

      // Assert
      expect(validValidation.isValid).toBe(true);
      expect(invalidValidation.isValid).toBe(false);
      expect(invalidValidation.errors).toBeDefined();
    });
  });

  describe('Webhook Integration', () => {
    it('should register webhook endpoint', async () => {
      // Arrange
      const webhookConfig = {
        name: 'payment-webhook',
        url: 'https://api.payment-provider.com/webhooks',
        events: ['payment.succeeded', 'payment.failed', 'chargeback.created'],
        secret: 'webhook_secret_123',
        active: true,
      };

      const mockWebhookResponse = {
        id: 'webhook_123456789',
        status: 'active',
        url: 'https://api.payment-provider.com/webhooks',
        events: ['payment.succeeded', 'payment.failed', 'chargeback.created'],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockWebhookResponse] });

      // Act
      const webhook = await repositoryIntegration.registerWebhook(webhookConfig);

      // Assert
      expect(webhook).toBeDefined();
      expect(webhook.name).toBe('payment-webhook');
      expect(webhook.status).toBe('active');
      expect(webhook.events).toEqual(['payment.succeeded', 'payment.failed', 'chargeback.created']);
      expect(mockLogger.info).toHaveBeenCalledWith('webhook_registered', expect.objectContaining({
        webhookName: 'payment-webhook',
        url: 'https://api.payment-provider.com/webhooks',
        events: expect.any(Array),
      }));
    });

    it('should handle webhook events', async () => {
      // Arrange
      const webhookEvent = {
        id: 'evt_123456789',
        type: 'payment.succeeded',
        data: {
          paymentId: 'pay_123456789',
          amount: 2000,
          currency: 'usd',
          status: 'succeeded',
        },
        timestamp: new Date(),
        signature: 'signature_123456789',
      };

      const webhookConfig = {
        name: 'payment-webhook',
        secret: 'webhook_secret_123',
        events: ['payment.succeeded', 'payment.failed'],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [webhookConfig] });

      // Act
      const result = await repositoryIntegration.handleWebhookEvent(webhookEvent);

      // Assert
      expect(result).toBeDefined();
      expect(result.processed).toBe(true);
      expect(result.eventType).toBe('payment.succeeded');
      expect(result.signatureVerified).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('webhook_event_processed', expect.objectContaining({
        eventId: 'evt_123456789',
        eventType: 'payment.succeeded',
      }));
    });

    it('should verify webhook signatures', () => {
      // Arrange
      const payload = JSON.stringify({ id: 'evt_123', type: 'payment.succeeded' });
      const secret = 'webhook_secret_123';
      const signature = 'generated_signature_123';

      // Act
      const isValid = repositoryIntegration.verifyWebhookSignature(payload, secret, signature);

      // Assert
      expect(typeof isValid).toBe('boolean');
    });

    it('should handle webhook delivery failures', async () => {
      // Arrange
      const webhookConfig = {
        name: 'notification-webhook',
        url: 'https://unreachable-service.com/webhooks',
        events: ['user.created'],
        secret: 'webhook_secret_123',
        active: true,
      };

      const eventData = {
        type: 'user.created',
        data: { userId: 'user_123', email: 'test@example.com' },
      };

      // Act
      const result = await repositoryIntegration.deliverWebhook(webhookConfig, eventData);

      // Assert
      expect(result).toBeDefined();
      expect(result.delivered).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.retryAttempt).toBeGreaterThan(0);
      expect(mockLogger.warn).toHaveBeenCalledWith('webhook_delivery_failed', expect.objectContaining({
        webhookName: 'notification-webhook',
        error: expect.any(String),
        retryAttempt: expect.any(Number),
      }));
    });
  });

  describe('Data Synchronization', () => {
    it('should synchronize data with external system', async () => {
      // Arrange
      const syncConfig = {
        source: 'local_database',
        target: 'crm_system',
        entityType: 'Contact',
        syncDirection: 'bidirectional',
        mapping: {
          'name': 'full_name',
          'email': 'email_address',
          'phone': 'phone_number',
        },
        filters: { status: 'active' },
      };

      const localData = [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '555-1234', status: 'active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '555-5678', status: 'active' },
      ];

      const externalData = [
        { id: 'ext_1', full_name: 'John Doe', email_address: 'john@example.com', phone_number: '555-1234' },
        { id: 'ext_3', full_name: 'Bob Wilson', email_address: 'bob@example.com', phone_number: '555-9876' },
      ];

      mockDbConnection.query = jest.fn()
        .mockResolvedValueOnce({ rows: localData }) // Get local data
        .mockResolvedValueOnce({ rows: externalData }); // Get external data

      // Act
      const sync = await repositoryIntegration.synchronizeData(syncConfig);

      // Assert
      expect(sync).toBeDefined();
      expect(sync.source).toBe('local_database');
      expect(sync.target).toBe('crm_system');
      expect(sync.entityType).toBe('Contact');
      expect(sync.recordsProcessed).toBe(3);
      expect(sync.recordsCreated).toBe(1);
      expect(sync.recordsUpdated).toBe(1);
      expect(sync.recordsDeleted).toBe(0);
      expect(mockLogger.info).toHaveBeenCalledWith('data_synchronization_completed', expect.objectContaining({
        source: 'local_database',
        target: 'crm_system',
        entityType: 'Contact',
        recordsProcessed: 3,
      }));
    });

    it('should handle synchronization conflicts', async () => {
      // Arrange
      const syncConfig = {
        source: 'local_database',
        target: 'external_api',
        entityType: 'Product',
        syncDirection: 'unidirectional',
        conflictResolution: 'manual',
      };

      const conflictingData = [
        {
          localId: 1,
          localData: { name: 'Laptop Pro', price: 999.99, updated_at: new Date('2023-01-15T10:00:00Z') },
          externalId: 'ext_1',
          externalData: { name: 'Laptop Pro', price: 1099.99, updated_at: new Date('2023-01-15T11:00:00Z') },
        },
      ];

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: conflictingData });

      // Act
      const sync = await repositoryIntegration.synchronizeData(syncConfig);

      // Assert
      expect(sync).toBeDefined();
      expect(sync.conflicts).toHaveLength(1);
      expect(sync.conflicts[0].field).toBe('price');
      expect(sync.conflicts[0].localValue).toBe(999.99);
      expect(sync.conflicts[0].externalValue).toBe(1099.99);
      expect(sync.conflicts[0].resolution).toBe('manual');
      expect(mockLogger.warn).toHaveBeenCalledWith('synchronization_conflicts_detected', expect.objectContaining({
        entityType: 'Product',
        conflictCount: 1,
      }));
    });

    it('should perform incremental synchronization', async () => {
      // Arrange
      const syncConfig = {
        source: 'local_database',
        target: 'analytics_platform',
        entityType: 'Order',
        syncDirection: 'unidirectional',
        incremental: true,
        lastSyncTime: new Date('2023-01-14T00:00:00Z'),
        timestampField: 'updated_at',
      };

      const incrementalData = [
        { id: 1, total: 100, status: 'completed', updated_at: new Date('2023-01-15T10:00:00Z') },
        { id: 2, total: 200, status: 'pending', updated_at: new Date('2023-01-15T11:00:00Z') },
      ];

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: incrementalData });

      // Act
      const sync = await repositoryIntegration.synchronizeData(syncConfig);

      // Assert
      expect(sync).toBeDefined();
      expect(sync.incremental).toBe(true);
      expect(sync.lastSyncTime).toEqual(new Date('2023-01-14T00:00:00Z'));
      expect(sync.recordsProcessed).toBe(2);
      expect(mockLogger.info).toHaveBeenCalledWith('incremental_synchronization_completed', expect.objectContaining({
        entityType: 'Order',
        recordsProcessed: 2,
        lastSyncTime: syncConfig.lastSyncTime,
      }));
    });

    it('should schedule periodic synchronization', () => {
      // Arrange
      const scheduleConfig = {
        name: 'daily_crm_sync',
        source: 'local_database',
        target: 'crm_system',
        entityType: 'Contact',
        frequency: 'daily',
        time: '02:00',
        timezone: 'UTC',
        conflictResolution: 'latest_wins',
      };

      // Act
      const schedule = repositoryIntegration.createSyncSchedule(scheduleConfig);

      // Assert
      expect(schedule).toBeDefined();
      expect(schedule.name).toBe('daily_crm_sync');
      expect(schedule.frequency).toBe('daily');
      expect(schedule.time).toBe('02:00');
      expect(schedule.enabled).toBe(true);
      expect(schedule.nextRun).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('sync_schedule_created', expect.objectContaining({
        scheduleName: 'daily_crm_sync',
        frequency: 'daily',
        time: '02:00',
      }));
    });
  });

  describe('Message Queue Integration', () => {
    it('should connect to message queue', async () => {
      // Arrange
      const queueConfig = {
        name: 'order-processing',
        type: 'rabbitmq',
        host: 'localhost',
        port: 5672,
        username: 'guest',
        password: 'guest',
        virtualHost: '/',
      };

      // Act
      const connection = await repositoryIntegration.connectToMessageQueue(queueConfig);

      // Assert
      expect(connection).toBeDefined();
      expect(connection.name).toBe('order-processing');
      expect(connection.type).toBe('rabbitmq');
      expect(connection.status).toBe('connected');
      expect(mockLogger.info).toHaveBeenCalledWith('message_queue_connected', expect.objectContaining({
        queueName: 'order-processing',
        type: 'rabbitmq',
        host: 'localhost',
      }));
    });

    it('should publish message to queue', async () => {
      // Arrange
      const queueConnection = {
        name: 'order-processing',
        type: 'rabbitmq',
        status: 'connected',
      };

      const message = {
        id: 'msg_123456789',
        type: 'order.created',
        data: {
          orderId: 'order_123',
          customerId: 'customer_456',
          total: 199.99,
          items: [{ productId: 'product_789', quantity: 2 }],
        },
        timestamp: new Date(),
        priority: 'normal',
      };

      // Act
      const result = await repositoryIntegration.publishMessage(queueConnection, message);

      // Assert
      expect(result).toBeDefined();
      expect(result.published).toBe(true);
      expect(result.messageId).toBe('msg_123456789');
      expect(result.queue).toBe('order-processing');
      expect(mockLogger.debug).toHaveBeenCalledWith('message_published', expect.objectContaining({
        messageId: 'msg_123456789',
        messageType: 'order.created',
        queue: 'order-processing',
      }));
    });

    it('should consume messages from queue', async () => {
      // Arrange
      const queueConnection = {
        name: 'order-processing',
        type: 'rabbitmq',
        status: 'connected',
      };

      const consumerConfig = {
        queue: 'order-processing',
        consumerTag: 'consumer_123',
        autoAck: false,
        prefetch: 10,
      };

      const mockMessages = [
        {
          id: 'msg_123456789',
          type: 'order.created',
          data: { orderId: 'order_123', total: 199.99 },
          timestamp: new Date(),
          deliveryTag: 1,
        },
        {
          id: 'msg_987654321',
          type: 'order.updated',
          data: { orderId: 'order_456', status: 'shipped' },
          timestamp: new Date(),
          deliveryTag: 2,
        },
      ];

      // Act
      const messages = await repositoryIntegration.consumeMessages(queueConnection, consumerConfig);

      // Assert
      expect(messages).toBeDefined();
      expect(messages).toHaveLength(2);
      expect(messages[0].type).toBe('order.created');
      expect(messages[1].type).toBe('order.updated');
      expect(messages[0].deliveryTag).toBe(1);
      expect(messages[1].deliveryTag).toBe(2);
    });

    it('should handle message processing failures', async () => {
      // Arrange
      const queueConnection = {
        name: 'order-processing',
        type: 'rabbitmq',
        status: 'connected',
      };

      const message = {
        id: 'msg_123456789',
        type: 'order.created',
        data: { orderId: 'order_123', total: 199.99 },
        timestamp: new Date(),
        deliveryTag: 1,
      };

      const processingError = new Error('Database connection failed');

      // Act
      const result = await repositoryIntegration.processMessage(queueConnection, message, processingError);

      // Assert
      expect(result).toBeDefined();
      expect(result.processed).toBe(false);
      expect(result.error).toBe('Database connection failed');
      expect(result.requeued).toBe(true);
      expect(mockLogger.error).toHaveBeenCalledWith('message_processing_failed', expect.objectContaining({
        messageId: 'msg_123456789',
        error: 'Database connection failed',
        requeued: true,
      }));
    });
  });

  describe('Cache Integration', () => {
    it('should connect to external cache', async () => {
      // Arrange
      const cacheConfig = {
        name: 'redis-cache',
        type: 'redis',
        host: 'localhost',
        port: 6379,
        database: 0,
        password: 'cache_password_123',
        timeout: 5000,
      };

      // Act
      const connection = await repositoryIntegration.connectToCache(cacheConfig);

      // Assert
      expect(connection).toBeDefined();
      expect(connection.name).toBe('redis-cache');
      expect(connection.type).toBe('redis');
      expect(connection.status).toBe('connected');
      expect(mockLogger.info).toHaveBeenCalledWith('cache_connected', expect.objectContaining({
        cacheName: 'redis-cache',
        type: 'redis',
        host: 'localhost',
        port: 6379,
      }));
    });

    it('should cache data from external source', async () => {
      // Arrange
      const cacheConnection = {
        name: 'redis-cache',
        type: 'redis',
        status: 'connected',
      };

      const cacheConfig = {
        key: 'user:123',
        data: { id: 123, name: 'John Doe', email: 'john@example.com' },
        ttl: 3600, // 1 hour
        tags: ['user', 'profile'],
      };

      // Act
      const result = await repositoryIntegration.cacheData(cacheConnection, cacheConfig);

      // Assert
      expect(result).toBeDefined();
      expect(result.cached).toBe(true);
      expect(result.key).toBe('user:123');
      expect(result.ttl).toBe(3600);
      expect(mockLogger.debug).toHaveBeenCalledWith('data_cached', expect.objectContaining({
        key: 'user:123',
        ttl: 3600,
        tags: ['user', 'profile'],
      }));
    });

    it('should retrieve cached data', async () => {
      // Arrange
      const cacheConnection = {
        name: 'redis-cache',
        type: 'redis',
        status: 'connected',
      };

      const cachedData = {
        id: 123,
        name: 'John Doe',
        email: 'john@example.com',
        cachedAt: new Date(),
        ttl: 3600,
      };

      // Act
      const result = await repositoryIntegration.getCachedData(cacheConnection, 'user:123');

      // Assert
      expect(result).toBeDefined();
      expect(result.found).toBe(true);
      expect(result.data).toEqual(cachedData);
      expect(mockLogger.debug).toHaveBeenCalledWith('cache_hit', expect.objectContaining({
        key: 'user:123',
      }));
    });

    it('should invalidate cache entries', async () => {
      // Arrange
      const cacheConnection = {
        name: 'redis-cache',
        type: 'redis',
        status: 'connected',
      };

      const invalidationConfig = {
        keys: ['user:123', 'user:456'],
        tags: ['user'],
        pattern: 'user:*',
      };

      // Act
      const result = await repositoryIntegration.invalidateCache(cacheConnection, invalidationConfig);

      // Assert
      expect(result).toBeDefined();
      expect(result.invalidated).toBe(true);
      expect(result.keysInvalidated).toContain('user:123');
      expect(result.keysInvalidated).toContain('user:456');
      expect(result.tagsInvalidated).toContain('user');
      expect(mockLogger.info).toHaveBeenCalledWith('cache_invalidated', expect.objectContaining({
        keysInvalidated: expect.any(Array),
        tagsInvalidated: expect.any(Array),
      }));
    });
  });

  describe('File Storage Integration', () => {
    it('should connect to file storage service', async () => {
      // Arrange
      const storageConfig = {
        name: 'aws-s3',
        type: 's3',
        region: 'us-west-2',
        bucket: 'my-app-storage',
        accessKey: 'AKIA123456789',
        secretKey: 'secret123456789',
      };

      // Act
      const connection = await repositoryIntegration.connectToFileStorage(storageConfig);

      // Assert
      expect(connection).toBeDefined();
      expect(connection.name).toBe('aws-s3');
      expect(connection.type).toBe('s3');
      expect(connection.region).toBe('us-west-2');
      expect(connection.bucket).toBe('my-app-storage');
      expect(connection.status).toBe('connected');
      expect(mockLogger.info).toHaveBeenCalledWith('file_storage_connected', expect.objectContaining({
        storageName: 'aws-s3',
        type: 's3',
        bucket: 'my-app-storage',
        region: 'us-west-2',
      }));
    });

    it('should upload file to storage', async () => {
      // Arrange
      const storageConnection = {
        name: 'aws-s3',
        type: 's3',
        bucket: 'my-app-storage',
        status: 'connected',
      };

      const uploadConfig = {
        key: 'uploads/user-avatar-123.jpg',
        data: 'file-content-binary',
        contentType: 'image/jpeg',
        metadata: {
          userId: '123',
          originalName: 'avatar.jpg',
          size: 1024000,
        },
        permissions: 'private',
      };

      // Act
      const result = await repositoryIntegration.uploadFile(storageConnection, uploadConfig);

      // Assert
      expect(result).toBeDefined();
      expect(result.uploaded).toBe(true);
      expect(result.key).toBe('uploads/user-avatar-123.jpg');
      expect(result.url).toBeDefined();
      expect(result.size).toBe(1024000);
      expect(mockLogger.info).toHaveBeenCalledWith('file_uploaded', expect.objectContaining({
        key: 'uploads/user-avatar-123.jpg',
        size: 1024000,
        contentType: 'image/jpeg',
      }));
    });

    it('should download file from storage', async () => {
      // Arrange
      const storageConnection = {
        name: 'aws-s3',
        type: 's3',
        bucket: 'my-app-storage',
        status: 'connected',
      };

      // Act
      const result = await repositoryIntegration.downloadFile(storageConnection, 'uploads/user-avatar-123.jpg');

      // Assert
      expect(result).toBeDefined();
      expect(result.downloaded).toBe(true);
      expect(result.key).toBe('uploads/user-avatar-123.jpg');
      expect(result.data).toBeDefined();
      expect(result.contentType).toBe('image/jpeg');
      expect(mockLogger.debug).toHaveBeenCalledWith('file_downloaded', expect.objectContaining({
        key: 'uploads/user-avatar-123.jpg',
        size: expect.any(Number),
      }));
    });

    it('should delete file from storage', async () => {
      // Arrange
      const storageConnection = {
        name: 'aws-s3',
        type: 's3',
        bucket: 'my-app-storage',
        status: 'connected',
      };

      // Act
      const result = await repositoryIntegration.deleteFile(storageConnection, 'uploads/user-avatar-123.jpg');

      // Assert
      expect(result).toBeDefined();
      expect(result.deleted).toBe(true);
      expect(result.key).toBe('uploads/user-avatar-123.jpg');
      expect(mockLogger.info).toHaveBeenCalledWith('file_deleted', expect.objectContaining({
        key: 'uploads/user-avatar-123.jpg',
      }));
    });
  });

  describe('Integration Monitoring', () => {
    it('should monitor integration health', async () => {
      // Arrange
      const integrations = [
        { name: 'payment-gateway', type: 'api', status: 'connected', lastCheck: new Date() },
        { name: 'email-service', type: 'api', status: 'connected', lastCheck: new Date() },
        { name: 'redis-cache', type: 'cache', status: 'connected', lastCheck: new Date() },
        { name: 'aws-s3', type: 'storage', status: 'disconnected', lastCheck: new Date() },
      ];

      // Act
      const health = await repositoryIntegration.monitorIntegrationHealth(integrations);

      // Assert
      expect(health).toBeDefined();
      expect(health.totalIntegrations).toBe(4);
      expect(health.healthyIntegrations).toBe(3);
      expect(health.unhealthyIntegrations).toBe(1);
      expect(health.overallHealth).toBe('degraded');
      expect(health.integrations).toHaveLength(4);
      expect(health.integrations[3].status).toBe('disconnected');
    });

    it('should track integration performance metrics', async () => {
      // Arrange
      const metricsConfig = {
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
        integrations: ['payment-gateway', 'email-service', 'redis-cache'],
      };

      const mockMetrics = {
        'payment-gateway': {
          totalRequests: 10000,
          successfulRequests: 9500,
          failedRequests: 500,
          averageResponseTime: 150,
          p95ResponseTime: 300,
        },
        'email-service': {
          totalRequests: 5000,
          successfulRequests: 4800,
          failedRequests: 200,
          averageResponseTime: 200,
          p95ResponseTime: 400,
        },
        'redis-cache': {
          totalRequests: 50000,
          successfulRequests: 49000,
          failedRequests: 1000,
          averageResponseTime: 5,
          p95ResponseTime: 10,
        },
      };

      // Act
      const metrics = await repositoryIntegration.getIntegrationMetrics(metricsConfig);

      // Assert
      expect(metrics).toBeDefined();
      expect(metrics['payment-gateway']).toBeDefined();
      expect(metrics['payment-gateway'].totalRequests).toBe(10000);
      expect(metrics['payment-gateway'].successRate).toBe(0.95);
      expect(metrics['redis-cache'].averageResponseTime).toBe(5);
      expect(metrics.overall).toBeDefined();
      expect(metrics.overall.totalRequests).toBe(65000);
      expect(metrics.overall.overallSuccessRate).toBe(0.969);
    });

    it('should detect integration anomalies', async () => {
      // Arrange
      const anomalyConfig = {
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
        thresholds: {
          errorRate: 0.05, // 5%
          responseTime: 1000, // 1 second
          availability: 0.99, // 99%
        },
      };

      const mockAnomalies = [
        {
          integration: 'payment-gateway',
          type: 'high_error_rate',
          value: 0.08, // 8% error rate
          threshold: 0.05,
          severity: 'medium',
        },
        {
          integration: 'email-service',
          type: 'slow_response',
          value: 1500, // 1.5 seconds
          threshold: 1000,
          severity: 'high',
        },
        {
          integration: 'redis-cache',
          type: 'low_availability',
          value: 0.95, // 95% availability
          threshold: 0.99,
          severity: 'critical',
        },
      ];

      // Act
      const anomalies = await repositoryIntegration.detectIntegrationAnomalies(anomalyConfig);

      // Assert
      expect(anomalies).toBeDefined();
      expect(anomalies.anomalies).toHaveLength(3);
      expect(anomalies.anomalies[0].integration).toBe('payment-gateway');
      expect(anomalies.anomalies[0].severity).toBe('medium');
      expect(anomalies.anomalies[1].severity).toBe('high');
      expect(anomalies.anomalies[2].severity).toBe('critical');
      expect(anomalies.summary).toBeDefined();
      expect(anomalies.summary.totalAnomalies).toBe(3);
    });

    it('should generate integration health report', async () => {
      // Arrange
      const reportConfig = {
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
        includeMetrics: true,
        includeAnomalies: true,
        includeRecommendations: true,
        format: 'detailed',
      };

      const mockReportData = {
        overview: {
          totalIntegrations: 10,
          healthyIntegrations: 8,
          unhealthyIntegrations: 2,
          overallHealth: 'good',
        },
        metrics: {
          totalRequests: 100000,
          overallSuccessRate: 0.98,
          averageResponseTime: 120,
        },
        anomalies: [
          { integration: 'payment-gateway', type: 'high_error_rate', severity: 'medium' },
          { integration: 'email-service', type: 'slow_response', severity: 'high' },
        ],
        recommendations: [
          'Investigate payment-gateway error rate increase',
          'Optimize email-service response time',
        ],
      };

      // Act
      const report = await repositoryIntegration.generateHealthReport(reportConfig);

      // Assert
      expect(report).toBeDefined();
      expect(report.overview).toBeDefined();
      expect(report.metrics).toBeDefined();
      expect(report.anomalies).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(report.overview.totalIntegrations).toBe(10);
      expect(report.overview.healthyIntegrations).toBe(8);
      expect(report.overview.unhealthyIntegrations).toBe(2);
    });
  });

  describe('Integration Configuration', () => {
    it('should configure integration settings', () => {
      // Arrange
      const settings = {
        defaultTimeout: 30000,
        defaultRetries: 3,
        retryDelay: 1000,
        enableLogging: true,
        logLevel: 'info',
        enableMetrics: true,
        enableHealthChecks: true,
        healthCheckInterval: 60000, // 1 minute
      };

      // Act
      repositoryIntegration.configureSettings(settings);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('integration_settings_configured', expect.objectContaining({
        settings,
      }));
    });

    it('should configure integration policies', () => {
      // Arrange
      const policies = {
        api: {
          rateLimiting: true,
          rateLimit: 1000, // requests per minute
          timeout: 30000,
          retries: 3,
        },
        webhook: {
          signatureVerification: true,
          retryAttempts: 5,
          retryDelay: 5000,
        },
        synchronization: {
          batchSize: 100,
          conflictResolution: 'latest_wins',
          enableIncrementalSync: true,
        },
        cache: {
          defaultTTL: 3600,
          maxMemoryUsage: 0.8,
          enableCompression: true,
        },
      };

      // Act
      repositoryIntegration.configurePolicies(policies);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('integration_policies_configured', expect.objectContaining({
        policies,
      }));
    });

    it('should configure integration alerts', () => {
      // Arrange
      const alerts = {
        apiFailures: {
          enabled: true,
          threshold: 5, // failures per minute
          severity: 'high',
          recipients: ['ops@example.com'],
        },
        webhookFailures: {
          enabled: true,
          threshold: 3, // failures per minute
          severity: 'medium',
          recipients: ['dev@example.com'],
        },
        synchronizationErrors: {
          enabled: true,
          threshold: 10, // errors per hour
          severity: 'medium',
          recipients: ['dev@example.com', 'ops@example.com'],
        },
      };

      // Act
      repositoryIntegration.configureAlerts(alerts);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('integration_alerts_configured', expect.objectContaining({
        alerts,
      }));
    });
  });

  describe('Integration Security', () => {
    it('should validate API credentials', () => {
      // Arrange
      const credentials = {
        apiKey: 'sk_test_123456789',
        apiSecret: 'secret_123456789',
        passphrase: 'passphrase_123',
      };

      // Act
      const validation = repositoryIntegration.validateAPICredentials(credentials);

      // Assert
      expect(validation).toBeDefined();
      expect(validation.valid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('should encrypt sensitive integration data', async () => {
      // Arrange
      const sensitiveData = {
        apiKey: 'sk_test_123456789',
        password: 'secret_password_123',
        privateKey: 'private_key_123',
      };

      const encryptionConfig = {
        algorithm: 'AES-256-GCM',
        key: 'encryption_key_123',
      };

      // Act
      const encrypted = repositoryIntegration.encryptIntegrationData(sensitiveData, encryptionConfig);

      // Assert
      expect(encrypted).toBeDefined();
      expect(encrypted.apiKey).not.toBe('sk_test_123456789');
      expect(encrypted.password).not.toBe('secret_password_123');
      expect(encrypted.privateKey).not.toBe('private_key_123');
    });

    it('should decrypt sensitive integration data', async () => {
      // Arrange
      const sensitiveData = {
        apiKey: 'sk_test_123456789',
        password: 'secret_password_123',
        privateKey: 'private_key_123',
      };

      const encryptionConfig = {
        algorithm: 'AES-256-GCM',
        key: 'encryption_key_123',
      };

      const encrypted = repositoryIntegration.encryptIntegrationData(sensitiveData, encryptionConfig);

      // Act
      const decrypted = repositoryIntegration.decryptIntegrationData(encrypted, encryptionConfig);

      // Assert
      expect(decrypted).toEqual(sensitiveData);
    });

    it('should audit integration access', async () => {
      // Arrange
      const auditEvent = {
        integrationName: 'payment-gateway',
        userId: 'user-123',
        action: 'api_call',
        timestamp: new Date(),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        metadata: {
          endpoint: '/charges',
          method: 'POST',
          responseTime: 150,
        },
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      const audit = await repositoryIntegration.auditIntegrationAccess(auditEvent);

      // Assert
      expect(audit).toBeDefined();
      expect(audit.auditId).toBeDefined();
      expect(audit.integrationName).toBe('payment-gateway');
      expect(audit.userId).toBe('user-123');
      expect(audit.action).toBe('api_call');
      expect(mockLogger.info).toHaveBeenCalledWith('integration_access_audited', expect.objectContaining({
        auditId: audit.auditId,
        integrationName: 'payment-gateway',
        userId: 'user-123',
        action: 'api_call',
      }));
    });
  });
});
