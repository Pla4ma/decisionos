/**
 * RepositoryConfiguration Tests
 * 
 * Comprehensive test suite for RepositoryConfiguration functionality including
 * configuration management, environment settings, feature flags, and dynamic configuration.
 */

import { RepositoryConfiguration } from '../repositories/RepositoryConfiguration';
import { Logger } from '../logging/Logger';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

describe('RepositoryConfiguration', () => {
  let repositoryConfiguration: RepositoryConfiguration;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryConfiguration = new RepositoryConfiguration(mockLogger);
  });

  describe('Configuration Management', () => {
    it('should load configuration from file', async () => {
      // Arrange
      const configPath = './config/repository.json';
      const expectedConfig = {
        database: {
          host: 'localhost',
          port: 5432,
          database: 'vex_app',
        },
        cache: {
          host: 'localhost',
          port: 6379,
          ttl: 3600,
        },
        logging: {
          level: 'info',
          format: 'json',
        },
      };

      // Act
      const config = await repositoryConfiguration.loadConfiguration(configPath);

      // Assert
      expect(config).toBeDefined();
      expect(config.database).toBeDefined();
      expect(config.cache).toBeDefined();
      expect(config.logging).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('configuration_loaded', expect.objectContaining({
        path: configPath,
      }));
    });

    it('should save configuration to file', async () => {
      // Arrange
      const configPath = './config/repository.json';
      const config = {
        database: {
          host: 'localhost',
          port: 5432,
          database: 'vex_app',
        },
        cache: {
          host: 'localhost',
          port: 6379,
          ttl: 3600,
        },
      };

      // Act
      const result = await repositoryConfiguration.saveConfiguration(configPath, config);

      // Assert
      expect(result).toBeDefined();
      expect(result.path).toBe(configPath);
      expect(result.saved).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('configuration_saved', expect.objectContaining({
        path: configPath,
      }));
    });

    it('should merge configuration objects', () => {
      // Arrange
      const baseConfig = {
        database: {
          host: 'localhost',
          port: 5432,
          database: 'vex_app',
        },
        cache: {
          host: 'localhost',
          port: 6379,
        },
        logging: {
          level: 'info',
        },
      };

      const overrideConfig = {
        database: {
          host: 'production-db.example.com',
          port: 5432,
        },
        cache: {
          ttl: 7200,
        },
        logging: {
          format: 'json',
        },
        features: {
          newFeature: true,
        },
      };

      // Act
      const merged = repositoryConfiguration.mergeConfigurations(baseConfig, overrideConfig);

      // Assert
      expect(merged).toBeDefined();
      expect(merged.database.host).toBe('production-db.example.com');
      expect(merged.database.port).toBe(5432);
      expect(merged.database.database).toBe('vex_app');
      expect(merged.cache.host).toBe('localhost');
      expect(merged.cache.port).toBe(6379);
      expect(merged.cache.ttl).toBe(7200);
      expect(merged.logging.level).toBe('info');
      expect(merged.logging.format).toBe('json');
      expect(merged.features.newFeature).toBe(true);
    });

    it('should validate configuration schema', () => {
      // Arrange
      const config = {
        database: {
          host: 'localhost',
          port: 5432,
          database: 'vex_app',
        },
        cache: {
          host: 'localhost',
          port: 6379,
          ttl: 3600,
        },
      };

      const schema = {
        type: 'object',
        required: ['database', 'cache'],
        properties: {
          database: {
            type: 'object',
            required: ['host', 'port', 'database'],
            properties: {
              host: { type: 'string' },
              port: { type: 'number', minimum: 1, maximum: 65535 },
              database: { type: 'string' },
            },
          },
          cache: {
            type: 'object',
            required: ['host', 'port'],
            properties: {
              host: { type: 'string' },
              port: { type: 'number', minimum: 1, maximum: 65535 },
              ttl: { type: 'number', minimum: 0 },
            },
          },
        },
      };

      // Act
      const validation = repositoryConfiguration.validateConfiguration(config, schema);

      // Assert
      expect(validation).toBeDefined();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect configuration errors', () => {
      // Arrange
      const invalidConfig = {
        database: {
          host: 'localhost',
          port: 70000, // Invalid port
          // Missing required database field
        },
        cache: {
          host: 'localhost',
          port: 6379,
          ttl: -100, // Invalid TTL
        },
      };

      const schema = {
        type: 'object',
        required: ['database', 'cache'],
        properties: {
          database: {
            type: 'object',
            required: ['host', 'port', 'database'],
            properties: {
              host: { type: 'string' },
              port: { type: 'number', minimum: 1, maximum: 65535 },
              database: { type: 'string' },
            },
          },
          cache: {
            type: 'object',
            required: ['host', 'port'],
            properties: {
              host: { type: 'string' },
              port: { type: 'number', minimum: 1, maximum: 65535 },
              ttl: { type: 'number', minimum: 0 },
            },
          },
        },
      };

      // Act
      const validation = repositoryConfiguration.validateConfiguration(invalidConfig, schema);

      // Assert
      expect(validation).toBeDefined();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(3);
      expect(validation.errors[0]).toContain('database');
      expect(validation.errors[1]).toContain('port');
      expect(validation.errors[2]).toContain('ttl');
    });
  });

  describe('Environment Configuration', () => {
    it('should load environment-specific configuration', async () => {
      // Arrange
      const environment = 'production';
      const baseConfig = {
        database: {
          host: 'localhost',
          port: 5432,
          database: 'vex_app',
        },
        cache: {
          host: 'localhost',
          port: 6379,
          ttl: 3600,
        },
      };

      const environmentConfigs = {
        development: {
          database: {
            host: 'dev-db.example.com',
            database: 'vex_app_dev',
          },
          logging: {
            level: 'debug',
          },
        },
        staging: {
          database: {
            host: 'staging-db.example.com',
            database: 'vex_app_staging',
          },
          cache: {
            ttl: 1800,
          },
        },
        production: {
          database: {
            host: 'prod-db.example.com',
            database: 'vex_app_prod',
            ssl: true,
          },
          cache: {
            host: 'prod-cache.example.com',
            ttl: 7200,
          },
          logging: {
            level: 'warn',
          },
        },
      };

      // Act
      const config = repositoryConfiguration.loadEnvironmentConfiguration(
        environment,
        baseConfig,
        environmentConfigs
      );

      // Assert
      expect(config).toBeDefined();
      expect(config.database.host).toBe('prod-db.example.com');
      expect(config.database.database).toBe('vex_app_prod');
      expect(config.database.ssl).toBe(true);
      expect(config.cache.host).toBe('prod-cache.example.com');
      expect(config.cache.ttl).toBe(7200);
      expect(config.logging.level).toBe('warn');
    });

    it('should override configuration with environment variables', () => {
      // Arrange
      const baseConfig = {
        database: {
          host: 'localhost',
          port: 5432,
          database: 'vex_app',
        },
        cache: {
          host: 'localhost',
          port: 6379,
          ttl: 3600,
        },
      };

      const envVars = {
        'VEX_DB_HOST': 'env-db.example.com',
        'VEX_DB_PORT': '5433',
        'VEX_CACHE_HOST': 'env-cache.example.com',
        'VEX_CACHE_TTL': '7200',
      };

      // Act
      const config = repositoryConfiguration.overrideWithEnvironmentVariables(baseConfig, envVars);

      // Assert
      expect(config).toBeDefined();
      expect(config.database.host).toBe('env-db.example.com');
      expect(config.database.port).toBe(5433);
      expect(config.database.database).toBe('vex_app'); // Unchanged
      expect(config.cache.host).toBe('env-cache.example.com');
      expect(config.cache.ttl).toBe(7200);
    });

    it('should validate environment configuration', () => {
      // Arrange
      const environment = 'production';
      const config = {
        database: {
          host: 'prod-db.example.com',
          port: 5432,
          database: 'vex_app_prod',
          ssl: true,
        },
        cache: {
          host: 'prod-cache.example.com',
          port: 6379,
          ttl: 7200,
        },
        logging: {
          level: 'warn',
        },
      };

      const validationRules = {
        production: {
          required: ['database.ssl', 'logging.level'],
          forbidden: ['logging.debug'],
          values: {
            'logging.level': ['warn', 'error'],
            'cache.ttl': { min: 3600 },
          },
        },
      };

      // Act
      const validation = repositoryConfiguration.validateEnvironmentConfiguration(
        environment,
        config,
        validationRules
      );

      // Assert
      expect(validation).toBeDefined();
      expect(validation.environment).toBe('production');
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect environment configuration issues', () => {
      // Arrange
      const environment = 'production';
      const invalidConfig = {
        database: {
          host: 'prod-db.example.com',
          port: 5432,
          database: 'vex_app_prod',
          // Missing required ssl field
        },
        cache: {
          host: 'prod-cache.example.com',
          port: 6379,
          ttl: 1800, // Too low for production
        },
        logging: {
          level: 'debug', // Not allowed in production
          debug: true, // Forbidden in production
        },
      };

      const validationRules = {
        production: {
          required: ['database.ssl', 'logging.level'],
          forbidden: ['logging.debug'],
          values: {
            'logging.level': ['warn', 'error'],
            'cache.ttl': { min: 3600 },
          },
        },
      };

      // Act
      const validation = repositoryConfiguration.validateEnvironmentConfiguration(
        environment,
        invalidConfig,
        validationRules
      );

      // Assert
      expect(validation).toBeDefined();
      expect(validation.environment).toBe('production');
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(4);
    });
  });

  describe('Feature Flags', () => {
    it('should enable and disable feature flags', () => {
      // Arrange
      const featureFlags = {
        newUserInterface: false,
        advancedSearch: true,
        realTimeUpdates: false,
        betaFeatures: false,
      };

      // Act
      repositoryConfiguration.setFeatureFlags(featureFlags);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('feature_flags_updated', expect.objectContaining({
        flags: featureFlags,
      }));
    });

    it('should check if feature flag is enabled', () => {
      // Arrange
      const featureFlags = {
        newUserInterface: true,
        advancedSearch: false,
        realTimeUpdates: true,
        betaFeatures: false,
      };

      repositoryConfiguration.setFeatureFlags(featureFlags);

      // Act
      const newUserInterfaceEnabled = repositoryConfiguration.isFeatureEnabled('newUserInterface');
      const advancedSearchEnabled = repositoryConfiguration.isFeatureEnabled('advancedSearch');
      const realTimeUpdatesEnabled = repositoryConfiguration.isFeatureEnabled('realTimeUpdates');
      const betaFeaturesEnabled = repositoryConfiguration.isFeatureEnabled('betaFeatures');

      // Assert
      expect(newUserInterfaceEnabled).toBe(true);
      expect(advancedSearchEnabled).toBe(false);
      expect(realTimeUpdatesEnabled).toBe(true);
      expect(betaFeaturesEnabled).toBe(false);
    });

    it('should get all enabled features', () => {
      // Arrange
      const featureFlags = {
        newUserInterface: true,
        advancedSearch: false,
        realTimeUpdates: true,
        betaFeatures: false,
        darkMode: true,
      };

      repositoryConfiguration.setFeatureFlags(featureFlags);

      // Act
      const enabledFeatures = repositoryConfiguration.getEnabledFeatures();

      // Assert
      expect(enabledFeatures).toEqual(['newUserInterface', 'realTimeUpdates', 'darkMode']);
    });

    it('should load feature flags from configuration', async () => {
      // Arrange
      const config = {
        features: {
          newUserInterface: true,
          advancedSearch: false,
          realTimeUpdates: true,
          betaFeatures: false,
        },
      };

      // Act
      await repositoryConfiguration.loadFeatureFlagsFromConfig(config);

      // Assert
      expect(repositoryConfiguration.isFeatureEnabled('newUserInterface')).toBe(true);
      expect(repositoryConfiguration.isFeatureEnabled('advancedSearch')).toBe(false);
      expect(repositoryConfiguration.isFeatureEnabled('realTimeUpdates')).toBe(true);
      expect(repositoryConfiguration.isFeatureEnabled('betaFeatures')).toBe(false);
    });

    it('should handle feature flag inheritance', () => {
      // Arrange
      const globalFlags = {
        newUserInterface: true,
        advancedSearch: false,
        realTimeUpdates: true,
      };

      const userFlags = {
        advancedSearch: true, // Override global
        betaFeatures: true, // User-specific
      };

      // Act
      repositoryConfiguration.setFeatureFlags(globalFlags);
      repositoryConfiguration.setUserFeatureFlags('user123', userFlags);

      const userNewUserInterface = repositoryConfiguration.isUserFeatureEnabled('user123', 'newUserInterface');
      const userAdvancedSearch = repositoryConfiguration.isUserFeatureEnabled('user123', 'advancedSearch');
      const userRealTimeUpdates = repositoryConfiguration.isUserFeatureEnabled('user123', 'realTimeUpdates');
      const userBetaFeatures = repositoryConfiguration.isUserFeatureEnabled('user123', 'betaFeatures');

      // Assert
      expect(userNewUserInterface).toBe(true); // Inherited from global
      expect(userAdvancedSearch).toBe(true); // User override
      expect(userRealTimeUpdates).toBe(true); // Inherited from global
      expect(userBetaFeatures).toBe(true); // User-specific
    });
  });

  describe('Dynamic Configuration', () => {
    it('should watch configuration changes', async () => {
      // Arrange
      const configPath = './config/repository.json';
      const callback = jest.fn();

      // Act
      const watcher = repositoryConfiguration.watchConfiguration(configPath, callback);

      // Simulate configuration change
      await new Promise(resolve => setTimeout(resolve, 100));

      // Assert
      expect(watcher).toBeDefined();
      expect(watcher.active).toBe(true);
      expect(watcher.path).toBe(configPath);
    });

    it('should reload configuration on change', async () => {
      // Arrange
      const configPath = './config/repository.json';
      const initialConfig = {
        database: {
          host: 'localhost',
          port: 5432,
        },
      };

      const updatedConfig = {
        database: {
          host: 'new-host.example.com',
          port: 5432,
        },
      };

      // Act
      await repositoryConfiguration.loadConfiguration(configPath);
      const reloaded = await repositoryConfiguration.reloadConfiguration(configPath);

      // Assert
      expect(reloaded).toBeDefined();
      expect(reloaded.reloaded).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('configuration_reloaded', expect.objectContaining({
        path: configPath,
      }));
    });

    it('should validate configuration on reload', async () => {
      // Arrange
      const configPath = './config/repository.json';
      const schema = {
        type: 'object',
        required: ['database'],
        properties: {
          database: {
            type: 'object',
            required: ['host', 'port'],
          },
        },
      };

      const invalidConfig = {
        database: {
          host: 'localhost',
          // Missing required port
        },
      };

      // Act
      const validation = await repositoryConfiguration.validateAndReloadConfiguration(configPath, schema);

      // Assert
      expect(validation).toBeDefined();
      expect(validation.reloaded).toBe(false);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toHaveLength(1);
    });

    it('should handle configuration hot-reload', async () => {
      // Arrange
      const configPath = './config/repository.json';
      const hotReloadConfig = {
        enabled: true,
        debounceMs: 1000,
        validateOnReload: true,
        backupOnFailure: true,
      };

      // Act
      const hotReload = repositoryConfiguration.enableHotReload(configPath, hotReloadConfig);

      // Assert
      expect(hotReload).toBeDefined();
      expect(hotReload.enabled).toBe(true);
      expect(hotReload.debounceMs).toBe(1000);
      expect(hotReload.validateOnReload).toBe(true);
      expect(hotReload.backupOnFailure).toBe(true);
    });
  });

  describe('Configuration Templates', () => {
    it('should create configuration from template', () => {
      // Arrange
      const template = {
        database: {
          host: '${DB_HOST}',
          port: '${DB_PORT}',
          database: '${DB_NAME}',
        },
        cache: {
          host: '${CACHE_HOST}',
          port: '${CACHE_PORT}',
          ttl: '${CACHE_TTL}',
        },
        logging: {
          level: '${LOG_LEVEL}',
          format: '${LOG_FORMAT}',
        },
      };

      const variables = {
        DB_HOST: 'localhost',
        DB_PORT: '5432',
        DB_NAME: 'vex_app',
        CACHE_HOST: 'localhost',
        CACHE_PORT: '6379',
        CACHE_TTL: '3600',
        LOG_LEVEL: 'info',
        LOG_FORMAT: 'json',
      };

      // Act
      const config = repositoryConfiguration.createFromTemplate(template, variables);

      // Assert
      expect(config).toBeDefined();
      expect(config.database.host).toBe('localhost');
      expect(config.database.port).toBe('5432');
      expect(config.database.database).toBe('vex_app');
      expect(config.cache.host).toBe('localhost');
      expect(config.cache.port).toBe('6379');
      expect(config.cache.ttl).toBe('3600');
      expect(config.logging.level).toBe('info');
      expect(config.logging.format).toBe('json');
    });

    it('should validate template variables', () => {
      // Arrange
      const template = {
        database: {
          host: '${DB_HOST}',
          port: '${DB_PORT}',
          database: '${DB_NAME}',
        },
        cache: {
          host: '${CACHE_HOST}',
          port: '${CACHE_PORT}',
        },
      };

      const variables = {
        DB_HOST: 'localhost',
        DB_PORT: '5432',
        // Missing DB_NAME
        CACHE_HOST: 'localhost',
        CACHE_PORT: '6379',
        EXTRA_VAR: 'unused',
      };

      // Act
      const validation = repositoryConfiguration.validateTemplateVariables(template, variables);

      // Assert
      expect(validation).toBeDefined();
      expect(validation.isValid).toBe(false);
      expect(validation.missingVariables).toContain('DB_NAME');
      expect(validation.unusedVariables).toContain('EXTRA_VAR');
    });

    it('should generate configuration template', () => {
      // Arrange
      const config = {
        database: {
          host: 'localhost',
          port: 5432,
          database: 'vex_app',
        },
        cache: {
          host: 'localhost',
          port: 6379,
          ttl: 3600,
        },
        logging: {
          level: 'info',
          format: 'json',
        },
      };

      const templateOptions = {
        extractVariables: true,
        includeDefaults: true,
        includeComments: true,
      };

      // Act
      const template = repositoryConfiguration.generateTemplate(config, templateOptions);

      // Assert
      expect(template).toBeDefined();
      expect(template.database.host).toBe('${DB_HOST}');
      expect(template.database.port).toBe('${DB_PORT}');
      expect(template.database.database).toBe('${DB_NAME}');
      expect(template.cache.host).toBe('${CACHE_HOST}');
      expect(template.cache.port).toBe('${CACHE_PORT}');
      expect(template.cache.ttl).toBe('${CACHE_TTL}');
    });
  });

  describe('Configuration Security', () => {
    it('should encrypt sensitive configuration values', () => {
      // Arrange
      const config = {
        database: {
          host: 'localhost',
          port: 5432,
          password: 'secret123',
        },
        api: {
          key: 'api-key-secret',
          secret: 'api-secret-value',
        },
        cache: {
          host: 'localhost',
          port: 6379,
        },
      };

      const encryptionConfig = {
        algorithm: 'aes-256-gcm',
        key: 'encryption-key-123',
        fields: ['database.password', 'api.key', 'api.secret'],
      };

      // Act
      const encrypted = repositoryConfiguration.encryptSensitiveFields(config, encryptionConfig);

      // Assert
      expect(encrypted).toBeDefined();
      expect(encrypted.database.host).toBe('localhost');
      expect(encrypted.database.port).toBe(5432);
      expect(encrypted.database.password).not.toBe('secret123');
      expect(encrypted.database.password).toMatch(/^encrypted:/);
      expect(encrypted.api.key).not.toBe('api-key-secret');
      expect(encrypted.api.key).toMatch(/^encrypted:/);
      expect(encrypted.api.secret).not.toBe('api-secret-value');
      expect(encrypted.api.secret).toMatch(/^encrypted:/);
    });

    it('should decrypt sensitive configuration values', () => {
      // Arrange
      const encryptedConfig = {
        database: {
          host: 'localhost',
          port: 5432,
          password: 'encrypted:encrypted-value-123',
        },
        api: {
          key: 'encrypted:encrypted-api-key',
          secret: 'encrypted:encrypted-api-secret',
        },
        cache: {
          host: 'localhost',
          port: 6379,
        },
      };

      const decryptionConfig = {
        algorithm: 'aes-256-gcm',
        key: 'encryption-key-123',
        fields: ['database.password', 'api.key', 'api.secret'],
      };

      // Act
      const decrypted = repositoryConfiguration.decryptSensitiveFields(encryptedConfig, decryptionConfig);

      // Assert
      expect(decrypted).toBeDefined();
      expect(decrypted.database.host).toBe('localhost');
      expect(decrypted.database.port).toBe(5432);
      expect(decrypted.database.password).toBe('secret123');
      expect(decrypted.api.key).toBe('api-key-secret');
      expect(decrypted.api.secret).toBe('api-secret-value');
    });

    it('should mask sensitive values in logs', () => {
      // Arrange
      const config = {
        database: {
          host: 'localhost',
          port: 5432,
          password: 'secret123',
        },
        api: {
          key: 'api-key-secret',
          secret: 'api-secret-value',
        },
      };

      const maskingConfig = {
        fields: ['password', 'key', 'secret'],
        maskChar: '*',
        showLast: 4,
      };

      // Act
      const masked = repositoryConfiguration.maskSensitiveFields(config, maskingConfig);

      // Assert
      expect(masked).toBeDefined();
      expect(masked.database.host).toBe('localhost');
      expect(masked.database.port).toBe(5432);
      expect(masked.database.password).toBe('*******123');
      expect(masked.api.key).toBe('********cret');
      expect(masked.api.secret).toBe('********lue');
    });

    it('should validate configuration security', () => {
      // Arrange
      const config = {
        database: {
          host: 'localhost',
          port: 5432,
          password: 'secret123',
        },
        api: {
          key: 'api-key-secret',
          secret: 'api-secret-value',
        },
      };

      const securityRules = {
        requireEncryption: ['database.password', 'api.key', 'api.secret'],
        minLength: {
          'database.password': 8,
          'api.key': 10,
          'api.secret': 12,
        },
        noPlainText: ['password', 'key', 'secret'],
      };

      // Act
      const validation = repositoryConfiguration.validateConfigurationSecurity(config, securityRules);

      // Assert
      expect(validation).toBeDefined();
      expect(validation.secure).toBe(false);
      expect(validation.violations).toHaveLength(3);
      expect(validation.violations[0]).toContain('encryption');
      expect(validation.violations[1]).toContain('plain text');
    });
  });

  describe('Configuration Analytics', () => {
    it('should track configuration changes', () => {
      // Arrange
      const change = {
        path: 'database.host',
        oldValue: 'localhost',
        newValue: 'prod-db.example.com',
        timestamp: new Date(),
        userId: 'admin',
        reason: 'Production deployment',
      };

      // Act
      repositoryConfiguration.trackConfigurationChange(change);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('configuration_change_tracked', expect.objectContaining({
        path: 'database.host',
        oldValue: 'localhost',
        newValue: 'prod-db.example.com',
        userId: 'admin',
      }));
    });

    it('should generate configuration audit report', () => {
      // Arrange
      const auditConfig = {
        timeRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-31'),
        },
        includeChanges: true,
        includeAccess: true,
        includeSecurity: true,
      };

      // Act
      const report = repositoryConfiguration.generateConfigurationAuditReport(auditConfig);

      // Assert
      expect(report).toBeDefined();
      expect(report.timeRange).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.changes).toBeDefined();
      expect(report.access).toBeDefined();
      expect(report.security).toBeDefined();
    });

    it('should analyze configuration usage', () => {
      // Arrange
      const usageConfig = {
        metrics: [
          'feature_flag_usage',
          'configuration_access',
          'reload_frequency',
          'error_rate',
        ],
        timeRange: {
          start: new Date('2023-01-15'),
          end: new Date('2023-01-22'),
        },
        granularity: 'daily',
      };

      // Act
      const analysis = repositoryConfiguration.analyzeConfigurationUsage(usageConfig);

      // Assert
      expect(analysis).toBeDefined();
      expect(analysis.metrics).toEqual(['feature_flag_usage', 'configuration_access', 'reload_frequency', 'error_rate']);
      expect(analysis.timeRange).toBeDefined();
      expect(analysis.granularity).toBe('daily');
      expect(analysis.results).toBeDefined();
    });

    it('should identify configuration drift', () => {
      // Arrange
      const expectedConfig = {
        database: {
          host: 'localhost',
          port: 5432,
          database: 'vex_app',
        },
        cache: {
          host: 'localhost',
          port: 6379,
          ttl: 3600,
        },
      };

      const actualConfig = {
        database: {
          host: 'localhost',
          port: 5433, // Drift detected
          database: 'vex_app',
        },
        cache: {
          host: 'localhost',
          port: 6379,
          ttl: 7200, // Drift detected
        },
        logging: { // Extra configuration
          level: 'info',
        },
      };

      // Act
      const drift = repositoryConfiguration.identifyConfigurationDrift(expectedConfig, actualConfig);

      // Assert
      expect(drift).toBeDefined();
      expect(drift.hasDrift).toBe(true);
      expect(drift.differences).toHaveLength(3);
      expect(drift.differences[0].path).toBe('database.port');
      expect(drift.differences[0].expected).toBe(5432);
      expect(drift.differences[0].actual).toBe(5433);
      expect(drift.differences[1].path).toBe('cache.ttl');
      expect(drift.differences[2].path).toBe('logging');
    });
  });

  describe('Configuration Backup and Restore', () => {
    it('should backup configuration', async () => {
      // Arrange
      const config = {
        database: {
          host: 'localhost',
          port: 5432,
          database: 'vex_app',
        },
        cache: {
          host: 'localhost',
          port: 6379,
          ttl: 3600,
        },
      };

      const backupConfig = {
        path: './backups/config',
        format: 'json',
        compress: true,
        encrypt: false,
      };

      // Act
      const backup = await repositoryConfiguration.backupConfiguration(config, backupConfig);

      // Assert
      expect(backup).toBeDefined();
      expect(backup.path).toContain('./backups/config');
      expect(backup.format).toBe('json');
      expect(backup.compressed).toBe(true);
      expect(backup.encrypted).toBe(false);
      expect(backup.timestamp).toBeDefined();
    });

    it('should restore configuration from backup', async () => {
      // Arrange
      const backupPath = './backups/config/backup-2023-01-15.json.gz';
      const restoreConfig = {
        decrypt: false,
        validateAfterRestore: true,
        mergeWithCurrent: false,
      };

      // Act
      const restore = await repositoryConfiguration.restoreConfiguration(backupPath, restoreConfig);

      // Assert
      expect(restore).toBeDefined();
      expect(restore.path).toBe(backupPath);
      expect(restore.restored).toBe(true);
      expect(restore.validated).toBe(true);
      expect(restore.merged).toBe(false);
    });

    it('should schedule automatic configuration backups', () => {
      // Arrange
      const scheduleConfig = {
        frequency: 'daily',
        time: '02:00',
        retention: 30, // days
        path: './backups/config',
        compress: true,
        encrypt: true,
      };

      // Act
      const schedule = repositoryConfiguration.scheduleConfigurationBackup(scheduleConfig);

      // Assert
      expect(schedule).toBeDefined();
      expect(schedule.frequency).toBe('daily');
      expect(schedule.time).toBe('02:00');
      expect(schedule.retention).toBe(30);
      expect(schedule.enabled).toBe(true);
      expect(schedule.nextBackup).toBeDefined();
    });
  });
});
