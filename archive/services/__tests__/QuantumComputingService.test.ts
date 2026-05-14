/**
 * Quantum Computing Service Tests
 */

import { QuantumComputingService } from '../QuantumComputingService';
import { Logger } from '../../logging/Logger';

describe('QuantumComputingService', () => {
  let service: QuantumComputingService;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;
    service = new QuantumComputingService(mockLogger);
  });

  describe('initialization', () => {
    it('should create service instance', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with default config', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with custom config', () => {
      const customService = new QuantumComputingService(mockLogger, {
        backend: 'ibmq',
        apiKey: 'test-key',
        maxQubits: 32,
        simulationMode: false
      });
      expect(customService).toBeDefined();
    });
  });

  describe('quantum circuits', () => {
    it('should create quantum circuit', () => {
      const gates = [
        { type: 'H' as const, targets: [0] },
        { type: 'CNOT' as const, targets: [1], controls: [0] }
      ];
      const circuit = service.createCircuit(2, gates);
      expect(circuit).toBeDefined();
      expect(circuit.qubits).toBe(2);
      expect(circuit.gates).toHaveLength(2);
      expect(circuit.depth).toBeGreaterThan(0);
      expect(circuit.fidelity).toBeGreaterThan(0);
    });

    it('should execute quantum circuit', async () => {
      const gates = [
        { type: 'H' as const, targets: [0] },
        { type: 'CNOT' as const, targets: [1], controls: [0] }
      ];
      const circuit = service.createCircuit(2, gates);
      const result = await service.executeCircuit(circuit, 100);
      expect(result).toBeDefined();
      expect(result.circuit).toBeDefined();
      expect(result.measurements).toBeDefined();
      expect(result.probabilities).toBeDefined();
      expect(result.fidelity).toBeGreaterThan(0);
      expect(result.executionTime).toBeGreaterThan(0);
    });
  });

  describe('quantum algorithms', () => {
    it('should solve optimization problem', async () => {
      const problem = {
        variables: 2,
        constraints: [[1, 0], [0, 1]],
        objective: [1, 1],
        type: 'QUBO' as const
      };
      const result = await service.solveOptimizationProblem(problem);
      expect(result).toBeDefined();
      expect(result.solution).toBeDefined();
      expect(result.energy).toBeDefined();
    });

    it('should train quantum ML model', async () => {
      const model = {
        type: 'QNN' as const,
        layers: 2,
        qubits: 4,
        parameters: [0.1, 0.2, 0.3, 0.4],
        accuracy: 0,
        trainingData: [[0, 1], [1, 0]]
      };
      const result = await service.trainQuantumMLModel(model);
      expect(result).toBeDefined();
      expect(result.accuracy).toBeGreaterThan(0);
    });
  });

  describe('quantum simulation', () => {
    it('should simulate quantum system', async () => {
      const system = {
        qubits: 2,
        hamiltonian: 'test_hamiltonian',
        time: 100
      };
      const result = await service.simulateQuantumSystem(system);
      expect(result).toBeDefined();
      expect(result.states).toBeDefined();
      expect(result.energies).toBeDefined();
    });
  });

  describe('quantum error correction', () => {
    it('should apply error correction', async () => {
      const circuit = service.createCircuit(3, [
        { type: 'H' as const, targets: [0] },
        { type: 'CNOT' as const, targets: [1], controls: [0] },
        { type: 'CNOT' as const, targets: [2], controls: [0] }
      ]);
      const result = await service.applyErrorCorrection(circuit);
      expect(result).toBeDefined();
      expect(result.corrected).toBeDefined();
    });
  });

  describe('quantum hardware', () => {
    it('should get quantum hardware info', async () => {
      const info = await service.getQuantumHardwareInfo();
      expect(info).toBeDefined();
      expect(info.available_backends).toBeDefined();
      expect(info.qubit_counts).toBeDefined();
    });
  });
});
