/**
 * RepositoryDocumentation Tests
 * 
 * Comprehensive test suite for RepositoryDocumentation functionality including
 * API documentation, code documentation, schema documentation, and documentation generation.
 */

import { RepositoryDocumentation } from '../repositories/RepositoryDocumentation';
import { Logger } from '../logging/Logger';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

describe('RepositoryDocumentation', () => {
  let repositoryDocumentation: RepositoryDocumentation;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryDocumentation = new RepositoryDocumentation(mockLogger);
  });

  describe('API Documentation', () => {
    it('should generate API documentation for repository methods', () => {
      // Arrange
      const repositoryMethods = [
        {
          name: 'findById',
          description: 'Find a user by their ID',
          parameters: [
            { name: 'id', type: 'number', required: true, description: 'The user ID' },
            { name: 'options', type: 'object', required: false, description: 'Query options' },
          ],
          returns: { type: 'Promise<User>', description: 'The user object' },
          examples: [
            { code: 'await userRepository.findById(123)', description: 'Find user with ID 123' },
          ],
          errors: [
            { type: 'NotFoundError', description: 'User not found' },
            { type: 'ValidationError', description: 'Invalid ID format' },
          ],
        },
        {
          name: 'create',
          description: 'Create a new user',
          parameters: [
            { name: 'userData', type: 'UserCreateData', required: true, description: 'User data to create' },
          ],
          returns: { type: 'Promise<User>', description: 'The created user object' },
          examples: [
            { code: 'await userRepository.create({ name: "John", email: "john@example.com" })', description: 'Create a new user' },
          ],
          errors: [
            { type: 'ValidationError', description: 'Invalid user data' },
            { type: 'DuplicateError', description: 'User already exists' },
          ],
        },
      ];

      // Act
      const documentation = repositoryDocumentation.generateAPIDocumentation(repositoryMethods);

      // Assert
      expect(documentation).toBeDefined();
      expect(documentation.title).toBe('Repository API Documentation');
      expect(documentation.methods).toHaveLength(2);
      expect(documentation.methods[0].name).toBe('findById');
      expect(documentation.methods[0].parameters).toHaveLength(2);
      expect(documentation.methods[0].examples).toHaveLength(1);
      expect(documentation.methods[0].errors).toHaveLength(2);
    });

    it('should generate OpenAPI specification', () => {
      // Arrange
      const apiSpec = {
        info: {
          title: 'User Repository API',
          version: '1.0.0',
          description: 'API documentation for User Repository',
        },
        paths: {
          '/users/{id}': {
            get: {
              summary: 'Get user by ID',
              description: 'Retrieve a user by their unique identifier',
              parameters: [
                {
                  name: 'id',
                  in: 'path',
                  required: true,
                  schema: { type: 'integer' },
                  description: 'User ID',
                },
              ],
              responses: {
                200: {
                  description: 'User found',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
                404: {
                  description: 'User not found',
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
                id: { type: 'integer', description: 'User ID' },
                name: { type: 'string', description: 'User name' },
                email: { type: 'string', format: 'email', description: 'User email' },
              },
            },
          },
        },
      };

      // Act
      const openAPIDoc = repositoryDocumentation.generateOpenAPISpec(apiSpec);

      // Assert
      expect(openAPIDoc).toBeDefined();
      expect(openAPIDoc.openapi).toBe('3.0.0');
      expect(openAPIDoc.info.title).toBe('User Repository API');
      expect(openAPIDoc.paths).toBeDefined();
      expect(openAPIDoc.paths['/users/{id}']).toBeDefined();
      expect(openAPIDoc.components).toBeDefined();
      expect(openAPIDoc.components.schemas).toBeDefined();
    });

    it('should generate REST API documentation', () => {
      // Arrange
      const restEndpoints = [
        {
          path: '/users',
          method: 'GET',
          summary: 'List all users',
          description: 'Retrieve a paginated list of users',
          parameters: [
            { name: 'page', type: 'query', required: false, description: 'Page number' },
            { name: 'limit', type: 'query', required: false, description: 'Items per page' },
            { name: 'filter', type: 'query', required: false, description: 'Filter criteria' },
          ],
          responses: {
            200: {
              description: 'List of users',
              schema: {
                type: 'object',
                properties: {
                  data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                  pagination: { $ref: '#/components/schemas/Pagination' },
                },
              },
            },
          },
        },
        {
          path: '/users/{id}',
          method: 'GET',
          summary: 'Get user by ID',
          description: 'Retrieve a specific user by their ID',
          parameters: [
            { name: 'id', type: 'path', required: true, description: 'User ID' },
          ],
          responses: {
            200: {
              description: 'User details',
              schema: { $ref: '#/components/schemas/User' },
            },
            404: {
              description: 'User not found',
            },
          },
        },
      ];

      // Act
      const restDoc = repositoryDocumentation.generateRESTAPIDocumentation(restEndpoints);

      // Assert
      expect(restDoc).toBeDefined();
      expect(restDoc.endpoints).toHaveLength(2);
      expect(restDoc.endpoints[0].path).toBe('/users');
      expect(restDoc.endpoints[0].method).toBe('GET');
      expect(restDoc.endpoints[0].parameters).toHaveLength(3);
      expect(restDoc.endpoints[1].path).toBe('/users/{id}');
    });

    it('should generate GraphQL documentation', () => {
      // Arrange
      const graphqlSchema = {
        types: [
          {
            name: 'User',
            kind: 'OBJECT',
            description: 'User entity',
            fields: [
              {
                name: 'id',
                type: 'ID!',
                description: 'User identifier',
              },
              {
                name: 'name',
                type: 'String!',
                description: 'User name',
              },
              {
                name: 'email',
                type: 'String!',
                description: 'User email',
              },
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
                  { name: 'id', type: 'ID!', description: 'User ID' },
                ],
                description: 'Get user by ID',
              },
              {
                name: 'users',
                type: '[User!]!',
                args: [
                  { name: 'limit', type: 'Int', description: 'Limit results' },
                ],
                description: 'Get list of users',
              },
            ],
          },
        ],
      };

      // Act
      const graphqlDoc = repositoryDocumentation.generateGraphQLDocumentation(graphqlSchema);

      // Assert
      expect(graphqlDoc).toBeDefined();
      expect(graphqlDoc.schema).toBeDefined();
      expect(graphqlDoc.schema.types).toHaveLength(2);
      expect(graphqlDoc.schema.types[0].name).toBe('User');
      expect(graphqlDoc.schema.types[0].fields).toHaveLength(3);
      expect(graphqlDoc.queries).toBeDefined();
      expect(graphqlDoc.queries).toHaveLength(2);
    });
  });

  describe('Code Documentation', () => {
    it('should generate inline code documentation', () => {
      // Arrange
      const codeStructure = {
        className: 'UserRepository',
        description: 'Repository for managing user entities',
        methods: [
          {
            name: 'findById',
            signature: 'async findById(id: number, options?: FindOptions): Promise<User>',
            description: 'Find a user by their ID',
            parameters: [
              { name: 'id', type: 'number', description: 'The user ID to search for' },
              { name: 'options', type: 'FindOptions', description: 'Optional query options' },
            ],
            returns: 'Promise<User>',
            examples: [
              'const user = await userRepository.findById(123);',
              'const user = await userRepository.findById(123, { include: ['profile'] });',
            ],
            throws: ['NotFoundError', 'ValidationError'],
            since: '1.0.0',
          },
          {
            name: 'create',
            signature: 'async create(userData: UserCreateData): Promise<User>',
            description: 'Create a new user with the provided data',
            parameters: [
              { name: 'userData', type: 'UserCreateData', description: 'The user data to create' },
            ],
            returns: 'Promise<User>',
            examples: [
              'const user = await userRepository.create({ name: "John", email: "john@example.com" });',
            ],
            throws: ['ValidationError', 'DuplicateError'],
            since: '1.0.0',
          },
        ],
      };

      // Act
      const codeDoc = repositoryDocumentation.generateCodeDocumentation(codeStructure);

      // Assert
      expect(codeDoc).toBeDefined();
      expect(codeDoc.className).toBe('UserRepository');
      expect(codeDoc.description).toBe('Repository for managing user entities');
      expect(codeDoc.methods).toHaveLength(2);
      expect(codeDoc.methods[0].name).toBe('findById');
      expect(codeDoc.methods[0].parameters).toHaveLength(2);
      expect(codeDoc.methods[0].examples).toHaveLength(2);
    });

    it('should generate TypeScript documentation', () => {
      // Arrange
      const typescriptTypes = [
        {
          name: 'User',
          kind: 'interface',
          description: 'User entity interface',
          properties: [
            { name: 'id', type: 'number', description: 'Unique identifier', optional: false },
            { name: 'name', type: 'string', description: 'User name', optional: false },
            { name: 'email', type: 'string', description: 'User email', optional: false },
            { name: 'createdAt', type: 'Date', description: 'Creation timestamp', optional: true },
          ],
        },
        {
          name: 'UserCreateData',
          kind: 'type',
          description: 'Data for creating a new user',
          properties: [
            { name: 'name', type: 'string', description: 'User name', optional: false },
            { name: 'email', type: 'string', description: 'User email', optional: false },
            { name: 'password', type: 'string', description: 'User password', optional: false },
          ],
        },
      ];

      // Act
      const tsDoc = repositoryDocumentation.generateTypeScriptDocumentation(typescriptTypes);

      // Assert
      expect(tsDoc).toBeDefined();
      expect(tsDoc.types).toHaveLength(2);
      expect(tsDoc.types[0].name).toBe('User');
      expect(tsDoc.types[0].kind).toBe('interface');
      expect(tsDoc.types[0].properties).toHaveLength(4);
      expect(tsDoc.types[1].name).toBe('UserCreateData');
      expect(tsDoc.types[1].kind).toBe('type');
    });

    it('should generate JSDoc documentation', () => {
      // Arrange
      const jsDocConfig = {
        format: 'jsdoc',
        includeExamples: true,
        includeTypes: true,
        includeReturns: true,
        includeThrows: true,
      };

      const method = {
        name: 'findById',
        signature: 'findById(id, options)',
        description: 'Find a user by their ID',
        parameters: [
          { name: 'id', type: 'number', description: 'The user ID' },
          { name: 'options', type: 'object', description: 'Query options' },
        ],
        returns: { type: 'Promise<User>', description: 'The user object' },
        examples: ['await findById(123)'],
        throws: ['NotFoundError'],
      };

      // Act
      const jsDoc = repositoryDocumentation.generateJSDoc(method, jsDocConfig);

      // Assert
      expect(jsDoc).toBeDefined();
      expect(jsDoc).toContain('/**');
      expect(jsDoc).toContain('* Find a user by their ID');
      expect(jsDoc).toContain('* @param {number} id - The user ID');
      expect(jsDoc).toContain('* @param {object} options - Query options');
      expect(jsDoc).toContain('* @returns {Promise<User>} The user object');
      expect(jsDoc).toContain('* @example await findById(123)');
      expect(jsDoc).toContain('* @throws {NotFoundError}');
    });
  });

  describe('Schema Documentation', () => {
    it('should generate database schema documentation', () => {
      // Arrange
      const databaseSchema = {
        tables: [
          {
            name: 'users',
            description: 'User accounts table',
            columns: [
              { name: 'id', type: 'INTEGER', nullable: false, description: 'Primary key' },
              { name: 'name', type: 'VARCHAR(255)', nullable: false, description: 'User full name' },
              { name: 'email', type: 'VARCHAR(255)', nullable: false, unique: true, description: 'User email address' },
              { name: 'password_hash', type: 'VARCHAR(255)', nullable: false, description: 'Hashed password' },
              { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Creation timestamp' },
              { name: 'updated_at', type: 'TIMESTAMP', nullable: true, description: 'Last update timestamp' },
            ],
            indexes: [
              { name: 'users_email_idx', columns: ['email'], unique: true, description: 'Unique email index' },
              { name: 'users_created_at_idx', columns: ['created_at'], description: 'Creation date index' },
            ],
            foreignKeys: [],
          },
          {
            name: 'user_profiles',
            description: 'User profile information',
            columns: [
              { name: 'user_id', type: 'INTEGER', nullable: false, description: 'Reference to users.id' },
              { name: 'bio', type: 'TEXT', nullable: true, description: 'User biography' },
              { name: 'avatar_url', type: 'VARCHAR(500)', nullable: true, description: 'Avatar image URL' },
              { name: 'preferences', type: 'JSON', nullable: true, description: 'User preferences' },
            ],
            indexes: [
              { name: 'user_profiles_user_id_idx', columns: ['user_id'], description: 'User reference index' },
            ],
            foreignKeys: [
              {
                name: 'user_profiles_user_id_fkey',
                column: 'user_id',
                references: { table: 'users', column: 'id' },
                description: 'Reference to users table',
              },
            ],
          },
        ],
      };

      // Act
      const schemaDoc = repositoryDocumentation.generateDatabaseSchemaDocumentation(databaseSchema);

      // Assert
      expect(schemaDoc).toBeDefined();
      expect(schemaDoc.tables).toHaveLength(2);
      expect(schemaDoc.tables[0].name).toBe('users');
      expect(schemaDoc.tables[0].columns).toHaveLength(6);
      expect(schemaDoc.tables[0].indexes).toHaveLength(2);
      expect(schemaDoc.tables[1].foreignKeys).toHaveLength(1);
    });

    it('should generate entity relationship documentation', () => {
      // Arrange
      const relationships = [
        {
          from: 'User',
          to: 'Profile',
          type: 'one-to-one',
          description: 'Each user has one profile',
          foreignKey: 'user_id',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        {
          from: 'User',
          to: 'Order',
          type: 'one-to-many',
          description: 'Each user can have multiple orders',
          foreignKey: 'user_id',
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        },
        {
          from: 'Order',
          to: 'Product',
          type: 'many-to-many',
          through: 'OrderItem',
          description: 'Orders can contain multiple products',
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        },
      ];

      // Act
      const relationshipDoc = repositoryDocumentation.generateRelationshipDocumentation(relationships);

      // Assert
      expect(relationshipDoc).toBeDefined();
      expect(relationshipDoc.relationships).toHaveLength(3);
      expect(relationshipDoc.relationships[0].from).toBe('User');
      expect(relationshipDoc.relationships[0].to).toBe('Profile');
      expect(relationshipDoc.relationships[0].type).toBe('one-to-one');
      expect(relationshipDiagrams).toBeDefined();
    });

    it('should generate migration documentation', () => {
      // Arrange
      const migrations = [
        {
          version: '001_create_users',
          description: 'Create users table',
          timestamp: new Date('2023-01-15T10:00:00Z'),
          changes: [
            { type: 'create_table', name: 'users', columns: ['id', 'name', 'email', 'password_hash'] },
            { type: 'create_index', name: 'users_email_idx', table: 'users', columns: ['email'] },
          ],
        },
        {
          version: '002_add_user_profiles',
          description: 'Add user profiles table',
          timestamp: new Date('2023-01-16T14:30:00Z'),
          changes: [
            { type: 'create_table', name: 'user_profiles', columns: ['user_id', 'bio', 'avatar_url'] },
            { type: 'add_foreign_key', table: 'user_profiles', column: 'user_id', references: 'users.id' },
          ],
        },
        {
          version: '003_add_user_preferences',
          description: 'Add preferences column to user profiles',
          timestamp: new Date('2023-01-17T09:15:00Z'),
          changes: [
            { type: 'add_column', table: 'user_profiles', column: 'preferences', type: 'JSON' },
          ],
        },
      ];

      // Act
      const migrationDoc = repositoryDocumentation.generateMigrationDocumentation(migrations);

      // Assert
      expect(migrationDoc).toBeDefined();
      expect(migrationDoc.migrations).toHaveLength(3);
      expect(migrationDoc.migrations[0].version).toBe('001_create_users');
      expect(migrationDoc.migrations[0].changes).toHaveLength(2);
      expect(migrationDoc.timeline).toBeDefined();
      expect(migrationDoc.statistics).toBeDefined();
    });
  });

  describe('Documentation Generation', () => {
    it('should generate comprehensive repository documentation', () => {
      // Arrange
      const repositoryInfo = {
        name: 'UserRepository',
        description: 'Repository for managing user entities and related operations',
        version: '1.0.0',
        author: 'Development Team',
        license: 'MIT',
      };

      const documentationConfig = {
        includeAPIDoc: true,
        includeCodeDoc: true,
        includeSchemaDoc: true,
        includeExamples: true,
        includeChangelog: true,
        format: 'markdown',
      };

      // Act
      const comprehensiveDoc = repositoryDocumentation.generateComprehensiveDocumentation(
        repositoryInfo,
        documentationConfig
      );

      // Assert
      expect(comprehensiveDoc).toBeDefined();
      expect(comprehensiveDoc.title).toBe('UserRepository Documentation');
      expect(comprehensiveDoc.sections).toBeDefined();
      expect(comprehensiveDoc.sections.api).toBeDefined();
      expect(comprehensiveDoc.sections.code).toBeDefined();
      expect(comprehensiveDoc.sections.schema).toBeDefined();
      expect(comprehensiveDoc.sections.examples).toBeDefined();
      expect(comprehensiveDoc.sections.changelog).toBeDefined();
    });

    it('should generate documentation in different formats', () => {
      // Arrange
      const content = {
        title: 'User Repository API',
        description: 'API documentation for user repository',
        methods: [
          {
            name: 'findById',
            description: 'Find user by ID',
            parameters: [{ name: 'id', type: 'number', description: 'User ID' }],
          },
        ],
      };

      // Act
      const markdownDoc = repositoryDocumentation.generateDocumentation(content, 'markdown');
      const htmlDoc = repositoryDocumentation.generateDocumentation(content, 'html');
      const jsonDoc = repositoryDocumentation.generateDocumentation(content, 'json');

      // Assert
      expect(markdownDoc).toBeDefined();
      expect(markdownDoc).toContain('# User Repository API');
      expect(markdownDoc).toContain('## findById');

      expect(htmlDoc).toBeDefined();
      expect(htmlDoc).toContain('<h1>User Repository API</h1>');
      expect(htmlDoc).toContain('<h2>findById</h2>');

      expect(jsonDoc).toBeDefined();
      const jsonParsed = JSON.parse(jsonDoc);
      expect(jsonParsed.title).toBe('User Repository API');
      expect(jsonParsed.methods).toHaveLength(1);
    });

    it('should generate documentation with examples', () => {
      // Arrange
      const examples = [
        {
          title: 'Basic Usage',
          description: 'Simple examples of using the repository',
          code: [
            {
              language: 'typescript',
              description: 'Find a user by ID',
              code: 'const user = await userRepository.findById(123);',
            },
            {
              language: 'typescript',
              description: 'Create a new user',
              code: 'const user = await userRepository.create({ name: "John", email: "john@example.com" });',
            },
          ],
        },
        {
          title: 'Advanced Usage',
          description: 'More complex examples',
          code: [
            {
              language: 'typescript',
              description: 'Find users with filters',
              code: 'const users = await userRepository.findAll({ where: { status: "active" } });',
            },
          ],
        },
      ];

      // Act
      const examplesDoc = repositoryDocumentation.generateExamplesDocumentation(examples);

      // Assert
      expect(examplesDoc).toBeDefined();
      expect(examplesDoc.examples).toHaveLength(2);
      expect(examplesDoc.examples[0].title).toBe('Basic Usage');
      expect(examplesDoc.examples[0].code).toHaveLength(2);
      expect(examplesDoc.examples[0].code[0].language).toBe('typescript');
    });

    it('should generate changelog documentation', () => {
      // Arrange
      const changelog = [
        {
          version: '1.2.0',
          date: '2023-01-20',
          changes: [
            { type: 'added', description: 'Added user preferences support' },
            { type: 'changed', description: 'Improved error handling' },
            { type: 'fixed', description: 'Fixed bug in user search' },
          ],
        },
        {
          version: '1.1.0',
          date: '2023-01-15',
          changes: [
            { type: 'added', description: 'Added user profile management' },
            { type: 'changed', description: 'Updated database schema' },
          ],
        },
        {
          version: '1.0.0',
          date: '2023-01-10',
          changes: [
            { type: 'added', description: 'Initial release' },
            { type: 'added', description: 'Basic CRUD operations' },
          ],
        },
      ];

      // Act
      const changelogDoc = repositoryDocumentation.generateChangelog(changelog);

      // Assert
      expect(changelogDoc).toBeDefined();
      expect(changelogDoc.versions).toHaveLength(3);
      expect(changelogDoc.versions[0].version).toBe('1.2.0');
      expect(changelogDoc.versions[0].changes).toHaveLength(3);
      expect(changelogDoc.versions[0].changes[0].type).toBe('added');
    });
  });

  describe('Documentation Validation', () => {
    it('should validate documentation completeness', () => {
      // Arrange
      const documentation = {
        api: {
          methods: [
            { name: 'findById', description: 'Find user by ID', parameters: [], returns: 'User' },
            { name: 'create', description: 'Create user', parameters: [], returns: 'User' },
          ],
        },
        schema: {
          tables: [
            { name: 'users', columns: [{ name: 'id', type: 'INTEGER' }] },
          ],
        },
        examples: [
          { title: 'Basic Usage', code: 'await userRepository.findById(123)' },
        ],
      };

      const validationRules = {
        requireMethodDescriptions: true,
        requireParameterDescriptions: true,
        requireReturnDescriptions: true,
        requireExamples: true,
        requireSchemaDescriptions: true,
      };

      // Act
      const validation = repositoryDocumentation.validateDocumentation(documentation, validationRules);

      // Assert
      expect(validation).toBeDefined();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Method findById missing parameter descriptions');
      expect(validation.errors).toContain('Method create missing parameter descriptions');
      expect(validation.warnings).toBeDefined();
    });

    it('should check for documentation consistency', () => {
      // Arrange
      const documentation = {
        api: {
          methods: [
            { name: 'findById', parameters: [{ name: 'id', type: 'number' }] },
            { name: 'create', parameters: [{ name: 'userData', type: 'UserCreateData' }] },
          ],
        },
        types: {
          User: { properties: [{ name: 'id', type: 'number' }] },
          UserCreateData: { properties: [{ name: 'name', type: 'string' }] },
        },
      };

      // Act
      const consistencyCheck = repositoryDocumentation.checkDocumentationConsistency(documentation);

      // Assert
      expect(consistencyCheck).toBeDefined();
      expect(consistencyCheck.isConsistent).toBe(true);
      expect(consistencyCheck.inconsistencies).toHaveLength(0);
    });

    it('should identify missing documentation', () => {
      // Arrange
      const repositoryStructure = {
        methods: ['findById', 'create', 'update', 'delete', 'findAll'],
        types: ['User', 'UserCreateData', 'UserUpdateData'],
        tables: ['users', 'user_profiles'],
      };

      const existingDocumentation = {
        api: {
          methods: [
            { name: 'findById', description: 'Find user by ID' },
            { name: 'create', description: 'Create user' },
          ],
        },
        types: {
          User: { description: 'User entity' },
        },
        schema: {
          tables: [
            { name: 'users', description: 'User table' },
          ],
        },
      };

      // Act
      const missingDoc = repositoryDocumentation.identifyMissingDocumentation(
        repositoryStructure,
        existingDocumentation
      );

      // Assert
      expect(missingDoc).toBeDefined();
      expect(missingDoc.missingMethods).toEqual(['update', 'delete', 'findAll']);
      expect(missingDoc.missingTypes).toEqual(['UserCreateData', 'UserUpdateData']);
      expect(missingDoc.missingTables).toEqual(['user_profiles']);
    });
  });

  describe('Documentation Publishing', () => {
    it('should publish documentation to different platforms', async () => {
      // Arrange
      const documentation = {
        title: 'User Repository Documentation',
        content: '# User Repository Documentation\n\n## API\n\n### findById\n\nFind user by ID',
        format: 'markdown',
      };

      const publishingConfig = {
        platforms: ['github', 'confluence', 'website'],
        github: {
          repository: 'user-repository-docs',
          branch: 'gh-pages',
          path: 'docs',
        },
        confluence: {
          space: 'DEV',
          pageId: '123456',
        },
        website: {
          url: 'https://docs.example.com',
          apiKey: 'api-key-123',
        },
      };

      // Act
      const publishingResults = await repositoryDocumentation.publishDocumentation(
        documentation,
        publishingConfig
      );

      // Assert
      expect(publishingResults).toBeDefined();
      expect(publishingResults.results).toHaveLength(3);
      expect(publishingResults.results[0].platform).toBe('github');
      expect(publishingResults.results[0].published).toBe(true);
      expect(publishingResults.results[1].platform).toBe('confluence');
      expect(publishingResults.results[2].platform).toBe('website');
    });

    it('should schedule documentation updates', () => {
      // Arrange
      const scheduleConfig = {
        frequency: 'daily',
        time: '02:00',
        timezone: 'UTC',
        autoGenerate: true,
        autoPublish: true,
        platforms: ['github', 'confluence'],
      };

      // Act
      const schedule = repositoryDocumentation.scheduleDocumentationUpdates(scheduleConfig);

      // Assert
      expect(schedule).toBeDefined();
      expect(schedule.frequency).toBe('daily');
      expect(schedule.time).toBe('02:00');
      expect(schedule.nextRun).toBeDefined();
      expect(schedule.enabled).toBe(true);
    });

    it('should version documentation', () => {
      // Arrange
      const versioningConfig = {
        strategy: 'semantic',
        autoIncrement: true,
        keepHistory: true,
        maxVersions: 10,
      };

      const currentVersion = '1.2.0';
      const changes = [
        { type: 'added', description: 'New feature added' },
        { type: 'fixed', description: 'Bug fix' },
      ];

      // Act
      const versioning = repositoryDocumentation.versionDocumentation(
        currentVersion,
        changes,
        versioningConfig
      );

      // Assert
      expect(versioning).toBeDefined();
      expect(versioning.newVersion).toBe('1.2.1');
      expect(versioning.previousVersion).toBe('1.2.0');
      expect(versioning.changes).toEqual(changes);
      expect(versioning.timestamp).toBeDefined();
    });
  });

  describe('Documentation Analytics', () => {
    it('should track documentation usage', () => {
      // Arrange
      const usageData = [
        { page: 'api/findById', views: 150, uniqueVisitors: 120, averageTime: 45 },
        { page: 'api/create', views: 100, uniqueVisitors: 85, averageTime: 60 },
        { page: 'schema/users', views: 80, uniqueVisitors: 70, averageTime: 30 },
        { page: 'examples/basic', views: 200, uniqueVisitors: 180, averageTime: 90 },
      ];

      // Act
      const analytics = repositoryDocumentation.analyzeDocumentationUsage(usageData);

      // Assert
      expect(analytics).toBeDefined();
      expect(analytics.totalViews).toBe(530);
      expect(analytics.totalUniqueVisitors).toBe(455);
      expect(analytics.averageTime).toBe(56.25);
      expect(analytics.mostViewed).toBe('examples/basic');
      expect(analytics.leastViewed).toBe('schema/users');
    });

    it('should generate documentation metrics', () => {
      // Arrange
      const documentationMetrics = {
        totalPages: 50,
        totalWords: 25000,
        totalExamples: 100,
        totalDiagrams: 15,
        lastUpdated: new Date('2023-01-15'),
        contributions: [
          { author: 'John Doe', commits: 10, pages: 15 },
          { author: 'Jane Smith', commits: 8, pages: 12 },
        ],
      };

      // Act
      const metrics = repositoryDocumentation.generateDocumentationMetrics(documentationMetrics);

      // Assert
      expect(metrics).toBeDefined();
      expect(metrics.completeness).toBeGreaterThan(0);
      expect(metrics.quality).toBeGreaterThan(0);
      expect(metrics.maintainability).toBeGreaterThan(0);
      expect(metrics.contributors).toHaveLength(2);
      expect(metrics.contributors[0].author).toBe('John Doe');
    });

    it('should identify documentation gaps', () => {
      // Arrange
      const coverageData = {
        api: { documented: 8, total: 10, coverage: 0.8 },
        schema: { documented: 5, total: 7, coverage: 0.714 },
        examples: { documented: 12, total: 20, coverage: 0.6 },
        types: { documented: 15, total: 15, coverage: 1.0 },
      };

      // Act
      const gaps = repositoryDocumentation.identifyDocumentationGaps(coverageData);

      // Assert
      expect(gaps).toBeDefined();
      expect(gaps.overallCoverage).toBe(0.7785);
      expect(gaps.priorityGaps).toContain('examples');
      expect(gaps.recommendations).toBeDefined();
      expect(gaps.recommendations).toContain('Focus on adding more examples');
    });
  });

  describe('Documentation Configuration', () => {
    it('should configure documentation settings', () => {
      // Arrange
      const settings = {
        autoGenerate: true,
        autoPublish: true,
        includeExamples: true,
        includeDiagrams: true,
        format: 'markdown',
        theme: 'default',
        language: 'en',
      };

      // Act
      repositoryDocumentation.configureSettings(settings);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('documentation_settings_configured', expect.objectContaining({
        settings,
      }));
    });

    it('should configure documentation templates', () => {
      // Arrange
      const templates = {
        api: {
          template: 'api_template.md',
          sections: ['overview', 'methods', 'examples', 'errors'],
        },
        schema: {
          template: 'schema_template.md',
          sections: ['tables', 'relationships', 'indexes'],
        },
        examples: {
          template: 'examples_template.md',
          sections: ['basic', 'advanced', 'troubleshooting'],
        },
      };

      // Act
      repositoryDocumentation.configureTemplates(templates);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('documentation_templates_configured', expect.objectContaining({
        templatesCount: 3,
      }));
    });

    it('should configure documentation publishing', () => {
      // Arrange
      const publishing = {
        platforms: ['github', 'confluence'],
        autoPublish: true,
        schedule: 'daily',
        notifications: true,
        recipients: ['dev-team@example.com'],
      };

      // Act
      repositoryDocumentation.configurePublishing(publishing);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('documentation_publishing_configured', expect.objectContaining({
        platforms: ['github', 'confluence'],
        autoPublish: true,
      }));
    });
  });
});
