/**
 * RepositoryMonitoring Tests
 * 
 * Comprehensive test suite for RepositoryMonitoring functionality including
 * performance monitoring, health checks, metrics collection, and alerting.
 */

import { RepositoryMonitoring } from '../repositories/RepositoryMonitoring';
import { Logger } from '../logging/Logger';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

describe('RepositoryMonitoring', () => {
  let repositoryMonitoring: RepositoryMonitoring;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryMonitoring = new RepositoryMonitoring(mockLogger);
  });

  describe('Performance Monitoring', () => {
    it('should monitor repository operation performance', async () => {
      // Arrange
      const monitoringConfig = {
        repository: 'UserRepository',
        operations: ['findById', 'findAll', 'create', 'update', 'delete'],
        metrics: ['duration', 'memory_usage', 'cpu_usage'],
        sampling: {
          enabled: true,
          rate: 1.0, // 100% sampling
        },
        thresholds: {
          duration: { warning: 1000, critical: 5000 },
          memory_usage: { warning: 50 * 1024 * 1024, critical: 100 * 1024 * 1024 },
          cpu_usage: { warning: 0.7, critical: 0.9 },
        },
      };

      // Act
      const monitoring = await repositoryMonitoring.startPerformanceMonitoring(monitoringConfig);

      // Assert
      expect(monitoring).toBeDefined();
      expect(monitoring.repository).toBe('UserRepository');
      expect(monitoring.operations).toEqual(['findById', 'findAll', 'create', 'update', 'delete']);
      expect(monitoring.metrics).toEqual(['duration', 'memory_usage', 'cpu_usage']);
      expect(monitoring.active).toBe(true);
    });

    it('should collect operation metrics', async () => {
      // Arrange
      const operation = 'findById';
      const metrics = {
        duration: 150,
        memory_usage: 10 * 1024 * 1024,
        cpu_usage: 0.05,
        success: true,
        error_count: 0,
      };

      // Act
      const collected = repositoryMonitoring.collectOperationMetrics(operation, metrics);

      // Assert
      expect(collected).toBeDefined();
      expect(collected.operation).toBe('findById');
      expect(collected.duration).toBe(150);
      expect(collected.memory_usage).toBe(10 * 1024 * 1024);
      expect(collected.cpu_usage).toBe(0.05);
      expect(collected.success).toBe(true);
      expect(collected.timestamp).toBeDefined();
    });

    it('should analyze performance trends', async () => {
      // Arrange
      const trendConfig = {
        repository: 'UserRepository',
        operation: 'findById',
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
        metrics: ['duration', 'memory_usage', 'cpu_usage'],
        granularity: 'hourly',
      };

      // Act
      const trends = await repositoryMonitoring.analyzePerformanceTrends(trendConfig);

      // Assert
      expect(trends).toBeDefined();
      expect(trends.repository).toBe('UserRepository');
      expect(trends.operation).toBe('findById');
      expect(trends.metrics).toEqual(['duration', 'memory_usage', 'cpu_usage']);
      expect(trends.granularity).toBe('hourly');
      expect(trends.data).toBeDefined();
      expect(trends.statistics).toBeDefined();
    });

    it('should detect performance anomalies', async () => {
      // Arrange
      const anomalyConfig = {
        repository: 'UserRepository',
        operation: 'findAll',
        algorithm: 'statistical',
        threshold: 2, // 2 standard deviations
        windowSize: 100,
        metrics: ['duration', 'memory_usage'],
      };

      // Act
      const anomalies = await repositoryMonitoring.detectPerformanceAnomalies(anomalyConfig);

      // Assert
      expect(anomalies).toBeDefined();
      expect(anomalies.repository).toBe('UserRepository');
      expect(anomalies.operation).toBe('findAll');
      expect(anomalies.algorithm).toBe('statistical');
      expect(anomalies.threshold).toBe(2);
      expect(anomalies.detectedAnomalies).toBeDefined();
    });
  });

  describe('Health Monitoring', () => {
    it('should perform repository health check', async () => {
      // Arrange
      const healthConfig = {
        repository: 'UserRepository',
        checks: [
          {
            name: 'database_connection',
            type: 'connectivity',
            target: 'database',
            timeout: 5000,
          },
          {
            name: 'cache_connection',
            type: 'connectivity',
            target: 'cache',
            timeout: 3000,
          },
          {
            name: 'query_performance',
            type: 'performance',
            query: 'SELECT COUNT(*) FROM users',
            maxDuration: 1000,
          },
        ],
      };

      // Act
      const health = await repositoryMonitoring.performHealthCheck(healthConfig);

      // Assert
      expect(health).toBeDefined();
      expect(health.repository).toBe('UserRepository');
      expect(health.checks).toHaveLength(3);
      expect(health.overallHealth).toBe('healthy');
      expect(health.checks[0].name).toBe('database_connection');
      expect(health.checks[0].status).toBe('pass');
    });

    it('should monitor repository health continuously', async () => {
      // Arrange
      const continuousConfig = {
        repository: 'UserRepository',
        interval: 30000, // 30 seconds
        checks: [
          {
            name: 'database_connection',
            type: 'connectivity',
            target: 'database',
          },
          {
            name: 'cache_connection',
            type: 'connectivity',
            target: 'cache',
          },
        ],
        alerts: {
          failureThreshold: 3, // 3 consecutive failures
          recoveryThreshold: 2, // 2 consecutive successes
        },
      };

      // Act
      const monitoring = await repositoryMonitoring.startContinuousHealthMonitoring(continuousConfig);

      // Assert
      expect(monitoring).toBeDefined();
      expect(monitoring.repository).toBe('UserRepository');
      expect(monitoring.interval).toBe(30000);
      expect(monitoring.active).toBe(true);
      expect(monitoring.checks).toHaveLength(2);
    });

    it('should track health metrics over time', async () => {
      // Arrange
      const metricsConfig = {
        repository: 'UserRepository',
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
        granularity: 'hourly',
        metrics: ['availability', 'response_time', 'error_rate'],
      };

      // Act
      const metrics = await repositoryMonitoring.getHealthMetrics(metricsConfig);

      // Assert
      expect(metrics).toBeDefined();
      expect(metrics.repository).toBe('UserRepository');
      expect(metrics.granularity).toBe('hourly');
      expect(metrics.metrics).toEqual(['availability', 'response_time', 'error_rate']);
      expect(metrics.data).toBeDefined();
      expect(metrics.summary).toBeDefined();
    });

    it('should generate health report', async () => {
      // Arrange
      const reportConfig = {
        repositories: ['UserRepository', 'ProductRepository', 'OrderRepository'],
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
        includeTrends: true,
        includeRecommendations: true,
        format: 'detailed',
      };

      // Act
      const report = await repositoryMonitoring.generateHealthReport(reportConfig);

      // Assert
      expect(report).toBeDefined();
      expect(report.repositories).toEqual(['UserRepository', 'ProductRepository', 'OrderRepository']);
      expect(report.timeRange).toBeDefined();
      expect(report.includeTrends).toBe(true);
      expect(report.includeRecommendations).toBe(true);
      expect(report.summary).toBeDefined();
      expect(report.repositoryReports).toHaveLength(3);
    });
  });

  describe('Metrics Collection', () => {
    it('should collect custom metrics', async () => {
      // Arrange
      const metricsConfig = {
        repository: 'UserRepository',
        customMetrics: [
          {
            name: 'user_registration_rate',
            type: 'counter',
            description: 'Number of user registrations per minute',
          },
          {
            name: 'active_sessions',
            type: 'gauge',
            description: 'Number of active user sessions',
          },
          {
            name: 'query_complexity',
            type: 'histogram',
            description: 'Distribution of query complexity scores',
          },
        ],
      };

      // Act
      const collection = await repositoryMonitoring.setupCustomMetrics(metricsConfig);

      // Assert
      expect(collection).toBeDefined();
      expect(collection.repository).toBe('UserRepository');
      expect(collection.customMetrics).toHaveLength(3);
      expect(collection.customMetrics[0].name).toBe('user_registration_rate');
      expect(collection.customMetrics[0].type).toBe('counter');
    });

    it('should record metric values', async () => {
      // Arrange
      const metricName = 'user_registration_rate';
      const value = 25;
      const labels = {
        source: 'web',
        region: 'us-east-1',
      };

      // Act
      const recorded = repositoryMonitoring.recordMetric(metricName, value, labels);

      // Assert
      expect(recorded).toBeDefined();
      expect(recorded.metric).toBe('user_registration_rate');
      expect(recorded.value).toBe(25);
      expect(recorded.labels).toEqual(labels);
      expect(recorded.timestamp).toBeDefined();
    });

    it('should aggregate metrics over time', async () => {
      // Arrange
      const aggregationConfig = {
        repository: 'UserRepository',
        metrics: ['user_registration_rate', 'active_sessions', 'query_complexity'],
        aggregation: {
          type: 'rate',
          interval: '5m',
          functions: ['avg', 'max', 'min', 'sum'],
        },
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
      };

      // Act
      const aggregation = await repositoryMonitoring.aggregateMetrics(aggregationConfig);

      // Assert
      expect(aggregation).toBeDefined();
      expect(aggregation.repository).toBe('UserRepository');
      expect(aggregation.metrics).toEqual(['user_registration_rate', 'active_sessions', 'query_complexity']);
      expect(aggregation.aggregation.type).toBe('rate');
      expect(aggregation.aggregation.interval).toBe('5m');
      expect(aggregation.results).toBeDefined();
    });

    it('should export metrics in different formats', async () => {
      // Arrange
      const exportConfig = {
        repository: 'UserRepository',
        format: 'prometheus',
        metrics: ['user_registration_rate', 'active_sessions', 'query_complexity'],
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
      };

      // Act
      const exported = await repositoryMonitoring.exportMetrics(exportConfig);

      // Assert
      expect(exported).toBeDefined();
      expect(exported.format).toBe('prometheus');
      expect(exported.repository).toBe('UserRepository');
      expect(exported.metrics).toEqual(['user_registration_rate', 'active_sessions', 'query_complexity']);
      expect(exported.data).toBeDefined();
    });
  });

  describe('Alerting', () => {
    it('should create alert rules', () => {
      // Arrange
      const alertRules = [
        {
          name: 'high_response_time',
          condition: 'avg(duration) > 1000',
          severity: 'warning',
          repository: 'UserRepository',
          operation: 'findById',
          duration: '5m',
        },
        {
          name: 'database_connection_failure',
          condition: 'health_check_status != "pass"',
          severity: 'critical',
          repository: 'UserRepository',
          check: 'database_connection',
          duration: '1m',
        },
        {
          name: 'memory_usage_high',
          condition: 'avg(memory_usage) > 100 * 1024 * 1024',
          severity: 'warning',
          repository: 'UserRepository',
          duration: '10m',
        },
      ];

      // Act
      const rules = repositoryMonitoring.createAlertRules(alertRules);

      // Assert
      expect(rules).toBeDefined();
      expect(rules.rules).toHaveLength(3);
      expect(rules.rules[0].name).toBe('high_response_time');
      expect(rules.rules[0].condition).toBe('avg(duration) > 1000');
      expect(rules.rules[0].severity).toBe('warning');
      expect(rules.active).toBe(true);
    });

    it('should evaluate alert conditions', async () => {
      // Arrange
      const evaluationConfig = {
        repository: 'UserRepository',
        rules: [
          {
            name: 'high_response_time',
            condition: 'avg(duration) > 1000',
            severity: 'warning',
          },
        ],
        timeRange: {
          start: new Date('2023-01-15T10:00:00Z'),
          end: new Date('2023-01-15T10:05:00Z'),
        },
      };

      // Act
      const evaluation = await repositoryMonitoring.evaluateAlertConditions(evaluationConfig);

      // Assert
      expect(evaluation).toBeDefined();
      expect(evaluation.repository).toBe('UserRepository');
      expect(evaluation.rules).toHaveLength(1);
      expect(evaluation.results).toBeDefined();
      expect(evaluation.results[0].name).toBe('high_response_time');
    });

    it('should send alert notifications', async () => {
      // Arrange
      const alert = {
        name: 'high_response_time',
        severity: 'warning',
        repository: 'UserRepository',
        operation: 'findById',
        value: 1500,
        threshold: 1000,
        timestamp: new Date(),
      };

      const notificationConfig = {
        channels: ['email', 'slack'],
        recipients: ['ops-team@example.com', '#alerts'],
        template: 'alert_template',
      };

      // Act
      const notification = await repositoryMonitoring.sendAlertNotification(alert, notificationConfig);

      // Assert
      expect(notification).toBeDefined();
      expect(notification.alert).toEqual(alert);
      expect(notification.channels).toEqual(['email', 'slack']);
      expect(notification.recipients).toEqual(['ops-team@example.com', '#alerts']);
      expect(notification.sent).toBe(true);
    });

    it('should manage alert silencing', async () => {
      // Arrange
      const silenceConfig = {
        alertName: 'high_response_time',
        repository: 'UserRepository',
        duration: 3600000, // 1 hour
        reason: 'Maintenance window',
        createdBy: 'admin@example.com',
      };

      // Act
      const silence = await repositoryManagement.silenceAlert(silenceConfig);

      // Assert
      expect(silence).toBeDefined();
      expect(silence.alertName).toBe('high_response_time');
      expect(silence.repository).toBe('UserRepository');
      expect(silence.duration).toBe(3600000);
      expect(silence.reason).toBe('Maintenance window');
      expect(silence.active).toBe(true);
    });
  });

  describe('Dashboard and Visualization', () => {
    it('should create monitoring dashboard', async () => {
      // Arrange
      const dashboardConfig = {
        name: 'Repository Performance Dashboard',
        repositories: ['UserRepository', 'ProductRepository', 'OrderRepository'],
        widgets: [
          {
            type: 'metric',
            title: 'Response Time',
            metric: 'avg(duration)',
            repository: 'UserRepository',
          },
          {
            type: 'chart',
            title: 'Request Rate',
            metric: 'rate(requests)',
            repository: 'UserRepository',
            chartType: 'line',
          },
          {
            type: 'gauge',
            title: 'Error Rate',
            metric: 'rate(errors)',
            repository: 'UserRepository',
          },
        ],
        refreshInterval: 30000, // 30 seconds
      };

      // Act
      const dashboard = await repositoryMonitoring.createDashboard(dashboardConfig);

      // Assert
      expect(dashboard).toBeDefined();
      expect(dashboard.name).toBe('Repository Performance Dashboard');
      expect(dashboard.repositories).toEqual(['UserRepository', 'ProductRepository', 'OrderRepository']);
      expect(dashboard.widgets).toHaveLength(3);
      expect(dashboard.refreshInterval).toBe(30000);
    });

    it('should generate dashboard data', async () => {
      // Arrange
      const dataConfig = {
        dashboardId: 'dashboard-123',
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
        refresh: true,
      };

      // Act
      const data = await repositoryMonitoring.generateDashboardData(dataConfig);

      // Assert
      expect(data).toBeDefined();
      expect(data.dashboardId).toBe('dashboard-123');
      expect(data.timeRange).toBeDefined();
      expect(data.widgets).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    it('should export dashboard in different formats', async () => {
      // Arrange
      const exportConfig = {
        dashboardId: 'dashboard-123',
        format: 'json',
        includeData: true,
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
      };

      // Act
      const exported = await repositoryMonitoring.exportDashboard(exportConfig);

      // Assert
      expect(exported).toBeDefined();
      expect(exported.format).toBe('json');
      expect(exported.dashboardId).toBe('dashboard-123');
      expect(exported.includeData).toBe(true);
      expect(exported.data).toBeDefined();
    });
  });

  describe('Integration with External Systems', () => {
    it('should integrate with Prometheus', async () => {
      // Arrange
      const prometheusConfig = {
        endpoint: 'http://prometheus:9090',
        metrics: [
          'repository_request_duration',
          'repository_request_count',
          'repository_error_count',
        ],
        labels: {
          repository: 'UserRepository',
          operation: 'findById',
        },
      };

      // Act
      const integration = await repositoryMonitoring.integrateWithPrometheus(prometheusConfig);

      // Assert
      expect(integration).toBeDefined();
      expect(integration.endpoint).toBe('http://prometheus:9090');
      expect(integration.metrics).toEqual(['repository_request_duration', 'repository_request_count', 'repository_error_count']);
      expect(integration.connected).toBe(true);
    });

    it('should integrate with Grafana', async () => {
      // Arrange
      const grafanaConfig = {
        endpoint: 'http://grafana:3000',
        apiKey: 'grafana-api-key',
        dashboard: {
          title: 'Repository Monitoring',
          panels: [
            {
              title: 'Response Time',
              type: 'graph',
              targets: [
                {
                  expr: 'avg(repository_request_duration)',
                  legendFormat: 'Response Time',
                },
              ],
            },
          ],
        },
      };

      // Act
      const integration = await repositoryMonitoring.integrateWithGrafana(grafanaConfig);

      // Assert
      expect(integration).toBeDefined();
      expect(integration.endpoint).toBe('http://grafana:3000');
      expect(integration.dashboard.title).toBe('Repository Monitoring');
      expect(integration.connected).toBe(true);
    });

    it('should integrate with Alertmanager', async () => {
      // Arrange
      const alertmanagerConfig = {
        endpoint: 'http://alertmanager:9093',
        receivers: [
          {
            name: 'ops-team',
            email_configs: [
              {
                to: 'ops-team@example.com',
                subject: 'Repository Alert',
              },
            ],
          },
        ],
        routes: [
          {
            match: {
              severity: 'critical',
            },
            receiver: 'ops-team',
          },
        ],
      };

      // Act
      const integration = await repositoryMonitoring.integrateWithAlertmanager(alertmanagerConfig);

      // Assert
      expect(integration).toBeDefined();
      expect(integration.endpoint).toBe('http://alertmanager:9093');
      expect(integration.receivers).toHaveLength(1);
      expect(integration.routes).toHaveLength(1);
      expect(integration.connected).toBe(true);
    });
  });

  describe('Monitoring Configuration', () => {
    it('should configure monitoring settings', () => {
      // Arrange
      const settings = {
        enabled: true,
        interval: 30000, // 30 seconds
        retention: 7, // days
        sampling: {
          enabled: true,
          rate: 0.1, // 10% sampling
        },
        storage: {
          type: 'prometheus',
          endpoint: 'http://prometheus:9090',
        },
        alerts: {
          enabled: true,
          channels: ['email', 'slack'],
        },
      };

      // Act
      repositoryMonitoring.configureSettings(settings);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('monitoring_settings_configured', expect.objectContaining({
        enabled: true,
        interval: 30000,
      }));
    });

    it('should configure repository-specific monitoring', () => {
      // Arrange
      const repositoryConfig = {
        repository: 'UserRepository',
        enabled: true,
        operations: ['findById', 'findAll', 'create', 'update', 'delete'],
        metrics: ['duration', 'memory_usage', 'cpu_usage', 'error_rate'],
        thresholds: {
          duration: { warning: 1000, critical: 5000 },
          memory_usage: { warning: 50 * 1024 * 1024, critical: 100 * 1024 * 1024 },
          cpu_usage: { warning: 0.7, critical: 0.9 },
          error_rate: { warning: 0.01, critical: 0.05 },
        },
        alerts: {
          enabled: true,
          rules: [
            {
              name: 'high_response_time',
              condition: 'avg(duration) > 1000',
              severity: 'warning',
            },
          ],
        },
      };

      // Act
      repositoryMonitoring.configureRepositoryMonitoring(repositoryConfig);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('repository_monitoring_configured', expect.objectContaining({
        repository: 'UserRepository',
        enabled: true,
      }));
    });

    it('should configure alert rules', () => {
      // Arrange
      const alertConfig = {
        enabled: true,
        rules: [
          {
            name: 'high_response_time',
            condition: 'avg(duration) > 1000',
            severity: 'warning',
            repositories: ['UserRepository', 'ProductRepository'],
            operations: ['findById', 'findAll'],
          },
          {
            name: 'database_connection_failure',
            condition: 'health_check_status != "pass"',
            severity: 'critical',
            repositories: ['UserRepository'],
            checks: ['database_connection'],
          },
        ],
        notifications: {
          channels: ['email', 'slack'],
          recipients: ['ops-team@example.com', '#alerts'],
        },
      };

      // Act
      repositoryMonitoring.configureAlerts(alertConfig);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('alerts_configured', expect.objectContaining({
        enabled: true,
        rulesCount: 2,
      }));
    });
  });

  describe('Monitoring Analytics', () => {
    it('should generate performance analytics', async () => {
      // Arrange
      const analyticsConfig = {
        repositories: ['UserRepository', 'ProductRepository', 'OrderRepository'],
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
        metrics: ['duration', 'memory_usage', 'cpu_usage', 'error_rate'],
        granularity: 'hourly',
        includeTrends: true,
        includeAnomalies: true,
      };

      // Act
      const analytics = await repositoryMonitoring.generatePerformanceAnalytics(analyticsConfig);

      // Assert
      expect(analytics).toBeDefined();
      expect(analytics.repositories).toEqual(['UserRepository', 'ProductRepository', 'OrderRepository']);
      expect(analytics.metrics).toEqual(['duration', 'memory_usage', 'cpu_usage', 'error_rate']);
      expect(analytics.granularity).toBe('hourly');
      expect(analytics.summary).toBeDefined();
      expect(analytics.trends).toBeDefined();
      expect(analytics.anomalies).toBeDefined();
    });

    it('should compare repository performance', async () => {
      // Arrange
      const comparisonConfig = {
        repositories: ['UserRepository', 'ProductRepository'],
        metrics: ['duration', 'memory_usage', 'error_rate'],
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
        baseline: 'UserRepository',
      };

      // Act
      const comparison = await repositoryMonitoring.compareRepositoryPerformance(comparisonConfig);

      // Assert
      expect(comparison).toBeDefined();
      expect(comparison.repositories).toEqual(['UserRepository', 'ProductRepository']);
      expect(comparison.metrics).toEqual(['duration', 'memory_usage', 'error_rate']);
      expect(comparison.baseline).toBe('UserRepository');
      expect(comparison.results).toBeDefined();
      expect(comparison.recommendations).toBeDefined();
    });

    it('should predict performance issues', async () => {
      // Arrange
      const predictionConfig = {
        repositories: ['UserRepository'],
        metrics: ['duration', 'memory_usage', 'cpu_usage'],
        algorithm: 'linear_regression',
        predictionWindow: 3600, // 1 hour
        trainingData: {
          days: 7,
          granularity: 'hourly',
        },
        thresholds: {
          duration: 5000,
          memory_usage: 200 * 1024 * 1024,
          cpu_usage: 0.9,
        },
      };

      // Act
      const prediction = await repositoryMonitoring.predictPerformanceIssues(predictionConfig);

      // Assert
      expect(prediction).toBeDefined();
      expect(prediction.repositories).toEqual(['UserRepository']);
      expect(prediction.algorithm).toBe('linear_regression');
      expect(prediction.predictionWindow).toBe(3600);
      expect(prediction.predictions).toBeDefined();
      expect(prediction.risks).toBeDefined();
    });
  });
});
