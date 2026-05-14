/**
 * Biometric Authentication Service
 * 
 * Advanced biometric authentication system using multiple modalities
 * including fingerprint, facial recognition, voice, iris, and behavioral biometrics.
 */

import { Logger } from '../logging/Logger';

export interface BiometricTemplate {
  id: string;
  userId: string;
  type: 'fingerprint' | 'face' | 'voice' | 'iris' | 'signature' | 'behavioral';
  template: any;
  quality: number;
  created: Date;
  lastUsed: Date;
  confidence: number;
}

export interface BiometricMatch {
  templateId: string;
  score: number;
  confidence: number;
  matchTime: number;
  metadata: { [key: string]: any };
}

export interface AuthenticationAttempt {
  id: string;
  userId?: string;
  type: 'fingerprint' | 'face' | 'voice' | 'iris' | 'signature' | 'behavioral' | 'multimodal';
  timestamp: Date;
  success: boolean;
  confidence: number;
  duration: number;
  factors: BiometricMatch[];
  riskScore: number;
  deviceInfo: any;
}

export interface LivenessDetection {
  type: 'challenge' | 'passive' | 'active';
  challenges: Array<{
    name: string;
    description: string;
    expected: any;
  }>;
  passed: boolean;
  confidence: number;
}

export interface BehavioralProfile {
  userId: string;
  patterns: {
    typing: {
      speed: number;
      rhythm: number;
      errors: number;
    };
    mouse: {
      movement: number;
      clicks: number;
      scroll: number;
    };
    gesture: {
      speed: number;
      pressure: number;
      trajectory: number;
    };
  };
  confidence: number;
  lastUpdated: Date;
}

export interface AntiSpoofingConfig {
  enabled: boolean;
  methods: Array<'liveness' | 'depth' | 'infrared' | 'thermal' | 'challenge'>;
  sensitivity: number;
  adaptiveThreshold: boolean;
}

export class BiometricAuthenticationService {
  private logger: Logger;
  private templates: Map<string, BiometricTemplate> = new Map();
  private attempts: AuthenticationAttempt[] = [];
  private behavioralProfiles: Map<string, BehavioralProfile> = new Map();
  private antiSpoofingConfig: AntiSpoofingConfig;
  private riskThreshold: number = 0.7;

  constructor(logger: Logger, config: {
    riskThreshold?: number;
    antiSpoofing?: AntiSpoofingConfig;
  } = {}) {
    this.logger = logger;
    this.riskThreshold = config.riskThreshold || 0.7;
    this.antiSpoofingConfig = config.antiSpoofing || this.getDefaultAntiSpoofingConfig();
  }

