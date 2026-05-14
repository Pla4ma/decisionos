/**
 * RepositoryAPI Tests
 * 
 * Comprehensive test suite for RepositoryAPI functionality including
 * REST API endpoints, GraphQL resolvers, API authentication, and API documentation.
 */

import { RepositoryAPI } from '../repositories/RepositoryAPI';
import { Logger } from '../logging/Logger';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

describe('RepositoryAPI', () => {
  let repositoryAPI: RepositoryAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryAPI = new RepositoryAPI(mockLogger);
  });

  describe('REST API Endpoints', () => {
    it('should create GET endpoint for finding entities', async () => {
      // Arrange
      const endpointConfig = {
        path: '/users/:id',
        method: 'GET',
        repository: 'UserRepository',
        operation: 'findById',
        parameters: [
          { name: 'id', type: 'path', required: true, validation: { type: 'number', min: 1 } },
          { name: 'include', type: 'query', required: false, validation: { type: 'array', enum: ['profile', 'settings'] } },
        ],
        response: { type: 'User', status: 200 },
        errors: [
          { status: 404, message: 'User not found' },
          { status: 400, message: 'Invalid ID format' },
        ],
      };

      // Act
      const endpoint = repositoryAPI.createRESTEndpoint(endpointConfig);

      // Assert
      expect(endpoint).toBeDefined();
      expect(endpoint.path).toBe('/users/:id');
      expect(endpoint.method).toBe('GET');
      expect(endpoint.repository).toBe('UserRepository');
      expect(endpoint.operation).toBe('findById');
      expect(endpoint.parameters).toHaveLength(2);
      expect(endpoint.response.type).toBe('User');
      expect(endpoint.response.status).toBe(200);
    });

    it('should create POST endpoint for creating entities', async () => {
      // Arrange
      const endpointConfig = {
        path: '/users',
        method: 'POST',
        repository: 'UserRepository',
        operation: 'create',
        parameters: [
          { name: 'body', type: 'body', required: true, validation: { schema: 'UserCreateSchema' } },
        ],
        response: { type: 'User', status: 201 },
        errors: [
          { status: 400, message: 'Invalid user data' },
          { status: 409, message: 'User already exists' },
        ],
        middleware: ['authentication', 'validation', 'rateLimit'],
      };

      // Act
      const endpoint = repositoryAPI.createRESTEndpoint(endpointConfig);

      // Assert
      expect(endpoint).toBeDefined();
      expect(endpoint.path).toBe('/users');
      expect(endpoint.method).toBe('POST');
      expect(endpoint.repository).toBe('UserRepository');
      expect(endpoint.operation).toBe('create');
      expect(endpoint.parameters).toHaveLength(1);
      expect(endpoint.response.status).toBe(201);
      expect(endpoint.middleware).toEqual(['authentication', 'validation', 'rateLimit']);
    });

    it('should create PUT endpoint for updating entities', async () => {
      // Arrange
      const endpointConfig = {
        path: '/users/:id',
        method: 'PUT',
        repository: 'UserRepository',
        operation: 'update',
        parameters: [
          { name: 'id', type: 'path', required: true, validation: { type: 'number', min: 1 } },
          { name: 'body', type: 'body', required: true, validation: { schema: 'UserUpdateSchema' } },
        ],
        response: { type: 'User', status: 200 },
        errors: [
          { status: 404, message: 'User not found' },
          { status: 400, message: 'Invalid user data' },
        ],
      };

      // Act
      const endpoint = repositoryAPI.createRESTEndpoint(endpointConfig);

      // Assert
      expect(endpoint).toBeDefined();
      expect(endpoint.path).toBe('/users/:id');
      expect(endpoint.method).toBe('PUT');
      expect(endpoint.repository).toBe('UserRepository');
      expect(endpoint.operation).toBe('update');
      expect(endpoint.parameters).toHaveLength(2);
    });

    it('should create DELETE endpoint for deleting entities', async () => {
      // Arrange
      const endpointConfig = {
        path: '/users/:id',
        method: 'DELETE',
        repository: 'UserRepository',
        operation: 'delete',
        parameters: [
          { name: 'id', type: 'path', required: true, validation: { type: 'number', min: 1 } },
        ],
        response: { type: 'boolean', status: 200 },
        errors: [
          { status: 404, message: 'User not found' },
        ],
        middleware: ['authentication', 'authorization'],
      };

      // Act
      const endpoint = repositoryAPI.createRESTEndpoint(endpointConfig);

      // Assert
      expect(endpoint).toBeDefined();
      expect(endpoint.path).toBe('/users/:id');
      expect(endpoint.method).toBe('DELETE');
      expect(endpoint.repository).toBe('UserRepository');
      expect(endpoint.operation).toBe('delete');
      expect(endpoint.parameters).toHaveLength(1);
      expect(endpoint.middleware).toEqual(['authentication', 'authorization']);
    });

    it('should create batch operations endpoint', async () => {
      // Arrange
      const batchConfig = {
        path: '/users/batch',
        method: 'POST',
        repository: 'UserRepository',
        operations: [
          { name: 'create', operation: 'createMany', maxItems: 100 },
          { name: 'update', operation: 'updateMany', maxItems: 100 },
          { name: 'delete', operation: 'deleteMany', maxItems: 50 },
        ],
        parameters: [
          { name: 'body', type: 'body', required: true, validation: { schema: 'BatchOperationSchema' } },
        ],
        response: { type: 'BatchResult', status: 200 },
        errors: [
          { status: 400, message: 'Invalid batch operation' },
          { status: 413, message: 'Batch size too large' },
        ],
      };

      // Act
      const endpoint = repositoryAPI.createBatchEndpoint(batchConfig);

      // Assert
      expect(endpoint).toBeDefined();
      expect(endpoint.path).toBe('/users/batch');
      expect(endpoint.method).toBe('POST');
      expect(endpoint.operations).toHaveLength(3);
      expect(endpoint.operations[0].name).toBe('create');
      expect(endpoint.operations[0].maxItems).toBe(100);
    });
  });

  describe('GraphQL Resolvers', () => {
    it('should create GraphQL query resolver', async () => {
      // Arrange
      const resolverConfig = {
        type: 'query',
        name: 'user',
        repository: 'UserRepository',
        operation: 'findById',
        args: [
          { name: 'id', type: 'ID!', required: true },
          { name: 'include', type: '[String!]', required: false },
        ],
        returnType: 'User',
        middleware: ['authentication', 'authorization'],
      };

      // Act
      const resolver = repositoryAPI.createGraphQLResolver(resolverConfig);

      // Assert
      expect(resolver).toBeDefined();
      expect(resolver.type).toBe('query');
      expect(resolver.name).toBe('user');
      expect(resolver.repository).toBe('UserRepository');
      expect(resolver.operation).toBe('findById');
      expect(resolver.args).toHaveLength(2);
      expect(resolver.returnType).toBe('User');
    });

    it('should create GraphQL mutation resolver', async () => {
      // Arrange
      const resolverConfig = {
        type: 'mutation',
        name: 'createUser',
        repository: 'UserRepository',
        operation: 'create',
        args: [
          { name: 'input', type: 'UserCreateInput!', required: true },
        ],
        returnType: 'User',
        middleware: ['authentication', 'validation', 'rateLimit'],
      };

      // Act
      const resolver = repositoryAPI.createGraphQLResolver(resolverConfig);

      // Assert
      expect(resolver).toBeDefined();
      expect(resolver.type).toBe('mutation');
      expect(resolver.name).toBe('createUser');
      expect(resolver.repository).toBe('UserRepository');
      expect(resolver.operation).toBe('create');
      expect(resolver.args).toHaveLength(1);
      expect(resolver.returnType).toBe('User');
    });

    it('should create GraphQL subscription resolver', async () => {
      // Arrange
      const resolverConfig = {
        type: 'subscription',
        name: 'userUpdated',
        repository: 'UserRepository',
        operation: 'subscribe',
        args: [
          { name: 'userId', type: 'ID!', required: true },
        ],
        returnType: 'User',
        events: ['user.created', 'user.updated', 'user.deleted'],
        middleware: ['authentication'],
      };

      // Act
      const resolver = repositoryAPI.createGraphQLResolver(resolverConfig);

      // Assert
      expect(resolver).toBeDefined();
      expect(resolver.type).toBe('subscription');
      expect(resolver.name).toBe('userUpdated');
      expect(resolver.repository).toBe('UserRepository');
      expect(resolver.operation).toBe('subscribe');
      expect(resolver.events).toEqual(['user.created', 'user.updated', 'user.deleted']);
    });

    it('should create complex GraphQL resolver with nested operations', async () => {
      // Arrange
      const resolverConfig = {
        type: 'query',
        name: 'users',
        repository: 'UserRepository',
        operation: 'findWithRelations',
        args: [
          { name: 'filter', type: 'UserFilter', required: false },
          { name: 'sort', type: 'UserSort', required: false },
          { name: 'pagination', type: 'PaginationInput', required: false },
        ],
        returnType: 'UserConnection',
        middleware: ['authentication'],
        complexity: 5,
        maxDepth: 3,
      };

      // Act
      const resolver = repositoryAPI.createGraphQLResolver(resolverConfig);

      // Assert
      expect(resolver).toBeDefined();
      expect(resolver.type).toBe('query');
      expect(resolver.name).toBe('users');
      expect(resolver.complexity).toBe(5);
      expect(resolver.maxDepth).toBe(3);
      expect(resolver.returnType).toBe('UserConnection');
    });
  });

  describe('API Authentication', () => {
    it('should configure JWT authentication', () => {
      // Arrange
      const authConfig = {
        type: 'jwt',
        secret: 'jwt-secret-key',
        algorithm: 'HS256',
        expiresIn: '1h',
        issuer: 'vex-app',
        audience: 'vex-users',
        middleware: ['authentication'],
      };

      // Act
      const authentication = repositoryAPI.configureAuthentication(authConfig);

      // Assert
      expect(authentication).toBeDefined();
      expect(authentication.type).toBe('jwt');
      expect(authentication.secret).toBe('jwt-secret-key');
      expect(authentication.algorithm).toBe('HS256');
      expect(authentication.expiresIn).toBe('1h');
      expect(authentication.issuer).toBe('vex-app');
    });

    it('should configure API key authentication', () => {
      // Arrange
      const authConfig = {
        type: 'api_key',
        headerName: 'X-API-Key',
        keyValidator: (key: string) => key.startsWith('vex-'),
        keyStore: {
          type: 'database',
          table: 'api_keys',
        },
        middleware: ['authentication'],
      };

      // Act
      const authentication = repositoryAPI.configureAuthentication(authConfig);

      // Assert
      expect(authentication).toBeDefined();
      expect(authentication.type).toBe('api_key');
      expect(authentication.headerName).toBe('X-API-Key');
      expect(authentication.keyStore.type).toBe('database');
    });

    it('should configure OAuth authentication', () => {
      // Arrange
      const authConfig = {
        type: 'oauth',
        provider: 'google',
        clientId: 'google-client-id',
        clientSecret: 'google-client-secret',
        scopes: ['email', 'profile'],
        redirectUri: 'https://app.example.com/auth/callback',
        middleware: ['authentication'],
      };

      // Act
      const authentication = repositoryAPI.configureAuthentication(authConfig);

      // Assert
      expect(authentication).toBeDefined();
      expect(authentication.type).toBe('oauth');
      expect(authentication.provider).toBe('google');
      expect(authentication.clientId).toBe('google-client-id');
      expect(authentication.scopes).toEqual(['email', 'profile']);
    });

    it('should validate authentication tokens', async () => {
      // Arrange
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const validationConfig = {
        type: 'jwt',
        secret: 'jwt-secret-key',
        algorithm: 'HS256',
        issuer: 'vex-app',
        audience: 'vex-users',
      };

      // Act
      const validation = await repositoryAPI.validateAuthToken(token, validationConfig);

      // Assert
      expect(validation).toBeDefined();
      expect(validation.valid).toBe(true);
      expect(validation.payload).toBeDefined();
      expect(validation.expiresAt).toBeDefined();
    });

    it('should handle authentication failures', async () => {
      // Arrange
      const invalidToken = 'invalid-token';
      const validationConfig = {
        type: 'jwt',
        secret: 'jwt-secret-key',
        algorithm: 'HS256',
      };

      // Act
      const validation = await repositoryAPI.validateAuthToken(invalidToken, validationConfig);

      // Assert
      expect(validation).toBeDefined();
      expect(validation.valid).toBe(false);
      expect(validation.error).toBeDefined();
    });
  });

  describe('API Authorization', () => {
    it('should configure role-based authorization', () => {
      // Arrange
      const authzConfig = {
        type: 'rbac',
        roles: ['admin', 'user', 'guest'],
        permissions: [
          { role: 'admin', permissions: ['read', 'write', 'delete'] },
          { role: 'user', permissions: ['read', 'write'] },
          { role: 'guest', permissions: ['read'] },
        ],
        middleware: ['authorization'],
      };

      // Act
      const authorization = repositoryAPI.configureAuthorization(authzConfig);

      // Assert
      expect(authorization).toBeDefined();
      expect(authorization.type).toBe('rbac');
      expect(authorization.roles).toEqual(['admin', 'user', 'guest']);
      expect(authorization.permissions).toHaveLength(3);
    });

    it('should configure attribute-based authorization', () => {
      // Arrange
      const authzConfig = {
        type: 'abac',
        policies: [
          {
            name: 'user_can_access_own_data',
            condition: 'user.id == resource.ownerId',
            effect: 'allow',
          },
          {
            name: 'admin_can_access_all_data',
            condition: 'user.role == "admin"',
            effect: 'allow',
          },
        ],
        middleware: ['authorization'],
      };

      // Act
      const authorization = repositoryAPI.configureAuthorization(authzConfig);

      // Assert
      expect(authorization).toBeDefined();
      expect(authorization.type).toBe('abac');
      expect(authorization.policies).toHaveLength(2);
      expect(authorization.policies[0].name).toBe('user_can_access_own_data');
    });

    it('should check user permissions', async () => {
      // Arrange
      const user = { id: 1, role: 'user', permissions: ['read', 'write'] };
      const resource = { type: 'user', ownerId: 1 };
      const action = 'read';
      const authzConfig = {
        type: 'rbac',
        roles: ['admin', 'user', 'guest'],
        permissions: [
          { role: 'user', permissions: ['read', 'write'] },
        ],
      };

      // Act
      const authorized = await repositoryAPI.checkAuthorization(user, resource, action, authzConfig);

      // Assert
      expect(authorized).toBeDefined();
      expect(authorized.allowed).toBe(true);
      expect(authorized.reason).toBe('Permission granted');
    });

    it('should deny unauthorized access', async () => {
      // Arrange
      const user = { id: 2, role: 'guest', permissions: ['read'] };
      const resource = { type: 'user', ownerId: 1 };
      const action = 'delete';
      const authzConfig = {
        type: 'rbac',
        roles: ['admin', 'user', 'guest'],
        permissions: [
          { role: 'guest', permissions: ['read'] },
        ],
      };

      // Act
      const authorized = await repositoryAPI.checkAuthorization(user, resource, action, authzConfig);

      // Assert
      expect(authorized).toBeDefined();
      expect(authorized.allowed).toBe(false);
      expect(authorized.reason).toBe('Permission denied');
    });
  });

  describe('API Validation', () => {
    it('should configure request validation', () => {
      // Arrange
      const validationConfig = {
        schemas: {
          UserCreate: {
            type: 'object',
            required: ['name', 'email'],
            properties: {
              name: { type: 'string', minLength: 2, maxLength: 100 },
              email: { type: 'string', format: 'email' },
              age: { type: 'number', minimum: 0, maximum: 150 },
            },
          },
        },
        middleware: ['validation'],
        errorHandling: 'detailed',
      };

      // Act
      const validation = repositoryAPI.configureValidation(validationConfig);

      // Assert
      expect(validation).toBeDefined();
      expect(validation.schemas).toBeDefined();
      expect(validation.schemas.UserCreate).toBeDefined();
      expect(validation.middleware).toEqual(['validation']);
    });

    it('should validate request data', async () => {
      // Arrange
      const data = { name: 'John Doe', email: 'john@example.com', age: 30 };
      const schema = {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          age: { type: 'number', minimum: 0, maximum: 150 },
        },
      };

      // Act
      const validation = await repositoryAPI.validateRequestData(data, schema);

      // Assert
      expect(validation).toBeDefined();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect validation errors', async () => {
      // Arrange
      const invalidData = { name: '', email: 'invalid-email', age: -5 };
      const schema = {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          age: { type: 'number', minimum: 0, maximum: 150 },
        },
      };

      // Act
      const validation = await repositoryAPI.validateRequestData(invalidData, schema);

      // Assert
      expect(validation).toBeDefined();
      expect(validation.valid).toBe(false);
      expect(validation.errors).toHaveLength(3);
    });

    it('should sanitize request data', async () => {
      // Arrange
      const data = {
        name: '  John Doe  ',
        email: 'john@example.com',
        description: '<script>alert("xss")</script>Hello',
      };

      const sanitizationConfig = {
        trimStrings: true,
        escapeHTML: true,
        removeScripts: true,
        normalizeEmail: true,
      };

      // Act
      const sanitized = await repositoryAPI.sanitizeRequestData(data, sanitizationConfig);

      // Assert
      expect(sanitized).toBeDefined();
      expect(sanitized.name).toBe('John Doe');
      expect(sanitized.email).toBe('john@example.com');
      expect(sanitized.description).toBe('Hello');
    });
  });

  describe('API Rate Limiting', () => {
    it('should configure rate limiting', () => {
      // Arrange
      const rateLimitConfig = {
        type: 'sliding_window',
        windowMs: 60000, // 1 minute
        maxRequests: 100,
        keyGenerator: (req: any) => req.ip,
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
        middleware: ['rateLimit'],
      };

      // Act
      const rateLimit = repositoryAPI.configureRateLimiting(rateLimitConfig);

      // Assert
      expect(rateLimit).toBeDefined();
      expect(rateLimit.type).toBe('sliding_window');
      expect(rateLimit.windowMs).toBe(60000);
      expect(rateLimit.maxRequests).toBe(100);
      expect(rateLimit.middleware).toEqual(['rateLimit']);
    });

    it('should check rate limit status', async () => {
      // Arrange
      const clientId = '192.168.1.100';
      const rateLimitConfig = {
        type: 'sliding_window',
        windowMs: 60000,
        maxRequests: 100,
      };

      // Act
      const status = await repositoryAPI.checkRateLimit(clientId, rateLimitConfig);

      // Assert
      expect(status).toBeDefined();
      expect(status.allowed).toBe(true);
      expect(status.remaining).toBeGreaterThan(0);
      expect(status.resetTime).toBeDefined();
    });

    it('should block requests exceeding rate limit', async () => {
      // Arrange
      const clientId = '192.168.1.100';
      const rateLimitConfig = {
        type: 'sliding_window',
        windowMs: 60000,
        maxRequests: 1, // Very low limit for testing
      };

      // First request should be allowed
      await repositoryAPI.checkRateLimit(clientId, rateLimitConfig);

      // Act - Second request should be blocked
      const status = await repositoryAPI.checkRateLimit(clientId, rateLimitConfig);

      // Assert
      expect(status).toBeDefined();
      expect(status.allowed).toBe(false);
      expect(status.remaining).toBe(0);
    });
  });

  describe('API Documentation', () => {
    it('should generate OpenAPI specification', async () => {
      // Arrange
      const openAPIConfig = {
        info: {
          title: 'VEX App API',
          version: '1.0.0',
          description: 'VEX Application REST API',
        },
        servers: [
          { url: 'https://api.example.com/v1', description: 'Production' },
          { url: 'https://staging-api.example.com/v1', description: 'Staging' },
        ],
        paths: {
          '/users': {
            get: {
              summary: 'List all users',
              parameters: [
                { name: 'limit', in: 'query', schema: { type: 'integer' } },
                { name: 'offset', in: 'query', schema: { type: 'integer' } },
              ],
              responses: {
                200: {
                  description: 'List of users',
                  content: {
                    'application/json': {
                      schema: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                    },
                  },
                },
              },
            },
            post: {
              summary: 'Create a new user',
              requestBody: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/UserCreate' },
                  },
                },
              },
              responses: {
                201: {
                  description: 'User created successfully',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
              },
            },
            UserCreate: {
              type: 'object',
              required: ['name', 'email'],
              properties: {
                name: { type: 'string', minLength: 2 },
                email: { type: 'string', format: 'email' },
              },
            },
          },
        },
      };

      // Act
      const spec = await repositoryAPI.generateOpenAPISpec(openAPIConfig);

      // Assert
      expect(spec).toBeDefined();
      expect(spec.openapi).toBe('3.0.0');
      expect(spec.info.title).toBe('VEX App API');
      expect(spec.servers).toHaveLength(2);
      expect(spec.paths).toBeDefined();
      expect(spec.components).toBeDefined();
    });

    it('should generate GraphQL schema', async () => {
      // Arrange
      const graphqlConfig = {
        types: [
          {
            name: 'User',
            kind: 'OBJECT',
            fields: [
              { name: 'id', type: 'ID!' },
              { name: 'name', type: 'String!' },
              { name: 'email', type: 'String!' },
              { name: 'createdAt', type: 'String!' },
            ],
          },
          {
            name: 'Query',
            kind: 'OBJECT',
            fields: [
              {
                name: 'user',
                type: 'User',
                args: [
                  { name: 'id', type: 'ID!' },
                ],
              },
              {
                name: 'users',
                type: '[User!]!',
                args: [
                  { name: 'limit', type: 'Int' },
                  { name: 'offset', type: 'Int' },
                ],
              },
            ],
          },
          {
            name: 'Mutation',
            kind: 'OBJECT',
            fields: [
              {
                name: 'createUser',
                type: 'User!',
                args: [
                  { name: 'input', type: 'UserCreateInput!' },
                ],
              },
            ],
          },
        ],
      };

      // Act
      const schema = await repositoryAPI.generateGraphQLSchema(graphqlConfig);

      // Assert
      expect(schema).toBeDefined();
      expect(schema.types).toHaveLength(3);
      expect(schema.types[0].name).toBe('User');
      expect(schema.types[1].name).toBe('Query');
      expect(schema.types[2].name).toBe('Mutation');
    });

    it('should generate API documentation', async () => {
      // Arrange
      const docsConfig = {
        title: 'VEX App API Documentation',
        description: 'Comprehensive API documentation for VEX Application',
        version: '1.0.0',
        formats: ['html', 'markdown', 'pdf'],
        includeExamples: true,
        includeAuthentication: true,
        includeErrorCodes: true,
      };

      // Act
      const docs = await repositoryAPI.generateAPIDocumentation(docsConfig);

      // Assert
      expect(docs).toBeDefined();
      expect(docs.title).toBe('VEX App API Documentation');
      expect(docs.formats).toEqual(['html', 'markdown', 'pdf']);
      expect(docs.includeExamples).toBe(true);
      expect(docs.includeAuthentication).toBe(true);
      expect(docs.content).toBeDefined();
    });
  });

  describe('API Testing', () => {
    it('should generate API test suite', async () => {
      // Arrange
      const testConfig = {
        repository: 'UserRepository',
        endpoints: [
          {
            path: '/users',
            method: 'GET',
            tests: [
              { name: 'list_users_success', status: 200 },
              { name: 'list_users_with_filter', status: 200, query: { limit: 10 } },
            ],
          },
          {
            path: '/users',
            method: 'POST',
            tests: [
              { name: 'create_user_success', status: 201, body: { name: 'John', email: 'john@example.com' } },
              { name: 'create_user_invalid', status: 400, body: { name: '', email: 'invalid' } },
            ],
          },
        ],
        environment: 'test',
        baseUrl: 'http://localhost:3000/api/v1',
      };

      // Act
      const testSuite = await repositoryAPI.generateAPITestSuite(testConfig);

      // Assert
      expect(testSuite).toBeDefined();
      expect(testSuite.repository).toBe('UserRepository');
      expect(testSuite.endpoints).toHaveLength(2);
      expect(testSuite.environment).toBe('test');
      expect(testSuite.baseUrl).toBe('http://localhost:3000/api/v1');
      expect(testSuite.tests).toBeDefined();
    });

    it('should execute API tests', async () => {
      // Arrange
      const testExecution = {
        testSuite: 'user-api-tests',
        environment: 'test',
        baseUrl: 'http://localhost:3000/api/v1',
        timeout: 30000,
        parallel: true,
      };

      // Act
      const execution = await repositoryAPI.executeAPITests(testExecution);

      // Assert
      expect(execution).toBeDefined();
      expect(execution.testSuite).toBe('user-api-tests');
      expect(execution.environment).toBe('test');
      expect(execution.results).toBeDefined();
      expect(execution.summary).toBeDefined();
    });

    it('should generate API test reports', async () => {
      // Arrange
      const reportConfig = {
        testSuite: 'user-api-tests',
        format: 'html',
        includeCoverage: true,
        includePerformance: true,
        includeFailures: true,
      };

      // Act
      const report = await repositoryAPI.generateAPITestReport(reportConfig);

      // Assert
      expect(report).toBeDefined();
      expect(report.testSuite).toBe('user-api-tests');
      expect(report.format).toBe('html');
      expect(report.includeCoverage).toBe(true);
      expect(report.includePerformance).toBe(true);
      expect(report.content).toBeDefined();
    });
  });

  describe('API Monitoring', () => {
    it('should configure API monitoring', () => {
      // Arrange
      const monitoringConfig = {
        enabled: true,
        metrics: [
          'request_count',
          'response_time',
          'error_rate',
          'status_codes',
        ],
        endpoints: ['*'], // Monitor all endpoints
        interval: 60000, // 1 minute
        retention: 7, // days
        alerts: {
          error_rate: { threshold: 0.05, severity: 'warning' },
          response_time: { threshold: 5000, severity: 'critical' },
        },
      };

      // Act
      const monitoring = repositoryAPI.configureAPIMonitoring(monitoringConfig);

      // Assert
      expect(monitoring).toBeDefined();
      expect(monitoring.enabled).toBe(true);
      expect(monitoring.metrics).toEqual(['request_count', 'response_time', 'error_rate', 'status_codes']);
      expect(monitoring.interval).toBe(60000);
    });

    it('should collect API metrics', async () => {
      // Arrange
      const metricsConfig = {
        endpoint: '/users',
        method: 'GET',
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
        granularity: 'hourly',
      };

      // Act
      const metrics = await repositoryAPI.collectAPIMetrics(metricsConfig);

      // Assert
      expect(metrics).toBeDefined();
      expect(metrics.endpoint).toBe('/users');
      expect(metrics.method).toBe('GET');
      expect(metrics.granularity).toBe('hourly');
      expect(metrics.data).toBeDefined();
    });

    it('should generate API health report', async () => {
      // Arrange
      const healthConfig = {
        endpoints: ['*'],
        timeRange: {
          start: new Date('2023-01-15T00:00:00Z'),
          end: new Date('2023-01-15T23:59:59Z'),
        },
        includeTrends: true,
        includeAlerts: true,
      };

      // Act
      const health = await repositoryAPI.generateAPIHealthReport(healthConfig);

      // Assert
      expect(health).toBeDefined();
      expect(health.endpoints).toEqual(['*']);
      expect(health.includeTrends).toBe(true);
      expect(health.includeAlerts).toBe(true);
      expect(health.summary).toBeDefined();
      expect(health.details).toBeDefined();
    });
  });
});
