/**
 * AuditRepository Tests
 * 
 * Comprehensive test suite for AuditRepository functionality including
 * audit logging, compliance tracking, audit queries, and audit analytics.
 */

import { AuditRepository } from '../repositories/AuditRepository';
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

describe('AuditRepository', () => {
  let auditRepository: AuditRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    auditRepository = new AuditRepository(mockDbConnection, mockCacheManager, mockLogger);
  });

  describe('Audit Logging', () => {
    it('should log audit event', async () => {
      // Arrange
      const auditData = {
        entityType: 'user',
        entityId: 'user-123',
        action: 'update',
        userId: 'admin-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        oldValue: { name: 'John Doe', email: 'john@example.com' },
        newValue: { name: 'John Smith', email: 'john.smith@example.com' },
        changes: [
          { field: 'name', oldValue: 'John Doe', newValue: 'John Smith' },
          { field: 'email', oldValue: 'john@example.com', newValue: 'john.smith@example.com' },
        ],
        metadata: {
          source: 'admin_panel',
          reason: 'User requested name change',
        },
      };

      const mockResult = {
        rows: [{
          id: 'audit-123',
          entity_type: 'user',
          entity_id: 'user-123',
          action: 'update',
          user_id: 'admin-123',
          session_id: 'session-123',
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          old_value: JSON.stringify(auditData.oldValue),
          new_value: JSON.stringify(auditData.newValue),
          changes: JSON.stringify(auditData.changes),
          metadata: JSON.stringify(auditData.metadata),
          timestamp: new Date(),
          severity: 'info',
          category: 'user_management',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await auditRepository.logEvent(auditData);

      // Assert
      expect(result).toBeDefined();
      expect(result.entityType).toBe(auditData.entityType);
      expect(result.entityId).toBe(auditData.entityId);
      expect(result.action).toBe(auditData.action);
      expect(result.userId).toBe(auditData.userId);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO audit_logs'),
        expect.arrayContaining([
          auditData.entityType,
          auditData.entityId,
          auditData.action,
          auditData.userId,
          auditData.sessionId,
          auditData.ipAddress,
          auditData.userAgent,
          JSON.stringify(auditData.oldValue),
          JSON.stringify(auditData.newValue),
          JSON.stringify(auditData.changes),
          JSON.stringify(auditData.metadata),
        ])
      );
    });

    it('should query audit logs with filters', async () => {
      // Arrange
      const filters = {
        entityType: 'user',
        action: 'update',
        userId: 'admin-123',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [{
          id: 'audit-123',
          entity_type: 'user',
          entity_id: 'user-123',
          action: 'update',
          user_id: 'admin-123',
          changes: JSON.stringify([{ field: 'name', oldValue: 'John Doe', newValue: 'John Smith' }]),
          timestamp: new Date(),
          severity: 'info',
          category: 'user_management',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await auditRepository.queryLogs(filters);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].entityType).toBe(filters.entityType);
      expect(result[0].action).toBe(filters.action);
      expect(result[0].userId).toBe(filters.userId);
    });

    it('should get audit logs by entity', async () => {
      // Arrange
      const entityType = 'user';
      const entityId = 'user-123';
      const options = {
        limit: 100,
        offset: 0,
        action: 'update',
      };

      const mockResult = {
        rows: [{
          id: 'audit-123',
          entity_type: entityType,
          entity_id: entityId,
          action: 'update',
          user_id: 'admin-123',
          changes: JSON.stringify([{ field: 'name', oldValue: 'John Doe', newValue: 'John Smith' }]),
          timestamp: new Date(),
          severity: 'info',
          category: 'user_management',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await auditRepository.getLogsByEntity(entityType, entityId, options);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].entityType).toBe(entityType);
      expect(result[0].entityId).toBe(entityId);
    });

    it('should get audit logs by user', async () => {
      // Arrange
      const userId = 'admin-123';
      const options = {
        limit: 100,
        offset: 0,
        action: 'update',
      };

      const mockResult = {
        rows: [{
          id: 'audit-123',
          entity_type: 'user',
          entity_id: 'user-456',
          action: 'update',
          user_id: userId,
          changes: JSON.stringify([{ field: 'name', oldValue: 'John Doe', newValue: 'John Smith' }]),
          timestamp: new Date(),
          severity: 'info',
          category: 'user_management',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await auditRepository.getLogsByUser(userId, options);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].userId).toBe(userId);
    });

    it('should get entity history', async () => {
      // Arrange
      const entityType = 'product';
      const entityId = 'product-123';
      const mockResult = {
        rows: [
          {
            id: 'audit-1',
            entity_type: entityType,
            entity_id: entityId,
            action: 'create',
            user_id: 'admin-123',
            timestamp: new Date('2023-01-01'),
            changes: [],
          },
          {
            id: 'audit-2',
            entity_type: entityType,
            entity_id: entityId,
            action: 'update',
            user_id: 'admin-123',
            timestamp: new Date('2023-01-02'),
            changes: [{ field: 'price', oldValue: 99.99, newValue: 149.99 }],
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await auditRepository.getEntityHistory(entityType, entityId);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].action).toBe('create');
      expect(result[1].action).toBe('update');
    });
  });

  describe('Compliance Tracking', () => {
    it('should check compliance rules', async () => {
      // Arrange
      const auditData = {
        entityType: 'user',
        entityId: 'user-123',
        action: 'delete',
        userId: 'admin-123',
        oldValue: { name: 'John Doe', email: 'john@example.com' },
        newValue: null,
      };

      const mockResult = {
        rows: [{
          id: 'compliance-1',
          name: 'GDPR Data Deletion',
          description: 'Ensure proper data deletion under GDPR',
          conditions: [{
            field: 'action',
            operator: 'equals',
            value: 'delete',
          }],
          actions: [{
            type: 'alert',
            parameters: { level: 'high', message: 'User deletion requires GDPR compliance' },
          }],
          enabled: true,
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await auditRepository.checkCompliance(auditData);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe('GDPR Data Deletion');
    });

    it('should execute compliance actions', async () => {
      // Arrange
      const complianceRule = {
        id: 'compliance-1',
        name: 'GDPR Data Deletion',
        actions: [{
          type: 'alert',
          parameters: { level: 'high', message: 'User deletion requires GDPR compliance' },
        }],
      };

      const auditData = {
        entityType: 'user',
        entityId: 'user-123',
        action: 'delete',
        userId: 'admin-123',
      };

      const mockResult = {
        rows: [{
          id: 'compliance-action-1',
          compliance_rule_id: 'compliance-1',
          action_type: 'alert',
          parameters: JSON.stringify({ level: 'high', message: 'User deletion requires GDPR compliance' }),
          executed_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await auditRepository.executeComplianceAction(complianceRule, auditData);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].complianceRuleId).toBe(complianceRule.id);
    });

    it('should get compliance reports', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [
          {
            rule_name: 'GDPR Data Deletion',
            total_checks: 100,
            violations: 5,
            compliance_rate: 95.0,
          },
          {
            rule_name: 'Financial Audit Trail',
            total_checks: 50,
            violations: 2,
            compliance_rate: 96.0,
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await auditRepository.getComplianceReports(timeRange);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].ruleName).toBe('GDPR Data Deletion');
      expect(result[0].complianceRate).toBe(95.0);
    });
  });

  describe('Audit Analytics', () => {
    it('should get audit statistics', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [{
          total_events: 10000,
          events_by_entity_type: { user: 4000, product: 3000, order: 2000, system: 1000 },
          events_by_action: { create: 3000, update: 4000, delete: 1000, view: 2000 },
          events_by_user: { 'admin-123': 500, 'user-456': 300, 'system': 9200 },
          events_by_severity: { info: 8000, warning: 1500, error: 400, critical: 100 },
          unique_users: 50,
          unique_entities: 1000,
          average_events_per_day: 322,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await auditRepository.getAuditStats(timeRange);

      // Assert
      expect(result).toBeDefined();
      expect(result.totalEvents).toBe(10000);
      expect(result.eventsByEntityType.user).toBe(4000);
      expect(result.eventsByAction.update).toBe(4000);
      expect(result.uniqueUsers).toBe(50);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should get user activity summary', async () => {
      // Arrange
      const userId = 'admin-123';
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [{
          user_id: userId,
          total_actions: 500,
          actions_by_type: { create: 100, update: 300, delete: 50, view: 50 },
          entities_modified: 200,
          most_active_day: '2023-01-15',
          average_actions_per_day: 16.1,
          peak_hour: 14,
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await auditRepository.getUserActivity(userId, timeRange);

      // Assert
      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.totalActions).toBe(500);
      expect(result.entitiesModified).toBe(200);
    });

    it('should get entity activity summary', async () => {
      // Arrange
      const entityType = 'user';
      const entityId = 'user-123';
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [{
          entity_type: entityType,
          entity_id: entityId,
          total_actions: 25,
          actions_by_type: { create: 1, update: 20, delete: 1, view: 3 },
          users_involved: 5,
          last_modified: new Date('2023-01-30'),
          modification_frequency: 'daily',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await auditRepository.getEntityActivity(entityType, entityId, timeRange);

      // Assert
      expect(result).toBeDefined();
      expect(result.entityType).toBe(entityType);
      expect(result.entityId).toBe(entityId);
      expect(result.totalActions).toBe(25);
    });

    it('should get security events', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const filters = {
        severity: ['high', 'critical'],
        category: 'security',
      };

      const mockResult = {
        rows: [
          {
            id: 'audit-1',
            entity_type: 'user',
            entity_id: 'user-123',
            action: 'login_failed',
            user_id: 'system',
            timestamp: new Date('2023-01-15'),
            severity: 'high',
            category: 'security',
            metadata: JSON.stringify({ ip_address: '192.168.1.100', attempts: 3 }),
          },
          {
            id: 'audit-2',
            entity_type: 'user',
            entity_id: 'user-456',
            action: 'privilege_escalation',
            user_id: 'admin-123',
            timestamp: new Date('2023-01-20'),
            severity: 'critical',
            category: 'security',
            metadata: JSON.stringify({ old_role: 'user', new_role: 'admin' }),
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await auditRepository.getSecurityEvents(timeRange, filters);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].severity).toBe('high');
      expect(result[1].severity).toBe('critical');
    });

    it('should get audit trail report', async () => {
      // Arrange
      const reportConfig = {
        entityType: 'order',
        entityId: 'order-123',
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
        includeChanges: true,
        format: 'detailed',
      };

      const mockResult = {
        rows: [
          {
            id: 'audit-1',
            entity_type: 'order',
            entity_id: 'order-123',
            action: 'create',
            user_id: 'user-456',
            timestamp: new Date('2023-01-01'),
            changes: [],
            metadata: JSON.stringify({ source: 'web_checkout' }),
          },
          {
            id: 'audit-2',
            entity_type: 'order',
            entity_id: 'order-123',
            action: 'update',
            user_id: 'admin-123',
            timestamp: new Date('2023-01-02'),
            changes: [{ field: 'status', oldValue: 'pending', newValue: 'processing' }],
            metadata: JSON.stringify({ reason: 'Payment received' }),
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await auditRepository.getAuditTrailReport(reportConfig);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].action).toBe('create');
      expect(result[1].action).toBe('update');
      expect(result[1].changes).toHaveLength(1);
    });
  });

  describe('Validation', () => {
    it('should validate audit data', async () => {
      // Arrange
      const invalidAuditData = {
        entityType: '',
        entityId: '',
        action: '',
        userId: '',
        oldValue: null,
        newValue: null,
      };

      // Act & Assert
      await expect(auditRepository.logEvent(invalidAuditData)).rejects.toThrow('Entity type is required');
    });

    it('should validate entity type', async () => {
      // Arrange
      const invalidAuditData = {
        entityType: 'invalid_type',
        entityId: 'user-123',
        action: 'update',
        userId: 'admin-123',
        oldValue: { name: 'John' },
        newValue: { name: 'Jane' },
      };

      // Act & Assert
      await expect(auditRepository.logEvent(invalidAuditData)).rejects.toThrow('Invalid entity type');
    });

    it('should validate action type', async () => {
      // Arrange
      const invalidAuditData = {
        entityType: 'user',
        entityId: 'user-123',
        action: 'invalid_action',
        userId: 'admin-123',
        oldValue: { name: 'John' },
        newValue: { name: 'Jane' },
      };

      // Act & Assert
      await expect(auditRepository.logEvent(invalidAuditData)).rejects.toThrow('Invalid action type');
    });

    it('should validate changes format', async () => {
      // Arrange
      const invalidAuditData = {
        entityType: 'user',
        entityId: 'user-123',
        action: 'update',
        userId: 'admin-123',
        oldValue: { name: 'John' },
        newValue: { name: 'Jane' },
        changes: 'invalid_format', // Should be array
      };

      // Act & Assert
      await expect(auditRepository.logEvent(invalidAuditData)).rejects.toThrow('Changes must be an array');
    });
  });

  describe('Caching', () => {
    it('should cache audit statistics', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [{
          total_events: 10000,
          events_by_entity_type: { user: 4000, product: 3000 },
          unique_users: 50,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await auditRepository.getAuditStats(timeRange);

      // Assert
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('auditStats'),
        expect.any(Object),
        expect.any(Number)
      );
    });

    it('should return cached audit statistics', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const cachedStats = {
        totalEvents: 10000,
        eventsByEntityType: { user: 4000, product: 3000 },
        uniqueUsers: 50,
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(cachedStats);

      // Act
      const result = await auditRepository.getAuditStats(timeRange);

      // Assert
      expect(result).toEqual(cachedStats);
      expect(mockDbConnection.query).not.toHaveBeenCalled();
    });

    it('should clear cache on new audit event', async () => {
      // Arrange
      const auditData = {
        entityType: 'user',
        entityId: 'user-123',
        action: 'update',
        userId: 'admin-123',
        oldValue: { name: 'John' },
        newValue: { name: 'Jane' },
      };

      const mockResult = {
        rows: [{
          id: 'audit-123',
          entity_type: 'user',
          entity_id: 'user-123',
          action: 'update',
          user_id: 'admin-123',
          timestamp: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await auditRepository.logEvent(auditData);

      // Assert
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        expect.stringContaining('auditStats')
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      const auditData = {
        entityType: 'user',
        entityId: 'user-123',
        action: 'update',
        userId: 'admin-123',
        oldValue: { name: 'John' },
        newValue: { name: 'Jane' },
      };

      const dbError = new Error('Database connection failed');
      mockDbConnection.query = jest.fn().mockRejectedValue(dbError);

      // Act & Assert
      await expect(auditRepository.logEvent(auditData)).rejects.toThrow('Database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({
          error: dbError.message,
        })
      );
    });

    it('should handle validation errors gracefully', async () => {
      // Arrange
      const invalidAuditData = {
        entityType: '',
        entityId: '',
        action: '',
        userId: '',
        oldValue: null,
        newValue: null,
      };

      // Act & Assert
      await expect(auditRepository.logEvent(invalidAuditData)).rejects.toThrow();
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
          id: `audit-${i}`,
          entity_type: 'user',
          entity_id: `user-${i % 1000}`,
          action: 'update',
          user_id: `user-${i % 100}`,
          timestamp: new Date(),
          severity: 'info',
          category: 'user_management',
        })),
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(largeResult);

      // Act
      const startTime = Date.now();
      const result = await auditRepository.queryEvents({
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
      const userId = "user-123'; DROP TABLE audit_logs; --";
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      await auditRepository.getLogsByUser(userId);

      // Assert
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1'),
        expect.arrayContaining([userId])
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values gracefully', async () => {
      // Arrange
      const auditData = {
        entityType: 'user',
        entityId: 'user-123',
        action: 'view',
        userId: null,
        oldValue: null,
        newValue: null,
      };

      const mockResult = {
        rows: [{
          id: 'audit-123',
          entity_type: 'user',
          entity_id: 'user-123',
          action: 'view',
          user_id: null,
          old_value: null,
          new_value: null,
          timestamp: new Date(),
          severity: 'info',
          category: 'user_management',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await auditRepository.logEvent(auditData);

      // Assert
      expect(result).toBeDefined();
      expect(result.userId).toBeNull();
      expect(result.oldValue).toBeNull();
      expect(result.newValue).toBeNull();
    });

    it('should handle empty result sets', async () => {
      // Arrange
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await auditRepository.queryEvents({
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-01'), // Same day, no events
      });

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should handle concurrent operations', async () => {
      // Arrange
      const auditData = {
        entityType: 'user',
        entityId: 'user-123',
        action: 'update',
        userId: 'admin-123',
        oldValue: { name: 'John' },
        newValue: { name: 'Jane' },
      };

      const mockResult = {
        rows: [{
          id: 'audit-123',
          entity_type: 'user',
          entity_id: 'user-123',
          action: 'update',
          user_id: 'admin-123',
          timestamp: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const promises = Array.from({ length: 100 }, () => 
        auditRepository.logEvent(auditData)
      );
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(100);
      results.forEach(result => {
        expect(result.entityType).toBe(auditData.entityType);
      });
    });

    it('should handle large change objects', async () => {
      // Arrange
      const largeChanges = Array.from({ length: 100 }, (_, i) => ({
        field: `field_${i}`,
        oldValue: `old_value_${i}`,
        newValue: `new_value_${i}`,
      }));

      const auditData = {
        entityType: 'product',
        entityId: 'product-123',
        action: 'update',
        userId: 'admin-123',
        oldValue: null,
        newValue: null,
        changes: largeChanges,
      };

      const mockResult = {
        rows: [{
          id: 'audit-123',
          entity_type: 'product',
          entity_id: 'product-123',
          action: 'update',
          user_id: 'admin-123',
          changes: JSON.stringify(largeChanges),
          timestamp: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await auditRepository.logEvent(auditData);

      // Assert
      expect(result).toBeDefined();
      expect(result.changes).toHaveLength(100);
    });
  });
});