  /**
   * Enroll biometric template for user
   */
  async enrollBiometric(userId: string, type: BiometricTemplate['type'], biometricData: any): Promise<BiometricTemplate> {
    try {
      // Validate biometric data
      const validation = await this.validateBiometricData(type, biometricData);
      if (!validation.valid) {
        throw new Error(`Invalid biometric data: ${validation.errors.join(', ')}`);
      }

      // Extract template from biometric data
      const template = await this.extractTemplate(type, biometricData);
      
      // Check for existing template
      const existingTemplate = this.findExistingTemplate(userId, type);
      if (existingTemplate) {
        await this.updateTemplate(existingTemplate.id, template);
      }

      const biometricTemplate: BiometricTemplate = {
        id: existingTemplate?.id || this.generateTemplateId(),
        userId,
        type,
        template,
        quality: validation.quality,
        created: existingTemplate?.created || new Date(),
        lastUsed: new Date(),
        confidence: validation.confidence
      };

      this.templates.set(biometricTemplate.id, biometricTemplate);

      this.logger.info('biometric_enrolled', {
        userId,
        type,
        templateId: biometricTemplate.id,
        quality: validation.quality
      });

      return biometricTemplate;
    } catch (error) {
      this.logger.error('biometric_enrollment_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Authenticate user using biometric
   */
  async authenticate(
    type: BiometricTemplate['type'],
    biometricData: any,
    userId?: string,
    options: {
      requireLiveness?: boolean;
      multiFactor?: boolean;
      adaptiveThreshold?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    userId?: string;
    confidence: number;
    attempt: AuthenticationAttempt;
    recommendations: string[];
  }> {
    const attemptId = this.generateAttemptId();
    const startTime = Date.now();

    try {
      // Perform anti-spoofing checks
      if (options.requireLiveness && this.antiSpoofingConfig.enabled) {
        const livenessCheck = await this.performLivenessDetection(type, biometricData);
        if (!livenessCheck.passed) {
          throw new Error('Liveness detection failed');
        }
      }

      // Find matching templates
      const candidates = userId 
        ? this.findUserTemplates(userId, type)
        : this.findAllTemplates(type);

      // Perform matching
      const matches: BiometricMatch[] = [];
      for (const template of candidates) {
        const match = await this.matchBiometric(template, biometricData);
        if (match.score > this.riskThreshold) {
          matches.push(match);
        }
      }

      // Sort matches by score
      matches.sort((a, b) => b.score - a.score);

      // Determine authentication result
      const bestMatch = matches[0];
      const success = bestMatch && bestMatch.confidence > this.riskThreshold;
      const confidence = bestMatch?.confidence || 0;

      // Calculate risk score
      const riskScore = await this.calculateRiskScore(biometricData, matches, attemptId);

      // Create authentication attempt
      const attempt: AuthenticationAttempt = {
        id: attemptId,
        userId: bestMatch ? this.templates.get(bestMatch.templateId)?.userId : undefined,
        type,
        timestamp: new Date(),
        success,
        confidence,
        duration: Date.now() - startTime,
        factors: matches,
        riskScore,
        deviceInfo: this.collectDeviceInfo()
      };

      this.attempts.push(attempt);

      // Generate recommendations
      const recommendations = this.generateRecommendations(attempt, options);

      this.logger.info('biometric_authentication_completed', {
        attemptId,
        type,
        success,
        confidence,
        riskScore,
        duration: attempt.duration
      });

      return {
        success,
        userId: attempt.userId,
        confidence,
        attempt,
        recommendations
      };
    } catch (error) {
      const attempt: AuthenticationAttempt = {
        id: attemptId,
        type,
        timestamp: new Date(),
        success: false,
        confidence: 0,
        duration: Date.now() - startTime,
        factors: [],
        riskScore: 1.0,
        deviceInfo: this.collectDeviceInfo()
      };

      this.attempts.push(attempt);

      this.logger.error('biometric_authentication_failed', {
        attemptId,
        type,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Perform multimodal authentication
   */
  async authenticateMultimodal(
    biometrics: Array<{
      type: BiometricTemplate['type'];
      data: any;
      weight?: number;
    }>,
    userId?: string
  ): Promise<{
    success: boolean;
    userId?: string;
    confidence: number;
    factors: AuthenticationAttempt[];
    overallRisk: number;
  }> {
    const factors: AuthenticationAttempt[] = [];
    let totalConfidence = 0;
    let totalWeight = 0;
    let overallRisk = 0;

    try {
      for (const biometric of biometrics) {
        const weight = biometric.weight || 1;
        const result = await this.authenticate(
          biometric.type,
          biometric.data,
          userId,
          { requireLiveness: true }
        );

        factors.push(result.attempt);
        totalConfidence += result.confidence * weight;
        totalWeight += weight;
        overallRisk += result.attempt.riskScore * weight;
      }

      const averageConfidence = totalWeight > 0 ? totalConfidence / totalWeight : 0;
      const averageRisk = totalWeight > 0 ? overallRisk / totalWeight : 1.0;
      const success = averageConfidence > this.riskThreshold && averageRisk < 0.3;

      this.logger.info('multimodal_authentication_completed', {
        factorCount: biometrics.length,
        success,
        confidence: averageConfidence,
        risk: averageRisk
      });

      return {
        success,
        userId: factors[0]?.userId,
        confidence: averageConfidence,
        factors,
        overallRisk: averageRisk
      };
    } catch (error) {
      this.logger.error('multimodal_authentication_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Update behavioral profile
   */
  async updateBehavioralProfile(
    userId: string,
    behaviorData: {
      typing?: any;
      mouse?: any;
      gesture?: any;
    }
  ): Promise<BehavioralProfile> {
    try {
      let profile = this.behavioralProfiles.get(userId);
      
      if (!profile) {
        profile = {
          userId,
          patterns: {
            typing: { speed: 0, rhythm: 0, errors: 0 },
            mouse: { movement: 0, clicks: 0, scroll: 0 },
            gesture: { speed: 0, pressure: 0, trajectory: 0 }
          },
          confidence: 0,
          lastUpdated: new Date()
        };
      }

      // Update patterns with new data
      if (behaviorData.typing) {
        profile.patterns.typing = this.analyzeTypingPattern(behaviorData.typing);
      }
      if (behaviorData.mouse) {
        profile.patterns.mouse = this.analyzeMousePattern(behaviorData.mouse);
      }
      if (behaviorData.gesture) {
        profile.patterns.gesture = this.analyzeGesturePattern(behaviorData.gesture);
      }

      // Calculate overall confidence
      profile.confidence = this.calculateBehavioralConfidence(profile.patterns);
      profile.lastUpdated = new Date();

      this.behavioralProfiles.set(userId, profile);

      this.logger.info('behavioral_profile_updated', {
        userId,
        confidence: profile.confidence
      });

      return profile;
    } catch (error) {
      this.logger.error('behavioral_profile_update_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get authentication statistics
   */
  getAuthenticationStats(timeRange?: { start: Date; end: Date }): {
    totalAttempts: number;
    successfulAttempts: number;
    failureRate: number;
    averageConfidence: number;
    averageRisk: number;
    byType: { [key: string]: { attempts: number; success: number } };
  } {
    const filteredAttempts = timeRange 
      ? this.attempts.filter(a => a.timestamp >= timeRange.start && a.timestamp <= timeRange.end)
      : this.attempts;

    const successfulAttempts = filteredAttempts.filter(a => a.success);
    const averageConfidence = filteredAttempts.reduce((sum, a) => sum + a.confidence, 0) / filteredAttempts.length;
    const averageRisk = filteredAttempts.reduce((sum, a) => sum + a.riskScore, 0) / filteredAttempts.length;

    const byType: { [key: string]: { attempts: number; success: number } } = {};
    for (const attempt of filteredAttempts) {
      if (!byType[attempt.type]) {
        byType[attempt.type] = { attempts: 0, success: 0 };
      }
      byType[attempt.type].attempts++;
      if (attempt.success) {
        byType[attempt.type].success++;
      }
    }

    return {
      totalAttempts: filteredAttempts.length,
      successfulAttempts: successfulAttempts.length,
      failureRate: (filteredAttempts.length - successfulAttempts.length) / filteredAttempts.length,
      averageConfidence,
      averageRisk,
      byType
    };
  }

  /**
   * Configure anti-spoofing settings
   */
  configureAntiSpoofing(config: Partial<AntiSpoofingConfig>): void {
    this.antiSpoofingConfig = { ...this.antiSpoofingConfig, ...config };

    this.logger.info('anti_spoofing_configured', {
      enabled: this.antiSpoofingConfig.enabled,
      methods: this.antiSpoofingConfig.methods,
      sensitivity: this.antiSpoofingConfig.sensitivity
    });
  }

  /**
   * Remove biometric template
   */
  async removeTemplate(templateId: string): Promise<void> {
    const template = this.templates.get(templateId);
    if (template) {
      this.templates.delete(templateId);

      this.logger.info('biometric_template_removed', {
        templateId,
        userId: template.userId,
        type: template.type
      });
    }
  }

  /**
   * Get user templates
   */
  getUserTemplates(userId: string): BiometricTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.userId === userId);
  }

  // Private helper methods

  private getDefaultAntiSpoofingConfig(): AntiSpoofingConfig {
    return {
      enabled: true,
      methods: ['liveness', 'challenge'],
      sensitivity: 0.7,
      adaptiveThreshold: true
    };
  }

  private generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAttemptId(): string {
    return `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async validateBiometricData(type: string, data: any): Promise<{
    valid: boolean;
    quality: number;
    confidence: number;
    errors: string[];
  }> {
    // Simplified validation
    const errors: string[] = [];
    let quality = 0.8;
    let confidence = 0.8;

    switch (type) {
      case 'fingerprint':
        if (!data.minutiae || data.minutiae.length < 10) {
          errors.push('Insufficient minutiae points');
          quality = 0.3;
        }
        break;
      case 'face':
        if (!data.landmarks || data.landmarks.length < 68) {
          errors.push('Insufficient facial landmarks');
          quality = 0.4;
        }
        break;
      case 'voice':
        if (!data.features || data.duration < 2) {
          errors.push('Insufficient voice sample');
          quality = 0.5;
        }
        break;
      default:
        if (!data || Object.keys(data).length === 0) {
          errors.push('Empty biometric data');
          quality = 0.1;
        }
    }

    confidence = quality * (1 - errors.length * 0.1);

    return {
      valid: errors.length === 0,
      quality: Math.max(0, quality),
      confidence: Math.max(0, confidence),
      errors
    };
  }

  private async extractTemplate(type: string, data: any): Promise<any> {
    // Simplified template extraction
    switch (type) {
      case 'fingerprint':
        return {
          minutiae: data.minutiae || [],
          pattern: data.pattern || 'whorl',
          quality: data.quality || 0.8
        };
      case 'face':
        return {
          embeddings: data.embeddings || Array(128).fill(0).map(() => Math.random()),
          landmarks: data.landmarks || [],
          quality: data.quality || 0.8
        };
      case 'voice':
        return {
          features: data.features || Array(20).fill(0).map(() => Math.random()),
          pitch: data.pitch || 0,
          quality: data.quality || 0.8
        };
      default:
        return { data: data, quality: 0.8 };
    }
  }

  private findExistingTemplate(userId: string, type: string): BiometricTemplate | undefined {
    return Array.from(this.templates.values()).find(t => t.userId === userId && t.type === type);
  }

  private async updateTemplate(templateId: string, newTemplate: any): Promise<void> {
    const template = this.templates.get(templateId);
    if (template) {
      template.template = newTemplate;
      template.lastUsed = new Date();
    }
  }

  private findUserTemplates(userId: string, type: string): BiometricTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.userId === userId && t.type === type);
  }

  private findAllTemplates(type: string): BiometricTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.type === type);
  }

  private async matchBiometric(template: BiometricTemplate, biometricData: any): Promise<BiometricMatch> {
    const startTime = Date.now();
    
    // Simplified matching algorithm
    const score = 0.6 + Math.random() * 0.4; // 60-100% score
    const confidence = score * template.quality;

    return {
      templateId: template.id,
      score,
      confidence,
      matchTime: Date.now() - startTime,
      metadata: {
        templateQuality: template.quality,
        dataQuality: 0.8
      }
    };
  }

  private async performLivenessDetection(type: string, biometricData: any): Promise<LivenessDetection> {
    // Simplified liveness detection
    const challenges = [
      { name: 'blink', description: 'Blink your eyes', expected: 'blink_detected' },
      { name: 'smile', description: 'Smile', expected: 'smile_detected' },
      { name: 'turn_head', description: 'Turn your head', expected: 'head_movement_detected' }
    ];

    const passed = Math.random() > 0.1; // 90% pass rate
    const confidence = 0.8 + Math.random() * 0.2;

    return {
      type: 'challenge',
      challenges,
      passed,
      confidence
    };
  }

  private async calculateRiskScore(biometricData: any, matches: BiometricMatch[], attemptId: string): Promise<number> {
    // Simplified risk calculation
    let risk = 0.1; // Base risk

    // Check for suspicious patterns
    if (matches.length === 0) {
      risk += 0.5; // No matches
    } else if (matches.length > 5) {
      risk += 0.3; // Too many matches
    }

    // Check match quality
    const bestMatch = matches[0];
    if (bestMatch && bestMatch.confidence < 0.8) {
      risk += 0.2;
    }

    // Check device consistency
    const deviceInfo = this.collectDeviceInfo();
    if (deviceInfo.suspicious) {
      risk += 0.4;
    }

    return Math.min(1, risk);
  }

  private collectDeviceInfo(): any {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      suspicious: Math.random() > 0.9 // 10% chance of suspicious device
    };
  }

  private generateRecommendations(attempt: AuthenticationAttempt, options: any): string[] {
    const recommendations: string[] = [];

    if (!attempt.success) {
      if (attempt.confidence < 0.5) {
        recommendations.push('Ensure proper lighting and positioning');
      }
      if (attempt.riskScore > 0.5) {
        recommendations.push('Try a different authentication method');
      }
    }

    if (attempt.duration > 5000) {
      recommendations.push('Processing took longer than expected');
    }

    return recommendations;
  }

  private analyzeTypingPattern(typingData: any): { speed: number; rhythm: number; errors: number } {
    return {
      speed: typingData.speed || 50 + Math.random() * 50,
      rhythm: typingData.rhythm || 0.7 + Math.random() * 0.3,
      errors: typingData.errors || Math.floor(Math.random() * 5)
    };
  }

  private analyzeMousePattern(mouseData: any): { movement: number; clicks: number; scroll: number } {
    return {
      movement: mouseData.movement || 100 + Math.random() * 200,
      clicks: mouseData.clicks || Math.floor(Math.random() * 10),
      scroll: mouseData.scroll || Math.floor(Math.random() * 20)
    };
  }

  private analyzeGesturePattern(gestureData: any): { speed: number; pressure: number; trajectory: number } {
    return {
      speed: gestureData.speed || 0.5 + Math.random() * 0.5,
      pressure: gestureData.pressure || 0.3 + Math.random() * 0.7,
      trajectory: gestureData.trajectory || 0.6 + Math.random() * 0.4
    };
  }

  private calculateBehavioralConfidence(patterns: BehavioralProfile['patterns']): number {
    const typingScore = patterns.typing.rhythm * (1 - patterns.typing.errors / 10);
    const mouseScore = Math.min(1, patterns.mouse.movement / 300);
    const gestureScore = (patterns.gesture.speed + patterns.gesture.trajectory) / 2;

    return (typingScore + mouseScore + gestureScore) / 3;
  }
}
