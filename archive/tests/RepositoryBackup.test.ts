/**
 * RepositoryBackup Tests
 * 
 * Comprehensive test suite for RepositoryBackup functionality including
 * backup creation, restoration, scheduling, and backup management.
 */

import { RepositoryBackup } from '../repositories/RepositoryBackup';
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

describe('RepositoryBackup', () => {
  let repositoryBackup: RepositoryBackup;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryBackup = new RepositoryBackup(mockDbConnection, mockLogger);
  });

  describe('Backup Creation', () => {
    it('should create full backup', async () => {
      // Arrange
      const backupConfig = {
        type: 'full',
        entities: ['users', 'products', 'orders'],
        destination: '/backups/full_backup_2023_01_15.sql',
      };

      mockDbConnection.query = jest.fn()
        .mockResolvedValueOnce({ rows: [{ id: 1, name: 'John' }] }) // users
        .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Product' }] }) // products
        .mockResolvedValueOnce({ rows: [{ id: 1, total: 100 }] }); // orders

      // Act
      const backup = await repositoryBackup.createBackup(backupConfig);

      // Assert
      expect(backup).toBeDefined();
      expect(backup.id).toBeDefined();
      expect(backup.type).toBe('full');
      expect(backup.status).toBe('completed');
      expect(backup.entities).toEqual(['users', 'products', 'orders']);
      expect(backup.destination).toBe('/backups/full_backup_2023_01_15.sql');
      expect(backup.createdAt).toBeDefined();
      expect(backup.completedAt).toBeDefined();
      expect(backup.size).toBeGreaterThan(0);
      expect(mockLogger.info).toHaveBeenCalledWith('backup_created', expect.objectContaining({
        backupId: backup.id,
        type: 'full',
        entities: backup.entities,
      }));
    });

    it('should create incremental backup', async () => {
      // Arrange
      const backupConfig = {
        type: 'incremental',
        entities: ['users', 'orders'],
        destination: '/backups/incremental_backup_2023_01_15.sql',
        fromTimestamp: new Date('2023-01-14T00:00:00Z'),
      };

      mockDbConnection.query = jest.fn()
        .mockResolvedValueOnce({ rows: [{ id: 2, name: 'Jane', updated_at: '2023-01-15' }] }) // users
        .mockResolvedValueOnce({ rows: [{ id: 2, total: 200, updated_at: '2023-01-15' }] }); // orders

      // Act
      const backup = await repositoryBackup.createBackup(backupConfig);

      // Assert
      expect(backup).toBeDefined();
      expect(backup.type).toBe('incremental');
      expect(backup.status).toBe('completed');
      expect(backup.fromTimestamp).toEqual(new Date('2023-01-14T00:00:00Z'));
      expect(backup.changes).toBeDefined();
      expect(backup.changes.users).toBe(1);
      expect(backup.changes.orders).toBe(1);
    });

    it('should create differential backup', async () => {
      // Arrange
      const backupConfig = {
        type: 'differential',
        entities: ['products'],
        destination: '/backups/differential_backup_2023_01_15.sql',
        baseBackupId: 'backup-123',
      };

      mockDbConnection.query = jest.fn()
        .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Product', updated_at: '2023-01-15' }] });

      // Act
      const backup = await repositoryBackup.createBackup(backupConfig);

      // Assert
      expect(backup).toBeDefined();
      expect(backup.type).toBe('differential');
      expect(backup.baseBackupId).toBe('backup-123');
      expect(backup.status).toBe('completed');
    });

    it('should handle backup creation errors', async () => {
      // Arrange
      const backupConfig = {
        type: 'full',
        entities: ['users'],
        destination: '/backups/backup.sql',
      };

      mockDbConnection.query = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      // Act
      const backup = await repositoryBackup.createBackup(backupConfig);

      // Assert
      expect(backup).toBeDefined();
      expect(backup.status).toBe('failed');
      expect(backup.error).toBe('Database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith('backup_creation_failed', expect.objectContaining({
        backupId: backup.id,
        error: 'Database connection failed',
      }));
    });

    it('should validate backup configuration', () => {
      // Arrange
      const invalidConfig = {
        type: 'invalid_type',
        entities: [],
        destination: '',
      };

      // Act & Assert
      expect(() => {
        repositoryBackup.validateBackupConfig(invalidConfig);
      }).toThrow('Invalid backup type');
    });
  });

  describe('Backup Restoration', () => {
    it('should restore from full backup', async () => {
      // Arrange
      const restoreConfig = {
        backupId: 'backup-123',
        type: 'full',
        entities: ['users', 'products'],
        options: {
          dropExisting: true,
          preserveIndexes: true,
        },
      };

      mockDbConnection.query = jest.fn()
        .mockResolvedValueOnce({ rowCount: 1 }) // DROP users
        .mockResolvedValueOnce({ rowCount: 1 }) // CREATE users
        .mockResolvedValueOnce({ rowCount: 10 }) // INSERT users
        .mockResolvedValueOnce({ rowCount: 1 }) // DROP products
        .mockResolvedValueOnce({ rowCount: 1 }) // CREATE products
        .mockResolvedValueOnce({ rowCount: 5 }); // INSERT products

      // Act
      const restoration = await repositoryBackup.restoreBackup(restoreConfig);

      // Assert
      expect(restoration).toBeDefined();
      expect(restoration.backupId).toBe('backup-123');
      expect(restoration.status).toBe('completed');
      expect(restoration.entities).toEqual(['users', 'products']);
      expect(restoration.recordsRestored).toEqual({ users: 10, products: 5 });
      expect(restoration.startedAt).toBeDefined();
      expect(restoration.completedAt).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('backup_restored', expect.objectContaining({
        backupId: 'backup-123',
        entities: ['users', 'products'],
        recordsRestored: restoration.recordsRestored,
      }));
    });

    it('should restore from incremental backup', async () => {
      // Arrange
      const restoreConfig = {
        backupId: 'incremental-backup-123',
        type: 'incremental',
        baseBackupId: 'full-backup-123',
        entities: ['orders'],
        options: {
          mergeStrategy: 'update',
        },
      };

      mockDbConnection.query = jest.fn()
        .mockResolvedValueOnce({ rowCount: 5 }) // UPDATE existing orders
        .mockResolvedValueOnce({ rowCount: 3 }); // INSERT new orders

      // Act
      const restoration = await repositoryBackup.restoreBackup(restoreConfig);

      // Assert
      expect(restoration).toBeDefined();
      expect(restoration.type).toBe('incremental');
      expect(restoration.baseBackupId).toBe('full-backup-123');
      expect(restoration.status).toBe('completed');
      expect(restoration.recordsRestored).toEqual({ orders: 8 });
    });

    it('should handle restoration errors gracefully', async () => {
      // Arrange
      const restoreConfig = {
        backupId: 'backup-123',
        type: 'full',
        entities: ['users'],
        options: {},
      };

      mockDbConnection.query = jest.fn().mockRejectedValue(new Error('Restore failed'));

      // Act
      const restoration = await repositoryBackup.restoreBackup(restoreConfig);

      // Assert
      expect(restoration).toBeDefined();
      expect(restoration.status).toBe('failed');
      expect(restoration.error).toBe('Restore failed');
      expect(mockLogger.error).toHaveBeenCalledWith('backup_restoration_failed', expect.objectContaining({
        backupId: 'backup-123',
        error: 'Restore failed',
      }));
    });

    it('should validate restore configuration', () => {
      // Arrange
      const invalidConfig = {
        backupId: '',
        type: 'invalid',
        entities: [],
      };

      // Act & Assert
      expect(() => {
        repositoryBackup.validateRestoreConfig(invalidConfig);
      }).toThrow('Backup ID is required');
    });
  });

  describe('Backup Scheduling', () => {
    it('should create backup schedule', () => {
      // Arrange
      const scheduleConfig = {
        name: 'daily_full_backup',
        type: 'full',
        entities: ['users', 'products', 'orders'],
        frequency: 'daily',
        time: '02:00',
        retention: '30d',
        destination: '/backups/daily',
      };

      // Act
      const schedule = repositoryBackup.createSchedule(scheduleConfig);

      // Assert
      expect(schedule).toBeDefined();
      expect(schedule.id).toBeDefined();
      expect(schedule.name).toBe('daily_full_backup');
      expect(schedule.type).toBe('full');
      expect(schedule.frequency).toBe('daily');
      expect(schedule.time).toBe('02:00');
      expect(schedule.retention).toBe('30d');
      expect(schedule.enabled).toBe(true);
      expect(schedule.nextRun).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('backup_schedule_created', expect.objectContaining({
        scheduleId: schedule.id,
        name: 'daily_full_backup',
        frequency: 'daily',
      }));
    });

    it('should calculate next run time', () => {
      // Arrange
      const now = new Date('2023-01-15T10:00:00Z');
      const schedule = {
        frequency: 'daily',
        time: '02:00',
        enabled: true,
      };

      // Act
      const nextRun = repositoryBackup.calculateNextRun(schedule, now);

      // Assert
      expect(nextRun).toBeDefined();
      expect(nextRun.getDate()).toBe(16); // Next day
      expect(nextRun.getHours()).toBe(2);
      expect(nextRun.getMinutes()).toBe(0);
    });

    it('should execute scheduled backup', async () => {
      // Arrange
      const schedule = {
        id: 'schedule-123',
        name: 'daily_backup',
        type: 'full',
        entities: ['users'],
        frequency: 'daily',
        time: '02:00',
        retention: '7d',
        destination: '/backups',
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [{ id: 1, name: 'John' }] });

      // Act
      const execution = await repositoryBackup.executeScheduledBackup(schedule);

      // Assert
      expect(execution).toBeDefined();
      expect(execution.scheduleId).toBe('schedule-123');
      expect(execution.status).toBe('completed');
      expect(execution.backupId).toBeDefined();
      expect(execution.startedAt).toBeDefined();
      expect(execution.completedAt).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('scheduled_backup_executed', expect.objectContaining({
        scheduleId: 'schedule-123',
        backupId: execution.backupId,
      }));
    });

    it('should handle backup retention cleanup', async () => {
      // Arrange
      const retentionConfig = {
        policy: 'keep_last_n',
        count: 7,
        entity: 'users',
      };

      const existingBackups = [
        { id: 'backup-1', createdAt: new Date('2023-01-08'), size: 1000000 },
        { id: 'backup-2', createdAt: new Date('2023-01-09'), size: 1100000 },
        { id: 'backup-3', createdAt: new Date('2023-01-10'), size: 1200000 },
        { id: 'backup-4', createdAt: new Date('2023-01-11'), size: 1300000 },
        { id: 'backup-5', createdAt: new Date('2023-01-12'), size: 1400000 },
        { id: 'backup-6', createdAt: new Date('2023-01-13'), size: 1500000 },
        { id: 'backup-7', createdAt: new Date('2023-01-14'), size: 1600000 },
        { id: 'backup-8', createdAt: new Date('2023-01-15'), size: 1700000 }, // This should be kept
      ];

      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      const cleanup = await repositoryBackup.executeRetentionCleanup(retentionConfig, existingBackups);

      // Assert
      expect(cleanup).toBeDefined();
      expect(cleanup.deletedBackups).toHaveLength(1);
      expect(cleanup.deletedBackups[0]).toBe('backup-1');
      expect(cleanup.spaceFreed).toBe(1000000);
      expect(mockLogger.info).toHaveBeenCalledWith('backup_retention_cleanup', expect.objectContaining({
        deletedCount: 1,
        spaceFreed: 1000000,
      }));
    });
  });

  describe('Backup Management', () => {
    it('should list all backups', async () => {
      // Arrange
      const mockBackups = [
        {
          id: 'backup-1',
          type: 'full',
          status: 'completed',
          createdAt: new Date('2023-01-15'),
          size: 5000000,
        },
        {
          id: 'backup-2',
          type: 'incremental',
          status: 'completed',
          createdAt: new Date('2023-01-16'),
          size: 1000000,
        },
      ];

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: mockBackups });

      // Act
      const backups = await repositoryBackup.listBackups();

      // Assert
      expect(backups).toBeDefined();
      expect(backups).toHaveLength(2);
      expect(backups[0].id).toBe('backup-1');
      expect(backups[0].type).toBe('full');
      expect(backups[1].id).toBe('backup-2');
      expect(backups[1].type).toBe('incremental');
    });

    it('should get backup details', async () => {
      // Arrange
      const backupId = 'backup-123';
      const mockBackup = {
        id: backupId,
        type: 'full',
        status: 'completed',
        entities: ['users', 'products'],
        createdAt: new Date('2023-01-15'),
        completedAt: new Date('2023-01-15T01:30:00Z'),
        size: 5000000,
        checksum: 'abc123',
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockBackup] });

      // Act
      const backup = await repositoryBackup.getBackup(backupId);

      // Assert
      expect(backup).toBeDefined();
      expect(backup.id).toBe(backupId);
      expect(backup.type).toBe('full');
      expect(backup.entities).toEqual(['users', 'products']);
      expect(backup.checksum).toBe('abc123');
    });

    it('should delete backup', async () => {
      // Arrange
      const backupId = 'backup-123';
      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      const result = await repositoryBackup.deleteBackup(backupId);

      // Assert
      expect(result).toBe(true);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        'DELETE FROM backups WHERE id = $1',
        [backupId]
      );
      expect(mockLogger.info).toHaveBeenCalledWith('backup_deleted', expect.objectContaining({
        backupId,
      }));
    });

    it('should verify backup integrity', async () => {
      // Arrange
      const backupId = 'backup-123';
      const mockBackup = {
        id: backupId,
        checksum: 'abc123',
        size: 5000000,
      };

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [mockBackup] });

      // Act
      const verification = await repositoryBackup.verifyBackupIntegrity(backupId);

      // Assert
      expect(verification).toBeDefined();
      expect(verification.backupId).toBe(backupId);
      expect(verification.valid).toBe(true);
      expect(verification.checksumMatch).toBe(true);
      expect(verification.sizeMatch).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('backup_integrity_verified', expect.objectContaining({
        backupId,
        valid: true,
      }));
    });
  });

  describe('Backup Analytics', () => {
    it('should generate backup statistics', async () => {
      // Arrange
      const mockBackups = [
        { type: 'full', size: 5000000, duration: 300, status: 'completed' },
        { type: 'incremental', size: 1000000, duration: 60, status: 'completed' },
        { type: 'full', size: 5200000, duration: 320, status: 'completed' },
        { type: 'incremental', size: 1200000, duration: 70, status: 'failed' },
      ];

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: mockBackups });

      // Act
      const stats = await repositoryBackup.getBackupStatistics();

      // Assert
      expect(stats).toBeDefined();
      expect(stats.totalBackups).toBe(4);
      expect(stats.successfulBackups).toBe(3);
      expect(stats.failedBackups).toBe(1);
      expect(stats.successRate).toBe(0.75);
      expect(stats.totalSize).toBe(12400000);
      expect(stats.averageSize).toBe(3100000);
      expect(stats.averageDuration).toBe(187.5);
      expect(stats.byType.full).toBeDefined();
      expect(stats.byType.incremental).toBeDefined();
    });

    it('should analyze backup trends', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockTrendData = [
        { date: '2023-01-01', backupCount: 1, totalSize: 5000000, successRate: 1.0 },
        { date: '2023-01-02', backupCount: 2, totalSize: 12000000, successRate: 0.5 },
        { date: '2023-01-03', backupCount: 1, totalSize: 5500000, successRate: 1.0 },
      ];

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: mockTrendData });

      // Act
      const trends = await repositoryBackup.analyzeBackupTrends(timeRange);

      // Assert
      expect(trends).toBeDefined();
      expect(trends.period).toEqual(timeRange);
      expect(trends.dailyData).toHaveLength(3);
      expect(trends.totalBackups).toBe(4);
      expect(trends.totalSize).toBe(22500000);
      expect(trends.averageSuccessRate).toBe(0.75);
      expect(trends.growthRate).toBeDefined();
    });

    it('should generate backup performance report', async () => {
      // Arrange
      const mockPerformanceData = [
        {
          backupId: 'backup-1',
          type: 'full',
          duration: 300,
          size: 5000000,
          throughput: 16666.67, // bytes per second
          entities: ['users', 'products'],
        },
        {
          backupId: 'backup-2',
          type: 'incremental',
          duration: 60,
          size: 1000000,
          throughput: 16666.67,
          entities: ['orders'],
        },
      ];

      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: mockPerformanceData });

      // Act
      const report = await repositoryBackup.generatePerformanceReport();

      // Assert
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.summary.averageDuration).toBe(180);
      expect(report.summary.averageThroughput).toBe(16666.67);
      expect(report.byType).toBeDefined();
      expect(report.byType.full).toBeDefined();
      expect(report.byType.incremental).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });
  });

  describe('Backup Configuration', () => {
    it('should configure backup settings', () => {
      // Arrange
      const settings = {
        compression: 'gzip',
        encryption: true,
        checksum: 'sha256',
        parallelism: 4,
        chunkSize: 1024 * 1024, // 1MB
      };

      // Act
      repositoryBackup.configureSettings(settings);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('backup_settings_configured', expect.objectContaining({
        settings,
      }));
    });

    it('should configure backup destinations', () => {
      // Arrange
      const destinations = [
        {
          name: 'local_storage',
          type: 'local',
          path: '/backups',
          retention: '30d',
        },
        {
          name: 's3_storage',
          type: 's3',
          bucket: 'backup-bucket',
          region: 'us-west-2',
          retention: '90d',
        },
      ];

      // Act
      repositoryBackup.configureDestinations(destinations);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('backup_destinations_configured', expect.objectContaining({
        destinationsCount: 2,
      }));
    });

    it('should configure backup notifications', () => {
      // Arrange
      const notifications = {
        onSuccess: ['admin@example.com'],
        onFailure: ['admin@example.com', 'ops@example.com'],
        onWarning: ['ops@example.com'],
        webhookUrl: 'https://api.example.com/webhooks/backup',
      };

      // Act
      repositoryBackup.configureNotifications(notifications);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('backup_notifications_configured', expect.objectContaining({
        notifications,
      }));
    });
  });

  describe('Backup Security', () => {
    it('should encrypt backup data', async () => {
      // Arrange
      const backupData = 'sensitive backup data';
      const encryptionKey = 'test-encryption-key';

      // Act
      const encrypted = repositoryBackup.encryptBackupData(backupData, encryptionKey);

      // Assert
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(backupData);
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toContain('sensitive backup data');
    });

    it('should decrypt backup data', async () => {
      // Arrange
      const backupData = 'sensitive backup data';
      const encryptionKey = 'test-encryption-key';
      const encrypted = repositoryBackup.encryptBackupData(backupData, encryptionKey);

      // Act
      const decrypted = repositoryBackup.decryptBackupData(encrypted, encryptionKey);

      // Assert
      expect(decrypted).toBe(backupData);
    });

    it('should verify backup checksum', () => {
      // Arrange
      const backupData = 'backup data content';
      const expectedChecksum = 'd8e8fca2dc0f896fd7cb4cb0031ba249';

      // Act
      const isValid = repositoryBackup.verifyChecksum(backupData, expectedChecksum);

      // Assert
      expect(isValid).toBe(true);
    });

    it('should handle encryption errors gracefully', () => {
      // Arrange
      const backupData = 'backup data';
      const invalidKey = '';

      // Act & Assert
      expect(() => {
        repositoryBackup.encryptBackupData(backupData, invalidKey);
      }).toThrow('Invalid encryption key');
    });
  });

  describe('Backup Automation', () => {
    it('should start backup scheduler', () => {
      // Arrange
      const schedules = [
        {
          id: 'schedule-1',
          frequency: 'daily',
          time: '02:00',
          enabled: true,
        },
        {
          id: 'schedule-2',
          frequency: 'weekly',
          time: '03:00',
          enabled: true,
        },
      ];

      // Act
      repositoryBackup.startScheduler(schedules);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('backup_scheduler_started', expect.objectContaining({
        schedulesCount: 2,
      }));
    });

    it('should stop backup scheduler', () => {
      // Act
      repositoryBackup.stopScheduler();

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('backup_scheduler_stopped');
    });

    it('should enable/disable backup schedules', () => {
      // Arrange
      const scheduleId = 'schedule-123';

      // Act
      repositoryBackup.enableSchedule(scheduleId);
      const enabledSchedule = repositoryBackup.getSchedule(scheduleId);
      
      repositoryBackup.disableSchedule(scheduleId);
      const disabledSchedule = repositoryBackup.getSchedule(scheduleId);

      // Assert
      expect(enabledSchedule.enabled).toBe(true);
      expect(disabledSchedule.enabled).toBe(false);
    });
  });

  describe('Backup Integration', () => {
    it('should integrate with cloud storage', async () => {
      // Arrange
      const cloudStorage = {
        upload: jest.fn().mockResolvedValue({ url: 'https://s3.amazonaws.com/backup.sql' }),
        download: jest.fn().mockResolvedValue('backup data'),
        list: jest.fn().mockResolvedValue(['backup1.sql', 'backup2.sql']),
        delete: jest.fn().mockResolvedValue(true),
      };

      repositoryBackup.addCloudStorage('s3', cloudStorage);

      // Act
      const uploadResult = await repositoryBackup.uploadToCloud('backup-123', 's3');
      const downloadResult = await repositoryBackup.downloadFromCloud('backup-123', 's3');
      const listResult = await repositoryBackup.listCloudBackups('s3');
      const deleteResult = await repositoryBackup.deleteFromCloud('backup-123', 's3');

      // Assert
      expect(uploadResult.url).toBe('https://s3.amazonaws.com/backup.sql');
      expect(downloadResult).toBe('backup data');
      expect(listResult).toHaveLength(2);
      expect(deleteResult).toBe(true);
      expect(cloudStorage.upload).toHaveBeenCalled();
      expect(cloudStorage.download).toHaveBeenCalled();
    });

    it('should integrate with monitoring systems', async () => {
      // Arrange
      const monitoringSystem = {
        reportBackupStatus: jest.fn().mockResolvedValue(true),
        getBackupMetrics: jest.fn().mockResolvedValue({
          successRate: 0.95,
          averageDuration: 180,
        }),
      };

      repositoryBackup.addMonitoringSystem(monitoringSystem);

      // Act
      const reportResult = await repositoryBackup.reportBackupStatus('backup-123', 'completed');
      const metrics = await repositoryBackup.getBackupMetrics();

      // Assert
      expect(reportResult).toBe(true);
      expect(metrics.successRate).toBe(0.95);
      expect(monitoringSystem.reportBackupStatus).toHaveBeenCalledWith('backup-123', 'completed');
      expect(monitoringSystem.getBackupMetrics).toHaveBeenCalled();
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle backup interruption gracefully', async () => {
      // Arrange
      const backupConfig = {
        type: 'full',
        entities: ['users', 'products'],
        destination: '/backups/interrupted_backup.sql',
      };

      mockDbConnection.query = jest.fn()
        .mockResolvedValueOnce({ rows: [{ id: 1, name: 'John' }] }) // users - success
        .mockRejectedValueOnce(new Error('Connection lost during products backup')); // products - failure

      // Act
      const backup = await repositoryBackup.createBackup(backupConfig);

      // Assert
      expect(backup).toBeDefined();
      expect(backup.status).toBe('partial');
      expect(backup.completedEntities).toEqual(['users']);
      expect(backup.failedEntities).toEqual(['products']);
      expect(backup.error).toBe('Connection lost during products backup');
      expect(mockLogger.warn).toHaveBeenCalledWith('backup_partial_completion', expect.objectContaining({
        backupId: backup.id,
        completedEntities: ['users'],
        failedEntities: ['products'],
      }));
    });

    it('should implement backup retry mechanism', async () => {
      // Arrange
      const backupConfig = {
        type: 'full',
        entities: ['users'],
        destination: '/backups/retry_backup.sql',
        retryAttempts: 3,
      };

      mockDbConnection.query = jest.fn()
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockRejectedValueOnce(new Error('Another failure'))
        .mockResolvedValueOnce({ rows: [{ id: 1, name: 'John' }] });

      // Act
      const backup = await repositoryBackup.createBackup(backupConfig);

      // Assert
      expect(backup).toBeDefined();
      expect(backup.status).toBe('completed');
      expect(backup.retryCount).toBe(2);
      expect(mockLogger.info).toHaveBeenCalledWith('backup_retry_success', expect.objectContaining({
        backupId: backup.id,
        attempt: 3,
      }));
    });

    it('should implement backup rollback on failure', async () => {
      // Arrange
      const restoreConfig = {
        backupId: 'backup-123',
        type: 'full',
        entities: ['users', 'products'],
        options: {
          rollbackOnFailure: true,
        },
      };

      mockDbConnection.query = jest.fn()
        .mockResolvedValueOnce({ rowCount: 10 }) // Restore users - success
        .mockRejectedValueOnce(new Error('Products restore failed')); // Restore products - failure
        .mockResolvedValueOnce({ rowCount: 10 }); // Rollback users

      // Act
      const restoration = await repositoryBackup.restoreBackup(restoreConfig);

      // Assert
      expect(restoration).toBeDefined();
      expect(restoration.status).toBe('failed');
      expect(restoration.rollbackCompleted).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalledWith('backup_restoration_rolled_back', expect.objectContaining({
        backupId: 'backup-123',
        reason: 'Products restore failed',
      }));
    });
  });
});
