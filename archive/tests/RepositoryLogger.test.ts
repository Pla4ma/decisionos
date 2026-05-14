/**
 * RepositoryLogger Tests
 * 
 * Comprehensive test suite for RepositoryLogger functionality including
 * logging operations, performance tracking, audit trails, and log analytics.
 */

import { RepositoryLogger } from '../repositories/RepositoryLogger';
import { Logger } from '../logging/Logger';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

describe('RepositoryLogger', () => {
  let repositoryLogger: RepositoryLogger;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryLogger = new RepositoryLogger(mockLogger);
  });

  describe('Basic Logging Operations', () => {
    it('should log repository operations', () => {
      // Arrange
      const operation = 'create';
      const entityType = 'User';
      const entityId = 'user-123';
      const metadata = { userId: 'admin-123', timestamp: new Date() };

      // Act
      repositoryLogger.logOperation(operation, entityType, entityId, metadata);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('repository_operation', expect.objectContaining({
        operation,
        entityType,
        entityId,
        metadata,
        timestamp: expect.any(Date),
      }));
    });

    it('should log repository errors', () => {
      // Arrange
      const error = new Error('Database connection failed');
      const operation = 'findById';
      const entityType = 'User';
      const entityId = 'user-123';
      const metadata = { retryCount: 3, timeout: 5000 };

      // Act
      repositoryLogger.logError(error, operation, entityType, entityId, metadata);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith('repository_error', expect.objectContaining({
        error: error.message,
        stack: error.stack,
        operation,
        entityType,
        entityId,
        metadata,
        timestamp: expect.any(Date),
      }));
    });

    it('should log performance metrics', () => {
      // Arrange
      const operation = 'query';
      const entityType = 'Product';
      const duration = 150;
      const metadata = { queryType: 'SELECT', rowCount: 100 };

      // Act
      repositoryLogger.logPerformance(operation, entityType, duration, metadata);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('repository_performance', expect.objectContaining({
        operation,
        entityType,
        duration,
        metadata,
        timestamp: expect.any(Date),
      }));
    });

    it('should log cache operations', () => {
      // Arrange
      const operation = 'cache_hit';
      const entityType = 'Order';
      const cacheKey = 'order:123';
      const metadata = { ttl: 300, cacheType: 'redis' };

      // Act
      repositoryLogger.logCacheOperation(operation, entityType, cacheKey, metadata);

      // Assert
      expect(mockLogger.debug).toHaveBeenCalledWith('repository_cache', expect.objectContaining({
        operation,
        entityType,
        cacheKey,
        metadata,
        timestamp: expect.any(Date),
      }));
    });

    it('should log validation results', () => {
      // Arrange
      const entityType = 'Payment';
      const isValid = false;
      const errors = ['Invalid amount', 'Missing currency'];
      const metadata = { field: 'amount', value: -100 };

      // Act
      repositoryLogger.logValidation(entityType, isValid, errors, metadata);

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith('repository_validation', expect.objectContaining({
        entityType,
        isValid,
        errors,
        metadata,
        timestamp: expect.any(Date),
      }));
    });
  });

  describe('Repository-Specific Logging', () => {
    it('should log CRUD operations with context', () => {
      // Arrange
      const repositoryType = 'UserRepository';
      const operation = 'create';
      const entity = { id: 'user-123', name: 'John Doe', email: 'john@example.com' };
      const context = { requestId: 'req-123', userId: 'admin-123' };

      // Act
      repositoryLogger.logCrudOperation(repositoryType, operation, entity, context);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('repository_crud', expect.objectContaining({
        repositoryType,
        operation,
        entityType: 'User',
        entityId: 'user-123',
        entity,
        context,
        timestamp: expect.any(Date),
      }));
    });

    it('should log query operations', () => {
      // Arrange
      const repositoryType = 'ProductRepository';
      const query = 'SELECT * FROM products WHERE category = $1';
      const parameters = ['electronics'];
      const resultCount = 25;
      const duration = 45;

      // Act
      repositoryLogger.logQuery(repositoryType, query, parameters, resultCount, duration);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('repository_query', expect.objectContaining({
        repositoryType,
        query,
        parameters,
        resultCount,
        duration,
        timestamp: expect.any(Date),
      }));
    });

    it('should log transaction operations', () => {
      // Arrange
      const transactionId = 'txn-123';
      const operation = 'begin';
      const repositories = ['UserRepository', 'OrderRepository'];
      const metadata = { isolationLevel: 'READ_COMMITTED' };

      // Act
      repositoryLogger.logTransaction(transactionId, operation, repositories, metadata);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('repository_transaction', expect.objectContaining({
        transactionId,
        operation,
        repositories,
        metadata,
        timestamp: expect.any(Date),
      }));
    });

    it('should log batch operations', () => {
      // Arrange
      const repositoryType = 'NotificationRepository';
      const operation = 'bulk_insert';
      const batchSize = 100;
      const duration = 1250;
      const successCount = 95;
      const failureCount = 5;

      // Act
      repositoryLogger.logBatchOperation(repositoryType, operation, batchSize, duration, successCount, failureCount);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('repository_batch', expect.objectContaining({
        repositoryType,
        operation,
        batchSize,
        duration,
        successCount,
        failureCount,
        successRate: 0.95,
        timestamp: expect.any(Date),
      }));
    });
  });

  describe('Performance Logging', () => {
    it('should log slow operations', () => {
      // Arrange
      const operation = 'complex_query';
      const entityType = 'Analytics';
      const duration = 5000; // 5 seconds
      const threshold = 1000; // 1 second threshold
      const metadata = { queryComplexity: 'high', indexes: 3 };

      // Act
      repositoryLogger.logSlowOperation(operation, entityType, duration, threshold, metadata);

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith('repository_slow_operation', expect.objectContaining({
        operation,
        entityType,
        duration,
        threshold,
        slownessFactor: 5,
        metadata,
        timestamp: expect.any(Date),
      }));
    });

    it('should log memory usage', () => {
      // Arrange
      const repositoryType = 'ReportRepository';
      const memoryUsage = 52428800; // 50MB
      const memoryLimit = 104857600; // 100MB
      const metadata = { operation: 'generate_report', recordCount: 100000 };

      // Act
      repositoryLogger.logMemoryUsage(repositoryType, memoryUsage, memoryLimit, metadata);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('repository_memory', expect.objectContaining({
        repositoryType,
        memoryUsage,
        memoryLimit,
        usagePercentage: 0.5,
        metadata,
        timestamp: expect.any(Date),
      }));
    });

    it('should log connection pool metrics', () => {
      // Arrange
      const poolStats = {
        total: 20,
        active: 15,
        idle: 5,
        waiting: 3,
        max: 25,
      };
      const metadata = { repositoryType: 'IntegrationRepository' };

      // Act
      repositoryLogger.logConnectionPool(poolStats, metadata);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('repository_connection_pool', expect.objectContaining({
        poolStats,
        utilizationRate: 0.75,
        waitRate: 0.15,
        metadata,
        timestamp: expect.any(Date),
      }));
    });

    it('should log database query performance', () => {
      // Arrange
      const query = 'SELECT * FROM orders WHERE status = $1 AND created_at > $2';
      const executionPlan = {
        cost: 125.5,
        rows: 1000,
        width: 156,
        actualTime: 45.2,
        planningTime: 2.1,
      };
      const metadata = { repositoryType: 'OrderRepository', parameters: ['completed', '2023-01-01'] };

      // Act
      repositoryLogger.logQueryPerformance(query, executionPlan, metadata);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('repository_query_performance', expect.objectContaining({
        query,
        executionPlan,
        metadata,
        timestamp: expect.any(Date),
      }));
    });
  });

  describe('Audit Logging', () => {
    it('should log data access', () => {
      // Arrange
      const entityType = 'User';
      const entityId = 'user-123';
      const operation = 'read';
      const userId = 'admin-456';
      const ipAddress = '192.168.1.100';
      const metadata = { fields: ['name', 'email'], purpose: 'profile_view' };

      // Act
      repositoryLogger.logDataAccess(entityType, entityId, operation, userId, ipAddress, metadata);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('repository_audit_access', expect.objectContaining({
        entityType,
        entityId,
        operation,
        userId,
        ipAddress,
        metadata,
        timestamp: expect.any(Date),
      }));
    });

    it('should log data modifications', () => {
      // Arrange
      const entityType = 'Payment';
      const entityId = 'payment-123';
      const operation = 'update';
      const userId = 'admin-456';
      const changes = {
        status: { from: 'pending', to: 'completed' },
        amount: { from: 100.00, to: 95.00 },
      };
      const metadata = { reason: 'discount_applied', approvedBy: 'manager-789' };

      // Act
      repositoryLogger.logDataModification(entityType, entityId, operation, userId, changes, metadata);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('repository_audit_modification', expect.objectContaining({
        entityType,
        entityId,
        operation,
        userId,
        changes,
        metadata,
        timestamp: expect.any(Date),
      }));
    });

    it('should log sensitive data access', () => {
      // Arrange
      const entityType = 'User';
      const entityId = 'user-123';
      const sensitiveFields = ['ssn', 'credit_card', 'bank_account'];
      const userId = 'admin-456';
      const purpose = 'fraud_investigation';
      const metadata = { caseId: 'case-789', authorized: true };

      // Act
      repositoryLogger.logSensitiveDataAccess(entityType, entityId, sensitiveFields, userId, purpose, metadata);

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith('repository_audit_sensitive', expect.objectContaining({
        entityType,
        entityId,
        sensitiveFields,
        userId,
        purpose,
        metadata,
        timestamp: expect.any(Date),
      }));
    });

    it('should log security events', () => {
      // Arrange
      const eventType = 'unauthorized_access';
      const entityType = 'User';
      const entityId = 'user-123';
      const userId = 'user-456';
      const details = {
        attemptedOperation: 'delete',
        reason: 'insufficient_permissions',
        ipAddress: '192.168.1.200',
      };
      const metadata = { riskLevel: 'high', blocked: true };

      // Act
      repositoryLogger.logSecurityEvent(eventType, entityType, entityId, userId, details, metadata);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith('repository_audit_security', expect.objectContaining({
        eventType,
        entityType,
        entityId,
        userId,
        details,
        metadata,
        timestamp: expect.any(Date),
      }));
    });
  });

  describe('Log Aggregation and Analytics', () => {
    it('should aggregate operation statistics', () => {
      // Arrange
      const operations = [
        { operation: 'create', entityType: 'User', duration: 45, success: true },
        { operation: 'create', entityType: 'User', duration: 52, success: true },
        { operation: 'find', entityType: 'User', duration: 23, success: true },
        { operation: 'update', entityType: 'User', duration: 67, success: false },
        { operation: 'create', entityType: 'Product', duration: 38, success: true },
      ];

      // Act
      const stats = repositoryLogger.aggregateOperationStats(operations);

      // Assert
      expect(stats).toBeDefined();
      expect(stats.totalOperations).toBe(5);
      expect(stats.successRate).toBe(0.8);
      expect(stats.averageDuration).toBe(45);
      expect(stats.byEntityType.User.count).toBe(4);
      expect(stats.byEntityType.Product.count).toBe(1);
      expect(stats.byOperation.create.count).toBe(3);
    });

    it('should generate performance report', () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };
      const performanceData = [
        { repositoryType: 'UserRepository', averageDuration: 45, operationCount: 1000 },
        { repositoryType: 'ProductRepository', averageDuration: 38, operationCount: 800 },
        { repositoryType: 'OrderRepository', averageDuration: 67, operationCount: 600 },
      ];

      // Act
      const report = repositoryLogger.generatePerformanceReport(timeRange, performanceData);

      // Assert
      expect(report).toBeDefined();
      expect(report.period).toEqual(timeRange);
      expect(report.totalOperations).toBe(2400);
      expect(report.overallAverageDuration).toBe(48.33);
      expect(report.slowestRepository).toBe('OrderRepository');
      expect(report.fastestRepository).toBe('ProductRepository');
    });

    it('should track error trends', () => {
      // Arrange
      const errors = [
        { type: 'DatabaseError', count: 15, trend: 'increasing' },
        { type: 'ValidationError', count: 8, trend: 'stable' },
        { type: 'TimeoutError', count: 3, trend: 'decreasing' },
      ];

      // Act
      const trends = repositoryLogger.trackErrorTrends(errors);

      // Assert
      expect(trends).toBeDefined();
      expect(trends.totalErrors).toBe(26);
      expect(trends.mostCommonError).toBe('DatabaseError');
      expect(trends.trendingErrors).toContain('DatabaseError');
      expect(trends.stableErrors).toContain('ValidationError');
    });

    it('should analyze cache performance', () => {
      // Arrange
      const cacheData = [
        { operation: 'cache_hit', count: 850, repositoryType: 'UserRepository' },
        { operation: 'cache_miss', count: 150, repositoryType: 'UserRepository' },
        { operation: 'cache_hit', count: 600, repositoryType: 'ProductRepository' },
        { operation: 'cache_miss', count: 400, repositoryType: 'ProductRepository' },
      ];

      // Act
      const analysis = repositoryLogger.analyzeCachePerformance(cacheData);

      // Assert
      expect(analysis).toBeDefined();
      expect(analysis.overallHitRate).toBe(0.725);
      expect(analysis.byRepository.UserRepository.hitRate).toBe(0.85);
      expect(analysis.byRepository.ProductRepository.hitRate).toBe(0.6);
      expect(analysis.recommendations).toContain('Consider optimizing ProductRepository cache strategy');
    });
  });

  describe('Log Configuration', () => {
    it('should respect log level settings', () => {
      // Arrange
      const logger = new RepositoryLogger(mockLogger, { level: 'error' });

      // Act
      logger.logOperation('create', 'User', 'user-123');
      logger.logError(new Error('Test error'), 'create', 'User', 'user-123');

      // Assert
      expect(mockLogger.info).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle sensitive data masking', () => {
      // Arrange
      const logger = new RepositoryLogger(mockLogger, { maskSensitiveData: true });
      const sensitiveEntity = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        ssn: '123-45-6789',
        creditCard: '4111-1111-1111-1111',
      };

      // Act
      logger.logOperation('create', 'User', 'user-123', { entity: sensitiveEntity });

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('repository_operation', expect.objectContaining({
        metadata: expect.objectContaining({
          entity: expect.objectContaining({
            ssn: '***-**-****',
            creditCard: '****-****-****-****',
          }),
        }),
      }));
    });

    it('should handle structured logging', () => {
      // Arrange
      const logger = new RepositoryLogger(mockLogger, { structured: true });
      const operation = 'create';
      const entityType = 'User';
      const entityId = 'user-123';

      // Act
      logger.logOperation(operation, entityType, entityId);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('repository_operation', expect.objectContaining({
        operation,
        entityType,
        entityId,
        timestamp: expect.any(Date),
        level: 'info',
        service: 'repository',
      }));
    });
  });

  describe('Error Handling', () => {
    it('should handle logging errors gracefully', () => {
      // Arrange
      const loggerError = new Error('Logger service unavailable');
      mockLogger.info = jest.fn().mockRejectedValue(loggerError);

      // Act & Assert
      expect(() => {
        repositoryLogger.logOperation('create', 'User', 'user-123');
      }).not.toThrow();
    });

    it('should handle circular reference in metadata', () => {
      // Arrange
      const circularMetadata: any = { name: 'test' };
      circularMetadata.self = circularMetadata;

      // Act & Assert
      expect(() => {
        repositoryLogger.logOperation('create', 'User', 'user-123', circularMetadata);
      }).not.toThrow();
    });

    it('should handle very large metadata objects', () => {
      // Arrange
      const largeMetadata = {
        data: Array.from({ length: 10000 }, (_, i) => ({ id: i, value: `item-${i}` })),
      };

      // Act & Assert
      expect(() => {
        repositoryLogger.logOperation('create', 'User', 'user-123', largeMetadata);
      }).not.toThrow();
    });
  });

  describe('Performance Optimization', () => {
    it('should batch log operations', async () => {
      // Arrange
      const operations = [
        { type: 'operation', data: { op: 'create', entity: 'User', id: 'user-1' } },
        { type: 'operation', data: { op: 'create', entity: 'User', id: 'user-2' } },
        { type: 'performance', data: { op: 'query', entity: 'Product', duration: 45 } },
      ];

      // Act
      await repositoryLogger.batchLog(operations);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith('repository_operation', expect.any(Object));
      expect(mockLogger.info).toHaveBeenCalledWith('repository_performance', expect.any(Object));
    });

    it('should implement log sampling', () => {
      // Arrange
      const logger = new RepositoryLogger(mockLogger, { sampleRate: 0.1 });

      // Act
      for (let i = 0; i < 100; i++) {
        logger.logOperation('find', 'User', `user-${i}`);
      }

      // Assert
      // Should have logged approximately 10% of operations (allowing for variance)
      const callCount = mockLogger.info.mock.calls.filter(call => 
        call[0] === 'repository_operation'
      ).length;
      expect(callCount).toBeGreaterThan(5);
      expect(callCount).toBeLessThan(20);
    });

    it('should implement async logging', async () => {
      // Arrange
      const logger = new RepositoryLogger(mockLogger, { async: true });

      // Act
      const startTime = Date.now();
      logger.logOperation('create', 'User', 'user-123');
      const endTime = Date.now();

      // Assert
      // Async logging should return immediately
      expect(endTime - startTime).toBeLessThan(10);
    });
  });

  describe('Log Monitoring and Alerts', () => {
    it('should detect error rate anomalies', () => {
      // Arrange
      const errorRate = 0.15; // 15% error rate
      const threshold = 0.05; // 5% threshold
      const timeWindow = '5m';

      // Act
      const alert = repositoryLogger.checkErrorRate(errorRate, threshold, timeWindow);

      // Assert
      expect(alert).toBeDefined();
      expect(alert.triggered).toBe(true);
      expect(alert.severity).toBe('high');
      expect(alert.message).toContain('Error rate (15%) exceeds threshold (5%)');
    });

    it('should detect performance degradation', () => {
      // Arrange
      const currentPerformance = { averageDuration: 150, p95Duration: 300 };
      const baselinePerformance = { averageDuration: 50, p95Duration: 100 };
      const degradationThreshold = 2.0;

      // Act
      const alert = repositoryLogger.checkPerformanceDegradation(
        currentPerformance,
        baselinePerformance,
        degradationThreshold
      );

      // Assert
      expect(alert).toBeDefined();
      expect(alert.triggered).toBe(true);
      expect(alert.severity).toBe('medium');
      expect(alert.message).toContain('Performance degraded by factor of 3');
    });

    it('should detect unusual activity patterns', () => {
      // Arrange
      const currentActivity = { operationsPerMinute: 1000, uniqueEntities: 50 };
      const typicalActivity = { operationsPerMinute: 100, uniqueEntities: 10 };
      const anomalyThreshold = 5.0;

      // Act
      const alert = repositoryLogger.checkActivityAnomaly(
        currentActivity,
        typicalActivity,
        anomalyThreshold
      );

      // Assert
      expect(alert).toBeDefined();
      expect(alert.triggered).toBe(true);
      expect(alert.severity).toBe('high');
      expect(alert.message).toContain('Unusual activity detected');
    });
  });
});
