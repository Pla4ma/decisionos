/**
 * SettingsRepository Tests
 * 
 * Comprehensive test suite for SettingsRepository functionality including
 * settings management, user preferences, templates, validation, and audit trails.
 */

import { SettingsRepository } from '../repositories/SettingsRepository';
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

describe('SettingsRepository', () => {
  let settingsRepository: SettingsRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    settingsRepository = new SettingsRepository(mockDbConnection, mockCacheManager, mockLogger);
  });

  describe('Settings Management', () => {
    it('should create setting', async () => {
      // Arrange
      const settingData = {
        key: 'app.theme',
        value: 'dark',
        type: 'string',
        category: 'appearance',
        description: 'Application theme setting',
        isPublic: false,
        validation: {
          type: 'enum',
          values: ['light', 'dark', 'auto'],
          required: true,
        },
        metadata: {
          source: 'user_preference',
          updatedBy: 'user-123',
        },
      };

      const mockResult = {
        rows: [{
          id: 'setting-123',
          key: 'app.theme',
          value: 'dark',
          type: 'string',
          category: 'appearance',
          description: 'Application theme setting',
          is_public: false,
          validation: JSON.stringify(settingData.validation),
          metadata: JSON.stringify(settingData.metadata),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await settingsRepository.createSetting(settingData);

      // Assert
      expect(result).toBeDefined();
      expect(result.key).toBe(settingData.key);
      expect(result.value).toBe(settingData.value);
      expect(result.type).toBe(settingData.type);
      expect(result.category).toBe(settingData.category);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO settings'),
        expect.arrayContaining([
          settingData.key,
          settingData.value,
          settingData.type,
          settingData.category,
          settingData.description,
          settingData.isPublic,
          JSON.stringify(settingData.validation),
          JSON.stringify(settingData.metadata),
        ])
      );
    });

    it('should find setting by key', async () => {
      // Arrange
      const settingKey = 'app.theme';
      const mockResult = {
        rows: [{
          id: 'setting-123',
          key: settingKey,
          value: 'dark',
          type: 'string',
          category: 'appearance',
          description: 'Application theme setting',
          is_public: false,
          validation: JSON.stringify({ type: 'enum', values: ['light', 'dark', 'auto'] }),
          metadata: JSON.stringify({ source: 'user_preference' }),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await settingsRepository.getSetting(settingKey);

      // Assert
      expect(result).toBeDefined();
      expect(result.key).toBe(settingKey);
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        expect.stringContaining('getSetting'),
        settingKey
      );
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should update setting value', async () => {
      // Arrange
      const settingKey = 'app.theme';
      const newValue = 'light';
      const updatedBy = 'user-123';

      const mockResult = {
        rows: [{
          id: 'setting-123',
          key: settingKey,
          value: newValue,
          type: 'string',
          category: 'appearance',
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await settingsRepository.updateSetting(settingKey, newValue, updatedBy);

      // Assert
      expect(result).toBeDefined();
      expect(result.value).toBe(newValue);
      expect(mockCacheManager.delete).toHaveBeenCalled();
    });

    it('should delete setting', async () => {
      // Arrange
      const settingKey = 'app.theme';
      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      const result = await settingsRepository.deleteSetting(settingKey);

      // Assert
      expect(result).toBe(true);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        'DELETE FROM settings WHERE key = $1',
        [settingKey]
      );
      expect(mockCacheManager.delete).toHaveBeenCalled();
    });

    it('should get settings by category', async () => {
      // Arrange
      const category = 'appearance';
      const mockResult = {
        rows: [
          {
            id: 'setting-1',
            key: 'app.theme',
            value: 'dark',
            type: 'string',
            category: category,
            description: 'Application theme setting',
            is_public: false,
          },
          {
            id: 'setting-2',
            key: 'app.font_size',
            value: 'medium',
            type: 'string',
            category: category,
            description: 'Application font size setting',
            is_public: false,
          },
        ],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await settingsRepository.getSettingsByCategory(category);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].category).toBe(category);
      expect(result[1].category).toBe(category);
    });

    it('should get public settings', async () => {
      // Arrange
      const mockResult = {
        rows: [
          {
            id: 'setting-1',
            key: 'app.name',
            value: 'VEX App',
            type: 'string',
            category: 'general',
            description: 'Application name',
            is_public: true,
          },
          {
            id: 'setting-2',
            key: 'app.version',
            value: '1.0.0',
            type: 'string',
            category: 'general',
            description: 'Application version',
            is_public: true,
          },
        ],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await settingsRepository.getPublicSettings();

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].isPublic).toBe(true);
      expect(result[1].isPublic).toBe(true);
    });
  });

  describe('User Preferences', () => {
    it('should create user preference', async () => {
      // Arrange
      const userId = 'user-123';
      const preferenceData = {
        key: 'notifications.email',
        value: true,
        type: 'boolean',
        category: 'notifications',
        metadata: {
          source: 'user_settings',
        },
      };

      const mockResult = {
        rows: [{
          id: 'preference-123',
          user_id: userId,
          key: 'notifications.email',
          value: 'true',
          type: 'boolean',
          category: 'notifications',
          metadata: JSON.stringify(preferenceData.metadata),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await settingsRepository.createUserPreference(userId, preferenceData);

      // Assert
      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.key).toBe(preferenceData.key);
      expect(result.value).toBe('true');
    });

    it('should get user preferences', async () => {
      // Arrange
      const userId = 'user-123';
      const mockResult = {
        rows: [
          {
            id: 'preference-1',
            user_id: userId,
            key: 'notifications.email',
            value: 'true',
            type: 'boolean',
            category: 'notifications',
          },
          {
            id: 'preference-2',
            user_id: userId,
            key: 'theme.mode',
            value: 'dark',
            type: 'string',
            category: 'appearance',
          },
        ],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await settingsRepository.getUserPreferences(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].userId).toBe(userId);
      expect(result[1].userId).toBe(userId);
    });

    it('should update user preference', async () => {
      // Arrange
      const userId = 'user-123';
      const preferenceKey = 'notifications.email';
      const newValue = false;

      const mockResult = {
        rows: [{
          id: 'preference-123',
          user_id: userId,
          key: preferenceKey,
          value: 'false',
          type: 'boolean',
          category: 'notifications',
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await settingsRepository.updateUserPreference(userId, preferenceKey, newValue);

      // Assert
      expect(result).toBeDefined();
      expect(result.value).toBe('false');
      expect(mockCacheManager.delete).toHaveBeenCalled();
    });

    it('should delete user preference', async () => {
      // Arrange
      const userId = 'user-123';
      const preferenceKey = 'notifications.email';
      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      const result = await settingsRepository.deleteUserPreference(userId, preferenceKey);

      // Assert
      expect(result).toBe(true);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        'DELETE FROM user_preferences WHERE user_id = $1 AND key = $2',
        [userId, preferenceKey]
      );
    });

    it('should get user preferences by category', async () => {
      // Arrange
      const userId = 'user-123';
      const category = 'notifications';
      const mockResult = {
        rows: [
          {
            id: 'preference-1',
            user_id: userId,
            key: 'notifications.email',
            value: 'true',
            type: 'boolean',
            category: category,
          },
          {
            id: 'preference-2',
            user_id: userId,
            key: 'notifications.sms',
            value: 'false',
            type: 'boolean',
            category: category,
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await settingsRepository.getUserPreferencesByCategory(userId, category);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].category).toBe(category);
      expect(result[1].category).toBe(category);
    });
  });

  describe('Settings Templates', () => {
    it('should create settings template', async () => {
      // Arrange
      const templateData = {
        name: 'Default User Settings',
        description: 'Default settings for new users',
        category: 'user_defaults',
        settings: [
          {
            key: 'theme.mode',
            value: 'light',
            type: 'string',
            validation: { type: 'enum', values: ['light', 'dark'] },
          },
          {
            key: 'notifications.email',
            value: true,
            type: 'boolean',
          },
        ],
        isDefault: true,
        isActive: true,
        metadata: {
          createdBy: 'admin-123',
        },
      };

      const mockResult = {
        rows: [{
          id: 'template-123',
          name: 'Default User Settings',
          description: 'Default settings for new users',
          category: 'user_defaults',
          settings: JSON.stringify(templateData.settings),
          is_default: true,
          is_active: true,
          metadata: JSON.stringify(templateData.metadata),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await settingsRepository.createTemplate(templateData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(templateData.name);
      expect(result.description).toBe(templateData.description);
      expect(result.isDefault).toBe(templateData.isDefault);
    });

    it('should apply settings template', async () => {
      // Arrange
      const templateId = 'template-123';
      const userId = 'user-123';
      const mockResult = {
        rows: [{
          id: 'template-123',
          name: 'Default User Settings',
          settings: JSON.stringify([
            { key: 'theme.mode', value: 'light', type: 'string' },
            { key: 'notifications.email', value: true, type: 'boolean' },
          ]),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await settingsRepository.applyTemplate(templateId, userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.appliedSettings).toHaveLength(2);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM settings_templates'),
        [templateId]
      );
    });

    it('should get active templates', async () => {
      // Arrange
      const category = 'user_defaults';
      const mockResult = {
        rows: [
          {
            id: 'template-1',
            name: 'Default User Settings',
            description: 'Default settings for new users',
            category: category,
            is_default: true,
            is_active: true,
          },
          {
            id: 'template-2',
            name: 'Power User Settings',
            description: 'Settings for power users',
            category: category,
            is_default: false,
            is_active: true,
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await settingsRepository.getActiveTemplates(category);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].isActive).toBe(true);
      expect(result[1].isActive).toBe(true);
    });
  });

  describe('Settings Validation', () => {
    it('should validate setting value', async () => {
      // Arrange
      const settingKey = 'app.theme';
      const value = 'dark';
      const validationRules = {
        type: 'enum',
        values: ['light', 'dark', 'auto'],
        required: true,
      };

      // Act
      const result = await settingsRepository.validateSettingValue(settingKey, value, validationRules);

      // Assert
      expect(result).toEqual({ valid: true });
    });

    it('should reject invalid setting value', async () => {
      // Arrange
      const settingKey = 'app.theme';
      const value = 'invalid';
      const validationRules = {
        type: 'enum',
        values: ['light', 'dark', 'auto'],
        required: true,
      };

      // Act
      const result = await settingsRepository.validateSettingValue(settingKey, value, validationRules);

      // Assert
      expect(result).toEqual({
        valid: false,
        error: expect.stringContaining('Invalid value'),
      });
    });

    it('should validate required setting', async () => {
      // Arrange
      const settingKey = 'app.name';
      const value = null;
      const validationRules = {
        type: 'string',
        required: true,
        minLength: 1,
      };

      // Act
      const result = await settingsRepository.validateSettingValue(settingKey, value, validationRules);

      // Assert
      expect(result).toEqual({
        valid: false,
        error: expect.stringContaining('required'),
      });
    });

    it('should validate numeric range', async () => {
      // Arrange
      const settingKey = 'app.max_items';
      const value = 150;
      const validationRules = {
        type: 'number',
        min: 1,
        max: 100,
      };

      // Act
      const result = await settingsRepository.validateSettingValue(settingKey, value, validationRules);

      // Assert
      expect(result).toEqual({
        valid: false,
        error: expect.stringContaining('between 1 and 100'),
      });
    });
  });

  describe('Settings Analytics', () => {
    it('should get settings statistics', async () => {
      // Arrange
      const mockResult = {
        rows: [{
          total_settings: 100,
          settings_by_category: { appearance: 20, notifications: 30, security: 25, general: 25 },
          settings_by_type: { string: 40, boolean: 30, number: 20, object: 10 },
          public_settings: 25,
          private_settings: 75,
          total_user_preferences: 5000,
          active_templates: 5,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await settingsRepository.getSettingsStats();

      // Assert
      expect(result).toBeDefined();
      expect(result.totalSettings).toBe(100);
      expect(result.settingsByCategory.appearance).toBe(20);
      expect(result.publicSettings).toBe(25);
      expect(result.totalUserPreferences).toBe(5000);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should get popular settings', async () => {
      // Arrange
      const limit = 10;
      const mockResult = {
        rows: [
          { key: 'theme.mode', usage_count: 4500, category: 'appearance' },
          { key: 'notifications.email', usage_count: 4200, category: 'notifications' },
          { key: 'language.locale', usage_count: 3800, category: 'general' },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await settingsRepository.getPopularSettings(limit);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(3);
      expect(result[0].key).toBe('theme.mode');
      expect(result[0].usageCount).toBe(4500);
    });

    it('should get settings usage trends', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [
          { date: '2023-01-01', total_changes: 50, unique_users: 20 },
          { date: '2023-01-02', total_changes: 45, unique_users: 18 },
          { date: '2023-01-03', total_changes: 60, unique_users: 25 },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await settingsRepository.getSettingsUsageTrends(timeRange);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(3);
      expect(result[0].date).toBe('2023-01-01');
      expect(result[0].totalChanges).toBe(50);
    });
  });

  describe('Audit Trail', () => {
    it('should log setting change', async () => {
      // Arrange
      const auditData = {
        settingKey: 'app.theme',
        oldValue: 'light',
        newValue: 'dark',
        userId: 'user-123',
        action: 'update',
        metadata: {
          source: 'user_settings',
          ipAddress: '192.168.1.1',
        },
      };

      const mockResult = {
        rows: [{
          id: 'audit-123',
          setting_key: 'app.theme',
          old_value: 'light',
          new_value: 'dark',
          user_id: 'user-123',
          action: 'update',
          metadata: JSON.stringify(auditData.metadata),
          timestamp: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await settingsRepository.logSettingChange(auditData);

      // Assert
      expect(result).toBeDefined();
      expect(result.settingKey).toBe(auditData.settingKey);
      expect(result.oldValue).toBe(auditData.oldValue);
      expect(result.newValue).toBe(auditData.newValue);
    });

    it('should get setting history', async () => {
      // Arrange
      const settingKey = 'app.theme';
      const mockResult = {
        rows: [
          {
            id: 'audit-1',
            setting_key: settingKey,
            old_value: 'light',
            new_value: 'dark',
            user_id: 'user-123',
            action: 'update',
            timestamp: new Date('2023-01-15'),
          },
          {
            id: 'audit-2',
            setting_key: settingKey,
            old_value: 'auto',
            new_value: 'light',
            user_id: 'user-123',
            action: 'update',
            timestamp: new Date('2023-01-10'),
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await settingsRepository.getSettingHistory(settingKey);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].settingKey).toBe(settingKey);
      expect(result[0].newValue).toBe('dark');
    });

    it('should get user setting changes', async () => {
      // Arrange
      const userId = 'user-123';
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [
          {
            id: 'audit-1',
            setting_key: 'theme.mode',
            old_value: 'light',
            new_value: 'dark',
            user_id: userId,
            action: 'update',
            timestamp: new Date('2023-01-15'),
          },
          {
            id: 'audit-2',
            setting_key: 'notifications.email',
            old_value: 'true',
            new_value: 'false',
            user_id: userId,
            action: 'update',
            timestamp: new Date('2023-01-20'),
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await settingsRepository.getUserSettingChanges(userId, timeRange);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].userId).toBe(userId);
      expect(result[1].userId).toBe(userId);
    });
  });

  describe('Validation', () => {
    it('should validate setting data', async () => {
      // Arrange
      const invalidSettingData = {
        key: '',
        value: '',
        type: '',
        category: '',
        description: '',
        isPublic: null,
      };

      // Act & Assert
      await expect(settingsRepository.createSetting(invalidSettingData)).rejects.toThrow('Setting key is required');
    });

    it('should validate setting key format', async () => {
      // Arrange
      const invalidSettingData = {
        key: 'invalid-key-format-with-spaces',
        value: 'value',
        type: 'string',
        category: 'test',
        description: 'Test setting',
        isPublic: false,
      };

      // Act & Assert
      await expect(settingsRepository.createSetting(invalidSettingData)).rejects.toThrow('Invalid setting key format');
    });

    it('should validate setting type', async () => {
      // Arrange
      const invalidSettingData = {
        key: 'app.test',
        value: 'value',
        type: 'invalid_type',
        category: 'test',
        description: 'Test setting',
        isPublic: false,
      };

      // Act & Assert
      await expect(settingsRepository.createSetting(invalidSettingData)).rejects.toThrow('Invalid setting type');
    });
  });

  describe('Caching', () => {
    it('should cache setting by key', async () => {
      // Arrange
      const settingKey = 'app.theme';
      const mockResult = {
        rows: [{
          id: 'setting-123',
          key: settingKey,
          value: 'dark',
          type: 'string',
          category: 'appearance',
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await settingsRepository.getSetting(settingKey);

      // Assert
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('getSetting'),
        expect.any(Object),
        expect.any(Number)
      );
    });

    it('should return cached setting', async () => {
      // Arrange
      const settingKey = 'app.theme';
      const cachedSetting = {
        id: 'setting-123',
        key: settingKey,
        value: 'dark',
        type: 'string',
        category: 'appearance',
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(cachedSetting);

      // Act
      const result = await settingsRepository.getSetting(settingKey);

      // Assert
      expect(result).toEqual(cachedSetting);
      expect(mockDbConnection.query).not.toHaveBeenCalled();
    });

    it('should clear cache on setting update', async () => {
      // Arrange
      const settingKey = 'app.theme';
      const newValue = 'light';
      const mockResult = {
        rows: [{
          id: 'setting-123',
          key: settingKey,
          value: newValue,
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await settingsRepository.updateSetting(settingKey, newValue);

      // Assert
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        expect.stringContaining('getSetting'),
        settingKey
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      const settingKey = 'app.theme';
      const dbError = new Error('Database connection failed');
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockRejectedValue(dbError);

      // Act & Assert
      await expect(settingsRepository.getSetting(settingKey)).rejects.toThrow('Database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({
          settingKey,
          error: dbError.message,
        })
      );
    });

    it('should handle validation errors gracefully', async () => {
      // Arrange
      const invalidSettingData = {
        key: '',
        value: '',
        type: '',
        category: '',
        description: '',
        isPublic: null,
      };

      // Act & Assert
      await expect(settingsRepository.createSetting(invalidSettingData)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });
  });

  describe('Performance', () => {
    it('should handle large result sets efficiently', async () => {
      // Arrange
      const largeResult = {
        rows: Array.from({ length: 1000 }, (_, i) => ({
          id: `setting-${i}`,
          key: `app.setting_${i}`,
          value: `value_${i}`,
          type: 'string',
          category: 'test',
          created_at: new Date(),
          updated_at: new Date(),
        })),
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(largeResult);

      // Act
      const startTime = Date.now();
      const result = await settingsRepository.getSettingsByCategory('test');
      const endTime = Date.now();

      // Assert
      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should use parameterized queries for security', async () => {
      // Arrange
      const settingKey = "app.theme'; DROP TABLE settings; --";
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      await settingsRepository.getSetting(settingKey);

      // Assert
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM settings WHERE key = $1'),
        [settingKey]
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values gracefully', async () => {
      // Arrange
      const settingKey = 'app.optional_setting';
      const mockResult = {
        rows: [{
          id: 'setting-123',
          key: settingKey,
          value: null,
          type: 'string',
          category: 'test',
          validation: null,
          metadata: null,
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await settingsRepository.getSetting(settingKey);

      // Assert
      expect(result).toBeDefined();
      expect(result.value).toBeNull();
      expect(result.validation).toBeNull();
      expect(result.metadata).toBeNull();
    });

    it('should handle empty result sets', async () => {
      // Arrange
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await settingsRepository.getSetting('nonexistent');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle concurrent operations', async () => {
      // Arrange
      const settingKey = 'app.concurrent_setting';
      const newValue = 'updated';
      const mockResult = {
        rows: [{
          id: 'setting-123',
          key: settingKey,
          value: newValue,
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const promises = Array.from({ length: 10 }, () => 
        settingsRepository.updateSetting(settingKey, newValue)
      );
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.value).toBe(newValue);
      });
    });
  });
});
