/**
 * Advanced Materials Service Tests
 */

import { AdvancedMaterialsService } from '../AdvancedMaterialsService';
import { Logger } from '../../logging/Logger';

describe('AdvancedMaterialsService', () => {
  let service: AdvancedMaterialsService;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;
    service = new AdvancedMaterialsService(mockLogger);
  });

  describe('initialization', () => {
    it('should create service instance', () => {
      expect(service).toBeDefined();
    });
  });

  describe('composite material design', () => {
    it('should design composite material', async () => {
      const config = {
        name: 'Carbon Fiber Composite',
        type: 'fiber_reinforced' as const,
        components: [
          { material: 'carbon_fiber', percentage: 60 },
          { material: 'epoxy_resin', percentage: 40 }
        ],
        properties: {
          tensile_strength: 1500,
          compressive_strength: 1200,
          density: 1.6,
          thermal_stability: 300
        }
      };
      const material = await service.designCompositeMaterial(config);
      expect(material).toBeDefined();
      expect(material.name).toBe('Carbon Fiber Composite');
    });
  });

  describe('smart material development', () => {
    it('should develop smart material', async () => {
      const config = {
        name: 'Shape Memory Alloy',
        category: 'responsive' as const,
        stimuli: ['temperature', 'magnetic_field'],
        response_type: 'shape_change',
        efficiency: 95
      };
      const material = await service.developSmartMaterial(config);
      expect(material).toBeDefined();
      expect(material.name).toBe('Shape Memory Alloy');
    });
  });

  describe('metamaterial design', () => {
    it('should design metamaterial', async () => {
      const config = {
        name: 'Negative Index Metamaterial',
        type: 'electromagnetic' as const,
        unit_cell: {
          geometry: 'split_ring_resonator',
          size: { x: 100, y: 100, z: 10 },
          materials: ['copper', 'dielectric']
        },
        properties: {
          negative_refractive_index: true,
          band_gap: { start: 1e9, end: 10e9 }
        }
      };
      const material = await service.designMetamaterial(config);
      expect(material).toBeDefined();
      expect(material.name).toBe('Negative Index Metamaterial');
    });
  });

  describe('nanomaterial synthesis', () => {
    it('should synthesize nanomaterial', async () => {
      const config = {
        name: 'Graphene Nanoplatelets',
        material_type: 'graphene' as const,
        synthesis_method: 'chemical_vapor_deposition',
        parameters: {
          temperature: 1000,
          pressure: 1e-6,
          duration: 3600,
          catalyst: 'copper_foil'
        },
        quality_targets: {
          layer_count: { min: 1, max: 5 },
          defect_density: { max: 0.001 }
        }
      };
      const material = await service.synthesizeNanomaterial(config);
      expect(material).toBeDefined();
      expect(material.name).toBe('Graphene Nanoplatelets');
    });
  });

  describe('material characterization', () => {
    it('should characterize material', async () => {
      const config = {
        sample: {
          id: 'sample-123',
          material_id: 'material-456',
          name: 'Test Sample',
          dimensions: { length: 10, width: 10, height: 1 },
          preparation_method: 'cutting',
          preparation_date: new Date()
        },
        techniques: [
          {
            name: 'X-ray Diffraction',
            type: 'structural',
            parameters: { scan_range: { start: 10, end: 80 }, step_size: 0.02 },
            priority: 1
          },
          {
            name: 'SEM Imaging',
            type: 'morphological',
            parameters: { magnification: 10000, voltage: 15 },
            priority: 2
          }
        ]
      };
      const result = await service.characterizeMaterial(config);
      expect(result).toBeDefined();
      expect(result.sample.id).toBe('sample-123');
    });
  });
});
