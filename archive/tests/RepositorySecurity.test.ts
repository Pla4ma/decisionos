/**
 * RepositorySecurity Tests
 * 
 * Comprehensive test suite for RepositorySecurity functionality including
 * access control, data encryption, audit logging, and security monitoring.
 */

import { RepositorySecurity } from '../repositories/RepositorySecurity';
import { Logger } from '../logging/Logger';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

describe('RepositorySecurity', () => {
  let repositorySecurity: RepositorySecurity;

  beforeEach(() => {
    jest.clearAllMocks();
    repositorySecurity = new RepositorySecurity(mockLogger);
  });

  describe('Access Control', () => {
    it('should check read permissions', () => {
      // Arrange
      const userId = 'user-123';
      const entityType = 'User';
      const entityId = 'user-456';
      const userRoles = ['user', 'admin'];

      // Act
      const hasPermission = repositorySecurity.checkReadPermission(userId, entityType, entityId, userRoles);

      // Assert
      expect(typeof hasPermission).toBe('boolean');
      expect(mockLogger.debug).toHaveBeenCalledWith('permission_check', expect.objectContaining({
        userId,
        entityType,
        entityId,
        operation: 'read',
      }));
    });

    it('should check write permissions', () => {
      // Arrange
      const userId = 'user-123';
      const entityType = 'User';
      const entityId = 'user-456';
      const userRoles = ['user'];

      // Act
      const hasPermission = repositorySecurity.checkWritePermission(userId, entityType, entityId, userRoles);

      // Assert
      expect(typeof hasPermission).toBe('boolean');
      expect(mockLogger.debug).toHaveBeenCalledWith('permission_check', expect.objectContaining({
        userId,
        entityType,
        entityId,
        operation: 'write',
      }));
    });

    it('should check delete permissions', () => {
      // Arrange
      const userId = 'user-123';
      const entityType = 'User';
      const entityId = 'user-456';
      const userRoles = ['user'];

      // Act
      const hasPermission = repositorySecurity.checkDeletePermission(userId, entityType, entityId, userRoles);

      // Assert
      expect(typeof hasPermission).toBe('boolean');
      expect(mockLogger.debug).toHaveBeenCalledWith('permission_check', expect.objectContaining({
        userId,
        entityType,
        entityId,
        operation: 'delete',
      }));
    });

    it('should deny access for unauthorized users', () => {
      // Arrange
      const userId = 'user-123';
      const entityType = 'AdminSettings';
      const entityId = 'settings-1';
      const userRoles = ['user']; // Not admin

      // Act
      const hasPermission = repositorySecurity.checkReadPermission(userId, entityType, entityId, userRoles);

      // Assert
      expect(hasPermission).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith('access_denied', expect.objectContaining({
        userId,
        entityType,
        entityId,
        operation: 'read',
        reason: expect.stringContaining('insufficient permissions'),
      }));
    });

    it('should allow access for authorized users', () => {
      // Arrange
      const userId = 'user-123';
      const entityType = 'UserProfile';
      const entityId = 'user-123'; // Same user
      const userRoles = ['user'];

      // Act
      const hasPermission = repositorySecurity.checkReadPermission(userId, entityType, entityId, userRoles);

      // Assert
      expect(hasPermission).toBe(true);
    });
  });

  describe('Data Encryption', () => {
    it('should encrypt sensitive data', () => {
      // Arrange
      const sensitiveData = {
        ssn: '123-45-6789',
        creditCard: '4111-1111-1111-1111',
        email: 'john@example.com',
      };
      const encryptionKey = 'test-encryption-key';

      // Act
      const encrypted = repositorySecurity.encryptData(sensitiveData, encryptionKey);

      // Assert
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toEqual(sensitiveData);
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toContain('123-45-6789');
      expect(encrypted).not.toContain('4111-1111-1111-1111');
      expect(mockLogger.debug).toHaveBeenCalledWith('data_encrypted', expect.objectContaining({
        fields: ['ssn', 'creditCard', 'email'],
      }));
    });

    it('should decrypt sensitive data', () => {
      // Arrange
      const sensitiveData = {
        ssn: '123-45-6789',
        creditCard: '4111-1111-1111-1111',
        email: 'john@example.com',
      };
      const encryptionKey = 'test-encryption-key';
      const encrypted = repositorySecurity.encryptData(sensitiveData, encryptionKey);

      // Act
      const decrypted = repositorySecurity.decryptData(encrypted, encryptionKey);

      // Assert
      expect(decrypted).toBeDefined();
      expect(decrypted).toEqual(sensitiveData);
      expect(mockLogger.debug).toHaveBeenCalledWith('data_decrypted', expect.objectContaining({
        fields: ['ssn', 'creditCard', 'email'],
      }));
    });

    it('should handle encryption errors gracefully', () => {
      // Arrange
      const sensitiveData = { ssn: '123-45-6789' };
      const invalidKey = '';

      // Act & Assert
      expect(() => {
        repositorySecurity.encryptData(sensitiveData, invalidKey);
      }).toThrow('Invalid encryption key');
      expect(mockLogger.error).toHaveBeenCalledWith('encryption_error', expect.objectContaining({
        error: expect.stringContaining('Invalid encryption key'),
      }));
    });

    it('should handle decryption errors gracefully', () => {
      // Arrange
      const invalidEncryptedData = 'invalid-encrypted-data';
      const encryptionKey = 'test-encryption-key';

      // Act & Assert
      expect(() => {
        repositorySecurity.decryptData(invalidEncryptedData, encryptionKey);
      }).toThrow('Invalid encrypted data');
      expect(mockLogger.error).toHaveBeenCalledWith('decryption_error', expect.objectContaining({
        error: expect.stringContaining('Invalid encrypted data'),
      }));
    });

    it('should identify sensitive fields', () => {
      // Arrange
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        ssn: '123-45-6789',
        phone: '555-1234',
        creditCard: '4111-1111-1111-1111',
        address: '123 Main St',
      };

      // Act
      const sensitiveFields = repositorySecurity.identifySensitiveFields(data);

      // Assert
      expect(sensitiveFields).toContain('email');
      expect(sensitiveFields).toContain('ssn');
      expect(sensitiveFields).toContain('creditCard');
      expect(sensitiveFields).not.toContain('name');
      expect(sensitiveFields).not.toContain('address');
    });
  });

  describe('Input Validation and Sanitization', () => {
    it('should validate SQL injection attempts', () => {
      // Arrange
      const maliciousInput = "'; DROP TABLE users; --";
      const fieldType = 'string';

      // Act
      const isValid = repositorySecurity.validateInput(maliciousInput, fieldType);

      // Assert
      expect(isValid).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith('sql_injection_attempt', expect.objectContaining({
        input: maliciousInput,
        fieldType,
      }));
    });

    it('should validate XSS attempts', () => {
      // Arrange
      const maliciousInput = '<script>alert("xss")</script>';
      const fieldType = 'html';

      // Act
      const isValid = repositorySecurity.validateInput(maliciousInput, fieldType);

      // Assert
      expect(isValid).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith('xss_attempt', expect.objectContaining({
        input: maliciousInput,
        fieldType,
      }));
    });

    it('should sanitize input data', () => {
      // Arrange
      const inputData = {
        name: 'John Doe',
        email: 'john@example.com',
        description: '<p>Safe description</p>',
        notes: '<script>alert("xss")</script>Malicious content',
      };

      // Act
      const sanitized = repositorySecurity.sanitizeInput(inputData);

      // Assert
      expect(sanitized).toBeDefined();
      expect(sanitized.name).toBe('John Doe');
      expect(sanitized.email).toBe('john@example.com');
      expect(sanitized.description).toBe('<p>Safe description</p>');
      expect(sanitized.notes).not.toContain('<script>');
      expect(sanitized.notes).not.toContain('</script>');
      expect(mockLogger.debug).toHaveBeenCalledWith('input_sanitized', expect.objectContaining({
        fields: ['description', 'notes'],
      }));
    });

    it('should validate data types', () => {
      // Arrange
      const validationRules = {
        name: { type: 'string', required: true, maxLength: 100 },
        age: { type: 'number', min: 0, max: 150 },
        email: { type: 'email', required: true },
        active: { type: 'boolean' },
      };

      // Act
      const validData = {
        name: 'John Doe',
        age: 25,
        email: 'john@example.com',
        active: true,
      };

      const invalidData = {
        name: '', // Required but empty
        age: -5, // Below minimum
        email: 'invalid-email', // Invalid format
        active: 'true', // Should be boolean
      };

      const validResult = repositorySecurity.validateDataType(validData, validationRules);
      const invalidResult = repositorySecurity.validateDataType(invalidData, validationRules);

      // Assert
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);
      
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toHaveLength(4);
      expect(invalidResult.errors).toContain('Name is required');
      expect(invalidResult.errors).toContain('Age must be between 0 and 150');
    });
  });

  describe('Audit Logging', () => {
    it('should log data access', () => {
      // Arrange
      const auditEvent = {
        userId: 'user-123',
        action: 'read',
        entityType: 'UserProfile',
        entityId: 'user-456',
        timestamp: new Date(),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
      };

      // Act
      repositorySecurity.logDataAccess(auditEvent);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('audit_data_access', expect.objectContaining({
        userId: 'user-123',
        action: 'read',
        entityType: 'UserProfile',
        entityId: 'user-456',
        ipAddress: '192.168.1.100',
      }));
    });

    it('should log data modification', () => {
      // Arrange
      const auditEvent = {
        userId: 'user-123',
        action: 'update',
        entityType: 'UserProfile',
        entityId: 'user-456',
        changes: {
          email: { from: 'old@example.com', to: 'new@example.com' },
          status: { from: 'inactive', to: 'active' },
        },
        timestamp: new Date(),
      };

      // Act
      repositorySecurity.logDataModification(auditEvent);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('audit_data_modification', expect.objectContaining({
        userId: 'user-123',
        action: 'update',
        entityType: 'UserProfile',
        entityId: 'user-456',
        changes: auditEvent.changes,
      }));
    });

    it('should log security events', () => {
      // Arrange
      const securityEvent = {
        type: 'unauthorized_access',
        severity: 'high',
        userId: 'user-123',
        description: 'Attempted to access admin settings without permission',
        timestamp: new Date(),
        metadata: {
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0',
          attemptedResource: 'admin/settings',
        },
      };

      // Act
      repositorySecurity.logSecurityEvent(securityEvent);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith('audit_security_event', expect.objectContaining({
        type: 'unauthorized_access',
        severity: 'high',
        userId: 'user-123',
        description: 'Attempted to access admin settings without permission',
        metadata: securityEvent.metadata,
      }));
    });

    it('should generate audit trail', () => {
      // Arrange
      const entityId = 'user-123';
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      // Act
      const auditTrail = repositorySecurity.generateAuditTrail(entityId, timeRange);

      // Assert
      expect(auditTrail).toBeDefined();
      expect(auditTrail.entityId).toBe(entityId);
      expect(auditTrail.timeRange).toEqual(timeRange);
      expect(auditTrail.events).toBeDefined();
      expect(Array.isArray(auditTrail.events)).toBe(true);
    });
  });

  describe('Security Monitoring', () => {
    it('should detect suspicious activity patterns', () => {
      // Arrange
      const activities = [
        { userId: 'user-123', action: 'read', entityType: 'User', timestamp: new Date(Date.now() - 1000) },
        { userId: 'user-123', action: 'read', entityType: 'User', timestamp: new Date(Date.now() - 2000) },
        { userId: 'user-123', action: 'read', entityType: 'User', timestamp: new Date(Date.now() - 3000) },
        { userId: 'user-123', action: 'read', entityType: 'User', timestamp: new Date(Date.now() - 4000) },
        { userId: 'user-123', action: 'read', entityType: 'User', timestamp: new Date(Date.now() - 5000) },
      ]; // 5 reads in 5 seconds

      // Act
      const suspiciousActivity = repositorySecurity.detectSuspiciousActivity(activities);

      // Assert
      expect(suspiciousActivity).toBeDefined();
      expect(suspiciousActivity.isSuspicious).toBe(true);
      expect(suspiciousActivity.reason).toContain('High frequency access');
      expect(suspiciousActivity.severity).toBe('medium');
    });

    it('should detect brute force attempts', () => {
      // Arrange
      const loginAttempts = [
        { userId: 'user-123', action: 'login', success: false, timestamp: new Date(Date.now() - 1000) },
        { userId: 'user-123', action: 'login', success: false, timestamp: new Date(Date.now() - 2000) },
        { userId: 'user-123', action: 'login', success: false, timestamp: new Date(Date.now() - 3000) },
        { userId: 'user-123', action: 'login', success: false, timestamp: new Date(Date.now() - 4000) },
        { userId: 'user-123', action: 'login', success: false, timestamp: new Date(Date.now() - 5000) },
      ]; // 5 failed logins

      // Act
      const bruteForceAttempt = repositorySecurity.detectBruteForce(loginAttempts);

      // Assert
      expect(bruteForceAttempt).toBeDefined();
      expect(bruteForceAttempt.isBruteForce).toBe(true);
      expect(bruteForceAttempt.userId).toBe('user-123');
      expect(bruteForceAttempt.attemptCount).toBe(5);
      expect(bruteForceAttempt.severity).toBe('high');
    });

    it('should detect data exfiltration patterns', () => {
      // Arrange
      const dataAccess = [
        { userId: 'user-123', action: 'read', entityType: 'User', recordCount: 100, timestamp: new Date(Date.now() - 1000) },
        { userId: 'user-123', action: 'read', entityType: 'User', recordCount: 200, timestamp: new Date(Date.now() - 2000) },
        { userId: 'user-123', action: 'read', entityType: 'User', recordCount: 500, timestamp: new Date(Date.now() - 3000) },
        { userId: 'user-123', action: 'read', entityType: 'User', recordCount: 1000, timestamp: new Date(Date.now() - 4000) },
      ]; // Increasing data access volumes

      // Act
      const exfiltrationAttempt = repositorySecurity.detectDataExfiltration(dataAccess);

      // Assert
      expect(exfiltrationAttempt).toBeDefined();
      expect(exfiltrationAttempt.isExfiltration).toBe(true);
      expect(exfiltrationAttempt.totalRecords).toBe(1800);
      expect(exfiltrationAttempt.severity).toBe('high');
    });

    it('should generate security score', () => {
      // Arrange
      const securityMetrics = {
        failedLogins: 5,
        suspiciousActivity: 2,
        dataExfiltration: 0,
        unauthorizedAccess: 1,
        totalOperations: 1000,
      };

      // Act
      const securityScore = repositorySecurity.calculateSecurityScore(securityMetrics);

      // Assert
      expect(securityScore).toBeDefined();
      expect(securityScore.score).toBeGreaterThanOrEqual(0);
      expect(securityScore.score).toBeLessThanOrEqual(100);
      expect(securityScore.grade).toMatch(/^[A-F]$/); // A-F grade
      expect(securityScore.recommendations).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', () => {
      // Arrange
      const userId = 'user-123';
      const operation = 'read';
      const limit = 10; // 10 operations per minute
      const window = 60000; // 1 minute

      // Act
      const results = [];
      for (let i = 0; i < 15; i++) {
        results.push(repositorySecurity.checkRateLimit(userId, operation, limit, window));
      }

      // Assert
      expect(results.slice(0, 10)).every(result => result.allowed).toBe(true);
      expect(results.slice(10).every(result => result.allowed).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith('rate_limit_exceeded', expect.objectContaining({
        userId,
        operation,
        limit,
      }));
    });

    it('should implement sliding window rate limiting', () => {
      // Arrange
      const userId = 'user-123';
      const operation = 'write';
      const limit = 5;
      const window = 60000; // 1 minute

      // Act
      const now = Date.now();
      const results = [
        repositorySecurity.checkSlidingWindowRateLimit(userId, operation, limit, window, now),
        repositorySecurity.checkSlidingWindowRateLimit(userId, operation, limit, window, now + 10000),
        repositorySecurity.checkSlidingWindowRateLimit(userId, operation, limit, window, now + 20000),
        repositorySecurity.checkSlidingWindowRateLimit(userId, operation, limit, window, now + 30000),
        repositorySecurity.checkSlidingWindowRateLimit(userId, operation, limit, window, now + 40000),
        repositorySecurity.checkSlidingWindowRateLimit(userId, operation, limit, window, now + 50000),
        repositorySecurity.checkSlidingWindowRateLimit(userId, operation, limit, window, now + 60000), // This should be allowed
      ];

      // Assert
      expect(results.every(result => result.allowed)).toBe(true);
    });

    it('should track rate limit statistics', () => {
      // Arrange
      const userId = 'user-123';
      const operation = 'read';
      const limit = 5;

      // Act
      for (let i = 0; i < 10; i++) {
        repositorySecurity.checkRateLimit(userId, operation, limit, 60000);
      }

      const stats = repositorySecurity.getRateLimitStats(userId);

      // Assert
      expect(stats).toBeDefined();
      expect(stats.totalRequests).toBe(10);
      expect(stats.allowedRequests).toBe(5);
      expect(stats.blockedRequests).toBe(5);
      expect(stats.blockRate).toBe(0.5);
    });
  });

  describe('Security Configuration', () => {
    it('should configure security policies', () => {
      // Arrange
      const policies = {
        encryption: {
          algorithm: 'AES-256',
          keyRotation: 'monthly',
        },
        accessControl: {
          sessionTimeout: 3600, // 1 hour
          maxFailedAttempts: 5,
        },
        audit: {
          logLevel: 'info',
          retentionPeriod: '1year',
        },
      };

      // Act
      repositorySecurity.configurePolicies(policies);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('security_policies_configured', expect.objectContaining({
        policies,
      }));
    });

    it('should configure sensitive field patterns', () => {
      // Arrange
      const patterns = [
        { field: 'ssn', pattern: /^\d{3}-\d{2}-\d{4}$/ },
        { field: 'creditCard', pattern: /^\d{4}-\d{4}-\d{4}-\d{4}$/ },
        { field: 'email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      ];

      // Act
      repositorySecurity.configureSensitiveFieldPatterns(patterns);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('sensitive_field_patterns_configured', expect.objectContaining({
        patternsCount: 3,
      }));
    });

    it('should configure security thresholds', () => {
      // Arrange
      const thresholds = {
        maxFailedLogins: 5,
        maxDataAccessPerMinute: 100,
        maxConcurrentSessions: 3,
        suspiciousActivityThreshold: 10,
      };

      // Act
      repositorySecurity.configureThresholds(thresholds);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('security_thresholds_configured', expect.objectContaining({
        thresholds,
      }));
    });
  });

  describe('Security Reports', () => {
    it('should generate security report', () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      // Act
      const report = repositorySecurity.generateSecurityReport(timeRange);

      // Assert
      expect(report).toBeDefined();
      expect(report.period).toEqual(timeRange);
      expect(report.summary).toBeDefined();
      expect(report.summary.totalEvents).toBeGreaterThanOrEqual(0);
      expect(report.summary.securityScore).toBeGreaterThanOrEqual(0);
      expect(report.summary.securityScore).toBeLessThanOrEqual(100);
      expect(report.threats).toBeDefined();
      expect(report.vulnerabilities).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    it('should generate compliance report', () => {
      // Arrange
      const complianceStandards = ['GDPR', 'SOC2', 'HIPAA'];

      // Act
      const report = repositorySecurity.generateComplianceReport(complianceStandards);

      // Assert
      expect(report).toBeDefined();
      expect(report.standards).toEqual(complianceStandards);
      expect(report.GDPR).toBeDefined();
      expect(report.SOC2).toBeDefined();
      expect(report.HIPAA).toBeDefined();
      expect(report.overallCompliance).toBeDefined();
      expect(report.gaps).toBeDefined();
    });

    it('should generate threat intelligence report', () => {
      // Arrange
      const threatData = [
        { type: 'sql_injection', count: 5, severity: 'high' },
        { type: 'xss', count: 3, severity: 'medium' },
        { type: 'brute_force', count: 2, severity: 'high' },
      ];

      // Act
      const report = repositorySecurity.generateThreatIntelligenceReport(threatData);

      // Assert
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.summary.totalThreats).toBe(10);
      expect(report.summary.highSeverityThreats).toBe(7);
      expect(report.threats).toBeDefined();
      expect(report.trends).toBeDefined();
      expect(report.mitigationRecommendations).toBeDefined();
    });
  });

  describe('Security Integration', () => {
    it('should integrate with external security services', async () => {
      // Arrange
      const securityService = {
        validateToken: jest.fn().mockResolvedValue(true),
        checkBlacklist: jest.fn().mockResolvedValue(false),
        reportIncident: jest.fn().mockResolvedValue(true),
      };

      repositorySecurity.addSecurityService(securityService);

      // Act
      const tokenValidation = await repositorySecurity.validateToken('valid-token');
      const blacklistCheck = await repositorySecurity.checkBlacklist('192.168.1.100');
      const incidentReport = await repositorySecurity.reportSecurityIncident({
        type: 'suspicious_activity',
        severity: 'medium',
        description: 'Unusual access pattern detected',
      });

      // Assert
      expect(tokenValidation).toBe(true);
      expect(blacklistCheck).toBe(false);
      expect(incidentReport).toBe(true);
      expect(securityService.validateToken).toHaveBeenCalledWith('valid-token');
      expect(securityService.checkBlacklist).toHaveBeenCalledWith('192.168.1.100');
    });

    it('should handle security service failures gracefully', async () => {
      // Arrange
      const failingService = {
        validateToken: jest.fn().mockRejectedValue(new Error('Service unavailable')),
      };

      repositorySecurity.addSecurityService(failingService);

      // Act
      const tokenValidation = await repositorySecurity.validateToken('test-token');

      // Assert
      expect(tokenValidation).toBe(false); // Fail safe
      expect(mockLogger.error).toHaveBeenCalledWith('security_service_error', expect.objectContaining({
        service: 'validateToken',
        error: 'Service unavailable',
      }));
    });
  });

  describe('Performance and Optimization', () => {
    it('should cache security decisions', () => {
      // Arrange
      const userId = 'user-123';
      const entityType = 'User';
      const entityId = 'user-456';
      const userRoles = ['user', 'admin'];

      // Act
      const result1 = repositorySecurity.checkReadPermission(userId, entityType, entityId, userRoles);
      const result2 = repositorySecurity.checkReadPermission(userId, entityType, entityId, userRoles);

      // Assert
      expect(result1).toBe(result2);
      expect(mockLogger.debug).toHaveBeenCalledWith('security_decision_cached', expect.objectContaining({
        userId,
        entityType,
        operation: 'read',
      }));
    });

    it('should batch security checks', () => {
      // Arrange
      const securityChecks = [
        { userId: 'user-123', entityType: 'User', entityId: 'user-456', operation: 'read', roles: ['user'] },
        { userId: 'user-123', entityType: 'Product', entityId: 'prod-789', operation: 'read', roles: ['user'] },
        { userId: 'user-123', entityType: 'Order', entityId: 'order-101', operation: 'write', roles: ['user'] },
      ];

      // Act
      const results = repositorySecurity.batchSecurityChecks(securityChecks);

      // Assert
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(typeof result.allowed).toBe('boolean');
        expect(result.reason).toBeDefined();
      });
      expect(mockLogger.debug).toHaveBeenCalledWith('batch_security_checks_completed', expect.objectContaining({
        checkCount: 3,
      }));
    });

    it('should optimize security rule evaluation', () => {
      // Arrange
      const startTime = Date.now();
      const complexRules = Array.from({ length: 100 }, (_, i) => ({
        id: `rule-${i}`,
        condition: `field${i} === 'value${i}'`,
        action: 'allow',
      }));

      repositorySecurity.loadSecurityRules(complexRules);

      // Act
      const evaluationResult = repositorySecurity.evaluateSecurityRules({
        field0: 'value0',
        field1: 'value1',
        field2: 'value2',
      });

      const endTime = Date.now();

      // Assert
      expect(evaluationResult).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
      expect(mockLogger.debug).toHaveBeenCalledWith('security_rules_evaluated', expect.objectContaining({
        rulesCount: 100,
        duration: expect.any(Number),
      }));
    });
  });
});
