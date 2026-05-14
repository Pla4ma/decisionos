/**
 * Holographic Display Service Tests
 */

import { HolographicDisplayService } from '../HolographicDisplayService';
import { Logger } from '../../logging/Logger';

describe('HolographicDisplayService', () => {
  let service: HolographicDisplayService;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;
    service = new HolographicDisplayService(mockLogger, {});
  });

  describe('initialization', () => {
    it('should create service instance', () => {
      expect(service).toBeDefined();
    });
  });

  describe('model loading', () => {
    it('should load 3D model', async () => {
      const modelPath = '/models/test.obj';
      const options = {
        scale: { x: 1, y: 1, z: 1 },
        optimize: true,
        physics: false
      };
      const model = await service.loadModel(modelPath, options);
      expect(model).toBeDefined();
      expect(model.id).toBeDefined();
    });
  });

  describe('scene rendering', () => {
    it('should render holographic scene', async () => {
      const sceneId = 'scene-123';
      const duration = 5000;
      const result = await service.renderScene(sceneId, duration);
      expect(result).toBeDefined();
      expect(result.rendered).toBe(true);
      expect(result.frameCount).toBeDefined();
    });
  });

  describe('gesture handling', () => {
    it('should handle gesture interaction', async () => {
      const gesture = {
        type: 'hand' as const,
        action: 'grab',
        parameters: { hand: 'right', confidence: 0.95 }
      };
      const result = await service.handleGesture(gesture);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('scene export', () => {
    it('should export scene to different formats', async () => {
      const sceneId = 'scene-123';
      const format = 'gltf' as const;
      const result = await service.exportScene(sceneId, format);
      expect(result).toBeDefined();
      expect(result.format).toBe('gltf');
    });
  });
});
