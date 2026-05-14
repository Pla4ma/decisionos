/**
 * RepositoryPerformance Tests
 * 
 * Comprehensive test suite for RepositoryPerformance functionality including
 * performance monitoring, optimization, profiling, and performance analytics.
 */

import { RepositoryPerformance } from '../repositories/RepositoryPerformance';
import { Logger } from '../logging/Logger';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

describe('RepositoryPerformance', () => {
  let repositoryPerformance: RepositoryPerformance;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryPerformance = new RepositoryPerformance(mockLogger);
  });

  describe('Performance Monitoring', () => {
    it('should start and stop performance monitoring', () => {
      // Arrange
      const operationId = 'test-operation-123';

      // Act
      repositoryPerformance.startMonitoring(operationId);
      // Simulate some work
      const result = repositoryPerformance.stopMonitoring(operationId);

      // Assert
      expect(result).toBeDefined();
      expect(result.operationId).toBe(operationId);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.startTime).toBeDefined();
      expect(result.endTime).toBeDefined();
      expect(mockLogger.debug).toHaveBeenCalledWith('performance_monitoring_started', expect.objectContaining({
        operationId,
      }));
      expect(mockLogger.debug).toHaveBeenCalledWith('performance_monitoring_stopped', expect.objectContaining({
        operationId,
        duration: result.duration,
      }));
    });

    it('should handle multiple concurrent operations', () => {
      // Arrange
      const operationIds = ['op-1', 'op-2', 'op-3'];

      // Act
      operationIds.forEach(id => repositoryPerformance.startMonitoring(id));
      
      // Simulate different durations
      setTimeout(() => repositoryPerformance.stopMonitoring('op-1'), 10);
      setTimeout(() => repositoryPerformance.stopMonitoring('op-2'), 20);
      setTimeout(() => repositoryPerformance.stopMonitoring('op-3'), 30);

      // Assert
      const results = repositoryPerformance.getOperationResults(operationIds);
      expect(results).toHaveLength(3);
      expect(results[0].duration).toBeLessThan(results[1].duration);
      expect(results[1].duration).toBeLessThan(results[2].duration);
    });

    it('should track operation metrics', () => {
      // Arrange
      const operationType = 'database_query';
      const operationId = 'query-123';

      // Act
      repositoryPerformance.startMonitoring(operationId, { type: operationType });
      repositoryPerformance.addMetric(operationId, 'rows_affected', 150);
      repositoryPerformance.addMetric(operationId, 'index_used', 'users_email_idx');
      repositoryPerformance.addMetric(operationId, 'cache_hit', true);
      const result = repositoryPerformance.stopMonitoring(operationId);

      // Assert
      expect(result).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.metrics.rows_affected).toBe(150);
      expect(result.metrics.index_used).toBe('users_email_idx');
      expect(result.metrics.cache_hit).toBe(true);
      expect(result.type).toBe(operationType);
    });

    it('should handle monitoring errors gracefully', () => {
      // Arrange
      const operationId = 'non-existent-operation';

      // Act & Assert
      expect(() => {
        repositoryPerformance.stopMonitoring(operationId);
      }).not.toThrow();
      expect(mockLogger.warn).toHaveBeenCalledWith('performance_monitoring_error', expect.objectContaining({
        operationId,
        error: expect.stringContaining('Operation not found'),
      }));
    });
  });

  describe('Performance Profiling', () => {
    it('should profile repository operations', async () => {
      // Arrange
      const mockOperation = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms operation
        return { id: 'test-result' };
      });

      // Act
      const profile = await repositoryPerformance.profileOperation('test-operation', mockOperation);

      // Assert
      expect(profile).toBeDefined();
      expect(profile.operationName).toBe('test-operation');
      expect(profile.duration).toBeGreaterThan(40); // At least 40ms
      expect(profile.memoryUsage).toBeDefined();
      expect(profile.success).toBe(true);
      expect(profile.result).toEqual({ id: 'test-result' });
    });

    it('should profile failed operations', async () => {
      // Arrange
      const mockOperation = jest.fn().mockRejectedValue(new Error('Operation failed'));

      // Act
      const profile = await repositoryPerformance.profileOperation('failing-operation', mockOperation);

      // Assert
      expect(profile).toBeDefined();
      expect(profile.success).toBe(false);
      expect(profile.error).toBeDefined();
      expect(profile.error.message).toBe('Operation failed');
      expect(profile.duration).toBeGreaterThan(0);
    });

    it('should profile database queries', async () => {
      // Arrange
      const mockQuery = jest.fn().mockResolvedValue({
        rows: Array.from({ length: 100 }, (_, i) => ({ id: i, name: `item-${i}` })),
        rowCount: 100,
      });

      // Act
      const profile = await repositoryPerformance.profileDatabaseQuery('SELECT * FROM products', mockQuery);

      // Assert
      expect(profile).toBeDefined();
      expect(profile.query).toBe('SELECT * FROM products');
      expect(profile.rowsReturned).toBe(100);
      expect(profile.duration).toBeGreaterThan(0);
      expect(profile.memoryUsage).toBeDefined();
    });

    it('should profile batch operations', async () => {
      // Arrange
      const operations = [
        () => repositoryPerformance.profileOperation('op-1', async () => 'result-1'),
        () => repositoryPerformance.profileOperation('op-2', async () => 'result-2'),
        () => repositoryPerformance.profileOperation('op-3', async () => 'result-3'),
      ];

      // Act
      const batchProfile = await repositoryPerformance.profileBatch('batch-test', operations);

      // Assert
      expect(batchProfile).toBeDefined();
      expect(batchProfile.batchName).toBe('batch-test');
      expect(batchProfile.operationCount).toBe(3);
      expect(batchProfile.totalDuration).toBeGreaterThan(0);
      expect(batchProfile.averageDuration).toBeGreaterThan(0);
      expect(batchProfile.successCount).toBe(3);
      expect(batchProfile.failureCount).toBe(0);
    });
  });

  describe('Performance Analytics', () => {
    it('should calculate performance statistics', () => {
      // Arrange
      const durations = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105];

      // Act
      const stats = repositoryPerformance.calculateStatistics(durations);

      // Assert
      expect(stats).toBeDefined();
      expect(stats.count).toBe(20);
      expect(stats.min).toBe(10);
      expect(stats.max).toBe(105);
      expect(stats.mean).toBe(57.5);
      expect(stats.median).toBe(57.5);
      expect(stats.standardDeviation).toBeGreaterThan(0);
      expect(stats.percentiles).toBeDefined();
      expect(stats.percentiles.p50).toBe(57.5);
      expect(stats.percentiles.p95).toBe(100);
      expect(stats.percentiles.p99).toBe(105);
    });

    it('should identify performance outliers', () => {
      // Arrange
      const durations = [10, 12, 15, 18, 20, 22, 25, 28, 30, 500, 600]; // 500 and 600 are outliers

      // Act
      const outliers = repositoryPerformance.identifyOutliers(durations);

      // Assert
      expect(outliers).toBeDefined();
      expect(outliers.outliers).toHaveLength(2);
      expect(outliers.outliers).toContain(500);
      expect(outliers.outliers).toContain(600);
      expect(outliers.outlierMethod).toBe('iqr');
      expect(outliers.threshold).toBeDefined();
    });

    it('should analyze performance trends', () => {
      // Arrange
      const timeSeriesData = [
        { timestamp: new Date('2023-01-01T00:00:00Z'), duration: 50 },
        { timestamp: new Date('2023-01-01T01:00:00Z'), duration: 55 },
        { timestamp: new Date('2023-01-01T02:00:00Z'), duration: 60 },
        { timestamp: new Date('2023-01-01T03:00:00Z'), duration: 65 },
        { timestamp: new Date('2023-01-01T04:00:00Z'), duration: 70 },
      ];

      // Act
      const trend = repositoryPerformance.analyzeTrend(timeSeriesData);

      // Assert
      expect(trend).toBeDefined();
      expect(trend.direction).toBe('increasing');
      expect(trend.slope).toBeGreaterThan(0);
      expect(trend.correlation).toBeGreaterThan(0.9);
      expect(trend.significance).toBe('high');
    });

    it('should generate performance report', () => {
      // Arrange
      const operationData = {
        'user_findById': [10, 15, 20, 25, 30],
        'product_create': [50, 55, 60, 65, 70],
        'order_update': [100, 105, 110, 115, 120],
      };

      // Act
      const report = repositoryPerformance.generatePerformanceReport(operationData);

      // Assert
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.summary.totalOperations).toBe(15);
      expect(report.summary.averageDuration).toBeGreaterThan(0);
      expect(report.operations).toBeDefined();
      expect(report.operations.user_findById).toBeDefined();
      expect(report.operations.user_findById.count).toBe(5);
      expect(report.operations.user_findById.averageDuration).toBe(20);
      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
    });
  });

  describe('Performance Optimization', () => {
    it('should suggest query optimizations', () => {
      // Arrange
      const queryProfile = {
        query: 'SELECT * FROM users WHERE email = $1',
        duration: 150, // Slow query
        rowsReturned: 1,
        indexUsed: null, // No index used
        tableSize: 1000000,
      };

      // Act
      const optimizations = repositoryPerformance.suggestQueryOptimizations(queryProfile);

      // Assert
      expect(optimizations).toBeDefined();
      expect(optimizations.suggestions).toContain('Add index on email column');
      expect(optimizations.suggestions).toContain('Consider using LIMIT clause');
      expect(optimizations.estimatedImprovement).toBeGreaterThan(0);
    });

    it('should suggest caching strategies', () => {
      // Arrange
      const operationProfile = {
        operationName: 'user_findById',
        averageDuration: 25,
        frequency: 1000, // High frequency
        cacheHitRate: 0.1, // Low cache hit rate
        dataVolatility: 'low', // Data doesn't change often
      };

      // Act
      const cachingSuggestions = repositoryPerformance.suggestCachingStrategies(operationProfile);

      // Assert
      expect(cachingSuggestions).toBeDefined();
      expect(cachingSuggestions.recommended).toBe(true);
      expect(cachingSuggestions.cacheType).toBe('redis');
      expect(cachingSuggestions.ttl).toBeGreaterThan(0);
      expect(cachingSuggestions.expectedImprovement).toBeGreaterThan(0);
    });

    it('should suggest connection pool optimizations', () => {
      // Arrange
      const poolMetrics = {
        totalConnections: 20,
        activeConnections: 18,
        idleConnections: 2,
        waitingRequests: 5,
        averageWaitTime: 150,
      };

      // Act
      const poolOptimizations = repositoryPerformance.suggestConnectionPoolOptimizations(poolMetrics);

      // Assert
      expect(poolOptimizations).toBeDefined();
      expect(poolOptimizations.utilizationRate).toBe(0.9);
      expect(poolOptimizations.suggestions).toContain('Increase pool size');
      expect(poolOptimizations.suggestions).toContain('Optimize query performance');
      expect(poolOptimizations.recommendedPoolSize).toBeGreaterThan(20);
    });

    it('should suggest database schema optimizations', () => {
      // Arrange
      const schemaMetrics = {
        tableSize: '2GB',
        indexSize: '500MB',
        fragmentation: 0.25, // 25% fragmentation
        unusedIndexes: ['old_index_1', 'old_index_2'],
        missingIndexes: ['email_idx', 'created_at_idx'],
      };

      // Act
      const schemaOptimizations = repositoryPerformance.suggestSchemaOptimizations(schemaMetrics);

      // Assert
      expect(schemaOptimizations).toBeDefined();
      expect(schemaOptimizations.suggestions).toContain('Remove unused indexes');
      expect(schemaOptimizations.suggestions).toContain('Add missing indexes');
      expect(schemaOptimizations.suggestions).toContain('Defragment table');
      expect(schemaOptimizations.estimatedSpaceSavings).toBeGreaterThan(0);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should run performance benchmarks', async () => {
      // Arrange
      const benchmarks = [
        {
          name: 'user_findById',
          operation: async () => ({ id: 'user-123', name: 'John Doe' }),
          expectedDuration: 50, // 50ms expected
        },
        {
          name: 'product_search',
          operation: async () => Array.from({ length: 10 }, (_, i) => ({ id: i })),
          expectedDuration: 100, // 100ms expected
        },
      ];

      // Act
      const results = await repositoryPerformance.runBenchmarks(benchmarks);

      // Assert
      expect(results).toBeDefined();
      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('user_findById');
      expect(results[0].duration).toBeGreaterThan(0);
      expect(results[0].passed).toBeDefined();
      expect(results[0].performanceRatio).toBeDefined();
    });

    it('should compare performance over time', () => {
      // Arrange
      const baselineData = {
        'user_findById': { averageDuration: 45, p95Duration: 80 },
        'product_create': { averageDuration: 120, p95Duration: 200 },
      };

      const currentData = {
        'user_findById': { averageDuration: 55, p95Duration: 90 },
        'product_create': { averageDuration: 100, p95Duration: 180 },
      };

      // Act
      const comparison = repositoryPerformance.comparePerformance(baselineData, currentData);

      // Assert
      expect(comparison).toBeDefined();
      expect(comparison.user_findById).toBeDefined();
      expect(comparison.user_findById.durationChange).toBe(10); // 55 - 45
      expect(comparison.user_findById.percentChange).toBe(22.22); // (10/45) * 100
      expect(comparison.user_findById.trend).toBe('degraded');
      expect(comparison.product_create.trend).toBe('improved');
    });

    it('should generate performance score', () => {
      // Arrange
      const performanceMetrics = {
        averageResponseTime: 150, // ms
        p95ResponseTime: 300, // ms
        throughput: 1000, // operations per second
        errorRate: 0.01, // 1%
        resourceUtilization: 0.7, // 70%
      };

      // Act
      const score = repositoryPerformance.calculatePerformanceScore(performanceMetrics);

      // Assert
      expect(score).toBeDefined();
      expect(score.overall).toBeGreaterThanOrEqual(0);
      expect(score.overall).toBeLessThanOrEqual(100);
      expect(score.breakdown).toBeDefined();
      expect(score.breakdown.responseTime).toBeDefined();
      expect(score.breakdown.throughput).toBeDefined();
      expect(score.breakdown.errorRate).toBeDefined();
      expect(score.breakdown.resourceUtilization).toBeDefined();
      expect(score.grade).toMatch(/^[A-F]$/);
    });
  });

  describe('Performance Alerts', () => {
    it('should trigger performance alerts', () => {
      // Arrange
      const performanceData = {
        operation: 'user_findById',
        duration: 500, // 500ms - very slow
        threshold: 100, // 100ms threshold
      };

      // Act
      const alert = repositoryPerformance.checkPerformanceThreshold(performanceData);

      // Assert
      expect(alert).toBeDefined();
      expect(alert.triggered).toBe(true);
      expect(alert.severity).toBe('high');
      expect(alert.message).toContain('Performance threshold exceeded');
      expect(alert.actualDuration).toBe(500);
      expect(alert.threshold).toBe(100);
      expect(alert.exceedanceFactor).toBe(5);
    });

    it('should detect performance degradation', () => {
      // Arrange
      const currentMetrics = { averageDuration: 150, p95Duration: 300 };
      const baselineMetrics = { averageDuration: 50, p95Duration: 100 };
      const degradationThreshold = 2.0; // 2x slower

      // Act
      const degradation = repositoryPerformance.detectPerformanceDegradation(
        currentMetrics,
        baselineMetrics,
        degradationThreshold
      );

      // Assert
      expect(degradation).toBeDefined();
      expect(degradation.detected).toBe(true);
      expect(degradation.severity).toBe('high');
      expect(degradation.factor).toBe(3); // 150/50 = 3x slower
      expect(degradation.recommendations).toBeDefined();
    });

    it('should generate performance alerts report', () => {
      // Arrange
      const alerts = [
        { type: 'slow_query', severity: 'medium', operation: 'user_search', duration: 200 },
        { type: 'high_memory', severity: 'high', operation: 'report_generate', memoryUsage: '500MB' },
        { type: 'connection_exhaustion', severity: 'critical', operation: 'batch_import', waitingConnections: 10 },
      ];

      // Act
      const report = repositoryPerformance.generateAlertsReport(alerts);

      // Assert
      expect(report).toBeDefined();
      expect(report.totalAlerts).toBe(3);
      expect(report.criticalAlerts).toBe(1);
      expect(report.highAlerts).toBe(1);
      expect(report.mediumAlerts).toBe(1);
      expect(report.affectedOperations).toHaveLength(3);
      expect(report.recommendations).toBeDefined();
    });
  });

  describe('Performance Configuration', () => {
    it('should configure performance thresholds', () => {
      // Arrange
      const thresholds = {
        responseTime: 200, // 200ms
        p95ResponseTime: 500, // 500ms
        errorRate: 0.05, // 5%
        memoryUsage: 0.8, // 80%
        cpuUsage: 0.7, // 70%
      };

      // Act
      repositoryPerformance.configureThresholds(thresholds);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('performance_thresholds_configured', expect.objectContaining({
        thresholds,
      }));
    });

    it('should configure monitoring intervals', () => {
      // Arrange
      const intervals = {
        realTime: 5000, // 5 seconds
        detailed: 60000, // 1 minute
        summary: 300000, // 5 minutes
      };

      // Act
      repositoryPerformance.configureMonitoringIntervals(intervals);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('monitoring_intervals_configured', expect.objectContaining({
        intervals,
      }));
    });

    it('should configure alert rules', () => {
      // Arrange
      const alertRules = [
        {
          name: 'slow_query_alert',
          condition: 'duration > 1000',
          severity: 'high',
          cooldown: 300000, // 5 minutes
        },
        {
          name: 'memory_usage_alert',
          condition: 'memoryUsage > 0.9',
          severity: 'critical',
          cooldown: 60000, // 1 minute
        },
      ];

      // Act
      repositoryPerformance.configureAlertRules(alertRules);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('alert_rules_configured', expect.objectContaining({
        rulesCount: 2,
      }));
    });
  });

  describe('Performance Data Management', () => {
    it('should export performance data', () => {
      // Arrange
      repositoryPerformance.startMonitoring('test-1');
      repositoryPerformance.addMetric('test-1', 'rows', 100);
      repositoryPerformance.stopMonitoring('test-1');

      repositoryPerformance.startMonitoring('test-2');
      repositoryPerformance.addMetric('test-2', 'rows', 200);
      repositoryPerformance.stopMonitoring('test-2');

      // Act
      const exportedData = repositoryPerformance.exportPerformanceData();

      // Assert
      expect(exportedData).toBeDefined();
      expect(exportedData.operations).toBeDefined();
      expect(exportedData.operations).toHaveLength(2);
      expect(exportedData.metadata).toBeDefined();
      expect(exportedData.metadata.exportTimestamp).toBeDefined();
      expect(exportedData.metadata.version).toBeDefined();
    });

    it('should import performance data', () => {
      // Arrange
      const importData = {
        operations: [
          {
            operationId: 'imported-1',
            duration: 75,
            metrics: { rows: 150 },
            timestamp: new Date().toISOString(),
          },
          {
            operationId: 'imported-2',
            duration: 125,
            metrics: { rows: 250 },
            timestamp: new Date().toISOString(),
          },
        ],
        metadata: {
          importTimestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      };

      // Act
      repositoryPerformance.importPerformanceData(importData);

      // Assert
      const operations = repositoryPerformance.getAllOperations();
      expect(operations).toHaveLength(2);
      expect(operations[0].operationId).toBe('imported-1');
      expect(operations[1].operationId).toBe('imported-2');
    });

    it('should cleanup old performance data', () => {
      // Arrange
      const oldTimestamp = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 days ago
      const recentTimestamp = new Date();

      repositoryPerformance.recordOperation('old-operation', 100, {}, oldTimestamp);
      repositoryPerformance.recordOperation('recent-operation', 100, {}, recentTimestamp);

      // Act
      const cleanedCount = repositoryPerformance.cleanupOldData('7d'); // Keep last 7 days

      // Assert
      expect(cleanedCount).toBe(1);
      const remainingOperations = repositoryPerformance.getAllOperations();
      expect(remainingOperations).toHaveLength(1);
      expect(remainingOperations[0].operationId).toBe('recent-operation');
    });
  });

  describe('Performance Integration', () => {
    it('should integrate with monitoring systems', async () => {
      // Arrange
      const monitoringSystem = {
        pushMetrics: jest.fn().mockResolvedValue(true),
        getAlerts: jest.fn().mockResolvedValue([]),
      };

      repositoryPerformance.addMonitoringSystem(monitoringSystem);

      // Act
      const pushResult = await repositoryPerformance.pushMetricsToMonitoring();
      const alerts = await repositoryPerformance.getAlertsFromMonitoring();

      // Assert
      expect(pushResult).toBe(true);
      expect(alerts).toBeDefined();
      expect(monitoringSystem.pushMetrics).toHaveBeenCalled();
      expect(monitoringSystem.getAlerts).toHaveBeenCalled();
    });

    it('should integrate with APM systems', async () => {
      // Arrange
      const apmSystem = {
        createTransaction: jest.fn().mockResolvedValue('txn-123'),
        endTransaction: jest.fn().mockResolvedValue(true),
        createSpan: jest.fn().mockResolvedValue('span-456'),
        endSpan: jest.fn().mockResolvedValue(true),
      };

      repositoryPerformance.addAPMSystem(apmSystem);

      // Act
      const txnId = await repositoryPerformance.startAPMTransaction('test-operation');
      await repositoryPerformance.endAPMTransaction(txnId);

      // Assert
      expect(txnId).toBe('txn-123');
      expect(apmSystem.createTransaction).toHaveBeenCalledWith('test-operation');
      expect(apmSystem.endTransaction).toHaveBeenCalledWith('txn-123');
    });
  });

  describe('Performance Testing', () => {
    it('should run load tests', async () => {
      // Arrange
      const loadTestConfig = {
        operation: async () => ({ success: true }),
        concurrency: 10,
        duration: 5000, // 5 seconds
        rampUp: 1000, // 1 second ramp up
      };

      // Act
      const loadTestResults = await repositoryPerformance.runLoadTest(loadTestConfig);

      // Assert
      expect(loadTestResults).toBeDefined();
      expect(loadTestResults.totalOperations).toBeGreaterThan(0);
      expect(loadTestResults.averageDuration).toBeGreaterThan(0);
      expect(loadTestResults.throughput).toBeGreaterThan(0);
      expect(loadTestResults.errors).toBeDefined();
      expect(loadTestResults.percentiles).toBeDefined();
    });

    it('should run stress tests', async () => {
      // Arrange
      const stressTestConfig = {
        operation: async () => ({ success: true }),
        maxConcurrency: 50,
        stepDuration: 1000, // 1 second per step
        maxDuration: 10000, // 10 seconds total
      };

      // Act
      const stressTestResults = await repositoryPerformance.runStressTest(stressTestConfig);

      // Assert
      expect(stressTestResults).toBeDefined();
      expect(stressTestResults.maxConcurrencyReached).toBeGreaterThan(0);
      expect(stressTestResults.breakingPoint).toBeDefined();
      expect(stressTestResults.performance).toBeDefined();
      expect(stressTestResults.recommendations).toBeDefined();
    });
  });
});
