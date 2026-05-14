/**
 * Internet of Things Service
 * 
 * Advanced IoT service for device management, sensor networks,
 * smart home automation, industrial IoT, and connected ecosystems.
 */

import { Logger } from '../logging/Logger';

export interface IoTDevice {
  id: string;
  name: string;
  type: 'sensor' | 'actuator' | 'gateway' | 'controller' | 'display' | 'camera' | 'speaker';
  category: 'smart_home' | 'industrial' | 'agriculture' | 'healthcare' | 'transportation' | 'retail';
  manufacturer: string;
  model: string;
  firmware: string;
  location: {
    room?: string;
    building?: string;
    coordinates?: { lat: number; lng: number };
    zone: string;
  };
  connectivity: {
    protocol: 'wifi' | 'zigbee' | 'zwave' | 'bluetooth' | 'cellular' | 'ethernet' | 'lora';
    signal: number;
    lastSeen: Date;
    online: boolean;
  };
  capabilities: string[];
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  battery?: {
    level: number;
    charging: boolean;
    estimatedLife: number;
  };
  power: {
    source: 'battery' | 'mains' | 'solar' | 'generator';
    consumption: number;
    voltage: number;
  };
}

export interface SensorData {
  id: string;
  deviceId: string;
  timestamp: Date;
  type: 'temperature' | 'humidity' | 'pressure' | 'light' | 'motion' | 'sound' | 'air_quality' | 'vibration' | 'proximity' | 'custom';
  value: number | string | boolean;
  unit: string;
  quality: number;
  processed: boolean;
  alerts: Array<{
    level: 'info' | 'warning' | 'critical';
    message: string;
    threshold: number;
  }>;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  triggers: Array<{
    deviceId: string;
    type: 'sensor_value' | 'time' | 'device_state' | 'manual' | 'geofence';
    conditions: Array<{
      property: string;
      operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'between';
      value: any;
    }>;
  }>;
  actions: Array<{
    deviceId: string;
    type: 'set_state' | 'send_command' | 'notification' | 'scene' | 'automation';
    parameters: { [key: string]: any };
  }>;
  schedule?: {
    type: 'once' | 'daily' | 'weekly' | 'monthly' | 'cron';
    time: string;
    days?: string[];
  };
  lastExecuted?: Date;
  executionCount: number;
}

export interface IoTScene {
  id: string;
  name: string;
  description: string;
  devices: Array<{
    deviceId: string;
    state: { [key: string]: any };
    transition?: number;
  }>;
  icon: string;
  favorites: boolean;
  created: Date;
  lastUsed?: Date;
  usageCount: number;
}

export interface IoTGateway {
  id: string;
  name: string;
  type: 'central' | 'edge' | 'cloud';
  protocol: string;
  port: number;
  devices: string[];
  status: 'online' | 'offline' | 'error';
  bandwidth: {
    upload: number;
    download: number;
    latency: number;
  };
  security: {
    encryption: boolean;
    authentication: 'none' | 'basic' | 'token' | 'certificate';
    firewall: boolean;
  };
}

export interface IoTAnalytics {
  deviceId: string;
  timeframe: {
    start: Date;
    end: Date;
  };
  metrics: {
    uptime: number;
    responsiveness: number;
    reliability: number;
    efficiency: number;
    errorRate: number;
  };
  trends: Array<{
    metric: string;
    direction: 'increasing' | 'decreasing' | 'stable';
    change: number;
    significance: number;
  }>;
  anomalies: Array<{
    timestamp: Date;
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
}

export class InternetOfThingsService {
  private logger: Logger;
  private devices: Map<string, IoTDevice> = new Map();
  private sensorData: Map<string, SensorData[]> = new Map();
  private automationRules: Map<string, AutomationRule> = new Map();
  private scenes: Map<string, IoTScene> = new Map();
  private gateways: Map<string, IoTGateway> = new Map();
  private deviceGroups: Map<string, string[]> = new Map();

  constructor(logger: Logger) {
    this.logger = logger;
    this.initializeGateways();
    this.startDeviceMonitoring();
    this.startAutomationEngine();
  }

