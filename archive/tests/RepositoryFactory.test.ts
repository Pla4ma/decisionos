/**
 * RepositoryFactory Tests
 * 
 * Comprehensive test suite for RepositoryFactory functionality including
 * repository creation, dependency injection, configuration management, and factory patterns.
 */

import { RepositoryFactory } from '../repositories/RepositoryFactory';
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

describe('RepositoryFactory', () => {
  let repositoryFactory: RepositoryFactory;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryFactory = new RepositoryFactory(mockDbConnection, mockCacheManager, mockLogger);
  });

  describe('Repository Creation', () => {
    it('should create UserRepository', () => {
      // Act
      const repository = repositoryFactory.createUserRepository();

      // Assert
      expect(repository).toBeDefined();
      expect(repository.constructor.name).toBe('UserRepository');
      expect(mockLogger.info).toHaveBeenCalledWith('repository_created', expect.objectContaining({
        repositoryType: 'UserRepository',
      }));
    });

    it('should create ProductRepository', () => {
      // Act
      const repository = repositoryFactory.createProductRepository();

      // Assert
      expect(repository).toBeDefined();
      expect(repository.constructor.name).toBe('ProductRepository');
      expect(mockLogger.info).toHaveBeenCalledWith('repository_created', expect.objectContaining({
        repositoryType: 'ProductRepository',
      }));
    });

    it('should create OrderRepository', () => {
      // Act
      const repository = repositoryFactory.createOrderRepository();

      // Assert
      expect(repository).toBeDefined();
      expect(repository.constructor.name).toBe('OrderRepository');
      expect(mockLogger.info).toHaveBeenCalledWith('repository_created', expect.objectContaining({
        repositoryType: 'OrderRepository',
      }));
    });

    it('should create NotificationRepository', () => {
      // Act
      const repository = repositoryFactory.createNotificationRepository();

      // Assert
      expect(repository).toBeDefined();
      expect(repository.constructor.name).toBe('NotificationRepository');
      expect(mockLogger.info).toHaveBeenCalledWith('repository_created', expect.objectContaining({
        repositoryType: 'NotificationRepository',
      }));
    });

    it('should create AnalyticsRepository', () => {
      // Act
      const repository = repositoryFactory.createAnalyticsRepository();

      // Assert
      expect(repository).toBeDefined();
      expect(repository.constructor.name).toBe('AnalyticsRepository');
      expect(mockLogger.info).toHaveBeenCalledWith('repository_created', expect.objectContaining({
        repositoryType: 'AnalyticsRepository',
      }));
    });

    it('should create AuditRepository', () => {
      // Act
      const repository = repositoryFactory.createAuditRepository();

      // Assert
      expect(repository).toBeDefined();
      expect(repository.constructor.name).toBe('AuditRepository');
      expect(mockLogger.info).toHaveBeenCalledWith('repository_created', expect.objectContaining({
        repositoryType: 'AuditRepository',
      }));
    });

    it('should create PaymentRepository', () => {
      // Act
      const repository = repositoryFactory.createPaymentRepository();

      // Assert
      expect(repository).toBeDefined();
      expect(repository.constructor.name).toBe('PaymentRepository');
      expect(mockLogger.info).toHaveBeenCalledWith('repository_created', expect.objectContaining({
        repositoryType: 'PaymentRepository',
      }));
    });

    it('should create SettingsRepository', () => {
      // Act
      const repository = repositoryFactory.createSettingsRepository();

      // Assert
      expect(repository).toBeDefined();
      expect(repository.constructor.name).toBe('SettingsRepository');
      expect(mockLogger.info).toHaveBeenCalledWith('repository_created', expect.objectContaining({
        repositoryType: 'SettingsRepository',
      }));
    });

    it('should create IntegrationRepository', () => {
      // Act
      const repository = repositoryFactory.createIntegrationRepository();

      // Assert
      expect(repository).toBeDefined();
      expect(repository.constructor.name).toBe('IntegrationRepository');
      expect(mockLogger.info).toHaveBeenCalledWith('repository_created', expect.objectContaining({
        repositoryType: 'IntegrationRepository',
      }));
    });

    it('should create ReportRepository', () => {
      // Act
      const repository = repositoryFactory.createReportRepository();

      // Assert
      expect(repository).toBeDefined();
      expect(repository.constructor.name).toBe('ReportRepository');
      expect(mockLogger.info).toHaveBeenCalledWith('repository_created', expect.objectContaining({
        repositoryType: 'ReportRepository',
      }));
    });

    it('should create BackupRepository', () => {
      // Act
      const repository = repositoryFactory.createBackupRepository();

      // Assert
      expect(repository).toBeDefined();
      expect(repository.constructor.name).toBe('BackupRepository');
      expect(mockLogger.info).toHaveBeenCalledWith('repository_created', expect.objectContaining({
        repositoryType: 'BackupRepository',
      }));
    });
  });

  describe('Batch Repository Creation', () => {
    it('should create all repositories', () => {
      // Act
      const repositories = repositoryFactory.createAllRepositories();

      // Assert
      expect(repositories).toBeDefined();
      expect(Object.keys(repositories)).toHaveLength(11);
      expect(repositories.user).toBeDefined();
      expect(repositories.product).toBeDefined();
      expect(repositories.order).toBeDefined();
      expect(repositories.notification).toBeDefined();
      expect(repositories.analytics).toBeDefined();
      expect(repositories.audit).toBeDefined();
      expect(repositories.payment).toBeDefined();
      expect(repositories.settings).toBeDefined();
      expect(repositories.integration).toBeDefined();
      expect(repositories.report).toBeDefined();
      expect(repositories.backup).toBeDefined();

      // Verify logging
      expect(mockLogger.info).toHaveBeenCalledWith('repositories_batch_created', expect.objectContaining({
        count: 11,
      }));
    });

    it('should create repositories with custom configuration', () => {
      // Arrange
      const customConfig = {
        cacheTTL: 3600,
        enableLogging: false,
        retryAttempts: 3,
      };

      // Act
      const repositories = repositoryFactory.createAllRepositories(customConfig);

      // Assert
      expect(repositories).toBeDefined();
      expect(Object.keys(repositories)).toHaveLength(11);
      expect(mockLogger.info).toHaveBeenCalledWith('repositories_batch_created', expect.objectContaining({
        count: 11,
        config: customConfig,
      }));
    });
  });

  describe('Repository Caching', () => {
    it('should cache created repositories', () => {
      // Act
      const repository1 = repositoryFactory.createUserRepository();
      const repository2 = repositoryFactory.createUserRepository();

      // Assert
      expect(repository1).toBe(repository2);
      expect(mockLogger.debug).toHaveBeenCalledWith('repository_cache_hit', expect.objectContaining({
        repositoryType: 'UserRepository',
      }));
    });

    it('should clear repository cache', () => {
      // Act
      repositoryFactory.createUserRepository();
      repositoryFactory.clearCache();
      const repository2 = repositoryFactory.createUserRepository();

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('repository_cache_cleared');
    });

    it('should return cached repository statistics', () => {
      // Act
      repositoryFactory.createUserRepository();
      repositoryFactory.createProductRepository();
      const stats = repositoryFactory.getCacheStats();

      // Assert
      expect(stats).toBeDefined();
      expect(stats.totalCached).toBe(2);
      expect(stats.cacheHits).toBe(0);
      expect(stats.cacheMisses).toBe(2);
    });
  });

  describe('Configuration Management', () => {
    it('should apply default configuration', () => {
      // Act
      const repository = repositoryFactory.createUserRepository();

      // Assert
      expect(repository).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('repository_created', expect.objectContaining({
        repositoryType: 'UserRepository',
        config: expect.objectContaining({
          cacheTTL: expect.any(Number),
          enableLogging: expect.any(Boolean),
          retryAttempts: expect.any(Number),
        }),
      }));
    });

    it('should apply custom configuration', () => {
      // Arrange
      const customConfig = {
        cacheTTL: 7200,
        enableLogging: false,
        retryAttempts: 5,
        batchSize: 100,
      };

      // Act
      const repository = repositoryFactory.createUserRepository(customConfig);

      // Assert
      expect(repository).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('repository_created', expect.objectContaining({
        repositoryType: 'UserRepository',
        config: customConfig,
      }));
    });

    it('should validate configuration', () => {
      // Arrange
      const invalidConfig = {
        cacheTTL: -1, // Invalid TTL
        enableLogging: 'invalid' as any, // Invalid type
        retryAttempts: 0, // Invalid retry count
      };

      // Act & Assert
      expect(() => {
        repositoryFactory.createUserRepository(invalidConfig);
      }).toThrow('Invalid configuration');
    });

    it('should merge configurations properly', () => {
      // Arrange
      const baseConfig = {
        cacheTTL: 3600,
        enableLogging: true,
        retryAttempts: 3,
      };

      const overrideConfig = {
        cacheTTL: 7200,
        batchSize: 50,
      };

      // Act
      const repository = repositoryFactory.createUserRepository(baseConfig, overrideConfig);

      // Assert
      expect(repository).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('repository_created', expect.objectContaining({
        repositoryType: 'UserRepository',
        config: expect.objectContaining({
          cacheTTL: 7200, // Overridden
          enableLogging: true, // From base
          retryAttempts: 3, // From base
          batchSize: 50, // From override
        }),
      }));
    });
  });

  describe('Dependency Injection', () => {
    it('should inject dependencies into repositories', () => {
      // Act
      const repository = repositoryFactory.createUserRepository();

      // Assert
      expect(repository).toBeDefined();
      // Verify that the repository has access to the injected dependencies
      // This would typically be tested through the repository's methods
      expect(mockLogger.info).toHaveBeenCalledWith('repository_created', expect.objectContaining({
        repositoryType: 'UserRepository',
        dependencies: expect.objectContaining({
          database: 'DatabaseConnection',
          cache: 'CacheManager',
          logger: 'Logger',
        }),
      }));
    });

    it('should handle missing dependencies gracefully', () => {
      // Arrange
      const factoryWithoutDb = new RepositoryFactory(null as any, mockCacheManager, mockLogger);

      // Act & Assert
      expect(() => {
        factoryWithoutDb.createUserRepository();
      }).toThrow('Database connection is required');
    });

    it('should validate dependency types', () => {
      // Arrange
      const factoryWithInvalidDb = new RepositoryFactory(
        {} as any, // Invalid database connection
        mockCacheManager,
        mockLogger
      );

      // Act & Assert
      expect(() => {
        factoryWithInvalidDb.createUserRepository();
      }).toThrow('Invalid database connection type');
    });
  });

  describe('Error Handling', () => {
    it('should handle repository creation errors', () => {
      // Arrange
      const errorMessage = 'Failed to create repository';
      jest.spyOn(repositoryFactory as any, 'createRepositoryInstance').mockImplementation(() => {
        throw new Error(errorMessage);
      });

      // Act & Assert
      expect(() => {
        repositoryFactory.createUserRepository();
      }).toThrow(errorMessage);
      expect(mockLogger.error).toHaveBeenCalledWith('repository_creation_failed', expect.objectContaining({
        repositoryType: 'UserRepository',
        error: errorMessage,
      }));
    });

    it('should handle batch creation errors', () => {
      // Arrange
      const errorMessage = 'Batch creation failed';
      jest.spyOn(repositoryFactory, 'createAllRepositories').mockImplementation(() => {
        throw new Error(errorMessage);
      });

      // Act & Assert
      expect(() => {
        repositoryFactory.createAllRepositories();
      }).toThrow(errorMessage);
      expect(mockLogger.error).toHaveBeenCalledWith('batch_repository_creation_failed', expect.objectContaining({
        error: errorMessage,
      }));
    });

    it('should handle configuration errors', () => {
      // Arrange
      const invalidConfig = {
        invalidProperty: 'invalid',
      };

      // Act & Assert
      expect(() => {
        repositoryFactory.createUserRepository(invalidConfig);
      }).toThrow('Invalid configuration property');
      expect(mockLogger.error).toHaveBeenCalledWith('configuration_error', expect.objectContaining({
        repositoryType: 'UserRepository',
        error: expect.any(String),
      }));
    });
  });

  describe('Performance', () => {
    it('should create repositories efficiently', async () => {
      // Act
      const startTime = Date.now();
      const repositories = repositoryFactory.createAllRepositories();
      const endTime = Date.now();

      // Assert
      expect(repositories).toBeDefined();
      expect(Object.keys(repositories)).toHaveLength(11);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should handle concurrent repository creation', async () => {
      // Act
      const promises = Array.from({ length: 10 }, () => 
        repositoryFactory.createUserRepository()
      );
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(10);
      // All should be the same instance due to caching
      expect(results[0]).toBe(results[1]);
      expect(results[1]).toBe(results[2]);
    });

    it('should minimize memory usage', () => {
      // Act
      const repositories1 = repositoryFactory.createAllRepositories();
      const repositories2 = repositoryFactory.createAllRepositories();

      // Assert
      // Should reuse instances to minimize memory usage
      expect(repositories1.user).toBe(repositories2.user);
      expect(repositories1.product).toBe(repositories2.product);
    });
  });

  describe('Factory Patterns', () => {
    it('should support factory method pattern', () => {
      // Act
      const repository = RepositoryFactory.createRepository(
        'UserRepository',
        mockDbConnection,
        mockCacheManager,
        mockLogger
      );

      // Assert
      expect(repository).toBeDefined();
      expect(repository.constructor.name).toBe('UserRepository');
    });

    it('should support abstract factory pattern', () => {
      // Act
      const factory = RepositoryFactory.createFactory(
        mockDbConnection,
        mockCacheManager,
        mockLogger
      );

      // Assert
      expect(factory).toBeDefined();
      expect(factory.createUserRepository).toBeDefined();
      expect(factory.createProductRepository).toBeDefined();
    });

    it('should support builder pattern for configuration', () => {
      // Act
      const repository = RepositoryFactory.builder()
        .withDatabase(mockDbConnection)
        .withCache(mockCacheManager)
        .withLogger(mockLogger)
        .withConfig({ cacheTTL: 7200 })
        .buildUserRepository();

      // Assert
      expect(repository).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('repository_created', expect.objectContaining({
        repositoryType: 'UserRepository',
        config: expect.objectContaining({
          cacheTTL: 7200,
        }),
      }));
    });
  });

  describe('Repository Registry', () => {
    it('should register custom repositories', () => {
      // Arrange
      class CustomRepository {
        constructor(private db: any, private cache: any, private logger: any) {}
      }

      // Act
      repositoryFactory.registerRepository('CustomRepository', CustomRepository);
      const repository = repositoryFactory.createRepository('CustomRepository');

      // Assert
      expect(repository).toBeDefined();
      expect(repository.constructor.name).toBe('CustomRepository');
      expect(mockLogger.info).toHaveBeenCalledWith('custom_repository_registered', expect.objectContaining({
        repositoryType: 'CustomRepository',
      }));
    });

    it('should list registered repositories', () => {
      // Act
      const registered = repositoryFactory.getRegisteredRepositories();

      // Assert
      expect(registered).toBeDefined();
      expect(Array.isArray(registered)).toBe(true);
      expect(registered).toContain('UserRepository');
      expect(registered).toContain('ProductRepository');
    });

    it('should unregister repositories', () => {
      // Act
      repositoryFactory.unregisterRepository('UserRepository');
      const registered = repositoryFactory.getRegisteredRepositories();

      // Assert
      expect(registered).not.toContain('UserRepository');
      expect(mockLogger.info).toHaveBeenCalledWith('repository_unregistered', expect.objectContaining({
        repositoryType: 'UserRepository',
      }));
    });
  });

  describe('Lifecycle Management', () => {
    it('should initialize factory properly', () => {
      // Act
      const factory = new RepositoryFactory(mockDbConnection, mockCacheManager, mockLogger);

      // Assert
      expect(factory).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('repository_factory_initialized', expect.objectContaining({
        dependencies: ['DatabaseConnection', 'CacheManager', 'Logger'],
      }));
    });

    it('should dispose factory properly', () => {
      // Act
      repositoryFactory.dispose();

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('repository_factory_disposed');
      expect(mockCacheManager.clear).toHaveBeenCalled();
    });

    it('should handle disposal errors gracefully', () => {
      // Arrange
      mockCacheManager.clear = jest.fn().mockRejectedValue(new Error('Cache clear failed'));

      // Act
      repositoryFactory.dispose();

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith('factory_disposal_error', expect.objectContaining({
        error: 'Cache clear failed',
      }));
    });
  });

  describe('Monitoring and Metrics', () => {
    it('should track repository creation metrics', () => {
      // Act
      repositoryFactory.createUserRepository();
      repositoryFactory.createProductRepository();
      const metrics = repositoryFactory.getMetrics();

      // Assert
      expect(metrics).toBeDefined();
      expect(metrics.repositoriesCreated).toBe(2);
      expect(metrics.cacheHits).toBe(0);
      expect(metrics.cacheMisses).toBe(2);
      expect(metrics.averageCreationTime).toBeGreaterThan(0);
    });

    it('should track repository usage metrics', () => {
      // Act
      const repository = repositoryFactory.createUserRepository();
      repositoryFactory.trackRepositoryUsage('UserRepository', 'findById');
      const metrics = repositoryFactory.getUsageMetrics();

      // Assert
      expect(metrics).toBeDefined();
      expect(metrics.UserRepository).toBeDefined();
      expect(metrics.UserRepository.methodCalls).toBeDefined();
      expect(metrics.UserRepository.methodCalls.findById).toBe(1);
    });

    it('should reset metrics', () => {
      // Act
      repositoryFactory.createUserRepository();
      repositoryFactory.resetMetrics();
      const metrics = repositoryFactory.getMetrics();

      // Assert
      expect(metrics.repositoriesCreated).toBe(0);
      expect(metrics.cacheHits).toBe(0);
      expect(metrics.cacheMisses).toBe(0);
      expect(mockLogger.info).toHaveBeenCalledWith('repository_factory_metrics_reset');
    });
  });
});
