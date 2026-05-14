/**
 * BaseRepository Tests
 * 
 * Comprehensive test suite for BaseRepository functionality including
 * CRUD operations, caching, logging, validation, and error handling.
 */

import { BaseRepository } from '../repositories/BaseRepository';
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

// Test entity interface
interface TestEntity {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

// Test repository implementation
class TestRepository extends BaseRepository<TestEntity> {
  constructor(dbConnection: DatabaseConnection, cacheManager: CacheManager, logger: Logger) {
    super(dbConnection, cacheManager, logger, 'test_entities');
  }

  protected async mapRowToEntity(row: any): Promise<TestEntity> {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    };
  }

  protected async mapEntityToRow(entity: Partial<TestEntity>): Promise<Record<string, any>> {
    return {
      name: entity.name,
      description: entity.description,
      status: entity.status,
      metadata: entity.metadata ? JSON.stringify(entity.metadata) : null,
    };
  }

  protected validateEntity(entity: Partial<TestEntity>): void {
    if (!entity.name || entity.name.trim().length === 0) {
      throw new Error('Name is required and cannot be empty');
    }
    if (entity.status && !['active', 'inactive'].includes(entity.status)) {
      throw new Error('Invalid status value');
    }
  }

  protected getCacheKeyPrefix(): string {
    return 'test_repository';
  }

  // Additional methods for testing
  async findByName(name: string): Promise<TestEntity | null> {
    const cacheKey = `${this.getCacheKeyPrefix()}:findByName:${name}`;
    
    // Try cache first
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.logger.info('cache_hit', { operation: 'findByName', name });
      return cached as TestEntity;
    }

    // Query database
    const query = 'SELECT * FROM test_entities WHERE name = $1';
    const result = await this.dbConnection.query(query, [name]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const entity = await this.mapRowToEntity(result.rows[0]);
    
    // Cache the result
    await this.cacheManager.set(cacheKey, entity, this.getCacheTTL());
    
    return entity;
  }

  async updateStatus(id: string, status: 'active' | 'inactive'): Promise<TestEntity> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new Error('Entity not found');
    }

    const updates = { status, updatedAt: new Date() };
    return await this.update(id, updates);
  }

  async getActiveEntities(): Promise<TestEntity[]> {
    const query = 'SELECT * FROM test_entities WHERE status = $1 ORDER BY name';
    const result = await this.dbConnection.query(query, ['active']);
    
    return Promise.all(result.rows.map(row => this.mapRowToEntity(row)));
  }
}

