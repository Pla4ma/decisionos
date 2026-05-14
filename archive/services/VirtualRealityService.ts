/**
 * Virtual Reality Service
 * 
 * Advanced VR service with immersive experiences, 3D environments,
 * spatial computing, haptic feedback, and virtual world management.
 */

import { Logger } from '../logging/Logger';

export interface VRWorld {
  id: string;
  name: string;
  type: 'social' | 'gaming' | 'education' | 'training' | 'therapy' | 'meeting';
  environment: {
    skybox: string;
    lighting: LightingConfig;
    physics: PhysicsConfig;
    audio: AudioConfig;
  };
  objects: VRObject[];
  avatars: VRAvatar[];
  capacity: number;
  private: boolean;
  persistent: boolean;
}

export interface VRObject {
  id: string;
  type: 'static' | 'interactive' | 'animated' | 'ui' | 'portal';
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  model: string;
  texture: string;
  interactive: boolean;
  physics: boolean;
  properties: { [key: string]: any };
}

export interface VRAvatar {
  id: string;
  userId: string;
  name: string;
  appearance: {
    body: string;
    clothing: string;
    accessories: string[];
    customizations: { [key: string]: any };
  };
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  animations: Array<{
    name: string;
    playing: boolean;
    loop: boolean;
    speed: number;
  }>;
  voice: {
    enabled: boolean;
    spatial: boolean;
    volume: number;
  };
  status: 'online' | 'away' | 'busy' | 'offline';
}

export interface LightingConfig {
  ambient: { color: string; intensity: number };
  directional: Array<{ color: string; intensity: number; direction: { x: number; y: number; z: number } }>;
  point: Array<{ color: string; intensity: number; position: { x: number; y: number; z: number }; range: number }>;
  shadows: boolean;
  reflections: boolean;
}

export interface PhysicsConfig {
  enabled: boolean;
  gravity: { x: number; y: number; z: number };
  collision: boolean;
  constraints: boolean;
  simulation: 'realistic' | 'arcade' | 'none';
}

export interface AudioConfig {
  spatial: boolean;
  reverb: boolean;
  volume: number;
  sources: Array<{ id: string; position: { x: number; y: number; z: number }; radius: number; sound: string }>;
}

export interface HapticDevice {
  id: string;
  type: 'glove' | 'vest' | 'full_body' | 'chair';
  connected: boolean;
  capabilities: string[];
  intensity: number;
  feedback: Array<{
    type: 'vibration' | 'pressure' | 'temperature' | 'texture';
    target: string;
    intensity: number;
    duration: number;
  }>;
}

export interface VRSession {
  id: string;
  userId: string;
  worldId: string;
  deviceId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  activities: Array<{
    type: string;
    timestamp: Date;
    duration: number;
    data: any;
  }>;
  performance: {
    fps: number;
    latency: number;
    quality: number;
    comfort: number;
  };
}

export interface VRInteraction {
  id: string;
  sessionId: string;
  type: 'gesture' | 'voice' | 'gaze' | 'controller' | 'haptic';
  action: string;
  target: string;
  timestamp: Date;
  parameters: { [key: string]: any };
  response: any;
}

export class VirtualRealityService {
  private logger: Logger;
  private worlds: Map<string, VRWorld> = new Map();
  private sessions: Map<string, VRSession> = new Map();
  private interactions: Map<string, VRInteraction> = new Map();
  private hapticDevices: Map<string, HapticDevice> = new Map();
  private activeUsers: Map<string, VRAvatar> = new Map();

  constructor(logger: Logger) {
    this.logger = logger;
    this.initializeDefaultWorlds();
    this.startPerformanceMonitoring();
  }

