/**
 * Biotechnology Service Tests
 */

import { BiotechnologyService } from '../BiotechnologyService';
import { Logger } from '../../logging/Logger';

describe('BiotechnologyService', () => {
  let service: BiotechnologyService;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;
    service = new BiotechnologyService(mockLogger);
  });

  describe('initialization', () => {
    it('should create service instance', () => {
      expect(service).toBeDefined();
    });
  });

  describe('sequence analysis', () => {
    it('should analyze gene sequence', async () => {
      const sequence = 'ATCGATCGATCG';
      const organism = 'homo_sapiens';
      const analysisType = 'basic' as const;
      const result = await service.analyzeSequence(sequence, organism, analysisType);
      expect(result).toBeDefined();
      expect(result.sequence).toBeDefined();
    });
  });

  describe('laboratory management', () => {
    it('should register laboratory', async () => {
      const labConfig = {
        name: 'Genomics Lab',
        type: 'sequencing' as const,
        location: {
          building: 'Research Center',
          floor: 3,
          room: '301'
        }
      };
      const lab = await service.registerLaboratory(labConfig);
      expect(lab).toBeDefined();
      expect(lab.name).toBe('Genomics Lab');
    });
  });

  describe('drug discovery', () => {
    it('should start drug discovery project', async () => {
      const projectConfig = {
        name: 'Cancer Drug Discovery',
        type: 'small_molecule' as const,
        target: {
          name: 'EGFR Kinase',
          type: 'protein',
          id: 'P00533'
        }
      };
      const project = await service.startDrugDiscovery(projectConfig);
      expect(project).toBeDefined();
      expect(project.name).toBe('Cancer Drug Discovery');
    });
  });

  describe('bioinformatics analysis', () => {
    it('should run bioinformatics analysis', async () => {
      const analysisConfig = {
        name: 'Genome Assembly',
        type: 'assembly' as const,
        parameters: {
          kmer_size: 31,
          min_coverage: 5,
          max_bubble_size: 100
        }
      };
      const analysis = await service.runBioinformatics(analysisConfig);
      expect(analysis).toBeDefined();
      expect(analysis.name).toBe('Genome Assembly');
    });
  });

  describe('clinical trials', () => {
    it('should create clinical trial', async () => {
      const trialConfig = {
        name: 'Phase I Oncology Trial',
        phase: 'phase_1' as const,
        type: 'interventional' as const,
        participants: {
          target: 50,
          criteria: ['age_18_65', 'confirmed_diagnosis']
        }
      };
      const trial = await service.createClinicalTrial(trialConfig);
      expect(trial).toBeDefined();
      expect(trial.name).toBe('Phase I Oncology Trial');
    });
  });
});
