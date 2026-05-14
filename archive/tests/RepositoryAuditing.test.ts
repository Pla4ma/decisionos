/**
 * RepositoryAuditing Tests
 * 
 * Comprehensive test suite for RepositoryAuditing functionality including
 * audit logging, compliance tracking, audit trails, and audit reporting.
 */

import { RepositoryAuditing } from '../repositories/RepositoryAuditing';
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

describe('RepositoryAuditing', () => {
  let repositoryAuditing: RepositoryAuditing;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryAuditing = new RepositoryAuditing(mockDbConnection, mockLogger);
  });

  describe('Audit Logging', () => {
    it('should log data access events', async () => {
      // Arrange
      const auditEvent = {
        userId: 'user-123',
        action: 'read',
        entityType: 'User',
        entityId: 'user-456',
        timestamp: new Date(),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        metadata: {
          query: 'SELECT * FROM users WHERE id = $1',
          parameters: ['user-456'],
        },
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      const result = await repositoryAuditing.logDataAccess(auditEvent);

      // Assert
      expect(result).toBeDefined();
      expect(result.auditId).toBeDefined();
      expect(result.userId).toBe('user-123');
      expect(result.action).toBe('read');
      expect(result.entityType).toBe('User');
      expect(result.entityId).toBe('user-456');
      expect(result.timestamp).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('audit_data_access_logged', expect.objectContaining({
        auditId: result.auditId,
        userId: 'user-123',
        action: 'read',
        entityType: 'User',
      }));
    });

    it('should log data modification events', async () => {
      // Arrange
      const auditEvent = {
        userId: 'user-123',
        action: 'update',
        entityType: 'User',
        entityId: 'user-456',
        timestamp: new Date(),
        changes: {
          email: { from: 'old@example.com', to: 'new@example.com' },
          status: { from: 'inactive', to: 'active' },
        },
        metadata: {
          query: 'UPDATE users SET email = $1, status = $2 WHERE id = $3',
          parameters: ['new@example.com', 'active', 'user-456'],
        },
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      const result = await repositoryAuditing.logDataModification(auditEvent);

      // Assert
      expect(result).toBeDefined();
      expect(result.action).toBe('update');
      expect(result.changes).toBeDefined();
      expect(result.changes.email).toBeDefined();
      expect(result.changes.email.from).toBe('old@example.com');
      expect(result.changes.email.to).toBe('new@example.com');
      expect(mockLogger.info).toHaveBeenCalledWith('audit_data_modification_logged', expect.objectContaining({
        auditId: result.auditId,
        userId: 'user-123',
        action: 'update',
        entityType: 'User',
      }));
    });

    it('should log security events', async () => {
      // Arrange
      const auditEvent = {
        userId: 'user-123',
        action: 'login_failed',
        entityType: 'Auth',
        entityId: null,
        timestamp: new Date(),
        severity: 'high',
        description: 'Failed login attempt - invalid credentials',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        metadata: {
          reason: 'invalid_password',
          attemptCount: 3,
        },
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      const result = await repositoryAuditing.logSecurityEvent(auditEvent);

      // Assert
      expect(result).toBeDefined();
      expect(result.action).toBe('login_failed');
      expect(result.severity).toBe('high');
      expect(result.description).toBe('Failed login attempt - invalid credentials');
      expect(mockLogger.warn).toHaveBeenCalledWith('audit_security_event_logged', expect.objectContaining({
        auditId: result.auditId,
        userId: 'user-123',
        action: 'login_failed',
        severity: 'high',
      }));
    });

    it('should log system events', async () => {
      // Arrange
      const auditEvent = {
        userId: null,
        action: 'system_backup',
        entityType: 'System',
        entityId: null,
        timestamp: new Date(),
        severity: 'info',
        description: 'Automated system backup completed',
        metadata: {
          backupSize: '1.5GB',
          backupDuration: 1200,
          backupLocation: '/backups/system_backup_2023_01_15.sql',
        },
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      const result = await repositoryAuditing.logSystemEvent(auditEvent);

      // Assert
      expect(result).toBeDefined();
      expect(result.action).toBe('system_backup');
      expect(result.severity).toBe('info');
      expect(result.description).toBe('Automated system backup completed');
      expect(mockLogger.info).toHaveBeenCalledWith('audit_system_event_logged', expect.objectContaining({
        auditId: result.auditId,
        action: 'system_backup',
        severity: 'info',
      }));
    });

    it('should handle audit logging errors gracefully', async () => {
      // Arrange
      const auditEvent = {
        userId: 'user-123',
        action: 'read',
        entityType: 'User',
        entityId: 'user-456',
        timestamp: new Date(),
      };

      mockDbConnection.query = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      // Act
      const result = await repositoryAuditing.logDataAccess(auditEvent);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('failed');
      expect(result.error).toBe('Database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith('audit_logging_failed', expect.objectContaining({
        userId: 'user-123',
        action: 'read',
        error: 'Database connection failed',
      }));
    });
  });

  describe('Audit Trail Management', () => {
    it('should create audit trail for entity', async () => {
      // Arrange
      const trailConfig = {
        entityType: 'User',
        entityId: 'user-123',
        startTime: new Date('2023-01-01'),
        endTime: new Date('2023-01-31'),
        includeChanges: true,
        includeAccess: true,
      };

      const mockTrailData = [
        {
          auditId: 'audit-1',
          userId: 'user-123',
          action: 'create',
          timestamp: new Date('2023-01-01T10:00:00Z'),
          changes: {
            name: { from: null, to: 'John Doe' },
            email: { from: null, to: 'john@example.com' },
          },
        },
        {
          auditId: 'audit-2',
          userId: 'user-456',
          action: 'read',
          timestamp: new Date('2023-01-15T14:30:00Z'),
          ipAddress: '192.168.1.100',
        },
        {
          auditId: 'audit-3',
          userId: 'user-123',
          action: 'update',
          timestamp: new Date('2023-01-20T09:15:00Z'),
          changes: {
            status: { from: 'active', to: 'inactive' },
          },
        },
      ];

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: mockTrailData });

      // Act
      const trail = await repositoryAuditing.createAuditTrail(trailConfig);

      // Assert
      expect(trail).toBeDefined();
      expect(trail.entityType).toBe('User');
      expect(trail.entityId).toBe('user-123');
      expect(trail.events).toHaveLength(3);
      expect(trail.events[0].action).toBe('create');
      expect(trail.events[1].action).toBe('read');
      expect(trail.events[2].action).toBe('update');
      expect(trail.summary).toBeDefined();
      expect(trail.summary.totalEvents).toBe(3);
      expect(trail.summary.actions).toEqual(['create', 'read', 'update']);
    });

    it('should filter audit trail by action type', async () => {
      // Arrange
      const trailConfig = {
        entityType: 'Product',
        entityId: 'product-456',
        startTime: new Date('2023-01-01'),
        endTime: new Date('2023-01-31'),
        actions: ['create', 'update'],
        excludeActions: ['read'],
      };

      const mockFilteredData = [
        {
          auditId: 'audit-1',
          userId: 'user-123',
          action: 'create',
          timestamp: new Date('2023-01-01T10:00:00Z'),
          changes: { name: { from: null, to: 'Laptop' } },
        },
        {
          auditId: 'audit-2',
          userId: 'user-123',
          action: 'update',
          timestamp: new Date('2023-01-15T14:30:00Z'),
          changes: { price: { from: 999.99, to: 899.99 } },
        },
      ];

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: mockFilteredData });

      // Act
      const trail = await repositoryAuditing.createAuditTrail(trailConfig);

      // Assert
      expect(trail).toBeDefined();
      expect(trail.events).toHaveLength(2);
      expect(trail.events.every(event => ['create', 'update'].includes(event.action))).toBe(true);
      expect(trail.events.some(event => event.action === 'read')).toBe(false);
    });

    it('should create audit trail for user activity', async () => {
      // Arrange
      const trailConfig = {
        userId: 'user-123',
        startTime: new Date('2023-01-01'),
        endTime: new Date('2023-01-31'),
        includeAllEntities: true,
      };

      const mockUserActivity = [
        {
          auditId: 'audit-1',
          userId: 'user-123',
          action: 'login',
          entityType: 'Auth',
          timestamp: new Date('2023-01-01T09:00:00Z'),
        },
        {
          auditId: 'audit-2',
          userId: 'user-123',
          action: 'read',
          entityType: 'User',
          entityId: 'user-456',
          timestamp: new Date('2023-01-01T09:15:00Z'),
        },
        {
          auditId: 'audit-3',
          userId: 'user-123',
          action: 'update',
          entityType: 'Product',
          entityId: 'product-789',
          timestamp: new Date('2023-01-01T10:30:00Z'),
        },
      ];

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: mockUserActivity });

      // Act
      const trail = await repositoryAuditing.createUserActivityTrail(trailConfig);

      // Assert
      expect(trail).toBeDefined();
      expect(trail.userId).toBe('user-123');
      expect(trail.events).toHaveLength(3);
      expect(trail.entities).toEqual(['Auth', 'User', 'Product']);
      expect(trail.activitySummary).toBeDefined();
      expect(trail.activitySummary.totalActions).toBe(3);
      expect(trail.activitySummary.uniqueEntities).toBe(3);
    });

    it('should create audit trail for time period', async () => {
      // Arrange
      const trailConfig = {
        startTime: new Date('2023-01-15'),
        endTime: new Date('2023-01-15'),
        entityTypes: ['User', 'Product'],
        includeSystemEvents: true,
      };

      const mockPeriodData = [
        {
          auditId: 'audit-1',
          userId: 'user-123',
          action: 'create',
          entityType: 'User',
          timestamp: new Date('2023-01-15T10:00:00Z'),
        },
        {
          auditId: 'audit-2',
          userId: null,
          action: 'system_backup',
          entityType: 'System',
          timestamp: new Date('2023-01-15T02:00:00Z'),
        },
        {
          auditId: 'audit-3',
          userId: 'user-456',
          action: 'delete',
          entityType: 'Product',
          timestamp: new Date('2023-01-15T15:30:00Z'),
        },
      ];

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: mockPeriodData });

      // Act
      const trail = await repositoryAuditing.createPeriodAuditTrail(trailConfig);

      // Assert
      expect(trail).toBeDefined();
      expect(trail.period).toEqual({ start: new Date('2023-01-15'), end: new Date('2023-01-15') });
      expect(trail.events).toHaveLength(3);
      expect(trail.entities).toEqual(['User', 'System', 'Product']);
      expect(trail.periodSummary).toBeDefined();
      expect(trail.periodSummary.totalEvents).toBe(3);
    });
  });

  describe('Compliance Tracking', () => {
    it('should track GDPR compliance', async () => {
      // Arrange
      const complianceConfig = {
        standard: 'GDPR',
        requirements: ['data_access_logging', 'data_retention', 'right_to_be_forgotten'],
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
      };

      const mockComplianceData = {
        data_access_logging: {
          compliant: true,
          auditEvents: 1000,
          missingEvents: 0,
          coverage: 1.0,
        },
        data_retention: {
          compliant: true,
          retentionPolicies: ['personal_data_2_years', 'financial_data_7_years'],
          expiredRecords: 0,
        },
        right_to_be_forgotten: {
          compliant: true,
          deletionRequests: 10,
          processedDeletions: 10,
          pendingDeletions: 0,
        },
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockComplianceData] });

      // Act
      const compliance = await repositoryAuditing.trackCompliance(complianceConfig);

      // Assert
      expect(compliance).toBeDefined();
      expect(compliance.standard).toBe('GDPR');
      expect(compliance.overallCompliant).toBe(true);
      expect(compliance.requirements).toBeDefined();
      expect(compliance.requirements.data_access_logging.compliant).toBe(true);
      expect(compliance.requirements.data_retention.compliant).toBe(true);
      expect(compliance.requirements.right_to_be_forgotten.compliant).toBe(true);
      expect(compliance.score).toBe(100);
      expect(mockLogger.info).toHaveBeenCalledWith('compliance_tracking_completed', expect.objectContaining({
        standard: 'GDPR',
        overallCompliant: true,
        score: 100,
      }));
    });

    it('should track SOC2 compliance', async () => {
      // Arrange
      const complianceConfig = {
        standard: 'SOC2',
        requirements: ['access_control', 'audit_logging', 'data_encryption'],
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
      };

      const mockSOC2Data = {
        access_control: {
          compliant: true,
          policies: ['rbac', 'mfa_required', 'session_timeout'],
          violations: 0,
        },
        audit_logging: {
          compliant: false,
          auditEvents: 800,
          requiredEvents: 1000,
          coverage: 0.8,
          gaps: ['failed_logins_not_logged', 'password_changes_not_logged'],
        },
        data_encryption: {
          compliant: true,
          encryptedFields: ['ssn', 'credit_card', 'email'],
          unencryptedFields: [],
        },
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockSOC2Data] });

      // Act
      const compliance = await repositoryAuditing.trackCompliance(complianceConfig);

      // Assert
      expect(compliance).toBeDefined();
      expect(compliance.standard).toBe('SOC2');
      expect(compliance.overallCompliant).toBe(false);
      expect(compliance.requirements.audit_logging.compliant).toBe(false);
      expect(compliance.requirements.audit_logging.gaps).toHaveLength(2);
      expect(compliance.score).toBeLessThan(100);
      expect(compliance.violations).toBeDefined();
    });

    it('should generate compliance report', async () => {
      // Arrange
      const reportConfig = {
        standards: ['GDPR', 'SOC2', 'HIPAA'],
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
        includeRecommendations: true,
        format: 'detailed',
      };

      const mockComplianceReport = {
        GDPR: {
          compliant: true,
          score: 100,
          requirements: { data_access_logging: { compliant: true }, data_retention: { compliant: true } },
        },
        SOC2: {
          compliant: false,
          score: 85,
          requirements: { access_control: { compliant: true }, audit_logging: { compliant: false } },
        },
        HIPAA: {
          compliant: true,
          score: 95,
          requirements: { phi_protection: { compliant: true }, audit_trail: { compliant: true } },
        },
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockComplianceReport] });

      // Act
      const report = await repositoryAuditing.generateComplianceReport(reportConfig);

      // Assert
      expect(report).toBeDefined();
      expect(report.standards).toEqual(['GDPR', 'SOC2', 'HIPAA']);
      expect(report.overallScore).toBe(93.33);
      expect(report.compliantStandards).toEqual(['GDPR', 'HIPAA']);
      expect(report.nonCompliantStandards).toEqual(['SOC2']);
      expect(report.recommendations).toBeDefined();
      expect(report.actionItems).toBeDefined();
    });

    it('should track compliance trends', async () => {
      // Arrange
      const trendConfig = {
        standard: 'GDPR',
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-03-31'),
        },
        interval: 'monthly',
      };

      const mockTrendData = [
        { period: '2023-01', score: 85, compliant: false, violations: 5 },
        { period: '2023-02', score: 92, compliant: false, violations: 2 },
        { period: '2023-03', score: 100, compliant: true, violations: 0 },
      ];

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: mockTrendData });

      // Act
      const trends = await repositoryAuditing.trackComplianceTrends(trendConfig);

      // Assert
      expect(trends).toBeDefined();
      expect(trends.standard).toBe('GDPR');
      expect(trends.trends).toHaveLength(3);
      expect(trends.trends[0].score).toBe(85);
      expect(trends.trends[2].score).toBe(100);
      expect(trends.improvement).toBe(15); // 100 - 85
      expect(trends.trendDirection).toBe('improving');
    });
  });

  describe('Audit Analytics', () => {
    it('should analyze audit patterns', async () => {
      // Arrange
      const analyticsConfig = {
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
        analysis: ['activity_patterns', 'security_events', 'compliance_gaps'],
      };

      const mockAnalyticsData = {
        activity_patterns: {
          peakHours: ['09:00-11:00', '14:00-16:00'],
          topUsers: ['user-123', 'user-456', 'user-789'],
          topEntities: ['User', 'Product', 'Order'],
          actionDistribution: { read: 60, create: 20, update: 15, delete: 5 },
        },
        security_events: {
          totalEvents: 50,
          eventsByType: { login_failed: 30, unauthorized_access: 15, data_breach: 5 },
          eventsBySeverity: { high: 5, medium: 15, low: 30 },
          trends: 'decreasing',
        },
        compliance_gaps: {
          missingAudits: 25,
          gapsByRequirement: { data_access_logging: 10, audit_trail: 15 },
          riskLevel: 'medium',
        },
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockAnalyticsData] });

      // Act
      const analytics = await repositoryAuditing.analyzeAuditData(analyticsConfig);

      // Assert
      expect(analytics).toBeDefined();
      expect(analytics.activity_patterns).toBeDefined();
      expect(analytics.security_events).toBeDefined();
      expect(analytics.compliance_gaps).toBeDefined();
      expect(analytics.activity_patterns.peakHours).toHaveLength(2);
      expect(analytics.security_events.totalEvents).toBe(50);
      expect(analytics.compliance_gaps.missingAudits).toBe(25);
    });

    it('should detect anomalies in audit data', async () => {
      // Arrange
      const anomalyConfig = {
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
        anomalyTypes: ['unusual_access', 'bulk_operations', 'off_hours_activity'],
      };

      const mockAnomalyData = [
        {
          type: 'unusual_access',
          userId: 'user-123',
          entityType: 'AdminSettings',
          frequency: 10,
          normalFrequency: 0,
          severity: 'high',
        },
        {
          type: 'bulk_operations',
          userId: 'user-456',
          action: 'delete',
          entityCount: 100,
          normalCount: 5,
          severity: 'medium',
        },
        {
          type: 'off_hours_activity',
          userId: 'user-789',
          action: 'read',
          timestamp: new Date('2023-01-15T02:30:00Z'),
          severity: 'low',
        },
      ];

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: mockAnomalyData });

      // Act
      const anomalies = await repositoryAuditing.detectAnomalies(anomalyConfig);

      // Assert
      expect(anomalies).toBeDefined();
      expect(anomalies.anomalies).toHaveLength(3);
      expect(anomalies.anomalies[0].type).toBe('unusual_access');
      expect(anomalies.anomalies[0].severity).toBe('high');
      expect(anomalies.summary).toBeDefined();
      expect(anomalies.summary.totalAnomalies).toBe(3);
      expect(anomalies.summary.bySeverity.high).toBe(1);
      expect(anomalies.summary.bySeverity.medium).toBe(1);
      expect(anomalies.summary.bySeverity.low).toBe(1);
    });

    it('should generate audit insights', async () => {
      // Arrange
      const insightsConfig = {
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
        insights: ['security_risks', 'compliance_issues', 'operational_efficiency'],
      };

      const mockInsightsData = {
        security_risks: {
          highRiskUsers: ['user-123', 'user-456'],
          vulnerableEntities: ['AdminSettings', 'FinancialData'],
          recommendedActions: ['Enable MFA for high-risk users', 'Restrict access to sensitive entities'],
        },
        compliance_issues: {
          gaps: ['Missing audit logs for password changes', 'Insufficient data retention policies'],
          riskLevel: 'medium',
          remediationPlan: 'Implement comprehensive audit logging within 30 days',
        },
        operational_efficiency: {
          bottlenecks: ['High volume of read operations during peak hours'],
          recommendations: ['Implement caching for frequently accessed data'],
        },
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockInsightsData] });

      // Act
      const insights = await repositoryAuditing.generateInsights(insightsConfig);

      // Assert
      expect(insights).toBeDefined();
      expect(insights.security_risks).toBeDefined();
      expect(insights.compliance_issues).toBeDefined();
      expect(insights.operational_efficiency).toBeDefined();
      expect(insights.security_risks.highRiskUsers).toHaveLength(2);
      expect(insights.compliance_issues.gaps).toHaveLength(2);
      expect(insights.overallRiskScore).toBeGreaterThan(0);
    });
  });

  describe('Audit Retention', () => {
    it('should implement audit data retention policy', async () => {
      // Arrange
      const retentionConfig = {
        policy: 'compliance_based',
        retentionPeriods: {
          'data_access': 2555, // 7 years for GDPR
          'security_events': 2555, // 7 years for GDPR
          'system_events': 1095, // 3 years
          'user_activity': 365, // 1 year
        },
        archiveOldRecords: true,
        compressionEnabled: true,
      };

      const mockRetentionData = {
        recordsProcessed: 100000,
        recordsArchived: 80000,
        recordsDeleted: 20000,
        spaceSaved: '2.5GB',
        compressionRatio: 0.7,
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockRetentionData] });

      // Act
      const retention = await repositoryAuditing.applyRetentionPolicy(retentionConfig);

      // Assert
      expect(retention).toBeDefined();
      expect(retention.policy).toBe('compliance_based');
      expect(retention.recordsProcessed).toBe(100000);
      expect(retention.recordsArchived).toBe(80000);
      expect(retention.recordsDeleted).toBe(20000);
      expect(retention.spaceSaved).toBe('2.5GB');
      expect(mockLogger.info).toHaveBeenCalledWith('audit_retention_applied', expect.objectContaining({
        policy: 'compliance_based',
        recordsProcessed: 100000,
        spaceSaved: '2.5GB',
      }));
    });

    it('should archive audit data', async () => {
      // Arrange
      const archiveConfig = {
        criteria: {
          olderThan: 365, // days
          actionTypes: ['read', 'create'],
          excludeSecurityEvents: true,
        },
        archiveLocation: '/archive/audit_logs',
        compression: 'gzip',
        encryption: true,
      };

      const mockArchiveData = {
        recordsArchived: 50000,
        archiveSize: '1.2GB',
        compressedSize: '360MB',
        archiveFiles: ['audit_2023_01_01.gz', 'audit_2023_01_02.gz'],
        encryptionKey: 'generated-key-123',
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockArchiveData] });

      // Act
      const archive = await repositoryAuditing.archiveAuditData(archiveConfig);

      // Assert
      expect(archive).toBeDefined();
      expect(archive.recordsArchived).toBe(50000);
      expect(archive.archiveSize).toBe('1.2GB');
      expect(archive.compressedSize).toBe('360MB');
      expect(archive.archiveFiles).toHaveLength(2);
      expect(archive.compressionRatio).toBe(0.3);
      expect(mockLogger.info).toHaveBeenCalledWith('audit_data_archived', expect.objectContaining({
        recordsArchived: 50000,
        archiveSize: '1.2GB',
        compressionRatio: 0.3,
      }));
    });

    it('should restore archived audit data', async () => {
      // Arrange
      const restoreConfig = {
        archiveFile: 'audit_2023_01_01.gz',
        restoreTo: 'audit_logs_temp',
        decryptionKey: 'generated-key-123',
        filterCriteria: {
          userId: 'user-123',
          actionTypes: ['read', 'update'],
        },
      };

      const mockRestoreData = {
        recordsRestored: 1000,
        restoreDuration: 45, // seconds
        integrityVerified: true,
        duplicateRecords: 5,
        skippedRecords: 10,
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockRestoreData] });

      // Act
      const restore = await repositoryAuditing.restoreArchivedData(restoreConfig);

      // Assert
      expect(restore).toBeDefined();
      expect(restore.recordsRestored).toBe(1000);
      expect(restore.integrityVerified).toBe(true);
      expect(restore.duplicateRecords).toBe(5);
      expect(restore.skippedRecords).toBe(10);
      expect(mockLogger.info).toHaveBeenCalledWith('audit_data_restored', expect.objectContaining({
        archiveFile: 'audit_2023_01_01.gz',
        recordsRestored: 1000,
        integrityVerified: true,
      }));
    });
  });

  describe('Audit Reporting', () => {
    it('should generate comprehensive audit report', async () => {
      // Arrange
      const reportConfig = {
        name: 'Monthly Audit Report',
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
        sections: ['overview', 'activity_summary', 'security_events', 'compliance', 'anomalies'],
        includeCharts: true,
        format: 'pdf',
      };

      const mockReportData = {
        overview: {
          totalEvents: 100000,
          uniqueUsers: 500,
          uniqueEntities: 25,
          complianceScore: 95,
        },
        activity_summary: {
          actionDistribution: { read: 60000, create: 20000, update: 15000, delete: 5000 },
          topUsers: ['user-123', 'user-456', 'user-789'],
          peakActivity: '2023-01-15T14:30:00Z',
        },
        security_events: {
          totalSecurityEvents: 150,
          eventsByType: { login_failed: 80, unauthorized_access: 50, data_breach: 20 },
          eventsBySeverity: { high: 20, medium: 50, low: 80 },
        },
        compliance: {
          overallCompliant: true,
          standards: { GDPR: { compliant: true, score: 98 }, SOC2: { compliant: true, score: 92 } },
        },
        anomalies: {
          totalAnomalies: 25,
          anomaliesByType: { unusual_access: 10, bulk_operations: 8, off_hours_activity: 7 },
        },
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockReportData] });

      // Act
      const report = await repositoryAuditing.generateAuditReport(reportConfig);

      // Assert
      expect(report).toBeDefined();
      expect(report.name).toBe('Monthly Audit Report');
      expect(report.sections).toEqual(['overview', 'activity_summary', 'security_events', 'compliance', 'anomalies']);
      expect(report.data.overview).toBeDefined();
      expect(report.data.security_events).toBeDefined();
      expect(report.data.compliance).toBeDefined();
      expect(report.data.anomalies).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('audit_report_generated', expect.objectContaining({
        reportName: 'Monthly Audit Report',
        sections: expect.any(Array),
      }));
    });

    it('should generate security audit report', async () => {
      // Arrange
      const securityReportConfig = {
        name: 'Security Audit Report',
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
        focus: ['authentication', 'authorization', 'data_protection'],
        riskAssessment: true,
        recommendations: true,
      };

      const mockSecurityData = {
        authentication: {
          loginAttempts: 10000,
          successfulLogins: 9500,
          failedLogins: 500,
          uniqueUsers: 500,
          mfaUsage: 0.8,
        },
        authorization: {
          accessRequests: 2000,
          grantedRequests: 1800,
          deniedRequests: 200,
          violations: 50,
        },
        data_protection: {
          dataAccessEvents: 50000,
          sensitiveDataAccess: 5000,
          encryptionEvents: 1000,
          dataBreachAttempts: 10,
        },
        riskAssessment: {
          overallRisk: 'medium',
          highRiskAreas: ['authentication', 'data_protection'],
          riskScore: 65,
        },
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockSecurityData] });

      // Act
      const report = await repositoryAuditing.generateSecurityReport(securityReportConfig);

      // Assert
      expect(report).toBeDefined();
      expect(report.name).toBe('Security Audit Report');
      expect(report.focus).toEqual(['authentication', 'authorization', 'data_protection']);
      expect(report.data.authentication).toBeDefined();
      expect(report.data.authorization).toBeDefined();
      expect(report.data.data_protection).toBeDefined();
      expect(report.data.riskAssessment).toBeDefined();
      expect(report.data.riskAssessment.overallRisk).toBe('medium');
      expect(report.data.riskAssessment.riskScore).toBe(65);
    });

    it('should generate compliance audit report', async () => {
      // Arrange
      const complianceReportConfig = {
        name: 'Compliance Audit Report',
        standards: ['GDPR', 'SOC2', 'HIPAA'],
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
        includeEvidence: true,
        actionPlan: true,
      };

      const mockComplianceData = {
        GDPR: {
          compliant: true,
          score: 98,
          requirements: {
            data_access_logging: { compliant: true, evidence: ['All access events logged'] },
            data_retention: { compliant: true, evidence: ['Retention policies implemented'] },
            right_to_be_forgotten: { compliant: true, evidence: ['Deletion requests processed'] },
          },
        },
        SOC2: {
          compliant: false,
          score: 85,
          requirements: {
            access_control: { compliant: true, evidence: ['RBAC implemented'] },
            audit_logging: { compliant: false, gaps: ['Missing some audit events'] },
          },
        },
        HIPAA: {
          compliant: true,
          score: 95,
          requirements: {
            phi_protection: { compliant: true, evidence: ['PHI encrypted'] },
            audit_trail: { compliant: true, evidence: ['Complete audit trail maintained'] },
          },
        },
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockComplianceData] });

      // Act
      const report = await repositoryAuditing.generateComplianceReport(complianceReportConfig);

      // Assert
      expect(report).toBeDefined();
      expect(report.name).toBe('Compliance Audit Report');
      expect(report.standards).toEqual(['GDPR', 'SOC2', 'HIPAA']);
      expect(report.data.GDPR).toBeDefined();
      expect(report.data.GDPR.compliant).toBe(true);
      expect(report.data.GDPR.score).toBe(98);
      expect(report.data.SOC2.compliant).toBe(false);
      expect(report.data.SOC2.score).toBe(85);
      expect(report.overallCompliance).toBe('partial');
    });
  });

  describe('Audit Configuration', () => {
    it('should configure audit settings', () => {
      // Arrange
      const settings = {
        logLevel: 'info',
        enableRealTimeLogging: true,
        batchSize: 100,
        compressionEnabled: true,
        encryptionEnabled: true,
        retentionPeriod: 2555, // 7 years
      };

      // Act
      repositoryAuditing.configureSettings(settings);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('audit_settings_configured', expect.objectContaining({
        settings,
      }));
    });

    it('should configure audit policies', () => {
      // Arrange
      const policies = {
        dataAccess: {
          logAllReads: true,
          logAllWrites: true,
          logFailedAttempts: true,
          excludeSystemUsers: false,
        },
        security: {
          logAllSecurityEvents: true,
          logFailedLogins: true,
          logUnauthorizedAccess: true,
          alertOnHighSeverity: true,
        },
        compliance: {
          gdprCompliance: true,
          soc2Compliance: true,
          hipaaCompliance: false,
          retentionPolicy: 'compliance_based',
        },
      };

      // Act
      repositoryAuditing.configurePolicies(policies);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('audit_policies_configured', expect.objectContaining({
        policies,
      }));
    });

    it('should configure audit alerts', () => {
      // Arrange
      const alerts = {
        securityEvents: {
          enabled: true,
          threshold: 10, // events per hour
          severity: 'high',
          recipients: ['security@example.com'],
        },
        complianceGaps: {
          enabled: true,
          threshold: 5, // gaps per day
          recipients: ['compliance@example.com'],
        },
        anomalies: {
          enabled: true,
          threshold: 3, // anomalies per hour
          severity: 'medium',
          recipients: ['ops@example.com'],
        },
      };

      // Act
      repositoryAuditing.configureAlerts(alerts);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('audit_alerts_configured', expect.objectContaining({
        alerts,
      }));
    });
  });

  describe('Audit Integration', () => {
    it('should integrate with SIEM systems', async () => {
      // Arrange
      const siemSystem = {
        sendEvent: jest.fn().mockResolvedValue(true),
        sendBatch: jest.fn().mockResolvedValue(true),
        getStatus: jest.fn().mockResolvedValue('connected'),
      };

      repositoryAuditing.addSIEMSystem('splunk', siemSystem);

      // Act
      const eventSent = await repositoryAuditing.sendToSIEM({
        userId: 'user-123',
        action: 'login',
        timestamp: new Date(),
      }, 'splunk');

      const batchSent = await repositoryAuditing.sendBatchToSIEM([
        { userId: 'user-123', action: 'read', timestamp: new Date() },
        { userId: 'user-456', action: 'write', timestamp: new Date() },
      ], 'splunk');

      const status = await repositoryAuditing.getSIEMStatus('splunk');

      // Assert
      expect(eventSent).toBe(true);
      expect(batchSent).toBe(true);
      expect(status).toBe('connected');
      expect(siemSystem.sendEvent).toHaveBeenCalled();
      expect(siemSystem.sendBatch).toHaveBeenCalled();
      expect(siemSystem.getStatus).toHaveBeenCalled();
    });

    it('should integrate with compliance management systems', async () => {
      // Arrange
      const complianceSystem = {
        submitEvidence: jest.fn().mockResolvedValue('evidence-123'),
        getComplianceStatus: jest.fn().mockResolvedValue({ compliant: true, score: 95 }),
        createReport: jest.fn().mockResolvedValue('report-456'),
      };

      repositoryAuditing.addComplianceSystem('compliance-manager', complianceSystem);

      // Act
      const evidence = await repositoryAuditing.submitComplianceEvidence({
        standard: 'GDPR',
        requirement: 'data_access_logging',
        evidence: ['All access events logged with timestamps'],
      }, 'compliance-manager');

      const status = await repositoryAuditing.getComplianceStatus('GDPR', 'compliance-manager');
      const report = await repositoryAuditing.createComplianceReport('GDPR', 'compliance-manager');

      // Assert
      expect(evidence).toBe('evidence-123');
      expect(status.compliant).toBe(true);
      expect(status.score).toBe(95);
      expect(report).toBe('report-456');
      expect(complianceSystem.submitEvidence).toHaveBeenCalled();
      expect(complianceSystem.getComplianceStatus).toHaveBeenCalled();
      expect(complianceSystem.createReport).toHaveBeenCalled();
    });

    it('should integrate with monitoring systems', async () => {
      // Arrange
      const monitoringSystem = {
        createMetric: jest.fn().mockResolvedValue('metric-123'),
        sendAlert: jest.fn().mockResolvedValue(true),
        getDashboard: jest.fn().mockResolvedValue('dashboard-456'),
      };

      repositoryAuditing.addMonitoringSystem('datadog', monitoringSystem);

      // Act
      const metric = await repositoryAuditing.createAuditMetric('audit_events_per_hour', 'datadog');
      const alert = await repositoryAuditing.sendAuditAlert('High security event rate detected', 'datadog');
      const dashboard = await repositoryAuditing.getAuditDashboard('datadog');

      // Assert
      expect(metric).toBe('metric-123');
      expect(alert).toBe(true);
      expect(dashboard).toBe('dashboard-456');
      expect(monitoringSystem.createMetric).toHaveBeenCalled();
      expect(monitoringSystem.sendAlert).toHaveBeenCalled();
      expect(monitoringSystem.getDashboard).toHaveBeenCalled();
    });
  });
});
