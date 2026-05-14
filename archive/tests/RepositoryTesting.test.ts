/**
 * RepositoryTesting Tests
 * 
 * Comprehensive test suite for RepositoryTesting functionality including
 * test utilities, mock factories, test data generation, and test helpers.
 */

import { RepositoryTesting } from '../repositories/RepositoryTesting';
import { Logger } from '../logging/Logger';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

describe('RepositoryTesting', () => {
  let repositoryTesting: RepositoryTesting;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryTesting = new RepositoryTesting(mockLogger);
  });

  describe('Test Data Generation', () => {
    it('should generate test user data', () => {
      // Arrange
      const userConfig = {
        count: 5,
        fields: ['id', 'name', 'email', 'age', 'status'],
        overrides: {
          status: 'active',
        },
      };

      // Act
      const testData = repositoryTesting.generateTestData('User', userConfig);

      // Assert
      expect(testData).toBeDefined();
      expect(testData).toHaveLength(5);
      expect(testData[0]).toHaveProperty('id');
      expect(testData[0]).toHaveProperty('name');
      expect(testData[0]).toHaveProperty('email');
      expect(testData[0]).toHaveProperty('age');
      expect(testData[0]).toHaveProperty('status');
      expect(testData[0].status).toBe('active');
      expect(testData[0].email).toMatch(/@example\.com$/);
    });

    it('should generate test product data', () => {
      // Arrange
      const productConfig = {
        count: 3,
        fields: ['id', 'name', 'price', 'category', 'inStock'],
        overrides: {
          category: 'electronics',
          inStock: true,
        },
      };

      // Act
      const testData = repositoryTesting.generateTestData('Product', productConfig);

      // Assert
      expect(testData).toBeDefined();
      expect(testData).toHaveLength(3);
      expect(testData[0]).toHaveProperty('id');
      expect(testData[0]).toHaveProperty('name');
      expect(testData[0]).toHaveProperty('price');
      expect(testData[0]).toHaveProperty('category');
      expect(testData[0]).toHaveProperty('inStock');
      expect(testData[0].category).toBe('electronics');
      expect(testData[0].inStock).toBe(true);
      expect(typeof testData[0].price).toBe('number');
    });

    it('should generate test order data with relationships', () => {
      // Arrange
      const orderConfig = {
        count: 2,
        fields: ['id', 'userId', 'items', 'total', 'status'],
        relationships: {
          userId: 'User',
          items: 'Product',
        },
        overrides: {
          status: 'pending',
        },
      };

      // Act
      const testData = repositoryTesting.generateTestData('Order', orderConfig);

      // Assert
      expect(testData).toBeDefined();
      expect(testData).toHaveLength(2);
      expect(testData[0]).toHaveProperty('id');
      expect(testData[0]).toHaveProperty('userId');
      expect(testData[0]).toHaveProperty('items');
      expect(testData[0]).toHaveProperty('total');
      expect(testData[0]).toHaveProperty('status');
      expect(testData[0].status).toBe('pending');
      expect(Array.isArray(testData[0].items)).toBe(true);
    });

    it('should generate test data with custom field generators', () => {
      // Arrange
      const customConfig = {
        count: 3,
        fields: ['id', 'name', 'email', 'customField'],
        fieldGenerators: {
          customField: () => `custom-${Math.random().toString(36).substr(2, 9)}`,
          email: () => `test-${Math.random().toString(36).substr(2, 5)}@custom.com`,
        },
      };

      // Act
      const testData = repositoryTesting.generateTestData('CustomEntity', customConfig);

      // Assert
      expect(testData).toBeDefined();
      expect(testData).toHaveLength(3);
      expect(testData[0]).toHaveProperty('customField');
      expect(testData[0]).toHaveProperty('email');
      expect(testData[0].email).toMatch(/test-.*@custom\.com$/);
      expect(testData[0].customField).toMatch(/custom-.*/);
    });

    it('should generate test data with constraints', () => {
      // Arrange
      const constrainedConfig = {
        count: 5,
        fields: ['id', 'name', 'age', 'score'],
        constraints: {
          age: { min: 18, max: 65 },
          score: { min: 0, max: 100 },
          name: { minLength: 5, maxLength: 20 },
        },
      };

      // Act
      const testData = repositoryTesting.generateTestData('ConstrainedEntity', constrainedConfig);

      // Assert
      expect(testData).toBeDefined();
      expect(testData).toHaveLength(5);
      testData.forEach(item => {
        expect(item.age).toBeGreaterThanOrEqual(18);
        expect(item.age).toBeLessThanOrEqual(65);
        expect(item.score).toBeGreaterThanOrEqual(0);
        expect(item.score).toBeLessThanOrEqual(100);
        expect(item.name.length).toBeGreaterThanOrEqual(5);
        expect(item.name.length).toBeLessThanOrEqual(20);
      });
    });
  });

  describe('Mock Factories', () => {
    it('should create repository mock', () => {
      // Arrange
      const repositoryConfig = {
        name: 'UserRepository',
        methods: ['findById', 'findAll', 'create', 'update', 'delete'],
        returnTypes: {
          findById: 'User',
          findAll: 'User[]',
          create: 'User',
          update: 'User',
          delete: 'boolean',
        },
      };

      // Act
      const mockRepository = repositoryTesting.createRepositoryMock(repositoryConfig);

      // Assert
      expect(mockRepository).toBeDefined();
      expect(mockRepository.findById).toBeDefined();
      expect(mockRepository.findAll).toBeDefined();
      expect(mockRepository.create).toBeDefined();
      expect(mockRepository.update).toBeDefined();
      expect(mockRepository.delete).toBeDefined();
      expect(typeof mockRepository.findById).toBe('function');
    });

    it('should create database connection mock', () => {
      // Arrange
      const dbConfig = {
        methods: ['query', 'beginTransaction', 'commit', 'rollback'],
        defaultResponses: {
          query: { rows: [], rowCount: 0 },
          beginTransaction: Promise.resolve(),
          commit: Promise.resolve(),
          rollback: Promise.resolve(),
        },
      };

      // Act
      const mockDb = repositoryTesting.createDatabaseMock(dbConfig);

      // Assert
      expect(mockDb).toBeDefined();
      expect(mockDb.query).toBeDefined();
      expect(mockDb.beginTransaction).toBeDefined();
      expect(mockDb.commit).toBeDefined();
      expect(mockDb.rollback).toBeDefined();
      expect(typeof mockDb.query).toBe('function');
    });

    it('should create logger mock', () => {
      // Arrange
      const loggerConfig = {
        methods: ['info', 'warn', 'error', 'debug'],
        captureCalls: true,
      };

      // Act
      const mockLogger = repositoryTesting.createLoggerMock(loggerConfig);

      // Assert
      expect(mockLogger).toBeDefined();
      expect(mockLogger.info).toBeDefined();
      expect(mockLogger.warn).toBeDefined();
      expect(mockLogger.error).toBeDefined();
      expect(mockLogger.debug).toBeDefined();
      expect(typeof mockLogger.info).toBe('function');
      expect(mockLogger.calls).toBeDefined();
    });

    it('should create cache manager mock', () => {
      // Arrange
      const cacheConfig = {
        methods: ['get', 'set', 'delete', 'clear', 'getStats'],
        defaultResponses: {
          get: null,
          set: true,
          delete: true,
          clear: true,
          getStats: { hits: 0, misses: 0, sets: 0 },
        },
      };

      // Act
      const mockCache = repositoryTesting.createCacheMock(cacheConfig);

      // Assert
      expect(mockCache).toBeDefined();
      expect(mockCache.get).toBeDefined();
      expect(mockCache.set).toBeDefined();
      expect(mockCache.delete).toBeDefined();
      expect(mockCache.clear).toBeDefined();
      expect(mockCache.getStats).toBeDefined();
    });

    it('should create mock with custom implementations', () => {
      // Arrange
      const customConfig = {
        name: 'CustomRepository',
        methods: {
          findById: jest.fn().mockImplementation((id) => Promise.resolve({ id, name: `User ${id}` })),
          create: jest.fn().mockImplementation((data) => Promise.resolve({ ...data, id: Math.random() })),
        },
      };

      // Act
      const mockCustom = repositoryTesting.createCustomMock(customConfig);

      // Assert
      expect(mockCustom).toBeDefined();
      expect(mockCustom.findById).toBeDefined();
      expect(mockCustom.create).toBeDefined();
      
      // Test custom implementations
      return mockCustom.findById(123).then(result => {
        expect(result).toEqual({ id: 123, name: 'User 123' });
      });
    });
  });

  describe('Test Utilities', () => {
    it('should create test database connection', async () => {
      // Arrange
      const dbConfig = {
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        logging: false,
      };

      // Act
      const testDb = await repositoryTesting.createTestDatabase(dbConfig);

      // Assert
      expect(testDb).toBeDefined();
      expect(testDb.isConnected()).toBe(true);
    });

    it('should setup test data in database', async () => {
      // Arrange
      const testData = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ];

      const tableConfig = {
        name: 'users',
        schema: {
          id: 'INTEGER PRIMARY KEY',
          name: 'VARCHAR(255) NOT NULL',
          email: 'VARCHAR(255) NOT NULL',
        },
      };

      // Act
      const result = await repositoryTesting.setupTestData(testData, tableConfig);

      // Assert
      expect(result).toBeDefined();
      expect(result.inserted).toBe(2);
      expect(result.table).toBe('users');
    });

    it('should cleanup test database', async () => {
      // Arrange
      const cleanupConfig = {
        tables: ['users', 'products', 'orders'],
        resetSequences: true,
        vacuum: false,
      };

      // Act
      const result = await repositoryTesting.cleanupTestDatabase(cleanupConfig);

      // Assert
      expect(result).toBeDefined();
      expect(result.cleaned).toBe(true);
      expect(result.tables).toEqual(['users', 'products', 'orders']);
    });

    it('should create test transaction', async () => {
      // Arrange
      const transactionConfig = {
        isolationLevel: 'READ_COMMITTED',
        timeout: 5000,
        rollbackOnFailure: true,
      };

      // Act
      const transaction = await repositoryTesting.createTestTransaction(transactionConfig);

      // Assert
      expect(transaction).toBeDefined();
      expect(transaction.isActive).toBe(true);
      expect(transaction.isolationLevel).toBe('READ_COMMITTED');
    });

    it('should assert database state', async () => {
      // Arrange
      const assertConfig = {
        table: 'users',
        expectedCount: 5,
        conditions: { status: 'active' },
        orderBy: 'created_at DESC',
      };

      // Act
      const assertion = await repositoryTesting.assertDatabaseState(assertConfig);

      // Assert
      expect(assertion).toBeDefined();
      expect(assertion.passed).toBe(true);
      expect(assertion.actualCount).toBe(5);
    });
  });

  describe('Test Scenarios', () => {
    it('should create CRUD test scenario', () => {
      // Arrange
      const crudConfig = {
        entity: 'User',
        operations: ['create', 'read', 'update', 'delete'],
        testData: {
          create: { name: 'John Doe', email: 'john@example.com' },
          update: { name: 'John Smith' },
        },
        assertions: {
          create: { shouldExist: true, fields: ['id', 'name', 'email'] },
          read: { shouldMatch: 'create' },
          update: { shouldMatch: 'update' },
          delete: { shouldNotExist: true },
        },
      };

      // Act
      const scenario = repositoryTesting.createCRUDScenario(crudConfig);

      // Assert
      expect(scenario).toBeDefined();
      expect(scenario.entity).toBe('User');
      expect(scenario.operations).toEqual(['create', 'read', 'update', 'delete']);
      expect(scenario.testData).toBeDefined();
      expect(scenario.assertions).toBeDefined();
    });

    it('should create performance test scenario', () => {
      // Arrange
      const performanceConfig = {
        operation: 'findAll',
        repository: 'UserRepository',
        iterations: 100,
        concurrency: 10,
        thresholds: {
          maxDuration: 1000, // 1 second
          maxMemory: 100 * 1024 * 1024, // 100MB
          maxCPU: 80, // 80%
        },
      };

      // Act
      const scenario = repositoryTesting.createPerformanceScenario(performanceConfig);

      // Assert
      expect(scenario).toBeDefined();
      expect(scenario.operation).toBe('findAll');
      expect(scenario.repository).toBe('UserRepository');
      expect(scenario.iterations).toBe(100);
      expect(scenario.concurrency).toBe(10);
      expect(scenario.thresholds).toBeDefined();
    });

    it('should create stress test scenario', () => {
      // Arrange
      const stressConfig = {
        operations: [
          { name: 'create', weight: 0.4 },
          { name: 'read', weight: 0.4 },
          { name: 'update', weight: 0.15 },
          { name: 'delete', weight: 0.05 },
        ],
        duration: 60000, // 1 minute
        rampUpTime: 10000, // 10 seconds
        concurrentUsers: 50,
        dataGeneration: 'dynamic',
      };

      // Act
      const scenario = repositoryTesting.createStressScenario(stressConfig);

      // Assert
      expect(scenario).toBeDefined();
      expect(scenario.operations).toHaveLength(4);
      expect(scenario.duration).toBe(60000);
      expect(scenario.rampUpTime).toBe(10000);
      expect(scenario.concurrentUsers).toBe(50);
    });

    it('should create integration test scenario', () => {
      // Arrange
      const integrationConfig = {
        repositories: ['UserRepository', 'OrderRepository', 'ProductRepository'],
        workflow: [
          { step: 'create_user', repository: 'UserRepository', operation: 'create' },
          { step: 'create_product', repository: 'ProductRepository', operation: 'create' },
          { step: 'create_order', repository: 'OrderRepository', operation: 'create' },
          { step: 'verify_order', repository: 'OrderRepository', operation: 'findById' },
        ],
        dataFlow: {
          create_user: { output: 'userId', input_to: 'create_order' },
          create_product: { output: 'productId', input_to: 'create_order' },
        },
      };

      // Act
      const scenario = repositoryTesting.createIntegrationScenario(integrationConfig);

      // Assert
      expect(scenario).toBeDefined();
      expect(scenario.repositories).toEqual(['UserRepository', 'OrderRepository', 'ProductRepository']);
      expect(scenario.workflow).toHaveLength(4);
      expect(scenario.dataFlow).toBeDefined();
    });
  });

  describe('Test Assertions', () => {
    it('should assert repository operation results', () => {
      // Arrange
      const operation = 'findById';
      const result = { id: 1, name: 'John Doe', email: 'john@example.com' };
      const expected = { id: 1, name: 'John Doe' };

      // Act
      const assertion = repositoryTesting.assertRepositoryResult(operation, result, expected);

      // Assert
      expect(assertion).toBeDefined();
      expect(assertion.passed).toBe(true);
      expect(assertion.operation).toBe('findById');
    });

    it('should assert error handling', () => {
      // Arrange
      const operation = 'create';
      const error = new Error('Validation failed');
      const expectedError = 'ValidationError';

      // Act
      const assertion = repositoryTesting.assertErrorHandling(operation, error, expectedError);

      // Assert
      expect(assertion).toBeDefined();
      expect(assertion.passed).toBe(false);
      expect(assertion.actualError).toBe('Validation failed');
      expect(assertion.expectedError).toBe('ValidationError');
    });

    it('should assert database state', async () => {
      // Arrange
      const table = 'users';
      const conditions = { status: 'active' };
      const expectedCount = 10;

      // Act
      const assertion = await repositoryTesting.assertDatabaseState(table, conditions, expectedCount);

      // Assert
      expect(assertion).toBeDefined();
      expect(assertion.table).toBe('users');
      expect(assertion.conditions).toEqual({ status: 'active' });
      expect(assertion.expectedCount).toBe(10);
    });

    it('should assert cache behavior', () => {
      // Arrange
      const operation = 'findById';
      const cacheKey = 'user:123';
      const cacheHits = 5;
      const cacheMisses = 2;
      const expectedHitRate = 0.7;

      // Act
      const assertion = repositoryTesting.assertCacheBehavior(operation, cacheKey, cacheHits, cacheMisses, expectedHitRate);

      // Assert
      expect(assertion).toBeDefined();
      expect(assertion.actualHitRate).toBe(0.714); // 5 / (5 + 2)
      expect(assertion.expectedHitRate).toBe(0.7);
      expect(assertion.passed).toBe(true);
    });

    it('should assert performance metrics', () => {
      // Arrange
      const operation = 'findAll';
      const metrics = {
        duration: 850,
        memoryUsage: 50 * 1024 * 1024, // 50MB
        cpuUsage: 45,
      };
      const thresholds = {
        maxDuration: 1000,
        maxMemory: 100 * 1024 * 1024, // 100MB
        maxCPU: 80,
      };

      // Act
      const assertion = repositoryTesting.assertPerformanceMetrics(operation, metrics, thresholds);

      // Assert
      expect(assertion).toBeDefined();
      expect(assertion.passed).toBe(true);
      expect(assertion.metrics).toEqual(metrics);
      expect(assertion.thresholds).toEqual(thresholds);
    });
  });

  describe('Test Execution', () => {
    it('should execute single test scenario', async () => {
      // Arrange
      const scenario = {
        name: 'User CRUD Test',
        setup: async () => {
          return { testData: { name: 'John Doe', email: 'john@example.com' } };
        },
        execute: async (context) => {
          return { result: { id: 1, ...context.testData } };
        },
        cleanup: async () => {
          return { cleaned: true };
        },
        assertions: [
          (result) => result.id !== undefined,
          (result) => result.name === 'John Doe',
        ],
      };

      // Act
      const execution = await repositoryTesting.executeTestScenario(scenario);

      // Assert
      expect(execution).toBeDefined();
      expect(execution.name).toBe('User CRUD Test');
      expect(execution.passed).toBe(true);
      expect(execution.duration).toBeGreaterThan(0);
      expect(execution.assertions).toHaveLength(2);
    });

    it('should execute multiple test scenarios', async () => {
      // Arrange
      const scenarios = [
        {
          name: 'Create User Test',
          execute: async () => ({ result: { id: 1, name: 'John' } }),
          assertions: [(result) => result.id !== undefined],
        },
        {
          name: 'Find User Test',
          execute: async () => ({ result: { id: 1, name: 'John' } }),
          assertions: [(result) => result.name === 'John'],
        },
        {
          name: 'Update User Test',
          execute: async () => ({ result: { id: 1, name: 'John Smith' } }),
          assertions: [(result) => result.name === 'John Smith'],
        },
      ];

      // Act
      const execution = await repositoryTesting.executeTestScenarios(scenarios);

      // Assert
      expect(execution).toBeDefined();
      expect(execution.total).toBe(3);
      expect(execution.passed).toBe(3);
      expect(execution.failed).toBe(0);
      expect(execution.scenarios).toHaveLength(3);
    });

    it('should execute performance test', async () => {
      // Arrange
      const performanceTest = {
        name: 'Repository Performance Test',
        operation: async () => {
          // Simulate database operation
          await new Promise(resolve => setTimeout(resolve, 10));
          return { data: 'test' };
        },
        iterations: 100,
        concurrency: 5,
        thresholds: {
          maxDuration: 50,
          maxMemory: 10 * 1024 * 1024,
        },
      };

      // Act
      const execution = await repositoryTesting.executePerformanceTest(performanceTest);

      // Assert
      expect(execution).toBeDefined();
      expect(execution.name).toBe('Repository Performance Test');
      expect(execution.iterations).toBe(100);
      expect(execution.concurrency).toBe(5);
      expect(execution.metrics).toBeDefined();
      expect(execution.metrics.averageDuration).toBeGreaterThan(0);
      expect(execution.passed).toBe(true);
    });

    it('should execute stress test', async () => {
      // Arrange
      const stressTest = {
        name: 'Repository Stress Test',
        operations: [
          { name: 'read', weight: 0.7, operation: async () => ({ data: 'test' }) },
          { name: 'write', weight: 0.3, operation: async () => ({ success: true }) },
        ],
        duration: 1000, // 1 second
        concurrentUsers: 10,
        thresholds: {
          maxErrorRate: 0.01, // 1%
          maxResponseTime: 100,
        },
      };

      // Act
      const execution = await repositoryTesting.executeStressTest(stressTest);

      // Assert
      expect(execution).toBeDefined();
      expect(execution.name).toBe('Repository Stress Test');
      expect(execution.duration).toBe(1000);
      expect(execution.concurrentUsers).toBe(10);
      expect(execution.metrics).toBeDefined();
      expect(execution.metrics.totalOperations).toBeGreaterThan(0);
    });
  });

  describe('Test Reporting', () => {
    it('should generate test report', () => {
      // Arrange
      const testResults = [
        {
          name: 'User CRUD Test',
          passed: true,
          duration: 150,
          assertions: 5,
          errors: [],
        },
        {
          name: 'Product CRUD Test',
          passed: false,
          duration: 200,
          assertions: 5,
          errors: ['Assertion failed: product name is required'],
        },
        {
          name: 'Order CRUD Test',
          passed: true,
          duration: 180,
          assertions: 5,
          errors: [],
        },
      ];

      // Act
      const report = repositoryTesting.generateTestReport(testResults);

      // Assert
      expect(report).toBeDefined();
      expect(report.summary.total).toBe(3);
      expect(report.summary.passed).toBe(2);
      expect(report.summary.failed).toBe(1);
      expect(report.summary.successRate).toBe(0.667);
      expect(report.summary.totalDuration).toBe(530);
      expect(report.details).toHaveLength(3);
    });

    it('should generate performance test report', () => {
      // Arrange
      const performanceResults = {
        name: 'Repository Performance Test',
        iterations: 1000,
        concurrency: 10,
        duration: 5000,
        metrics: {
          averageDuration: 45,
          minDuration: 20,
          maxDuration: 120,
          p95Duration: 80,
          p99Duration: 100,
          throughput: 200,
          errorRate: 0.01,
          memoryUsage: 50 * 1024 * 1024,
        },
        thresholds: {
          maxDuration: 100,
          maxMemory: 100 * 1024 * 1024,
          maxErrorRate: 0.05,
        },
      };

      // Act
      const report = repositoryTesting.generatePerformanceReport(performanceResults);

      // Assert
      expect(report).toBeDefined();
      expect(report.name).toBe('Repository Performance Test');
      expect(report.metrics).toBeDefined();
      expect(report.thresholds).toBeDefined();
      expect(report.passed).toBe(true);
      expect(report.recommendations).toBeDefined();
    });

    it('should generate coverage report', () => {
      // Arrange
      const coverageData = {
        repository: 'UserRepository',
        methods: [
          { name: 'findById', covered: true, calls: 150 },
          { name: 'findAll', covered: true, calls: 89 },
          { name: 'create', covered: true, calls: 45 },
          { name: 'update', covered: false, calls: 0 },
          { name: 'delete', covered: true, calls: 12 },
        ],
        lines: {
          total: 500,
          covered: 425,
        },
        branches: {
          total: 50,
          covered: 40,
        },
        functions: {
          total: 10,
          covered: 8,
        },
      };

      // Act
      const report = repositoryTesting.generateCoverageReport(coverageData);

      // Assert
      expect(report).toBeDefined();
      expect(report.repository).toBe('UserRepository');
      expect(report.lineCoverage).toBe(0.85);
      expect(report.branchCoverage).toBe(0.8);
      expect(report.functionCoverage).toBe(0.8);
      expect(report.methodCoverage).toBe(0.8);
      expect(report.uncoveredMethods).toEqual(['update']);
    });

    it('should generate test trend report', () => {
      // Arrange
      const trendData = [
        {
          date: new Date('2023-01-15'),
          total: 100,
          passed: 95,
          failed: 5,
          duration: 5000,
        },
        {
          date: new Date('2023-01-16'),
          total: 105,
          passed: 100,
          failed: 5,
          duration: 5200,
        },
        {
          date: new Date('2023-01-17'),
          total: 110,
          passed: 108,
          failed: 2,
          duration: 4800,
        },
      ];

      // Act
      const report = repositoryTesting.generateTrendReport(trendData);

      // Assert
      expect(report).toBeDefined();
      expect(report.trends).toHaveLength(3);
      expect(report.summary).toBeDefined();
      expect(report.summary.averageSuccessRate).toBeGreaterThan(0.95);
      expect(report.summary.averageDuration).toBeGreaterThan(0);
      expect(report.improvements).toBeDefined();
    });
  });

  describe('Test Configuration', () => {
    it('should configure test settings', () => {
      // Arrange
      const settings = {
        timeout: 30000,
        retries: 3,
        parallel: true,
        maxConcurrency: 10,
        verbose: true,
        bailOnFailure: false,
      };

      // Act
      repositoryTesting.configureTestSettings(settings);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('test_settings_configured', expect.objectContaining({
        settings,
      }));
    });

    it('should configure test database', () => {
      // Arrange
      const dbConfig = {
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        logging: false,
        entities: ['User', 'Product', 'Order'],
      };

      // Act
      repositoryTesting.configureTestDatabase(dbConfig);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('test_database_configured', expect.objectContaining({
        type: 'sqlite',
        entities: ['User', 'Product', 'Order'],
      }));
    });

    it('should configure test mocks', () => {
      // Arrange
      const mockConfig = {
        repositories: ['UserRepository', 'ProductRepository'],
        database: true,
        logger: true,
        cache: true,
        autoRestore: true,
      };

      // Act
      repositoryTesting.configureTestMocks(mockConfig);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('test_mocks_configured', expect.objectContaining({
        repositories: ['UserRepository', 'ProductRepository'],
      }));
    });

    it('should configure test reporting', () => {
      // Arrange
      const reportingConfig = {
        format: ['html', 'json'],
        outputDir: './test-results',
        includeCoverage: true,
        includePerformance: true,
        emailResults: false,
      };

      // Act
      repositoryTesting.configureTestReporting(reportingConfig);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('test_reporting_configured', expect.objectContaining({
        format: ['html', 'json'],
        outputDir: './test-results',
      }));
    });
  });
});
