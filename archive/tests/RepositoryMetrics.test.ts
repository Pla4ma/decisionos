/**
 * RepositoryMetrics Tests
 * 
 * Comprehensive test suite for RepositoryMetrics functionality including
 * performance tracking, operation metrics, analytics collection, and reporting.
 */

import { RepositoryMetrics } from '../repositories/RepositoryMetrics';
import { Logger } from '../logging/Logger';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

describe('RepositoryMetrics', () => {
  let repositoryMetrics: RepositoryMetrics;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryMetrics = new RepositoryMetrics(mockLogger);
  });

  describe('Operation Metrics', () => {
    it('should record operation metrics', () => {
      // Arrange
      const operation = 'findById';
      const entityType = 'User';
      const duration = 45;
      const success = true;

      // Act
      repositoryMetrics.recordOperation(operation, entityType, duration, success);

      // Assert
      const metrics = repositoryMetrics.getOperationMetrics(operation, entityType);
      expect(metrics).toBeDefined();
      expect(metrics.count).toBe(1);
      expect(metrics.totalDuration).toBe(45);
      expect(metrics.averageDuration).toBe(45);
      expect(metrics.successCount).toBe(1);
      expect(metrics.failureCount).toBe(0);
      expect(metrics.successRate).toBe(1);
    });

    it('should aggregate multiple operations', () => {
      // Arrange
      const operation = 'create';
      const entityType = 'Product';

      // Act
      repositoryMetrics.recordOperation(operation, entityType, 50, true);
      repositoryMetrics.recordOperation(operation, entityType, 75, true);
      repositoryMetrics.recordOperation(operation, entityType, 25, false);
      repositoryMetrics.recordOperation(operation, entityType, 100, true);

      // Assert
      const metrics = repositoryMetrics.getOperationMetrics(operation, entityType);
      expect(metrics.count).toBe(4);
      expect(metrics.totalDuration).toBe(250);
      expect(metrics.averageDuration).toBe(62.5);
      expect(metrics.successCount).toBe(3);
      expect(metrics.failureCount).toBe(1);
      expect(metrics.successRate).toBe(0.75);
    });

    it('should track operation percentiles', () => {
      // Arrange
      const operation = 'query';
      const entityType = 'Order';

      // Act
      repositoryMetrics.recordOperation(operation, entityType, 10, true);
      repositoryMetrics.recordOperation(operation, entityType, 20, true);
      repositoryMetrics.recordOperation(operation, entityType, 30, true);
      repositoryMetrics.recordOperation(operation, entityType, 40, true);
      repositoryMetrics.recordOperation(operation, entityType, 50, true);

      // Assert
      const metrics = repositoryMetrics.getOperationMetrics(operation, entityType);
      expect(metrics.percentiles).toBeDefined();
      expect(metrics.percentiles.p50).toBe(30);
      expect(metrics.percentiles.p95).toBe(50);
      expect(metrics.percentiles.p99).toBe(50);
    });

    it('should reset operation metrics', () => {
      // Arrange
      repositoryMetrics.recordOperation('findById', 'User', 45, true);
      repositoryMetrics.recordOperation('create', 'Product', 75, true);

      // Act
      repositoryMetrics.resetOperationMetrics('findById', 'User');
      const userMetrics = repositoryMetrics.getOperationMetrics('findById', 'User');
      const productMetrics = repositoryMetrics.getOperationMetrics('create', 'Product');

      // Assert
      expect(userMetrics).toBeUndefined();
      expect(productMetrics).toBeDefined();
      expect(productMetrics.count).toBe(1);
    });
  });

  describe('Performance Metrics', () => {
    it('should track database performance', () => {
      // Arrange
      const query = 'SELECT * FROM users WHERE id = $1';
      const duration = 25;
      const rowsAffected = 1;
      const indexUsed = 'users_pkey';

      // Act
      repositoryMetrics.recordDatabasePerformance(query, duration, rowsAffected, indexUsed);

      // Assert
      const metrics = repositoryMetrics.getDatabasePerformanceMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.totalQueries).toBe(1);
      expect(metrics.totalDuration).toBe(25);
      expect(metrics.averageDuration).toBe(25);
      expect(metrics.totalRowsAffected).toBe(1);
      expect(metrics.indexUsage).toBeDefined();
      expect(metrics.indexUsage.users_pkey).toBe(1);
    });

    it('should track cache performance', () => {
      // Arrange
      const operation = 'get';
      const hit = true;
      const cacheType = 'redis';

      // Act
      repositoryMetrics.recordCachePerformance(operation, hit, cacheType);
      repositoryMetrics.recordCachePerformance('get', false, cacheType);
      repositoryMetrics.recordCachePerformance('set', true, cacheType);

      // Assert
      const metrics = repositoryMetrics.getCachePerformanceMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.totalOperations).toBe(3);
      expect(metrics.hits).toBe(2);
      expect(metrics.misses).toBe(1);
      expect(metrics.hitRate).toBe(0.667);
      expect(metrics.byType.redis).toBeDefined();
      expect(metrics.byType.redis.hits).toBe(2);
    });

    it('should track connection pool metrics', () => {
      // Arrange
      const activeConnections = 5;
      const idleConnections = 10;
      const totalConnections = 20;
      const waitingRequests = 2;

      // Act
      repositoryMetrics.recordConnectionPoolMetrics(
        activeConnections,
        idleConnections,
        totalConnections,
        waitingRequests
      );

      // Assert
      const metrics = repositoryMetrics.getConnectionPoolMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.activeConnections).toBe(5);
      expect(metrics.idleConnections).toBe(10);
      expect(metrics.totalConnections).toBe(20);
      expect(metrics.waitingRequests).toBe(2);
      expect(metrics.utilizationRate).toBe(0.25);
      expect(metrics.waitRate).toBe(0.1);
    });

    it('should track memory usage', () => {
      // Arrange
      const heapUsed = 52428800; // 50MB
      const heapTotal = 104857600; // 100MB
      const external = 20971520; // 20MB
      const rss = 67108864; // 64MB

      // Act
      repositoryMetrics.recordMemoryUsage(heapUsed, heapTotal, external, rss);

      // Assert
      const metrics = repositoryMetrics.getMemoryUsageMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.heapUsed).toBe(52428800);
      expect(metrics.heapTotal).toBe(104857600);
      expect(metrics.heapUsageRatio).toBe(0.5);
      expect(metrics.external).toBe(20971520);
      expect(metrics.rss).toBe(67108864);
    });
  });

  describe('Error Metrics', () => {
    it('should track error occurrences', () => {
      // Arrange
      const errorType = 'DatabaseError';
      const operation = 'findById';
      const entityType = 'User';
      const errorMessage = 'Connection timeout';

      // Act
      repositoryMetrics.recordError(errorType, operation, entityType, errorMessage);

      // Assert
      const metrics = repositoryMetrics.getErrorMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.totalErrors).toBe(1);
      expect(metrics.byType.DatabaseError).toBeDefined();
      expect(metrics.byType.DatabaseError.count).toBe(1);
      expect(metrics.byOperation.findById).toBeDefined();
      expect(metrics.byOperation.findById.count).toBe(1);
      expect(metrics.byEntityType.User).toBeDefined();
      expect(metrics.byEntityType.User.count).toBe(1);
    });

    it('should track error trends', () => {
      // Arrange
      const timestamp = new Date('2023-01-15T10:00:00Z');

      // Act
      repositoryMetrics.recordError('ValidationError', 'create', 'User', 'Invalid email', timestamp);
      repositoryMetrics.recordError('DatabaseError', 'create', 'User', 'Constraint violation', timestamp);
      repositoryMetrics.recordError('ValidationError', 'update', 'Product', 'Invalid price', timestamp);

      // Assert
      const trends = repositoryMetrics.getErrorTrends();
      expect(trends).toBeDefined();
      expect(trends.totalErrors).toBe(3);
      expect(trends.byHour).toBeDefined();
      expect(trends.byType.ValidationError).toBeDefined();
      expect(trends.byType.ValidationError.count).toBe(2);
    });

    it('should calculate error rates', () => {
      // Arrange
      repositoryMetrics.recordOperation('create', 'User', 50, true);
      repositoryMetrics.recordOperation('create', 'User', 75, true);
      repositoryMetrics.recordOperation('create', 'User', 25, false);
      repositoryMetrics.recordError('ValidationError', 'create', 'User', 'Invalid data');

      // Act
      const errorRates = repositoryMetrics.getErrorRates();

      // Assert
      expect(errorRates).toBeDefined();
      expect(errorRates.overall).toBe(0.25); // 1 error out of 4 operations
      expect(errorRates.byOperation.create).toBe(0.25);
      expect(errorRates.byEntityType.User).toBe(0.25);
    });
  });

  describe('Business Metrics', () => {
    it('should track entity counts', () => {
      // Arrange
      const entityType = 'User';
      const count = 1000;

      // Act
      repositoryMetrics.recordEntityCount(entityType, count);

      // Assert
      const metrics = repositoryMetrics.getEntityCounts();
      expect(metrics).toBeDefined();
      expect(metrics.User).toBe(1000);
    });

    it('should track data volume', () => {
      // Arrange
      const entityType = 'Order';
      const volume = 1048576; // 1MB
      const recordCount = 500;

      // Act
      repositoryMetrics.recordDataVolume(entityType, volume, recordCount);

      // Assert
      const metrics = repositoryMetrics.getDataVolumeMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.totalVolume).toBe(1048576);
      expect(metrics.byEntityType.Order).toBeDefined();
      expect(metrics.byEntityType.Order.volume).toBe(1048576);
      expect(metrics.byEntityType.Order.recordCount).toBe(500);
      expect(metrics.byEntityType.Order.averageRecordSize).toBe(2097.152);
    });

    it('should track growth metrics', () => {
      // Arrange
      const entityType = 'Product';
      const currentCount = 1500;
      const previousCount = 1000;
      const timePeriod = '7d';

      // Act
      repositoryMetrics.recordGrowthMetrics(entityType, currentCount, previousCount, timePeriod);

      // Assert
      const metrics = repositoryMetrics.getGrowthMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.byEntityType.Product).toBeDefined();
      expect(metrics.byEntityType.Product.currentCount).toBe(1500);
      expect(metrics.byEntityType.Product.previousCount).toBe(1000);
      expect(metrics.byEntityType.Product.growthRate).toBe(0.5);
      expect(metrics.byEntityType.Product.absoluteGrowth).toBe(500);
    });
  });

  describe('Aggregation and Analytics', () => {
    it('should generate summary report', () => {
      // Arrange
      repositoryMetrics.recordOperation('findById', 'User', 45, true);
      repositoryMetrics.recordOperation('create', 'Product', 75, true);
      repositoryMetrics.recordError('ValidationError', 'create', 'User', 'Invalid data');
      repositoryMetrics.recordEntityCount('User', 1000);
      repositoryMetrics.recordEntityCount('Product', 500);

      // Act
      const report = repositoryMetrics.generateSummaryReport();

      // Assert
      expect(report).toBeDefined();
      expect(report.totalOperations).toBe(2);
      expect(report.totalErrors).toBe(1);
      expect(report.overallSuccessRate).toBe(0.5);
      expect(report.averageDuration).toBe(60);
      expect(report.entityCounts).toBeDefined();
      expect(report.entityCounts.User).toBe(1000);
      expect(report.entityCounts.Product).toBe(500);
    });

    it('should generate time-based analytics', () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      // Act
      repositoryMetrics.recordOperation('findById', 'User', 45, true, new Date('2023-01-15'));
      repositoryMetrics.recordOperation('create', 'Product', 75, true, new Date('2023-01-20'));
      repositoryMetrics.recordError('ValidationError', 'create', 'User', 'Invalid data', new Date('2023-01-25'));

      const analytics = repositoryMetrics.generateTimeBasedAnalytics(timeRange);

      // Assert
      expect(analytics).toBeDefined();
      expect(analytics.period).toEqual(timeRange);
      expect(analytics.dailyMetrics).toBeDefined();
      expect(analytics.trends).toBeDefined();
    });

    it('should generate performance benchmarks', () => {
      // Arrange
      repositoryMetrics.recordOperation('findById', 'User', 45, true);
      repositoryMetrics.recordOperation('findById', 'User', 55, true);
      repositoryMetrics.recordOperation('findById', 'User', 65, true);
      repositoryMetrics.recordOperation('create', 'User', 150, true);
      repositoryMetrics.recordOperation('create', 'User', 200, true);

      // Act
      const benchmarks = repositoryMetrics.generatePerformanceBenchmarks();

      // Assert
      expect(benchmarks).toBeDefined();
      expect(benchmarks.operations).toBeDefined();
      expect(benchmarks.operations.findById).toBeDefined();
      expect(benchmarks.operations.findById.average).toBe(55);
      expect(benchmarks.operations.findById.percentile95).toBe(65);
      expect(benchmarks.operations.create).toBeDefined();
      expect(benchmarks.operations.create.average).toBe(175);
    });

    it('should identify performance anomalies', () => {
      // Arrange
      repositoryMetrics.recordOperation('findById', 'User', 45, true);
      repositoryMetrics.recordOperation('findById', 'User', 50, true);
      repositoryMetrics.recordOperation('findById', 'User', 500, true); // Anomaly
      repositoryMetrics.recordOperation('findById', 'User', 55, true);

      // Act
      const anomalies = repositoryMetrics.identifyPerformanceAnomalies();

      // Assert
      expect(anomalies).toBeDefined();
      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies[0].operation).toBe('findById');
      expect(anomalies[0].entityType).toBe('User');
      expect(anomalies[0].duration).toBe(500);
      expect(anomalies[0].severity).toBe('high');
    });
  });

  describe('Metrics Configuration', () => {
    it('should configure retention periods', () => {
      // Arrange
      const config = {
        operationRetention: '7d',
        errorRetention: '30d',
        performanceRetention: '24h',
      };

      // Act
      repositoryMetrics.configureRetention(config);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('metrics_retention_configured', expect.objectContaining({
        config,
      }));
    });

    it('should configure sampling rates', () => {
      // Arrange
      const samplingRates = {
        operations: 0.1, // 10% sampling
        errors: 1.0, // 100% sampling
        performance: 0.5, // 50% sampling
      };

      // Act
      repositoryMetrics.configureSampling(samplingRates);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('metrics_sampling_configured', expect.objectContaining({
        samplingRates,
      }));
    });

    it('should configure aggregation intervals', () => {
      // Arrange
      const intervals = {
        operations: '1m',
        errors: '5m',
        performance: '30s',
      };

      // Act
      repositoryMetrics.configureAggregationIntervals(intervals);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('metrics_aggregation_configured', expect.objectContaining({
        intervals,
      }));
    });
  });

  describe('Metrics Export and Import', () => {
    it('should export metrics data', () => {
      // Arrange
      repositoryMetrics.recordOperation('findById', 'User', 45, true);
      repositoryMetrics.recordError('ValidationError', 'create', 'User', 'Invalid data');

      // Act
      const exportedData = repositoryMetrics.exportMetrics();

      // Assert
      expect(exportedData).toBeDefined();
      expect(exportedData.operations).toBeDefined();
      expect(exportedData.errors).toBeDefined();
      expect(exportedData.performance).toBeDefined();
      expect(exportedData.timestamp).toBeDefined();
      expect(exportedData.version).toBeDefined();
    });

    it('should import metrics data', () => {
      // Arrange
      const importData = {
        operations: {
          'findById|User': {
            count: 10,
            totalDuration: 500,
            successCount: 9,
            failureCount: 1,
          },
        },
        errors: {
          'ValidationError|create|User': {
            count: 2,
            messages: ['Invalid email', 'Invalid name'],
          },
        },
        performance: {
          database: {
            totalQueries: 100,
            totalDuration: 5000,
          },
        },
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      };

      // Act
      repositoryMetrics.importMetrics(importData);

      // Assert
      const operationMetrics = repositoryMetrics.getOperationMetrics('findById', 'User');
      expect(operationMetrics).toBeDefined();
      expect(operationMetrics.count).toBe(10);
      expect(operationMetrics.totalDuration).toBe(500);

      const errorMetrics = repositoryMetrics.getErrorMetrics();
      expect(errorMetrics.totalErrors).toBe(2);
    });

    it('should validate imported data format', () => {
      // Arrange
      const invalidData = {
        operations: 'invalid', // Should be object
        timestamp: 'invalid-date', // Should be valid date
      };

      // Act & Assert
      expect(() => {
        repositoryMetrics.importMetrics(invalidData as any);
      }).toThrow('Invalid metrics data format');
    });
  });

  describe('Real-time Monitoring', () => {
    it('should emit metrics events', () => {
      // Arrange
      const eventListener = jest.fn();
      repositoryMetrics.on('operation:recorded', eventListener);
      repositoryMetrics.on('error:recorded', eventListener);
      repositoryMetrics.on('threshold:exceeded', eventListener);

      // Act
      repositoryMetrics.recordOperation('slowOperation', 'Test', 5000, true); // Slow operation
      repositoryMetrics.recordError('CriticalError', 'testOperation', 'Test', 'Critical failure');

      // Assert
      expect(eventListener).toHaveBeenCalledTimes(2);
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'operation:recorded' }),
        expect.any(Object)
      );
    });

    it('should monitor performance thresholds', () => {
      // Arrange
      const thresholds = {
        operationDuration: 1000, // 1 second
        errorRate: 0.05, // 5%
        memoryUsage: 0.8, // 80%
      };

      repositoryMetrics.configureThresholds(thresholds);

      // Act
      repositoryMetrics.recordOperation('slowOperation', 'Test', 1500, true); // Exceeds threshold
      repositoryMetrics.recordOperation('fastOperation', 'Test', 500, true);
      repositoryMetrics.recordOperation('failedOperation', 'Test', 200, false);

      const alerts = repositoryMetrics.getThresholdAlerts();

      // Assert
      expect(alerts).toBeDefined();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].type).toBe('operation_duration_exceeded');
      expect(alerts[0].threshold).toBe(1000);
      expect(alerts[0].actual).toBe(1500);
    });

    it('should provide live metrics dashboard', () => {
      // Arrange
      repositoryMetrics.recordOperation('findById', 'User', 45, true);
      repositoryMetrics.recordOperation('create', 'Product', 75, true);
      repositoryMetrics.recordError('ValidationError', 'create', 'User', 'Invalid data');

      // Act
      const dashboard = repositoryMetrics.getLiveDashboard();

      // Assert
      expect(dashboard).toBeDefined();
      expect(dashboard.summary).toBeDefined();
      expect(dashboard.performance).toBeDefined();
      expect(dashboard.errors).toBeDefined();
      expect(dashboard.entities).toBeDefined();
      expect(dashboard.lastUpdated).toBeDefined();
    });
  });

  describe('Metrics Cleanup and Maintenance', () => {
    it('should cleanup expired metrics', () => {
      // Arrange
      const oldTimestamp = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 days ago
      repositoryMetrics.recordOperation('oldOperation', 'Test', 100, true, oldTimestamp);
      repositoryMetrics.recordOperation('newOperation', 'Test', 50, true); // Recent

      // Act
      repositoryMetrics.cleanupExpiredMetrics('7d'); // Keep last 7 days

      // Assert
      const oldMetrics = repositoryMetrics.getOperationMetrics('oldOperation', 'Test');
      const newMetrics = repositoryMetrics.getOperationMetrics('newOperation', 'Test');

      expect(oldMetrics).toBeUndefined();
      expect(newMetrics).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('metrics_cleanup_completed', expect.objectContaining({
        cleanedMetrics: expect.any(Number),
      }));
    });

    it('should aggregate historical data', () => {
      // Arrange
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      repositoryMetrics.recordOperation('findById', 'User', 45, true, twoHoursAgo);
      repositoryMetrics.recordOperation('findById', 'User', 55, true, oneHourAgo);
      repositoryMetrics.recordOperation('findById', 'User', 50, true, now);

      // Act
      repositoryMetrics.aggregateHistoricalData('1h'); // Aggregate by hour

      // Assert
      const aggregatedMetrics = repositoryMetrics.getAggregatedMetrics('1h');
      expect(aggregatedMetrics).toBeDefined();
      expect(aggregatedMetrics.length).toBeGreaterThan(0);
      expect(mockLogger.info).toHaveBeenCalledWith('metrics_aggregation_completed', expect.objectContaining({
        interval: '1h',
        aggregatedPoints: expect.any(Number),
      }));
    });

    it('should optimize metrics storage', () => {
      // Arrange
      // Create many metrics to test optimization
      for (let i = 0; i < 10000; i++) {
        repositoryMetrics.recordOperation(`operation-${i}`, 'Test', Math.random() * 100, true);
      }

      // Act
      const optimizationResult = repositoryMetrics.optimizeStorage();

      // Assert
      expect(optimizationResult).toBeDefined();
      expect(optimizationResult.optimized).toBe(true);
      expect(optimizationResult.memoryReduction).toBeGreaterThan(0);
      expect(mockLogger.info).toHaveBeenCalledWith('metrics_optimization_completed', expect.objectContaining({
        memoryReduction: expect.any(Number),
      }));
    });
  });

  describe('Integration with External Systems', () => {
    it('should push metrics to monitoring system', async () => {
      // Arrange
      const monitoringSystem = {
        pushMetrics: jest.fn().mockResolvedValue(true),
      };
      
      repositoryMetrics.addMonitoringSystem(monitoringSystem);
      repositoryMetrics.recordOperation('testOperation', 'Test', 50, true);

      // Act
      const result = await repositoryMetrics.pushToMonitoringSystems();

      // Assert
      expect(result).toBe(true);
      expect(monitoringSystem.pushMetrics).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('metrics_pushed_to_monitoring', expect.objectContaining({
        systemsCount: 1,
      }));
    });

    it('should pull metrics from external sources', async () => {
      // Arrange
      const externalSource = {
        pullMetrics: jest.fn().mockResolvedValue({
          operations: { 'externalOperation|Test': { count: 5 } },
          errors: { 'ExternalError|test|Test': { count: 2 } },
        }),
      };
      
      repositoryMetrics.addExternalSource(externalSource);

      // Act
      const result = await repositoryMetrics.pullFromExternalSources();

      // Assert
      expect(result).toBe(true);
      expect(externalSource.pullMetrics).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('metrics_pulled_from_external', expect.objectContaining({
        sourcesCount: 1,
      }));
    });

    it('should handle integration failures gracefully', async () => {
      // Arrange
      const failingSystem = {
        pushMetrics: jest.fn().mockRejectedValue(new Error('Connection failed')),
      };
      
      repositoryMetrics.addMonitoringSystem(failingSystem);

      // Act
      const result = await repositoryMetrics.pushToMonitoringSystems();

      // Assert
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith('metrics_push_failed', expect.objectContaining({
        error: 'Connection failed',
      }));
    });
  });
});
