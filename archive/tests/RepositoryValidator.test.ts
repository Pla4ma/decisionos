/**
 * RepositoryValidator Tests
 * 
 * Comprehensive test suite for RepositoryValidator functionality including
 * entity validation, business rules, data integrity checks, and validation rules management.
 */

import { RepositoryValidator } from '../repositories/RepositoryValidator';
import { Logger } from '../logging/Logger';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

describe('RepositoryValidator', () => {
  let repositoryValidator: RepositoryValidator;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryValidator = new RepositoryValidator(mockLogger);
  });

  describe('Basic Entity Validation', () => {
    it('should validate required fields', () => {
      // Arrange
      const entity = {
        name: 'John Doe',
        email: 'john@example.com',
      };
      const rules = {
        name: { required: true, type: 'string' },
        email: { required: true, type: 'string', format: 'email' },
        age: { required: false, type: 'number', min: 0, max: 150 },
      };

      // Act
      const result = repositoryValidator.validate(entity, rules);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      // Arrange
      const entity = {
        name: 'John Doe',
        // email is missing
      };
      const rules = {
        name: { required: true, type: 'string' },
        email: { required: true, type: 'string', format: 'email' },
      };

      // Act
      const result = repositoryValidator.validate(entity, rules);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required');
    });

    it('should validate field types', () => {
      // Arrange
      const entity = {
        name: 'John Doe',
        age: 'twenty-five', // Should be number
        active: 'true', // Should be boolean
      };
      const rules = {
        name: { required: true, type: 'string' },
        age: { required: true, type: 'number' },
        active: { required: true, type: 'boolean' },
      };

      // Act
      const result = repositoryValidator.validate(entity, rules);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Age must be a number');
      expect(result.errors).toContain('Active must be a boolean');
    });

    it('should validate string formats', () => {
      // Arrange
      const entity = {
        email: 'invalid-email',
        phone: '123-456-7890',
        website: 'not-a-url',
      };
      const rules = {
        email: { required: true, type: 'string', format: 'email' },
        phone: { required: true, type: 'string', format: 'phone' },
        website: { required: true, type: 'string', format: 'url' },
      };

      // Act
      const result = repositoryValidator.validate(entity, rules);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email must be a valid email address');
      expect(result.errors).toContain('Website must be a valid URL');
    });

    it('should validate numeric constraints', () => {
      // Arrange
      const entity = {
        age: -5,
        score: 150,
        rating: 3.7,
      };
      const rules = {
        age: { required: true, type: 'number', min: 0, max: 120 },
        score: { required: true, type: 'number', min: 0, max: 100 },
        rating: { required: true, type: 'number', min: 1, max: 5 },
      };

      // Act
      const result = repositoryValidator.validate(entity, rules);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Age must be between 0 and 120');
      expect(result.errors).toContain('Score must be between 0 and 100');
    });

    it('should validate array constraints', () => {
      // Arrange
      const entity = {
        tags: ['tag1', 'tag2', 'tag3'],
        items: [],
        colors: ['red', 'green', 'blue', 'yellow'],
      };
      const rules = {
        tags: { required: true, type: 'array', minLength: 1, maxLength: 5 },
        items: { required: true, type: 'array', minLength: 1 },
        colors: { required: true, type: 'array', maxLength: 3 },
      };

      // Act
      const result = repositoryValidator.validate(entity, rules);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Items must have at least 1 item');
      expect(result.errors).toContain('Colors must have at most 3 items');
    });
  });

  describe('Business Rule Validation', () => {
    it('should validate unique constraints', async () => {
      // Arrange
      const entity = { email: 'john@example.com' };
      const rule = {
        field: 'email',
        unique: true,
        table: 'users',
        message: 'Email must be unique',
      };
      
      mockLogger.info = jest.fn();
      jest.spyOn(repositoryValidator as any, 'checkUniqueness').mockResolvedValue(false);

      // Act
      const result = await repositoryValidator.validateBusinessRule(entity, rule);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email must be unique');
    });

    it('should validate foreign key constraints', async () => {
      // Arrange
      const entity = { categoryId: 123 };
      const rule = {
        field: 'categoryId',
        foreignKey: true,
        referenceTable: 'categories',
        referenceField: 'id',
        message: 'Category must exist',
      };
      
      jest.spyOn(repositoryValidator as any, 'checkForeignKey').mockResolvedValue(false);

      // Act
      const result = await repositoryValidator.validateBusinessRule(entity, rule);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Category must exist');
    });

    it('should validate conditional rules', () => {
      // Arrange
      const entity = {
        type: 'premium',
        features: ['basic'], // Premium should have advanced features
      };
      const rules = {
        type: { required: true, type: 'string' },
        features: {
          required: true,
          type: 'array',
          conditional: {
            when: { field: 'type', value: 'premium' },
            then: { minLength: 1, contains: ['advanced'] },
            message: 'Premium users must have advanced features',
          },
        },
      };

      // Act
      const result = repositoryValidator.validate(entity, rules);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Premium users must have advanced features');
    });

    it('should validate cross-field dependencies', () => {
      // Arrange
      const entity = {
        startDate: '2023-01-15',
        endDate: '2023-01-10', // End before start
      };
      const rules = {
        startDate: { required: true, type: 'string', format: 'date' },
        endDate: {
          required: true,
          type: 'string',
          format: 'date',
          dependsOn: {
            field: 'startDate',
            validator: 'greaterThan',
            message: 'End date must be after start date',
          },
        },
      };

      // Act
      const result = repositoryValidator.validate(entity, rules);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('End date must be after start date');
    });

    it('should validate custom business rules', () => {
      // Arrange
      const entity = {
        password: 'weak',
        confirmPassword: 'different',
      };
      const rules = {
        password: {
          required: true,
          type: 'string',
          custom: {
            validator: (value: string) => value.length >= 8,
            message: 'Password must be at least 8 characters',
          },
        },
        confirmPassword: {
          required: true,
          type: 'string',
          custom: {
            validator: (value: string, entity: any) => value === entity.password,
            message: 'Passwords must match',
          },
        },
      };

      // Act
      const result = repositoryValidator.validate(entity, rules);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
      expect(result.errors).toContain('Passwords must match');
    });
  });

  describe('Data Integrity Validation', () => {
    it('should validate referential integrity', async () => {
      // Arrange
      const entity = { userId: 123, orderId: 456 };
      const integrityRules = [
        {
          field: 'userId',
          table: 'users',
          message: 'User must exist',
        },
        {
          field: 'orderId',
          table: 'orders',
          message: 'Order must exist',
        },
      ];
      
      jest.spyOn(repositoryValidator as any, 'checkRecordExists').mockImplementation((table: string, id: number) => {
        return Promise.resolve(table === 'users'); // Only user exists
      });

      // Act
      const result = await repositoryValidator.validateIntegrity(entity, integrityRules);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Order must exist');
    });

    it('should validate data consistency', () => {
      // Arrange
      const entity = {
        totalAmount: 100,
        items: [
          { price: 30, quantity: 2 }, // 60
          { price: 25, quantity: 1 }, // 25
        ],
        tax: 10,
        shipping: 5,
      };
      const consistencyRules = [
        {
          rule: 'total_calculation',
          validator: (entity: any) => {
            const itemsTotal = entity.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
            const expectedTotal = itemsTotal + entity.tax + entity.shipping;
            return entity.totalAmount === expectedTotal;
          },
          message: 'Total amount must match sum of items, tax, and shipping',
        },
      ];

      // Act
      const result = repositoryValidator.validateConsistency(entity, consistencyRules);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Total amount must match sum of items, tax, and shipping');
    });

    it('should validate data completeness', () => {
      // Arrange
      const entity = {
        name: 'John Doe',
        email: 'john@example.com',
        // Missing phone, address, dateOfBirth
      };
      const completenessRules = {
        requiredFields: ['name', 'email', 'phone', 'address', 'dateOfBirth'],
        completenessThreshold: 0.8, // 80% required
      };

      // Act
      const result = repositoryValidator.validateCompleteness(entity, completenessRules);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.completeness).toBe(0.4); // 2 out of 5 fields
      expect(result.errors).toContain('Data completeness (40%) is below threshold (80%)');
    });

    it('should validate data format consistency', () => {
      // Arrange
      const entity = {
        phoneNumbers: [
          '123-456-7890',
          '(123) 456-7890',
          '1234567890', // Inconsistent format
        ],
        dates: [
          '2023-01-15',
          '01/15/2023', // Inconsistent format
          '2023-01-20',
        ],
      };
      const formatRules = {
        phoneNumbers: { format: 'xxx-xxx-xxxx', consistency: true },
        dates: { format: 'YYYY-MM-DD', consistency: true },
      };

      // Act
      const result = repositoryValidator.validateFormatConsistency(entity, formatRules);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Phone numbers have inconsistent formats');
      expect(result.errors).toContain('Dates have inconsistent formats');
    });
  });

  describe('Validation Rules Management', () => {
    it('should add validation rules', () => {
      // Arrange
      const ruleName = 'user_validation';
      const rules = {
        name: { required: true, type: 'string', minLength: 2 },
        email: { required: true, type: 'string', format: 'email' },
        age: { required: false, type: 'number', min: 0, max: 120 },
      };

      // Act
      repositoryValidator.addRules(ruleName, rules);

      // Assert
      expect(repositoryValidator.hasRules(ruleName)).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('validation_rules_added', expect.objectContaining({
        ruleName,
        ruleCount: 3,
      }));
    });

    it('should remove validation rules', () => {
      // Arrange
      const ruleName = 'user_validation';
      const rules = { name: { required: true, type: 'string' } };
      repositoryValidator.addRules(ruleName, rules);

      // Act
      repositoryValidator.removeRules(ruleName);

      // Assert
      expect(repositoryValidator.hasRules(ruleName)).toBe(false);
      expect(mockLogger.info).toHaveBeenCalledWith('validation_rules_removed', expect.objectContaining({
        ruleName,
      }));
    });

    it('should update validation rules', () => {
      // Arrange
      const ruleName = 'user_validation';
      const initialRules = { name: { required: true, type: 'string' } };
      const updatedRules = {
        name: { required: true, type: 'string', minLength: 2 },
        email: { required: true, type: 'string', format: 'email' },
      };
      repositoryValidator.addRules(ruleName, initialRules);

      // Act
      repositoryValidator.updateRules(ruleName, updatedRules);

      // Assert
      expect(repositoryValidator.hasRules(ruleName)).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('validation_rules_updated', expect.objectContaining({
        ruleName,
        ruleCount: 2,
      }));
    });

    it('should get validation rules', () => {
      // Arrange
      const ruleName = 'user_validation';
      const rules = { name: { required: true, type: 'string' } };
      repositoryValidator.addRules(ruleName, rules);

      // Act
      const retrievedRules = repositoryValidator.getRules(ruleName);

      // Assert
      expect(retrievedRules).toEqual(rules);
    });

    it('should list all validation rule sets', () => {
      // Arrange
      repositoryValidator.addRules('user_validation', { name: { required: true } });
      repositoryValidator.addRules('product_validation', { title: { required: true } });
      repositoryValidator.addRules('order_validation', { total: { required: true } });

      // Act
      const ruleSets = repositoryValidator.listRuleSets();

      // Assert
      expect(ruleSets).toContain('user_validation');
      expect(ruleSets).toContain('product_validation');
      expect(ruleSets).toContain('order_validation');
      expect(ruleSets).toHaveLength(3);
    });
  });

  describe('Advanced Validation Features', () => {
    it('should support validation groups', () => {
      // Arrange
      const entity = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak',
        confirmPassword: 'weak',
      };
      const rules = {
        basic: {
          name: { required: true, type: 'string' },
          email: { required: true, type: 'string', format: 'email' },
        },
        security: {
          password: { required: true, type: 'string', minLength: 8 },
          confirmPassword: { required: true, type: 'string', sameAs: 'password' },
        },
      };

      // Act
      const basicResult = repositoryValidator.validateGroup(entity, rules, 'basic');
      const securityResult = repositoryValidator.validateGroup(entity, rules, 'security');

      // Assert
      expect(basicResult.isValid).toBe(true);
      expect(securityResult.isValid).toBe(false);
      expect(securityResult.errors).toContain('Password must be at least 8 characters');
    });

    it('should support conditional validation', () => {
      // Arrange
      const entity = {
        type: 'business',
        companyName: 'ACME Corp',
        firstName: undefined,
        lastName: undefined,
      };
      const rules = {
        type: { required: true, type: 'string' },
        companyName: {
          required: true,
          type: 'string',
          when: { field: 'type', equals: 'business' },
        },
        firstName: {
          required: true,
          type: 'string',
          when: { field: 'type', equals: 'individual' },
        },
        lastName: {
          required: true,
          type: 'string',
          when: { field: 'type', equals: 'individual' },
        },
      };

      // Act
      const result = repositoryValidator.validate(entity, rules);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it('should support async validation', async () => {
      // Arrange
      const entity = { email: 'john@example.com' };
      const rules = {
        email: {
          required: true,
          type: 'string',
          format: 'email',
          async: {
            validator: async (value: string) => {
              // Simulate API call to check if email is already registered
              return value !== 'existing@example.com';
            },
            message: 'Email is already registered',
          },
        },
      };

      // Act
      const result = await repositoryValidator.validateAsync(entity, rules);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it('should support validation chaining', () => {
      // Arrange
      const entity = { username: 'john_doe_123' };
      const rules = {
        username: {
          required: true,
          type: 'string',
          chain: [
            { validator: 'minLength', value: 3 },
            { validator: 'maxLength', value: 20 },
            { validator: 'pattern', value: /^[a-zA-Z0-9_]+$/ },
            { validator: 'notIn', value: ['admin', 'root', 'system'] },
          ],
        },
      };

      // Act
      const result = repositoryValidator.validate(entity, rules);

      // Assert
      expect(result.isValid).toBe(true);
    });
  });

  describe('Error Handling and Reporting', () => {
    it('should provide detailed validation errors', () => {
      // Arrange
      const entity = {
        name: '',
        age: -5,
        email: 'invalid-email',
      };
      const rules = {
        name: { required: true, type: 'string', minLength: 2 },
        age: { required: true, type: 'number', min: 0, max: 120 },
        email: { required: true, type: 'string', format: 'email' },
      };

      // Act
      const result = repositoryValidator.validate(entity, rules);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.fieldErrors).toBeDefined();
      expect(result.fieldErrors.name).toContain('Name must be at least 2 characters');
      expect(result.fieldErrors.age).toContain('Age must be between 0 and 120');
      expect(result.fieldErrors.email).toContain('Email must be a valid email address');
    });

    it('should handle validation rule errors gracefully', () => {
      // Arrange
      const entity = { name: 'John' };
      const rules = {
        name: {
          required: true,
          type: 'string',
          custom: {
            validator: () => {
              throw new Error('Validation rule error');
            },
            message: 'Custom validation failed',
          },
        },
      };

      // Act
      const result = repositoryValidator.validate(entity, rules);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Custom validation failed');
      expect(mockLogger.error).toHaveBeenCalledWith('validation_rule_error', expect.objectContaining({
        field: 'name',
        error: 'Validation rule error',
      }));
    });

    it('should provide validation suggestions', () => {
      // Arrange
      const entity = {
        name: 'j', // Too short
        email: 'john@example', // Incomplete email
        age: 150, // Too high
      };
      const rules = {
        name: { required: true, type: 'string', minLength: 2 },
        email: { required: true, type: 'string', format: 'email' },
        age: { required: true, type: 'number', max: 120 },
      };

      // Act
      const result = repositoryValidator.validateWithSuggestions(entity, rules);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions.name).toContain('Consider using a longer name (minimum 2 characters)');
      expect(result.suggestions.email).toContain('Please provide a complete email address');
      expect(result.suggestions.age).toContain('Age should be realistic (maximum 120)');
    });
  });

  describe('Performance and Optimization', () => {
    it('should cache validation results', () => {
      // Arrange
      const entity = { name: 'John Doe', email: 'john@example.com' };
      const rules = { name: { required: true }, email: { required: true } };
      
      // Act
      const result1 = repositoryValidator.validate(entity, rules);
      const result2 = repositoryValidator.validate(entity, rules);

      // Assert
      expect(result1).toEqual(result2);
      expect(mockLogger.debug).toHaveBeenCalledWith('validation_cache_hit', expect.any(Object));
    });

    it('should handle large entities efficiently', () => {
      // Arrange
      const largeEntity = {
        items: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          value: Math.random() * 100,
        })),
      };
      const rules = {
        items: {
          required: true,
          type: 'array',
          maxLength: 1000,
          itemRules: {
            id: { required: true, type: 'number' },
            name: { required: true, type: 'string' },
            value: { required: true, type: 'number', min: 0 },
          },
        },
      };

      // Act
      const startTime = Date.now();
      const result = repositoryValidator.validate(largeEntity, rules);
      const endTime = Date.now();

      // Assert
      expect(result.isValid).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should support parallel validation', async () => {
      // Arrange
      const entities = [
        { name: 'John', email: 'john@example.com' },
        { name: 'Jane', email: 'jane@example.com' },
        { name: 'Bob', email: 'bob@example.com' },
      ];
      const rules = { name: { required: true }, email: { required: true, format: 'email' } };

      // Act
      const startTime = Date.now();
      const results = await repositoryValidator.validateParallel(entities, rules);
      const endTime = Date.now();

      // Assert
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.isValid).toBe(true);
      });
      expect(endTime - startTime).toBeLessThan(500); // Should be faster than sequential
    });
  });

  describe('Integration and Extensibility', () => {
    it('should support custom validators', () => {
      // Arrange
      const customValidator = {
        name: 'strongPassword',
        validator: (value: string) => {
          const hasUpper = /[A-Z]/.test(value);
          const hasLower = /[a-z]/.test(value);
          const hasNumber = /\d/.test(value);
          const hasSpecial = /[!@#$%^&*]/.test(value);
          return hasUpper && hasLower && hasNumber && hasSpecial;
        },
        message: 'Password must contain uppercase, lowercase, number, and special character',
      };

      repositoryValidator.addCustomValidator(customValidator);

      const entity = { password: 'weak' };
      const rules = { password: { required: true, custom: 'strongPassword' } };

      // Act
      const result = repositoryValidator.validate(entity, rules);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain uppercase, lowercase, number, and special character');
    });

    it('should support validation plugins', () => {
      // Arrange
      const plugin = {
        name: 'internationalization',
        validate: (entity: any, rules: any, context: any) => {
          // Add internationalization-specific validation logic
          if (context.locale === 'fr' && entity.phone) {
            const frenchPhoneRegex = /^0[1-9]\d{8}$/;
            if (!frenchPhoneRegex.test(entity.phone)) {
              return {
                isValid: false,
                errors: ['Phone number must be in French format'],
              };
            }
          }
          return { isValid: true, errors: [] };
        },
      };

      repositoryValidator.addPlugin(plugin);

      const entity = { phone: '123-456-7890' };
      const rules = { phone: { required: true } };
      const context = { locale: 'fr' };

      // Act
      const result = repositoryValidator.validateWithPlugins(entity, rules, context);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Phone number must be in French format');
    });

    it('should emit validation events', () => {
      // Arrange
      const eventListener = jest.fn();
      repositoryValidator.on('validation:start', eventListener);
      repositoryValidator.on('validation:complete', eventListener);
      repositoryValidator.on('validation:error', eventListener);

      const entity = { name: '', email: 'invalid' };
      const rules = { name: { required: true }, email: { format: 'email' } };

      // Act
      repositoryValidator.validate(entity, rules);

      // Assert
      expect(eventListener).toHaveBeenCalledTimes(3);
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'validation:start' }),
        expect.any(Object)
      );
    });
  });
});
