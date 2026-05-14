/**
 * RepositoryAnalytics Tests
 * 
 * Comprehensive test suite for RepositoryAnalytics functionality including
 * data analytics, business intelligence, reporting, and insights generation.
 */

import { RepositoryAnalytics } from '../repositories/RepositoryAnalytics';
import { Logger } from '../logging/Logger';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

describe('RepositoryAnalytics', () => {
  let repositoryAnalytics: RepositoryAnalytics;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryAnalytics = new RepositoryAnalytics(mockLogger);
  });

  describe('Data Analytics', () => {
    it('should perform repository data analysis', async () => {
      // Arrange
      const analysisConfig = {
        repository: 'UserRepository',
        analysisType: 'user_behavior',
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
        dimensions: ['user_type', 'region', 'device_type'],
        metrics: ['session_count', 'page_views', 'conversion_rate'],
        filters: {
          user_type: ['premium', 'free'],
          region: ['us-east', 'us-west', 'eu-west'],
        },
      };

      // Act
      const analysis = await repositoryAnalytics.performDataAnalysis(analysisConfig);

      // Assert
      expect(analysis).toBeDefined();
      expect(analysis.repository).toBe('UserRepository');
      expect(analysis.analysisType).toBe('user_behavior');
      expect(analysis.dimensions).toEqual(['user_type', 'region', 'device_type']);
      expect(analysis.metrics).toEqual(['session_count', 'page_views', 'conversion_rate']);
      expect(analysis.results).toBeDefined();
      expect(analysis.summary).toBeDefined();
    });

    it('should generate user segmentation analysis', async () => {
      // Arrange
      const segmentationConfig = {
        repository: 'UserRepository',
        segmentationType: 'rfm', // Recency, Frequency, Monetary
        timeRange: {
          start: new Date('2023-01-01T00:00:00Z'),
          end: new Date('2023-01-31T23:59:59Z'),
        },
        segments: [
          { name: 'champions', criteria: { recency: 'high', frequency: 'high', monetary: 'high' } },
          { name: 'loyal_customers', criteria: { recency: 'medium', frequency: 'high', monetary: 'medium' } },
          { name: 'at_risk', criteria: { recency: 'low', frequency: 'medium', monetary: 'medium' } },
          { name: 'lost', criteria: { recency: 'very_low', frequency: 'low', monetary: 'low' } },
        ],
        metrics: ['user_count', 'avg_order_value', 'lifetime_value'],
      };

      // Act
      const segmentation = await repositoryAnalytics.generateUserSegmentation(segmentationConfig);

      // Assert
      expect(segmentation).toBeDefined();
      expect(segmentation.repository).toBe('UserRepository');
      expect(segmentation.segmentationType).toBe('rfm');
      expect(segmentation.segments).toHaveLength(4);
      expect(segmentation.results).toBeDefined();
      expect(segmentation.insights).toBeDefined();
    });

    it('should perform cohort analysis', async () => {
      // Arrange
      const cohortConfig = {
        repository: 'UserRepository',
        cohortType: 'registration',
        timeRange: {
          start: new Date('2023-01-01T00:00:00Z'),
          end: new Date('2023-03-31T23:59:59Z'),
        },
        cohortPeriod: 'weekly',
        analysisPeriods: 12, // 12 weeks analysis
        metrics: ['retention_rate', 'churn_rate', 'engagement_score'],
        dimensions: ['acquisition_channel', 'user_type'],
      };

      // Act
      const cohort = await repositoryAnalytics.performCohortAnalysis(cohortConfig);

      // Assert
      expect(cohort).toBeDefined();
      expect(cohort.repository).toBe('UserRepository');
      expect(cohort.cohortType).toBe('registration');
      expect(cohort.cohortPeriod).toBe('weekly');
      expect(cohort.analysisPeriods).toBe(12);
      expect(cohort.matrix).toBeDefined();
      expect(cohort.summary).toBeDefined();
    });

    it('should generate funnel analysis', async () => {
      // Arrange
      const funnelConfig = {
        repository: 'OrderRepository',
        funnelType: 'purchase',
        steps: [
          { name: 'product_view', event: 'product_viewed' },
          { name: 'add_to_cart', event: 'product_added_to_cart' },
          { name: 'checkout_start', event: 'checkout_started' },
          { name: 'payment', event: 'payment_completed' },
        ],
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
        dimensions: ['device_type', 'traffic_source'],
        metrics: ['conversion_rate', 'dropoff_rate', 'time_to_convert'],
      };

      // Act
      const funnel = await repositoryAnalytics.generateFunnelAnalysis(funnelConfig);

      // Assert
      expect(funnel).toBeDefined();
      expect(funnel.repository).toBe('OrderRepository');
      expect(funnel.funnelType).toBe('purchase');
      expect(funnel.steps).toHaveLength(4);
      expect(funnel.results).toBeDefined();
      expect(funnel.conversionRates).toBeDefined();
    });
  });

  describe('Business Intelligence', () => {
    it('should generate KPI dashboard', async () => {
      // Arrange
      const kpiConfig = {
        repository: 'UserRepository',
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
        kpis: [
          {
            name: 'daily_active_users',
            type: 'count',
            metric: 'active_users',
            target: 10000,
          },
          {
            name: 'user_retention',
            type: 'percentage',
            metric: 'retention_rate',
            target: 0.85,
          },
          {
            name: 'avg_session_duration',
            type: 'duration',
            metric: 'session_duration',
            target: 1800, // 30 minutes
          },
        ],
        comparisons: ['previous_day', 'previous_week', 'previous_month'],
      };

      // Act
      const dashboard = await repositoryAnalytics.generateKPIDashboard(kpiConfig);

      // Assert
      expect(dashboard).toBeDefined();
      expect(dashboard.repository).toBe('UserRepository');
      expect(dashboard.kpis).toHaveLength(3);
      expect(dashboard.comparisons).toEqual(['previous_day', 'previous_week', 'previous_month']);
      expect(dashboard.results).toBeDefined();
      expect(dashboard.achievements).toBeDefined();
    });

    it('should perform trend analysis', async () => {
      // Arrange
      const trendConfig = {
        repository: 'ProductRepository',
        metrics: ['sales_volume', 'revenue', 'profit_margin'],
        timeRange: {
          start: new Date('2023-01-01T00:00:00Z'),
          end: new Date('2023-01-31T23:59:59Z'),
        },
        granularity: 'daily',
        trendAnalysis: {
          method: 'linear_regression',
          confidence: 0.95,
          seasonality: true,
        },
        dimensions: ['category', 'region'],
      };

      // Act
      const trends = await repositoryAnalytics.performTrendAnalysis(trendConfig);

      // Assert
      expect(trends).toBeDefined();
      expect(trends.repository).toBe('ProductRepository');
      expect(trends.metrics).toEqual(['sales_volume', 'revenue', 'profit_margin']);
      expect(trends.granularity).toBe('daily');
      expect(trends.trendAnalysis.method).toBe('linear_regression');
      expect(trends.results).toBeDefined();
      expect(trends.forecasts).toBeDefined();
    });

    it('should generate comparative analysis', async () => {
      // Arrange
      const comparisonConfig = {
        repositories: ['UserRepository', 'ProductRepository', 'OrderRepository'],
        metrics: ['growth_rate', 'efficiency', 'satisfaction'],
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
        comparisonType: 'period_over_period',
        periods: ['current', 'previous'],
        dimensions: ['region', 'segment'],
      };

      // Act
      const comparison = await repositoryAnalytics.generateComparativeAnalysis(comparisonConfig);

      // Assert
      expect(comparison).toBeDefined();
      expect(comparison.repositories).toEqual(['UserRepository', 'ProductRepository', 'OrderRepository']);
      expect(comparison.metrics).toEqual(['growth_rate', 'efficiency', 'satisfaction']);
      expect(comparison.comparisonType).toBe('period_over_period');
      expect(comparison.results).toBeDefined();
      expect(comparison.insights).toBeDefined();
    });

    it('should perform predictive analytics', async () => {
      // Arrange
      const predictiveConfig = {
        repository: 'OrderRepository',
        predictionType: 'sales_forecast',
        target: 'revenue',
        features: ['historical_sales', 'seasonality', 'marketing_spend', 'economic_indicators'],
        model: 'random_forest',
        timeRange: {
          training: {
            start: new Date('2022-01-01T00:00:00Z'),
            end: new Date('2022-12-31T23:59:59Z'),
          },
          prediction: {
            start: new Date('2023-01-01T00:00:00Z'),
            end: new Date('2023-03-31T23:59:59Z'),
          },
        },
        validation: {
          method: 'time_series_split',
          test_size: 0.2,
        },
      };

      // Act
      const prediction = await repositoryAnalytics.performPredictiveAnalytics(predictiveConfig);

      // Assert
      expect(prediction).toBeDefined();
      expect(prediction.repository).toBe('OrderRepository');
      expect(prediction.predictionType).toBe('sales_forecast');
      expect(prediction.target).toBe('revenue');
      expect(prediction.model).toBe('random_forest');
      expect(prediction.results).toBeDefined();
      expect(prediction.accuracy).toBeDefined();
    });
  });

  describe('Reporting', () => {
    it('should generate comprehensive report', async () => {
      // Arrange
      const reportConfig = {
        repository: 'UserRepository',
        reportType: 'monthly_performance',
        timeRange: {
          start: new Date('2023-01-01T00:00:00Z'),
          end: new Date('2023-01-31T23:59:59Z'),
        },
        sections: [
          { name: 'executive_summary', type: 'summary' },
          { name: 'user_metrics', type: 'kpi' },
          { name: 'usage_analytics', type: 'analytics' },
          { name: 'trends', type: 'trend' },
          { name: 'recommendations', type: 'insights' },
        ],
        format: 'detailed',
        includeCharts: true,
        includeRawData: false,
      };

      // Act
      const report = await repositoryAnalytics.generateReport(reportConfig);

      // Assert
      expect(report).toBeDefined();
      expect(report.repository).toBe('UserRepository');
      expect(report.reportType).toBe('monthly_performance');
      expect(report.sections).toHaveLength(5);
      expect(report.format).toBe('detailed');
      expect(report.includeCharts).toBe(true);
      expect(report.content).toBeDefined();
    });

    it('should generate executive summary', async () => {
      // Arrange
      const summaryConfig = {
        repositories: ['UserRepository', 'ProductRepository', 'OrderRepository'],
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
        keyMetrics: [
          'total_users',
          'active_users',
          'revenue',
          'orders',
          'conversion_rate',
        ],
        highlights: ['growth', 'challenges', 'opportunities'],
        format: 'executive',
      };

      // Act
      const summary = await repositoryAnalytics.generateExecutiveSummary(summaryConfig);

      // Assert
      expect(summary).toBeDefined();
      expect(summary.repositories).toEqual(['UserRepository', 'ProductRepository', 'OrderRepository']);
      expect(summary.keyMetrics).toEqual(['total_users', 'active_users', 'revenue', 'orders', 'conversion_rate']);
      expect(summary.highlights).toEqual(['growth', 'challenges', 'opportunities']);
      expect(summary.format).toBe('executive');
      expect(summary.content).toBeDefined();
    });

    it('should export reports in different formats', async () => {
      // Arrange
      const exportConfig = {
        reportId: 'report-123',
        formats: ['pdf', 'excel', 'csv'],
        includeCharts: true,
        includeRawData: true,
        compression: true,
        delivery: {
          email: 'stakeholders@example.com',
          ftp: 'ftp://reports.example.com',
        },
      };

      // Act
      const exported = await repositoryAnalytics.exportReport(exportConfig);

      // Assert
      expect(exported).toBeDefined();
      expect(exported.reportId).toBe('report-123');
      expect(exported.formats).toEqual(['pdf', 'excel', 'csv']);
      expect(exported.includeCharts).toBe(true);
      expect(exported.includeRawData).toBe(true);
      expect(exported.compression).toBe(true);
      expect(exported.files).toBeDefined();
    });

    it('should schedule automated reports', () => {
      // Arrange
      const scheduleConfig = {
        name: 'weekly_performance_report',
        reportType: 'weekly_performance',
        repositories: ['UserRepository', 'ProductRepository'],
        schedule: {
          frequency: 'weekly',
          day: 'monday',
          time: '09:00',
          timezone: 'UTC',
        },
        delivery: {
          email: ['team@example.com', 'management@example.com'],
          slack: '#reports',
        },
        enabled: true,
      };

      // Act
      const schedule = repositoryAnalytics.scheduleReport(scheduleConfig);

      // Assert
      expect(schedule).toBeDefined();
      expect(schedule.name).toBe('weekly_performance_report');
      expect(schedule.reportType).toBe('weekly_performance');
      expect(schedule.schedule.frequency).toBe('weekly');
      expect(schedule.schedule.day).toBe('monday');
      expect(schedule.schedule.time).toBe('09:00');
      expect(schedule.enabled).toBe(true);
      expect(schedule.nextRun).toBeDefined();
    });
  });

  describe('Insights Generation', () => {
    it('should generate business insights', async () => {
      // Arrange
      const insightsConfig = {
        repository: 'UserRepository',
        insightType: 'behavioral',
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
        focusAreas: [
          'user_engagement',
          'retention_patterns',
          'conversion_optimization',
        ],
        analysisDepth: 'deep',
        includeRecommendations: true,
      };

      // Act
      const insights = await repositoryAnalytics.generateBusinessInsights(insightsConfig);

      // Assert
      expect(insights).toBeDefined();
      expect(insights.repository).toBe('UserRepository');
      expect(insights.insightType).toBe('behavioral');
      expect(insights.focusAreas).toEqual(['user_engagement', 'retention_patterns', 'conversion_optimization']);
      expect(insights.analysisDepth).toBe('deep');
      expect(insights.includeRecommendations).toBe(true);
      expect(insights.findings).toBeDefined();
      expect(insights.recommendations).toBeDefined();
    });

    it('should identify opportunities and risks', async () => {
      // Arrange
      const opportunityConfig = {
        repository: 'ProductRepository',
        analysisType: 'opportunity_risk',
        timeRange: {
          start: new Date('2023-01-01T00:00:00Z'),
          end: new Date('2023-01-31T23:59:59Z'),
        },
        criteria: {
          opportunities: {
            growth_potential: { threshold: 0.2, metric: 'growth_rate' },
            market_gap: { threshold: 0.15, metric: 'market_penetration' },
            efficiency_gain: { threshold: 0.1, metric: 'efficiency_score' },
          },
          risks: {
            churn_risk: { threshold: 0.1, metric: 'churn_rate' },
            performance_degradation: { threshold: -0.05, metric: 'performance_trend' },
            cost_increase: { threshold: 0.15, metric: 'cost_trend' },
          },
        },
      };

      // Act
      const analysis = await repositoryAnalytics.identifyOpportunitiesAndRisks(opportunityConfig);

      // Assert
      expect(analysis).toBeDefined();
      expect(analysis.repository).toBe('ProductRepository');
      expect(analysis.analysisType).toBe('opportunity_risk');
      expect(analysis.opportunities).toBeDefined();
      expect(analysis.risks).toBeDefined();
      expect(analysis.prioritization).toBeDefined();
    });

    it('should generate actionable recommendations', async () => {
      // Arrange
      const recommendationConfig = {
        repository: 'OrderRepository',
        recommendationType: 'performance_optimization',
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
        focusAreas: [
          'process_efficiency',
          'cost_reduction',
          'customer_satisfaction',
        ],
        impactAssessment: true,
        feasibilityAnalysis: true,
        priorityScoring: true,
      };

      // Act
      const recommendations = await repositoryAnalytics.generateRecommendations(recommendationConfig);

      // Assert
      expect(recommendations).toBeDefined();
      expect(recommendations.repository).toBe('OrderRepository');
      expect(recommendations.recommendationType).toBe('performance_optimization');
      expect(recommendations.focusAreas).toEqual(['process_efficiency', 'cost_reduction', 'customer_satisfaction']);
      expect(recommendations.impactAssessment).toBe(true);
      expect(recommendations.feasibilityAnalysis).toBe(true);
      expect(recommendations.priorityScoring).toBe(true);
      expect(recommendations.items).toBeDefined();
    });

    it('should perform root cause analysis', async () => {
      // Arrange
      const rootCauseConfig = {
        repository: 'UserRepository',
        issue: 'increased_churn_rate',
        timeRange: {
          start: new Date('2023-01-01T00:00:00Z'),
          end: new Date('2023-01-31T23:59:59Z'),
        },
        analysisMethod: 'fishbone',
        factors: [
          'user_experience',
          'product_features',
          'pricing',
          'competition',
          'support_quality',
        },
        dataSources: ['user_feedback', 'usage_logs', 'support_tickets', 'surveys'],
      };

      // Act
      const analysis = await repositoryAnalytics.performRootCauseAnalysis(rootCauseConfig);

      // Assert
      expect(analysis).toBeDefined();
      expect(analysis.repository).toBe('UserRepository');
      expect(analysis.issue).toBe('increased_churn_rate');
      expect(analysis.analysisMethod).toBe('fishbone');
      expect(analysis.factors).toEqual(['user_experience', 'product_features', 'pricing', 'competition', 'support_quality']);
      expect(analysis.rootCauses).toBeDefined();
      expect(analysis.impactAssessment).toBeDefined();
    });
  });

  describe('Data Visualization', () => {
    it('should create interactive dashboards', async () => {
      // Arrange
      const dashboardConfig = {
        name: 'Business Intelligence Dashboard',
        repositories: ['UserRepository', 'ProductRepository', 'OrderRepository'],
        widgets: [
          {
            type: 'chart',
            title: 'User Growth',
            chartType: 'line',
            metric: 'user_count',
            timeRange: '30d',
          },
          {
            type: 'metric',
            title: 'Total Revenue',
            metric: 'revenue',
            comparison: 'previous_period',
          },
          {
            type: 'table',
            title: 'Top Products',
            metric: 'product_performance',
            limit: 10,
          },
          {
            type: 'map',
            title: 'Geographic Distribution',
            metric: 'user_locations',
          },
        ],
        layout: 'grid',
        refreshInterval: 300000, // 5 minutes
        interactivity: {
          enabled: true,
          filters: ['date_range', 'region', 'segment'],
          drilldown: true,
        },
      };

      // Act
      const dashboard = await repositoryAnalytics.createDashboard(dashboardConfig);

      // Assert
      expect(dashboard).toBeDefined();
      expect(dashboard.name).toBe('Business Intelligence Dashboard');
      expect(dashboard.repositories).toEqual(['UserRepository', 'ProductRepository', 'OrderRepository']);
      expect(dashboard.widgets).toHaveLength(4);
      expect(dashboard.layout).toBe('grid');
      expect(dashboard.refreshInterval).toBe(300000);
      expect(dashboard.interactivity.enabled).toBe(true);
    });

    it('should generate chart configurations', async () => {
      // Arrange
      const chartConfig = {
        type: 'multi_series_line',
        title: 'Revenue Trends by Category',
        repository: 'ProductRepository',
        metrics: ['revenue', 'profit'],
        dimensions: ['category'],
        timeRange: {
          start: new Date('2023-01-01T00:00:00Z'),
          end: new Date('2023-01-31T23:59:59Z'),
        },
        styling: {
          colors: ['#1f77b4', '#ff7f0e', '#2ca02c'],
          lineWidth: 2,
          showLegend: true,
        },
        interactions: {
          tooltip: true,
          zoom: true,
          crosshair: true,
        },
      };

      // Act
      const chart = await repositoryAnalytics.generateChartConfiguration(chartConfig);

      // Assert
      expect(chart).toBeDefined();
      expect(chart.type).toBe('multi_series_line');
      expect(chart.title).toBe('Revenue Trends by Category');
      expect(chart.repository).toBe('ProductRepository');
      expect(chart.metrics).toEqual(['revenue', 'profit']);
      expect(chart.dimensions).toEqual(['category']);
      expect(chart.styling).toBeDefined();
      expect(chart.interactions).toBeDefined();
    });

    it('should export visualizations', async () => {
      // Arrange
      const exportConfig = {
        dashboardId: 'dashboard-123',
        formats: ['png', 'svg', 'pdf'],
        quality: 'high',
        size: { width: 1920, height: 1080 },
        includeData: false,
        delivery: {
          email: 'reports@example.com',
          storage: 's3://analytics-exports/',
        },
      };

      // Act
      const exported = await repositoryAnalytics.exportVisualizations(exportConfig);

      // Assert
      expect(exported).toBeDefined();
      expect(exported.dashboardId).toBe('dashboard-123');
      expect(exported.formats).toEqual(['png', 'svg', 'pdf']);
      expect(exported.quality).toBe('high');
      expect(exported.size).toEqual({ width: 1920, height: 1080 });
      expect(exported.files).toBeDefined();
    });
  });

  describe('Analytics Configuration', () => {
    it('should configure analytics settings', () => {
      // Arrange
      const settings = {
        enabled: true,
        dataRetention: 365, // days
        sampling: {
          enabled: true,
          rate: 0.1, // 10% sampling
        },
        caching: {
          enabled: true,
          ttl: 3600, // 1 hour
        },
        performance: {
          maxQueryTime: 30000, // 30 seconds
          maxMemoryUsage: 1024 * 1024 * 1024, // 1GB
        },
      };

      // Act
      repositoryAnalytics.configureSettings(settings);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('analytics_settings_configured', expect.objectContaining({
        enabled: true,
        dataRetention: 365,
      }));
    });

    it('should configure repository-specific analytics', () => {
      // Arrange
      const repositoryConfig = {
        repository: 'UserRepository',
        enabled: true,
        metrics: [
          'user_count',
          'active_users',
          'session_duration',
          'retention_rate',
          'conversion_rate',
        ],
        dimensions: [
          'user_type',
          'region',
          'device_type',
          'acquisition_channel',
        ],
        aggregations: {
          daily: ['user_count', 'active_users'],
          weekly: ['retention_rate', 'conversion_rate'],
          monthly: ['user_growth', 'churn_rate'],
        },
        caching: {
          enabled: true,
          ttl: 1800, // 30 minutes
        },
      };

      // Act
      repositoryAnalytics.configureRepositoryAnalytics(repositoryConfig);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('repository_analytics_configured', expect.objectContaining({
        repository: 'UserRepository',
        enabled: true,
      }));
    });

    it('should configure data sources', () => {
      // Arrange
      const dataSourceConfig = {
        primary: {
          type: 'database',
          connection: 'postgresql://analytics:5432/analytics',
          tables: ['users', 'orders', 'products'],
        },
        secondary: {
          type: 'api',
          endpoint: 'https://api.example.com/analytics',
          authentication: 'bearer_token',
        },
        cache: {
          type: 'redis',
          connection: 'redis://cache:6379',
        },
      };

      // Act
      repositoryAnalytics.configureDataSources(dataSourceConfig);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('data_sources_configured', expect.objectContaining({
        primary: expect.any(Object),
        secondary: expect.any(Object),
        cache: expect.any(Object),
      }));
    });
  });

  describe('Analytics Performance', () => {
    it('should optimize query performance', async () => {
      // Arrange
      const optimizationConfig = {
        repository: 'UserRepository',
        queries: [
          'SELECT COUNT(*) FROM users WHERE created_at > $1',
          'SELECT AVG(session_duration) FROM user_sessions WHERE date = $1',
          'SELECT user_type, COUNT(*) FROM users GROUP BY user_type',
        ],
        optimization: {
          indexSuggestions: true,
          queryRewriting: true,
          caching: true,
          partitioning: false,
        },
      };

      // Act
      const optimization = await repositoryAnalytics.optimizeQueryPerformance(optimizationConfig);

      // Assert
      expect(optimization).toBeDefined();
      expect(optimization.repository).toBe('UserRepository');
      expect(optimization.queries).toHaveLength(3);
      expect(optimization.suggestions).toBeDefined();
      expect(optimization.improvements).toBeDefined();
    });

    it('should monitor analytics performance', async () => {
      // Arrange
      const monitoringConfig = {
        repositories: ['UserRepository', 'ProductRepository'],
        metrics: ['query_duration', 'memory_usage', 'cpu_usage'],
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
        granularity: 'hourly',
        thresholds: {
          query_duration: { warning: 5000, critical: 10000 },
          memory_usage: { warning: 512 * 1024 * 1024, critical: 1024 * 1024 * 1024 },
          cpu_usage: { warning: 0.7, critical: 0.9 },
        },
      };

      // Act
      const monitoring = await repositoryAnalytics.monitorAnalyticsPerformance(monitoringConfig);

      // Assert
      expect(monitoring).toBeDefined();
      expect(monitoring.repositories).toEqual(['UserRepository', 'ProductRepository']);
      expect(monitoring.metrics).toEqual(['query_duration', 'memory_usage', 'cpu_usage']);
      expect(monitoring.granularity).toBe('hourly');
      expect(monitoring.results).toBeDefined();
      expect(monitoring.alerts).toBeDefined();
    });

    it('should generate performance reports', async () => {
      // Arrange
      const reportConfig = {
        repositories: ['UserRepository', 'ProductRepository', 'OrderRepository'],
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
        metrics: ['query_performance', 'data_processing_time', 'cache_hit_rate'],
        includeRecommendations: true,
        format: 'detailed',
      };

      // Act
      const report = await repositoryAnalytics.generatePerformanceReport(reportConfig);

      // Assert
      expect(report).toBeDefined();
      expect(report.repositories).toEqual(['UserRepository', 'ProductRepository', 'OrderRepository']);
      expect(report.metrics).toEqual(['query_performance', 'data_processing_time', 'cache_hit_rate']);
      expect(report.includeRecommendations).toBe(true);
      expect(report.summary).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });
  });
});
