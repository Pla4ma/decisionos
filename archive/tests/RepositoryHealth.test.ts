/**
 * RepositoryHealth Tests
 * 
 * Comprehensive test suite for RepositoryHealth functionality including
 * health checks, monitoring, diagnostics, and recovery mechanisms.
 */

import { RepositoryHealth } from '../repositories/RepositoryHealth';
import { DatabaseConnection } from '../database/DatabaseConnection';
import { CacheManager } from '../cache/CacheManager';
import { Logger } from '../logging/Logger';

// Mock dependencies
const mockDbConnection = {
  query: jest.fn(),
  ping: jest.fn(),
  getConnectionInfo: jest.fn(),
} as unknown as DatabaseConnection;

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  ping: jest.fn(),
  getStats: jest.fn(),
} as unknown as CacheManager;

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

describe('RepositoryHealth', () => {
  let repositoryHealth: RepositoryHealth;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryHealth = new RepositoryHealth(mockDbConnection, mockCacheManager, mockLogger);
  });

  describe('Basic Health Checks', () => {
    it('should perform basic health check', async () => {
      // Arrange
      mockDbConnection.ping = jest.fn().mockResolvedValue(true);
      mockCacheManager.ping = jest.fn().mockResolvedValue(true);

      // Act
      const health = await repositoryHealth.checkHealth();

      // Assert
      expect(health).toBeDefined();
      expect(health.status).toBe('healthy');
      expect(health.database).toBe('connected');
      expect(health.cache).toBe('connected');
      expect(health.timestamp).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('health_check_completed', expect.objectContaining({
        status: 'healthy',
      }));
    });

    it('should detect database connection issues', async () => {
      // Arrange
      mockDbConnection.ping = jest.fn().mockRejectedValue(new Error('Connection timeout'));
      mockCacheManager.ping = jest.fn().mockResolvedValue(true);

      // Act
      const health = await repositoryHealth.checkHealth();

      // Assert
      expect(health).toBeDefined();
      expect(health.status).toBe('unhealthy');
      expect(health.database).toBe('disconnected');
      expect(health.cache).toBe('connected');
      expect(health.errors).toContain('Database connection timeout');
      expect(mockLogger.error).toHaveBeenCalledWith('health_check_failed', expect.objectContaining({
        component: 'database',
        error: 'Connection timeout',
      }));
    });

    it('should detect cache connection issues', async () => {
      // Arrange
      mockDbConnection.ping = jest.fn().mockResolvedValue(true);
      mockCacheManager.ping = jest.fn().mockRejectedValue(new Error('Cache unreachable'));

      // Act
      const health = await repositoryHealth.checkHealth();

      // Assert
      expect(health).toBeDefined();
      expect(health.status).toBe('degraded');
      expect(health.database).toBe('connected');
      expect(health.cache).toBe('disconnected');
      expect(health.errors).toContain('Cache unreachable');
      expect(mockLogger.warn).toHaveBeenCalledWith('health_check_degraded', expect.objectContaining({
        component: 'cache',
        error: 'Cache unreachable',
      }));
    });

    it('should detect multiple component failures', async () => {
      // Arrange
      mockDbConnection.ping = jest.fn().mockRejectedValue(new Error('Database down'));
      mockCacheManager.ping = jest.fn().mockRejectedValue(new Error('Cache down'));

      // Act
      const health = await repositoryHealth.checkHealth();

      // Assert
      expect(health).toBeDefined();
      expect(health.status).toBe('unhealthy');
      expect(health.database).toBe('disconnected');
      expect(health.cache).toBe('disconnected');
      expect(health.errors).toHaveLength(2);
    });
  });

  describe('Detailed Health Diagnostics', () => {
    it('should perform comprehensive health check', async () => {
      // Arrange
      mockDbConnection.ping = jest.fn().mockResolvedValue(true);
      mockDbConnection.getConnectionInfo = jest.fn().mockResolvedValue({
        host: 'localhost',
        port: 5432,
        database: 'vex_app',
        connections: {
          active: 5,
          idle: 10,
          total: 20,
        },
      });
      mockCacheManager.ping = jest.fn().mockResolvedValue(true);
      mockCacheManager.getStats = jest.fn().mockResolvedValue({
        hits: 850,
        misses: 150,
        memory: '50MB',
      });

      // Act
      const diagnostics = await repositoryHealth.performDiagnostics();

      // Assert
      expect(diagnostics).toBeDefined();
      expect(diagnostics.overall.status).toBe('healthy');
      expect(diagnostics.database).toBeDefined();
      expect(diagnostics.database.status).toBe('healthy');
      expect(diagnostics.database.connections.active).toBe(5);
      expect(diagnostics.cache).toBeDefined();
      expect(diagnostics.cache.status).toBe('healthy');
      expect(diagnostics.cache.hits).toBe(850);
      expect(diagnostics.performance).toBeDefined();
      expect(diagnostics.timestamp).toBeDefined();
    });

    it('should check database performance metrics', async () => {
      // Arrange
      mockDbConnection.query = jest.fn().mockResolvedValue({
        rows: [
          { metric: 'slow_queries', value: 5 },
          { metric: 'connections', value: 15 },
          { metric: 'lock_waits', value: 2 },
        ],
      });

      // Act
      const dbMetrics = await repositoryHealth.checkDatabasePerformance();

      // Assert
      expect(dbMetrics).toBeDefined();
      expect(dbMetrics.slowQueries).toBe(5);
      expect(dbMetrics.connections).toBe(15);
      expect(dbMetrics.lockWaits).toBe(2);
      expect(dbMetrics.status).toBe('healthy');
    });

    it('should check cache performance metrics', async () => {
      // Arrange
      mockCacheManager.getStats = jest.fn().mockResolvedValue({
        hits: 850,
        misses: 150,
        evictions: 10,
        memory: '75MB',
        maxMemory: '100MB',
      });

      // Act
      const cacheMetrics = await repositoryHealth.checkCachePerformance();

      // Assert
      expect(cacheMetrics).toBeDefined();
      expect(cacheMetrics.hits).toBe(850);
      expect(cacheMetrics.misses).toBe(150);
      expect(cacheMetrics.hitRate).toBe(0.85);
      expect(cacheMetrics.memoryUsage).toBe(0.75);
      expect(cacheMetrics.status).toBe('healthy');
    });

    it('should check system resource usage', async () => {
      // Arrange
      const mockProcess = {
        memoryUsage: jest.fn().mockReturnValue({
          rss: 67108864, // 64MB
          heapTotal: 104857600, // 100MB
          heapUsed: 52428800, // 50MB
          external: 20971520, // 20MB
        }),
        cpuUsage: jest.fn().mockReturnValue({
          user: 12345678,
          system: 23456789,
        }),
      };

      // Act
      const resourceMetrics = await repositoryHealth.checkSystemResources(mockProcess as any);

      // Assert
      expect(resourceMetrics).toBeDefined();
      expect(resourceMetrics.memory).toBeDefined();
      expect(resourceMetrics.memory.heapUsage).toBe(0.5);
      expect(resourceMetrics.cpu).toBeDefined();
      expect(resourceMetrics.status).toBe('healthy');
    });
  });

  describe('Health Monitoring and Alerts', () => {
    it('should monitor health continuously', async () => {
      // Arrange
      mockDbConnection.ping = jest.fn().mockResolvedValue(true);
      mockCacheManager.ping = jest.fn().mockResolvedValue(true);
      
      const alertCallback = jest.fn();
      repositoryHealth.setAlertCallback(alertCallback);
      
      // Act
      await repositoryHealth.startMonitoring({ interval: 100 }); // 100ms interval
      
      // Wait for at least one health check
      await new Promise(resolve => setTimeout(resolve, 150));
      
      await repositoryHealth.stopMonitoring();

      // Assert
      expect(alertCallback).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('health_monitoring_started', expect.objectContaining({
        interval: 100,
      }));
      expect(mockLogger.info).toHaveBeenCalledWith('health_monitoring_stopped');
    });

    it('should trigger alerts on health degradation', async () => {
      // Arrange
      mockDbConnection.ping = jest.fn().mockResolvedValueOnce(true).mockRejectedValueOnce(new Error('DB down'));
      mockCacheManager.ping = jest.fn().mockResolvedValue(true);
      
      const alertCallback = jest.fn();
      repositoryHealth.setAlertCallback(alertCallback);
      
      // Act
      await repositoryHealth.checkHealth();

      // Assert
      expect(alertCallback).toHaveBeenCalledWith(expect.objectContaining({
        type: 'health_degradation',
        severity: 'high',
        component: 'database',
        message: expect.stringContaining('Database connection failed'),
      }));
    });

    it('should track health trends', async () => {
      // Arrange
      const healthChecks = [
        { status: 'healthy', timestamp: new Date('2023-01-15T10:00:00Z') },
        { status: 'healthy', timestamp: new Date('2023-01-15T10:01:00Z') },
        { status: 'degraded', timestamp: new Date('2023-01-15T10:02:00Z') },
        { status: 'unhealthy', timestamp: new Date('2023-01-15T10:03:00Z') },
      ];

      // Act
      repositoryHealth.recordHealthCheck(healthChecks[0]);
      repositoryHealth.recordHealthCheck(healthChecks[1]);
      repositoryHealth.recordHealthCheck(healthChecks[2]);
      repositoryHealth.recordHealthCheck(healthChecks[3]);
      
      const trends = repositoryHealth.getHealthTrends();

      // Assert
      expect(trends).toBeDefined();
      expect(trends.currentStatus).toBe('unhealthy');
      expect(trends.degradationTrend).toBe('declining');
      expect(trends.uptime).toBeDefined();
      expect(trends.averageResponseTime).toBeDefined();
    });
  });

  describe('Auto-Recovery Mechanisms', () => {
    it('should attempt database reconnection', async () => {
      // Arrange
      mockDbConnection.ping = jest.fn()
        .mockRejectedValueOnce(new Error('Connection lost'))
        .mockResolvedValueOnce(true);
      
      repositoryHealth.enableAutoRecovery({ database: true, cache: false });

      // Act
      const health = await repositoryHealth.checkHealth();

      // Assert
      expect(health.status).toBe('healthy');
      expect(mockDbConnection.ping).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith('auto_recovery_success', expect.objectContaining({
        component: 'database',
        attempts: 2,
      }));
    });

    it('should attempt cache reconnection', async () => {
      // Arrange
      mockDbConnection.ping = jest.fn().mockResolvedValue(true);
      mockCacheManager.ping = jest.fn()
        .mockRejectedValueOnce(new Error('Cache disconnected'))
        .mockResolvedValueOnce(true);
      
      repositoryHealth.enableAutoRecovery({ database: false, cache: true });

      // Act
      const health = await repositoryHealth.checkHealth();

      // Assert
      expect(health.status).toBe('healthy');
      expect(mockCacheManager.ping).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith('auto_recovery_success', expect.objectContaining({
        component: 'cache',
        attempts: 2,
      }));
    });

    it('should fail recovery after max attempts', async () => {
      // Arrange
      mockDbConnection.ping = jest.fn().mockRejectedValue(new Error('Persistent failure'));
      repositoryHealth.enableAutoRecovery({ database: true, cache: false }, { maxAttempts: 3 });

      // Act
      const health = await repositoryHealth.checkHealth();

      // Assert
      expect(health.status).toBe('unhealthy');
      expect(mockDbConnection.ping).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
      expect(mockLogger.error).toHaveBeenCalledWith('auto_recovery_failed', expect.objectContaining({
        component: 'database',
        maxAttempts: 3,
      }));
    });

    it('should implement circuit breaker pattern', async () => {
      // Arrange
      mockDbConnection.ping = jest.fn().mockRejectedValue(new Error('Service down'));
      repositoryHealth.enableCircuitBreaker({ threshold: 3, timeout: 60000 });

      // Act
      // Trigger failures to open circuit
      for (let i = 0; i < 3; i++) {
        await repositoryHealth.checkHealth();
      }

      const healthAfterCircuitOpen = await repositoryHealth.checkHealth();

      // Assert
      expect(healthAfterCircuitOpen.status).toBe('unhealthy');
      expect(healthAfterCircuitOpen.errors).toContain('Circuit breaker is open');
      expect(mockLogger.warn).toHaveBeenCalledWith('circuit_breaker_opened', expect.objectContaining({
        component: 'database',
        failures: 3,
      }));
    });
  });

  describe('Health Reporting', () => {
    it('should generate health report', async () => {
      // Arrange
      mockDbConnection.ping = jest.fn().mockResolvedValue(true);
      mockCacheManager.ping = jest.fn().mockResolvedValue(true);
      
      // Record some health history
      repositoryHealth.recordHealthCheck({ status: 'healthy', timestamp: new Date(Date.now() - 3600000) });
      repositoryHealth.recordHealthCheck({ status: 'healthy', timestamp: new Date(Date.now() - 1800000) });
      repositoryHealth.recordHealthCheck({ status: 'degraded', timestamp: new Date(Date.now() - 900000) });

      // Act
      const report = await repositoryHealth.generateHealthReport();

      // Assert
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.summary.currentStatus).toBe('healthy');
      expect(report.summary.uptime).toBeDefined();
      expect(report.summary.downtime).toBeDefined();
      expect(report.trends).toBeDefined();
      expect(report.incidents).toBeDefined();
      expect(report.performance).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    it('should calculate uptime statistics', async () => {
      // Arrange
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);
      
      repositoryHealth.recordHealthCheck({ status: 'healthy', timestamp: oneHourAgo });
      repositoryHealth.recordHealthCheck({ status: 'healthy', timestamp: new Date(oneHourAgo.getTime() + 1800000) });
      repositoryHealth.recordHealthCheck({ status: 'degraded', timestamp: new Date(oneHourAgo.getTime() + 2700000) });
      repositoryHealth.recordHealthCheck({ status: 'healthy', timestamp: now });

      // Act
      const uptime = repositoryHealth.calculateUptime(oneHourAgo, now);

      // Assert
      expect(uptime).toBeDefined();
      expect(uptime.totalTime).toBe(3600000); // 1 hour in ms
      expect(uptime.uptime).toBeGreaterThan(0);
      expect(uptime.downtime).toBe(0);
      expect(uptime.uptimePercentage).toBeGreaterThan(0.9);
    });

    it('should identify health incidents', async () => {
      // Arrange
      const now = new Date();
      
      repositoryHealth.recordHealthCheck({ status: 'healthy', timestamp: new Date(now.getTime() - 7200000) });
      repositoryHealth.recordHealthCheck({ status: 'unhealthy', timestamp: new Date(now.getTime() - 3600000) });
      repositoryHealth.recordHealthCheck({ status: 'unhealthy', timestamp: new Date(now.getTime() - 1800000) });
      repositoryHealth.recordHealthCheck({ status: 'healthy', timestamp: now });

      // Act
      const incidents = repositoryHealth.getIncidents();

      // Assert
      expect(incidents).toBeDefined();
      expect(incidents).toHaveLength(1);
      expect(incidents[0].type).toBe('unhealthy');
      expect(incidents[0].duration).toBeGreaterThan(0);
      expect(incidents[0].resolved).toBe(true);
    });
  });

  describe('Health Configuration', () => {
    it('should configure health check thresholds', () => {
      // Arrange
      const thresholds = {
        responseTime: 1000, // 1 second
        errorRate: 0.05, // 5%
        memoryUsage: 0.8, // 80%
        cacheHitRate: 0.7, // 70%
      };

      // Act
      repositoryHealth.configureThresholds(thresholds);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('health_thresholds_configured', expect.objectContaining({
        thresholds,
      }));
    });

    it('should configure monitoring intervals', () => {
      // Arrange
      const intervals = {
        basic: 30000, // 30 seconds
        detailed: 300000, // 5 minutes
        comprehensive: 3600000, // 1 hour
      };

      // Act
      repositoryHealth.configureMonitoringIntervals(intervals);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('monitoring_intervals_configured', expect.objectContaining({
        intervals,
      }));
    });

    it('should configure alert rules', () => {
      // Arrange
      const alertRules = [
        {
          condition: 'status === "unhealthy"',
          severity: 'critical',
          cooldown: 300000, // 5 minutes
        },
        {
          condition: 'responseTime > 5000',
          severity: 'warning',
          cooldown: 60000, // 1 minute
        },
      ];

      // Act
      repositoryHealth.configureAlertRules(alertRules);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('alert_rules_configured', expect.objectContaining({
        rulesCount: 2,
      }));
    });
  });

  describe('Integration with External Systems', () => {
    it('should push health status to monitoring service', async () => {
      // Arrange
      const monitoringService = {
        pushHealthStatus: jest.fn().mockResolvedValue(true),
      };
      
      repositoryHealth.addMonitoringService(monitoringService);
      mockDbConnection.ping = jest.fn().mockResolvedValue(true);
      mockCacheManager.ping = jest.fn().mockResolvedValue(true);

      // Act
      const result = await repositoryHealth.pushHealthStatus();

      // Assert
      expect(result).toBe(true);
      expect(monitoringService.pushHealthStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          timestamp: expect.any(Date),
        })
      );
    });

    it('should pull health status from external sources', async () => {
      // Arrange
      const externalHealthSource = {
        getHealthStatus: jest.fn().mockResolvedValue({
          service: 'external-api',
          status: 'healthy',
          responseTime: 150,
        }),
      };
      
      repositoryHealth.addExternalHealthSource(externalHealthSource);

      // Act
      const externalHealth = await repositoryHealth.getExternalHealthStatus();

      // Assert
      expect(externalHealth).toBeDefined();
      expect(externalHealth['external-api']).toBeDefined();
      expect(externalHealth['external-api'].status).toBe('healthy');
    });

    it('should aggregate health from multiple sources', async () => {
      // Arrange
      mockDbConnection.ping = jest.fn().mockResolvedValue(true);
      mockCacheManager.ping = jest.fn().mockResolvedValue(true);
      
      const externalSource = {
        getHealthStatus: jest.fn().mockResolvedValue({
          service: 'payment-gateway',
          status: 'healthy',
        }),
      };
      
      repositoryHealth.addExternalHealthSource(externalSource);

      // Act
      const aggregatedHealth = await repositoryHealth.getAggregatedHealth();

      // Assert
      expect(aggregatedHealth).toBeDefined();
      expect(aggregatedHealth.overall.status).toBe('healthy');
      expect(aggregatedHealth.components.database.status).toBe('healthy');
      expect(aggregatedHealth.components.cache.status).toBe('healthy');
      expect(aggregatedHealth.components['payment-gateway'].status).toBe('healthy');
    });
  });

  describe('Performance Optimization', () => {
    it('should optimize health check performance', async () => {
      // Arrange
      const startTime = Date.now();
      mockDbConnection.ping = jest.fn().mockResolvedValue(true);
      mockCacheManager.ping = jest.fn().mockResolvedValue(true);

      // Act
      await repositoryHealth.checkHealth();
      const endTime = Date.now();

      // Assert
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
      expect(mockLogger.debug).toHaveBeenCalledWith('health_check_performance', expect.objectContaining({
        duration: expect.any(Number),
      }));
    });

    it('should implement health check caching', async () => {
      // Arrange
      mockDbConnection.ping = jest.fn().mockResolvedValue(true);
      mockCacheManager.ping = jest.fn().mockResolvedValue(true);
      
      repositoryHealth.enableHealthCache({ ttl: 30000 }); // 30 seconds cache

      // Act
      const health1 = await repositoryHealth.checkHealth();
      const health2 = await repositoryHealth.checkHealth(); // Should use cache

      // Assert
      expect(health1).toEqual(health2);
      expect(mockDbConnection.ping).toHaveBeenCalledTimes(1); // Only called once due to cache
      expect(mockLogger.debug).toHaveBeenCalledWith('health_cache_hit', expect.any(Object));
    });

    it('should implement parallel health checks', async () => {
      // Arrange
      mockDbConnection.ping = jest.fn().mockResolvedValue(true);
      mockCacheManager.ping = jest.fn().mockResolvedValue(true);
      
      repositoryHealth.enableParallelChecks(true);

      // Act
      const startTime = Date.now();
      const health = await repositoryHealth.checkHealth();
      const endTime = Date.now();

      // Assert
      expect(health.status).toBe('healthy');
      expect(endTime - startTime).toBeLessThan(50); // Should be faster with parallel checks
      expect(mockLogger.debug).toHaveBeenCalledWith('parallel_health_checks_completed', expect.objectContaining({
        duration: expect.any(Number),
      }));
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle health check failures gracefully', async () => {
      // Arrange
      mockDbConnection.ping = jest.fn().mockRejectedValue(new Error('Unexpected error'));
      mockCacheManager.ping = jest.fn().mockRejectedValue(new Error('Cache error'));

      // Act
      const health = await repositoryHealth.checkHealth();

      // Assert
      expect(health).toBeDefined();
      expect(health.status).toBe('unhealthy');
      expect(health.errors).toHaveLength(2);
      expect(health.errors[0]).toContain('Unexpected error');
      expect(health.errors[1]).toContain('Cache error');
    });

    it('should implement fallback health checks', async () => {
      // Arrange
      mockDbConnection.ping = jest.fn().mockRejectedValue(new Error('Primary check failed'));
      repositoryHealth.enableFallbackChecks(true);

      // Act
      const health = await repositoryHealth.checkHealth();

      // Assert
      expect(health).toBeDefined();
      expect(health.status).toBe('degraded'); // Should be degraded but not completely failed
      expect(health.fallbackUsed).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('fallback_health_check_used', expect.any(Object));
    });

    it('should implement health check timeouts', async () => {
      // Arrange
      mockDbConnection.ping = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
      );
      
      repositoryHealth.configureTimeouts({ database: 1000, cache: 1000 }); // 1 second timeout

      // Act
      const health = await repositoryHealth.checkHealth();

      // Assert
      expect(health).toBeDefined();
      expect(health.status).toBe('unhealthy');
      expect(health.errors).toContain('Database health check timeout');
      expect(mockLogger.warn).toHaveBeenCalledWith('health_check_timeout', expect.objectContaining({
        component: 'database',
        timeout: 1000,
      }));
    });
  });
});
