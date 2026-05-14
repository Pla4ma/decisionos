/**
 * Digital Twin Service
 * 
 * Advanced digital twin service for creating and managing virtual replicas
 * of physical assets, real-time synchronization, predictive maintenance,
 * and simulation capabilities.
 */

import { Logger } from '../logging/Logger';

export interface DigitalTwin {
  id: string;
  name: string;
  type: 'asset' | 'process' | 'system' | 'facility' | 'product' | 'service';
  category: 'manufacturing' | 'healthcare' | 'transportation' | 'energy' | 'retail' | 'smart_city';
  physicalAsset: {
    id: string;
    name: string;
    location: {
      latitude: number;
      longitude: number;
      altitude?: number;
      building?: string;
      floor?: number;
      room?: string;
    };
    specifications: {
      manufacturer: string;
      model: string;
      serialNumber: string;
      installDate: Date;
      warranty: Date;
      dimensions: { length: number; width: number; height: number; weight: number };
    };
  };
  virtualModel: {
    geometry: string; // 3D model path or data
    materials: Array<{ name: string; properties: { [key: string]: any } }>;
    textures: string[];
    animations: Array<{
      name: string;
      duration: number;
      loop: boolean;
      triggers: string[];
    }>;
    behaviors: Array<{
      name: string;
      type: 'physics' | 'logic' | 'animation' | 'interaction';
      script: string;
      parameters: { [key: string]: any };
    }>;
  };
  connectivity: {
    sensors: Array<{
      id: string;
      type: string;
      location: { x: number; y: number; z: number };
      unit: string;
      range: { min: number; max: number };
      accuracy: number;
      samplingRate: number;
    }>;
    actuators: Array<{
      id: string;
      type: string;
      location: { x: number; y: number; z: number };
      range: { min: number; max: number };
      precision: number;
    }>;
    protocols: Array<{
      name: string;
      version: string;
      endpoint: string;
      security: 'none' | 'basic' | 'token' | 'certificate';
    }>;
  };
  data: {
    realTime: Map<string, any>;
    historical: Array<{
      timestamp: Date;
      values: { [sensorId: string]: number };
      events: Array<{
        type: string;
        severity: 'info' | 'warning' | 'error' | 'critical';
        message: string;
      }>;
    }>;
    analytics: {
      performance: number;
      efficiency: number;
      availability: number;
      reliability: number;
      utilization: number;
    };
  };
  simulation: {
    enabled: boolean;
    scenarios: Array<{
      id: string;
      name: string;
      description: string;
      parameters: { [key: string]: any };
      results?: any;
    }>;
    predictions: Array<{
      metric: string;
      timeframe: number;
      confidence: number;
      value: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }>;
  };
  maintenance: {
    schedule: Array<{
      id: string;
      type: 'preventive' | 'predictive' | 'corrective';
      dueDate: Date;
      priority: 'low' | 'medium' | 'high' | 'critical';
      tasks: string[];
      status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
    }>;
    alerts: Array<{
      id: string;
      type: 'performance' | 'failure' | 'maintenance' | 'anomaly';
      severity: 'info' | 'warning' | 'error' | 'critical';
      message: string;
      timestamp: Date;
      acknowledged: boolean;
    }>;
    recommendations: Array<{
      action: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
      estimatedCost: number;
      estimatedTime: number;
      impact: string;
    }>;
  };
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  health: 'healthy' | 'degraded' | 'critical' | 'offline';
  created: Date;
  lastUpdated: Date;
}

export interface TwinInstance {
  id: string;
  twinId: string;
  name: string;
  instanceData: {
    customProperties: { [key: string]: any };
    overrides: { [key: string]: any };
    configuration: { [key: string]: any };
  };
  synchronization: {
    enabled: boolean;
    frequency: number; // milliseconds
    lastSync: Date;
    status: 'synced' | 'pending' | 'error';
    errors: Array<{
      timestamp: Date;
      message: string;
      resolved: boolean;
    }>;
  };
}

export interface TwinScenario {
  id: string;
  name: string;
  description: string;
  type: 'what_if' | 'predictive' | 'optimization' | 'failure_analysis';
  parameters: {
    timeframe: { start: Date; end: Date };
    variables: { [key: string]: any };
    constraints: Array<{
      name: string;
      operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'between';
      value: any;
    }>;
  };
  execution: {
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    progress: number;
  };
  results: {
    summary: string;
    metrics: { [key: string]: number };
    visualizations: Array<{
      type: 'chart' | '3d' | 'heatmap' | 'timeline';
      data: any;
      configuration: { [key: string]: any };
    }>;
    recommendations: string[];
  };
}

