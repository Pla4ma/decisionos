/**
 * RepositoryOptimization Tests
 * 
 * Comprehensive test suite for RepositoryOptimization functionality including
 * query optimization, caching strategies, performance tuning, and resource management.
 */

import { RepositoryOptimization } from '../repositories/RepositoryOptimization';
import { DatabaseConnection } from '../database/DatabaseConnection';
import { CacheManager } from '../cache/CacheManager';
import { Logger } from '../logging/Logger';

// Mock dependencies
const mockDbConnection = {
  query: jest.fn(),
  explain: jest.fn(),
  analyze: jest.fn(),
} as unknown as DatabaseConnection;

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  getStats: jest.fn(),
} as unknown as CacheManager;

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

describe('RepositoryOptimization', () => {
  let repositoryOptimization: RepositoryOptimization;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryOptimization = new RepositoryOptimization(mockDbConnection, mockCacheManager, mockLogger);
  });

  describe('Query Optimization', () => {
    it('should analyze query execution plan', async () => {
      // Arrange
      const query = 'SELECT * FROM users WHERE email = $1';
      const mockExplain = {
        plan: 'Index Scan using users_email_idx on users',
        cost: 1.5,
        rows: 1,
        width: 156,
        actualTime: 0.5,
        planningTime: 0.1,
      };

      mockDbConnection.explain = jest.fn().mockResolvedValue(mockExplain);

      // Act
      const analysis = await repositoryOptimization.analyzeQuery(query, ['john@example.com']);

      // Assert
      expect(analysis).toBeDefined();
      expect(analysis.query).toBe(query);
      expect(analysis.plan).toBe('Index Scan using users_email_idx on users');
      expect(analysis.cost).toBe(1.5);
      expect(analysis.estimatedRows).toBe(1);
      expect(analysis.actualTime).toBe(0.5);
      expect(analysis.planningTime).toBe(0.1);
      expect(analysis.optimizationSuggestions).toBeDefined();
      expect(mockLogger.debug).toHaveBeenCalledWith('query_analyzed', expect.objectContaining({
        query,
        cost: 1.5,
        plan: 'Index Scan using users_email_idx on users',
      }));
    });

    it('should identify slow queries', async () => {
      // Arrange
      const slowQueries = [
        { query: 'SELECT * FROM orders', duration: 5000, threshold: 1000 },
        { query: 'SELECT * FROM products WHERE name LIKE "%test%"', duration: 3000, threshold: 1000 },
        { query: 'SELECT * FROM users WHERE id = 1', duration: 50, threshold: 1000 },
      ];

      // Act
      const slowQueriesIdentified = repositoryOptimization.identifySlowQueries(slowQueries);

      // Assert
      expect(slowQueriesIdentified).toHaveLength(2);
      expect(slowQueriesIdentified[0].query).toBe('SELECT * FROM orders');
      expect(slowQueriesIdentified[0].slownessFactor).toBe(5);
      expect(slowQueriesIdentified[1].query).toBe('SELECT * FROM products WHERE name LIKE "%test%"');
      expect(slowQueriesIdentified[1].slownessFactor).toBe(3);
    });

    it('should suggest query optimizations', async () => {
      // Arrange
      const queryAnalysis = {
        query: 'SELECT * FROM users WHERE name LIKE "%john%"',
        plan: 'Seq Scan on users',
        cost: 1000.5,
        rows: 1000,
        width: 256,
        actualTime: 500,
      };

      // Act
      const suggestions = repositoryOptimization.suggestQueryOptimizations(queryAnalysis);

      // Assert
      expect(suggestions).toBeDefined();
      expect(suggestions.suggestions).toContain('Add index on name column for LIKE operations');
      expect(suggestions.suggestions).toContain('Consider using full-text search for name searches');
      expect(suggestions.suggestions).toContain('Replace SELECT * with specific columns');
      expect(suggestions.estimatedImprovement).toBeGreaterThan(0);
      expect(suggestions.priority).toBe('high');
    });

    it('should optimize query parameters', () => {
      // Arrange
      const originalQuery = 'SELECT * FROM users WHERE status = $1 AND created_at > $2';
      const parameters = ['active', '2023-01-01'];

      // Act
      const optimized = repositoryOptimization.optimizeQueryParameters(originalQuery, parameters);

      // Assert
      expect(optimized).toBeDefined();
      expect(optimized.query).toBe(originalQuery);
      expect(optimized.optimizedParameters).toBeDefined();
      expect(optimized.parameterTypes).toEqual(['string', 'date']);
      expect(optimized.parameterIndexes).toEqual([1, 2]);
    });

    it('should generate query index recommendations', async () => {
      // Arrange
      const queryStats = [
        {
          query: 'SELECT * FROM users WHERE email = $1',
          frequency: 1000,
          averageDuration: 150,
          table: 'users',
          columns: ['email'],
        },
        {
          query: 'SELECT * FROM orders WHERE user_id = $1 AND status = $2',
          frequency: 500,
          averageDuration: 200,
          table: 'orders',
          columns: ['user_id', 'status'],
        },
      ];

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const recommendations = await repositoryOptimization.generateIndexRecommendations(queryStats);

      // Assert
      expect(recommendations).toBeDefined();
      expect(recommendations.recommendations).toHaveLength(2);
      expect(recommendations.recommendations[0].table).toBe('users');
      expect(recommendations.recommendations[0].columns).toEqual(['email']);
      expect(recommendations.recommendations[0].type).toBe('btree');
      expect(recommendations.recommendations[0].estimatedImpact).toBe('high');
    });
  });

  describe('Caching Optimization', () => {
    it('should analyze cache performance', async () => {
      // Arrange
      const mockCacheStats = {
        hits: 850,
        misses: 150,
        sets: 500,
        deletes: 50,
        evictions: 20,
        memory: '75MB',
        maxMemory: '100MB',
      };

      mockCacheManager.getStats = jest.fn().mockResolvedValue(mockCacheStats);

      // Act
      const analysis = await repositoryOptimization.analyzeCachePerformance();

      // Assert
      expect(analysis).toBeDefined();
      expect(analysis.hitRate).toBe(0.85);
      expect(analysis.missRate).toBe(0.15);
      expect(analysis.memoryUsage).toBe(0.75);
      expect(analysis.evictionRate).toBe(0.04);
      expect(analysis.performance).toBe('good');
      expect(analysis.recommendations).toBeDefined();
    });

    it('should optimize cache key strategy', () => {
      // Arrange
      const operations = [
        { type: 'findById', entity: 'User', id: 123 },
        { type: 'findByEmail', entity: 'User', email: 'john@example.com' },
        { type: 'findActiveProducts', entity: 'Product', filters: { active: true } },
      ];

      // Act
      const optimization = repositoryOptimization.optimizeCacheKeyStrategy(operations);

      // Assert
      expect(optimization).toBeDefined();
      expect(optimization.keyPatterns).toBeDefined();
      expect(optimization.keyPatterns['User:findById']).toBe('user:id:{id}');
      expect(optimization.keyPatterns['User:findByEmail']).toBe('user:email:{email}');
      expect(optimization.keyPatterns['Product:findActiveProducts']).toBe('product:active:{filters}');
      expect(optimization.keyLength).toBeDefined();
      expect(optimization.collisionRisk).toBe('low');
    });

    it('should suggest cache warming strategies', async () => {
      // Arrange
      const accessPatterns = [
        { key: 'user:123', frequency: 100, lastAccess: new Date() },
        { key: 'product:456', frequency: 80, lastAccess: new Date() },
        { key: 'order:789', frequency: 60, lastAccess: new Date() },
      ];

      mockCacheManager.get = jest.fn().mockResolvedValue(null);

      // Act
      const warmingStrategy = repositoryOptimization.suggestCacheWarming(accessPatterns);

      // Assert
      expect(warmingStrategy).toBeDefined();
      expect(warmingStrategy.priorityKeys).toHaveLength(3);
      expect(warmingStrategy.priorityKeys[0].key).toBe('user:123');
      expect(warmingStrategy.priorityKeys[0].frequency).toBe(100);
      expect(warmingStrategy.estimatedMemoryUsage).toBeGreaterThan(0);
      expect(warmingStrategy.warmingOrder).toBeDefined();
    });

    it('should optimize cache TTL settings', async () => {
      // Arrange
      const entityTypes = {
        User: { readFrequency: 1000, writeFrequency: 100, volatility: 'low' },
        Product: { readFrequency: 500, writeFrequency: 50, volatility: 'medium' },
        Order: { readFrequency: 200, writeFrequency: 200, volatility: 'high' },
      };

      // Act
      const ttlOptimization = repositoryOptimization.optimizeCacheTTL(entityTypes);

      // Assert
      expect(ttlOptimization).toBeDefined();
      expect(ttlOptimization.recommendations.User.ttl).toBeGreaterThan(ttlOptimization.recommendations.Order.ttl);
      expect(ttlOptimization.recommendations.User.strategy).toBe('long_ttl');
      expect(ttlOptimization.recommendations.Order.strategy).toBe('short_ttl');
      expect(ttlOptimization.recommendations.Product.strategy).toBe('medium_ttl');
    });

    it('should implement cache invalidation optimization', async () => {
      // Arrange
      const invalidationRules = [
        { entity: 'User', dependencies: ['Profile', 'Order'] },
        { entity: 'Product', dependencies: ['OrderItem', 'Review'] },
        { entity: 'Order', dependencies: ['OrderItem', 'Payment'] },
      ];

      // Act
      const optimization = repositoryOptimization.optimizeCacheInvalidation(invalidationRules);

      // Assert
      expect(optimization).toBeDefined();
      expect(optimization.invalidationChains).toBeDefined();
      expect(optimization.invalidationChains.User).toEqual(['Profile', 'Order']);
      expect(optimization.batchInvalidation).toBe(true);
      expect(optimization.invalidationDelay).toBeGreaterThan(0);
    });
  });

  describe('Connection Pool Optimization', () => {
    it('should analyze connection pool performance', async () => {
      // Arrange
      const poolMetrics = {
        totalConnections: 20,
        activeConnections: 15,
        idleConnections: 5,
        waitingRequests: 3,
        averageWaitTime: 150,
        maxWaitTime: 1000,
        connectionCreationTime: 50,
        connectionLifetime: 300000, // 5 minutes
      };

      // Act
      const analysis = repositoryOptimization.analyzeConnectionPool(poolMetrics);

      // Assert
      expect(analysis).toBeDefined();
      expect(analysis.utilizationRate).toBe(0.75);
      expect(analysis.waitRate).toBe(0.15);
      expect(analysis.efficiency).toBe('good');
      expect(analysis.bottlenecks).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
    });

    it('should suggest optimal pool size', () => {
      // Arrange
      const workload = {
        concurrentRequests: 25,
        averageQueryTime: 100, // milliseconds
        peakRequests: 50,
        connectionOverhead: 10, // milliseconds
      };

      // Act
      const recommendation = repositoryOptimization.suggestOptimalPoolSize(workload);

      // Assert
      expect(recommendation).toBeDefined();
      expect(recommendation.minSize).toBeGreaterThan(0);
      expect(recommendation.maxSize).toBeGreaterThan(recommendation.minSize);
      expect(recommendation.optimalSize).toBeGreaterThanOrEqual(recommendation.minSize);
      expect(recommendation.optimalSize).toBeLessThanOrEqual(recommendation.maxSize);
      expect(recommendation.reasoning).toBeDefined();
    });

    it('should optimize connection timeout settings', async () => {
      // Arrange
      const queryStats = {
        averageQueryTime: 150,
        p95QueryTime: 500,
        p99QueryTime: 1000,
        slowQueries: 5,
        timeoutErrors: 2,
      };

      // Act
      const optimization = repositoryOptimization.optimizeConnectionTimeouts(queryStats);

      // Assert
      expect(optimization).toBeDefined();
      expect(optimization.queryTimeout).toBeGreaterThan(1000); // Should be higher than p99
      expect(optimization.connectionTimeout).toBeGreaterThan(optimization.queryTimeout);
      expect(optimization.idleTimeout).toBeGreaterThan(0);
      expect(optimization.recommendations).toBeDefined();
    });

    it('should implement connection pooling strategies', () => {
      // Arrange
      const applicationProfile = {
        requestPattern: 'bursty',
        queryComplexity: 'medium',
        concurrency: 'high',
        latency: 'sensitive',
      };

      // Act
      const strategy = repositoryOptimization.designConnectionPoolStrategy(applicationProfile);

      // Assert
      expect(strategy).toBeDefined();
      expect(strategy.poolType).toBe('dynamic');
      expect(strategy.scaling).toBe('auto');
      expect(strategy.preallocation).toBe(true);
      expect(strategy.overflow).toBeDefined();
      expect(strategy.underflow).toBeDefined();
    });
  });

  describe('Memory Optimization', () => {
    it('should analyze memory usage patterns', async () => {
      // Arrange
      const memoryStats = {
        heapUsed: 52428800, // 50MB
        heapTotal: 104857600, // 100MB
        external: 20971520, // 20MB
        rss: 67108864, // 64MB
        gcStats: {
          gcCount: 10,
          gcDuration: 150,
          memoryFreed: 1048576, // 1MB
        },
      };

      // Act
      const analysis = repositoryOptimization.analyzeMemoryUsage(memoryStats);

      // Assert
      expect(analysis).toBeDefined();
      expect(analysis.heapUsageRatio).toBe(0.5);
      expect(analysis.memoryEfficiency).toBe('good');
      expect(analysis.gcEfficiency).toBeDefined();
      expect(analysis.memoryLeaks).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
    });

    it('should optimize object allocation', () => {
      // Arrange
      const allocationPatterns = {
        largeObjects: 100,
        smallObjects: 10000,
        objectPools: 5,
        frequentAllocations: 1000,
        memoryPressure: 0.7,
      };

      // Act
      const optimization = repositoryOptimization.optimizeObjectAllocation(allocationPatterns);

      // Assert
      expect(optimization).toBeDefined();
      expect(optimization.useObjectPooling).toBe(true);
      expect(optimization.poolSizes).toBeDefined();
      expect(optimization.allocationStrategy).toBe('pool_first');
      expect(optimization.estimatedMemorySavings).toBeGreaterThan(0);
    });

    it('should suggest garbage collection optimizations', async () => {
      // Arrange
      const gcMetrics = {
        frequency: 10, // per minute
        averageDuration: 150, // milliseconds
        memoryFreed: 1048576, // 1MB
        pauseTime: 50, // milliseconds
        heapFragmentation: 0.25,
      };

      // Act
      const suggestions = repositoryOptimization.suggestGCOptimizations(gcMetrics);

      // Assert
      expect(suggestions).toBeDefined();
      expect(suggestions.optimizations).toContain('Increase heap size to reduce GC frequency');
      expect(suggestions.optimizations).toContain('Implement object pooling to reduce allocations');
      expect(suggestions.optimizations).toContain('Use generational garbage collection');
      expect(suggestions.estimatedImprovement).toBeGreaterThan(0);
    });

    it('should implement memory leak detection', async () => {
      // Arrange
      const memorySnapshots = [
        { timestamp: new Date('2023-01-15T10:00:00Z'), heapUsed: 50000000 },
        { timestamp: new Date('2023-01-15T10:05:00Z'), heapUsed: 52000000 },
        { timestamp: new Date('2023-01-15T10:10:00Z'), heapUsed: 54000000 },
        { timestamp: new Date('2023-01-15T10:15:00Z'), heapUsed: 56000000 },
        { timestamp: new Date('2023-01-15T10:20:00Z'), heapUsed: 58000000 },
      ]; // Steady increase

      // Act
      const leakDetection = repositoryOptimization.detectMemoryLeaks(memorySnapshots);

      // Assert
      expect(leakDetection).toBeDefined();
      expect(leakDetection.hasLeak).toBe(true);
      expect(leakDetection.leakRate).toBeGreaterThan(0);
      expect(leakDetection.confidence).toBe('medium');
      expect(leakDetection.recommendations).toBeDefined();
    });
  });

  describe('Performance Monitoring', () => {
    it('should monitor repository performance metrics', async () => {
      // Arrange
      const metrics = {
        operations: [
          { type: 'findById', duration: 45, success: true },
          { type: 'create', duration: 120, success: true },
          { type: 'update', duration: 85, success: true },
          { type: 'delete', duration: 35, success: true },
          { type: 'findAll', duration: 250, success: true },
        ],
        timestamp: new Date(),
      };

      // Act
      const monitoring = repositoryOptimization.monitorPerformance(metrics);

      // Assert
      expect(monitoring).toBeDefined();
      expect(monitoring.averageDuration).toBe(107);
      expect(monitoring.p95Duration).toBe(250);
      expect(monitoring.p99Duration).toBe(250);
      expect(monitoring.successRate).toBe(1.0);
      expect(monitoring.throughput).toBeGreaterThan(0);
    });

    it('should detect performance regressions', async () => {
      // Arrange
      const baseline = {
        averageDuration: 100,
        p95Duration: 200,
        successRate: 0.99,
        throughput: 1000,
      };

      const current = {
        averageDuration: 150,
        p95Duration: 350,
        successRate: 0.95,
        throughput: 800,
      };

      // Act
      const regression = repositoryOptimization.detectPerformanceRegression(baseline, current);

      // Assert
      expect(regression).toBeDefined();
      expect(regression.hasRegression).toBe(true);
      expect(regression.severity).toBe('medium');
      expect(regression.regressions).toContain('Average duration increased by 50%');
      expect(regression.regressions).toContain('P95 duration increased by 75%');
      expect(regression.regressions).toContain('Success rate decreased by 4%');
      expect(regression.regressions).toContain('Throughput decreased by 20%');
    });

    it('should generate performance alerts', async () => {
      // Arrange
      const performanceData = {
        averageDuration: 500, // High
        p95Duration: 1000, // Very high
        errorRate: 0.05, // 5% errors
        memoryUsage: 0.85, // 85% memory usage
      };

      // Act
      const alerts = repositoryOptimization.generatePerformanceAlerts(performanceData);

      // Assert
      expect(alerts).toBeDefined();
      expect(alerts.alerts).toHaveLength(4);
      expect(alerts.alerts[0].type).toBe('high_latency');
      expect(alerts.alerts[0].severity).toBe('high');
      expect(alerts.alerts[1].type).toBe('very_high_latency');
      expect(alerts.alerts[1].severity).toBe('critical');
      expect(alerts.alerts[2].type).toBe('high_error_rate');
      expect(alerts.alerts[2].severity).toBe('medium');
      expect(alerts.alerts[3].type).toBe('high_memory_usage');
      expect(alerts.alerts[3].severity).toBe('high');
    });

    it('should create performance dashboard data', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockTimeSeriesData = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(2023, 0, i + 1),
        averageDuration: 100 + Math.random() * 50,
        successRate: 0.95 + Math.random() * 0.04,
        throughput: 800 + Math.random() * 400,
      }));

      // Act
      const dashboard = repositoryOptimization.createPerformanceDashboard(timeRange, mockTimeSeriesData);

      // Assert
      expect(dashboard).toBeDefined();
      expect(dashboard.summary).toBeDefined();
      expect(dashboard.trends).toBeDefined();
      expect(dashboard.alerts).toBeDefined();
      expect(dashboard.recommendations).toBeDefined();
      expect(dashboard.timeSeries).toBeDefined();
    });
  });

  describe('Optimization Strategies', () => {
    it('should implement batch optimization', async () => {
      // Arrange
      const operations = [
        { type: 'findById', entity: 'User', id: 1 },
        { type: 'findById', entity: 'User', id: 2 },
        { type: 'findById', entity: 'User', id: 3 },
        { type: 'findById', entity: 'User', id: 4 },
        { type: 'findById', entity: 'User', id: 5 },
      ];

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const optimization = await repositoryOptimization.optimizeBatchOperations(operations);

      // Assert
      expect(optimization).toBeDefined();
      expect(optimization.batched).toBe(true);
      expect(optimization.batchSize).toBe(5);
      expect(optimization.optimizedQuery).toContain('IN');
      expect(optimization.estimatedTimeSavings).toBeGreaterThan(0);
    });

    it('should implement read-write splitting optimization', async () => {
      // Arrange
      const readWriteRatio = {
        reads: 800,
        writes: 200,
        total: 1000,
      };

      const connectionConfig = {
        master: { host: 'master-db', maxConnections: 10 },
        slaves: [
          { host: 'slave-1', maxConnections: 5 },
          { host: 'slave-2', maxConnections: 5 },
        ],
      };

      // Act
      const optimization = repositoryOptimization.optimizeReadWriteSplitting(readWriteRatio, connectionConfig);

      // Assert
      expect(optimization).toBeDefined();
      expect(optimization.splitReads).toBe(true);
      expect(optimization.readDistribution).toBeDefined();
      expect(optimization.loadBalancing).toBe('round_robin');
      expect(optimization.fallbackStrategy).toBeDefined();
    });

    it('should implement sharding optimization', async () => {
      // Arrange
      const shardingConfig = {
        strategy: 'hash',
        shardKey: 'user_id',
        shardCount: 4,
        shards: [
          { id: 0, host: 'shard-0', load: 0.8 },
          { id: 1, host: 'shard-1', load: 0.6 },
          { id: 2, host: 'shard-2', load: 0.4 },
          { id: 3, host: 'shard-3', load: 0.2 },
        ],
      };

      // Act
      const optimization = repositoryOptimization.optimizeSharding(shardingConfig);

      // Assert
      expect(optimization).toBeDefined();
      expect(optimization.rebalanceNeeded).toBe(true);
      expect(optimization.optimalDistribution).toBeDefined();
      expect(optimization.migrationPlan).toBeDefined();
      expect(optimization.estimatedPerformanceGain).toBeGreaterThan(0);
    });

    it('should implement query result streaming optimization', async () => {
      // Arrange
      const queryConfig = {
        query: 'SELECT * FROM large_table',
        estimatedRows: 100000,
        memoryLimit: 100 * 1024 * 1024, // 100MB
        rowSize: 1024, // 1KB per row
      };

      // Act
      const optimization = repositoryOptimization.optimizeResultStreaming(queryConfig);

      // Assert
      expect(optimization).toBeDefined();
      expect(optimization.useStreaming).toBe(true);
      expect(optimization.batchSize).toBeGreaterThan(0);
      expect(optimization.memoryEfficient).toBe(true);
      expect(optimization.estimatedMemoryUsage).toBeLessThan(queryConfig.memoryLimit);
    });
  });

  describe('Optimization Automation', () => {
    it('should implement auto-optimization', async () => {
      // Arrange
      const autoOptimizationConfig = {
        enabled: true,
        interval: 3600000, // 1 hour
        thresholds: {
          slowQueryThreshold: 1000,
          lowCacheHitRate: 0.7,
          highMemoryUsage: 0.8,
          highConnectionWait: 100,
        },
        actions: ['query_optimization', 'cache_tuning', 'pool_adjustment'],
      };

      const performanceMetrics = {
        averageQueryTime: 1200,
        cacheHitRate: 0.65,
        memoryUsage: 0.85,
        connectionWaitTime: 150,
      };

      // Act
      const optimizations = await repositoryOptimization.runAutoOptimization(autoOptimizationConfig, performanceMetrics);

      // Assert
      expect(optimizations).toBeDefined();
      expect(optimizations.applied).toHaveLength(3);
      expect(optimizations.applied[0].type).toBe('query_optimization');
      expect(optimizations.applied[1].type).toBe('cache_tuning');
      expect(optimizations.applied[2].type).toBe('pool_adjustment');
      expect(optimizations.estimatedImprovement).toBeGreaterThan(0);
    });

    it('should schedule optimization tasks', () => {
      // Arrange
      const optimizationTasks = [
        {
          name: 'query_analysis',
          frequency: 'daily',
          time: '02:00',
          enabled: true,
        },
        {
          name: 'cache_cleanup',
          frequency: 'weekly',
          time: '03:00',
          enabled: true,
        },
        {
          name: 'index_rebuild',
          frequency: 'monthly',
          time: '04:00',
          enabled: false,
        },
      ];

      // Act
      const schedule = repositoryOptimization.createOptimizationSchedule(optimizationTasks);

      // Assert
      expect(schedule).toBeDefined();
      expect(schedule.tasks).toHaveLength(3);
      expect(schedule.tasks[0].nextRun).toBeDefined();
      expect(schedule.tasks[1].nextRun).toBeDefined();
      expect(schedule.tasks[2].enabled).toBe(false);
    });

    it('should implement optimization feedback loop', async () => {
      // Arrange
      const optimizationHistory = [
        { timestamp: new Date('2023-01-15'), type: 'query_optimization', improvement: 0.15 },
        { timestamp: new Date('2023-01-16'), type: 'cache_tuning', improvement: 0.25 },
        { timestamp: new Date('2023-01-17'), type: 'pool_adjustment', improvement: 0.10 },
      ];

      // Act
      const feedback = repositoryOptimization.analyzeOptimizationFeedback(optimizationHistory);

      // Assert
      expect(feedback).toBeDefined();
      expect(feedback.overallImprovement).toBe(0.167);
      expect(feedback.mostEffective).toBe('cache_tuning');
      expect(feedback.leastEffective).toBe('pool_adjustment');
      expect(feedback.recommendations).toBeDefined();
    });
  });

  describe('Optimization Reporting', () => {
    it('should generate comprehensive optimization report', async () => {
      // Arrange
      const reportConfig = {
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
        includeSections: ['queries', 'cache', 'connections', 'memory'],
        format: 'detailed',
      };

      const mockReportData = {
        queries: {
          totalQueries: 10000,
          averageDuration: 120,
          slowQueries: 150,
          optimizations: 25,
        },
        cache: {
          hitRate: 0.85,
          memoryUsage: 0.75,
          optimizations: 10,
        },
        connections: {
          utilization: 0.7,
          waitTime: 50,
          optimizations: 5,
        },
        memory: {
          heapUsage: 0.6,
          gcEfficiency: 0.9,
          optimizations: 8,
        },
      };

      // Act
      const report = await repositoryOptimization.generateOptimizationReport(reportConfig, mockReportData);

      // Assert
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.sections).toBeDefined();
      expect(report.sections.queries).toBeDefined();
      expect(report.sections.cache).toBeDefined();
      expect(report.sections.connections).toBeDefined();
      expect(report.sections.memory).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(report.actionItems).toBeDefined();
    });

    it('should track optimization ROI', async () => {
      // Arrange
      const optimizationInvestments = [
        { type: 'query_optimization', cost: 1000, benefit: 2500 },
        { type: 'cache_implementation', cost: 2000, benefit: 5000 },
        { type: 'connection_pool_tuning', cost: 500, benefit: 1200 },
      ];

      // Act
      const roi = repositoryOptimization.calculateOptimizationROI(optimizationInvestments);

      // Assert
      expect(roi).toBeDefined();
      expect(roi.totalInvestment).toBe(3500);
      expect(roi.totalBenefit).toBe(8700);
      expect(roi.overallROI).toBe(1.49);
      expect(roi.bestROI).toBe('cache_implementation');
      expect(roi.worstROI).toBe('connection_pool_tuning');
    });

    it('should create optimization roadmap', async () => {
      // Arrange
      const currentPerformance = {
        averageQueryTime: 200,
        cacheHitRate: 0.7,
        connectionUtilization: 0.8,
        memoryUsage: 0.75,
      };

      const targetPerformance = {
        averageQueryTime: 100,
        cacheHitRate: 0.9,
        connectionUtilization: 0.6,
        memoryUsage: 0.6,
      };

      // Act
      const roadmap = repositoryOptimization.createOptimizationRoadmap(currentPerformance, targetPerformance);

      // Assert
      expect(roadmap).toBeDefined();
      expect(roadmap.phases).toBeDefined();
      expect(roadmap.phases).toHaveLength(3);
      expect(roadmap.phases[0].optimizations).toBeDefined();
      expect(roadmap.phases[0].estimatedDuration).toBeGreaterThan(0);
      expect(roadmap.phases[0].expectedImprovement).toBeGreaterThan(0);
      expect(roadmap.totalDuration).toBeGreaterThan(0);
      expect(roadmap.totalCost).toBeGreaterThan(0);
    });
  });
});
