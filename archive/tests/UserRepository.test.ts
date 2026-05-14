/**
 * UserRepository Tests
 * 
 * Comprehensive test suite for UserRepository functionality including
 * CRUD operations, caching, validation, and business logic.
 */

import { UserRepository } from '../repositories/UserRepository';
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

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository(mockDbConnection, mockCacheManager, mockLogger);
  });

  describe('Basic CRUD Operations', () => {
    it('should create a new user', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedPassword',
        role: 'user',
        isActive: true,
      };

      const mockResult = {
        rows: [{
          id: 'user-123',
          email: 'test@example.com',
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
          password: 'hashedPassword',
          role: 'user',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await userRepository.create(userData);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(result.username).toBe(userData.username);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining([
          userData.email,
          userData.username,
          userData.firstName,
          userData.lastName,
          userData.password,
          userData.role,
          userData.isActive,
        ])
      );
    });

    it('should find user by ID', async () => {
      // Arrange
      const userId = 'user-123';
      const mockResult = {
        rows: [{
          id: userId,
          email: 'test@example.com',
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
          role: 'user',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await userRepository.findById(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        expect.stringContaining('findById'),
        userId
      );
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = 'nonexistent-user';
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await userRepository.findById(userId);

      // Assert
      expect(result).toBeNull();
    });

    it('should update user information', async () => {
      // Arrange
      const userId = 'user-123';
      const updates = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const mockResult = {
        rows: [{
          id: userId,
          email: 'test@example.com',
          username: 'testuser',
          first_name: 'Updated',
          last_name: 'Name',
          role: 'user',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await userRepository.update(userId, updates);

      // Assert
      expect(result).toBeDefined();
      expect(result.firstName).toBe(updates.firstName);
      expect(result.lastName).toBe(updates.lastName);
      expect(mockCacheManager.delete).toHaveBeenCalled();
    });

    it('should delete user', async () => {
      // Arrange
      const userId = 'user-123';
      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      const result = await userRepository.delete(userId);

      // Assert
      expect(result).toBe(true);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        'DELETE FROM users WHERE id = $1',
        [userId]
      );
      expect(mockCacheManager.delete).toHaveBeenCalled();
    });
  });

  describe('Business Logic Methods', () => {
    it('should find user by email', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockResult = {
        rows: [{
          id: 'user-123',
          email: email,
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
          role: 'user',
          is_active: true,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await userRepository.findByEmail(email);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(email);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE email = $1'),
        [email]
      );
    });

    it('should find user by username', async () => {
      // Arrange
      const username = 'testuser';
      const mockResult = {
        rows: [{
          id: 'user-123',
          email: 'test@example.com',
          username: username,
          first_name: 'Test',
          last_name: 'User',
          role: 'user',
          is_active: true,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await userRepository.findByUsername(username);

      // Assert
      expect(result).toBeDefined();
      expect(result.username).toBe(username);
    });

    it('should update user login information', async () => {
      // Arrange
      const userId = 'user-123';
      const loginData = {
        lastLoginAt: new Date(),
        loginCount: 5,
        ipAddress: '192.168.1.1',
      };

      const mockResult = {
        rows: [{
          id: userId,
          email: 'test@example.com',
          username: 'testuser',
          last_login_at: loginData.lastLoginAt,
          login_count: 5,
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await userRepository.updateLogin(userId, loginData);

      // Assert
      expect(result).toBeDefined();
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        expect.arrayContaining([
          loginData.lastLoginAt,
          loginData.loginCount,
          loginData.ipAddress,
          userId,
        ])
      );
    });

    it('should verify user email', async () => {
      // Arrange
      const userId = 'user-123';
      const mockResult = {
        rows: [{
          id: userId,
          email: 'test@example.com',
          username: 'testuser',
          email_verified: true,
          email_verified_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await userRepository.verifyEmail(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.emailVerified).toBe(true);
      expect(mockCacheManager.delete).toHaveBeenCalled();
    });

    it('should deactivate user', async () => {
      // Arrange
      const userId = 'user-123';
      const reason = 'User request';
      const mockResult = {
        rows: [{
          id: userId,
          email: 'test@example.com',
          username: 'testuser',
          is_active: false,
          deactivated_at: new Date(),
          deactivation_reason: reason,
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await userRepository.deactivateUser(userId, reason);

      // Assert
      expect(result).toBeDefined();
      expect(result.isActive).toBe(false);
      expect(result.deactivationReason).toBe(reason);
    });

    it('should update user role', async () => {
      // Arrange
      const userId = 'user-123';
      const newRole = 'admin';
      const mockResult = {
        rows: [{
          id: userId,
          email: 'test@example.com',
          username: 'testuser',
          role: newRole,
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await userRepository.updateRole(userId, newRole);

      // Assert
      expect(result).toBeDefined();
      expect(result.role).toBe(newRole);
    });

    it('should search users', async () => {
      // Arrange
      const searchTerm = 'test';
      const filters = {
        role: 'user',
        isActive: true,
      };
      const options = {
        limit: 10,
        offset: 0,
      };

      const mockResult = {
        rows: [{
          id: 'user-123',
          email: 'test@example.com',
          username: 'testuser',
          role: 'user',
          is_active: true,
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await userRepository.searchUsers(searchTerm, filters, options);

      // Assert
      expect(result.data).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        expect.arrayContaining([
          `%${searchTerm}%`,
          filters.role,
          filters.isActive,
          options.limit,
          options.offset,
        ])
      );
    });

    it('should get user statistics', async () => {
      // Arrange
      const mockResult = {
        rows: [{
          total_users: 100,
          active_users: 85,
          verified_users: 70,
          users_by_role: { user: 80, admin: 15, moderator: 5 },
          recent_registrations: 10,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await userRepository.getUserStats();

      // Assert
      expect(result).toBeDefined();
      expect(result.totalUsers).toBe(100);
      expect(result.activeUsers).toBe(85);
      expect(result.verifiedUsers).toBe(70);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should validate user data before creation', async () => {
      // Arrange
      const invalidUserData = {
        email: 'invalid-email',
        username: '',
        firstName: '',
        lastName: '',
        password: '',
      };

      // Act & Assert
      await expect(userRepository.create(invalidUserData)).rejects.toThrow('User email is required');
    });

    it('should validate email format', async () => {
      // Arrange
      const invalidUserData = {
        email: 'invalid-email-format',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedPassword',
      };

      // Act & Assert
      await expect(userRepository.create(invalidUserData)).rejects.toThrow('Invalid email format');
    });

    it('should validate username length', async () => {
      // Arrange
      const invalidUserData = {
        email: 'test@example.com',
        username: 'ab', // Too short
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedPassword',
      };

      // Act & Assert
      await expect(userRepository.create(invalidUserData)).rejects.toThrow('Username must be at least 3 characters');
    });

    it('should validate password strength', async () => {
      // Arrange
      const invalidUserData = {
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        password: 'weak', // Too short and weak
      };

      // Act & Assert
      await expect(userRepository.create(invalidUserData)).rejects.toThrow('Password must be at least 8 characters');
    });
  });

  describe('Caching', () => {
    it('should cache find by ID results', async () => {
      // Arrange
      const userId = 'user-123';
      const mockResult = {
        rows: [{
          id: userId,
          email: 'test@example.com',
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
          role: 'user',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await userRepository.findById(userId);

      // Assert
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('findById'),
        expect.any(Object),
        expect.any(Number)
      );
    });

    it('should return cached results when available', async () => {
      // Arrange
      const userId = 'user-123';
      const cachedUser = {
        id: userId,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        isActive: true,
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(cachedUser);

      // Act
      const result = await userRepository.findById(userId);

      // Assert
      expect(result).toEqual(cachedUser);
      expect(mockDbConnection.query).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('cache_hit'),
        expect.any(Object)
      );
    });

    it('should clear cache on update', async () => {
      // Arrange
      const userId = 'user-123';
      const updates = { firstName: 'Updated' };
      const mockResult = {
        rows: [{
          id: userId,
          email: 'test@example.com',
          username: 'testuser',
          first_name: 'Updated',
          last_name: 'User',
          role: 'user',
          is_active: true,
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await userRepository.update(userId, updates);

      // Assert
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        expect.stringContaining('findById'),
        userId
      );
    });

    it('should clear cache on delete', async () => {
      // Arrange
      const userId = 'user-123';
      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      await userRepository.delete(userId);

      // Assert
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        expect.stringContaining('findById'),
        userId
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      const userId = 'user-123';
      const dbError = new Error('Database connection failed');
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockRejectedValue(dbError);

      // Act & Assert
      await expect(userRepository.findById(userId)).rejects.toThrow('Database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({
          userId,
          error: dbError.message,
        })
      );
    });

    it('should handle validation errors gracefully', async () => {
      // Arrange
      const invalidUserData = {
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        password: '',
      };

      // Act & Assert
      await expect(userRepository.create(invalidUserData)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });

    it('should handle cache errors gracefully', async () => {
      // Arrange
      const userId = 'user-123';
      const cacheError = new Error('Cache service unavailable');
      mockCacheManager.get = jest.fn().mockRejectedValue(cacheError);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act & Assert
      await expect(userRepository.findById(userId)).resolves.toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({
          userId,
          error: cacheError.message,
        })
      );
    });
  });

  describe('Performance', () => {
    it('should handle large result sets efficiently', async () => {
      // Arrange
      const largeResult = {
        rows: Array.from({ length: 1000 }, (_, i) => ({
          id: `user-${i}`,
          email: `user${i}@example.com`,
          username: `user${i}`,
          first_name: `User${i}`,
          last_name: 'Test',
          role: 'user',
          is_active: true,
        })),
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(largeResult);

      // Act
      const startTime = Date.now();
      const result = await userRepository.findMany({ limit: 1000 });
      const endTime = Date.now();

      // Assert
      expect(result.data).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should use prepared statements for security', async () => {
      // Arrange
      const userId = "user-123'; DROP TABLE users; --";
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      await userRepository.findById(userId);

      // Assert
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users WHERE id = $1'),
        [userId]
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values gracefully', async () => {
      // Arrange
      const userId = 'user-123';
      const mockResult = {
        rows: [{
          id: userId,
          email: 'test@example.com',
          username: 'testuser',
          first_name: null,
          last_name: null,
          phone: null,
          avatar_url: null,
          role: 'user',
          is_active: true,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await userRepository.findById(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.firstName).toBeNull();
      expect(result.lastName).toBeNull();
      expect(result.phone).toBeNull();
      expect(result.avatarUrl).toBeNull();
    });

    it('should handle empty result sets', async () => {
      // Arrange
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await userRepository.findById('nonexistent');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle concurrent operations', async () => {
      // Arrange
      const userId = 'user-123';
      const updates = { firstName: 'Concurrent' };
      const mockResult = {
        rows: [{
          id: userId,
          email: 'test@example.com',
          username: 'testuser',
          first_name: 'Concurrent',
          last_name: 'User',
          role: 'user',
          is_active: true,
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const promises = Array.from({ length: 10 }, () => 
        userRepository.update(userId, updates)
      );
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.firstName).toBe('Concurrent');
      });
    });
  });
});