  /**
   * Create VR world
   */
  async createWorld(worldConfig: {
    name: string;
    type: VRWorld['type'];
    environment?: Partial<LightingConfig & PhysicsConfig & AudioConfig>;
    capacity?: number;
    private?: boolean;
    persistent?: boolean;
  }): Promise<VRWorld> {
    try {
      const world: VRWorld = {
        id: this.generateWorldId(),
        name: worldConfig.name,
        type: worldConfig.type,
        environment: {
          skybox: 'default_skybox',
          lighting: {
            ambient: { color: '#ffffff', intensity: 0.3 },
            directional: [{ color: '#ffffff', intensity: 0.7, direction: { x: 1, y: 1, z: 1 } }],
            point: [],
            shadows: true,
            reflections: false,
            ...worldConfig.environment
          },
          physics: {
            enabled: true,
            gravity: { x: 0, y: -9.81, z: 0 },
            collision: true,
            constraints: false,
            simulation: 'realistic',
            ...worldConfig.environment
          },
          audio: {
            spatial: true,
            reverb: true,
            volume: 0.8,
            sources: [],
            ...worldConfig.environment
          }
        },
        objects: [],
        avatars: [],
        capacity: worldConfig.capacity || 50,
        private: worldConfig.private || false,
        persistent: worldConfig.persistent || false
      };

      this.worlds.set(world.id, world);

      this.logger.info('vr_world_created', {
        worldId: world.id,
        name: world.name,
        type: world.type,
        capacity: world.capacity
      });

      return world;
    } catch (error) {
      this.logger.error('vr_world_creation_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Add object to VR world
   */
  addObject(worldId: string, objectConfig: {
    type: VRObject['type'];
    name: string;
    position: { x: number; y: number; z: number };
    model: string;
    texture?: string;
    interactive?: boolean;
    physics?: boolean;
    properties?: { [key: string]: any };
  }): VRObject {
    const world = this.worlds.get(worldId);
    if (!world) {
      throw new Error(`World ${worldId} not found`);
    }

    const object: VRObject = {
      id: this.generateObjectId(),
      type: objectConfig.type,
      name: objectConfig.name,
      position: objectConfig.position,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      model: objectConfig.model,
      texture: objectConfig.texture || 'default_texture',
      interactive: objectConfig.interactive || false,
      physics: objectConfig.physics || true,
      properties: objectConfig.properties || {}
    };

    world.objects.push(object);

    this.logger.info('vr_object_added', {
      worldId,
      objectId: object.id,
      name: object.name,
      type: object.type
    });

    return object;
  }

  /**
   * Start VR session
   */
  async startSession(
    userId: string,
    worldId: string,
    deviceId: string,
    avatarConfig?: {
      appearance: VRAvatar['appearance'];
    }
  ): Promise<VRSession> {
    try {
      const world = this.worlds.get(worldId);
      if (!world) {
        throw new Error(`World ${worldId} not found`);
      }

      if (world.avatars.length >= world.capacity) {
        throw new Error('World is at capacity');
      }

      // Create avatar
      const avatar: VRAvatar = {
        id: this.generateAvatarId(),
        userId,
        name: `User_${userId}`,
        appearance: avatarConfig?.appearance || {
          body: 'default_body',
          clothing: 'default_clothing',
          accessories: [],
          customizations: {}
        },
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        animations: [],
        voice: {
          enabled: true,
          spatial: true,
          volume: 0.8
        },
        status: 'online'
      };

      // Create session
      const session: VRSession = {
        id: this.generateSessionId(),
        userId,
        worldId,
        deviceId,
        startTime: new Date(),
        duration: 0,
        activities: [],
        performance: {
          fps: 90,
          latency: 20,
          quality: 0.9,
          comfort: 0.8
        }
      };

      // Add to world
      world.avatars.push(avatar);
      this.activeUsers.set(userId, avatar);
      this.sessions.set(session.id, session);

      this.logger.info('vr_session_started', {
        sessionId: session.id,
        userId,
        worldId,
        deviceId
      });

      return session;
    } catch (error) {
      this.logger.error('vr_session_start_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * End VR session
   */
  async endSession(sessionId: string): Promise<VRSession> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      session.endTime = new Date();
      session.duration = session.endTime.getTime() - session.startTime.getTime();

      // Remove avatar from world
      const world = this.worlds.get(session.worldId);
      if (world) {
        world.avatars = world.avatars.filter(a => a.userId !== session.userId);
      }

      // Remove from active users
      this.activeUsers.delete(session.userId);

      this.logger.info('vr_session_ended', {
        sessionId,
        userId: session.userId,
        duration: session.duration
      });

      return session;
    } catch (error) {
      this.logger.error('vr_session_end_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Handle VR interaction
   */
  async handleInteraction(
    sessionId: string,
    interaction: {
      type: VRInteraction['type'];
      action: string;
      target: string;
      parameters: { [key: string]: any };
    }
  ): Promise<VRInteraction> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      const vrInteraction: VRInteraction = {
        id: this.generateInteractionId(),
        sessionId,
        type: interaction.type,
        action: interaction.action,
        target: interaction.target,
        timestamp: new Date(),
        parameters: interaction.parameters,
        response: await this.processInteraction(interaction)
      };

      this.interactions.set(vrInteraction.id, vrInteraction);

      // Add to session activities
      session.activities.push({
        type: `interaction_${interaction.type}`,
        timestamp: new Date(),
        duration: 0,
        data: vrInteraction
      });

      this.logger.info('vr_interaction_handled', {
        interactionId: vrInteraction.id,
        sessionId,
        type: interaction.type,
        action: interaction.action
      });

      return vrInteraction;
    } catch (error) {
      this.logger.error('vr_interaction_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Connect haptic device
   */
  async connectHapticDevice(deviceConfig: {
    type: HapticDevice['type'];
    capabilities: string[];
  }): Promise<HapticDevice> {
    try {
      const device: HapticDevice = {
        id: this.generateDeviceId(),
        type: deviceConfig.type,
        connected: true,
        capabilities: deviceConfig.capabilities,
        intensity: 0.8,
        feedback: []
      };

      this.hapticDevices.set(device.id, device);

      this.logger.info('haptic_device_connected', {
        deviceId: device.id,
        type: device.type,
        capabilities: device.capabilities.length
      });

      return device;
    } catch (error) {
      this.logger.error('haptic_device_connection_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Send haptic feedback
   */
  async sendHapticFeedback(
    deviceId: string,
    feedback: Array<{
      type: 'vibration' | 'pressure' | 'temperature' | 'texture';
      target: string;
      intensity: number;
      duration: number;
    }>
  ): Promise<void> {
    try {
      const device = this.hapticDevices.get(deviceId);
      if (!device || !device.connected) {
        throw new Error(`Device ${deviceId} not connected`);
      }

      device.feedback = feedback;

      // Simulate haptic feedback
      for (const fb of feedback) {
        await this.simulateHapticFeedback(fb);
      }

      this.logger.info('haptic_feedback_sent', {
        deviceId,
        feedbackCount: feedback.length
      });
    } catch (error) {
      this.logger.error('haptic_feedback_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Update avatar position
   */
  updateAvatarPosition(
    userId: string,
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number }
  ): void {
    const avatar = this.activeUsers.get(userId);
    if (avatar) {
      avatar.position = position;
      avatar.rotation = rotation;

      // Update avatar in world
      for (const world of Array.from(this.worlds.values())) {
        const worldAvatar = world.avatars.find(a => a.userId === userId);
        if (worldAvatar) {
          worldAvatar.position = position;
          worldAvatar.rotation = rotation;
        }
      }
    }
  }

  /**
   * Get world statistics
   */
  getWorldStatistics(worldId: string): {
    objectCount: number;
    avatarCount: number;
    activeSessions: number;
    averageSessionDuration: number;
    performance: {
      averageFPS: number;
      averageLatency: number;
      averageQuality: number;
    };
  } {
    const world = this.worlds.get(worldId);
    if (!world) {
      throw new Error(`World ${worldId} not found`);
    }

    const worldSessions = Array.from(this.sessions.values()).filter(s => s.worldId === worldId);
    const activeSessions = worldSessions.filter(s => !s.endTime);
    const averageDuration = worldSessions.length > 0 
      ? worldSessions.reduce((sum, s) => sum + s.duration, 0) / worldSessions.length 
      : 0;

    const performance = {
      averageFPS: worldSessions.reduce((sum, s) => sum + s.performance.fps, 0) / worldSessions.length || 90,
      averageLatency: worldSessions.reduce((sum, s) => sum + s.performance.latency, 0) / worldSessions.length || 20,
      averageQuality: worldSessions.reduce((sum, s) => sum + s.performance.quality, 0) / worldSessions.length || 0.9
    };

    return {
      objectCount: world.objects.length,
      avatarCount: world.avatars.length,
      activeSessions: activeSessions.length,
      averageSessionDuration: averageDuration,
      performance
    };
  }

  /**
   * Get VR dashboard
   */
  getVRDashboard(): {
    worlds: { total: number; active: number; byType: { [key: string]: number } };
    sessions: { total: number; active: number; averageDuration: number };
    users: { online: number; total: number };
    devices: { connected: number; total: number };
    performance: { globalFPS: number; globalLatency: number; globalQuality: number };
  } {
    const worlds = Array.from(this.worlds.values());
    const sessions = Array.from(this.sessions.values());
    const activeSessions = sessions.filter(s => !s.endTime);

    return {
      worlds: {
        total: worlds.length,
        active: worlds.filter(w => w.avatars.length > 0).length,
        byType: worlds.reduce((acc, w) => {
          acc[w.type] = (acc[w.type] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number })
      },
      sessions: {
        total: sessions.length,
        active: activeSessions.length,
        averageDuration: sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length || 0
      },
      users: {
        online: this.activeUsers.size,
        total: this.activeUsers.size
      },
      devices: {
        connected: Array.from(this.hapticDevices.values()).filter(d => d.connected).length,
        total: this.hapticDevices.size
      },
      performance: {
        globalFPS: sessions.reduce((sum, s) => sum + s.performance.fps, 0) / sessions.length || 90,
        globalLatency: sessions.reduce((sum, s) => sum + s.performance.latency, 0) / sessions.length || 20,
        globalQuality: sessions.reduce((sum, s) => sum + s.performance.quality, 0) / sessions.length || 0.9
      }
    };
  }

  // Private helper methods

  private initializeDefaultWorlds(): void {
    // Create default VR worlds
    const defaultWorlds = [
      {
        name: 'Social Hub',
        type: 'social' as const,
        capacity: 100,
        private: false,
        persistent: true
      },
      {
        name: 'Training Center',
        type: 'training' as const,
        capacity: 50,
        private: false,
        persistent: true
      },
      {
        name: 'Meeting Room',
        type: 'meeting' as const,
        capacity: 20,
        private: true,
        persistent: false
      }
    ];

    defaultWorlds.forEach(config => {
      this.createWorld(config);
    });
  }

  private startPerformanceMonitoring(): void {
    // Start performance monitoring
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 1000); // Every second
  }

  private updatePerformanceMetrics(): void {
    // Update performance metrics for active sessions
    for (const session of Array.from(this.sessions.values())) {
      if (!session.endTime) {
        session.performance.fps = 85 + Math.random() * 10; // 85-95 FPS
        session.performance.latency = 15 + Math.random() * 10; // 15-25ms
        session.performance.quality = 0.8 + Math.random() * 0.2; // 80-100%
        session.performance.comfort = 0.7 + Math.random() * 0.3; // 70-100%
      }
    }
  }

  private async processInteraction(interaction: {
    type: string;
    action: string;
    target: string;
    parameters: { [key: string]: any };
  }): Promise<any> {
    // Simulate interaction processing
    await new Promise(resolve => setTimeout(resolve, 50));

    switch (interaction.type) {
      case 'gesture':
        return this.processGesture(interaction);
      case 'voice':
        return this.processVoice(interaction);
      case 'gaze':
        return this.processGaze(interaction);
      case 'controller':
        return this.processController(interaction);
      case 'haptic':
        return this.processHapticInteraction(interaction);
      default:
        return { success: true, message: 'Interaction processed' };
    }
  }

  private processGesture(interaction: any): any {
    return { success: true, gesture: interaction.action, recognized: true };
  }

  private processVoice(interaction: any): any {
    return { success: true, command: interaction.action, understood: true };
  }

  private processGaze(interaction: any): any {
    return { success: true, target: interaction.target, focused: true };
  }

  private processController(interaction: any): any {
    return { success: true, action: interaction.action, executed: true };
  }

  private processHapticInteraction(interaction: any): any {
    return { success: true, feedback: 'delivered', intensity: interaction.parameters.intensity };
  }

  private async simulateHapticFeedback(feedback: {
    type: string;
    target: string;
    intensity: number;
    duration: number;
  }): Promise<void> {
    // Simulate haptic feedback
    await new Promise(resolve => setTimeout(resolve, feedback.duration));
  }

  // ID generation methods

  private generateWorldId(): string {
    return `world_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateObjectId(): string {
    return `object_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAvatarId(): string {
    return `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateInteractionId(): string {
    return `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
