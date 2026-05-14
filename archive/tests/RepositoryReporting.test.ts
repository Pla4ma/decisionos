/**
 * RepositoryReporting Tests
 * 
 * Comprehensive test suite for RepositoryReporting functionality including
 * report generation, data aggregation, visualization, and export capabilities.
 */

import { RepositoryReporting } from '../repositories/RepositoryReporting';
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

describe('RepositoryReporting', () => {
  let repositoryReporting: RepositoryReporting;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryReporting = new RepositoryReporting(mockDbConnection, mockLogger);
  });

  describe('Report Generation', () => {
    it('should generate basic repository report', async () => {
      // Arrange
      const reportConfig = {
        name: 'User Repository Report',
        type: 'basic',
        repository: 'UserRepository',
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
        metrics: ['operations', 'performance', 'errors'],
      };

      const mockReportData = {
        operations: {
          total: 10000,
          successful: 9500,
          failed: 500,
          averageDuration: 120,
        },
        performance: {
          averageResponseTime: 150,
          p95ResponseTime: 300,
          throughput: 1000,
        },
        errors: {
          totalErrors: 500,
          errorTypes: { 'ValidationError': 300, 'DatabaseError': 200 },
        },
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockReportData] });

      // Act
      const report = await repositoryReporting.generateReport(reportConfig);

      // Assert
      expect(report).toBeDefined();
      expect(report.id).toBeDefined();
      expect(report.name).toBe('User Repository Report');
      expect(report.type).toBe('basic');
      expect(report.repository).toBe('UserRepository');
      expect(report.generatedAt).toBeDefined();
      expect(report.data).toBeDefined();
      expect(report.data.operations).toBeDefined();
      expect(report.data.performance).toBeDefined();
      expect(report.data.errors).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('report_generated', expect.objectContaining({
        reportId: report.id,
        name: 'User Repository Report',
        type: 'basic',
      }));
    });

    it('should generate detailed repository report', async () => {
      // Arrange
      const reportConfig = {
        name: 'Comprehensive Product Report',
        type: 'detailed',
        repository: 'ProductRepository',
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
        sections: ['overview', 'operations', 'performance', 'errors', 'analytics', 'trends'],
        includeCharts: true,
        includeRecommendations: true,
      };

      const mockDetailedData = {
        overview: {
          totalRecords: 50000,
          activeRecords: 45000,
          inactiveRecords: 5000,
          growthRate: 0.15,
        },
        operations: {
          creates: 1000,
          reads: 50000,
          updates: 2000,
          deletes: 100,
          averageDurations: { create: 150, read: 50, update: 100, delete: 75 },
        },
        performance: {
          responseTime: { avg: 80, p50: 60, p95: 120, p99: 200 },
          throughput: { reads: 1000, writes: 50 },
          cacheHitRate: 0.85,
        },
        errors: {
          totalErrors: 150,
          errorBreakdown: { 'ValidationError': 80, 'TimeoutError': 40, 'DatabaseError': 30 },
          errorTrends: 'decreasing',
        },
        analytics: {
          topProducts: [{ id: 1, name: 'Laptop', views: 10000 }, { id: 2, name: 'Phone', views: 8000 }],
          categories: { electronics: 30000, accessories: 20000 },
        },
        trends: {
          growth: 'positive',
          seasonality: 'stable',
          anomalies: [],
        },
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockDetailedData] });

      // Act
      const report = await repositoryReporting.generateReport(reportConfig);

      // Assert
      expect(report).toBeDefined();
      expect(report.type).toBe('detailed');
      expect(report.sections).toEqual(['overview', 'operations', 'performance', 'errors', 'analytics', 'trends']);
      expect(report.charts).toBe(true);
      expect(report.recommendations).toBe(true);
      expect(report.data.overview).toBeDefined();
      expect(report.data.analytics).toBeDefined();
      expect(report.data.trends).toBeDefined();
    });

    it('should generate comparative repository report', async () => {
      // Arrange
      const reportConfig = {
        name: 'Repository Comparison Report',
        type: 'comparative',
        repositories: ['UserRepository', 'ProductRepository', 'OrderRepository'],
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
        comparisonMetrics: ['performance', 'reliability', 'usage'],
      };

      const mockComparativeData = {
        UserRepository: {
          performance: { avgResponseTime: 120, throughput: 800 },
          reliability: { successRate: 0.98, uptime: 0.999 },
          usage: { operations: 10000, activeUsers: 500 },
        },
        ProductRepository: {
          performance: { avgResponseTime: 80, throughput: 1200 },
          reliability: { successRate: 0.99, uptime: 0.999 },
          usage: { operations: 15000, activeProducts: 1000 },
        },
        OrderRepository: {
          performance: { avgResponseTime: 200, throughput: 600 },
          reliability: { successRate: 0.95, uptime: 0.998 },
          usage: { operations: 8000, activeOrders: 2000 },
        },
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockComparativeData] });

      // Act
      const report = await repositoryReporting.generateReport(reportConfig);

      // Assert
      expect(report).toBeDefined();
      expect(report.type).toBe('comparative');
      expect(report.repositories).toEqual(['UserRepository', 'ProductRepository', 'OrderRepository']);
      expect(report.comparison).toBeDefined();
      expect(report.comparison.rankings).toBeDefined();
      expect(report.comparison.rankings.performance).toBe('ProductRepository');
      expect(report.comparison.rankings.reliability).toBe('ProductRepository');
      expect(report.comparison.rankings.usage).toBe('ProductRepository');
    });

    it('should handle report generation errors gracefully', async () => {
      // Arrange
      const reportConfig = {
        name: 'Error Test Report',
        type: 'basic',
        repository: 'UserRepository',
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
      };

      mockDbConnection.query = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      // Act
      const report = await repositoryReporting.generateReport(reportConfig);

      // Assert
      expect(report).toBeDefined();
      expect(report.status).toBe('failed');
      expect(report.error).toBe('Database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith('report_generation_failed', expect.objectContaining({
        reportName: 'Error Test Report',
        error: 'Database connection failed',
      }));
    });
  });

  describe('Data Aggregation', () => {
    it('should aggregate repository metrics', async () => {
      // Arrange
      const aggregationConfig = {
        repository: 'UserRepository',
        metrics: ['operations', 'errors', 'performance'],
        aggregation: ['daily', 'weekly', 'monthly'],
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
      };

      const mockAggregationData = {
        daily: [
          { date: '2023-01-01', operations: 300, errors: 5, avgResponseTime: 120 },
          { date: '2023-01-02', operations: 320, errors: 3, avgResponseTime: 115 },
          { date: '2023-01-03', operations: 310, errors: 7, avgResponseTime: 125 },
        ],
        weekly: [
          { week: '2023-W01', operations: 2100, errors: 35, avgResponseTime: 118 },
          { week: '2023-W02', operations: 2200, errors: 30, avgResponseTime: 122 },
        ],
        monthly: [
          { month: '2023-01', operations: 8800, errors: 120, avgResponseTime: 120 },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockAggregationData] });

      // Act
      const aggregation = await repositoryReporting.aggregateMetrics(aggregationConfig);

      // Assert
      expect(aggregation).toBeDefined();
      expect(aggregation.repository).toBe('UserRepository');
      expect(aggregation.daily).toBeDefined();
      expect(aggregation.weekly).toBeDefined();
      expect(aggregation.monthly).toBeDefined();
      expect(aggregation.summary).toBeDefined();
      expect(aggregation.summary.totalOperations).toBe(8800);
      expect(aggregation.summary.totalErrors).toBe(120);
      expect(aggregation.summary.averageResponseTime).toBe(120);
    });

    it('should calculate custom aggregations', async () => {
      // Arrange
      const customAggregation = {
        name: 'User Activity Analysis',
        repository: 'UserRepository',
        calculations: [
          {
            name: 'active_users_per_day',
            formula: 'COUNT(DISTINCT user_id) WHERE last_login > CURRENT_DATE - INTERVAL 1 DAY',
            type: 'daily',
          },
          {
            name: 'user_retention_rate',
            formula: '(COUNT(DISTINCT user_id) WHERE last_login > CURRENT_DATE - INTERVAL 30 DAYS) / COUNT(DISTINCT user_id))',
            type: 'monthly',
          },
        ],
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
      };

      const mockCustomData = {
        'active_users_per_day': [
          { date: '2023-01-01', value: 450 },
          { date: '2023-01-02', value: 460 },
          { date: '2023-01-03', value: 455 },
        ],
        'user_retention_rate': [
          { month: '2023-01', value: 0.85 },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockCustomData] });

      // Act
      const result = await repositoryReporting.calculateCustomAggregation(customAggregation);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('User Activity Analysis');
      expect(result.calculations).toBeDefined();
      expect(result.calculations['active_users_per_day']).toBeDefined();
      expect(result.calculations['user_retention_rate']).toBeDefined();
      expect(result.calculations['active_users_per_day'][0].value).toBe(450);
      expect(result.calculations['user_retention_rate'][0].value).toBe(0.85);
    });

    it('should perform real-time aggregation', async () => {
      // Arrange
      const realtimeConfig = {
        repository: 'OrderRepository',
        metrics: ['order_volume', 'revenue', 'conversion_rate'],
        window: '1h', // 1 hour window
        refreshInterval: 300, // 5 minutes
      };

      const mockRealtimeData = {
        timestamp: new Date(),
        order_volume: 150,
        revenue: 15000,
        conversion_rate: 0.15,
        trends: {
          order_volume: 'increasing',
          revenue: 'stable',
          conversion_rate: 'decreasing',
        },
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockRealtimeData] });

      // Act
      const realtime = await repositoryReporting.performRealtimeAggregation(realtimeConfig);

      // Assert
      expect(realtime).toBeDefined();
      expect(realtime.timestamp).toBeDefined();
      expect(realtime.metrics).toBeDefined();
      expect(realtime.metrics.order_volume).toBe(150);
      expect(realtime.metrics.revenue).toBe(15000);
      expect(realtime.metrics.conversion_rate).toBe(0.15);
      expect(realtime.trends).toBeDefined();
    });
  });

  describe('Report Scheduling', () => {
    it('should create report schedule', () => {
      // Arrange
      const scheduleConfig = {
        name: 'Daily User Report',
        reportConfig: {
          name: 'Daily User Repository Report',
          type: 'basic',
          repository: 'UserRepository',
        },
        frequency: 'daily',
        time: '08:00',
        timezone: 'UTC',
        recipients: ['admin@example.com', 'ops@example.com'],
        format: 'pdf',
      };

      // Act
      const schedule = repositoryReporting.createSchedule(scheduleConfig);

      // Assert
      expect(schedule).toBeDefined();
      expect(schedule.id).toBeDefined();
      expect(schedule.name).toBe('Daily User Report');
      expect(schedule.frequency).toBe('daily');
      expect(schedule.time).toBe('08:00');
      expect(schedule.enabled).toBe(true);
      expect(schedule.nextRun).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('report_schedule_created', expect.objectContaining({
        scheduleId: schedule.id,
        name: 'Daily User Report',
        frequency: 'daily',
      }));
    });

    it('should execute scheduled report', async () => {
      // Arrange
      const schedule = {
        id: 'schedule-123',
        name: 'Daily User Report',
        reportConfig: {
          name: 'Daily User Repository Report',
          type: 'basic',
          repository: 'UserRepository',
        },
        recipients: ['admin@example.com'],
        format: 'pdf',
      };

      const mockReportData = {
        operations: { total: 1000, successful: 950, failed: 50 },
        performance: { avgResponseTime: 120, throughput: 800 },
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockReportData] });

      // Act
      const execution = await repositoryReporting.executeScheduledReport(schedule);

      // Assert
      expect(execution).toBeDefined();
      expect(execution.scheduleId).toBe('schedule-123');
      expect(execution.status).toBe('completed');
      expect(execution.reportId).toBeDefined();
      expect(execution.generatedAt).toBeDefined();
      expect(execution.delivered).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('scheduled_report_executed', expect.objectContaining({
        scheduleId: 'schedule-123',
        reportId: execution.reportId,
      }));
    });

    it('should calculate next report run time', () => {
      // Arrange
      const now = new Date('2023-01-15T10:00:00Z');
      const schedule = {
        frequency: 'daily',
        time: '08:00',
        timezone: 'UTC',
        lastRun: new Date('2023-01-15T08:00:00Z'),
      };

      // Act
      const nextRun = repositoryReporting.calculateNextRun(schedule, now);

      // Assert
      expect(nextRun).toBeDefined();
      expect(nextRun.getDate()).toBe(16); // Next day
      expect(nextRun.getHours()).toBe(8);
      expect(nextRun.getMinutes()).toBe(0);
    });

    it('should handle report delivery failures', async () => {
      // Arrange
      const schedule = {
        id: 'schedule-123',
        name: 'Daily User Report',
        reportConfig: {
          name: 'Daily User Repository Report',
          type: 'basic',
          repository: 'UserRepository',
        },
        recipients: ['invalid-email@example.com'],
        format: 'pdf',
      };

      const mockReportData = {
        operations: { total: 1000, successful: 950, failed: 50 },
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockReportData] });

      // Act
      const execution = await repositoryReporting.executeScheduledReport(schedule);

      // Assert
      expect(execution).toBeDefined();
      expect(execution.status).toBe('completed_with_errors');
      expect(execution.deliveryErrors).toHaveLength(1);
      expect(execution.deliveryErrors[0]).toContain('invalid-email@example.com');
      expect(mockLogger.warn).toHaveBeenCalledWith('report_delivery_failed', expect.objectContaining({
        scheduleId: 'schedule-123',
        errors: expect.any(Array),
      }));
    });
  });

  describe('Report Templates', () => {
    it('should create report template', () => {
      // Arrange
      const templateConfig = {
        name: 'Standard Repository Template',
        description: 'Template for basic repository reports',
        type: 'basic',
        sections: ['overview', 'operations', 'performance'],
        metrics: ['total_operations', 'success_rate', 'average_response_time'],
        charts: ['operations_trend', 'response_time_distribution'],
        format: 'html',
      };

      // Act
      const template = repositoryReporting.createTemplate(templateConfig);

      // Assert
      expect(template).toBeDefined();
      expect(template.id).toBeDefined();
      expect(template.name).toBe('Standard Repository Template');
      expect(template.type).toBe('basic');
      expect(template.sections).toEqual(['overview', 'operations', 'performance']);
      expect(template.metrics).toEqual(['total_operations', 'success_rate', 'average_response_time']);
      expect(mockLogger.info).toHaveBeenCalledWith('report_template_created', expect.objectContaining({
        templateId: template.id,
        name: 'Standard Repository Template',
      }));
    });

    it('should generate report from template', async () => {
      // Arrange
      const template = {
        id: 'template-123',
        name: 'User Repository Template',
        type: 'basic',
        sections: ['overview', 'operations'],
        metrics: ['total_operations', 'success_rate'],
        repository: 'UserRepository',
      };

      const reportConfig = {
        templateId: 'template-123',
        repository: 'UserRepository',
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
        parameters: {
          includeCharts: true,
          format: 'pdf',
        },
      };

      const mockTemplateData = {
        overview: { totalRecords: 10000, activeRecords: 9500 },
        operations: { total: 5000, successful: 4750, failed: 250 },
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockTemplateData] });

      // Act
      const report = await repositoryReporting.generateFromTemplate(template, reportConfig);

      // Assert
      expect(report).toBeDefined();
      expect(report.templateId).toBe('template-123');
      expect(report.type).toBe('basic');
      expect(report.sections).toEqual(['overview', 'operations']);
      expect(report.data.overview).toBeDefined();
      expect(report.data.operations).toBeDefined();
    });

    it('should validate report template', () => {
      // Arrange
      const validTemplate = {
        name: 'Valid Template',
        type: 'basic',
        sections: ['overview'],
        metrics: ['total_operations'],
      };

      const invalidTemplate = {
        name: '', // Empty name
        type: 'invalid_type',
        sections: [], // Empty sections
        metrics: [], // Empty metrics
      };

      // Act & Assert
      expect(() => {
        repositoryReporting.validateTemplate(validTemplate);
      }).not.toThrow();

      expect(() => {
        repositoryReporting.validateTemplate(invalidTemplate);
      }).toThrow('Template name is required');
    });
  });

  describe('Report Export and Distribution', () => {
    it('should export report to PDF', async () => {
      // Arrange
      const report = {
        id: 'report-123',
        name: 'User Repository Report',
        type: 'basic',
        data: {
          operations: { total: 1000, successful: 950 },
          performance: { avgResponseTime: 120 },
        },
      };

      const exportConfig = {
        format: 'pdf',
        filename: 'user_repository_report.pdf',
        includeCharts: true,
        password: 'secure123',
      };

      // Act
      const export = await repositoryReporting.exportReport(report, exportConfig);

      // Assert
      expect(export).toBeDefined();
      expect(export.format).toBe('pdf');
      expect(export.filename).toBe('user_repository_report.pdf');
      expect(export.fileSize).toBeGreaterThan(0);
      expect(export.downloadUrl).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('report_exported', expect.objectContaining({
        reportId: 'report-123',
        format: 'pdf',
        filename: 'user_repository_report.pdf',
      }));
    });

    it('should export report to Excel', async () => {
      // Arrange
      const report = {
        id: 'report-123',
        name: 'User Repository Report',
        type: 'detailed',
        data: {
          operations: [
            { date: '2023-01-01', total: 100, successful: 95 },
            { date: '2023-01-02', total: 120, successful: 115 },
          ],
          performance: [
            { metric: 'response_time', value: 120 },
            { metric: 'throughput', value: 800 },
          ],
        },
      };

      const exportConfig = {
        format: 'excel',
        filename: 'user_repository_report.xlsx',
        includeCharts: false,
        separateSheets: true,
      };

      // Act
      const export = await repositoryReporting.exportReport(report, exportConfig);

      // Assert
      expect(export).toBeDefined();
      expect(export.format).toBe('excel');
      expect(export.filename).toBe('user_repository_report.xlsx');
      expect(export.sheets).toBeDefined();
      expect(export.sheets).toContain('operations');
      expect(export.sheets).toContain('performance');
    });

    it('should distribute report via email', async () => {
      // Arrange
      const report = {
        id: 'report-123',
        name: 'User Repository Report',
        type: 'basic',
        data: { operations: { total: 1000 } },
      };

      const distributionConfig = {
        method: 'email',
        recipients: ['admin@example.com', 'ops@example.com'],
        subject: 'Daily User Repository Report',
        body: 'Please find attached the daily user repository report.',
        format: 'pdf',
        includeCharts: true,
      };

      // Act
      const distribution = await repositoryReporting.distributeReport(report, distributionConfig);

      // Assert
      expect(distribution).toBeDefined();
      expect(distribution.method).toBe('email');
      expect(distribution.recipients).toEqual(['admin@example.com', 'ops@example.com']);
      expect(distribution.status).toBe('sent');
      expect(distribution.sentAt).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('report_distributed', expect.objectContaining({
        reportId: 'report-123',
        method: 'email',
        recipients: expect.any(Array),
      }));
    });

    it('should distribute report via webhook', async () => {
      // Arrange
      const report = {
        id: 'report-123',
        name: 'User Repository Report',
        type: 'basic',
        data: { operations: { total: 1000 } },
      };

      const distributionConfig = {
        method: 'webhook',
        webhookUrl: 'https://api.example.com/webhooks/reports',
        headers: { 'Authorization': 'Bearer token123' },
        format: 'json',
        retryAttempts: 3,
      };

      // Act
      const distribution = await repositoryReporting.distributeReport(report, distributionConfig);

      // Assert
      expect(distribution).toBeDefined();
      expect(distribution.method).toBe('webhook');
      expect(distribution.webhookUrl).toBe('https://api.example.com/webhooks/reports');
      expect(distribution.status).toBe('delivered');
      expect(distribution.responseCode).toBe(200);
    });
  });

  describe('Report Analytics', () => {
    it('should analyze report usage patterns', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockUsageData = [
        { reportId: 'report-1', name: 'User Report', views: 150, downloads: 50, shares: 25 },
        { reportId: 'report-2', name: 'Product Report', views: 200, downloads: 75, shares: 30 },
        { reportId: 'report-3', name: 'Order Report', views: 100, downloads: 40, shares: 15 },
      ];

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: mockUsageData });

      // Act
      const analytics = await repositoryReporting.analyzeReportUsage(timeRange);

      // Assert
      expect(analytics).toBeDefined();
      expect(analytics.totalViews).toBe(450);
      expect(analytics.totalDownloads).toBe(165);
      expect(analytics.totalShares).toBe(70);
      expect(analytics.mostViewed).toBe('Product Report');
      expect(analytics.mostDownloaded).toBe('Product Report');
      expect(analytics.mostShared).toBe('Product Report');
      expect(analytics.trends).toBeDefined();
    });

    it('should track report performance metrics', async () => {
      // Arrange
      const performanceData = [
        { reportId: 'report-1', generationTime: 5000, fileSize: 1024000, format: 'pdf' },
        { reportId: 'report-2', generationTime: 3000, fileSize: 512000, format: 'excel' },
        { reportId: 'report-3', generationTime: 8000, fileSize: 2048000, format: 'pdf' },
      ];

      // Act
      const metrics = repositoryReporting.trackReportPerformance(performanceData);

      // Assert
      expect(metrics).toBeDefined();
      expect(metrics.averageGenerationTime).toBe(5333.33);
      expect(metrics.averageFileSize).toBe(1194666.67);
      expect(metrics.formatPerformance).toBeDefined();
      expect(metrics.formatPerformance.pdf).toBeDefined();
      expect(metrics.formatPerformance.excel).toBeDefined();
      expect(metrics.optimizationSuggestions).toBeDefined();
    });

    it('should generate report insights', async () => {
      // Arrange
      const reportData = {
        operations: {
          total: 10000,
          successful: 9500,
          failed: 500,
          averageDuration: 120,
        },
        performance: {
          responseTime: { avg: 120, p95: 200, p99: 300 },
          throughput: 1000,
        },
        errors: {
          totalErrors: 500,
          errorTypes: { 'ValidationError': 300, 'DatabaseError': 200 },
        },
      };

      // Act
      const insights = repositoryReporting.generateInsights(reportData);

      // Assert
      expect(insights).toBeDefined();
      expect(insights.summary).toBeDefined();
      expect(insights.keyFindings).toBeDefined();
      expect(insights.recommendations).toBeDefined();
      expect(insights.keyFindings).toContain('Success rate is 95% which is good');
      expect(insights.keyFindings).toContain('ValidationError is the most common error type');
      expect(insights.recommendations).toContain('Focus on reducing validation errors');
    });
  });

  describe('Report Configuration', () => {
    it('should configure report settings', () => {
      // Arrange
      const settings = {
        defaultFormat: 'pdf',
        includeCharts: true,
        maxFileSize: 10485760, // 10MB
        cacheReports: true,
        cacheTTL: 3600, // 1 hour
        enableCompression: true,
      };

      // Act
      repositoryReporting.configureSettings(settings);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('report_settings_configured', expect.objectContaining({
        settings,
      }));
    });

    it('should configure report templates', () => {
      // Arrange
      const templates = [
        {
          name: 'Basic Repository Report',
          type: 'basic',
          sections: ['overview', 'operations'],
        },
        {
          name: 'Detailed Repository Report',
          type: 'detailed',
          sections: ['overview', 'operations', 'performance', 'errors'],
        },
      ];

      // Act
      repositoryReporting.configureTemplates(templates);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('report_templates_configured', expect.objectContaining({
        templatesCount: 2,
      }));
    });

    it('should configure report distribution', () => {
      // Arrange
      const distribution = {
        defaultMethod: 'email',
        defaultRecipients: ['admin@example.com'],
        emailSettings: {
          smtpHost: 'smtp.example.com',
          smtpPort: 587,
          username: 'reports@example.com',
        },
        webhookSettings: {
          timeout: 30000,
          retryAttempts: 3,
        },
      };

      // Act
      repositoryReporting.configureDistribution(distribution);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('report_distribution_configured', expect.objectContaining({
        defaultMethod: 'email',
      }));
    });
  });

  describe('Report Security', () => {
    it('should validate report access permissions', () => {
      // Arrange
      const report = {
        id: 'report-123',
        name: 'User Repository Report',
        type: 'basic',
        sensitivity: 'internal',
      };

      const userPermissions = {
        canViewReports: ['basic', 'detailed'],
        canViewSensitive: false,
        allowedRepositories: ['UserRepository', 'ProductRepository'],
      };

      // Act
      const validation = repositoryReporting.validateReportAccess(report, userPermissions);

      // Assert
      expect(validation).toBeDefined();
      expect(validation.canAccess).toBe(true);
      expect(validation.missingPermissions).toHaveLength(0);
    });

    it('should encrypt sensitive report data', async () => {
      // Arrange
      const sensitiveReport = {
        id: 'report-123',
        name: 'Sensitive User Report',
        type: 'detailed',
        data: {
          users: [
            { id: 1, name: 'John Doe', email: 'john@example.com', ssn: '123-45-6789' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', ssn: '987-65-4321' },
          ],
        },
        sensitivity: 'confidential',
      };

      const encryptionConfig = {
        encryptFields: ['ssn', 'email'],
        encryptionKey: 'test-key',
      };

      // Act
      const encrypted = repositoryReporting.encryptSensitiveData(sensitiveReport, encryptionConfig);

      // Assert
      expect(encrypted).toBeDefined();
      expect(encrypted.data.users[0].name).toBe('John Doe'); // Not encrypted
      expect(encrypted.data.users[0].sssn).not.toBe('123-45-6789'); // Encrypted
      expect(encrypted.data.users[0].email).not.toBe('john@example.com'); // Encrypted
    });

    it('should audit report access', async () => {
      // Arrange
      const auditEvent = {
        reportId: 'report-123',
        userId: 'user-456',
        action: 'view',
        timestamp: new Date(),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      const audit = await repositoryReporting.auditReportAccess(auditEvent);

      // Assert
      expect(audit).toBeDefined();
      expect(audit.auditId).toBeDefined();
      expect(audit.reportId).toBe('report-123');
      expect(audit.userId).toBe('user-456');
      expect(audit.action).toBe('view');
      expect(mockLogger.info).toHaveBeenCalledWith('report_access_audited', expect.objectContaining({
        auditId: audit.auditId,
        reportId: 'report-123',
        userId: 'user-456',
      }));
    });
  });

  describe('Report Integration', () => {
    it('should integrate with BI tools', async () => {
      // Arrange
      const biTool = {
        connect: jest.fn().mockResolvedValue(true),
        uploadData: jest.fn().mockResolvedValue('dataset-123'),
        createDashboard: jest.fn().mockResolvedValue('dashboard-456'),
      };

      repositoryReporting.addBITool('tableau', biTool);

      // Act
      const connected = await repositoryReporting.connectToBI('tableau');
      const uploaded = await repositoryReporting.uploadToBI('report-123', 'tableau');
      const dashboard = await repositoryReporting.createBIDashboard('report-123', 'tableau');

      // Assert
      expect(connected).toBe(true);
      expect(uploaded).toBe('dataset-123');
      expect(dashboard).toBe('dashboard-456');
      expect(biTool.connect).toHaveBeenCalled();
      expect(biTool.uploadData).toHaveBeenCalled();
      expect(biTool.createDashboard).toHaveBeenCalled();
    });

    it('should integrate with analytics platforms', async () => {
      // Arrange
      const analyticsPlatform = {
        trackEvent: jest.fn().mockResolvedValue(true),
        sendMetrics: jest.fn().mockResolvedValue(true),
        createAlert: jest.fn().mockResolvedValue('alert-789'),
      };

      repositoryReporting.addAnalyticsPlatform('google-analytics', analyticsPlatform);

      // Act
      const tracked = await repositoryReporting.trackReportEvent('report-generated', 'google-analytics');
      const metrics = await repositoryReporting.sendMetricsToAnalytics('report-123', 'google-analytics');
      const alert = await repositoryReporting.createAnalyticsAlert('report-failure', 'google-analytics');

      // Assert
      expect(tracked).toBe(true);
      expect(metrics).toBe(true);
      expect(alert).toBe('alert-789');
      expect(analyticsPlatform.trackEvent).toHaveBeenCalled();
      expect(analyticsPlatform.sendMetrics).toHaveBeenCalled();
      expect(analyticsPlatform.createAlert).toHaveBeenCalled();
    });

    it('should integrate with storage services', async () => {
      // Arrange
      const storageService = {
        upload: jest.fn().mockResolvedValue({ url: 'https://storage.example.com/reports/report-123.pdf' }),
        download: jest.fn().mockResolvedValue('file-content'),
        delete: jest.fn().mockResolvedValue(true),
        list: jest.fn().mockResolvedValue(['report-123.pdf', 'report-456.pdf']),
      };

      repositoryReporting.addStorageService('s3', storageService);

      // Act
      const uploaded = await repositoryReporting.uploadToStorage('report-123.pdf', 's3');
      const downloaded = await repositoryReporting.downloadFromStorage('report-123.pdf', 's3');
      const deleted = await repositoryReporting.deleteFromStorage('report-123.pdf', 's3');
      const listed = await repositoryReporting.listStorage('s3');

      // Assert
      expect(uploaded.url).toBe('https://storage.example.com/reports/report-123.pdf');
      expect(downloaded).toBe('file-content');
      expect(deleted).toBe(true);
      expect(listed).toEqual(['report-123.pdf', 'report-456.pdf']);
      expect(storageService.upload).toHaveBeenCalled();
      expect(storageService.download).toHaveBeenCalled();
      expect(storageService.delete).toHaveBeenCalled();
      expect(storageService.list).toHaveBeenCalled();
    });
  });
});
