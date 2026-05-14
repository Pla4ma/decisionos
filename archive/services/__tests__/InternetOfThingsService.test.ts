/**
 * Internet of Things Service Tests
 */

import { InternetOfThingsService } from '../InternetOfThingsService';
import { Logger } from '../../logging/Logger';

describe('InternetOfThingsService', () => {
  let service: InternetOfThingsService;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;
    service = new InternetOfThingsService(mockLogger);
  });

  describe('initialization', () => {
    it('should create service instance', () => {
      expect(service).toBeDefined();
    });
  });

  describe('device management', () => {
    it('should register device', async () => {
      const deviceConfig = {
        name: 'Temperature Sensor',
        type: 'sensor' as const,
        category: 'smart_home' as const,
        manufacturer: 'SensorCorp',
        model: 'TC-100',
        location: {
          room: 'living_room',
          zone: 'main_floor',
        },
        connectivity: {
          protocol: 'wifi' as const,
          credentials: { ssid: 'test_wifi' },
        },
        capabilities: ['temperature_reading', 'humidity_reading'],
      };
      const device = await service.registerDevice(deviceConfig);
      expect(device).toBeDefined();
      expect(device.name).toBe('Temperature Sensor');
      expect(device.type).toBe('sensor');
      expect(device.category).toBe('smart_home');
    });

    it('should process sensor data', async () => {
      const deviceId = 'test-device';
      const data = [{
        type: 'temperature' as const,
        value: 25.5,
        unit: 'celsius',
      }];
      const result = await service.processSensorData(deviceId, data);
      expect(result).toBeDefined();
    });
  });

  describe('automation', () => {
    it('should create automation rule', async () => {
      const ruleConfig = {
        name: 'Light Automation',
        description: 'Turn on lights when motion detected',
        triggers: [{
          deviceId: 'motion-sensor',
          type: 'sensor_value' as const,
          conditions: [{
            property: 'motion',
            operator: 'eq' as const,
            value: true,
          }],
        }],
        actions: [{
          deviceId: 'light-1',
          type: 'set_state' as const,
          parameters: { power: 'on' },
        }],
      };
      const rule = await service.createAutomationRule(ruleConfig);
      expect(rule).toBeDefined();
      expect(rule.name).toBe('Light Automation');
    });

    it('should execute automation rule', async () => {
      const ruleId = 'test-rule';
      const execution = await service.executeRule(ruleId);
      expect(execution).toBeDefined();
      expect(typeof execution.success).toBe('boolean');
    });
  });

  describe('scenes', () => {
    it('should create IoT scene', async () => {
      const sceneConfig = {
        name: 'Movie Scene',
        description: 'Dim lights for movie watching',
        devices: [{
          deviceId: 'light-1',
          state: { brightness: 20 },
          transition: 1000,
        }],
        icon: 'movie',
        favorites: false,
      };
      const scene = await service.createScene(sceneConfig);
      expect(scene).toBeDefined();
      expect(scene.name).toBe('Movie Scene');
    });

    it('should activate scene', async () => {
      const sceneId = 'movie-scene';
      const activation = await service.activateScene(sceneId);
      expect(activation).toBeDefined();
      expect(typeof activation.success).toBe('boolean');
    });
  });

  describe('analytics', () => {
    it('should get device analytics', async () => {
      const deviceId = 'test-device';
      const timeframe = {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: new Date(),
      };
      const analytics = await service.getDeviceAnalytics(deviceId, timeframe);
      expect(analytics).toBeDefined();
      expect(analytics.deviceId).toBe(deviceId);
    });
  });

  describe('device operations', () => {
    it('should connect device', async () => {
      const deviceConfig = {
        name: 'Test Device',
        type: 'sensor' as const,
        category: 'smart_home' as const,
        manufacturer: 'TestCorp',
        model: 'TEST-100',
        location: { zone: 'test' },
        connectivity: { protocol: 'wifi' as const },
        capabilities: ['test'],
      };
      const device = await service.registerDevice(deviceConfig);
      await expect(service.connectDevice(device, { protocol: 'wifi' })).resolves.not.toThrow();
    });
  });
});
