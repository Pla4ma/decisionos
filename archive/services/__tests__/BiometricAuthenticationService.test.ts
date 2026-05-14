/**
 * Biometric Authentication Service Tests
 */

import { BiometricAuthenticationService } from '../BiometricAuthenticationService';
import { Logger } from '../../logging/Logger';

describe('BiometricAuthenticationService', () => {
  let service: BiometricAuthenticationService;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;
    service = new BiometricAuthenticationService(mockLogger);
  });

  describe('initialization', () => {
    it('should create service instance', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with custom configuration', () => {
      const customService = new BiometricAuthenticationService(mockLogger, {
        riskThreshold: 0.8,
        antiSpoofing: {
          enabled: true,
          methods: ['liveness', 'depth'],
          sensitivity: 0.9,
          adaptiveThreshold: true,
        },
      });
      expect(customService).toBeDefined();
    });
  });

  describe('biometric enrollment', () => {
    it('should enroll fingerprint', async () => {
      const userId = 'user-123';
      const biometricData = 'fingerprint_scan_data';
      const template = await service.enrollBiometric(userId, 'fingerprint', biometricData);
      expect(template).toBeDefined();
      expect(template.userId).toBe(userId);
      expect(template.type).toBe('fingerprint');
    });

    it('should enroll face', async () => {
      const userId = 'user-123';
      const biometricData = 'face_scan_data';
      const template = await service.enrollBiometric(userId, 'face', biometricData);
      expect(template).toBeDefined();
      expect(template.userId).toBe(userId);
      expect(template.type).toBe('face');
    });

    it('should enroll voice', async () => {
      const userId = 'user-123';
      const biometricData = 'voice_sample';
      const template = await service.enrollBiometric(userId, 'voice', biometricData);
      expect(template).toBeDefined();
      expect(template.userId).toBe(userId);
      expect(template.type).toBe('voice');
    });
  });

  describe('authentication', () => {
    it('should authenticate with fingerprint', async () => {
      const biometricData = 'fingerprint_scan_data';
      const result = await service.authenticate('fingerprint', biometricData);
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(result.confidence).toBeDefined();
      expect(result.attempt).toBeDefined();
    });

    it('should authenticate with face', async () => {
      const biometricData = 'face_scan_data';
      const result = await service.authenticate('face', biometricData);
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(result.confidence).toBeDefined();
    });

    it('should authenticate with voice', async () => {
      const biometricData = 'voice_sample';
      const result = await service.authenticate('voice', biometricData);
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(result.confidence).toBeDefined();
    });

    it('should authenticate multimodal', async () => {
      const biometrics = [
        { type: 'fingerprint' as const, data: 'fingerprint_data' },
        { type: 'face' as const, data: 'face_data' },
      ];
      const result = await service.authenticateMultimodal(biometrics);
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(result.confidence).toBeDefined();
    });
  });

  describe('behavioral profiling', () => {
    it('should update behavioral profile', async () => {
      const userId = 'user-123';
      const behaviorData = {
        typing: { speed: 60, rhythm: 0.8, errors: 0.1 },
        mouse: { movement: 100, clicks: 5, scroll: 3 },
        gesture: { speed: 80, pressure: 0.7, trajectory: 0.9 },
      };
      const result = await service.updateBehavioralProfile(userId, behaviorData);
      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
    });
  });

  describe('template management', () => {
    it('should remove template', async () => {
      const templateId = 'template-123';
      await expect(service.removeTemplate(templateId)).resolves.not.toThrow();
    });
  });
});
