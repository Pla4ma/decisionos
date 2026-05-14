/**
 * Virtual Reality Service Tests
 */

import { VirtualRealityService } from '../VirtualRealityService';
import { Logger } from '../../logging/Logger';

describe('VirtualRealityService', () => {
  let service: VirtualRealityService;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;
    service = new VirtualRealityService(mockLogger);
  });

  describe('initialization', () => {
    it('should create service instance', () => {
      expect(service).toBeDefined();
    });
  });

  describe('VR environment', () => {
    it('should create VR environment', async () => {
      const config = {
        name: 'Training Simulation',
        type: 'training' as const,
        scenes: ['classroom', 'lab', 'field']
      };
      const result = await service.createEnvironment(config);
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });
});