describe('BaseRepository', () => {
  let testRepository: TestRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    testRepository = new TestRepository(mockDbConnection, mockCacheManager, mockLogger);
  });

  describe('Basic CRUD Operations', () => {
    it('should create entity', async () => {
      // Arrange
      const entityData = {
        name: 'Test Entity',
        description: 'Test description',
        status: 'active' as const,
        metadata: { category: 'test' },
      };

      const mockResult = {
        rows: [{
          id: 'entity-123',
          name: entityData.name,
          description: entityData.description,
          status: entityData.status,
          metadata: JSON.stringify(entityData.metadata),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await testRepository.create(entityData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(entityData.name);
      expect(result.status).toBe(entityData.status);
      expect(result.metadata).toEqual(entityData.metadata);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO test_entities'),
        expect.arrayContaining([
          entityData.name,
          entityData.description,
          entityData.status,
          JSON.stringify(entityData.metadata),
        ])
      );
      expect(mockLogger.info).toHaveBeenCalledWith('entity_created', expect.objectContaining({
        entityType: 'test_entities',
        entityId: result.id,
      }));
    });

    it('should find entity by ID', async () => {
      // Arrange
      const entityId = 'entity-123';
      const mockResult = {
        rows: [{
          id: entityId,
          name: 'Test Entity',
          description: 'Test description',
          status: 'active',
          metadata: JSON.stringify({ category: 'test' }),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await testRepository.findById(entityId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(entityId);
      expect(result.name).toBe('Test Entity');
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        'test_repository:findById:entity-123'
      );
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'test_repository:findById:entity-123',
        expect.any(Object),
        expect.any(Number)
      );
      expect(mockLogger.info).toHaveBeenCalledWith('entity_found', expect.objectContaining({
        entityType: 'test_entities',
        entityId,
      }));
    });

    it('should return null when entity not found', async () => {
      // Arrange
      const entityId = 'nonexistent-entity';
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await testRepository.findById(entityId);

      // Assert
      expect(result).toBeNull();
      expect(mockLogger.info).toHaveBeenCalledWith('entity_not_found', expect.objectContaining({
        entityType: 'test_entities',
        entityId,
      }));
    });

    it('should update entity', async () => {
      // Arrange
      const entityId = 'entity-123';
      const updates = {
        name: 'Updated Entity',
        description: 'Updated description',
        status: 'inactive' as const,
      };

      const mockResult = {
        rows: [{
          id: entityId,
          name: updates.name,
          description: updates.description,
          status: updates.status,
          metadata: null,
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await testRepository.update(entityId, updates);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(entityId);
      expect(result.name).toBe(updates.name);
      expect(result.status).toBe(updates.status);
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        'test_repository:findById:entity-123'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('entity_updated', expect.objectContaining({
        entityType: 'test_entities',
        entityId,
      }));
    });

    it('should delete entity', async () => {
      // Arrange
      const entityId = 'entity-123';
      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      const result = await testRepository.delete(entityId);

      // Assert
      expect(result).toBe(true);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        'DELETE FROM test_entities WHERE id = $1',
        [entityId]
      );
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        'test_repository:findById:entity-123'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('entity_deleted', expect.objectContaining({
        entityType: 'test_entities',
        entityId,
      }));
    });

    it('should find multiple entities', async () => {
      // Arrange
      const options = {
        limit: 10,
        offset: 0,
        where: 'status = $1',
        whereParams: ['active'],
        orderBy: 'name ASC',
      };

      const mockResult = {
        rows: [
          {
            id: 'entity-1',
            name: 'Entity 1',
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: 'entity-2',
            name: 'Entity 2',
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        count: 2,
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await testRepository.findMany(options);

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.data[0].name).toBe('Entity 1');
      expect(result.data[1].name).toBe('Entity 2');
    });
  });

  describe('Custom Repository Methods', () => {
    it('should find entity by name', async () => {
      // Arrange
      const name = 'Test Entity';
      const mockResult = {
        rows: [{
          id: 'entity-123',
          name: name,
          description: 'Test description',
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await testRepository.findByName(name);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(name);
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        'test_repository:findByName:Test Entity'
      );
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'test_repository:findByName:Test Entity',
        expect.any(Object),
        expect.any(Number)
      );
    });

    it('should update entity status', async () => {
      // Arrange
      const entityId = 'entity-123';
      const newStatus = 'inactive' as const;
      
      const findResult = {
        rows: [{
          id: entityId,
          name: 'Test Entity',
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      const updateResult = {
        rows: [{
          id: entityId,
          name: 'Test Entity',
          status: newStatus,
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn()
        .mockResolvedValueOnce(findResult)
        .mockResolvedValueOnce(updateResult);

      // Act
      const result = await testRepository.updateStatus(entityId, newStatus);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(newStatus);
      expect(mockDbConnection.query).toHaveBeenCalledTimes(2);
    });

    it('should get active entities', async () => {
      // Arrange
      const mockResult = {
        rows: [
          {
            id: 'entity-1',
            name: 'Active Entity 1',
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: 'entity-2',
            name: 'Active Entity 2',
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await testRepository.getActiveEntities();

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('active');
      expect(result[1].status).toBe('active');
    });
  });

  describe('Validation', () => {
    it('should validate entity on create', async () => {
      // Arrange
      const invalidEntity = {
        name: '',
        status: 'active' as const,
      };

      // Act & Assert
      await expect(testRepository.create(invalidEntity)).rejects.toThrow('Name is required and cannot be empty');
      expect(mockLogger.error).toHaveBeenCalledWith('validation_error', expect.objectContaining({
        entityType: 'test_entities',
        error: expect.any(String),
      }));
    });

    it('should validate entity status', async () => {
      // Arrange
      const invalidEntity = {
        name: 'Test Entity',
        status: 'invalid_status' as any,
      };

      // Act & Assert
      await expect(testRepository.create(invalidEntity)).rejects.toThrow('Invalid status value');
    });

    it('should validate entity on update', async () => {
      // Arrange
      const entityId = 'entity-123';
      const invalidUpdates = {
        name: '',
        status: 'invalid_status' as any,
      };

      // Act & Assert
      await expect(testRepository.update(entityId, invalidUpdates)).rejects.toThrow('Name is required and cannot be empty');
    });
  });

  describe('Caching', () => {
    it('should cache find by ID results', async () => {
      // Arrange
      const entityId = 'entity-123';
      const mockResult = {
        rows: [{
          id: entityId,
          name: 'Test Entity',
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await testRepository.findById(entityId);

      // Assert
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        'test_repository:findById:entity-123'
      );
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'test_repository:findById:entity-123',
        expect.any(Object),
        expect.any(Number)
      );
    });

    it('should return cached results when available', async () => {
      // Arrange
      const entityId = 'entity-123';
      const cachedEntity = {
        id: entityId,
        name: 'Test Entity',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(cachedEntity);

      // Act
      const result = await testRepository.findById(entityId);

      // Assert
      expect(result).toEqual(cachedEntity);
      expect(mockDbConnection.query).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('cache_hit', expect.objectContaining({
        operation: 'findById',
        entityId,
      }));
    });

    it('should clear cache on update', async () => {
      // Arrange
      const entityId = 'entity-123';
      const updates = { name: 'Updated Entity' };
      const mockResult = {
        rows: [{
          id: entityId,
          name: 'Updated Entity',
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await testRepository.update(entityId, updates);

      // Assert
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        'test_repository:findById:entity-123'
      );
    });

    it('should clear cache on delete', async () => {
      // Arrange
      const entityId = 'entity-123';
      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      await testRepository.delete(entityId);

      // Assert
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        'test_repository:findById:entity-123'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      const entityId = 'entity-123';
      const dbError = new Error('Database connection failed');
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockRejectedValue(dbError);

      // Act & Assert
      await expect(testRepository.findById(entityId)).rejects.toThrow('Database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith('database_error', expect.objectContaining({
        entityType: 'test_entities',
        operation: 'findById',
        entityId,
        error: dbError.message,
      }));
    });

    it('should handle validation errors gracefully', async () => {
      // Arrange
      const invalidEntity = {
        name: '',
        status: 'active' as const,
      };

      // Act & Assert
      await expect(testRepository.create(invalidEntity)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('validation_error', expect.objectContaining({
        entityType: 'test_entities',
        operation: 'create',
        error: expect.any(String),
      }));
    });

    it('should handle cache errors gracefully', async () => {
      // Arrange
      const entityId = 'entity-123';
      const cacheError = new Error('Cache service unavailable');
      mockCacheManager.get = jest.fn().mockRejectedValue(cacheError);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act & Assert
      await expect(testRepository.findById(entityId)).resolves.toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith('cache_error', expect.objectContaining({
        entityType: 'test_entities',
        operation: 'findById',
        entityId,
        error: cacheError.message,
      }));
    });
  });

  describe('Transactions', () => {
    it('should execute operations within transaction', async () => {
      // Arrange
      const entityData = {
        name: 'Test Entity',
        status: 'active' as const,
      };

      const mockResult = {
        rows: [{
          id: 'entity-123',
          name: entityData.name,
          status: entityData.status,
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.beginTransaction = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.commit = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await testRepository.withTransaction(async () => {
        return await testRepository.create(entityData);
      });

      // Assert
      expect(result).toBeDefined();
      expect(mockDbConnection.beginTransaction).toHaveBeenCalled();
      expect(mockDbConnection.commit).toHaveBeenCalled();
      expect(mockDbConnection.rollback).not.toHaveBeenCalled();
    });

    it('should rollback on transaction error', async () => {
      // Arrange
      const entityData = {
        name: 'Test Entity',
        status: 'active' as const,
      };

      mockDbConnection.beginTransaction = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.commit = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.rollback = jest.fn().mockResolvedValue(undefined);
      mockDbConnection.query = jest.fn().mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(testRepository.withTransaction(async () => {
        return await testRepository.create(entityData);
      })).rejects.toThrow('Database error');

      expect(mockDbConnection.beginTransaction).toHaveBeenCalled();
      expect(mockDbConnection.rollback).toHaveBeenCalled();
      expect(mockDbConnection.commit).not.toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should handle large result sets efficiently', async () => {
      // Arrange
      const largeResult = {
        rows: Array.from({ length: 1000 }, (_, i) => ({
          id: `entity-${i}`,
          name: `Entity ${i}`,
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        })),
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(largeResult);

      // Act
      const startTime = Date.now();
      const result = await testRepository.getActiveEntities();
      const endTime = Date.now();

      // Assert
      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should use parameterized queries for security', async () => {
      // Arrange
      const entityId = "entity-123'; DROP TABLE test_entities; --";
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      await testRepository.findById(entityId);

      // Assert
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM test_entities WHERE id = $1'),
        [entityId]
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values gracefully', async () => {
      // Arrange
      const entityId = 'entity-123';
      const mockResult = {
        rows: [{
          id: entityId,
          name: 'Test Entity',
          description: null,
          status: 'active',
          metadata: null,
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await testRepository.findById(entityId);

      // Assert
      expect(result).toBeDefined();
      expect(result.description).toBeNull();
      expect(result.metadata).toBeUndefined();
    });

    it('should handle empty result sets', async () => {
      // Arrange
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await testRepository.findById('nonexistent');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle concurrent operations', async () => {
      // Arrange
      const entityData = {
        name: 'Test Entity',
        status: 'active' as const,
      };

      const mockResult = {
        rows: [{
          id: 'entity-123',
          name: entityData.name,
          status: entityData.status,
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const promises = Array.from({ length: 10 }, () => 
        testRepository.create(entityData)
      );
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.name).toBe(entityData.name);
      });
    });

    it('should handle malformed JSON in metadata', async () => {
      // Arrange
      const entityId = 'entity-123';
      const mockResult = {
        rows: [{
          id: entityId,
          name: 'Test Entity',
          status: 'active',
          metadata: 'invalid-json',
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act & Assert
      await expect(testRepository.findById(entityId)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('json_parse_error', expect.objectContaining({
        entityType: 'test_entities',
        operation: 'findById',
        entityId,
      }));
    });
  });

  describe('Logging', () => {
    it('should log all CRUD operations', async () => {
      // Arrange
      const entityData = {
        name: 'Test Entity',
        status: 'active' as const,
      };

      const mockResult = {
        rows: [{
          id: 'entity-123',
          name: entityData.name,
          status: entityData.status,
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await testRepository.create(entityData);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('entity_created', expect.objectContaining({
        entityType: 'test_entities',
        entityId: 'entity-123',
        operation: 'create',
      }));
    });

    it('should log performance metrics', async () => {
      // Arrange
      const entityId = 'entity-123';
      const mockResult = {
        rows: [{
          id: entityId,
          name: 'Test Entity',
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await testRepository.findById(entityId);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('entity_found', expect.objectContaining({
        entityType: 'test_entities',
        entityId,
        operation: 'findById',
        duration: expect.any(Number),
      }));
    });
  });
});
