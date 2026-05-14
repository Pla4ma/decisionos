/**
 * AnalyticsRepository Tests
 * 
 * Comprehensive test suite for AnalyticsRepository functionality including
 * event tracking, metrics recording, dashboard management, and analytics queries.
 */

import { AnalyticsRepository } from '../repositories/AnalyticsRepository';
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

describe('AnalyticsRepository', () => {
  let analyticsRepository: AnalyticsRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    analyticsRepository = new AnalyticsRepository(mockDbConnection, mockCacheManager, mockLogger);
  });

  describe('Event Tracking', () => {
    it('should track analytics event', async () => {
      // Arrange
      const eventData = {
        eventType: 'page_view',
        eventName: 'homepage_visit',
        userId: 'user-123',
        sessionId: 'session-123',
        properties: {
          page: '/home',
          referrer: 'google',
          userAgent: 'Mozilla/5.0',
        },
        source: 'web',
      };

      const mockResult = {
        rows: [{
          id: 'event-123',
          event_type: 'page_view',
          event_name: 'homepage_visit',
          user_id: 'user-123',
          session_id: 'session-123',
          properties: JSON.stringify(eventData.properties),
          timestamp: new Date(),
          source: 'web',
          metadata: JSON.stringify({ source: 'analytics_repository' }),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await analyticsRepository.trackEvent(eventData);

      // Assert
      expect(result).toBeDefined();
      expect(result.eventType).toBe(eventData.eventType);
      expect(result.eventName).toBe(eventData.eventName);
      expect(result.userId).toBe(eventData.userId);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO analytics_events'),
        expect.arrayContaining([
          eventData.eventType,
          eventData.eventName,
          eventData.userId,
          eventData.sessionId,
          JSON.stringify(eventData.properties),
          eventData.source,
        ])
      );
    });

    it('should query events with filters', async () => {
      // Arrange
      const filters = {
        eventType: 'page_view',
        userId: 'user-123',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [{
          id: 'event-123',
          event_type: 'page_view',
          event_name: 'homepage_visit',
          user_id: 'user-123',
          properties: JSON.stringify({ page: '/home' }),
          timestamp: new Date(),
          source: 'web',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await analyticsRepository.queryEvents(filters);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].eventType).toBe(filters.eventType);
      expect(result[0].userId).toBe(filters.userId);
    });

    it('should get events by user', async () => {
      // Arrange
      const userId = 'user-123';
      const options = {
        limit: 100,
        offset: 0,
        eventType: 'page_view',
      };

      const mockResult = {
        rows: [{
          id: 'event-123',
          event_type: 'page_view',
          event_name: 'homepage_visit',
          user_id: userId,
          properties: JSON.stringify({ page: '/home' }),
          timestamp: new Date(),
          source: 'web',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await analyticsRepository.getEventsByUser(userId, options);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].userId).toBe(userId);
    });

    it('should get events by session', async () => {
      // Arrange
      const sessionId = 'session-123';
      const mockResult = {
        rows: [{
          id: 'event-123',
          event_type: 'page_view',
          event_name: 'homepage_visit',
          session_id: sessionId,
          properties: JSON.stringify({ page: '/home' }),
          timestamp: new Date(),
          source: 'web',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await analyticsRepository.getEventsBySession(sessionId);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].sessionId).toBe(sessionId);
    });
  });

  describe('Metrics Management', () => {
    it('should record metric', async () => {
      // Arrange
      const metricData = {
        name: 'page_views',
        value: 100,
        type: 'counter',
        tags: {
          page: '/home',
          source: 'web',
        },
        timestamp: new Date(),
      };

      const mockResult = {
        rows: [{
          id: 'metric-123',
          name: 'page_views',
          value: 100,
          type: 'counter',
          tags: JSON.stringify(metricData.tags),
          timestamp: new Date(),
          metadata: JSON.stringify({ source: 'analytics_repository' }),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await analyticsRepository.recordMetric(metricData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(metricData.name);
      expect(result.value).toBe(metricData.value);
      expect(result.type).toBe(metricData.type);
    });

    it('should get metrics with filters', async () => {
      // Arrange
      const filters = {
        name: 'page_views',
        type: 'counter',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [{
          id: 'metric-123',
          name: 'page_views',
          value: 100,
          type: 'counter',
          tags: JSON.stringify({ page: '/home' }),
          timestamp: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await analyticsRepository.getMetrics(filters);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe(filters.name);
      expect(result[0].type).toBe(filters.type);
    });

    it('should aggregate metrics', async () => {
      // Arrange
      const metricName = 'page_views';
      const aggregation = 'sum';
      const filters = {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
        groupBy: ['page'],
      };

      const mockResult = {
        rows: [{
          metric_name: 'page_views',
          aggregation: 'sum',
          value: 1000,
          tags: JSON.stringify({ page: '/home' }),
          timestamp: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await analyticsRepository.aggregateMetrics(metricName, aggregation, filters);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBe(1000);
    });

    it('should get metric statistics', async () => {
      // Arrange
      const metricName = 'page_views';
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [{
          metric_name: 'page_views',
          count: 100,
          sum: 10000,
          average: 100,
          min: 1,
          max: 500,
          latest: 150,
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await analyticsRepository.getMetricStats(metricName, timeRange);

      // Assert
      expect(result).toBeDefined();
      expect(result.count).toBe(100);
      expect(result.sum).toBe(10000);
      expect(result.average).toBe(100);
    });
  });

  describe('Dashboard Management', () => {
    it('should create dashboard', async () => {
      // Arrange
      const dashboardData = {
        name: 'Analytics Dashboard',
        description: 'Main analytics dashboard',
        widgets: [
          {
            id: 'widget-1',
            type: 'line_chart',
            title: 'Page Views Over Time',
            position: { x: 0, y: 0, width: 6, height: 4 },
            config: {
              metric: 'page_views',
              timeRange: '7d',
            },
          },
        ],
        layout: {
          columns: 12,
          rowHeight: 100,
        },
        isPublic: false,
        tags: ['analytics', 'main'],
      };

      const mockResult = {
        rows: [{
          id: 'dashboard-123',
          name: 'Analytics Dashboard',
          description: 'Main analytics dashboard',
          widgets: JSON.stringify(dashboardData.widgets),
          layout: JSON.stringify(dashboardData.layout),
          is_public: false,
          tags: JSON.stringify(dashboardData.tags),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await analyticsRepository.createDashboard(dashboardData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(dashboardData.name);
      expect(result.description).toBe(dashboardData.description);
      expect(result.widgets).toHaveLength(1);
    });

    it('should get dashboard by ID', async () => {
      // Arrange
      const dashboardId = 'dashboard-123';
      const mockResult = {
        rows: [{
          id: dashboardId,
          name: 'Analytics Dashboard',
          description: 'Main analytics dashboard',
          widgets: JSON.stringify([{
            id: 'widget-1',
            type: 'line_chart',
            title: 'Page Views Over Time',
          }]),
          layout: JSON.stringify({ columns: 12, rowHeight: 100 }),
          is_public: false,
          tags: JSON.stringify(['analytics', 'main']),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await analyticsRepository.getDashboard(dashboardId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(dashboardId);
      expect(result.name).toBe('Analytics Dashboard');
      expect(result.widgets).toHaveLength(1);
    });

    it('should update dashboard', async () => {
      // Arrange
      const dashboardId = 'dashboard-123';
      const updates = {
        name: 'Updated Analytics Dashboard',
        description: 'Updated description',
        widgets: [
          {
            id: 'widget-1',
            type: 'bar_chart',
            title: 'Updated Widget',
          },
        ],
      };

      const mockResult = {
        rows: [{
          id: dashboardId,
          name: 'Updated Analytics Dashboard',
          description: 'Updated description',
          widgets: JSON.stringify(updates.widgets),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await analyticsRepository.updateDashboard(dashboardId, updates);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(updates.name);
      expect(result.description).toBe(updates.description);
    });

    it('should delete dashboard', async () => {
      // Arrange
      const dashboardId = 'dashboard-123';
      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      const result = await analyticsRepository.deleteDashboard(dashboardId);

      // Assert
      expect(result).toBe(true);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        'DELETE FROM analytics_dashboards WHERE id = $1',
        [dashboardId]
      );
    });

    it('should list dashboards', async () => {
      // Arrange
      const filters = {
        isPublic: true,
        tags: ['analytics'],
      };

      const mockResult = {
        rows: [{
          id: 'dashboard-123',
          name: 'Public Analytics Dashboard',
          description: 'Public dashboard',
          is_public: true,
          tags: JSON.stringify(['analytics', 'public']),
          created_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await analyticsRepository.listDashboards(filters);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].isPublic).toBe(true);
    });
  });

  describe('Analytics Queries', () => {
    it('should get funnel analysis', async () => {
      // Arrange
      const funnelSteps = [
        { name: 'visit', event: 'page_view', properties: { page: '/home' } },
        { name: 'signup', event: 'user_action', properties: { action: 'signup' } },
        { name: 'purchase', event: 'business_event', properties: { type: 'purchase' } },
      ];

      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [
          { step: 'visit', count: 10000, percentage: 100 },
          { step: 'signup', count: 1000, percentage: 10 },
          { step: 'purchase', count: 100, percentage: 1 },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await analyticsRepository.getFunnelAnalysis(funnelSteps, timeRange);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(3);
      expect(result[0].step).toBe('visit');
      expect(result[0].count).toBe(10000);
      expect(result[0].percentage).toBe(100);
    });

    it('should get cohort analysis', async () => {
      // Arrange
      const cohortType = 'signup';
      const metric = 'retention';
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [
          { cohort: '2023-01-01', period_0: 100, period_1: 80, period_2: 60, period_3: 40 },
          { cohort: '2023-01-08', period_0: 120, period_1: 90, period_2: 70, period_3: 50 },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await analyticsRepository.getCohortAnalysis(cohortType, metric, timeRange);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].cohort).toBe('2023-01-01');
      expect(result[0].period_0).toBe(100);
    });

    it('should get user segmentation', async () => {
      // Arrange
      const segmentation = {
        type: 'behavior',
        criteria: {
          pageViews: { min: 10, max: 100 },
          sessions: { min: 1, max: 10 },
        },
      };

      const mockResult = {
        rows: [
          { segment: 'low_activity', count: 1000, percentage: 20 },
          { segment: 'medium_activity', count: 3000, percentage: 60 },
          { segment: 'high_activity', count: 1000, percentage: 20 },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await analyticsRepository.getUserSegmentation(segmentation);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(3);
      expect(result[0].segment).toBe('low_activity');
      expect(result[0].count).toBe(1000);
    });

    it('should get real-time analytics', async () => {
      // Arrange
      const metrics = ['page_views', 'active_users', 'conversion_rate'];
      const mockResult = {
        rows: [
          { metric: 'page_views', value: 1500, timestamp: new Date() },
          { metric: 'active_users', value: 250, timestamp: new Date() },
          { metric: 'conversion_rate', value: 0.05, timestamp: new Date() },
        ],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await analyticsRepository.getRealTimeAnalytics(metrics);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(3);
      expect(result[0].metric).toBe('page_views');
      expect(result[0].value).toBe(1500);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });
  });

  describe('Reports and Exports', () => {
    it('should generate analytics report', async () => {
      // Arrange
      const reportConfig = {
        type: 'summary',
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
        metrics: ['page_views', 'unique_visitors', 'conversion_rate'],
        dimensions: ['page', 'source'],
        format: 'json',
      };

      const mockResult = {
        rows: [{
          id: 'report-123',
          type: 'summary',
          config: JSON.stringify(reportConfig),
          data: JSON.stringify({
            page_views: 100000,
            unique_visitors: 50000,
            conversion_rate: 0.05,
          }),
          generated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await analyticsRepository.generateReport(reportConfig);

      // Assert
      expect(result).toBeDefined();
      expect(result.type).toBe(reportConfig.type);
      expect(result.data).toBeDefined();
    });

    it('should export analytics data', async () => {
      // Arrange
      const exportConfig = {
        data: 'events',
        format: 'csv',
        filters: {
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-01-31'),
          eventType: 'page_view',
        },
        fields: ['timestamp', 'user_id', 'event_name', 'properties'],
      };

      const mockResult = {
        rows: [
          { timestamp: '2023-01-01T00:00:00Z', user_id: 'user-1', event_name: 'page_view', properties: '{"page":"/home"}' },
          { timestamp: '2023-01-01T00:01:00Z', user_id: 'user-2', event_name: 'page_view', properties: '{"page":"/about"}' },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await analyticsRepository.exportData(exportConfig);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].event_name).toBe('page_view');
    });
  });

  describe('Validation', () => {
    it('should validate event data', async () => {
      // Arrange
      const invalidEventData = {
        eventType: '',
        eventName: '',
        userId: '',
        properties: null,
        source: '',
      };

      // Act & Assert
      await expect(analyticsRepository.trackEvent(invalidEventData)).rejects.toThrow('Event type is required');
    });

    it('should validate metric data', async () => {
      // Arrange
      const invalidMetricData = {
        name: '',
        value: null,
        type: '',
        tags: null,
      };

      // Act & Assert
      await expect(analyticsRepository.recordMetric(invalidMetricData)).rejects.toThrow('Metric name is required');
    });

    it('should validate dashboard data', async () => {
      // Arrange
      const invalidDashboardData = {
        name: '',
        widgets: [],
        layout: null,
        isPublic: null,
      };

      // Act & Assert
      await expect(analyticsRepository.createDashboard(invalidDashboardData)).rejects.toThrow('Dashboard name is required');
    });
  });

  describe('Caching', () => {
    it('should cache real-time analytics', async () => {
      // Arrange
      const metrics = ['page_views', 'active_users'];
      const mockResult = {
        rows: [
          { metric: 'page_views', value: 1500, timestamp: new Date() },
          { metric: 'active_users', value: 250, timestamp: new Date() },
        ],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await analyticsRepository.getRealTimeAnalytics(metrics);

      // Assert
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('realTimeAnalytics'),
        expect.any(Array),
        expect.any(Number)
      );
    });

    it('should return cached real-time analytics', async () => {
      // Arrange
      const metrics = ['page_views', 'active_users'];
      const cachedData = [
        { metric: 'page_views', value: 1500, timestamp: new Date() },
        { metric: 'active_users', value: 250, timestamp: new Date() },
      ];

      mockCacheManager.get = jest.fn().mockResolvedValue(cachedData);

      // Act
      const result = await analyticsRepository.getRealTimeAnalytics(metrics);

      // Assert
      expect(result).toEqual(cachedData);
      expect(mockDbConnection.query).not.toHaveBeenCalled();
    });

    it('should clear cache on dashboard update', async () => {
      // Arrange
      const dashboardId = 'dashboard-123';
      const updates = { name: 'Updated Dashboard' };
      const mockResult = {
        rows: [{
          id: dashboardId,
          name: 'Updated Dashboard',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await analyticsRepository.updateDashboard(dashboardId, updates);

      // Assert
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        expect.stringContaining('dashboard'),
        dashboardId
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      const eventData = {
        eventType: 'page_view',
        eventName: 'homepage_visit',
        userId: 'user-123',
        properties: { page: '/home' },
        source: 'web',
      };

      const dbError = new Error('Database connection failed');
      mockDbConnection.query = jest.fn().mockRejectedValue(dbError);

      // Act & Assert
      await expect(analyticsRepository.trackEvent(eventData)).rejects.toThrow('Database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({
          error: dbError.message,
        })
      );
    });

    it('should handle validation errors gracefully', async () => {
      // Arrange
      const invalidEventData = {
        eventType: '',
        eventName: '',
        userId: '',
        properties: null,
        source: '',
      };

      // Act & Assert
      await expect(analyticsRepository.trackEvent(invalidEventData)).rejects.toThrow();
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
        rows: Array.from({ length: 10000 }, (_, i) => ({
          id: `event-${i}`,
          event_type: 'page_view',
          event_name: 'page_view',
          user_id: `user-${i % 1000}`,
          properties: JSON.stringify({ page: `/page-${i % 10}` }),
          timestamp: new Date(),
          source: 'web',
        })),
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(largeResult);

      // Act
      const startTime = Date.now();
      const result = await analyticsRepository.queryEvents({
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
      });
      const endTime = Date.now();

      // Assert
      expect(result).toHaveLength(10000);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should use parameterized queries for security', async () => {
      // Arrange
      const userId = "user-123'; DROP TABLE analytics_events; --";
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      await analyticsRepository.getEventsByUser(userId);

      // Assert
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1'),
        expect.arrayContaining([userId])
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null properties gracefully', async () => {
      // Arrange
      const eventData = {
        eventType: 'page_view',
        eventName: 'homepage_visit',
        userId: 'user-123',
        properties: null,
        source: 'web',
      };

      const mockResult = {
        rows: [{
          id: 'event-123',
          event_type: 'page_view',
          event_name: 'homepage_visit',
          user_id: 'user-123',
          properties: null,
          timestamp: new Date(),
          source: 'web',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await analyticsRepository.trackEvent(eventData);

      // Assert
      expect(result).toBeDefined();
      expect(result.properties).toBeNull();
    });

    it('should handle empty result sets', async () => {
      // Arrange
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await analyticsRepository.queryEvents({
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-01'), // Same day, no events
      });

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should handle concurrent operations', async () => {
      // Arrange
      const eventData = {
        eventType: 'page_view',
        eventName: 'homepage_visit',
        userId: 'user-123',
        properties: { page: '/home' },
        source: 'web',
      };

      const mockResult = {
        rows: [{
          id: 'event-123',
          event_type: 'page_view',
          event_name: 'homepage_visit',
          user_id: 'user-123',
          properties: JSON.stringify(eventData.properties),
          timestamp: new Date(),
          source: 'web',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const promises = Array.from({ length: 100 }, () => 
        analyticsRepository.trackEvent(eventData)
      );
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(100);
      results.forEach(result => {
        expect(result.eventType).toBe(eventData.eventType);
      });
    });
  });
});
