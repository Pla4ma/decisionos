/**
 * RepositoryValidation Tests
 * 
 * Comprehensive test suite for RepositoryValidation functionality including
 * entity validation, business rules, data integrity checks, and validation chains.
 */

import { RepositoryValidation } from '../repositories/RepositoryValidation';
import { Logger } from '../logging/Logger';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

describe('RepositoryValidation', () => {
  let repositoryValidation: RepositoryValidation;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryValidation = new RepositoryValidation(mockLogger);
  });

  describe('Entity Validation', () => {
    it('should validate user entity', () => {
      // Arrange
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        status: 'active',
      };

      const userSchema = {
        id: { type: 'number', required: true, min: 1 },
        name: { type: 'string', required: true, minLength: 2, maxLength: 100 },
        email: { type: 'email', required: true },
        age: { type: 'number', required: true, min: 0, max: 150 },
        status: { type: 'string', required: true, enum: ['active', 'inactive', 'suspended'] },
      };

      // Act
      const validation = repositoryValidation.validateEntity(user, userSchema);

      // Assert
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(mockLogger.debug).toHaveBeenCalledWith('entity_validation_passed', expect.objectContaining({
        entityType: 'Entity',
      }));
    });

    it('should fail validation for invalid user entity', () => {
      // Arrange
      const invalidUser = {
        id: -1, // Invalid: negative
        name: '', // Invalid: empty
        email: 'invalid-email', // Invalid: not a valid email
        age: 200, // Invalid: too old
        status: 'invalid', // Invalid: not in enum
      };

      const userSchema = {
        id: { type: 'number', required: true, min: 1 },
        name: { type: 'string', required: true, minLength: 2, maxLength: 100 },
        email: { type: 'email', required: true },
        age: { type: 'number', required: true, min: 0, max: 150 },
        status: { type: 'string', required: true, enum: ['active', 'inactive', 'suspended'] },
      };

      // Act
      const validation = repositoryValidation.validateEntity(invalidUser, userSchema);

      // Assert
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(5);
      expect(validation.errors[0]).toContain('ID must be at least 1');
      expect(validation.errors[1]).toContain('Name is required');
      expect(validation.errors[2]).toContain('Invalid email format');
      expect(validation.errors[3]).toContain('Age must be between 0 and 150');
      expect(validation.errors[4]).toContain('Status must be one of: active, inactive, suspended');
    });

    it('should validate product entity', () => {
      // Arrange
      const product = {
        id: 'prod-123',
        name: 'Laptop Pro',
        price: 999.99,
        category: 'electronics',
        inStock: true,
        quantity: 50,
      };

      const productSchema = {
        id: { type: 'string', required: true, pattern: '^prod-[0-9]+$' },
        name: { type: 'string', required: true, minLength: 1, maxLength: 200 },
        price: { type: 'number', required: true, min: 0 },
        category: { type: 'string', required: true, enum: ['electronics', 'clothing', 'books', 'home'] },
        inStock: { type: 'boolean', required: true },
        quantity: { type: 'number', required: true, min: 0 },
      };

      // Act
      const validation = repositoryValidation.validateEntity(product, productSchema);

      // Assert
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should validate order entity', () => {
      // Arrange
      const order = {
        id: 'order-456',
        userId: 'user-123',
        items: [
          { productId: 'prod-123', quantity: 2, price: 999.99 },
          { productId: 'prod-789', quantity: 1, price: 49.99 },
        ],
        total: 2049.97,
        status: 'pending',
        createdAt: new Date(),
      };

      const orderSchema = {
        id: { type: 'string', required: true, pattern: '^order-[0-9]+$' },
        userId: { type: 'string', required: true, pattern: '^user-[0-9]+$' },
        items: {
          type: 'array',
          required: true,
          minLength: 1,
          items: {
            productId: { type: 'string', required: true },
            quantity: { type: 'number', required: true, min: 1 },
            price: { type: 'number', required: true, min: 0 },
          },
        },
        total: { type: 'number', required: true, min: 0 },
        status: { type: 'string', required: true, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
        createdAt: { type: 'date', required: true },
      };

      // Act
      const validation = repositoryValidation.validateEntity(order, orderSchema);

      // Assert
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should handle partial validation', () => {
      // Arrange
      const partialUser = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const userSchema = {
        id: { type: 'number', required: false },
        name: { type: 'string', required: true },
        email: { type: 'email', required: true },
        age: { type: 'number', required: false },
      };

      // Act
      const validation = repositoryValidation.validateEntity(partialUser, userSchema, { partial: true });

      // Assert
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Business Rules Validation', () => {
    it('should validate user age restrictions', () => {
      // Arrange
      const user = { age: 16, status: 'active' };
      const businessRules = {
        minimumAge: 18,
        requiredStatusForMinors: 'inactive',
      };

      // Act
      const validation = repositoryValidation.validateBusinessRules(user, businessRules);

      // Assert
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('User must be at least 18 years old');
    });

    it('should validate product pricing rules', () => {
      // Arrange
      const product = {
        price: 50,
        category: 'electronics',
        discount: 60, // 60% discount on electronics
        inStock: true,
      };

      const businessRules = {
        maxDiscountByCategory: {
          electronics: 50, // Max 50% discount on electronics
          clothing: 70,
          books: 30,
        },
        minPriceByCategory: {
          electronics: 100,
          clothing: 20,
          books: 10,
        },
      };

      // Act
      const validation = repositoryValidation.validateBusinessRules(product, businessRules);

      // Assert
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Discount cannot exceed 50% for electronics category');
      expect(validation.errors).toContain('Price cannot be less than 100 for electronics category');
    });

    it('should validate order quantity rules', () => {
      // Arrange
      const order = {
        items: [
          { productId: 'prod-123', quantity: 15, category: 'electronics' },
          { productId: 'prod-456', quantity: 5, category: 'clothing' },
        ],
        userId: 'user-123',
      };

      const businessRules = {
        maxQuantityByCategory: {
          electronics: 10,
          clothing: 20,
        },
        maxItemsPerOrder: 15,
        maxOrdersPerUserPerDay: 5,
      };

      // Act
      const validation = repositoryValidation.validateBusinessRules(order, businessRules);

      // Assert
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Quantity cannot exceed 10 for electronics category');
    });

    it('should validate payment processing rules', () => {
      // Arrange
      const payment = {
        amount: 50000, // $500.00 in cents
        method: 'credit_card',
        currency: 'USD',
        userId: 'user-123',
        userAccountStatus: 'verified',
      };

      const businessRules = {
        maxAmountByMethod: {
          credit_card: 10000, // $100.00
          paypal: 5000, // $50.00
          bank_transfer: 100000, // $1,000.00
        },
        minUserAccountStatus: {
          credit_card: 'verified',
          paypal: 'active',
          bank_transfer: 'any',
        },
        supportedCurrencies: ['USD', 'EUR', 'GBP'],
      };

      // Act
      const validation = repositoryValidation.validateBusinessRules(payment, businessRules);

      // Assert
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Amount cannot exceed 10000 for credit_card payments');
    });

    it('should validate inventory management rules', () => {
      // Arrange
      const inventory = {
        productId: 'prod-123',
        quantity: 5,
        reorderLevel: 10,
        maxStock: 100,
        category: 'electronics',
        seasonality: 'high',
      };

      const businessRules = {
        minStockLevel: {
          electronics: 5,
          clothing: 10,
          books: 20,
        },
        maxStockMultiplier: {
          electronics: 2,
          clothing: 3,
          books: 5,
        },
        reorderThreshold: 0.2, // 20% of max stock
      };

      // Act
      const validation = repositoryValidation.validateBusinessRules(inventory, businessRules);

      // Assert
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Stock level below minimum for electronics category');
      expect(validation.errors).toContain('Reorder level reached');
    });
  });

  describe('Data Integrity Validation', () => {
    it('should validate foreign key relationships', async () => {
      // Arrange
      const order = {
        id: 'order-123',
        userId: 'user-456',
        productId: 'prod-789',
        shippingAddressId: 'addr-101',
      };

      const mockReferences = {
        user: ['user-123', 'user-456', 'user-789'],
        product: ['prod-123', 'prod-456', 'prod-789'],
        address: ['addr-101', 'addr-202', 'addr-303'],
      };

      // Act
      const validation = await repositoryValidation.validateForeignKeys(order, mockReferences);

      // Assert
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing foreign key references', async () => {
      // Arrange
      const order = {
        id: 'order-123',
        userId: 'user-999', // Non-existent user
        productId: 'prod-789',
        shippingAddressId: 'addr-999', // Non-existent address
      };

      const mockReferences = {
        user: ['user-123', 'user-456', 'user-789'],
        product: ['prod-123', 'prod-456', 'prod-789'],
        address: ['addr-101', 'addr-202', 'addr-303'],
      };

      // Act
      const validation = await repositoryValidation.validateForeignKeys(order, mockReferences);

      // Assert
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('User user-999 does not exist');
      expect(validation.errors).toContain('Address addr-999 does not exist');
    });

    it('should validate unique constraints', async () => {
      // Arrange
      const user = {
        email: 'john@example.com',
        username: 'johndoe',
        phone: '555-123-4567',
      };

      const mockExistingRecords = {
        email: ['jane@example.com', 'bob@example.com'],
        username: ['janedoe', 'bobsmith'],
        phone: ['555-987-6543', '555-555-5555'],
      };

      // Act
      const validation = await repositoryValidation.validateUniqueConstraints(user, mockExistingRecords);

      // Assert
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect unique constraint violations', async () => {
      // Arrange
      const user = {
        email: 'john@example.com',
        username: 'johndoe',
        phone: '555-123-4567',
      };

      const mockExistingRecords = {
        email: ['john@example.com', 'jane@example.com'], // Email already exists
        username: ['janedoe', 'bobsmith'],
        phone: ['555-123-4567', '555-987-6543'], // Phone already exists
      };

      // Act
      const validation = await repositoryValidation.validateUniqueConstraints(user, mockExistingRecords);

      // Assert
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Email john@example.com already exists');
      expect(validation.errors).toContain('Phone 555-123-4567 already exists');
    });

    it('should validate data consistency across related entities', async () => {
      // Arrange
      const orderItems = [
        { orderId: 'order-123', productId: 'prod-456', quantity: 2, price: 50.00 },
        { orderId: 'order-123', productId: 'prod-789', quantity: 1, price: 25.00 },
      ];

      const order = {
        id: 'order-123',
        total: 125.00,
        itemCount: 3,
      };

      const mockProducts = {
        'prod-456': { price: 50.00, inStock: true },
        'prod-789': { price: 25.00, inStock: true },
      };

      // Act
      const validation = await repositoryValidation.validateDataConsistency(order, orderItems, mockProducts);

      // Assert
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect data consistency issues', async () => {
      // Arrange
      const orderItems = [
        { orderId: 'order-123', productId: 'prod-456', quantity: 2, price: 60.00 }, // Price mismatch
        { orderId: 'order-123', productId: 'prod-789', quantity: 1, price: 25.00 },
      ];

      const order = {
        id: 'order-123',
        total: 125.00, // Should be 145.00
        itemCount: 3,
      };

      const mockProducts = {
        'prod-456': { price: 50.00, inStock: true }, // Product price is 50.00
        'prod-789': { price: 25.00, inStock: true },
      };

      // Act
      const validation = await repositoryValidation.validateDataConsistency(order, orderItems, mockProducts);

      // Assert
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Price mismatch for product prod-456: expected 50.00, got 60.00');
      expect(validation.errors).toContain('Order total mismatch: expected 145.00, got 125.00');
    });
  });

  describe('Validation Chains', () => {
    it('should execute validation chain successfully', () => {
      // Arrange
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        status: 'active',
      };

      const validationChain = repositoryValidation.createValidationChain()
        .addRule('id', (value) => value > 0, 'ID must be positive')
        .addRule('name', (value) => value && value.length >= 2, 'Name must be at least 2 characters')
        .addRule('email', (value) => repositoryValidation.isValidEmail(value), 'Invalid email format')
        .addRule('age', (value) => value >= 0 && value <= 150, 'Age must be between 0 and 150')
        .addRule('status', (value) => ['active', 'inactive', 'suspended'].includes(value), 'Invalid status');

      // Act
      const validation = validationChain.validate(user);

      // Assert
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should stop validation chain on first error', () => {
      // Arrange
      const invalidUser = {
        id: -1, // This will fail first
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        status: 'active',
      };

      const validationChain = repositoryValidation.createValidationChain()
        .addRule('id', (value) => value > 0, 'ID must be positive')
        .addRule('name', (value) => value && value.length >= 2, 'Name must be at least 2 characters')
        .addRule('email', (value) => repositoryValidation.isValidEmail(value), 'Invalid email format')
        .addRule('age', (value) => value >= 0 && value <= 150, 'Age must be between 0 and 150')
        .addRule('status', (value) => ['active', 'inactive', 'suspended'].includes(value), 'Invalid status');

      // Act
      const validation = validationChain.validate(invalidUser, { stopOnFirstError: true });

      // Assert
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0]).toBe('ID must be positive');
    });

    it('should execute conditional validation rules', () => {
      // Arrange
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        status: 'active',
        role: 'admin',
        permissions: ['read', 'write'],
      };

      const validationChain = repositoryValidation.createValidationChain()
        .addRule('id', (value) => value > 0, 'ID must be positive')
        .addRule('name', (value) => value && value.length >= 2, 'Name must be at least 2 characters')
        .addRule('email', (value) => repositoryValidation.isValidEmail(value), 'Invalid email format')
        .addRule('permissions', (value) => value.includes('admin'), 'Admin must have admin permission', { when: (data) => data.role === 'admin' });

      // Act
      const validation = validationChain.validate(user);

      // Assert
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Admin must have admin permission');
    });

    it('should execute async validation rules', async () => {
      // Arrange
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
      };

      const validationChain = repositoryValidation.createValidationChain()
        .addRule('id', (value) => value > 0, 'ID must be positive')
        .addRule('name', (value) => value && value.length >= 2, 'Name must be at least 2 characters')
        .addRule('email', (value) => repositoryValidation.isValidEmail(value), 'Invalid email format')
        .addAsyncRule('username', async (value) => {
          // Simulate async username uniqueness check
          await new Promise(resolve => setTimeout(resolve, 10));
          return value !== 'existinguser';
        }, 'Username already exists');

      // Act
      const validation = await validationChain.validateAsync(user);

      // Assert
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Custom Validators', () => {
    it('should create and use custom validators', () => {
      // Arrange
      const customValidator = repositoryValidation.createValidator('phoneNumber', (value) => {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
      }, 'Invalid phone number format');

      const user = {
        name: 'John Doe',
        phone: '+1 (555) 123-4567',
        email: 'john@example.com',
      };

      const schema = {
        name: { type: 'string', required: true },
        phone: { type: 'custom', validator: customValidator, required: true },
        email: { type: 'email', required: true },
      };

      // Act
      const validation = repositoryValidation.validateEntity(user, schema);

      // Assert
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should handle custom validator failures', () => {
      // Arrange
      const customValidator = repositoryValidation.createValidator('strongPassword', (value) => {
        return value.length >= 8 &&
               /[A-Z]/.test(value) &&
               /[a-z]/.test(value) &&
               /[0-9]/.test(value) &&
               /[^A-Za-z0-9]/.test(value);
      }, 'Password must be at least 8 characters with uppercase, lowercase, number, and special character');

      const user = {
        name: 'John Doe',
        password: 'weak', // Too weak
        email: 'john@example.com',
      };

      const schema = {
        name: { type: 'string', required: true },
        password: { type: 'custom', validator: customValidator, required: true },
        email: { type: 'email', required: true },
      };

      // Act
      const validation = repositoryValidation.validateEntity(user, schema);

      // Assert
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
    });

    it('should create composite validators', () => {
      // Arrange
      const compositeValidator = repositoryValidation.createCompositeValidator('userProfile', [
        { field: 'name', validator: (value) => value && value.length >= 2, 'Name is required' },
        { field: 'email', validator: (value) => repositoryValidation.isValidEmail(value), 'Invalid email' },
        { field: 'age', validator: (value) => value >= 18, 'Must be at least 18 years old' },
        { field: 'termsAccepted', validator: (value) => value === true, 'Must accept terms and conditions' },
      ]);

      const userProfile = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
        termsAccepted: true,
      };

      // Act
      const validation = compositeValidator.validate(userProfile);

      // Assert
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should create conditional validators', () => {
      // Arrange
      const conditionalValidator = repositoryValidation.createConditionalValidator(
        (data) => data.role === 'admin',
        {
          permissions: { validator: (value) => value.includes('admin'), 'Admin must have admin permission' },
          securityLevel: { validator: (value) => value >= 5, 'Admin must have security level >= 5' },
        }
      );

      const adminUser = {
        role: 'admin',
        permissions: ['read', 'write', 'admin'],
        securityLevel: 8,
      };

      const regularUser = {
        role: 'user',
        permissions: ['read'],
        securityLevel: 2,
      };

      // Act
      const adminValidation = conditionalValidator.validate(adminUser);
      const regularValidation = conditionalValidator.validate(regularUser);

      // Assert
      expect(adminValidation.isValid).toBe(true);
      expect(adminValidation.errors).toHaveLength(0);

      expect(regularValidation.isValid).toBe(true); // Should pass because condition is false
      expect(regularValidation.errors).toHaveLength(0);
    });
  });

  describe('Validation Configuration', () => {
    it('should configure validation settings', () => {
      // Arrange
      const settings = {
        strictMode: true,
        returnAllErrors: true,
        validateRequiredFirst: true,
        logValidationFailures: true,
        customErrorMessages: {
          required: 'This field is required',
          email: 'Please enter a valid email address',
          minLength: 'Must be at least {min} characters',
        },
      };

      // Act
      repositoryValidation.configureSettings(settings);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('validation_settings_configured', expect.objectContaining({
        settings,
      }));
    });

    it('should configure validation rules', () => {
      // Arrange
      const rules = {
        email: {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'Please enter a valid email address',
        },
        password: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          message: 'Password must meet security requirements',
        },
        phone: {
          pattern: /^\+?[\d\s\-\(\)]+$/,
          minLength: 10,
          maxLength: 15,
          message: 'Please enter a valid phone number',
        },
      };

      // Act
      repositoryValidation.configureRules(rules);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('validation_rules_configured', expect.objectContaining({
        rulesCount: 3,
      }));
    });

    it('should configure validation contexts', () => {
      // Arrange
      const contexts = {
        create: {
          strictMode: true,
          validateRequiredFirst: true,
          returnAllErrors: true,
        },
        update: {
          strictMode: false,
          validateRequiredFirst: false,
          returnAllErrors: false,
        },
        delete: {
          strictMode: false,
          validateRequiredFirst: false,
          returnAllErrors: false,
        },
      };

      // Act
      repositoryValidation.configureContexts(contexts);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('validation_contexts_configured', expect.objectContaining({
        contexts: ['create', 'update', 'delete'],
      }));
    });
  });

  describe('Validation Performance', () => {
    it('should cache validation results', () => {
      // Arrange
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      const schema = {
        id: { type: 'number', required: true },
        name: { type: 'string', required: true },
        email: { type: 'email', required: true },
        age: { type: 'number', required: true },
      };

      // Act
      const validation1 = repositoryValidation.validateEntity(user, schema, { cache: true });
      const validation2 = repositoryValidation.validateEntity(user, schema, { cache: true });

      // Assert
      expect(validation1.isValid).toBe(true);
      expect(validation2.isValid).toBe(true);
      expect(validation1.cacheHit).toBe(false);
      expect(validation2.cacheHit).toBe(true);
    });

    it('should handle large dataset validation efficiently', () => {
      // Arrange
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        age: 20 + (i % 60),
      }));

      const schema = {
        id: { type: 'number', required: true },
        name: { type: 'string', required: true },
        email: { type: 'email', required: true },
        age: { type: 'number', required: true },
      };

      // Act
      const startTime = Date.now();
      const validation = repositoryValidation.validateEntities(largeDataset, schema, { batchSize: 100 });
      const endTime = Date.now();

      // Assert
      expect(validation.isValid).toBe(true);
      expect(validation.totalValidated).toBe(1000);
      expect(validation.totalErrors).toBe(0);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should implement parallel validation', async () => {
      // Arrange
      const entities = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Entity ${i + 1}`,
        value: Math.random() * 100,
      }));

      const schema = {
        id: { type: 'number', required: true },
        name: { type: 'string', required: true },
        value: { type: 'number', required: true },
      };

      // Act
      const startTime = Date.now();
      const validation = await repositoryValidation.validateEntitiesParallel(entities, schema);
      const endTime = Date.now();

      // Assert
      expect(validation.isValid).toBe(true);
      expect(validation.totalValidated).toBe(100);
      expect(validation.totalErrors).toBe(0);
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });
  });

  describe('Validation Reporting', () => {
    it('should generate validation report', () => {
      // Arrange
      const validationResults = [
        { entityType: 'User', isValid: true, errors: [], warnings: [] },
        { entityType: 'Product', isValid: false, errors: ['Price cannot be negative'], warnings: ['Low stock level'] },
        { entityType: 'Order', isValid: true, errors: [], warnings: ['High order value'] },
        { entityType: 'Payment', isValid: false, errors: ['Invalid payment method'], warnings: [] },
      ];

      // Act
      const report = repositoryValidation.generateValidationReport(validationResults);

      // Assert
      expect(report).toBeDefined();
      expect(report.summary.totalEntities).toBe(4);
      expect(report.summary.validEntities).toBe(2);
      expect(report.summary.invalidEntities).toBe(2);
      expect(report.summary.totalErrors).toBe(2);
      expect(report.summary.totalWarnings).toBe(2);
      expect(report.details).toHaveLength(4);
    });

    it('should track validation statistics', () => {
      // Arrange
      const validationHistory = Array.from({ length: 1000 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 1000),
        entityType: ['User', 'Product', 'Order'][i % 3],
        isValid: i % 4 !== 0, // 75% success rate
        errors: i % 4 === 0 ? ['Random error'] : [],
        duration: 50 + Math.random() * 100,
      }));

      // Act
      const statistics = repositoryValidation.getValidationStatistics(validationHistory);

      // Assert
      expect(statistics).toBeDefined();
      expect(statistics.totalValidations).toBe(1000);
      expect(statistics.successRate).toBe(0.75);
      expect(statistics.averageDuration).toBeGreaterThan(50);
      expect(statistics.averageDuration).toBeLessThan(150);
      expect(statistics.entityTypeStats).toBeDefined();
    });

    it('should identify validation patterns', () => {
      // Arrange
      const validationErrors = [
        { field: 'email', error: 'Invalid email format', entityType: 'User' },
        { field: 'email', error: 'Invalid email format', entityType: 'User' },
        { field: 'email', error: 'Invalid email format', entityType: 'User' },
        { field: 'age', error: 'Age must be positive', entityType: 'User' },
        { field: 'price', error: 'Price cannot be negative', entityType: 'Product' },
        { field: 'price', error: 'Price cannot be negative', entityType: 'Product' },
      ];

      // Act
      const patterns = repositoryValidation.identifyValidationPatterns(validationErrors);

      // Assert
      expect(patterns).toBeDefined();
      expect(patterns.mostCommonErrors).toHaveLength(3);
      expect(patterns.mostCommonErrors[0].error).toBe('Invalid email format');
      expect(patterns.mostCommonErrors[0].count).toBe(3);
      expect(patterns.fieldErrorRates).toBeDefined();
      expect(patterns.entityTypeErrorRates).toBeDefined();
    });
  });
});