  /**
   * Register new IoT device
   */
  async registerDevice(deviceConfig: {
    name: string;
    type: IoTDevice['type'];
    category: IoTDevice['category'];
    manufacturer: string;
    model: string;
    location: IoTDevice['location'];
    connectivity: {
      protocol: IoTDevice['connectivity']['protocol'];
      credentials?: { [key: string]: string };
    };
    capabilities: string[];
  }): Promise<IoTDevice> {
    try {
      const device: IoTDevice = {
        id: this.generateDeviceId(),
        name: deviceConfig.name,
        type: deviceConfig.type,
        category: deviceConfig.category,
        manufacturer: deviceConfig.manufacturer,
        model: deviceConfig.model,
        firmware: '1.0.0',
        location: deviceConfig.location,
        connectivity: {
          protocol: deviceConfig.connectivity.protocol,
          signal: 0,
          lastSeen: new Date(),
          online: false
        },
        capabilities: deviceConfig.capabilities,
        status: 'inactive',
        power: {
          source: 'mains',
          consumption: 0,
          voltage: 220
        }
      };

      // Connect device
      await this.connectDevice(device, deviceConfig.connectivity);

      this.devices.set(device.id, device);
      this.sensorData.set(device.id, []);

      this.logger.info('iot_device_registered', {
        deviceId: device.id,
        name: device.name,
        type: device.type,
        category: device.category
      });

      return device;
    } catch (error) {
      this.logger.error('iot_device_registration_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Connect device to network
   */
  async connectDevice(device: IoTDevice, connectivity: {
    protocol: string;
    credentials?: { [key: string]: string };
  }): Promise<void> {
    try {
      // Simulate device connection
      await new Promise(resolve => setTimeout(resolve, 1000));

      device.connectivity.online = true;
      device.connectivity.signal = 0.8 + Math.random() * 0.2; // 80-100% signal
      device.connectivity.lastSeen = new Date();
      device.status = 'active';

      this.logger.info('iot_device_connected', {
        deviceId: device.id,
        protocol: connectivity.protocol,
        signal: device.connectivity.signal
      });
    } catch (error) {
      device.status = 'error';
      this.logger.error('iot_device_connection_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Process sensor data from device
   */
  async processSensorData(
    deviceId: string,
    data: Array<{
      type: SensorData['type'];
      value: number | string | boolean;
      unit: string;
      quality?: number;
    }>
  ): Promise<SensorData[]> {
    try {
      const device = this.devices.get(deviceId);
      if (!device) {
        throw new Error(`Device ${deviceId} not found`);
      }

      const processedData: SensorData[] = [];

      for (const reading of data) {
        const sensorData: SensorData = {
          id: this.generateSensorDataId(),
          deviceId,
          timestamp: new Date(),
          type: reading.type,
          value: reading.value,
          unit: reading.unit,
          quality: reading.quality || 1.0,
          processed: false,
          alerts: this.checkAlerts(deviceId, reading.type, reading.value)
        };

        processedData.push(sensorData);
      }

      // Store data
      const deviceData = this.sensorData.get(deviceId) || [];
      deviceData.push(...processedData);
      this.sensorData.set(deviceId, deviceData);

      // Trigger automation rules
      await this.evaluateAutomationRules(deviceId, processedData);

      this.logger.info('sensor_data_processed', {
        deviceId,
        dataPoints: processedData.length,
        alerts: processedData.reduce((sum, d) => sum + d.alerts.length, 0)
      });

      return processedData;
    } catch (error) {
      this.logger.error('sensor_data_processing_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Create automation rule
   */
  async createAutomationRule(ruleConfig: {
    name: string;
    description: string;
    triggers: AutomationRule['triggers'];
    actions: AutomationRule['actions'];
    schedule?: AutomationRule['schedule'];
  }): Promise<AutomationRule> {
    try {
      const rule: AutomationRule = {
        id: this.generateRuleId(),
        name: ruleConfig.name,
        description: ruleConfig.description,
        enabled: true,
        triggers: ruleConfig.triggers,
        actions: ruleConfig.actions,
        schedule: ruleConfig.schedule,
        executionCount: 0
      };

      this.automationRules.set(rule.id, rule);

      this.logger.info('automation_rule_created', {
        ruleId: rule.id,
        name: rule.name,
        triggers: rule.triggers.length,
        actions: rule.actions.length
      });

      return rule;
    } catch (error) {
      this.logger.error('automation_rule_creation_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Execute automation rule
   */
  async executeRule(ruleId: string, context?: { [key: string]: any }): Promise<{
    success: boolean;
    executed: number;
    failed: number;
    results: any[];
  }> {
    try {
      const rule = this.automationRules.get(ruleId);
      if (!rule || !rule.enabled) {
        throw new Error(`Rule ${ruleId} not found or disabled`);
      }

      const results = [];
      let executed = 0;
      let failed = 0;

      for (const action of rule.actions) {
        try {
          const result = await this.executeAction(action, context);
          results.push(result);
          executed++;
        } catch (error) {
          failed++;
          results.push({ error: error.message });
        }
      }

      rule.lastExecuted = new Date();
      rule.executionCount++;

      this.logger.info('automation_rule_executed', {
        ruleId,
        executed,
        failed,
        success: failed === 0
      });

      return {
        success: failed === 0,
        executed,
        failed,
        results
      };
    } catch (error) {
      this.logger.error('automation_rule_execution_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Create IoT scene
   */
  async createScene(sceneConfig: {
    name: string;
    description: string;
    devices: Array<{
      deviceId: string;
      state: { [key: string]: any };
      transition?: number;
    }>;
    icon?: string;
  }): Promise<IoTScene> {
    try {
      const scene: IoTScene = {
        id: this.generateSceneId(),
        name: sceneConfig.name,
        description: sceneConfig.description,
        devices: sceneConfig.devices,
        icon: sceneConfig.icon || 'scene',
        favorites: false,
        created: new Date(),
        usageCount: 0
      };

      this.scenes.set(scene.id, scene);

      this.logger.info('iot_scene_created', {
        sceneId: scene.id,
        name: scene.name,
        devices: scene.devices.length
      });

      return scene;
    } catch (error) {
      this.logger.error('iot_scene_creation_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Activate IoT scene
   */
  async activateScene(sceneId: string): Promise<{
    success: boolean;
    devices: number;
    errors: string[];
  }> {
    try {
      const scene = this.scenes.get(sceneId);
      if (!scene) {
        throw new Error(`Scene ${sceneId} not found`);
      }

      let success = true;
      let errors: string[] = [];

      for (const deviceConfig of scene.devices) {
        try {
          await this.setDeviceState(deviceConfig.deviceId, deviceConfig.state, deviceConfig.transition);
        } catch (error) {
          success = false;
          errors.push(`Device ${deviceConfig.deviceId}: ${error.message}`);
        }
      }

      scene.lastUsed = new Date();
      scene.usageCount++;

      this.logger.info('iot_scene_activated', {
        sceneId,
        success,
        devices: scene.devices.length,
        errors: errors.length
      });

      return {
        success,
        devices: scene.devices.length,
        errors
      };
    } catch (error) {
      this.logger.error('iot_scene_activation_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get device analytics
   */
  async getDeviceAnalytics(
    deviceId: string,
    timeframe: { start: Date; end: Date }
  ): Promise<IoTAnalytics> {
    try {
      const device = this.devices.get(deviceId);
      if (!device) {
        throw new Error(`Device ${deviceId} not found`);
      }

      const data = this.sensorData.get(deviceId) || [];
      const filteredData = data.filter(d => 
        d.timestamp >= timeframe.start && d.timestamp <= timeframe.end
      );

      const analytics: IoTAnalytics = {
        deviceId,
        timeframe,
        metrics: this.calculateMetrics(filteredData),
        trends: this.analyzeTrends(filteredData),
        anomalies: this.detectAnomalies(filteredData)
      };

      this.logger.info('device_analytics_generated', {
        deviceId,
        dataPoints: filteredData.length,
        anomalies: analytics.anomalies.length
      });

      return analytics;
    } catch (error) {
      this.logger.error('device_analytics_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get IoT dashboard
   */
  getIoTDashboard(): {
    devices: { total: number; online: number; byType: { [key: string]: number }; byCategory: { [key: string]: number } };
    sensors: { total: number; alerts: number; dataPoints: number };
    automation: { rules: number; active: number; executions: number };
    scenes: { total: number; favorites: number; recent: number };
    gateways: { total: number; online: number; bandwidth: { total: number; average: number } };
  } {
    const devices = Array.from(this.devices.values());
    const onlineDevices = devices.filter(d => d.connectivity.online);
    const rules = Array.from(this.automationRules.values());
    const activeRules = rules.filter(r => r.enabled);
    const scenes = Array.from(this.scenes.values());
    const favoriteScenes = scenes.filter(s => s.favorites);
    const recentScenes = scenes.filter(s => 
      s.lastUsed && s.lastUsed > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    const allSensorData = Array.from(this.sensorData.values()).flat();
    const alerts = allSensorData.reduce((sum, d) => sum + d.alerts.length, 0);

    return {
      devices: {
        total: devices.length,
        online: onlineDevices.length,
        byType: devices.reduce((acc, d) => {
          acc[d.type] = (acc[d.type] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number }),
        byCategory: devices.reduce((acc, d) => {
          acc[d.category] = (acc[d.category] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number })
      },
      sensors: {
        total: allSensorData.length,
        alerts,
        dataPoints: allSensorData.length
      },
      automation: {
        rules: rules.length,
        active: activeRules.length,
        executions: rules.reduce((sum, r) => sum + r.executionCount, 0)
      },
      scenes: {
        total: scenes.length,
        favorites: favoriteScenes.length,
        recent: recentScenes.length
      },
      gateways: {
        total: this.gateways.size,
        online: Array.from(this.gateways.values()).filter(g => g.status === 'online').length,
        bandwidth: {
          total: Array.from(this.gateways.values()).reduce((sum, g) => sum + g.bandwidth.download, 0),
          average: Array.from(this.gateways.values()).reduce((sum, g) => sum + g.bandwidth.download, 0) / this.gateways.size || 0
        }
      }
    };
  }

  // Private helper methods

  private initializeGateways(): void {
    // Initialize default gateways
    const gateways = [
      {
        name: 'Main Gateway',
        type: 'central' as const,
        protocol: 'mqtt',
        port: 1883,
        status: 'online' as const,
        bandwidth: { upload: 100, download: 500, latency: 10 },
        security: { encryption: true, authentication: 'token' as const, firewall: true }
      },
      {
        name: 'Edge Gateway',
        type: 'edge' as const,
        protocol: 'coap',
        port: 5683,
        status: 'online' as const,
        bandwidth: { upload: 50, download: 200, latency: 5 },
        security: { encryption: true, authentication: 'certificate' as const, firewall: true }
      }
    ];

    gateways.forEach(config => {
      const gateway: IoTGateway = {
        id: this.generateGatewayId(),
        ...config,
        devices: []
      };
      this.gateways.set(gateway.id, gateway);
    });
  }

  private startDeviceMonitoring(): void {
    // Start device health monitoring
    setInterval(() => {
      this.monitorDeviceHealth();
    }, 30000); // Every 30 seconds
  }

  private startAutomationEngine(): void {
    // Start automation evaluation
    setInterval(() => {
      this.evaluateAllAutomationRules();
    }, 10000); // Every 10 seconds
  }

  private monitorDeviceHealth(): void {
    for (const device of Array.from(this.devices.values())) {
      if (device.connectivity.online) {
        const timeSinceLastSeen = Date.now() - device.connectivity.lastSeen.getTime();
        
        if (timeSinceLastSeen > 60000) { // 1 minute
          device.connectivity.online = false;
          device.status = 'inactive';
          
          this.logger.warn('device_offline', {
            deviceId: device.id,
            name: device.name,
            lastSeen: device.connectivity.lastSeen
          });
        }
      }
    }
  }

  private async evaluateAllAutomationRules(): Promise<void> {
    for (const rule of Array.from(this.automationRules.values())) {
      if (rule.enabled) {
        try {
          await this.evaluateRuleTriggers(rule);
        } catch (error) {
          this.logger.error('automation_evaluation_failed', { ruleId: rule.id, error: error.message });
        }
      }
    }
  }

  private async evaluateRuleTriggers(rule: AutomationRule): Promise<void> {
    for (const trigger of rule.triggers) {
      if (trigger.type === 'sensor_value') {
        const deviceData = this.sensorData.get(trigger.deviceId);
        if (deviceData && deviceData.length > 0) {
          const latestData = deviceData[deviceData.length - 1];
          
          for (const condition of trigger.conditions) {
            if (this.evaluateCondition(latestData, condition)) {
              await this.executeRule(rule.id, { trigger, data: latestData });
              break;
            }
          }
        }
      }
    }
  }

  private evaluateCondition(data: SensorData, condition: {
    property: string;
    operator: string;
    value: any;
  }): boolean {
    const propertyValue = data.type === condition.property ? data.value : null;
    
    switch (condition.operator) {
      case 'eq': return propertyValue === condition.value;
      case 'ne': return propertyValue !== condition.value;
      case 'gt': return propertyValue > condition.value;
      case 'lt': return propertyValue < condition.value;
      case 'gte': return propertyValue >= condition.value;
      case 'lte': return propertyValue <= condition.value;
      case 'in': return Array.isArray(condition.value) && condition.value.includes(propertyValue);
      case 'between': return Array.isArray(condition.value) && 
        propertyValue >= condition.value[0] && propertyValue <= condition.value[1];
      default: return false;
    }
  }

  private async evaluateAutomationRules(deviceId: string, data: SensorData[]): Promise<void> {
    for (const rule of Array.from(this.automationRules.values())) {
      if (rule.enabled) {
        for (const trigger of rule.triggers) {
          if (trigger.deviceId === deviceId && trigger.type === 'sensor_value') {
            for (const sensorData of data) {
              for (const condition of trigger.conditions) {
                if (this.evaluateCondition(sensorData, condition)) {
                  await this.executeRule(rule.id, { trigger, data: sensorData });
                }
              }
            }
          }
        }
      }
    }
  }

  private async executeAction(action: AutomationRule['actions'][0], context?: { [key: string]: any }): Promise<any> {
    switch (action.type) {
      case 'set_state':
        return await this.setDeviceState(action.deviceId, action.parameters);
      case 'send_command':
        return await this.sendDeviceCommand(action.deviceId, action.parameters);
      case 'notification':
        return await this.sendNotification(action.parameters);
      case 'scene':
        return await this.activateScene(action.parameters.sceneId);
      case 'automation':
        return await this.executeRule(action.parameters.ruleId, context);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private async setDeviceState(deviceId: string, state: { [key: string]: any }, transition?: number): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    // Simulate device state change
    if (transition) {
      await new Promise(resolve => setTimeout(resolve, transition));
    }

    this.logger.info('device_state_changed', {
      deviceId,
      state,
      transition
    });
  }

  private async sendDeviceCommand(deviceId: string, command: { [key: string]: any }): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    // Simulate command execution
    await new Promise(resolve => setTimeout(resolve, 500));

    this.logger.info('device_command_sent', {
      deviceId,
      command
    });
  }

  private async sendNotification(notification: { [key: string]: any }): Promise<void> {
    // Simulate notification sending
    await new Promise(resolve => setTimeout(resolve, 200));

    this.logger.info('notification_sent', notification);
  }

  private checkAlerts(deviceId: string, type: string, value: any): Array<{
    level: 'info' | 'warning' | 'critical';
    message: string;
    threshold: number;
  }> {
    const alerts = [];

    // Temperature alerts
    if (type === 'temperature') {
      if (value > 35) {
        alerts.push({
          level: 'critical',
          message: 'High temperature detected',
          threshold: 35
        });
      } else if (value > 30) {
        alerts.push({
          level: 'warning',
          message: 'Elevated temperature',
          threshold: 30
        });
      }
    }

    // Humidity alerts
    if (type === 'humidity') {
      if (value > 80) {
        alerts.push({
          level: 'warning',
          message: 'High humidity detected',
          threshold: 80
        });
      }
    }

    return alerts;
  }

  private calculateMetrics(data: SensorData[]): IoTAnalytics['metrics'] {
    if (data.length === 0) {
      return { uptime: 0, responsiveness: 0, reliability: 0, efficiency: 0, errorRate: 0 };
    }

    const uptime = data.length > 0 ? 0.95 : 0; // Simplified
    const responsiveness = 0.9; // Simplified
    const reliability = data.filter(d => d.quality > 0.8).length / data.length;
    const efficiency = 0.85; // Simplified
    const errorRate = data.reduce((sum, d) => sum + d.alerts.length, 0) / data.length;

    return { uptime, responsiveness, reliability, efficiency, errorRate };
  }

  private analyzeTrends(data: SensorData[]): IoTAnalytics['trends'] {
    // Simplified trend analysis
    return [
      {
        metric: 'temperature',
        direction: 'stable',
        change: 0.1,
        significance: 0.3
      }
    ];
  }

  private detectAnomalies(data: SensorData[]): IoTAnalytics['anomalies'] {
    // Simplified anomaly detection
    const anomalies = [];
    
    for (const reading of data) {
      if (reading.alerts.some(a => a.level === 'critical')) {
        anomalies.push({
          timestamp: reading.timestamp,
          type: 'critical_alert',
          severity: 'high',
          description: 'Critical threshold exceeded'
        });
      }
    }

    return anomalies;
  }

  // ID generation methods

  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSensorDataId(): string {
    return `sensor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSceneId(): string {
    return `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateGatewayId(): string {
    return `gateway_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
