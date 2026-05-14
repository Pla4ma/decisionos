/**
 * BackupRepository Tests
 * 
 * Comprehensive test suite for BackupRepository functionality including
 * backup creation, execution, restoration, scheduling, and analytics.
 */

import { BackupRepository } from '../repositories/BackupRepository';
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

describe('BackupRepository', () => {
  let backupRepository: BackupRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    backupRepository = new BackupRepository(mockDbConnection, mockCacheManager, mockLogger);
  });

  describe('Backup Management', () => {
    it('should create backup', async () => {
      // Arrange
      const backupData = {
        name: 'Daily Database Backup',
        description: 'Daily backup of all database tables',
        type: 'full',
        source: 'database',
        target: 's3',
        configuration: {
          bucket: 'vex-backups',
          prefix: 'database/',
          compression: true,
          encryption: true,
        },
        schedule: {
          enabled: true,
          frequency: 'daily',
          time: '02:00',
          timezone: 'UTC',
        },
        retention: {
          policy: 'keep_30_days',
          maxBackups: 30,
        },
        metadata: {
          createdBy: 'admin-123',
          environment: 'production',
        },
      };

      const mockResult = {
        rows: [{
          id: 'backup-123',
          name: 'Daily Database Backup',
          description: 'Daily backup of all database tables',
          type: 'full',
          source: 'database',
          target: 's3',
          configuration: JSON.stringify(backupData.configuration),
          schedule: JSON.stringify(backupData.schedule),
          retention: JSON.stringify(backupData.retention),
          metadata: JSON.stringify(backupData.metadata),
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.createBackup(backupData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(backupData.name);
      expect(result.type).toBe(backupData.type);
      expect(result.source).toBe(backupData.source);
      expect(result.target).toBe(backupData.target);
      expect(result.status).toBe('active');
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO backups'),
        expect.arrayContaining([
          backupData.name,
          backupData.description,
          backupData.type,
          backupData.source,
          backupData.target,
          JSON.stringify(backupData.configuration),
          JSON.stringify(backupData.schedule),
          JSON.stringify(backupData.retention),
          JSON.stringify(backupData.metadata),
        ])
      );
    });

    it('should find backup by ID', async () => {
      // Arrange
      const backupId = 'backup-123';
      const mockResult = {
        rows: [{
          id: backupId,
          name: 'Daily Database Backup',
          description: 'Daily backup of all database tables',
          type: 'full',
          source: 'database',
          target: 's3',
          configuration: JSON.stringify({ bucket: 'vex-backups', prefix: 'database/' }),
          schedule: JSON.stringify({ enabled: true, frequency: 'daily' }),
          retention: JSON.stringify({ policy: 'keep_30_days', maxBackups: 30 }),
          metadata: JSON.stringify({ createdBy: 'admin-123' }),
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.findById(backupId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(backupId);
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        expect.stringContaining('findById'),
        backupId
      );
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should update backup', async () => {
      // Arrange
      const backupId = 'backup-123';
      const updates = {
        name: 'Updated Daily Backup',
        description: 'Updated daily backup configuration',
        configuration: {
          bucket: 'vex-backups-new',
          prefix: 'database/',
          compression: true,
          encryption: true,
        },
        status: 'inactive',
      };

      const mockResult = {
        rows: [{
          id: backupId,
          name: 'Updated Daily Backup',
          description: 'Updated daily backup configuration',
          configuration: JSON.stringify(updates.configuration),
          status: 'inactive',
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.updateBackup(backupId, updates);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(updates.name);
      expect(result.status).toBe(updates.status);
      expect(mockCacheManager.delete).toHaveBeenCalled();
    });

    it('should delete backup', async () => {
      // Arrange
      const backupId = 'backup-123';
      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      const result = await backupRepository.deleteBackup(backupId);

      // Assert
      expect(result).toBe(true);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        'DELETE FROM backups WHERE id = $1',
        [backupId]
      );
      expect(mockCacheManager.delete).toHaveBeenCalled();
    });
  });

  describe('Backup Queries', () => {
    it('should get backups by type', async () => {
      // Arrange
      const type = 'full';
      const mockResult = {
        rows: [
          {
            id: 'backup-1',
            name: 'Daily Database Backup',
            type: type,
            source: 'database',
            target: 's3',
            status: 'active',
          },
          {
            id: 'backup-2',
            name: 'Weekly Full Backup',
            type: type,
            source: 'database',
            target: 's3',
            status: 'active',
          },
        ],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.getBackupsByType(type);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].type).toBe(type);
      expect(result[1].type).toBe(type);
    });

    it('should get backups by source', async () => {
      // Arrange
      const source = 'database';
      const mockResult = {
        rows: [
          {
            id: 'backup-1',
            name: 'Daily Database Backup',
            type: 'full',
            source: source,
            target: 's3',
            status: 'active',
          },
          {
            id: 'backup-2',
            name: 'Database Incremental',
            type: 'incremental',
            source: source,
            target: 's3',
            status: 'active',
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.getBackupsBySource(source);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].source).toBe(source);
      expect(result[1].source).toBe(source);
    });

    it('should get active backups', async () => {
      // Arrange
      const mockResult = {
        rows: [
          {
            id: 'backup-1',
            name: 'Daily Database Backup',
            type: 'full',
            source: 'database',
            target: 's3',
            status: 'active',
          },
          {
            id: 'backup-2',
            name: 'File System Backup',
            type: 'incremental',
            source: 'filesystem',
            target: 's3',
            status: 'active',
          },
        ],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.getActiveBackups();

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].status).toBe('active');
      expect(result[1].status).toBe('active');
    });

    it('should search backups', async () => {
      // Arrange
      const searchTerm = 'database';
      const filters = {
        type: 'full',
        source: 'database',
        status: 'active',
      };
      const options = {
        limit: 10,
        offset: 0,
      };

      const mockResult = {
        rows: [
          {
            id: 'backup-1',
            name: 'Daily Database Backup',
            type: 'full',
            source: 'database',
            target: 's3',
            status: 'active',
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.searchBackups(searchTerm, filters, options);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name.toLowerCase()).toContain(searchTerm);
    });
  });

  describe('Backup Execution', () => {
    it('should execute backup', async () => {
      // Arrange
      const backupId = 'backup-123';
      const executionConfig = {
        force: false,
        dryRun: false,
        tags: ['daily', 'manual'],
      };

      const mockResult = {
        rows: [{
          id: 'execution-123',
          backup_id: backupId,
          status: 'running',
          started_at: new Date(),
          configuration: JSON.stringify(executionConfig),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.executeBackup(backupId, executionConfig);

      // Assert
      expect(result).toBeDefined();
      expect(result.backupId).toBe(backupId);
      expect(result.status).toBe('running');
    });

    it('should update execution status', async () => {
      // Arrange
      const executionId = 'execution-123';
      const status = 'completed';
      const results = {
        filesBackedUp: 1500,
        totalSize: 5368709120, // 5GB
        compressionRatio: 0.65,
        duration: 1800000, // 30 minutes
        checksum: 'sha256:abc123',
        location: 's3://vex-backups/database/backup-2023-01-15.sql.gz',
        metadata: {
          tables: ['users', 'orders', 'products'],
          rowCount: 100000,
        },
      };

      const mockResult = {
        rows: [{
          id: executionId,
          backup_id: 'backup-123',
          status: status,
          started_at: new Date('2023-01-15'),
          completed_at: new Date('2023-01-15'),
          results: JSON.stringify(results),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.updateExecutionStatus(executionId, status, results);

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
          backup_id: 'backup-123',
          status: 'completed',
          started_at: new Date('2023-01-15'),
          completed_at: new Date('2023-01-15'),
          duration: 1800000,
          results: JSON.stringify({
            filesBackedUp: 1500,
            totalSize: 5368709120,
            location: 's3://vex-backups/database/backup-2023-01-15.sql.gz',
          }),
          error: null,
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.getExecutionDetails(executionId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(executionId);
      expect(result.status).toBe('completed');
      expect(result.duration).toBe(1800000);
    });

    it('should get execution history', async () => {
      // Arrange
      const backupId = 'backup-123';
      const options = {
        limit: 10,
        offset: 0,
        status: 'completed',
      };

      const mockResult = {
        rows: [
          {
            id: 'execution-1',
            backup_id: backupId,
            status: 'completed',
            started_at: new Date('2023-01-15'),
            completed_at: new Date('2023-01-15'),
            duration: 1800000,
          },
          {
            id: 'execution-2',
            backup_id: backupId,
            status: 'completed',
            started_at: new Date('2023-01-14'),
            completed_at: new Date('2023-01-14'),
            duration: 1750000,
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.getExecutionHistory(backupId, options);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].backupId).toBe(backupId);
      expect(result[1].backupId).toBe(backupId);
    });
  });

  describe('Backup Restoration', () => {
    it('should restore backup', async () => {
      // Arrange
      const executionId = 'execution-123';
      const restoreConfig = {
        target: 'database',
        restorePoint: '2023-01-15',
        tables: ['users', 'orders'],
        dryRun: false,
        force: false,
      };

      const mockResult = {
        rows: [{
          id: 'restore-123',
          execution_id: executionId,
          status: 'running',
          started_at: new Date(),
          configuration: JSON.stringify(restoreConfig),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.restoreBackup(executionId, restoreConfig);

      // Assert
      expect(result).toBeDefined();
      expect(result.executionId).toBe(executionId);
      expect(result.status).toBe('running');
    });

    it('should update restore status', async () => {
      // Arrange
      const restoreId = 'restore-123';
      const status = 'completed';
      const results = {
        tablesRestored: 2,
        recordsRestored: 50000,
        duration: 900000, // 15 minutes
        checksumVerified: true,
        metadata: {
          restorePoint: '2023-01-15',
          conflictsResolved: 5,
        },
      };

      const mockResult = {
        rows: [{
          id: restoreId,
          execution_id: 'execution-123',
          status: status,
          started_at: new Date('2023-01-15'),
          completed_at: new Date('2023-01-15'),
          results: JSON.stringify(results),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.updateRestoreStatus(restoreId, status, results);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(status);
      expect(result.results).toBeDefined();
    });

    it('should get restore details', async () => {
      // Arrange
      const restoreId = 'restore-123';
      const mockResult = {
        rows: [{
          id: restoreId,
          execution_id: 'execution-123',
          status: 'completed',
          started_at: new Date('2023-01-15'),
          completed_at: new Date('2023-01-15'),
          duration: 900000,
          results: JSON.stringify({
            tablesRestored: 2,
            recordsRestored: 50000,
            checksumVerified: true,
          }),
          error: null,
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.getRestoreDetails(restoreId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(restoreId);
      expect(result.status).toBe('completed');
      expect(result.duration).toBe(900000);
    });

    it('should get restore history', async () => {
      // Arrange
      const executionId = 'execution-123';
      const mockResult = {
        rows: [
          {
            id: 'restore-1',
            execution_id: executionId,
            status: 'completed',
            started_at: new Date('2023-01-15'),
            completed_at: new Date('2023-01-15'),
            duration: 900000,
          },
          {
            id: 'restore-2',
            execution_id: executionId,
            status: 'failed',
            started_at: new Date('2023-01-10'),
            completed_at: new Date('2023-01-10'),
            duration: 600000,
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.getRestoreHistory(executionId);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].executionId).toBe(executionId);
      expect(result[1].executionId).toBe(executionId);
    });
  });

  describe('Backup Scheduling', () => {
    it('should schedule backup', async () => {
      // Arrange
      const backupId = 'backup-123';
      const scheduleConfig = {
        enabled: true,
        frequency: 'daily',
        time: '02:00',
        timezone: 'UTC',
        retryPolicy: {
          maxRetries: 3,
          retryDelay: 3600,
        },
      };

      const mockResult = {
        rows: [{
          id: 'schedule-123',
          backup_id: backupId,
          enabled: true,
          frequency: 'daily',
          time: '02:00',
          timezone: 'UTC',
          next_run: new Date('2023-01-16T02:00:00Z'),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.scheduleBackup(backupId, scheduleConfig);

      // Assert
      expect(result).toBeDefined();
      expect(result.backupId).toBe(backupId);
      expect(result.enabled).toBe(scheduleConfig.enabled);
      expect(result.frequency).toBe(scheduleConfig.frequency);
    });

    it('should update schedule', async () => {
      // Arrange
      const scheduleId = 'schedule-123';
      const updates = {
        enabled: false,
        frequency: 'weekly',
        dayOfWeek: 0, // Sunday
        time: '03:00',
      };

      const mockResult = {
        rows: [{
          id: scheduleId,
          backup_id: 'backup-123',
          enabled: false,
          frequency: 'weekly',
          day_of_week: 0,
          time: '03:00',
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.updateSchedule(scheduleId, updates);

      // Assert
      expect(result).toBeDefined();
      expect(result.enabled).toBe(updates.enabled);
      expect(result.frequency).toBe(updates.frequency);
    });

    it('should get scheduled backups', async () => {
      // Arrange
      const mockResult = {
        rows: [
          {
            id: 'schedule-1',
            backup_id: 'backup-123',
            backup_name: 'Daily Database Backup',
            enabled: true,
            frequency: 'daily',
            next_run: new Date('2023-01-16T02:00:00Z'),
          },
          {
            id: 'schedule-2',
            backup_id: 'backup-456',
            backup_name: 'Weekly Full Backup',
            enabled: true,
            frequency: 'weekly',
            next_run: new Date('2023-01-22T02:00:00Z'),
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.getScheduledBackups();

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
            backup_id: 'backup-123',
            backup_name: 'Daily Database Backup',
            next_run: new Date('2023-01-16T02:00:00Z'),
            frequency: 'daily',
          },
          {
            id: 'schedule-2',
            backup_id: 'backup-456',
            backup_name: 'Weekly Full Backup',
            next_run: new Date('2023-01-22T02:00:00Z'),
            frequency: 'weekly',
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.getPendingScheduledRuns();

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].nextRun).toBeDefined();
      expect(result[1].nextRun).toBeDefined();
    });
  });

  describe('Backup Analytics', () => {
    it('should get backup statistics', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [{
          total_backups: 50,
          backups_by_type: { full: 15, incremental: 25, differential: 10 },
          backups_by_source: { database: 20, filesystem: 15, application: 15 },
          backups_by_status: { active: 45, inactive: 3, archived: 2 },
          total_executions: 500,
          successful_executions: 480,
          failed_executions: 20,
          average_execution_time: 1800000,
          total_storage_used: 107374182400, // 100GB
          compression_savings: 35.5,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.getBackupStats(timeRange);

      // Assert
      expect(result).toBeDefined();
      expect(result.totalBackups).toBe(50);
      expect(result.backupsByType.full).toBe(15);
      expect(result.successfulExecutions).toBe(480);
      expect(result.averageExecutionTime).toBe(1800000);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should get popular backups', async () => {
      // Arrange
      const limit = 10;
      const mockResult = {
        rows: [
          { backup_id: 'backup-1', backup_name: 'Daily Database Backup', execution_count: 30, source: 'database' },
          { backup_id: 'backup-2', backup_name: 'File System Backup', execution_count: 25, source: 'filesystem' },
          { backup_id: 'backup-3', backup_name: 'Application Backup', execution_count: 20, source: 'application' },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.getPopularBackups(limit);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(3);
      expect(result[0].backupName).toBe('Daily Database Backup');
      expect(result[0].executionCount).toBe(30);
    });

    it('should get execution trends', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [
          { date: '2023-01-01', total_executions: 15, successful: 14, failed: 1, average_duration: 1750000 },
          { date: '2023-01-02', total_executions: 18, successful: 17, failed: 1, average_duration: 1800000 },
          { date: '2023-01-03', total_executions: 12, successful: 12, failed: 0, average_duration: 1700000 },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.getExecutionTrends(timeRange);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(3);
      expect(result[0].date).toBe('2023-01-01');
      expect(result[0].totalExecutions).toBe(15);
    });

    it('should get storage analytics', async () => {
      // Arrange
      const mockResult = {
        rows: [
          { backup_type: 'full', total_size: 53687091200, compressed_size: 34603013888, count: 15 },
          { backup_type: 'incremental', total_size: 10737418240, compressed_size: 6442450944, count: 25 },
          { backup_type: 'differential', total_size: 26843545600, compressed_size: 18790481920, count: 10 },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.getStorageAnalytics();

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(3);
      expect(result[0].backupType).toBe('full');
      expect(result[0].totalSize).toBe(53687091200);
    });
  });

  describe('Validation', () => {
    it('should validate backup data', async () => {
      // Arrange
      const invalidBackupData = {
        name: '',
        description: '',
        type: '',
        source: '',
        target: '',
        configuration: null,
        schedule: null,
      };

      // Act & Assert
      await expect(backupRepository.createBackup(invalidBackupData)).rejects.toThrow('Backup name is required');
    });

    it('should validate backup type', async () => {
      // Arrange
      const invalidBackupData = {
        name: 'Test Backup',
        description: 'Test description',
        type: 'invalid_type',
        source: 'database',
        target: 's3',
        configuration: {},
        schedule: {},
      };

      // Act & Assert
      await expect(backupRepository.createBackup(invalidBackupData)).rejects.toThrow('Invalid backup type');
    });

    it('should validate backup source', async () => {
      // Arrange
      const invalidBackupData = {
        name: 'Test Backup',
        description: 'Test description',
        type: 'full',
        source: 'invalid_source',
        target: 's3',
        configuration: {},
        schedule: {},
      };

      // Act & Assert
      await expect(backupRepository.createBackup(invalidBackupData)).rejects.toThrow('Invalid backup source');
    });
  });

  describe('Caching', () => {
    it('should cache backup statistics', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [{
          total_backups: 50,
          backups_by_type: { full: 15, incremental: 25 },
          successful_executions: 480,
          average_execution_time: 1800000,
          total_storage_used: 107374182400,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await backupRepository.getBackupStats(timeRange);

      // Assert
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('backupStats'),
        expect.any(Object),
        expect.any(Number)
      );
    });

    it('should return cached backup statistics', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const cachedStats = {
        totalBackups: 50,
        backupsByType: { full: 15, incremental: 25 },
        successfulExecutions: 480,
        averageExecutionTime: 1800000,
        totalStorageUsed: 107374182400,
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(cachedStats);

      // Act
      const result = await backupRepository.getBackupStats(timeRange);

      // Assert
      expect(result).toEqual(cachedStats);
      expect(mockDbConnection.query).not.toHaveBeenCalled();
    });

    it('should clear cache on backup update', async () => {
      // Arrange
      const backupId = 'backup-123';
      const updates = { name: 'Updated Backup' };
      const mockResult = {
        rows: [{
          id: backupId,
          name: 'Updated Backup',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await backupRepository.updateBackup(backupId, updates);

      // Assert
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        expect.stringContaining('backupStats')
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      const backupId = 'backup-123';
      const dbError = new Error('Database connection failed');
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockRejectedValue(dbError);

      // Act & Assert
      await expect(backupRepository.findById(backupId)).rejects.toThrow('Database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({
          backupId,
          error: dbError.message,
        })
      );
    });

    it('should handle validation errors gracefully', async () => {
      // Arrange
      const invalidBackupData = {
        name: '',
        description: '',
        type: '',
        source: '',
        target: '',
        configuration: null,
        schedule: null,
      };

      // Act & Assert
      await expect(backupRepository.createBackup(invalidBackupData)).rejects.toThrow();
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
          id: `backup-${i}`,
          name: `Backup ${i}`,
          type: 'full',
          source: 'database',
          target: 's3',
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        })),
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(largeResult);

      // Act
      const startTime = Date.now();
      const result = await backupRepository.getActiveBackups();
      const endTime = Date.now();

      // Assert
      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should use parameterized queries for security', async () => {
      // Arrange
      const backupId = "backup-123'; DROP TABLE backups; --";
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      await backupRepository.findById(backupId);

      // Assert
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM backups WHERE id = $1'),
        [backupId]
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values gracefully', async () => {
      // Arrange
      const backupId = 'backup-123';
      const mockResult = {
        rows: [{
          id: backupId,
          name: 'Test Backup',
          type: 'full',
          source: 'database',
          configuration: null,
          schedule: null,
          retention: null,
          metadata: null,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await backupRepository.findById(backupId);

      // Assert
      expect(result).toBeDefined();
      expect(result.configuration).toBeNull();
      expect(result.schedule).toBeNull();
      expect(result.retention).toBeNull();
    });

    it('should handle empty result sets', async () => {
      // Arrange
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await backupRepository.findById('nonexistent');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle concurrent operations', async () => {
      // Arrange
      const backupId = 'backup-123';
      const updates = { name: 'Concurrent Update' };
      const mockResult = {
        rows: [{
          id: backupId,
          name: 'Concurrent Update',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const promises = Array.from({ length: 10 }, () => 
        backupRepository.updateBackup(backupId, updates)
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
