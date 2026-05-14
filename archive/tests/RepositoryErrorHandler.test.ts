/**
 * RepositoryErrorHandler Tests
 * 
 * Comprehensive test suite for RepositoryErrorHandler functionality including
 * error handling, error recovery, error logging, and error reporting.
 */

import { RepositoryErrorHandler } from '../repositories/RepositoryErrorHandler';
import { Logger } from '../logging/Logger';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

describe('RepositoryErrorHandler', () => {
  let repositoryErrorHandler: RepositoryErrorHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryErrorHandler = new RepositoryErrorHandler(mockLogger);
  });

  describe('Error Classification', () => {
    it('should classify database connection errors', () => {
      // Arrange
      const error = new Error('Connection timeout');
      error.name = 'ConnectionError';
      error.code = 'ECONNREFUSED';

      // Act
      const classification = repositoryErrorHandler.classifyError(error);

      // Assert
      expect(classification.type).toBe('database_connection');
      expect(classification.severity).toBe('high');
      expect(classification.recoverable).toBe(true);
      expect(classification.category).toBe('infrastructure');
    });

    it('should classify validation errors', () => {
      // Arrange
      const error = new Error('Invalid email format');
      error.name = 'ValidationError';
      error.code = 'VALIDATION_FAILED';

      // Act
      const classification = repositoryErrorHandler.classifyError(error);

      // Assert
      expect(classification.type).toBe('validation');
      expect(classification.severity).toBe('medium');
      expect(classification.recoverable).toBe(true);
      expect(classification.category).toBe('business_logic');
    });

    it('should classify permission errors', () => {
      // Arrange
      const error = new Error('Access denied');
      error.name = 'PermissionError';
      error.code = 'ACCESS_DENIED';

      // Act
      const classification = repositoryErrorHandler.classifyError(error);

      // Assert
      expect(classification.type).toBe('permission');
      expect(classification.severity).toBe('medium');
      expect(classification.recoverable).toBe(false);
      expect(classification.category).toBe('security');
    });

    it('should classify timeout errors', () => {
      // Arrange
      const error = new Error('Query timeout');
      error.name = 'TimeoutError';
      error.code = 'TIMEOUT';

      // Act
      const classification = repositoryErrorHandler.classifyError(error);

      // Assert
      expect(classification.type).toBe('timeout');
      expect(classification.severity).toBe('medium');
      expect(classification.recoverable).toBe(true);
      expect(classification.category).toBe('performance');
    });

    it('should classify unknown errors', () => {
      // Arrange
      const error = new Error('Unknown error occurred');
      error.name = 'UnknownError';
      error.code = 'UNKNOWN';

      // Act
      const classification = repositoryErrorHandler.classifyError(error);

      // Assert
      expect(classification.type).toBe('unknown');
      expect(classification.severity).toBe('medium');
      expect(classification.recoverable).toBe(false);
      expect(classification.category).toBe('general');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors with recovery strategy', async () => {
      // Arrange
      const error = new Error('Connection lost');
      error.name = 'ConnectionError';
      error.code = 'ECONNRESET';

      const context = {
        operation: 'findById',
        repository: 'UserRepository',
        entityId: 'user-123',
        retryCount: 0,
      };

      // Act
      const result = await repositoryErrorHandler.handleError(error, context);

      // Assert
      expect(result).toBeDefined();
      expect(result.handled).toBe(true);
      expect(result.recoveryAttempted).toBe(true);
      expect(result.recoveryStrategy).toBe('retry_with_backoff');
      expect(result.retryDelay).toBeGreaterThan(0);
      expect(mockLogger.warn).toHaveBeenCalledWith('error_handled', expect.objectContaining({
        errorType: 'database_connection',
        recoveryStrategy: 'retry_with_backoff',
      }));
    });

    it('should handle validation errors without recovery', async () => {
      // Arrange
      const error = new Error('Invalid email format');
      error.name = 'ValidationError';
      error.code = 'VALIDATION_FAILED';

      const context = {
        operation: 'create',
        repository: 'UserRepository',
        data: { email: 'invalid-email' },
      };

      // Act
      const result = await repositoryErrorHandler.handleError(error, context);

      // Assert
      expect(result).toBeDefined();
      expect(result.handled).toBe(true);
      expect(result.recoveryAttempted).toBe(false);
      expect(result.userMessage).toBe('Invalid email format');
      expect(result.errorCode).toBe('VALIDATION_FAILED');
    });

    it('should handle permission errors with logging', async () => {
      // Arrange
      const error = new Error('Access denied');
      error.name = 'PermissionError';
      error.code = 'ACCESS_DENIED';

      const context = {
        operation: 'delete',
        repository: 'UserRepository',
        userId: 'user-123',
        targetUserId: 'user-456',
      };

      // Act
      const result = await repositoryErrorHandler.handleError(error, context);

      // Assert
      expect(result).toBeDefined();
      expect(result.handled).toBe(true);
      expect(result.recoveryAttempted).toBe(false);
      expect(result.securityAlert).toBe(true);
      expect(mockLogger.error).toHaveBeenCalledWith('security_violation', expect.objectContaining({
        operation: 'delete',
        userId: 'user-123',
        targetUserId: 'user-456',
      }));
    });

    it('should handle timeout errors with circuit breaker', async () => {
      // Arrange
      const error = new Error('Query timeout');
      error.name = 'TimeoutError';
      error.code = 'TIMEOUT';

      const context = {
        operation: 'findAll',
        repository: 'ProductRepository',
        timeout: 30000,
        actualDuration: 35000,
      };

      // Act
      const result = await repositoryErrorHandler.handleError(error, context);

      // Assert
      expect(result).toBeDefined();
      expect(result.handled).toBe(true);
      expect(result.circuitBreakerTriggered).toBe(true);
      expect(result.fallbackUsed).toBe(true);
    });

    it('should handle multiple concurrent errors', async () => {
      // Arrange
      const errors = [
        new Error('Connection timeout'),
        new Error('Query timeout'),
        new Error('Memory limit exceeded'),
      ];

      const context = {
        operation: 'batchOperation',
        repository: 'OrderRepository',
        batchSize: 100,
      };

      // Act
      const result = await repositoryErrorHandler.handleMultipleErrors(errors, context);

      // Assert
      expect(result).toBeDefined();
      expect(result.totalErrors).toBe(3);
      expect(result.primaryError).toBeDefined();
      expect(result.secondaryErrors).toHaveLength(2);
      expect(result.escalationRequired).toBe(true);
    });
  });

  describe('Error Recovery', () => {
    it('should implement retry with exponential backoff', async () => {
      // Arrange
      let attemptCount = 0;
      const failingOperation = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          const error = new Error('Temporary failure');
          error.name = 'TemporaryError';
          throw error;
        }
        return 'success';
      });

      const recoveryConfig = {
        maxRetries: 3,
        baseDelay: 100,
        maxDelay: 1000,
        backoffMultiplier: 2,
      };

      // Act
      const result = await repositoryErrorHandler.retryWithBackoff(failingOperation, recoveryConfig);

      // Assert
      expect(result).toBe('success');
      expect(attemptCount).toBe(3);
      expect(failingOperation).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      // Arrange
      const alwaysFailingOperation = jest.fn().mockRejectedValue(new Error('Persistent failure'));

      const recoveryConfig = {
        maxRetries: 2,
        baseDelay: 100,
        maxDelay: 1000,
      };

      // Act
      await expect(
        repositoryErrorHandler.retryWithBackoff(alwaysFailingOperation, recoveryConfig)
      ).rejects.toThrow('Persistent failure');

      // Assert
      expect(alwaysFailingOperation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should implement circuit breaker pattern', async () => {
      // Arrange
      let failureCount = 0;
      const operation = jest.fn().mockImplementation(() => {
        failureCount++;
        if (failureCount <= 3) {
          throw new Error('Service unavailable');
        }
        return 'success';
      });

      const circuitBreakerConfig = {
        failureThreshold: 3,
        recoveryTimeout: 1000,
        monitoringPeriod: 5000,
      };

      // Act
      const result1 = await repositoryErrorHandler.executeWithCircuitBreaker(operation, circuitBreakerConfig);
      const result2 = await repositoryErrorHandler.executeWithCircuitBreaker(operation, circuitBreakerConfig);

      // Assert
      expect(result1).toBe('success');
      expect(result2).toBe('success');
      expect(failureCount).toBe(4);
    });

    it('should open circuit breaker after threshold', async () => {
      // Arrange
      const operation = jest.fn().mockRejectedValue(new Error('Service unavailable'));

      const circuitBreakerConfig = {
        failureThreshold: 2,
        recoveryTimeout: 1000,
        monitoringPeriod: 5000,
      };

      // Act
      await expect(
        repositoryErrorHandler.executeWithCircuitBreaker(operation, circuitBreakerConfig)
      ).rejects.toThrow('Service unavailable');

      await expect(
        repositoryErrorHandler.executeWithCircuitBreaker(operation, circuitBreakerConfig)
      ).rejects.toThrow('Circuit breaker is open');

      // Assert
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should implement fallback mechanisms', async () => {
      // Arrange
      const primaryOperation = jest.fn().mockRejectedValue(new Error('Primary service unavailable'));
      const fallbackOperation = jest.fn().mockResolvedValue('fallback_result');

      const fallbackConfig = {
        enabled: true,
        strategies: ['cache', 'secondary_service', 'default_value'],
        cacheKey: 'user:123',
        defaultValue: null,
      };

      // Act
      const result = await repositoryErrorHandler.executeWithFallback(
        primaryOperation,
        fallbackOperation,
        fallbackConfig
      );

      // Assert
      expect(result).toBe('fallback_result');
      expect(primaryOperation).toHaveBeenCalledTimes(1);
      expect(fallbackOperation).toHaveBeenCalledTimes(1);
    });

    it('should implement graceful degradation', async () => {
      // Arrange
      const operations = {
        primary: jest.fn().mockRejectedValue(new Error('Primary failed')),
        secondary: jest.fn().mockRejectedValue(new Error('Secondary failed')),
        tertiary: jest.fn().mockResolvedValue('tertiary_result'),
      };

      const degradationConfig = {
        levels: ['primary', 'secondary', 'tertiary'],
        timeoutPerLevel: 1000,
        continueOnFailure: true,
      };

      // Act
      const result = await repositoryErrorHandler.executeWithDegradation(operations, degradationConfig);

      // Assert
      expect(result).toBe('tertiary_result');
      expect(result.degradationLevel).toBe('tertiary');
      expect(operations.primary).toHaveBeenCalledTimes(1);
      expect(operations.secondary).toHaveBeenCalledTimes(1);
      expect(operations.tertiary).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Logging', () => {
    it('should log errors with context', () => {
      // Arrange
      const error = new Error('Database connection failed');
      const context = {
        operation: 'findById',
        repository: 'UserRepository',
        userId: 'user-123',
        timestamp: new Date(),
        requestId: 'req-456',
      };

      // Act
      repositoryErrorHandler.logError(error, context);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith('repository_error', expect.objectContaining({
        message: 'Database connection failed',
        operation: 'findById',
        repository: 'UserRepository',
        userId: 'user-123',
        requestId: 'req-456',
      }));
    });

    it('should log structured error information', () => {
      // Arrange
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.code = 'VALIDATION_ERROR';
      error.stack = 'Error: Validation failed\n    at Object.validate';

      const context = {
        operation: 'create',
        repository: 'UserRepository',
        data: { name: '', email: 'invalid' },
        validationErrors: ['Name is required', 'Email is invalid'],
      };

      // Act
      repositoryErrorHandler.logError(error, context);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith('repository_error', expect.objectContaining({
        errorName: 'ValidationError',
        errorCode: 'VALIDATION_ERROR',
        stack: expect.any(String),
        validationErrors: ['Name is required', 'Email is invalid'],
      }));
    });

    it('should log performance-related errors', () => {
      // Arrange
      const error = new Error('Query timeout');
      error.name = 'TimeoutError';
      error.code = 'TIMEOUT';

      const context = {
        operation: 'findAll',
        repository: 'ProductRepository',
        query: 'SELECT * FROM products',
        timeout: 30000,
        actualDuration: 35000,
        parameters: [],
      };

      // Act
      repositoryErrorHandler.logError(error, context);

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith('performance_error', expect.objectContaining({
        errorType: 'timeout',
        timeout: 30000,
        actualDuration: 35000,
        performanceIssue: true,
      }));
    });

    it('should log security-related errors', () => {
      // Arrange
      const error = new Error('Unauthorized access');
      error.name = 'SecurityError';
      error.code = 'UNAUTHORIZED';

      const context = {
        operation: 'delete',
        repository: 'UserRepository',
        userId: 'user-123',
        targetUserId: 'user-456',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
      };

      // Act
      repositoryErrorHandler.logError(error, context);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith('security_error', expect.objectContaining({
        errorType: 'security',
        securityLevel: 'high',
        requiresInvestigation: true,
        ipAddress: '192.168.1.100',
      }));
    });

    it('should log error metrics', () => {
      // Arrange
      const errorMetrics = {
        totalErrors: 100,
        errorsByType: {
          database_connection: 30,
          validation: 25,
          timeout: 20,
          permission: 15,
          unknown: 10,
        },
        errorsByRepository: {
          UserRepository: 40,
          ProductRepository: 30,
          OrderRepository: 20,
          PaymentRepository: 10,
        },
        errorRate: 0.05, // 5%
        averageRecoveryTime: 1500, // 1.5 seconds
      };

      // Act
      repositoryErrorHandler.logErrorMetrics(errorMetrics);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('error_metrics', expect.objectContaining({
        totalErrors: 100,
        errorRate: 0.05,
        topErrorType: 'database_connection',
        topRepository: 'UserRepository',
      }));
    });
  });

  describe('Error Reporting', () => {
    it('should generate error report', () => {
      // Arrange
      const errorHistory = [
        {
          timestamp: new Date('2023-01-15T10:00:00Z'),
          error: new Error('Connection failed'),
          context: { operation: 'findById', repository: 'UserRepository' },
          resolved: true,
          recoveryTime: 5000,
        },
        {
          timestamp: new Date('2023-01-15T10:05:00Z'),
          error: new Error('Validation failed'),
          context: { operation: 'create', repository: 'UserRepository' },
          resolved: false,
          recoveryTime: null,
        },
        {
          timestamp: new Date('2023-01-15T10:10:00Z'),
          error: new Error('Timeout'),
          context: { operation: 'findAll', repository: 'ProductRepository' },
          resolved: true,
          recoveryTime: 3000,
        },
      ];

      // Act
      const report = repositoryErrorHandler.generateErrorReport(errorHistory);

      // Assert
      expect(report).toBeDefined();
      expect(report.summary.totalErrors).toBe(3);
      expect(report.summary.resolvedErrors).toBe(2);
      expect(report.summary.unresolvedErrors).toBe(1);
      expect(report.summary.resolutionRate).toBe(0.667);
      expect(report.summary.averageRecoveryTime).toBe(4000);
      expect(report.errorsByType).toBeDefined();
      expect(report.errorsByRepository).toBeDefined();
      expect(report.trends).toBeDefined();
    });

    it('should identify error patterns', () => {
      // Arrange
      const errorData = [
        { type: 'database_connection', repository: 'UserRepository', timestamp: new Date('2023-01-15T10:00:00Z') },
        { type: 'database_connection', repository: 'UserRepository', timestamp: new Date('2023-01-15T10:05:00Z') },
        { type: 'database_connection', repository: 'UserRepository', timestamp: new Date('2023-01-15T10:10:00Z') },
        { type: 'validation', repository: 'ProductRepository', timestamp: new Date('2023-01-15T10:15:00Z') },
        { type: 'validation', repository: 'ProductRepository', timestamp: new Date('2023-01-15T10:20:00Z') },
      ];

      // Act
      const patterns = repositoryErrorHandler.identifyErrorPatterns(errorData);

      // Assert
      expect(patterns).toBeDefined();
      expect(patterns.recurringErrors).toHaveLength(2);
      expect(patterns.recurringErrors[0].type).toBe('database_connection');
      expect(patterns.recurringErrors[0].count).toBe(3);
      expect(patterns.recurringErrors[0].repository).toBe('UserRepository');
      expect(patterns.correlations).toBeDefined();
      expect(patterns.anomalies).toBeDefined();
    });

    it('should generate error alerts', () => {
      // Arrange
      const errorMetrics = {
        errorRate: 0.15, // 15% - above threshold
        totalErrors: 150,
        criticalErrors: 25,
        errorsByType: {
          database_connection: 80, // High number
          validation: 40,
          timeout: 30,
        },
      };

      const alertThresholds = {
        errorRate: 0.1, // 10%
        criticalErrors: 20,
        errorsByType: {
          database_connection: 50,
        },
      };

      // Act
      const alerts = repositoryErrorHandler.generateErrorAlerts(errorMetrics, alertThresholds);

      // Assert
      expect(alerts).toBeDefined();
      expect(alerts.alerts).toHaveLength(2);
      expect(alerts.alerts[0].type).toBe('high_error_rate');
      expect(alerts.alerts[0].severity).toBe('high');
      expect(alerts.alerts[1].type).toBe('critical_error_threshold');
      expect(alerts.alerts[1].severity).toBe('critical');
    });

    it('should create error dashboard data', () => {
      // Arrange
      const dashboardData = {
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
        errors: [
          { timestamp: new Date('2023-01-15'), type: 'database_connection', repository: 'UserRepository' },
          { timestamp: new Date('2023-01-16'), type: 'validation', repository: 'ProductRepository' },
          { timestamp: new Date('2023-01-17'), type: 'timeout', repository: 'OrderRepository' },
        ],
      };

      // Act
      const dashboard = repositoryErrorHandler.createErrorDashboard(dashboardData);

      // Assert
      expect(dashboard).toBeDefined();
      expect(dashboard.overview).toBeDefined();
      expect(dashboard.charts).toBeDefined();
      expect(dashboard.topErrors).toBeDefined();
      expect(dashboard.trends).toBeDefined();
      expect(dashboard.recommendations).toBeDefined();
    });
  });

  describe('Error Configuration', () => {
    it('should configure error handling settings', () => {
      // Arrange
      const settings = {
        enableRetry: true,
        maxRetries: 3,
        enableCircuitBreaker: true,
        circuitBreakerThreshold: 5,
        enableFallback: true,
        enableMetrics: true,
        logLevel: 'error',
        enableAlerts: true,
      };

      // Act
      repositoryErrorHandler.configureSettings(settings);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('error_handler_configured', expect.objectContaining({
        settings,
      }));
    });

    it('should configure error recovery strategies', () => {
      // Arrange
      const recoveryStrategies = {
        database_connection: {
          retry: true,
          maxRetries: 3,
          backoffMultiplier: 2,
          circuitBreaker: true,
          fallback: 'cache',
        },
        validation: {
          retry: false,
          circuitBreaker: false,
          fallback: 'default_value',
        },
        timeout: {
          retry: true,
          maxRetries: 2,
          circuitBreaker: true,
          fallback: 'simplified_query',
        },
      };

      // Act
      repositoryErrorHandler.configureRecoveryStrategies(recoveryStrategies);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('recovery_strategies_configured', expect.objectContaining({
        strategiesCount: 3,
      }));
    });

    it('should configure error alerting', () => {
      // Arrange
      const alerting = {
        enabled: true,
        channels: ['email', 'slack', 'pagerduty'],
        thresholds: {
          errorRate: 0.1,
          criticalErrors: 10,
          consecutiveFailures: 5,
        },
        recipients: {
          email: ['ops@example.com'],
          slack: ['#alerts'],
          pagerduty: ['oncall-engineer'],
        },
      };

      // Act
      repositoryErrorHandler.configureAlerting(alerting);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('error_alerting_configured', expect.objectContaining({
        enabled: true,
        channels: ['email', 'slack', 'pagerduty'],
      }));
    });

    it('should configure error logging', () => {
      // Arrange
      const logging = {
        level: 'debug',
        includeStackTrace: true,
        includeContext: true,
        structuredLogging: true,
        logToFile: true,
        logToDatabase: true,
        retentionDays: 30,
      };

      // Act
      repositoryErrorHandler.configureLogging(logging);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('error_logging_configured', expect.objectContaining({
        level: 'debug',
        structuredLogging: true,
      }));
    });
  });

  describe('Error Monitoring', () => {
    it('should monitor error rates in real-time', () => {
      // Arrange
      const errorStream = [
        { timestamp: new Date(), type: 'database_connection' },
        { timestamp: new Date(), type: 'validation' },
        { timestamp: new Date(), type: 'database_connection' },
        { timestamp: new Date(), type: 'timeout' },
        { timestamp: new Date(), type: 'database_connection' },
      ];

      // Act
      const monitoring = repositoryErrorHandler.monitorErrorRate(errorStream, {
        windowSize: 5, // Last 5 errors
        threshold: 0.6, // 60% of same type
      });

      // Assert
      expect(monitoring).toBeDefined();
      expect(monitoring.currentRate).toBe(0.6); // 3 out of 5 are database_connection
      expect(monitoring.anomalyDetected).toBe(true);
      expect(monitoring.anomalyType).toBe('high_concentration');
    });

    it('should track error trends over time', () => {
      // Arrange
      const errorTimeSeries = [
        { timestamp: new Date('2023-01-15'), count: 10 },
        { timestamp: new Date('2023-01-16'), count: 15 },
        { timestamp: new Date('2023-01-17'), count: 25 },
        { timestamp: new Date('2023-01-18'), count: 20 },
        { timestamp: new Date('2023-01-19'), count: 30 },
      ];

      // Act
      const trends = repositoryErrorHandler.trackErrorTrends(errorTimeSeries);

      // Assert
      expect(trends).toBeDefined();
      expect(trends.direction).toBe('increasing');
      expect(trends.average).toBe(20);
      expect(trends.peak).toBe(30);
      expect(trends.valley).toBe(10);
      expect(trends.volatility).toBeGreaterThan(0);
    });

    it('should detect error anomalies', () => {
      // Arrange
      const baselineMetrics = {
        averageErrorRate: 0.05,
        peakErrorRate: 0.1,
        errorDistribution: {
          database_connection: 0.3,
          validation: 0.4,
          timeout: 0.2,
          permission: 0.1,
        },
      };

      const currentMetrics = {
        errorRate: 0.15, // 3x baseline
        errorDistribution: {
          database_connection: 0.7, // Much higher than baseline
          validation: 0.2,
          timeout: 0.1,
          permission: 0.0,
        },
      };

      // Act
      const anomalies = repositoryErrorHandler.detectErrorAnomalies(baselineMetrics, currentMetrics);

      // Assert
      expect(anomalies).toBeDefined();
      expect(anomalies.anomalies).toHaveLength(2);
      expect(anomalies.anomalies[0].type).toBe('high_error_rate');
      expect(anomalies.anomalies[0].severity).toBe('high');
      expect(anomalies.anomalies[1].type).toBe('distribution_shift');
      expect(anomalies.anomalies[1].severity).toBe('medium');
    });

    it('should predict potential errors', () => {
      // Arrange
      const historicalData = {
        errorPatterns: [
          { timeOfDay: 14, dayOfWeek: 1, errorRate: 0.15 }, // Monday 2 PM
          { timeOfDay: 14, dayOfWeek: 1, errorRate: 0.18 }, // Monday 2 PM
          { timeOfDay: 14, dayOfWeek: 1, errorRate: 0.12 }, // Monday 2 PM
        ],
        systemMetrics: {
          cpuUsage: 0.8,
          memoryUsage: 0.7,
          diskUsage: 0.6,
        },
      };

      const currentTime = new Date('2023-01-16T14:00:00Z'); // Monday 2 PM

      // Act
      const predictions = repositoryErrorHandler.predictErrors(historicalData, currentTime);

      // Assert
      expect(predictions).toBeDefined();
      expect(predictions.predictedErrorRate).toBeGreaterThan(0.1);
      expect(predictions.confidence).toBeGreaterThan(0.5);
      expect(predictions.riskFactors).toContain('high_traffic_period');
      expect(predictions.recommendations).toBeDefined();
    });
  });

  describe('Error Integration', () => {
    it('should integrate with monitoring systems', async () => {
      // Arrange
      const monitoringSystem = {
        sendMetric: jest.fn().mockResolvedValue(true),
        createAlert: jest.fn().mockResolvedValue('alert-123'),
        getDashboard: jest.fn().mockResolvedValue('dashboard-456'),
      };

      repositoryErrorHandler.addMonitoringSystem('datadog', monitoringSystem);

      const error = new Error('Database connection failed');
      const metrics = { errorRate: 0.15, totalErrors: 100 };

      // Act
      const metricSent = await repositoryErrorHandler.sendErrorMetric(metrics, 'datadog');
      const alertCreated = await repositoryErrorHandler.createErrorAlert(error, 'datadog');
      const dashboard = await repositoryErrorHandler.getErrorDashboard('datadog');

      // Assert
      expect(metricSent).toBe(true);
      expect(alertCreated).toBe('alert-123');
      expect(dashboard).toBe('dashboard-456');
      expect(monitoringSystem.sendMetric).toHaveBeenCalled();
      expect(monitoringSystem.createAlert).toHaveBeenCalled();
      expect(monitoringSystem.getDashboard).toHaveBeenCalled();
    });

    it('should integrate with ticketing systems', async () => {
      // Arrange
      const ticketingSystem = {
        createTicket: jest.fn().mockResolvedValue('ticket-123'),
        updateTicket: jest.fn().mockResolvedValue(true),
        getTicket: jest.fn().mockResolvedValue({ id: 'ticket-123', status: 'open' }),
      };

      repositoryErrorHandler.addTicketingSystem('jira', ticketingSystem);

      const error = new Error('Critical system failure');
      const ticketData = {
        title: 'Critical system failure in UserRepository',
        description: 'Database connection failed repeatedly',
        priority: 'high',
        assignee: 'ops-team',
      };

      // Act
      const ticket = await repositoryErrorHandler.createErrorTicket(error, ticketData, 'jira');
      const updated = await repositoryErrorHandler.updateErrorTicket('ticket-123', { status: 'resolved' }, 'jira');
      const retrieved = await repositoryErrorHandler.getErrorTicket('ticket-123', 'jira');

      // Assert
      expect(ticket).toBe('ticket-123');
      expect(updated).toBe(true);
      expect(retrieved.id).toBe('ticket-123');
      expect(ticketingSystem.createTicket).toHaveBeenCalled();
      expect(ticketingSystem.updateTicket).toHaveBeenCalled();
      expect(ticketingSystem.getTicket).toHaveBeenCalled();
    });

    it('should integrate with notification systems', async () => {
      // Arrange
      const notificationSystem = {
        sendEmail: jest.fn().mockResolvedValue(true),
        sendSlack: jest.fn().mockResolvedValue(true),
        sendSMS: jest.fn().mockResolvedValue(true),
      };

      repositoryErrorHandler.addNotificationSystem('sendgrid', notificationSystem);

      const error = new Error('System outage detected');
      const notificationData = {
        recipients: ['ops@example.com', 'admin@example.com'],
        subject: 'System Outage Alert',
        message: 'Critical error detected in production',
        channels: ['email', 'slack'],
      };

      // Act
      const emailSent = await repositoryErrorHandler.sendErrorNotification(error, notificationData, 'email', 'sendgrid');
      const slackSent = await repositoryErrorHandler.sendErrorNotification(error, notificationData, 'slack', 'sendgrid');

      // Assert
      expect(emailSent).toBe(true);
      expect(slackSent).toBe(true);
      expect(notificationSystem.sendEmail).toHaveBeenCalled();
      expect(notificationSystem.sendSlack).toHaveBeenCalled();
    });
  });
});