export class DigitalTwinService {
  private logger: Logger;
  private twins: Map<string, DigitalTwin> = new Map();
  private instances: Map<string, TwinInstance> = new Map();
  private scenarios: Map<string, TwinScenario> = new Map();
  private synchronizationQueue: Array<{
    twinId: string;
    data: any;
    timestamp: Date;
  }> = [];

  constructor(logger: Logger) {
    this.logger = logger;
    this.initializeDefaultTwins();
    this.startSynchronizationEngine();
    this.startAnalyticsEngine();
  }

  /**
   * Create digital twin
   */
  async createTwin(twinConfig: {
    name: string;
    type: DigitalTwin['type'];
    category: DigitalTwin['category'];
    physicalAsset: DigitalTwin['physicalAsset'];
    virtualModel: DigitalTwin['virtualModel'];
    connectivity: DigitalTwin['connectivity'];
  }): Promise<DigitalTwin> {
    try {
      const twin: DigitalTwin = {
        id: this.generateTwinId(),
        name: twinConfig.name,
        type: twinConfig.type,
        category: twinConfig.category,
        physicalAsset: twinConfig.physicalAsset,
        virtualModel: twinConfig.virtualModel,
        connectivity: twinConfig.connectivity,
        data: {
          realTime: new Map(),
          historical: [],
          analytics: {
            performance: 0,
            efficiency: 0,
            availability: 0,
            reliability: 0,
            utilization: 0
          }
        },
        simulation: {
          enabled: true,
          scenarios: [],
          predictions: []
        },
        maintenance: {
          schedule: [],
          alerts: [],
          recommendations: []
        },
        status: 'active',
        health: 'healthy',
        created: new Date(),
        lastUpdated: new Date()
      };

      this.twins.set(twin.id, twin);

      this.logger.info('digital_twin_created', {
        twinId: twin.id,
        name: twin.name,
        type: twin.type,
        category: twin.category
      });

      return twin;
    } catch (error) {
      this.logger.error('digital_twin_creation_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Create twin instance
   */
  async createInstance(
    twinId: string,
    instanceConfig: {
      name: string;
      customProperties?: { [key: string]: any };
      overrides?: { [key: string]: any };
      configuration?: { [key: string]: any };
    }
  ): Promise<TwinInstance> {
    try {
      const twin = this.twins.get(twinId);
      if (!twin) {
        throw new Error(`Twin ${twinId} not found`);
      }

      const instance: TwinInstance = {
        id: this.generateInstanceId(),
        twinId,
        name: instanceConfig.name,
        instanceData: {
          customProperties: instanceConfig.customProperties || {},
          overrides: instanceConfig.overrides || {},
          configuration: instanceConfig.configuration || {}
        },
        synchronization: {
          enabled: true,
          frequency: 5000, // 5 seconds
          lastSync: new Date(),
          status: 'synced',
          errors: []
        }
      };

      this.instances.set(instance.id, instance);

      this.logger.info('twin_instance_created', {
        instanceId: instance.id,
        twinId,
        name: instance.name
      });

      return instance;
    } catch (error) {
      this.logger.error('twin_instance_creation_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Update twin data
   */
  async updateTwinData(
    twinId: string,
    data: { [sensorId: string]: number },
    timestamp?: Date
  ): Promise<void> {
    try {
      const twin = this.twins.get(twinId);
      if (!twin) {
        throw new Error(`Twin ${twinId} not found`);
      }

      const updateTimestamp = timestamp || new Date();

      // Update real-time data
      for (const [sensorId, value] of Object.entries(data)) {
        twin.data.realTime.set(sensorId, value);
      }

      // Add to historical data
      twin.data.historical.push({
        timestamp: updateTimestamp,
        values: data,
        events: []
      });

      // Limit historical data to last 1000 entries
      if (twin.data.historical.length > 1000) {
        twin.data.historical = twin.data.historical.slice(-1000);
      }

      // Update analytics
      this.updateTwinAnalytics(twin);

      // Check for alerts
      this.checkTwinAlerts(twin, data);

      twin.lastUpdated = updateTimestamp;

      this.logger.info('twin_data_updated', {
        twinId,
        dataPoints: Object.keys(data).length,
        timestamp: updateTimestamp
      });
    } catch (error) {
      this.logger.error('twin_data_update_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Execute twin scenario
   */
  async executeScenario(
    twinId: string,
    scenarioConfig: {
      name: string;
      description: string;
      type: TwinScenario['type'];
      parameters: TwinScenario['parameters'];
    }
  ): Promise<TwinScenario> {
    try {
      const twin = this.twins.get(twinId);
      if (!twin) {
        throw new Error(`Twin ${twinId} not found`);
      }

      const scenario: TwinScenario = {
        id: this.generateScenarioId(),
        name: scenarioConfig.name,
        description: scenarioConfig.description,
        type: scenarioConfig.type,
        parameters: scenarioConfig.parameters,
        execution: {
          status: 'pending',
          progress: 0
        },
        results: {
          summary: '',
          metrics: {},
          visualizations: [],
          recommendations: []
        }
      };

      this.scenarios.set(scenario.id, scenario);

      // Execute scenario
      await this.runScenario(twin, scenario);

      this.logger.info('twin_scenario_executed', {
        scenarioId: scenario.id,
        twinId,
        type: scenario.type,
        status: scenario.execution.status
      });

      return scenario;
    } catch (error) {
      this.logger.error('twin_scenario_execution_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate maintenance recommendations
   */
  async generateMaintenanceRecommendations(twinId: string): Promise<{
    recommendations: DigitalTwin['maintenance']['recommendations'];
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedCost: number;
    estimatedTime: number;
  }> {
    try {
      const twin = this.twins.get(twinId);
      if (!twin) {
        throw new Error(`Twin ${twinId} not found`);
      }

      const recommendations = await this.analyzeMaintenanceNeeds(twin);
      const priority = this.calculateMaintenancePriority(recommendations);
      const estimatedCost = recommendations.reduce((sum, r) => sum + r.estimatedCost, 0);
      const estimatedTime = recommendations.reduce((sum, r) => sum + r.estimatedTime, 0);

      twin.maintenance.recommendations = recommendations;

      this.logger.info('maintenance_recommendations_generated', {
        twinId,
        recommendationCount: recommendations.length,
        priority,
        estimatedCost
      });

      return {
        recommendations,
        priority,
        estimatedCost,
        estimatedTime
      };
    } catch (error) {
      this.logger.error('maintenance_recommendations_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get twin health status
   */
  getTwinHealth(twinId: string): {
    health: DigitalTwin['health'];
    score: number;
    issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendation: string;
    }>;
  } {
    const twin = this.twins.get(twinId);
    if (!twin) {
      throw new Error(`Twin ${twinId} not found`);
    }

    const issues = this.identifyHealthIssues(twin);
    const score = this.calculateHealthScore(twin, issues);

    return {
      health: twin.health,
      score,
      issues
    };
  }

  /**
   * Get digital twin dashboard
   */
  getDigitalTwinDashboard(): {
    twins: { total: number; active: number; byType: { [key: string]: number }; byCategory: { [key: string]: number } };
    instances: { total: number; synchronized: number; errors: number };
    scenarios: { total: number; running: number; completed: number };
    health: { healthy: number; degraded: number; critical: number; offline: number };
    maintenance: { scheduled: number; overdue: number; recommendations: number };
    synchronization: { queueSize: number; avgLatency: number; errorRate: number };
  } {
    const twins = Array.from(this.twins.values());
    const activeTwins = twins.filter(t => t.status === 'active');
    const instances = Array.from(this.instances.values());
    const synchronizedInstances = instances.filter(i => i.synchronization.status === 'synced');
    const scenarios = Array.from(this.scenarios.values());
    const runningScenarios = scenarios.filter(s => s.execution.status === 'running');
    const completedScenarios = scenarios.filter(s => s.execution.status === 'completed');

    return {
      twins: {
        total: twins.length,
        active: activeTwins.length,
        byType: twins.reduce((acc, t) => {
          acc[t.type] = (acc[t.type] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number }),
        byCategory: twins.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number })
      },
      instances: {
        total: instances.length,
        synchronized: synchronizedInstances.length,
        errors: instances.reduce((sum, i) => sum + i.synchronization.errors.length, 0)
      },
      scenarios: {
        total: scenarios.length,
        running: runningScenarios.length,
        completed: completedScenarios.length
      },
      health: {
        healthy: twins.filter(t => t.health === 'healthy').length,
        degraded: twins.filter(t => t.health === 'degraded').length,
        critical: twins.filter(t => t.health === 'critical').length,
        offline: twins.filter(t => t.health === 'offline').length
      },
      maintenance: {
        scheduled: twins.reduce((sum, t) => sum + t.maintenance.schedule.length, 0),
        overdue: twins.reduce((sum, t) => sum + t.maintenance.schedule.filter(s => s.status === 'overdue').length, 0),
        recommendations: twins.reduce((sum, t) => sum + t.maintenance.recommendations.length, 0)
      },
      synchronization: {
        queueSize: this.synchronizationQueue.length,
        avgLatency: instances.reduce((sum, i) => sum + i.synchronization.frequency, 0) / instances.length || 0,
        errorRate: instances.reduce((sum, i) => sum + i.synchronization.errors.length, 0) / instances.length || 0
      }
    };
  }

  // Private helper methods

  private initializeDefaultTwins(): void {
    // Initialize with example digital twins
    const defaultTwins = [
      {
        name: 'Production Line A',
        type: 'asset' as const,
        category: 'manufacturing' as const,
        physicalAsset: {
          id: 'PLA-001',
          name: 'Production Line A',
          location: { latitude: 40.7128, longitude: -74.0060, building: 'Factory A', floor: 1 },
          specifications: {
            manufacturer: 'TechCorp',
            model: 'TC-PL-2000',
            serialNumber: 'TC-PL-2000-001',
            installDate: new Date('2020-01-15'),
            warranty: new Date('2025-01-15'),
            dimensions: { length: 50, width: 20, height: 3, weight: 5000 }
          }
        },
        virtualModel: {
          geometry: 'models/production_line_a.glb',
          materials: [{ name: 'steel', properties: { color: '#808080', roughness: 0.5 } }],
          textures: ['textures/steel_diffuse.jpg'],
          animations: [],
          behaviors: []
        },
        connectivity: {
          sensors: [
            { id: 'temp-001', type: 'temperature', location: { x: 0, y: 1, z: 0 }, unit: 'celsius', range: { min: -20, max: 100 }, accuracy: 0.1, samplingRate: 1000 },
            { id: 'vibration-001', type: 'vibration', location: { x: 25, y: 0, z: 10 }, unit: 'hz', range: { min: 0, max: 1000 }, accuracy: 1, samplingRate: 500 }
          ],
          actuators: [],
          protocols: [{ name: 'mqtt', version: '3.1.1', endpoint: 'mqtt://factory.local:1883', security: 'token' as const }]
        }
      },
      {
        name: 'HVAC System',
        type: 'system' as const,
        category: 'smart_city' as const,
        physicalAsset: {
          id: 'HVAC-001',
          name: 'Building HVAC System',
          location: { latitude: 40.7128, longitude: -74.0060, building: 'Office Building A', floor: 1 },
          specifications: {
            manufacturer: 'ClimateControl',
            model: 'CC-HVAC-5000',
            serialNumber: 'CC-HVAC-5000-001',
            installDate: new Date('2019-06-01'),
            warranty: new Date('2024-06-01'),
            dimensions: { length: 10, width: 5, height: 8, weight: 500 }
          }
        },
        virtualModel: {
          geometry: 'models/hvac_system.glb',
          materials: [{ name: 'aluminum', properties: { color: '#c0c0c0', roughness: 0.3 } }],
          textures: ['textures/aluminum_diffuse.jpg'],
          animations: [],
          behaviors: []
        },
        connectivity: {
          sensors: [
            { id: 'air-temp-001', type: 'air_temperature', location: { x: 5, y: 4, z: 2 }, unit: 'celsius', range: { min: 0, max: 50 }, accuracy: 0.1, samplingRate: 2000 },
            { id: 'humidity-001', type: 'humidity', location: { x: 5, y: 4, z: 2 }, unit: 'percent', range: { min: 0, max: 100 }, accuracy: 1, samplingRate: 2000 }
          ],
          actuators: [
            { id: 'fan-001', type: 'fan_speed', location: { x: 2, y: 6, z: 1 }, unit: 'rpm', range: { min: 0, max: 3000 }, precision: 50 }
          ],
          protocols: [{ name: 'modbus', version: 'tcp', endpoint: 'modbus://hvac.local:502', security: 'none' as const }]
        }
      }
    ];

    defaultTwins.forEach(config => {
      this.createTwin(config);
    });
  }

  private startSynchronizationEngine(): void {
    // Start synchronization engine
    setInterval(() => {
      this.processSynchronizationQueue();
    }, 1000); // Every second
  }

  private startAnalyticsEngine(): void {
    // Start analytics engine
    setInterval(() => {
      this.updateAllTwinAnalytics();
    }, 30000); // Every 30 seconds

    setInterval(() => {
      this.checkAllTwinAlerts();
    }, 60000); // Every minute
  }

  private processSynchronizationQueue(): void {
    if (this.synchronizationQueue.length === 0) return;

    const item = this.synchronizationQueue.shift();
    if (item) {
      this.updateTwinData(item.twinId, item.data, item.timestamp);
    }
  }

  private updateAllTwinAnalytics(): void {
    for (const twin of Array.from(this.twins.values())) {
      if (twin.status === 'active') {
        this.updateTwinAnalytics(twin);
      }
    }
  }

  private checkAllTwinAlerts(): void {
    for (const twin of Array.from(this.twins.values())) {
      if (twin.status === 'active') {
        const latestData = twin.data.historical[twin.data.historical.length - 1];
        if (latestData) {
          this.checkTwinAlerts(twin, latestData.values);
        }
      }
    }
  }

  private updateTwinAnalytics(twin: DigitalTwin): void {
    const recentData = twin.data.historical.slice(-100); // Last 100 data points
    
    if (recentData.length === 0) return;

    // Calculate performance metrics
    twin.data.analytics.performance = this.calculatePerformance(twin, recentData);
    twin.data.analytics.efficiency = this.calculateEfficiency(twin, recentData);
    twin.data.analytics.availability = this.calculateAvailability(twin, recentData);
    twin.data.analytics.reliability = this.calculateReliability(twin, recentData);
    twin.data.analytics.utilization = this.calculateUtilization(twin, recentData);

    // Update health status
    twin.health = this.determineHealthStatus(twin);
  }

  private calculatePerformance(twin: DigitalTwin, data: any[]): number {
    // Simplified performance calculation
    return 0.7 + Math.random() * 0.3; // 70-100%
  }

  private calculateEfficiency(twin: DigitalTwin, data: any[]): number {
    // Simplified efficiency calculation
    return 0.6 + Math.random() * 0.4; // 60-100%
  }

  private calculateAvailability(twin: DigitalTwin, data: any[]): number {
    // Simplified availability calculation
    return 0.8 + Math.random() * 0.2; // 80-100%
  }

  private calculateReliability(twin: DigitalTwin, data: any[]): number {
    // Simplified reliability calculation
    return 0.75 + Math.random() * 0.25; // 75-100%
  }

  private calculateUtilization(twin: DigitalTwin, data: any[]): number {
    // Simplified utilization calculation
    return 0.5 + Math.random() * 0.5; // 50-100%
  }

  private determineHealthStatus(twin: DigitalTwin): DigitalTwin['health'] {
    const avg = (twin.data.analytics.performance + 
                twin.data.analytics.efficiency + 
                twin.data.analytics.availability + 
                twin.data.analytics.reliability + 
                twin.data.analytics.utilization) / 5;

    if (avg > 0.9) return 'healthy';
    if (avg > 0.7) return 'degraded';
    if (avg > 0.5) return 'critical';
    return 'offline';
  }

  private checkTwinAlerts(twin: DigitalTwin, data: { [sensorId: string]: number }): void {
    for (const [sensorId, value] of Object.entries(data)) {
      const sensor = twin.connectivity.sensors.find(s => s.id === sensorId);
      if (sensor) {
        if (value < sensor.range.min || value > sensor.range.max) {
          const alert = {
            id: this.generateAlertId(),
            type: 'performance' as const,
            severity: 'warning' as const,
            message: `Sensor ${sensorId} value ${value} is outside normal range [${sensor.range.min}, ${sensor.range.max}]`,
            timestamp: new Date(),
            acknowledged: false
          };

          twin.maintenance.alerts.push(alert);

          // Limit alerts to last 100
          if (twin.maintenance.alerts.length > 100) {
            twin.maintenance.alerts = twin.maintenance.alerts.slice(-100);
          }
        }
      }
    }
  }

  private async runScenario(twin: DigitalTwin, scenario: TwinScenario): Promise<void> {
    scenario.execution.status = 'running';
    scenario.execution.startTime = new Date();
    scenario.execution.progress = 0;

    // Simulate scenario execution
    const steps = 10;
    for (let i = 0; i < steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      scenario.execution.progress = (i + 1) / steps * 100;
    }

    // Generate results
    scenario.results = {
      summary: `Scenario ${scenario.name} completed successfully`,
      metrics: {
        performance: 85 + Math.random() * 15,
        efficiency: 80 + Math.random() * 20,
        cost: 1000 + Math.random() * 5000
      },
      visualizations: [
        {
          type: 'chart' as const,
          data: this.generateChartData(),
          configuration: { type: 'line', title: 'Performance Over Time' }
        }
      ],
      recommendations: [
        'Optimize sensor placement',
        'Update maintenance schedule',
        'Consider system upgrades'
      ]
    };

    scenario.execution.status = 'completed';
    scenario.execution.endTime = new Date();
    scenario.execution.duration = scenario.execution.endTime.getTime() - scenario.execution.startTime.getTime();
  }

  private generateChartData(): any {
    return {
      labels: Array.from({ length: 10 }, (_, i) => `T${i}`),
      datasets: [{
        label: 'Performance',
        data: Array.from({ length: 10 }, () => 80 + Math.random() * 20)
      }]
    };
  }

  private async analyzeMaintenanceNeeds(twin: DigitalTwin): Promise<DigitalTwin['maintenance']['recommendations']> {
    const recommendations = [];

    // Analyze performance degradation
    if (twin.data.analytics.performance < 0.8) {
      recommendations.push({
        action: 'Schedule performance optimization',
        priority: 'medium' as const,
        estimatedCost: 500 + Math.random() * 1500,
        estimatedTime: 4 + Math.random() * 4,
        impact: 'Improve system performance by 15-25%'
      });
    }

    // Analyze efficiency
    if (twin.data.analytics.efficiency < 0.7) {
      recommendations.push({
        action: 'Upgrade to more efficient components',
        priority: 'high' as const,
        estimatedCost: 2000 + Math.random() * 3000,
        estimatedTime: 8 + Math.random() * 8,
        impact: 'Reduce energy consumption by 20-30%'
      });
    }

    // Analyze availability
    if (twin.data.analytics.availability < 0.9) {
      recommendations.push({
        action: 'Implement redundancy measures',
        priority: 'critical' as const,
        estimatedCost: 1000 + Math.random() * 2000,
        estimatedTime: 6 + Math.random() * 6,
        impact: 'Increase availability to 99%+'
      });
    }

    return recommendations;
  }

  private calculateMaintenancePriority(recommendations: DigitalTwin['maintenance']['recommendations']): 'low' | 'medium' | 'high' | 'critical' {
    if (recommendations.some(r => r.priority === 'critical')) return 'critical';
    if (recommendations.some(r => r.priority === 'high')) return 'high';
    if (recommendations.some(r => r.priority === 'medium')) return 'medium';
    return 'low';
  }

  private identifyHealthIssues(twin: DigitalTwin): Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }> {
    const issues = [];

    if (twin.data.analytics.performance < 0.7) {
      issues.push({
        type: 'performance',
        severity: 'high' as const,
        description: 'Performance below acceptable threshold',
        recommendation: 'Schedule performance optimization'
      });
    }

    if (twin.maintenance.alerts.filter(a => !a.acknowledged).length > 5) {
      issues.push({
        type: 'alerts',
        severity: 'medium' as const,
        description: 'Multiple unacknowledged alerts',
        recommendation: 'Review and acknowledge pending alerts'
      });
    }

    return issues;
  }

  private calculateHealthScore(twin: DigitalTwin, issues: any[]): number {
    const baseScore = (twin.data.analytics.performance + 
                      twin.data.analytics.efficiency + 
                      twin.data.analytics.availability + 
                      twin.data.analytics.reliability + 
                      twin.data.analytics.utilization) / 5 * 100;

    const penalty = issues.reduce((sum, issue) => {
      switch (issue.severity) {
        case 'critical': return sum - 20;
        case 'high': return sum - 10;
        case 'medium': return sum - 5;
        case 'low': return sum - 2;
        default: return sum;
      }
    }, 0);

    return Math.max(0, Math.min(100, baseScore + penalty));
  }

  // ID generation methods

  private generateTwinId(): string {
    return `twin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateInstanceId(): string {
    return `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateScenarioId(): string {
    return `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
