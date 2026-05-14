/**
 * RepositoryCache Tests
 * 
 * Comprehensive test suite for RepositoryCache functionality including
 * caching strategies, cache invalidation, performance optimization, and cache analytics.
 */

import { RepositoryCache } from '../repositories/RepositoryCache';
import { CacheManager } from '../cache/CacheManager';
import { Logger } from '../logging/Logger';

// Mock dependencies
const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  exists: jest.fn(),
  getKeys: jest.fn(),
  getStats: jest.fn(),
} as unknown as CacheManager;

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

describe('RepositoryCache', () => {
  let repositoryCache: RepositoryCache;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryCache = new RepositoryCache(mockCacheManager, mockLogger);
  });

  describe('Basic Cache Operations', () => {
    it('should get cached value', async () => {
      // Arrange
      const key = 'test:key';
      const value = { id: '123', name: 'Test' };
      mockCacheManager.get = jest.fn().mockResolvedValue(value);

      // Act
      const result = await repositoryCache.get(key);

      // Assert
      expect(result).toBe(value);
      expect(mockCacheManager.get).toHaveBeenCalledWith(key);
      expect(mockLogger.debug).toHaveBeenCalledWith('cache_get', expect.objectContaining({
        key,
        hit: true,
      }));
    });

    it('should return null for cache miss', async () => {
      // Arrange
      const key = 'test:nonexistent';
      mockCacheManager.get = jest.fn().mockResolvedValue(null);

      // Act
      const result = await repositoryCache.get(key);

      // Assert
      expect(result).toBeNull();
      expect(mockCacheManager.get).toHaveBeenCalledWith(key);
      expect(mockLogger.debug).toHaveBeenCalledWith('cache_get', expect.objectContaining({
        key,
        hit: false,
      }));
    });

    it('should set cached value', async () => {
      // Arrange
      const key = 'test:key';
      const value = { id: '123', name: 'Test' };
      const ttl = 300;
      mockCacheManager.set = jest.fn().mockResolvedValue(true);

      // Act
      const result = await repositoryCache.set(key, value, ttl);

      // Assert
      expect(result).toBe(true);
      expect(mockCacheManager.set).toHaveBeenCalledWith(key, value, ttl);
      expect(mockLogger.debug).toHaveBeenCalledWith('cache_set', expect.objectContaining({
        key,
        ttl,
      }));
    });

    it('should delete cached value', async () => {
      // Arrange
      const key = 'test:key';
      mockCacheManager.delete = jest.fn().mockResolvedValue(true);

      // Act
      const result = await repositoryCache.delete(key);

      // Assert
      expect(result).toBe(true);
      expect(mockCacheManager.delete).toHaveBeenCalledWith(key);
      expect(mockLogger.debug).toHaveBeenCalledWith('cache_delete', expect.objectContaining({
        key,
      }));
    });

    it('should clear all cache', async () => {
      // Arrange
      mockCacheManager.clear = jest.fn().mockResolvedValue(true);

      // Act
      const result = await repositoryCache.clear();

      // Assert
      expect(result).toBe(true);
      expect(mockCacheManager.clear).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('cache_clear');
    });
  });

  describe('Repository-Specific Cache Operations', () => {
    it('should cache repository entity', async () => {
      // Arrange
      const repositoryType = 'UserRepository';
      const entityId = 'user-123';
      const entity = { id: entityId, name: 'John Doe', email: 'john@example.com' };
      mockCacheManager.set = jest.fn().mockResolvedValue(true);

      // Act
      const result = await repositoryCache.cacheEntity(repositoryType, entityId, entity);

      // Assert
      expect(result).toBe(true);
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `repo:${repositoryType}:entity:${entityId}`,
        entity,
        expect.any(Number)
      );
      expect(mockLogger.debug).toHaveBeenCalledWith('entity_cached', expect.objectContaining({
        repositoryType,
        entityId,
      }));
    });

    it('should get cached repository entity', async () => {
      // Arrange
      const repositoryType = 'UserRepository';
      const entityId = 'user-123';
      const entity = { id: entityId, name: 'John Doe', email: 'john@example.com' };
      mockCacheManager.get = jest.fn().mockResolvedValue(entity);

      // Act
      const result = await repositoryCache.getCachedEntity(repositoryType, entityId);

      // Assert
      expect(result).toBe(entity);
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        `repo:${repositoryType}:entity:${entityId}`
      );
    });

    it('should cache repository query result', async () => {
      // Arrange
      const repositoryType = 'ProductRepository';
      const queryHash = 'products:category:electronics:limit:10';
      const result = [
        { id: 'prod-1', name: 'Laptop', category: 'electronics' },
        { id: 'prod-2', name: 'Phone', category: 'electronics' },
      ];
      mockCacheManager.set = jest.fn().mockResolvedValue(true);

      // Act
      const cacheResult = await repositoryCache.cacheQueryResult(repositoryType, queryHash, result);

      // Assert
      expect(cacheResult).toBe(true);
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `repo:${repositoryType}:query:${queryHash}`,
        result,
        expect.any(Number)
      );
      expect(mockLogger.debug).toHaveBeenCalledWith('query_result_cached', expect.objectContaining({
        repositoryType,
        queryHash,
        resultCount: result.length,
      }));
    });

    it('should get cached repository query result', async () => {
      // Arrange
      const repositoryType = 'ProductRepository';
      const queryHash = 'products:category:electronics:limit:10';
      const result = [
        { id: 'prod-1', name: 'Laptop', category: 'electronics' },
        { id: 'prod-2', name: 'Phone', category: 'electronics' },
      ];
      mockCacheManager.get = jest.fn().mockResolvedValue(result);

      // Act
      const cacheResult = await repositoryCache.getCachedQueryResult(repositoryType, queryHash);

      // Assert
      expect(cacheResult).toBe(result);
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        `repo:${repositoryType}:query:${queryHash}`
      );
    });

    it('should invalidate repository cache', async () => {
      // Arrange
      const repositoryType = 'UserRepository';
      mockCacheManager.getKeys = jest.fn().mockResolvedValue([
        'repo:UserRepository:entity:user-123',
        'repo:UserRepository:entity:user-456',
        'repo:UserRepository:query:users:active',
        'repo:ProductRepository:entity:prod-123',
      ]);
      mockCacheManager.delete = jest.fn().mockResolvedValue(true);

      // Act
      const result = await repositoryCache.invalidateRepository(repositoryType);

      // Assert
      expect(result).toBe(true);
      expect(mockCacheManager.delete).toHaveBeenCalledTimes(3); // Only UserRepository keys
      expect(mockLogger.info).toHaveBeenCalledWith('repository_cache_invalidated', expect.objectContaining({
        repositoryType,
        keysInvalidated: 3,
      }));
    });

    it('should invalidate entity cache', async () => {
      // Arrange
      const repositoryType = 'UserRepository';
      const entityId = 'user-123';
      mockCacheManager.delete = jest.fn().mockResolvedValue(true);

      // Act
      const result = await repositoryCache.invalidateEntity(repositoryType, entityId);

      // Assert
      expect(result).toBe(true);
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        `repo:${repositoryType}:entity:${entityId}`
      );
      expect(mockLogger.debug).toHaveBeenCalledWith('entity_cache_invalidated', expect.objectContaining({
        repositoryType,
        entityId,
      }));
    });
  });

  describe('Cache Strategies', () => {
    it('should implement LRU eviction strategy', async () => {
      // Arrange
      const maxSize = 2;
      const cache = new RepositoryCache(mockCacheManager, mockLogger, { maxSize, strategy: 'LRU' });
      
      mockCacheManager.getKeys = jest.fn().mockResolvedValue([
        'repo:UserRepository:entity:user-1',
        'repo:UserRepository:entity:user-2',
        'repo:UserRepository:entity:user-3',
      ]);
      mockCacheManager.get = jest.fn().mockImplementation((key) => {
        if (key === 'repo:UserRepository:entity:user-1') return Promise.resolve({ id: 'user-1', lastAccessed: new Date('2023-01-01') });
        if (key === 'repo:UserRepository:entity:user-2') return Promise.resolve({ id: 'user-2', lastAccessed: new Date('2023-01-02') });
        if (key === 'repo:UserRepository:entity:user-3') return Promise.resolve({ id: 'user-3', lastAccessed: new Date('2023-01-03') });
        return Promise.resolve(null);
      });
      mockCacheManager.delete = jest.fn().mockResolvedValue(true);

      // Act
      await cache.evictLRU();

      // Assert
      expect(mockCacheManager.delete).toHaveBeenCalledWith('repo:UserRepository:entity:user-1');
      expect(mockLogger.debug).toHaveBeenCalledWith('lru_eviction', expect.objectContaining({
        evictedKey: 'repo:UserRepository:entity:user-1',
      }));
    });

    it('should implement TTL-based expiration', async () => {
      // Arrange
      const defaultTTL = 300;
      const cache = new RepositoryCache(mockCacheManager, mockLogger, { defaultTTL });
      
      mockCacheManager.getKeys = jest.fn().mockResolvedValue([
        'repo:UserRepository:entity:user-1',
        'repo:UserRepository:entity:user-2',
      ]);
      mockCacheManager.get = jest.fn().mockImplementation((key) => {
        if (key === 'repo:UserRepository:entity:user-1') {
          return Promise.resolve({ 
            id: 'user-1', 
            cachedAt: new Date(Date.now() - 400000), // 400 seconds ago
            ttl: 300 
          });
        }
        if (key === 'repo:UserRepository:entity:user-2') {
          return Promise.resolve({ 
            id: 'user-2', 
            cachedAt: new Date(Date.now() - 200000), // 200 seconds ago
            ttl: 300 
          });
        }
        return Promise.resolve(null);
      });
      mockCacheManager.delete = jest.fn().mockResolvedValue(true);

      // Act
      await cache.cleanupExpired();

      // Assert
      expect(mockCacheManager.delete).toHaveBeenCalledWith('repo:UserRepository:entity:user-1');
      expect(mockCacheManager.delete).not.toHaveBeenCalledWith('repo:UserRepository:entity:user-2');
      expect(mockLogger.debug).toHaveBeenCalledWith('expired_cleanup', expect.objectContaining({
        expiredKeys: 1,
      }));
    });

    it('should implement write-through caching', async () => {
      // Arrange
      const cache = new RepositoryCache(mockCacheManager, mockLogger, { strategy: 'write-through' });
      const key = 'test:key';
      const value = { id: '123', name: 'Test' };
      
      mockCacheManager.set = jest.fn().mockResolvedValue(true);

      // Act
      const result = await cache.set(key, value, 300, { writeThrough: true });

      // Assert
      expect(result).toBe(true);
      expect(mockCacheManager.set).toHaveBeenCalledWith(key, value, 300);
      expect(mockLogger.debug).toHaveBeenCalledWith('write_through_cache', expect.objectContaining({
        key,
      }));
    });

    it('should implement write-behind caching', async () => {
      // Arrange
      const cache = new RepositoryCache(mockCacheManager, mockLogger, { strategy: 'write-behind' });
      const key = 'test:key';
      const value = { id: '123', name: 'Test' };
      
      mockCacheManager.set = jest.fn().mockResolvedValue(true);

      // Act
      const result = await cache.set(key, value, 300, { writeBehind: true });

      // Assert
      expect(result).toBe(true);
      expect(mockLogger.debug).toHaveBeenCalledWith('write_behind_cache', expect.objectContaining({
        key,
      }));
    });
  });

  describe('Cache Analytics', () => {
    it('should get cache statistics', async () => {
      // Arrange
      mockCacheManager.getStats = jest.fn().mockResolvedValue({
        hits: 850,
        misses: 150,
        sets: 500,
        deletes: 100,
        size: 1000,
        maxSize: 2000,
      });

      // Act
      const stats = await repositoryCache.getStats();

      // Assert
      expect(stats).toBeDefined();
      expect(stats.hits).toBe(850);
      expect(stats.misses).toBe(150);
      expect(stats.hitRate).toBe(0.85);
      expect(stats.missRate).toBe(0.15);
      expect(stats.size).toBe(1000);
      expect(stats.maxSize).toBe(2000);
    });

    it('should get repository-specific statistics', async () => {
      // Arrange
      const repositoryType = 'UserRepository';
      mockCacheManager.getKeys = jest.fn().mockResolvedValue([
        'repo:UserRepository:entity:user-1',
        'repo:UserRepository:entity:user-2',
        'repo:UserRepository:query:users:active',
      ]);

      // Act
      const stats = await repositoryCache.getRepositoryStats(repositoryType);

      // Assert
      expect(stats).toBeDefined();
      expect(stats.repositoryType).toBe(repositoryType);
      expect(stats.entityKeys).toBe(2);
      expect(stats.queryKeys).toBe(1);
      expect(stats.totalKeys).toBe(3);
    });

    it('should get cache performance metrics', async () => {
      // Arrange
      mockCacheManager.getStats = jest.fn().mockResolvedValue({
        hits: 850,
        misses: 150,
        sets: 500,
        deletes: 100,
        averageGetTime: 2.5,
        averageSetTime: 5.0,
        averageDeleteTime: 1.0,
      });

      // Act
      const metrics = await repositoryCache.getPerformanceMetrics();

      // Assert
      expect(metrics).toBeDefined();
      expect(metrics.averageGetTime).toBe(2.5);
      expect(metrics.averageSetTime).toBe(5.0);
      expect(metrics.averageDeleteTime).toBe(1.0);
      expect(metrics.totalOperations).toBe(1600);
    });

    it('should track cache trends', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      mockCacheManager.getStats = jest.fn().mockResolvedValue({
        hits: 850,
        misses: 150,
        sets: 500,
        deletes: 100,
        timestamp: new Date('2023-01-15'),
      });

      // Act
      const trends = await repositoryCache.getCacheTrends(timeRange);

      // Assert
      expect(trends).toBeDefined();
      expect(trends.period).toEqual(timeRange);
      expect(trends.data).toBeDefined();
      expect(Array.isArray(trends.data)).toBe(true);
    });
  });

  describe('Cache Configuration', () => {
    it('should respect custom TTL settings', async () => {
      // Arrange
      const customTTL = 600;
      const cache = new RepositoryCache(mockCacheManager, mockLogger, { defaultTTL: customTTL });
      const key = 'test:key';
      const value = { id: '123', name: 'Test' };
      
      mockCacheManager.set = jest.fn().mockResolvedValue(true);

      // Act
      await cache.set(key, value);

      // Assert
      expect(mockCacheManager.set).toHaveBeenCalledWith(key, value, customTTL);
    });

    it('should handle repository-specific TTL', async () => {
      // Arrange
      const repositoryTTLs = {
        'UserRepository': 300,
        'ProductRepository': 600,
        'OrderRepository': 900,
      };
      const cache = new RepositoryCache(mockCacheManager, mockLogger, { repositoryTTLs });
      
      mockCacheManager.set = jest.fn().mockResolvedValue(true);

      // Act
      await cache.cacheEntity('UserRepository', 'user-123', { id: 'user-123' });
      await cache.cacheEntity('ProductRepository', 'prod-123', { id: 'prod-123' });

      // Assert
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'repo:UserRepository:entity:user-123',
        expect.any(Object),
        300
      );
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'repo:ProductRepository:entity:prod-123',
        expect.any(Object),
        600
      );
    });

    it('should handle cache size limits', async () => {
      // Arrange
      const maxSize = 100;
      const cache = new RepositoryCache(mockCacheManager, mockLogger, { maxSize });
      
      mockCacheManager.getStats = jest.fn().mockResolvedValue({
        size: 95,
        maxSize: maxSize,
      });
      mockCacheManager.getKeys = jest.fn().mockResolvedValue([
        'repo:UserRepository:entity:user-1',
        'repo:UserRepository:entity:user-2',
      ]);
      mockCacheManager.delete = jest.fn().mockResolvedValue(true);
      mockCacheManager.set = jest.fn().mockResolvedValue(true);

      // Act
      await cache.set('test:new-key', { id: 'new' });

      // Assert
      expect(mockCacheManager.delete).toHaveBeenCalledTimes(1); // Should evict one key
      expect(mockCacheManager.set).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle cache get errors gracefully', async () => {
      // Arrange
      const key = 'test:key';
      const error = new Error('Cache service unavailable');
      mockCacheManager.get = jest.fn().mockRejectedValue(error);

      // Act
      const result = await repositoryCache.get(key);

      // Assert
      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith('cache_get_error', expect.objectContaining({
        key,
        error: error.message,
      }));
    });

    it('should handle cache set errors gracefully', async () => {
      // Arrange
      const key = 'test:key';
      const value = { id: '123', name: 'Test' };
      const error = new Error('Cache write failed');
      mockCacheManager.set = jest.fn().mockRejectedValue(error);

      // Act
      const result = await repositoryCache.set(key, value);

      // Assert
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith('cache_set_error', expect.objectContaining({
        key,
        error: error.message,
      }));
    });

    it('should handle cache delete errors gracefully', async () => {
      // Arrange
      const key = 'test:key';
      const error = new Error('Cache delete failed');
      mockCacheManager.delete = jest.fn().mockRejectedValue(error);

      // Act
      const result = await repositoryCache.delete(key);

      // Assert
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith('cache_delete_error', expect.objectContaining({
        key,
        error: error.message,
      }));
    });

    it('should handle cache clear errors gracefully', async () => {
      // Arrange
      const error = new Error('Cache clear failed');
      mockCacheManager.clear = jest.fn().mockRejectedValue(error);

      // Act
      const result = await repositoryCache.clear();

      // Assert
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith('cache_clear_error', expect.objectContaining({
        error: error.message,
      }));
    });
  });

  describe('Performance Optimization', () => {
    it('should batch cache operations', async () => {
      // Arrange
      const operations = [
        { type: 'set', key: 'key1', value: { id: '1' } },
        { type: 'set', key: 'key2', value: { id: '2' } },
        { type: 'delete', key: 'key3' },
        { type: 'get', key: 'key4' },
      ];
      
      mockCacheManager.set = jest.fn().mockResolvedValue(true);
      mockCacheManager.delete = jest.fn().mockResolvedValue(true);
      mockCacheManager.get = jest.fn().mockResolvedValue({ id: '4' });

      // Act
      const results = await repositoryCache.batch(operations);

      // Assert
      expect(results).toHaveLength(4);
      expect(results[0]).toBe(true); // set result
      expect(results[1]).toBe(true); // set result
      expect(results[2]).toBe(true); // delete result
      expect(results[3]).toEqual({ id: '4' }); // get result
      expect(mockLogger.debug).toHaveBeenCalledWith('cache_batch_operation', expect.objectContaining({
        operationCount: 4,
      }));
    });

    it('should implement cache warming', async () => {
      // Arrange
      const warmupData = [
        { key: 'user:123', value: { id: '123', name: 'John' } },
        { key: 'user:456', value: { id: '456', name: 'Jane' } },
        { key: 'product:789', value: { id: '789', name: 'Widget' } },
      ];
      
      mockCacheManager.set = jest.fn().mockResolvedValue(true);

      // Act
      const result = await repositoryCache.warmup(warmupData);

      // Assert
      expect(result).toBe(true);
      expect(mockCacheManager.set).toHaveBeenCalledTimes(3);
      expect(mockLogger.info).toHaveBeenCalledWith('cache_warmup_completed', expect.objectContaining({
        keysWarmed: 3,
      }));
    });

    it('should implement cache preloading', async () => {
      // Arrange
      const preloadConfig = {
        repositoryType: 'UserRepository',
        entityIds: ['user-123', 'user-456', 'user-789'],
        queryKeys: ['users:active', 'users:premium'],
      };
      
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockCacheManager.set = jest.fn().mockResolvedValue(true);

      // Act
      const result = await repositoryCache.preload(preloadConfig);

      // Assert
      expect(result).toBe(true);
      expect(mockCacheManager.set).toHaveBeenCalledTimes(5); // 3 entities + 2 queries
      expect(mockLogger.info).toHaveBeenCalledWith('cache_preload_completed', expect.objectContaining({
        repositoryType: preloadConfig.repositoryType,
        keysPreloaded: 5,
      }));
    });
  });

  describe('Cache Monitoring', () => {
    it('should monitor cache health', async () => {
      // Arrange
      mockCacheManager.getStats = jest.fn().mockResolvedValue({
        hits: 850,
        misses: 150,
        size: 1000,
        maxSize: 2000,
        averageGetTime: 2.5,
      });

      // Act
      const health = await repositoryCache.getHealthStatus();

      // Assert
      expect(health).toBeDefined();
      expect(health.status).toBe('healthy');
      expect(health.hitRate).toBe(0.85);
      expect(health.memoryUsage).toBe(0.5);
      expect(health.averageResponseTime).toBe(2.5);
    });

    it('should detect cache issues', async () => {
      // Arrange
      mockCacheManager.getStats = jest.fn().mockResolvedValue({
        hits: 100,
        misses: 900,
        size: 1900,
        maxSize: 2000,
        averageGetTime: 50.0,
      });

      // Act
      const health = await repositoryCache.getHealthStatus();

      // Assert
      expect(health).toBeDefined();
      expect(health.status).toBe('critical');
      expect(health.issues).toContain('Low hit rate (10%)');
      expect(health.issues).toContain('High memory usage (95%)');
      expect(health.issues).toContain('High response time (50ms)');
    });

    it('should generate cache alerts', async () => {
      // Arrange
      mockCacheManager.getStats = jest.fn().mockResolvedValue({
        hits: 100,
        misses: 900,
        size: 1900,
        maxSize: 2000,
        averageGetTime: 50.0,
      });

      // Act
      const alerts = await repositoryCache.getAlerts();

      // Assert
      expect(alerts).toBeDefined();
      expect(alerts).toHaveLength(3);
      expect(alerts[0].level).toBe('warning');
      expect(alerts[0].message).toContain('hit rate');
      expect(alerts[1].level).toBe('critical');
      expect(alerts[1].message).toContain('memory usage');
      expect(alerts[2].level).toBe('warning');
      expect(alerts[2].message).toContain('response time');
    });
  });

  describe('Cache Maintenance', () => {
    it('should perform cache cleanup', async () => {
      // Arrange
      mockCacheManager.getKeys = jest.fn().mockResolvedValue([
        'repo:UserRepository:entity:user-1',
        'repo:UserRepository:entity:user-2',
        'expired:key1',
        'expired:key2',
      ]);
      mockCacheManager.get = jest.fn().mockImplementation((key) => {
        if (key.startsWith('expired')) {
          return Promise.resolve({ 
            cachedAt: new Date(Date.now() - 400000), 
            ttl: 300 
          });
        }
        return Promise.resolve({ 
          cachedAt: new Date(), 
          ttl: 300 
        });
      });
      mockCacheManager.delete = jest.fn().mockResolvedValue(true);

      // Act
      const result = await repositoryCache.cleanup();

      // Assert
      expect(result).toBeDefined();
      expect(result.cleanedKeys).toBe(2);
      expect(result.totalKeys).toBe(4);
      expect(mockCacheManager.delete).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith('cache_cleanup_completed', expect.objectContaining({
        cleanedKeys: 2,
        totalKeys: 4,
      }));
    });

    it('should perform cache optimization', async () => {
      // Arrange
      mockCacheManager.getStats = jest.fn().mockResolvedValue({
        hits: 850,
        misses: 150,
        size: 1500,
        maxSize: 2000,
      });
      mockCacheManager.getKeys = jest.fn().mockResolvedValue([
        'repo:UserRepository:entity:user-1',
        'repo:UserRepository:entity:user-2',
        'repo:UserRepository:query:users:active',
      ]);
      mockCacheManager.delete = jest.fn().mockResolvedValue(true);

      // Act
      const result = await repositoryCache.optimize();

      // Assert
      expect(result).toBeDefined();
      expect(result.optimized).toBe(true);
      expect(result.actions).toContain('Removed least recently used items');
      expect(result.actions).toContain('Compacted cache storage');
      expect(mockLogger.info).toHaveBeenCalledWith('cache_optimization_completed', expect.objectContaining({
        actions: expect.any(Array),
      }));
    });
  });
});
