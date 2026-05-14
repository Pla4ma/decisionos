/**
 * NotificationRepository Tests
 * 
 * Comprehensive test suite for NotificationRepository functionality including
 * CRUD operations, notification delivery, preferences, and business logic.
 */

import { NotificationRepository } from '../repositories/NotificationRepository';
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

describe('NotificationRepository', () => {
  let notificationRepository: NotificationRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    notificationRepository = new NotificationRepository(mockDbConnection, mockCacheManager, mockLogger);
  });

  describe('Basic CRUD Operations', () => {
    it('should create a new notification', async () => {
      // Arrange
      const notificationData = {
        userId: 'user-123',
        type: 'system',
        title: 'Test Notification',
        message: 'This is a test notification',
        channels: ['email', 'push'],
        priority: 'normal',
        data: { action: 'test' },
      };

      const mockResult = {
        rows: [{
          id: 'notification-123',
          user_id: 'user-123',
          type: 'system',
          title: 'Test Notification',
          message: 'This is a test notification',
          channels: JSON.stringify(['email', 'push']),
          priority: 'normal',
          status: 'pending',
          data: JSON.stringify({ action: 'test' }),
          metadata: JSON.stringify({ source: 'notification_repository' }),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await notificationRepository.create(notificationData);

      // Assert
      expect(result).toBeDefined();
      expect(result.userId).toBe(notificationData.userId);
      expect(result.title).toBe(notificationData.title);
      expect(result.message).toBe(notificationData.message);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO notifications'),
        expect.arrayContaining([
          notificationData.userId,
          notificationData.type,
          notificationData.title,
          notificationData.message,
          JSON.stringify(notificationData.channels),
          notificationData.priority,
          JSON.stringify(notificationData.data),
        ])
      );
    });

    it('should find notification by ID', async () => {
      // Arrange
      const notificationId = 'notification-123';
      const mockResult = {
        rows: [{
          id: notificationId,
          user_id: 'user-123',
          type: 'system',
          title: 'Test Notification',
          message: 'This is a test notification',
          channels: JSON.stringify(['email', 'push']),
          priority: 'normal',
          status: 'pending',
          data: JSON.stringify({ action: 'test' }),
          metadata: JSON.stringify({ source: 'notification_repository' }),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await notificationRepository.findById(notificationId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(notificationId);
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        expect.stringContaining('findById'),
        notificationId
      );
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should return null when notification not found', async () => {
      // Arrange
      const notificationId = 'nonexistent-notification';
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await notificationRepository.findById(notificationId);

      // Assert
      expect(result).toBeNull();
    });

    it('should update notification information', async () => {
      // Arrange
      const notificationId = 'notification-123';
      const updates = {
        status: 'sent',
        sentAt: new Date(),
      };

      const mockResult = {
        rows: [{
          id: notificationId,
          user_id: 'user-123',
          type: 'system',
          title: 'Test Notification',
          message: 'This is a test notification',
          status: 'sent',
          sent_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await notificationRepository.update(notificationId, updates);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(updates.status);
      expect(mockCacheManager.delete).toHaveBeenCalled();
    });

    it('should delete notification', async () => {
      // Arrange
      const notificationId = 'notification-123';
      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      const result = await notificationRepository.delete(notificationId);

      // Assert
      expect(result).toBe(true);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        'DELETE FROM notifications WHERE id = $1',
        [notificationId]
      );
      expect(mockCacheManager.delete).toHaveBeenCalled();
    });
  });

  describe('Business Logic Methods', () => {
    it('should find notifications by user', async () => {
      // Arrange
      const userId = 'user-123';
      const options = {
        limit: 10,
        offset: 0,
        unreadOnly: false,
      };

      const mockResult = {
        rows: [{
          id: 'notification-123',
          user_id: userId,
          type: 'system',
          title: 'Test Notification',
          message: 'This is a test notification',
          status: 'pending',
          created_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await notificationRepository.findByUser(userId, options);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].userId).toBe(userId);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1'),
        expect.arrayContaining([userId, options.limit, options.offset])
      );
    });

    it('should mark notification as read', async () => {
      // Arrange
      const notificationId = 'notification-123';
      const mockResult = {
        rows: [{
          id: notificationId,
          user_id: 'user-123',
          type: 'system',
          title: 'Test Notification',
          message: 'This is a test notification',
          status: 'read',
          read_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await notificationRepository.markAsRead(notificationId);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('read');
      expect(result.readAt).toBeDefined();
    });

    it('should mark multiple notifications as read', async () => {
      // Arrange
      const notificationIds = ['notification-1', 'notification-2', 'notification-3'];
      const mockResult = {
        rowCount: 3,
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await notificationRepository.markMultipleAsRead(notificationIds);

      // Assert
      expect(result).toBe(3);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE notifications'),
        expect.arrayContaining([notificationIds])
      );
    });

    it('should get unread notification count for user', async () => {
      // Arrange
      const userId = 'user-123';
      const mockResult = {
        rows: [{
          count: '5',
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await notificationRepository.getUnreadCount(userId);

      // Assert
      expect(result).toBe(5);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count'),
        [userId]
      );
    });

    it('should get user notification preferences', async () => {
      // Arrange
      const userId = 'user-123';
      const mockResult = {
        rows: [{
          user_id: userId,
          preferences: JSON.stringify({
            email: true,
            push: false,
            sms: true,
            marketing: false,
            system: true,
          }),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await notificationRepository.getUserPreferences(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(true);
      expect(result.push).toBe(false);
      expect(result.sms).toBe(true);
    });

    it('should update user notification preferences', async () => {
      // Arrange
      const userId = 'user-123';
      const preferences = {
        email: false,
        push: true,
        sms: false,
        marketing: true,
        system: false,
      };

      const mockResult = {
        rows: [{
          user_id: userId,
          preferences: JSON.stringify(preferences),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await notificationRepository.updateUserPreferences(userId, preferences);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(preferences.email);
      expect(result.push).toBe(preferences.push);
    });

    it('should get scheduled notifications', async () => {
      // Arrange
      const mockResult = {
        rows: [{
          id: 'notification-123',
          user_id: 'user-123',
          type: 'system',
          title: 'Scheduled Notification',
          message: 'This is a scheduled notification',
          status: 'scheduled',
          scheduled_at: new Date(Date.now() + 60000), // 1 minute from now
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await notificationRepository.getScheduledNotifications();

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].status).toBe('scheduled');
    });

    it('should update delivery status', async () => {
      // Arrange
      const notificationId = 'notification-123';
      const channel = 'email';
      const status = 'delivered';
      const details = {
        messageId: 'msg-123',
        deliveredAt: new Date(),
      };

      const mockResult = {
        rows: [{
          id: notificationId,
          user_id: 'user-123',
          type: 'system',
          title: 'Test Notification',
          delivery_details: JSON.stringify({
            email: {
              status: 'delivered',
              messageId: 'msg-123',
              deliveredAt: new Date(),
            },
          }),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await notificationRepository.updateDeliveryStatus(notificationId, channel, status, details);

      // Assert
      expect(result).toBeDefined();
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE notifications'),
        expect.arrayContaining([
          JSON.stringify(details),
          notificationId,
        ])
      );
    });

    it('should get notification statistics', async () => {
      // Arrange
      const mockResult = {
        rows: [{
          total_notifications: 1000,
          notifications_by_type: { system: 400, marketing: 300, security: 200, social: 100 },
          notifications_by_status: { pending: 50, sent: 800, read: 100, failed: 50 },
          notifications_by_channel: { email: 600, push: 300, sms: 100 },
          delivery_rate: 95.5,
          read_rate: 85.2,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await notificationRepository.getNotificationStats();

      // Assert
      expect(result).toBeDefined();
      expect(result.totalNotifications).toBe(1000);
      expect(result.deliveryRate).toBe(95.5);
      expect(result.readRate).toBe(85.2);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should validate notification data before creation', async () => {
      // Arrange
      const invalidNotificationData = {
        userId: '',
        type: '',
        title: '',
        message: '',
        channels: [],
        priority: '',
      };

      // Act & Assert
      await expect(notificationRepository.create(invalidNotificationData)).rejects.toThrow('User ID is required');
    });

    it('should validate notification type', async () => {
      // Arrange
      const invalidNotificationData = {
        userId: 'user-123',
        type: 'invalid_type',
        title: 'Test Notification',
        message: 'This is a test notification',
        channels: ['email'],
        priority: 'normal',
      };

      // Act & Assert
      await expect(notificationRepository.create(invalidNotificationData)).rejects.toThrow('Invalid notification type');
    });

    it('should validate notification channels', async () => {
      // Arrange
      const invalidNotificationData = {
        userId: 'user-123',
        type: 'system',
        title: 'Test Notification',
        message: 'This is a test notification',
        channels: ['invalid_channel'],
        priority: 'normal',
      };

      // Act & Assert
      await expect(notificationRepository.create(invalidNotificationData)).rejects.toThrow('Invalid notification channel');
    });

    it('should validate notification priority', async () => {
      // Arrange
      const invalidNotificationData = {
        userId: 'user-123',
        type: 'system',
        title: 'Test Notification',
        message: 'This is a test notification',
        channels: ['email'],
        priority: 'invalid_priority',
      };

      // Act & Assert
      await expect(notificationRepository.create(invalidNotificationData)).rejects.toThrow('Invalid notification priority');
    });

    it('should validate message length', async () => {
      // Arrange
      const invalidNotificationData = {
        userId: 'user-123',
        type: 'system',
        title: 'Test Notification',
        message: 'a'.repeat(1001), // Too long
        channels: ['email'],
        priority: 'normal',
      };

      // Act & Assert
      await expect(notificationRepository.create(invalidNotificationData)).rejects.toThrow('Message too long');
    });
  });

  describe('Caching', () => {
    it('should cache find by ID results', async () => {
      // Arrange
      const notificationId = 'notification-123';
      const mockResult = {
        rows: [{
          id: notificationId,
          user_id: 'user-123',
          type: 'system',
          title: 'Test Notification',
          message: 'This is a test notification',
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await notificationRepository.findById(notificationId);

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
      const notificationId = 'notification-123';
      const cachedNotification = {
        id: notificationId,
        userId: 'user-123',
        type: 'system',
        title: 'Test Notification',
        message: 'This is a test notification',
        status: 'pending',
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(cachedNotification);

      // Act
      const result = await notificationRepository.findById(notificationId);

      // Assert
      expect(result).toEqual(cachedNotification);
      expect(mockDbConnection.query).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('cache_hit'),
        expect.any(Object)
      );
    });

    it('should clear cache on update', async () => {
      // Arrange
      const notificationId = 'notification-123';
      const updates = { status: 'read' };
      const mockResult = {
        rows: [{
          id: notificationId,
          user_id: 'user-123',
          type: 'system',
          title: 'Test Notification',
          status: 'read',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await notificationRepository.update(notificationId, updates);

      // Assert
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        expect.stringContaining('findById'),
        notificationId
      );
    });

    it('should clear cache on mark as read', async () => {
      // Arrange
      const notificationId = 'notification-123';
      const mockResult = {
        rows: [{
          id: notificationId,
          user_id: 'user-123',
          type: 'system',
          title: 'Test Notification',
          status: 'read',
          read_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await notificationRepository.markAsRead(notificationId);

      // Assert
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        expect.stringContaining('findById'),
        notificationId
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      const notificationId = 'notification-123';
      const dbError = new Error('Database connection failed');
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockRejectedValue(dbError);

      // Act & Assert
      await expect(notificationRepository.findById(notificationId)).rejects.toThrow('Database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({
          notificationId,
          error: dbError.message,
        })
      );
    });

    it('should handle validation errors gracefully', async () => {
      // Arrange
      const invalidNotificationData = {
        userId: '',
        type: '',
        title: '',
        message: '',
        channels: [],
        priority: '',
      };

      // Act & Assert
      await expect(notificationRepository.create(invalidNotificationData)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });

    it('should handle cache errors gracefully', async () => {
      // Arrange
      const notificationId = 'notification-123';
      const cacheError = new Error('Cache service unavailable');
      mockCacheManager.get = jest.fn().mockRejectedValue(cacheError);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act & Assert
      await expect(notificationRepository.findById(notificationId)).resolves.toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({
          notificationId,
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
          id: `notification-${i}`,
          user_id: `user-${i}`,
          type: 'system',
          title: `Notification ${i}`,
          message: `This is notification ${i}`,
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date(),
        })),
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(largeResult);

      // Act
      const startTime = Date.now();
      const result = await notificationRepository.findMany({ limit: 1000 });
      const endTime = Date.now();

      // Assert
      expect(result.data).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should use parameterized queries for security', async () => {
      // Arrange
      const notificationId = "notification-123'; DROP TABLE notifications; --";
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      await notificationRepository.findById(notificationId);

      // Assert
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM notifications WHERE id = $1'),
        [notificationId]
      );
    });

    it('should use indexes for efficient queries', async () => {
      // Arrange
      const userId = 'user-123';
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      await notificationRepository.findByUser(userId);

      // Assert
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1'),
        expect.arrayContaining([userId])
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values gracefully', async () => {
      // Arrange
      const notificationId = 'notification-123';
      const mockResult = {
        rows: [{
          id: notificationId,
          user_id: 'user-123',
          type: 'system',
          title: 'Test Notification',
          message: 'This is a test notification',
          scheduled_at: null,
          sent_at: null,
          read_at: null,
          expires_at: null,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await notificationRepository.findById(notificationId);

      // Assert
      expect(result).toBeDefined();
      expect(result.scheduledAt).toBeNull();
      expect(result.sentAt).toBeNull();
      expect(result.readAt).toBeNull();
      expect(result.expiresAt).toBeNull();
    });

    it('should handle empty result sets', async () => {
      // Arrange
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await notificationRepository.findById('nonexistent');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle concurrent operations', async () => {
      // Arrange
      const notificationId = 'notification-123';
      const updates = { status: 'read' };
      const mockResult = {
        rows: [{
          id: notificationId,
          user_id: 'user-123',
          type: 'system',
          title: 'Test Notification',
          status: 'read',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const promises = Array.from({ length: 10 }, () => 
        notificationRepository.update(notificationId, updates)
      );
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.status).toBe('read');
      });
    });

    it('should handle special characters in messages', async () => {
      // Arrange
      const notificationData = {
        userId: 'user-123',
        type: 'system',
        title: 'Special Characters',
        message: 'This message contains special chars: äöü ñ ç é à ê î ô û',
        channels: ['email'],
        priority: 'normal',
      };

      const mockResult = {
        rows: [{
          id: 'notification-123',
          user_id: 'user-123',
          type: 'system',
          title: 'Special Characters',
          message: notificationData.message,
          channels: JSON.stringify(['email']),
          priority: 'normal',
          status: 'pending',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await notificationRepository.create(notificationData);

      // Assert
      expect(result).toBeDefined();
      expect(result.message).toBe(notificationData.message);
    });
  });
});
