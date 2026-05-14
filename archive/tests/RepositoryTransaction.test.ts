/**
 * RepositoryTransaction Tests
 * 
 * Comprehensive test suite for RepositoryTransaction functionality including
 * transaction management, rollback operations, isolation levels, and transaction monitoring.
 */

import { RepositoryTransaction } from '../repositories/RepositoryTransaction';
import { DatabaseConnection } from '../database/DatabaseConnection';
import { Logger } from '../logging/Logger';

// Mock dependencies
const mockDbConnection = {
  query: jest.fn(),
  beginTransaction: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
  savepoint: jest.fn(),
  rollbackToSavepoint: jest.fn(),
  releaseSavepoint: jest.fn(),
} as unknown as DatabaseConnection;

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

describe('RepositoryTransaction', () => {
  let repositoryTransaction: RepositoryTransaction;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryTransaction = new RepositoryTransaction(mockDbConnection, mockLogger);
  });

  describe('Basic Transaction Operations', () => {
    it('should begin transaction', async () => {
      // Arrange
      mockDbConnection.beginTransaction = jest.fn().mockResolvedValue(undefined);

      // Act
      await repositoryTransaction.begin();

      // Assert
      expect(mockDbConnection.beginTransaction).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('transaction_begin', expect.objectContaining({
        transactionId: expect.any(String),
        timestamp: expect.any(Date),
      }));
    });

    it('should commit transaction', async () => {
      // Arrange
      mockDbConnection.commit = jest.fn().mockResolvedValue(undefined);
      repositoryTransaction['transactionId'] = 'txn-123';
      repositoryTransaction['isActive'] = true;

      // Act
      await repositoryTransaction.commit();

      // Assert
      expect(mockDbConnection.commit).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('transaction_commit', expect.objectContaining({
        transactionId: 'txn-123',
        timestamp: expect.any(Date),
      }));
    });

    it('should rollback transaction', async () => {
      // Arrange
      mockDbConnection.rollback = jest.fn().mockResolvedValue(undefined);
      repositoryTransaction['transactionId'] = 'txn-123';
      repositoryTransaction['isActive'] = true;

      // Act
      await repositoryTransaction.rollback();

      // Assert
      expect(mockDbConnection.rollback).toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith('transaction_rollback', expect.objectContaining({
        transactionId: 'txn-123',
        timestamp: expect.any(Date),
      }));
    });

    it('should handle transaction without beginning', async () => {
      // Act & Assert
      await expect(repositoryTransaction.commit()).rejects.toThrow('No active transaction');
      await expect(repositoryTransaction.rollback()).rejects.toThrow('No active transaction');
    });
  });

  describe('Savepoint Operations', () => {
    it('should create savepoint', async () => {
      // Arrange
      mockDbConnection.savepoint = jest.fn().mockResolvedValue('sp-123');
      repositoryTransaction['transactionId'] = 'txn-123';
      repositoryTransaction['isActive'] = true;

      // Act
      const savepointId = await repositoryTransaction.createSavepoint('user_creation');

      // Assert
      expect(savepointId).toBe('sp-123');
      expect(mockDbConnection.savepoint).toHaveBeenCalledWith('user_creation');
      expect(mockLogger.debug).toHaveBeenCalledWith('savepoint_create', expect.objectContaining({
        transactionId: 'txn-123',
        savepointId: 'sp-123',
        savepointName: 'user_creation',
      }));
    });

    it('should rollback to savepoint', async () => {
      // Arrange
      mockDbConnection.rollbackToSavepoint = jest.fn().mockResolvedValue(undefined);
      repositoryTransaction['transactionId'] = 'txn-123';
      repositoryTransaction['isActive'] = true;

      // Act
      await repositoryTransaction.rollbackToSavepoint('sp-123');

      // Assert
      expect(mockDbConnection.rollbackToSavepoint).toHaveBeenCalledWith('sp-123');
      expect(mockLogger.warn).toHaveBeenCalledWith('savepoint_rollback', expect.objectContaining({
        transactionId: 'txn-123',
        savepointId: 'sp-123',
      }));
    });

    it('should release savepoint', async () => {
      // Arrange
      mockDbConnection.releaseSavepoint = jest.fn().mockResolvedValue(undefined);
      repositoryTransaction['transactionId'] = 'txn-123';
      repositoryTransaction['isActive'] = true;

      // Act
      await repositoryTransaction.releaseSavepoint('sp-123');

      // Assert
      expect(mockDbConnection.releaseSavepoint).toHaveBeenCalledWith('sp-123');
      expect(mockLogger.debug).toHaveBeenCalledWith('savepoint_release', expect.objectContaining({
        transactionId: 'txn-123',
        savepointId: 'sp-123',
      }));
    });
  });

  describe('Transaction Execution', () => {
    it('should execute operations within transaction', async () => {
      // Arrange
      const operations = [
        { type: 'insert', table: 'users', data: { name: 'John', email: 'john@example.com' } },
        { type: 'update', table: 'profiles', data: { userId: 1, bio: 'Test bio' } },
        { type: 'insert', table: 'audit_logs', data: { action: 'user_created', userId: 1 } },
      ];
      
      mockDbConnection.beginTransaction = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.commit = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [{ id: 1 }] });

      // Act
      const results = await repositoryTransaction.execute(operations);

      // Assert
      expect(results).toHaveLength(3);
      expect(mockDbConnection.beginTransaction).toHaveBeenCalled();
      expect(mockDbConnection.commit).toHaveBeenCalled();
      expect(mockDbConnection.query).toHaveBeenCalledTimes(3);
      expect(mockLogger.info).toHaveBeenCalledWith('transaction_execute', expect.objectContaining({
        transactionId: expect.any(String),
        operationCount: 3,
        duration: expect.any(Number),
      }));
    });

    it('should rollback on operation failure', async () => {
      // Arrange
      const operations = [
        { type: 'insert', table: 'users', data: { name: 'John' } },
        { type: 'insert', table: 'invalid_table', data: { test: 'data' } }, // This will fail
      ];
      
      mockDbConnection.beginTransaction = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.rollback = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.query = jest.fn()
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockRejectedValueOnce(new Error('Table does not exist'));

      // Act & Assert
      await expect(repositoryTransaction.execute(operations)).rejects.toThrow('Table does not exist');
      expect(mockDbConnection.rollback).toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith('transaction_execute_error', expect.objectContaining({
        transactionId: expect.any(String),
        error: 'Table does not exist',
        operationIndex: 1,
      }));
    });

    it('should execute operations with retry', async () => {
      // Arrange
      const operations = [
        { type: 'insert', table: 'users', data: { name: 'John' } },
      ];
      
      mockDbConnection.beginTransaction = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.commit = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.query = jest.fn()
        .mockRejectedValueOnce(new Error('Deadlock'))
        .mockResolvedValueOnce({ rows: [{ id: 1 }] });

      // Act
      const results = await repositoryTransaction.executeWithRetry(operations, { maxRetries: 2 });

      // Assert
      expect(results).toHaveLength(1);
      expect(mockDbConnection.query).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith('transaction_retry_success', expect.objectContaining({
        transactionId: expect.any(String),
        attempt: 2,
      }));
    });

    it('should fail after max retries', async () => {
      // Arrange
      const operations = [
        { type: 'insert', table: 'users', data: { name: 'John' } },
      ];
      
      mockDbConnection.beginTransaction = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.rollback = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.query = jest.fn().mockRejectedValue(new Error('Persistent error'));

      // Act & Assert
      await expect(repositoryTransaction.executeWithRetry(operations, { maxRetries: 2 }))
        .rejects.toThrow('Persistent error');
      expect(mockDbConnection.query).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
      expect(mockDbConnection.rollback).toHaveBeenCalledTimes(3);
    });
  });

  describe('Transaction Isolation Levels', () => {
    it('should set isolation level', async () => {
      // Arrange
      const isolationLevel = 'SERIALIZABLE';
      mockDbConnection.query = jest.fn().mockResolvedValue(undefined);

      // Act
      await repositoryTransaction.setIsolationLevel(isolationLevel);

      // Assert
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        'SET TRANSACTION ISOLATION LEVEL SERIALIZABLE'
      );
      expect(mockLogger.debug).toHaveBeenCalledWith('transaction_isolation_set', expect.objectContaining({
        isolationLevel,
      }));
    });

    it('should begin transaction with isolation level', async () => {
      // Arrange
      const isolationLevel = 'READ_COMMITTED';
      mockDbConnection.beginTransaction = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.query = jest.fn().mockResolvedValue(undefined);

      // Act
      await repositoryTransaction.beginWithIsolation(isolationLevel);

      // Assert
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        'SET TRANSACTION ISOLATION LEVEL READ_COMMITTED'
      );
      expect(mockDbConnection.beginTransaction).toHaveBeenCalled();
    });

    it('should validate isolation level', async () => {
      // Act & Assert
      await expect(repositoryTransaction.setIsolationLevel('INVALID_LEVEL'))
        .rejects.toThrow('Invalid isolation level');
      
      await expect(repositoryTransaction.setIsolationLevel('SERIALIZABLE'))
        .resolves.not.toThrow();
    });
  });

  describe('Transaction Monitoring', () => {
    it('should track transaction duration', async () => {
      // Arrange
      mockDbConnection.beginTransaction = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.commit = jest.fn().mockResolvedValue(undefined);

      // Act
      await repositoryTransaction.begin();
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work
      await repositoryTransaction.commit();

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('transaction_commit', expect.objectContaining({
        transactionId: expect.any(String),
        duration: expect.any(Number),
      }));
    });

    it('should track transaction statistics', () => {
      // Act
      const stats = repositoryTransaction.getStatistics();

      // Assert
      expect(stats).toBeDefined();
      expect(stats.totalTransactions).toBeGreaterThanOrEqual(0);
      expect(stats.successfulTransactions).toBeGreaterThanOrEqual(0);
      expect(stats.failedTransactions).toBeGreaterThanOrEqual(0);
      expect(stats.averageDuration).toBeGreaterThanOrEqual(0);
    });

    it('should track active transactions', () => {
      // Arrange
      repositoryTransaction['activeTransactions'] = new Map([
        ['txn-1', { startTime: Date.now() - 5000 }],
        ['txn-2', { startTime: Date.now() - 2000 }],
        ['txn-3', { startTime: Date.now() - 10000 }],
      ]);

      // Act
      const activeTransactions = repositoryTransaction.getActiveTransactions();

      // Assert
      expect(activeTransactions).toHaveLength(3);
      expect(activeTransactions[0].transactionId).toBe('txn-3'); // Longest running first
      expect(activeTransactions[0].duration).toBe(10000);
    });

    it('should detect long-running transactions', () => {
      // Arrange
      repositoryTransaction['activeTransactions'] = new Map([
        ['txn-1', { startTime: Date.now() - 30000 }], // 30 seconds
        ['txn-2', { startTime: Date.now() - 5000 }],   // 5 seconds
      ]);

      // Act
      const longRunning = repositoryTransaction.getLongRunningTransactions(10000); // 10 second threshold

      // Assert
      expect(longRunning).toHaveLength(1);
      expect(longRunning[0].transactionId).toBe('txn-1');
      expect(longRunning[0].duration).toBe(30000);
    });
  });

  describe('Transaction Context', () => {
    it('should maintain transaction context', async () => {
      // Arrange
      mockDbConnection.beginTransaction = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.commit = jest.fn().mockResolvedValue(undefined);

      // Act
      await repositoryTransaction.begin();
      repositoryTransaction.setContext('userId', 'user-123');
      repositoryTransaction.setContext('requestId', 'req-456');
      const context = repositoryTransaction.getContext();
      await repositoryTransaction.commit();

      // Assert
      expect(context.userId).toBe('user-123');
      expect(context.requestId).toBe('req-456');
      expect(mockLogger.info).toHaveBeenCalledWith('transaction_begin', expect.objectContaining({
        context: { userId: 'user-123', requestId: 'req-456' },
      }));
    });

    it('should clear context on commit', async () => {
      // Arrange
      mockDbConnection.beginTransaction = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.commit = jest.fn().mockResolvedValue(undefined);

      // Act
      await repositoryTransaction.begin();
      repositoryTransaction.setContext('userId', 'user-123');
      await repositoryTransaction.commit();
      const context = repositoryTransaction.getContext();

      // Assert
      expect(context).toEqual({});
    });

    it('should propagate context to nested transactions', async () => {
      // Arrange
      mockDbConnection.beginTransaction = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.commit = jest.fn().mockResolvedValue(undefined);

      // Act
      await repositoryTransaction.begin();
      repositoryTransaction.setContext('userId', 'user-123');
      
      const nestedTransaction = repositoryTransaction.createNested();
      await nestedTransaction.begin();
      const nestedContext = nestedTransaction.getContext();
      
      await nestedTransaction.commit();
      await repositoryTransaction.commit();

      // Assert
      expect(nestedContext.userId).toBe('user-123');
    });
  });

  describe('Nested Transactions', () => {
    it('should create nested transaction', () => {
      // Act
      const nestedTransaction = repositoryTransaction.createNested();

      // Assert
      expect(nestedTransaction).toBeDefined();
      expect(nestedTransaction).toBeInstanceOf(RepositoryTransaction);
      expect(mockLogger.debug).toHaveBeenCalledWith('nested_transaction_created', expect.objectContaining({
        parentTransactionId: expect.any(String),
        nestedTransactionId: expect.any(String),
      }));
    });

    it('should handle nested transaction operations', async () => {
      // Arrange
      mockDbConnection.beginTransaction = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.commit = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.savepoint = jest.fn().mockResolvedValue('sp-123');
      mockDbConnection.rollbackToSavepoint = jest.fn().mockResolvedValue(undefined);

      // Act
      await repositoryTransaction.begin();
      const nestedTransaction = repositoryTransaction.createNested();
      await nestedTransaction.begin();
      await nestedTransaction.commit();
      await repositoryTransaction.commit();

      // Assert
      expect(mockDbConnection.savepoint).toHaveBeenCalled();
      expect(mockDbConnection.rollbackToSavepoint).not.toHaveBeenCalled();
    });

    it('should rollback nested transaction independently', async () => {
      // Arrange
      mockDbConnection.beginTransaction = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.commit = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.savepoint = jest.fn().mockResolvedValue('sp-123');
      mockDbConnection.rollbackToSavepoint = jest.fn().mockResolvedValue(undefined);

      // Act
      await repositoryTransaction.begin();
      const nestedTransaction = repositoryTransaction.createNested();
      await nestedTransaction.begin();
      await nestedTransaction.rollback();
      await repositoryTransaction.commit();

      // Assert
      expect(mockDbConnection.savepoint).toHaveBeenCalled();
      expect(mockDbConnection.rollbackToSavepoint).toHaveBeenCalled();
      expect(mockDbConnection.commit).toHaveBeenCalled(); // Parent still commits
    });
  });

  describe('Transaction Hooks', () => {
    it('should execute before begin hooks', async () => {
      // Arrange
      const hook = jest.fn();
      repositoryTransaction.addHook('beforeBegin', hook);
      mockDbConnection.beginTransaction = jest.fn().mockResolvedValue(undefined);

      // Act
      await repositoryTransaction.begin();

      // Assert
      expect(hook).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith('transaction_hook_executed', expect.objectContaining({
        hook: 'beforeBegin',
      }));
    });

    it('should execute after commit hooks', async () => {
      // Arrange
      const hook = jest.fn();
      repositoryTransaction.addHook('afterCommit', hook);
      mockDbConnection.beginTransaction = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.commit = jest.fn().mockResolvedValue(undefined);
      repositoryTransaction['transactionId'] = 'txn-123';
      repositoryTransaction['isActive'] = true;

      // Act
      await repositoryTransaction.commit();

      // Assert
      expect(hook).toHaveBeenCalledWith('txn-123');
      expect(mockLogger.debug).toHaveBeenCalledWith('transaction_hook_executed', expect.objectContaining({
        hook: 'afterCommit',
      }));
    });

    it('should execute on error hooks', async () => {
      // Arrange
      const hook = jest.fn();
      repositoryTransaction.addHook('onError', hook);
      mockDbConnection.beginTransaction = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.rollback = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.query = jest.fn().mockRejectedValue(new Error('Test error'));
      repositoryTransaction['transactionId'] = 'txn-123';
      repositoryTransaction['isActive'] = true;

      // Act & Assert
      await expect(repositoryTransaction.query('SELECT * FROM users')).rejects.toThrow('Test error');
      expect(hook).toHaveBeenCalledWith('txn-123', expect.any(Error));
    });

    it('should remove hooks', () => {
      // Arrange
      const hook = jest.fn();
      const hookId = repositoryTransaction.addHook('beforeBegin', hook);

      // Act
      repositoryTransaction.removeHook(hookId);

      // Assert
      expect(mockLogger.debug).toHaveBeenCalledWith('transaction_hook_removed', expect.objectContaining({
        hookId,
      }));
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      const error = new Error('Connection lost');
      mockDbConnection.beginTransaction = jest.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(repositoryTransaction.begin()).rejects.toThrow('Connection lost');
      expect(mockLogger.error).toHaveBeenCalledWith('transaction_begin_error', expect.objectContaining({
        error: 'Connection lost',
      }));
    });

    it('should handle commit errors', async () => {
      // Arrange
      const error = new Error('Commit failed');
      mockDbConnection.commit = jest.fn().mockRejectedValue(error);
      repositoryTransaction['transactionId'] = 'txn-123';
      repositoryTransaction['isActive'] = true;

      // Act & Assert
      await expect(repositoryTransaction.commit()).rejects.toThrow('Commit failed');
      expect(mockLogger.error).toHaveBeenCalledWith('transaction_commit_error', expect.objectContaining({
        transactionId: 'txn-123',
        error: 'Commit failed',
      }));
    });

    it('should handle rollback errors', async () => {
      // Arrange
      const error = new Error('Rollback failed');
      mockDbConnection.rollback = jest.fn().mockRejectedValue(error);
      repositoryTransaction['transactionId'] = 'txn-123';
      repositoryTransaction['isActive'] = true;

      // Act & Assert
      await expect(repositoryTransaction.rollback()).rejects.toThrow('Rollback failed');
      expect(mockLogger.error).toHaveBeenCalledWith('transaction_rollback_error', expect.objectContaining({
        transactionId: 'txn-123',
        error: 'Rollback failed',
      }));
    });

    it('should handle concurrent transaction conflicts', async () => {
      // Arrange
      const conflictError = new Error('Deadlock detected');
      mockDbConnection.query = jest.fn().mockRejectedValue(conflictError);
      repositoryTransaction['transactionId'] = 'txn-123';
      repositoryTransaction['isActive'] = true;

      // Act & Assert
      await expect(repositoryTransaction.query('SELECT * FROM users')).rejects.toThrow('Deadlock detected');
      expect(mockLogger.error).toHaveBeenCalledWith('transaction_conflict', expect.objectContaining({
        transactionId: 'txn-123',
        error: 'Deadlock detected',
        isRetryable: true,
      }));
    });
  });

  describe('Performance Optimization', () => {
    it('should batch operations efficiently', async () => {
      // Arrange
      const operations = Array.from({ length: 1000 }, (_, i) => ({
        type: 'insert',
        table: 'test_table',
        data: { id: i, name: `item-${i}` },
      }));
      
      mockDbConnection.beginTransaction = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.commit = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [{ id: 1 }] });

      // Act
      const startTime = Date.now();
      const results = await repositoryTransaction.executeBatch(operations);
      const endTime = Date.now();

      // Assert
      expect(results).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(mockLogger.info).toHaveBeenCalledWith('transaction_batch_execute', expect.objectContaining({
        batchSize: 1000,
        duration: expect.any(Number),
      }));
    });

    it('should optimize transaction for read-only operations', async () => {
      // Arrange
      const operations = [
        { type: 'select', table: 'users', query: 'SELECT * FROM users' },
        { type: 'select', table: 'products', query: 'SELECT * FROM products' },
      ];
      
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      await repositoryTransaction.executeReadOnly(operations);

      // Assert
      expect(mockDbConnection.query).toHaveBeenCalledTimes(2);
      expect(mockLogger.debug).toHaveBeenCalledWith('transaction_readonly_execute', expect.objectContaining({
        operationCount: 2,
      }));
    });

    it('should implement transaction pooling', async () => {
      // Arrange
      const pool = repositoryTransaction.createPool({ maxSize: 5 });
      mockDbConnection.beginTransaction = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.commit = jest.fn().mockResolvedValue(undefined);

      // Act
      const promises = Array.from({ length: 10 }, () => 
        pool.execute(async (tx) => {
          await tx.query('SELECT 1');
          return 'result';
        })
      );
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(10);
      expect(results.every(r => r === 'result')).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('transaction_pool_execute', expect.objectContaining({
        poolSize: 5,
        activeTransactions: expect.any(Number),
      }));
    });
  });

  describe('Transaction Analytics', () => {
    it('should generate transaction report', () => {
      // Arrange
      repositoryTransaction['statistics'] = {
        totalTransactions: 1000,
        successfulTransactions: 950,
        failedTransactions: 50,
        averageDuration: 150,
        totalDuration: 150000,
      };

      // Act
      const report = repositoryTransaction.generateReport();

      // Assert
      expect(report).toBeDefined();
      expect(report.totalTransactions).toBe(1000);
      expect(report.successRate).toBe(0.95);
      expect(report.failureRate).toBe(0.05);
      expect(report.averageDuration).toBe(150);
    });

    it('should track transaction patterns', () => {
      // Arrange
      const transactions = [
        { type: 'user_creation', duration: 120, success: true },
        { type: 'user_creation', duration: 150, success: true },
        { type: 'order_processing', duration: 300, success: false },
        { type: 'order_processing', duration: 280, success: true },
      ];

      // Act
      const patterns = repositoryTransaction.analyzePatterns(transactions);

      // Assert
      expect(patterns).toBeDefined();
      expect(patterns.user_creation).toBeDefined();
      expect(patterns.order_processing).toBeDefined();
      expect(patterns.user_creation.averageDuration).toBe(135);
      expect(patterns.order_processing.successRate).toBe(0.5);
    });

    it('should provide performance recommendations', () => {
      // Arrange
      repositoryTransaction['statistics'] = {
        totalTransactions: 1000,
        successfulTransactions: 850,
        failedTransactions: 150,
        averageDuration: 500,
        totalDuration: 500000,
      };

      // Act
      const recommendations = repositoryTransaction.getPerformanceRecommendations();

      // Assert
      expect(recommendations).toBeDefined();
      expect(recommendations).toContain('Consider optimizing long-running transactions (average: 500ms)');
      expect(recommendations).toContain('High failure rate detected (15%), review error handling');
    });
  });
});
