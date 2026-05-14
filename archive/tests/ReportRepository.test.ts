/**
 * ReportRepository Tests
 * 
 * Comprehensive test suite for ReportRepository functionality including
 * report generation, execution, scheduling, templates, and analytics.
 */

import { ReportRepository } from '../repositories/ReportRepository';
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

describe('ReportRepository', () => {
  let reportRepository: ReportRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    reportRepository = new ReportRepository(mockDbConnection, mockCacheManager, mockLogger);
  });

  describe('Report Management', () => {
    it('should create report', async () => {
      // Arrange
      const reportData = {
        name: 'Monthly Sales Report',
        description: 'Monthly sales performance report',
        type: 'sales',
        category: 'business',
        template: 'sales_template',
        parameters: {
          startDate: '2023-01-01',
          endDate: '2023-01-31',
          includeReturns: true,
        },
        filters: {
          region: 'US',
          productCategory: 'electronics',
        },
        schedule: {
          enabled: true,
          frequency: 'monthly',
          dayOfMonth: 1,
          time: '09:00',
        },
        recipients: [
          { email: 'manager@example.com', type: 'to' },
          { email: 'team@example.com', type: 'cc' },
        ],
        format: 'pdf',
        metadata: {
          createdBy: 'admin-123',
          department: 'sales',
        },
      };

      const mockResult = {
        rows: [{
          id: 'report-123',
          name: 'Monthly Sales Report',
          description: 'Monthly sales performance report',
          type: 'sales',
          category: 'business',
          template: 'sales_template',
          parameters: JSON.stringify(reportData.parameters),
          filters: JSON.stringify(reportData.filters),
          schedule: JSON.stringify(reportData.schedule),
          recipients: JSON.stringify(reportData.recipients),
          format: 'pdf',
          status: 'active',
          metadata: JSON.stringify(reportData.metadata),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.createReport(reportData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(reportData.name);
      expect(result.type).toBe(reportData.type);
      expect(result.category).toBe(reportData.category);
      expect(result.status).toBe('active');
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO reports'),
        expect.arrayContaining([
          reportData.name,
          reportData.description,
          reportData.type,
          reportData.category,
          reportData.template,
          JSON.stringify(reportData.parameters),
          JSON.stringify(reportData.filters),
          JSON.stringify(reportData.schedule),
          JSON.stringify(reportData.recipients),
          reportData.format,
          JSON.stringify(reportData.metadata),
        ])
      );
    });

    it('should find report by ID', async () => {
      // Arrange
      const reportId = 'report-123';
      const mockResult = {
        rows: [{
          id: reportId,
          name: 'Monthly Sales Report',
          description: 'Monthly sales performance report',
          type: 'sales',
          category: 'business',
          template: 'sales_template',
          parameters: JSON.stringify({ startDate: '2023-01-01', endDate: '2023-01-31' }),
          filters: JSON.stringify({ region: 'US', productCategory: 'electronics' }),
          schedule: JSON.stringify({ enabled: true, frequency: 'monthly' }),
          recipients: JSON.stringify([{ email: 'manager@example.com', type: 'to' }]),
          format: 'pdf',
          status: 'active',
          metadata: JSON.stringify({ createdBy: 'admin-123' }),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.findById(reportId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(reportId);
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        expect.stringContaining('findById'),
        reportId
      );
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should update report', async () => {
      // Arrange
      const reportId = 'report-123';
      const updates = {
        name: 'Updated Monthly Sales Report',
        description: 'Updated monthly sales performance report',
        parameters: {
          startDate: '2023-02-01',
          endDate: '2023-02-28',
          includeReturns: false,
        },
        status: 'inactive',
      };

      const mockResult = {
        rows: [{
          id: reportId,
          name: 'Updated Monthly Sales Report',
          description: 'Updated monthly sales performance report',
          parameters: JSON.stringify(updates.parameters),
          status: 'inactive',
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.updateReport(reportId, updates);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(updates.name);
      expect(result.status).toBe(updates.status);
      expect(mockCacheManager.delete).toHaveBeenCalled();
    });

    it('should delete report', async () => {
      // Arrange
      const reportId = 'report-123';
      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      const result = await reportRepository.deleteReport(reportId);

      // Assert
      expect(result).toBe(true);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        'DELETE FROM reports WHERE id = $1',
        [reportId]
      );
      expect(mockCacheManager.delete).toHaveBeenCalled();
    });
  });

  describe('Report Queries', () => {
    it('should get reports by type', async () => {
      // Arrange
      const type = 'sales';
      const mockResult = {
        rows: [
          {
            id: 'report-1',
            name: 'Monthly Sales Report',
            type: type,
            category: 'business',
            status: 'active',
          },
          {
            id: 'report-2',
            name: 'Weekly Sales Summary',
            type: type,
            category: 'business',
            status: 'active',
          },
        ],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.getReportsByType(type);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].type).toBe(type);
      expect(result[1].type).toBe(type);
    });

    it('should get reports by category', async () => {
      // Arrange
      const category = 'business';
      const mockResult = {
        rows: [
          {
            id: 'report-1',
            name: 'Monthly Sales Report',
            type: 'sales',
            category: category,
            status: 'active',
          },
          {
            id: 'report-2',
            name: 'Customer Analytics',
            type: 'analytics',
            category: category,
            status: 'active',
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.getReportsByCategory(category);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].category).toBe(category);
      expect(result[1].category).toBe(category);
    });

    it('should get active reports', async () => {
      // Arrange
      const mockResult = {
        rows: [
          {
            id: 'report-1',
            name: 'Monthly Sales Report',
            type: 'sales',
            category: 'business',
            status: 'active',
          },
          {
            id: 'report-2',
            name: 'User Activity Report',
            type: 'analytics',
            category: 'technical',
            status: 'active',
          },
        ],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.getActiveReports();

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].status).toBe('active');
      expect(result[1].status).toBe('active');
    });

    it('should search reports', async () => {
      // Arrange
      const searchTerm = 'sales';
      const filters = {
        type: 'sales',
        category: 'business',
        status: 'active',
      };
      const options = {
        limit: 10,
        offset: 0,
      };

      const mockResult = {
        rows: [
          {
            id: 'report-1',
            name: 'Monthly Sales Report',
            type: 'sales',
            category: 'business',
            status: 'active',
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.searchReports(searchTerm, filters, options);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name.toLowerCase()).toContain(searchTerm);
    });
  });

  describe('Report Execution', () => {
    it('should execute report', async () => {
      // Arrange
      const reportId = 'report-123';
      const executionConfig = {
        parameters: {
          startDate: '2023-01-01',
          endDate: '2023-01-31',
        },
        format: 'pdf',
        emailRecipients: true,
      };

      const mockResult = {
        rows: [{
          id: 'execution-123',
          report_id: reportId,
          status: 'running',
          started_at: new Date(),
          parameters: JSON.stringify(executionConfig.parameters),
          format: executionConfig.format,
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.executeReport(reportId, executionConfig);

      // Assert
      expect(result).toBeDefined();
      expect(result.reportId).toBe(reportId);
      expect(result.status).toBe('running');
    });

    it('should update execution status', async () => {
      // Arrange
      const executionId = 'execution-123';
      const status = 'completed';
      const results = {
        rowCount: 1000,
        fileSize: 2048576,
        downloadUrl: 'https://example.com/reports/monthly-sales.pdf',
        summary: {
          totalSales: 100000,
          averageOrderValue: 100,
          topProduct: 'Electronics Widget',
        },
      };

      const mockResult = {
        rows: [{
          id: executionId,
          report_id: 'report-123',
          status: status,
          started_at: new Date('2023-01-15'),
          completed_at: new Date('2023-01-15'),
          results: JSON.stringify(results),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.updateExecutionStatus(executionId, status, results);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(status);
      expect(result.results).toBeDefined();
    });

    it('should get execution details', async () => {
      // Arrange
      const executionId = 'execution-123';
      const mockResult = {
        rows: [{
          id: executionId,
          report_id: 'report-123',
          status: 'completed',
          started_at: new Date('2023-01-15'),
          completed_at: new Date('2023-01-15'),
          duration: 120000,
          parameters: JSON.stringify({ startDate: '2023-01-01', endDate: '2023-01-31' }),
          results: JSON.stringify({
            rowCount: 1000,
            fileSize: 2048576,
            downloadUrl: 'https://example.com/reports/monthly-sales.pdf',
          }),
          error: null,
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.getExecutionDetails(executionId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(executionId);
      expect(result.status).toBe('completed');
      expect(result.duration).toBe(120000);
    });

    it('should get execution history', async () => {
      // Arrange
      const reportId = 'report-123';
      const options = {
        limit: 10,
        offset: 0,
        status: 'completed',
      };

      const mockResult = {
        rows: [
          {
            id: 'execution-1',
            report_id: reportId,
            status: 'completed',
            started_at: new Date('2023-01-15'),
            completed_at: new Date('2023-01-15'),
            duration: 120000,
          },
          {
            id: 'execution-2',
            report_id: reportId,
            status: 'completed',
            started_at: new Date('2023-01-14'),
            completed_at: new Date('2023-01-14'),
            duration: 115000,
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.getExecutionHistory(reportId, options);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].reportId).toBe(reportId);
      expect(result[1].reportId).toBe(reportId);
    });
  });

  describe('Report Scheduling', () => {
    it('should schedule report', async () => {
      // Arrange
      const reportId = 'report-123';
      const scheduleConfig = {
        enabled: true,
        frequency: 'monthly',
        dayOfMonth: 1,
        time: '09:00',
        timezone: 'UTC',
        recipients: [
          { email: 'manager@example.com', type: 'to' },
        ],
      };

      const mockResult = {
        rows: [{
          id: 'schedule-123',
          report_id: reportId,
          enabled: true,
          frequency: 'monthly',
          day_of_month: 1,
          time: '09:00',
          timezone: 'UTC',
          recipients: JSON.stringify(scheduleConfig.recipients),
          next_run: new Date('2023-02-01T09:00:00Z'),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.scheduleReport(reportId, scheduleConfig);

      // Assert
      expect(result).toBeDefined();
      expect(result.reportId).toBe(reportId);
      expect(result.enabled).toBe(scheduleConfig.enabled);
      expect(result.frequency).toBe(scheduleConfig.frequency);
    });

    it('should update schedule', async () => {
      // Arrange
      const scheduleId = 'schedule-123';
      const updates = {
        enabled: false,
        frequency: 'weekly',
        dayOfWeek: 1,
        time: '10:00',
      };

      const mockResult = {
        rows: [{
          id: scheduleId,
          report_id: 'report-123',
          enabled: false,
          frequency: 'weekly',
          day_of_week: 1,
          time: '10:00',
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.updateSchedule(scheduleId, updates);

      // Assert
      expect(result).toBeDefined();
      expect(result.enabled).toBe(updates.enabled);
      expect(result.frequency).toBe(updates.frequency);
    });

    it('should get scheduled reports', async () => {
      // Arrange
      const mockResult = {
        rows: [
          {
            id: 'schedule-1',
            report_id: 'report-123',
            report_name: 'Monthly Sales Report',
            enabled: true,
            frequency: 'monthly',
            next_run: new Date('2023-02-01T09:00:00Z'),
          },
          {
            id: 'schedule-2',
            report_id: 'report-456',
            report_name: 'Weekly Analytics',
            enabled: true,
            frequency: 'weekly',
            next_run: new Date('2023-01-22T10:00:00Z'),
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.getScheduledReports();

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].enabled).toBe(true);
      expect(result[1].enabled).toBe(true);
    });

    it('should get pending scheduled runs', async () => {
      // Arrange
      const mockResult = {
        rows: [
          {
            id: 'schedule-1',
            report_id: 'report-123',
            report_name: 'Monthly Sales Report',
            next_run: new Date('2023-02-01T09:00:00Z'),
            frequency: 'monthly',
          },
          {
            id: 'schedule-2',
            report_id: 'report-456',
            report_name: 'Weekly Analytics',
            next_run: new Date('2023-01-22T10:00:00Z'),
            frequency: 'weekly',
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.getPendingScheduledRuns();

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].nextRun).toBeDefined();
      expect(result[1].nextRun).toBeDefined();
    });
  });

  describe('Report Templates', () => {
    it('should create report template', async () => {
      // Arrange
      const templateData = {
        name: 'Sales Report Template',
        description: 'Template for sales performance reports',
        type: 'sales',
        category: 'business',
        query: 'SELECT * FROM sales WHERE date BETWEEN :startDate AND :endDate',
        parameters: [
          {
            name: 'startDate',
            type: 'date',
            required: true,
            description: 'Start date for report period',
          },
          {
            name: 'endDate',
            type: 'date',
            required: true,
            description: 'End date for report period',
          },
        ],
        filters: [
          {
            name: 'region',
            type: 'string',
            options: ['US', 'EU', 'APAC'],
            description: 'Filter by region',
          },
        ],
        visualization: {
          type: 'chart',
          chartType: 'line',
          xAxis: 'date',
          yAxis: 'amount',
        },
        metadata: {
          createdBy: 'admin-123',
          version: '1.0',
        },
      };

      const mockResult = {
        rows: [{
          id: 'template-123',
          name: 'Sales Report Template',
          description: 'Template for sales performance reports',
          type: 'sales',
          category: 'business',
          query: templateData.query,
          parameters: JSON.stringify(templateData.parameters),
          filters: JSON.stringify(templateData.filters),
          visualization: JSON.stringify(templateData.visualization),
          metadata: JSON.stringify(templateData.metadata),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.createTemplate(templateData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(templateData.name);
      expect(result.type).toBe(templateData.type);
      expect(result.query).toBe(templateData.query);
    });

    it('should get templates by type', async () => {
      // Arrange
      const type = 'sales';
      const mockResult = {
        rows: [
          {
            id: 'template-1',
            name: 'Sales Report Template',
            type: type,
            category: 'business',
            query: 'SELECT * FROM sales',
          },
          {
            id: 'template-2',
            name: 'Sales Summary Template',
            type: type,
            category: 'business',
            query: 'SELECT COUNT(*) FROM sales',
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.getTemplatesByType(type);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].type).toBe(type);
      expect(result[1].type).toBe(type);
    });

    it('should validate template parameters', async () => {
      // Arrange
      const templateId = 'template-123';
      const parameters = {
        startDate: '2023-01-01',
        endDate: '2023-01-31',
        region: 'US',
      };

      const mockResult = {
        rows: [{
          id: templateId,
          name: 'Sales Report Template',
          parameters: JSON.stringify([
            { name: 'startDate', type: 'date', required: true },
            { name: 'endDate', type: 'date', required: true },
            { name: 'region', type: 'string', required: false },
          ]),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.validateTemplateParameters(templateId, parameters);

      // Assert
      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
    });

    it('should reject invalid template parameters', async () => {
      // Arrange
      const templateId = 'template-123';
      const parameters = {
        startDate: 'invalid-date',
        endDate: '2023-01-31',
      };

      const mockResult = {
        rows: [{
          id: templateId,
          name: 'Sales Report Template',
          parameters: JSON.stringify([
            { name: 'startDate', type: 'date', required: true },
            { name: 'endDate', type: 'date', required: true },
          ]),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.validateTemplateParameters(templateId, parameters);

      // Assert
      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('Report Analytics', () => {
    it('should get report statistics', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [{
          total_reports: 50,
          reports_by_type: { sales: 15, analytics: 20, financial: 10, technical: 5 },
          reports_by_category: { business: 25, technical: 15, financial: 10 },
          reports_by_status: { active: 40, inactive: 8, archived: 2 },
          total_executions: 500,
          successful_executions: 480,
          failed_executions: 20,
          average_execution_time: 120000,
          total_scheduled_reports: 30,
          active_schedules: 25,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.getReportStats(timeRange);

      // Assert
      expect(result).toBeDefined();
      expect(result.totalReports).toBe(50);
      expect(result.reportsByType.sales).toBe(15);
      expect(result.successfulExecutions).toBe(480);
      expect(result.averageExecutionTime).toBe(120000);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should get popular reports', async () => {
      // Arrange
      const limit = 10;
      const mockResult = {
        rows: [
          { report_id: 'report-1', report_name: 'Monthly Sales Report', execution_count: 100, category: 'business' },
          { report_id: 'report-2', report_name: 'User Activity Report', execution_count: 85, category: 'technical' },
          { report_id: 'report-3', report_name: 'Financial Summary', execution_count: 70, category: 'financial' },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.getPopularReports(limit);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(3);
      expect(result[0].reportName).toBe('Monthly Sales Report');
      expect(result[0].executionCount).toBe(100);
    });

    it('should get execution trends', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [
          { date: '2023-01-01', total_executions: 25, successful: 24, failed: 1, average_duration: 115000 },
          { date: '2023-01-02', total_executions: 30, successful: 28, failed: 2, average_duration: 120000 },
          { date: '2023-01-03', total_executions: 20, successful: 20, failed: 0, average_duration: 110000 },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.getExecutionTrends(timeRange);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(3);
      expect(result[0].date).toBe('2023-01-01');
      expect(result[0].totalExecutions).toBe(25);
    });

    it('should get template usage statistics', async () => {
      // Arrange
      const mockResult = {
        rows: [
          { template_id: 'template-1', template_name: 'Sales Report Template', usage_count: 25, reports_count: 5 },
          { template_id: 'template-2', template_name: 'Analytics Template', usage_count: 20, reports_count: 4 },
          { template_id: 'template-3', template_name: 'Financial Template', usage_count: 15, reports_count: 3 },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.getTemplateUsageStats();

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(3);
      expect(result[0].templateName).toBe('Sales Report Template');
      expect(result[0].usageCount).toBe(25);
    });
  });

  describe('Validation', () => {
    it('should validate report data', async () => {
      // Arrange
      const invalidReportData = {
        name: '',
        description: '',
        type: '',
        category: '',
        template: '',
        parameters: null,
        filters: null,
      };

      // Act & Assert
      await expect(reportRepository.createReport(invalidReportData)).rejects.toThrow('Report name is required');
    });

    it('should validate report type', async () => {
      // Arrange
      const invalidReportData = {
        name: 'Test Report',
        description: 'Test description',
        type: 'invalid_type',
        category: 'test',
        template: 'test_template',
        parameters: {},
        filters: {},
      };

      // Act & Assert
      await expect(reportRepository.createReport(invalidReportData)).rejects.toThrow('Invalid report type');
    });

    it('should validate schedule frequency', async () => {
      // Arrange
      const reportId = 'report-123';
      const invalidScheduleConfig = {
        enabled: true,
        frequency: 'invalid_frequency',
        time: '09:00',
      };

      // Act & Assert
      await expect(reportRepository.scheduleReport(reportId, invalidScheduleConfig)).rejects.toThrow('Invalid schedule frequency');
    });
  });

  describe('Caching', () => {
    it('should cache report statistics', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [{
          total_reports: 50,
          reports_by_type: { sales: 15, analytics: 20 },
          successful_executions: 480,
          average_execution_time: 120000,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await reportRepository.getReportStats(timeRange);

      // Assert
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('reportStats'),
        expect.any(Object),
        expect.any(Number)
      );
    });

    it('should return cached report statistics', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const cachedStats = {
        totalReports: 50,
        reportsByType: { sales: 15, analytics: 20 },
        successfulExecutions: 480,
        averageExecutionTime: 120000,
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(cachedStats);

      // Act
      const result = await reportRepository.getReportStats(timeRange);

      // Assert
      expect(result).toEqual(cachedStats);
      expect(mockDbConnection.query).not.toHaveBeenCalled();
    });

    it('should clear cache on report update', async () => {
      // Arrange
      const reportId = 'report-123';
      const updates = { name: 'Updated Report' };
      const mockResult = {
        rows: [{
          id: reportId,
          name: 'Updated Report',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await reportRepository.updateReport(reportId, updates);

      // Assert
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        expect.stringContaining('reportStats')
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      const reportId = 'report-123';
      const dbError = new Error('Database connection failed');
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockRejectedValue(dbError);

      // Act & Assert
      await expect(reportRepository.findById(reportId)).rejects.toThrow('Database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({
          reportId,
          error: dbError.message,
        })
      );
    });

    it('should handle validation errors gracefully', async () => {
      // Arrange
      const invalidReportData = {
        name: '',
        description: '',
        type: '',
        category: '',
        template: '',
        parameters: null,
        filters: null,
      };

      // Act & Assert
      await expect(reportRepository.createReport(invalidReportData)).rejects.toThrow();
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
          id: `report-${i}`,
          name: `Report ${i}`,
          type: 'sales',
          category: 'business',
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        })),
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(largeResult);

      // Act
      const startTime = Date.now();
      const result = await reportRepository.getActiveReports();
      const endTime = Date.now();

      // Assert
      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should use parameterized queries for security', async () => {
      // Arrange
      const reportId = "report-123'; DROP TABLE reports; --";
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      await reportRepository.findById(reportId);

      // Assert
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM reports WHERE id = $1'),
        [reportId]
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values gracefully', async () => {
      // Arrange
      const reportId = 'report-123';
      const mockResult = {
        rows: [{
          id: reportId,
          name: 'Test Report',
          type: 'sales',
          category: 'business',
          parameters: null,
          filters: null,
          schedule: null,
          recipients: null,
          metadata: null,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await reportRepository.findById(reportId);

      // Assert
      expect(result).toBeDefined();
      expect(result.parameters).toBeNull();
      expect(result.filters).toBeNull();
      expect(result.schedule).toBeNull();
    });

    it('should handle empty result sets', async () => {
      // Arrange
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await reportRepository.findById('nonexistent');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle concurrent operations', async () => {
      // Arrange
      const reportId = 'report-123';
      const updates = { name: 'Concurrent Update' };
      const mockResult = {
        rows: [{
          id: reportId,
          name: 'Concurrent Update',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const promises = Array.from({ length: 10 }, () => 
        reportRepository.updateReport(reportId, updates)
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
