/**
 * RepositoryUtilities Tests
 * 
 * Comprehensive test suite for RepositoryUtilities functionality including
 * helper functions, data transformations, validation utilities, and common operations.
 */

import { RepositoryUtilities } from '../repositories/RepositoryUtilities';
import { Logger } from '../logging/Logger';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

describe('RepositoryUtilities', () => {
  let repositoryUtilities: RepositoryUtilities;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryUtilities = new RepositoryUtilities(mockLogger);
  });

  describe('Data Transformation Utilities', () => {
    it('should transform snake_case to camelCase', () => {
      // Arrange
      const snakeCaseString = 'user_name_first_name';

      // Act
      const camelCase = repositoryUtilities.snakeToCamel(snakeCaseString);

      // Assert
      expect(camelCase).toBe('userNameFirstName');
    });

    it('should transform camelCase to snake_case', () => {
      // Arrange
      const camelCaseString = 'userNameFirstName';

      // Act
      const snakeCase = repositoryUtilities.camelToSnake(camelCaseString);

      // Assert
      expect(snakeCase).toBe('user_name_first_name');
    });

    it('should transform object keys recursively', () => {
      // Arrange
      const snakeCaseObject = {
        user_id: 123,
        user_name: 'John Doe',
        email_address: 'john@example.com',
        profile: {
          first_name: 'John',
          last_name: 'Doe',
          date_of_birth: '1990-01-01',
        },
      };

      // Act
      const camelCaseObject = repositoryUtilities.transformKeys(snakeCaseObject, 'snakeToCamel');

      // Assert
      expect(camelCaseObject).toEqual({
        userId: 123,
        userName: 'John Doe',
        emailAddress: 'john@example.com',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
        },
      });
    });

    it('should flatten nested objects', () => {
      // Arrange
      const nestedObject = {
        user: {
          id: 123,
          name: 'John Doe',
          profile: {
            email: 'john@example.com',
            settings: {
              theme: 'dark',
              notifications: true,
            },
          },
        },
        order: {
          id: 456,
          total: 99.99,
        },
      };

      // Act
      const flattened = repositoryUtilities.flattenObject(nestedObject);

      // Assert
      expect(flattened).toEqual({
        'user.id': 123,
        'user.name': 'John Doe',
        'user.profile.email': 'john@example.com',
        'user.profile.settings.theme': 'dark',
        'user.profile.settings.notifications': true,
        'order.id': 456,
        'order.total': 99.99,
      });
    });

    it('should unflatten nested objects', () => {
      // Arrange
      const flattenedObject = {
        'user.id': 123,
        'user.name': 'John Doe',
        'user.profile.email': 'john@example.com',
        'user.profile.settings.theme': 'dark',
        'order.id': 456,
        'order.total': 99.99,
      };

      // Act
      const nested = repositoryUtilities.unflattenObject(flattenedObject);

      // Assert
      expect(nested).toEqual({
        user: {
          id: 123,
          name: 'John Doe',
          profile: {
            email: 'john@example.com',
            settings: {
              theme: 'dark',
            },
          },
        },
        order: {
          id: 456,
          total: 99.99,
        },
      });
    });

    it('should deep clone objects', () => {
      // Arrange
      const originalObject = {
        id: 123,
        name: 'John Doe',
        profile: {
          email: 'john@example.com',
          settings: {
            theme: 'dark',
            notifications: true,
          },
        },
      };

      // Act
      const clonedObject = repositoryUtilities.deepClone(originalObject);

      // Assert
      expect(clonedObject).toEqual(originalObject);
      expect(clonedObject).not.toBe(originalObject);
      expect(clonedObject.profile).not.toBe(originalObject.profile);
      expect(clonedObject.profile.settings).not.toBe(originalObject.profile.settings);

      // Verify deep clone by modifying original
      originalObject.profile.settings.theme = 'light';
      expect(clonedObject.profile.settings.theme).toBe('dark');
    });

    it('should merge objects deeply', () => {
      // Arrange
      const object1 = {
        user: {
          id: 123,
          name: 'John Doe',
          profile: {
            email: 'john@example.com',
            settings: {
              theme: 'dark',
              notifications: true,
            },
          },
        },
        order: {
          id: 456,
          total: 99.99,
        },
      };

      const object2 = {
        user: {
          name: 'Jane Doe',
          profile: {
            settings: {
              theme: 'light',
              language: 'en',
            },
          },
        },
        payment: {
          method: 'credit_card',
          status: 'completed',
        },
      };

      // Act
      const merged = repositoryUtilities.deepMerge(object1, object2);

      // Assert
      expect(merged).toEqual({
        user: {
          id: 123,
          name: 'Jane Doe',
          profile: {
            email: 'john@example.com',
            settings: {
              theme: 'light',
              notifications: true,
              language: 'en',
            },
          },
        },
        order: {
          id: 456,
          total: 99.99,
        },
        payment: {
          method: 'credit_card',
          status: 'completed',
        },
      });
    });
  });

  describe('Validation Utilities', () => {
    it('should validate email addresses', () => {
      // Arrange
      const validEmails = [
        'john@example.com',
        'jane.doe@company.co.uk',
        'user+tag@example.org',
        'test123@test-domain.com',
      ];

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test@.com',
        'test@example.',
        'test@example..com',
      ];

      // Act & Assert
      validEmails.forEach(email => {
        expect(repositoryUtilities.isValidEmail(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(repositoryUtilities.isValidEmail(email)).toBe(false);
      });
    });

    it('should validate phone numbers', () => {
      // Arrange
      const validPhones = [
        '+1-555-123-4567',
        '(555) 123-4567',
        '555.123.4567',
        '5551234567',
        '+44 20 7946 0958',
      ];

      const invalidPhones = [
        '123',
        'abc-def-ghij',
        '555-1234',
        '1-555-123-45678',
        '',
      ];

      // Act & Assert
      validPhones.forEach(phone => {
        expect(repositoryUtilities.isValidPhone(phone)).toBe(true);
      });

      invalidPhones.forEach(phone => {
        expect(repositoryUtilities.isValidPhone(phone)).toBe(false);
      });
    });

    it('should validate URLs', () => {
      // Arrange
      const validUrls = [
        'https://www.example.com',
        'http://example.org',
        'https://api.example.com/v1/users',
        'ftp://files.example.com',
      ];

      const invalidUrls = [
        'not-a-url',
        'http://',
        'https://',
        'www.example.com',
        'example.com',
      ];

      // Act & Assert
      validUrls.forEach(url => {
        expect(repositoryUtilities.isValidUrl(url)).toBe(true);
      });

      invalidUrls.forEach(url => {
        expect(repositoryUtilities.isValidUrl(url)).toBe(false);
      });
    });

    it('should validate UUIDs', () => {
      // Arrange
      const validUUIDs = [
        '123e4567-e89b-12d3-a456-426614174000',
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      ];

      const invalidUUIDs = [
        '123e4567-e89b-12d3-a456-42661417400', // Too short
        '123e4567-e89b-12d3-a456-4266141740000', // Too long
        '123e4567-e89b-12d3-a456-42661417400z', // Invalid character
        'not-a-uuid',
        '',
      ];

      // Act & Assert
      validUUIDs.forEach(uuid => {
        expect(repositoryUtilities.isValidUUID(uuid)).toBe(true);
      });

      invalidUUIDs.forEach(uuid => {
        expect(repositoryUtilities.isValidUUID(uuid)).toBe(false);
      });
    });

    it('should validate required fields', () => {
      // Arrange
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        address: null,
      };

      const requiredFields = ['name', 'email', 'age', 'address'];

      // Act
      const validation = repositoryUtilities.validateRequiredFields(data, requiredFields);

      // Assert
      expect(validation.isValid).toBe(false);
      expect(validation.missingFields).toContain('address');
      expect(validation.missingFields).toHaveLength(1);
    });

    it('should validate field types', () => {
      // Arrange
      const data = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
        active: true,
        created_at: '2023-01-15',
      };

      const fieldTypes = {
        name: 'string',
        age: 'number',
        email: 'string',
        active: 'boolean',
        created_at: 'date',
      };

      // Act
      const validation = repositoryUtilities.validateFieldTypes(data, fieldTypes);

      // Assert
      expect(validation.isValid).toBe(true);
      expect(validation.typeErrors).toHaveLength(0);
    });

    it('should sanitize strings', () => {
      // Arrange
      const dirtyString = '  Hello \n World \t!  ';
      const maliciousString = '<script>alert("xss")</script>Hello';

      // Act
      const cleanString = repositoryUtilities.sanitizeString(dirtyString);
      const safeString = repositoryUtilities.sanitizeString(maliciousString, { removeHTML: true });

      // Assert
      expect(cleanString).toBe('Hello World!');
      expect(safeString).toBe('Hello');
      expect(safeString).not.toContain('<script>');
      expect(safeString).not.toContain('alert');
    });
  });

  describe('Date and Time Utilities', () => {
    it('should format dates', () => {
      // Arrange
      const date = new Date('2023-01-15T14:30:00Z');

      // Act
      const formatted = repositoryUtilities.formatDate(date, 'YYYY-MM-DD HH:mm:ss');

      // Assert
      expect(formatted).toBe('2023-01-15 14:30:00');
    });

    it('should parse dates from various formats', () => {
      // Arrange
      const dateStrings = [
        '2023-01-15',
        '2023/01/15',
        '01/15/2023',
        '15-01-2023',
        '2023-01-15T14:30:00Z',
        'Jan 15, 2023',
      ];

      // Act & Assert
      dateStrings.forEach(dateString => {
        const parsed = repositoryUtilities.parseDate(dateString);
        expect(parsed).toBeInstanceOf(Date);
        expect(parsed.getFullYear()).toBe(2023);
        expect(parsed.getMonth()).toBe(0); // January
        expect(parsed.getDate()).toBe(15);
      });
    });

    it('should calculate date differences', () => {
      // Arrange
      const date1 = new Date('2023-01-15');
      const date2 = new Date('2023-01-20');

      // Act
      const difference = repositoryUtilities.dateDifference(date1, date2, 'days');

      // Assert
      expect(difference).toBe(5);
    });

    it('should add time to dates', () => {
      // Arrange
      const date = new Date('2023-01-15T10:00:00Z');

      // Act
      const futureDate = repositoryUtilities.addTime(date, { days: 5, hours: 2, minutes: 30 });

      // Assert
      expect(futureDate.getFullYear()).toBe(2023);
      expect(futureDate.getMonth()).toBe(0);
      expect(futureDate.getDate()).toBe(20);
      expect(futureDate.getHours()).toBe(12);
      expect(futureDate.getMinutes()).toBe(30);
    });

    it('should check if date is in range', () => {
      // Arrange
      const date = new Date('2023-01-15');
      const startDate = new Date('2023-01-10');
      const endDate = new Date('2023-01-20');

      // Act
      const inRange = repositoryUtilities.isDateInRange(date, startDate, endDate);

      // Assert
      expect(inRange).toBe(true);
    });

    it('should get start and end of day', () => {
      // Arrange
      const date = new Date('2023-01-15T14:30:00Z');

      // Act
      const startOfDay = repositoryUtilities.startOfDay(date);
      const endOfDay = repositoryUtilities.endOfDay(date);

      // Assert
      expect(startOfDay.getHours()).toBe(0);
      expect(startOfDay.getMinutes()).toBe(0);
      expect(startOfDay.getSeconds()).toBe(0);
      expect(endOfDay.getHours()).toBe(23);
      expect(endOfDay.getMinutes()).toBe(59);
      expect(endOfDay.getSeconds()).toBe(59);
    });
  });

  describe('String Utilities', () => {
    it('should capitalize strings', () => {
      // Arrange
      const strings = [
        'hello world',
        'john doe',
        'THIS IS UPPERCASE',
        'mixed CASE string',
      ];

      // Act & Assert
      expect(repositoryUtilities.capitalize('hello world')).toBe('Hello world');
      expect(repositoryUtilities.capitalizeWords('john doe')).toBe('John Doe');
      expect(repositoryUtilities.capitalize('THIS IS UPPERCASE')).toBe('This is uppercase');
      expect(repositoryUtilities.capitalize('mixed CASE string')).toBe('Mixed case string');
    });

    it('should truncate strings', () => {
      // Arrange
      const longString = 'This is a very long string that needs to be truncated';

      // Act
      const truncated = repositoryUtilities.truncate(longString, 20);

      // Assert
      expect(truncated).toBe('This is a very lon...');
      expect(truncated.length).toBeLessThanOrEqual(23); // 20 + '...'
    });

    it('should generate random strings', () => {
      // Act
      const randomString1 = repositoryUtilities.generateRandomString(10);
      const randomString2 = repositoryUtilities.generateRandomString(10, 'numeric');

      // Assert
      expect(randomString1).toHaveLength(10);
      expect(randomString2).toHaveLength(10);
      expect(randomString1).toMatch(/^[a-zA-Z0-9]+$/);
      expect(randomString2).toMatch(/^[0-9]+$/);
      expect(randomString1).not.toBe(randomString2);
    });

    it('should slugify strings', () => {
      // Arrange
      const strings = [
        'Hello World!',
        'This is a Test String',
        'Special Characters & Symbols #$%',
        '  Multiple   Spaces  ',
      ];

      // Act & Assert
      expect(repositoryUtilities.slugify('Hello World!')).toBe('hello-world');
      expect(repositoryUtilities.slugify('This is a Test String')).toBe('this-is-a-test-string');
      expect(repositoryUtilities.slugify('Special Characters & Symbols #$%')).toBe('special-characters-symbols');
      expect(repositoryUtilities.slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
    });

    it('should escape and unescape HTML', () => {
      // Arrange
      const htmlString = '<div class="test">Hello & World</div>';
      const escapedString = '&lt;div class=&quot;test&quot;&gt;Hello &amp; World&lt;/div&gt;';

      // Act
      const escaped = repositoryUtilities.escapeHTML(htmlString);
      const unescaped = repositoryUtilities.unescapeHTML(escapedString);

      // Assert
      expect(escaped).toBe(escapedString);
      expect(unescaped).toBe(htmlString);
    });
  });

  describe('Array Utilities', () => {
    it('should chunk arrays', () => {
      // Arrange
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      // Act
      const chunks = repositoryUtilities.chunk(array, 3);

      // Assert
      expect(chunks).toHaveLength(4);
      expect(chunks[0]).toEqual([1, 2, 3]);
      expect(chunks[1]).toEqual([4, 5, 6]);
      expect(chunks[2]).toEqual([7, 8, 9]);
      expect(chunks[3]).toEqual([10]);
    });

    it('should shuffle arrays', () => {
      // Arrange
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      // Act
      const shuffled = repositoryUtilities.shuffle(array);

      // Assert
      expect(shuffled).toHaveLength(10);
      expect(shuffled).not.toEqual(array);
      expect(shuffled.sort()).toEqual(array); // Should contain same elements
    });

    it('should remove duplicates from arrays', () => {
      // Arrange
      const arrayWithDuplicates = [1, 2, 3, 2, 4, 5, 3, 6, 1];

      // Act
      const unique = repositoryUtilities.unique(arrayWithDuplicates);

      // Assert
      expect(unique).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should group arrays by key', () => {
      // Arrange
      const users = [
        { id: 1, name: 'John', department: 'Engineering' },
        { id: 2, name: 'Jane', department: 'Engineering' },
        { id: 3, name: 'Bob', department: 'Marketing' },
        { id: 4, name: 'Alice', department: 'Marketing' },
      ];

      // Act
      const grouped = repositoryUtilities.groupBy(users, 'department');

      // Assert
      expect(grouped).toEqual({
        Engineering: [
          { id: 1, name: 'John', department: 'Engineering' },
          { id: 2, name: 'Jane', department: 'Engineering' },
        ],
        Marketing: [
          { id: 3, name: 'Bob', department: 'Marketing' },
          { id: 4, name: 'Alice', department: 'Marketing' },
        ],
      });
    });

    it('should sort arrays by key', () => {
      // Arrange
      const users = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
        { name: 'Bob', age: 35 },
        { name: 'Alice', age: 28 },
      ];

      // Act
      const sortedByName = repositoryUtilities.sortBy(users, 'name');
      const sortedByAge = repositoryUtilities.sortBy(users, 'age');

      // Assert
      expect(sortedByName.map(u => u.name)).toEqual(['Alice', 'Bob', 'Jane', 'John']);
      expect(sortedByAge.map(u => u.age)).toEqual([25, 28, 30, 35]);
    });
  });

  describe('Object Utilities', () => {
    it('should pick properties from objects', () => {
      // Arrange
      const object = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        active: true,
      };

      // Act
      const picked = repositoryUtilities.pick(object, ['id', 'name', 'email']);

      // Assert
      expect(picked).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    it('should omit properties from objects', () => {
      // Arrange
      const object = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret123',
        active: true,
      };

      // Act
      const omitted = repositoryUtilities.omit(object, ['password', 'active']);

      // Assert
      expect(omitted).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    it('should check if object is empty', () => {
      // Arrange
      const emptyObject = {};
      const nonEmptyObject = { name: 'John' };
      const nullObject = null;
      const undefinedObject = undefined;

      // Act & Assert
      expect(repositoryUtilities.isEmpty(emptyObject)).toBe(true);
      expect(repositoryUtilities.isEmpty(nonEmptyObject)).toBe(false);
      expect(repositoryUtilities.isEmpty(nullObject)).toBe(true);
      expect(repositoryUtilities.isEmpty(undefinedObject)).toBe(true);
    });

    it('should get object keys and values', () => {
      // Arrange
      const object = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      };

      // Act
      const keys = repositoryUtilities.keys(object);
      const values = repositoryUtilities.values(object);

      // Assert
      expect(keys).toEqual(['id', 'name', 'email']);
      expect(values).toEqual([1, 'John Doe', 'john@example.com']);
    });

    it('should map object values', () => {
      // Arrange
      const object = {
        id: 1,
        age: 30,
        score: 85,
      };

      // Act
      const mapped = repositoryUtilities.mapValues(object, (value) => value * 2);

      // Assert
      expect(mapped).toEqual({
        id: 2,
        age: 60,
        score: 170,
      });
    });
  });

  describe('Number Utilities', () => {
    it('should format numbers', () => {
      // Arrange
      const numbers = [
        1234.567,
        1000000,
        0.12345,
        -456.789,
      ];

      // Act & Assert
      expect(repositoryUtilities.formatNumber(1234.567)).toBe('1,234.567');
      expect(repositoryUtilities.formatNumber(1000000)).toBe('1,000,000');
      expect(repositoryUtilities.formatNumber(0.12345)).toBe('0.123');
      expect(repositoryUtilities.formatNumber(-456.789)).toBe('-456.789');
    });

    it('should round numbers to precision', () => {
      // Arrange
      const numbers = [
        123.4567,
        78.9123,
        45.6789,
      ];

      // Act & Assert
      expect(repositoryUtilities.round(123.4567, 2)).toBe(123.46);
      expect(repositoryUtilities.round(78.9123, 1)).toBe(78.9);
      expect(repositoryUtilities.round(45.6789, 0)).toBe(46);
    });

    it('should generate random numbers', () => {
      // Act
      const random1 = repositoryUtilities.randomNumber(1, 100);
      const random2 = repositoryUtilities.randomNumber(1, 100);

      // Assert
      expect(random1).toBeGreaterThanOrEqual(1);
      expect(random1).toBeLessThanOrEqual(100);
      expect(random2).toBeGreaterThanOrEqual(1);
      expect(random2).toBeLessThanOrEqual(100);
      expect(random1).not.toBe(random2);
    });

    it('should clamp numbers to range', () => {
      // Arrange
      const min = 10;
      const max = 20;

      // Act & Assert
      expect(repositoryUtilities.clamp(5, min, max)).toBe(10);
      expect(repositoryUtilities.clamp(15, min, max)).toBe(15);
      expect(repositoryUtilities.clamp(25, min, max)).toBe(20);
    });

    it('should check if number is in range', () => {
      // Arrange
      const min = 10;
      const max = 20;

      // Act & Assert
      expect(repositoryUtilities.isInRange(5, min, max)).toBe(false);
      expect(repositoryUtilities.isInRange(15, min, max)).toBe(true);
      expect(repositoryUtilities.isInRange(25, min, max)).toBe(false);
    });
  });

  describe('File and Path Utilities', () => {
    it('should get file extension', () => {
      // Arrange
      const filenames = [
        'document.pdf',
        'image.jpg',
        'archive.tar.gz',
        'script.js',
        'no-extension',
      ];

      // Act & Assert
      expect(repositoryUtilities.getFileExtension('document.pdf')).toBe('pdf');
      expect(repositoryUtilities.getFileExtension('image.jpg')).toBe('jpg');
      expect(repositoryUtilities.getFileExtension('archive.tar.gz')).toBe('gz');
      expect(repositoryUtilities.getFileExtension('script.js')).toBe('js');
      expect(repositoryUtilities.getFileExtension('no-extension')).toBe('');
    });

    it('should get filename without extension', () => {
      // Arrange
      const filenames = [
        'document.pdf',
        'image.jpg',
        'archive.tar.gz',
        'script.js',
      ];

      // Act & Assert
      expect(repositoryUtilities.getFilename('document.pdf')).toBe('document');
      expect(repositoryUtilities.getFilename('image.jpg')).toBe('image');
      expect(repositoryUtilities.getFilename('archive.tar.gz')).toBe('archive.tar');
      expect(repositoryUtilities.getFilename('script.js')).toBe('script');
    });

    it('should join path segments', () => {
      // Arrange
      const segments = ['home', 'user', 'documents', 'file.txt'];

      // Act
      const path = repositoryUtilities.joinPath(...segments);

      // Assert
      expect(path).toBe('home/user/documents/file.txt');
    });

    it('should normalize file paths', () => {
      // Arrange
      const paths = [
        'home//user//documents',
        'home/user/./documents',
        'home/user/documents/../downloads',
        '/home/user/documents/',
      ];

      // Act & Assert
      expect(repositoryUtilities.normalizePath('home//user//documents')).toBe('home/user/documents');
      expect(repositoryUtilities.normalizePath('home/user/./documents')).toBe('home/user/documents');
      expect(repositoryUtilities.normalizePath('home/user/documents/../downloads')).toBe('home/user/downloads');
      expect(repositoryUtilities.normalizePath('/home/user/documents/')).toBe('/home/user/documents');
    });

    it('should format file sizes', () => {
      // Arrange
      const sizes = [
        500, // bytes
        1500, // bytes
        1500000, // bytes
        1500000000, // bytes
      ];

      // Act & Assert
      expect(repositoryUtilities.formatFileSize(500)).toBe('500 B');
      expect(repositoryUtilities.formatFileSize(1500)).toBe('1.46 KB');
      expect(repositoryUtilities.formatFileSize(1500000)).toBe('1.43 MB');
      expect(repositoryUtilities.formatFileSize(1500000000)).toBe('1.40 GB');
    });
  });

  describe('Error Handling Utilities', () => {
    it('should create error objects', () => {
      // Arrange
      const message = 'Something went wrong';
      const code = 'ERROR_CODE';
      const details = { userId: 123, action: 'create' };

      // Act
      const error = repositoryUtilities.createError(message, code, details);

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.details).toEqual(details);
    });

    it('should wrap errors with context', () => {
      // Arrange
      const originalError = new Error('Database connection failed');
      const context = {
        operation: 'user.create',
        userId: 123,
        timestamp: new Date(),
      };

      // Act
      const wrappedError = repositoryUtilities.wrapError(originalError, context);

      // Assert
      expect(wrappedError).toBeInstanceOf(Error);
      expect(wrappedError.message).toContain('Database connection failed');
      expect(wrappedError.originalError).toBe(originalError);
      expect(wrappedError.context).toEqual(context);
    });

    it('should retry operations with exponential backoff', async () => {
      // Arrange
      let attempts = 0;
      const operation = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });

      // Act
      const result = await repositoryUtilities.retry(operation, {
        maxAttempts: 3,
        baseDelay: 100,
        maxDelay: 1000,
      });

      // Assert
      expect(result).toBe('success');
      expect(attempts).toBe(3);
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should handle timeout operations', async () => {
      // Arrange
      const slowOperation = jest.fn().mockImplementation(() => {
        return new Promise(resolve => setTimeout(resolve, 2000));
      });

      // Act & Assert
      await expect(
        repositoryUtilities.withTimeout(slowOperation(), 1000)
      ).rejects.toThrow('Operation timed out');
    });
  });

  describe('Caching Utilities', () => {
    it('should create simple cache', () => {
      // Arrange
      const cache = repositoryUtilities.createCache(1000); // 1 second TTL

      // Act
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      // Assert
      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key3')).toBe(false);
    });

    it('should handle cache expiration', (done) => {
      // Arrange
      const cache = repositoryUtilities.createCache(100); // 100ms TTL

      // Act
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');

      // Assert
      setTimeout(() => {
        expect(cache.get('key1')).toBeUndefined();
        done();
      }, 150);
    });

    it('should clear cache', () => {
      // Arrange
      const cache = repositoryUtilities.createCache(1000);
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      // Act
      cache.clear();

      // Assert
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.size).toBe(0);
    });

    it('should memoize functions', () => {
      // Arrange
      const expensiveFunction = jest.fn((x, y) => x + y);
      const memoizedFunction = repositoryUtilities.memoize(expensiveFunction);

      // Act
      const result1 = memoizedFunction(1, 2);
      const result2 = memoizedFunction(1, 2);
      const result3 = memoizedFunction(2, 3);

      // Assert
      expect(result1).toBe(3);
      expect(result2).toBe(3);
      expect(result3).toBe(5);
      expect(expensiveFunction).toHaveBeenCalledTimes(2); // Called twice for unique arguments
    });
  });

  describe('Performance Utilities', () => {
    it('should measure execution time', async () => {
      // Arrange
      const operation = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'result';
      };

      // Act
      const { result, duration } = await repositoryUtilities.measureTime(operation);

      // Assert
      expect(result).toBe('result');
      expect(duration).toBeGreaterThanOrEqual(90); // Allow some tolerance
      expect(duration).toBeLessThan(200);
    });

    it('should debounce functions', (done) => {
      // Arrange
      const debouncedFunction = repositoryUtilities.debounce(jest.fn(), 100);
      const callback = jest.fn();

      // Act
      debouncedFunction(callback);
      debouncedFunction(callback);
      debouncedFunction(callback);

      // Assert
      setTimeout(() => {
        expect(callback).toHaveBeenCalledTimes(1);
        done();
      }, 150);
    });

    it('should throttle functions', () => {
      // Arrange
      const throttledFunction = repositoryUtilities.throttle(jest.fn(), 100);
      const callback = jest.fn();

      // Act
      throttledFunction(callback);
      throttledFunction(callback);
      throttledFunction(callback);

      // Assert
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should batch operations', async () => {
      // Arrange
      const operation = jest.fn().mockResolvedValue('result');
      const items = [1, 2, 3, 4, 5];

      // Act
      const results = await repositoryUtilities.batch(items, operation, 2);

      // Assert
      expect(results).toHaveLength(5);
      expect(results.every(result => result === 'result')).toBe(true);
      expect(operation).toHaveBeenCalledTimes(5);
    });
  });

  describe('Security Utilities', () => {
    it('should hash strings', () => {
      // Arrange
      const input = 'password123';
      const salt = 'random_salt';

      // Act
      const hash = repositoryUtilities.hash(input, salt);

      // Assert
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(input);
      expect(hash).not.toContain(input);
    });

    it('should generate secure tokens', () => {
      // Act
      const token1 = repositoryUtilities.generateToken(32);
      const token2 = repositoryUtilities.generateToken(32);

      // Assert
      expect(token1).toHaveLength(32);
      expect(token2).toHaveLength(32);
      expect(token1).not.toBe(token2);
      expect(token1).toMatch(/^[a-zA-Z0-9]+$/);
    });

    it('should compare strings securely', () => {
      // Arrange
      const string1 = 'password123';
      const string2 = 'password123';
      const string3 = 'different_password';

      // Act & Assert
      expect(repositoryUtilities.secureCompare(string1, string2)).toBe(true);
      expect(repositoryUtilities.secureCompare(string1, string3)).toBe(false);
    });

    it('should mask sensitive data', () => {
      // Arrange
      const sensitiveData = {
        creditCard: '4111111111111111',
        ssn: '123-45-6789',
        email: 'john@example.com',
        password: 'secret123',
      };

      // Act
      const masked = repositoryUtilities.maskSensitiveData(sensitiveData);

      // Assert
      expect(masked.creditCard).toBe('4111********1111');
      expect(masked.ssn).toBe('123-**-6789');
      expect(masked.email).toBe('j***@example.com');
      expect(masked.password).toBe('******');
    });
  });
});
