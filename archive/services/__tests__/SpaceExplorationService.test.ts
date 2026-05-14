/**
 * Space Exploration Service Tests
 */

import { SpaceExplorationService } from '../SpaceExplorationService';
import { Logger } from '../../logging/Logger';

describe('SpaceExplorationService', () => {
  let service: SpaceExplorationService;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;
    service = new SpaceExplorationService(mockLogger);
  });

  describe('initialization', () => {
    it('should create service instance', () => {
      expect(service).toBeDefined();
    });
  });

  describe('mission planning', () => {
    it('should plan mission', async () => {
      const config = {
        name: 'Mars Rover Mission',
        destination: 'Mars',
        duration: 365,
        crew_size: 0
      };
      const result = await service.planMission(config);
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });
});
