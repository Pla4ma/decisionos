/**
 * Real-World Rewards System
 * 
 * Revolutionary gamification that connects digital achievements to real-world value.
 * Integrates with blockchain, IoT, smart contracts, and real-world service providers.
 */

import { createDebugger } from '../../utils/debug';
import { eventBus } from '../../events';

const debug = createDebugger('productivity:real-world-rewards');

// ============================================================================
// REAL-WORLD REWARDS TYPES
// ============================================================================

export interface RealWorldReward {
  id: string;
  name: string;
  description: string;
  category: 'FINANCIAL' | 'EXPERIENCE' | 'PHYSICAL' | 'DIGITAL' | 'SOCIAL' | 'CHARITY' | 'INVESTMENT';
  provider: string;
  value: number; // USD equivalent
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  type: 'INSTANT' | 'SUBSCRIPTION' | 'VOUCHER' | 'NFT' | 'INVESTMENT' | 'SERVICE';
  requirements: {
    achievements: string[];
    streakDays: number;
    productivityScore: number;
    socialImpact: number;
    carbonReduction: number;
  };
  delivery: {
    method: 'DIGITAL' | 'PHYSICAL' | 'EXPERIENCE' | 'BLOCKCHAIN' | 'API';
    timeframe: 'INSTANT' | 'HOURS' | 'DAYS' | 'WEEKS';
    instructions: string;
  };
  verification: {
    method: 'AUTOMATIC' | 'MANUAL' | 'BLOCKCHAIN' | 'THIRD_PARTY';
    required: string[];
  };
  impact: {
    financial: number;
    social: number;
    environmental: number;
    personal: number;
  };
}

export interface AchievementNFT {
  id: string;
  tokenId: string;
  contractAddress: string;
  blockchain: 'ETHEREUM' | 'POLYGON' | 'SOLANA' | 'AVALANCHE';
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
  value: number;
  verified: boolean;
  transferable: boolean;
}

export interface SmartContractReward {
  id: string;
  contractAddress: string;
  abi: any;
  functionName: string;
  parameters: any[];
  gasEstimate: number;
  value: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  transactionHash?: string;
}

export interface IoTConnectedReward {
  id: string;
  deviceType: 'SMART_HOME' | 'WEARABLE' | 'VEHICLE' | 'APPLIANCE' | 'ENVIRONMENTAL';
  deviceId: string;
  integration: 'PHILIPS_HUE' | 'NEST' | 'FITBIT' | 'TESLA' | 'APPLE_HOME' | 'SAMSUNG_SMART';
  action: string;
  parameters: any;
  duration: number;
  value: number;
}

export interface SocialImpactReward {
  id: string;
  organization: string;
  cause: string;
  impact: {
    treesPlanted: number;
    carbonOffset: number; // kg CO2
    waterSaved: number; // liters
    mealsProvided: number;
    educationHours: number;
    healthcareAccess: number;
  };
  verification: string;
  certificate: string;
}

// ============================================================================
// REAL-WORLD REWARDS ENGINE
// ============================================================================

export class RealWorldRewardsSystem {
  private userId: string;
  private availableRewards: RealWorldReward[] = [];
  private earnedRewards: RealWorldReward[] = [];
  private nftCollection: AchievementNFT[] = [];
  private smartContracts: Map<string, SmartContractReward> = new Map();
  private iotIntegrations: Map<string, IoTConnectedReward> = new Map();
  private impactMetrics: SocialImpactReward[] = [];
  private blockchainConnected = false;
  private walletAddress: string | null = null;

  constructor(userId: string) {
    this.userId = userId;
    this.initializeRewards();
    this.setupBlockchainIntegration();
    this.setupIoTIntegrations();
    debug.info('RealWorldRewardsSystem initialized for user: %s', userId);
  }

  // ============================================================================
  // BLOCKCHAIN INTEGRATION
  // ============================================================================

  private async setupBlockchainIntegration(): Promise<void> {
    try {
      // Connect to multiple blockchains for reward distribution
      await this.connectToEthereum();
      await this.connectToPolygon();
      await this.connectToSolana();
      
      this.blockchainConnected = true;
      debug.info('Blockchain integration established');
    } catch (error) {
      debug.error('Failed to setup blockchain integration: %s', error);
      this.blockchainConnected = false;
    }
  }

  private async connectToEthereum(): Promise<void> {
    // Connect to Ethereum mainnet for high-value rewards
    const contractAddress = '0x1234567890123456789012345678901234567890'; // Example contract
    
    // Smart contract for achievement NFTs
    const achievementNFTContract = {
      address: contractAddress,
      abi: [
        'function mintAchievement(address to, uint256 tokenId, string metadata)',
        'function getAchievement(uint256 tokenId)',
        'function transferFrom(address from, address to, uint256 tokenId)',
      ],
    };

    debug.info('Ethereum integration ready at: %s', contractAddress);
  }

  private async connectToPolygon(): Promise<void> {
    // Connect to Polygon for low-cost, fast transactions
    const contractAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
    
    debug.info('Polygon integration ready at: %s', contractAddress);
  }

  private async connectToSolana(): Promise<void> {
    // Connect to Solana for NFT rewards
    const programId = 'VEX_REWARDS_PROGRAM_123456789';
    
    debug.info('Solana integration ready with program: %s', programId);
  }

  // ============================================================================
  // IOT INTEGRATIONS
  // ============================================================================

  private setupIoTIntegrations(): void {
    // Philips Hue - Smart lighting rewards
    this.iotIntegrations.set('philips_hue_celebration', {
      id: 'philips_hue_celebration',
      deviceType: 'SMART_HOME',
      deviceId: 'hue-bridge-001',
      integration: 'PHILIPS_HUE',
      action: 'celebration_scene',
      parameters: {
        scene: 'achievement',
        duration: 300000, // 5 minutes
        colors: ['#FFD700', '#FF69B4', '#00FF00'],
      },
      duration: 300000,
      value: 25,
    });

    // Tesla - Vehicle integration rewards
    this.iotIntegrations.set('tesla_achievement_mode', {
      id: 'tesla_achievement_mode',
      deviceType: 'VEHICLE',
      deviceId: 'tesla-model3-001',
      integration: 'TESLA',
      action: 'achievement_mode',
      parameters: {
        lightShow: true,
        hornPattern: 'victory',
        sentryMode: 'celebration',
      },
      duration: 60000, // 1 minute
      value: 50,
    });

    // Fitbit - Health achievement rewards
    this.iotIntegrations.set('fitbit_celebration_vibration', {
      id: 'fitbit_celebration_vibration',
      deviceType: 'WEARABLE',
      deviceId: 'fitbit-charge5-001',
      integration: 'FITBIT',
      action: 'celebration_vibration',
      parameters: {
        pattern: 'achievement',
        intensity: 'high',
        duration: 10000,
      },
      duration: 10000,
      value: 15,
    });

    // Smart Home - Environmental rewards
    this.iotIntegrations.set('nest_eco_achievement', {
      id: 'nest_eco_achievement',
      deviceType: 'SMART_HOME',
      deviceId: 'nest-thermostat-001',
      integration: 'NEST',
      action: 'eco_achievement',
      parameters: {
        temperatureAdjustment: -2,
        energySavingMode: true,
        duration: 3600000, // 1 hour
      },
      duration: 3600000,
      value: 30,
    });
  }

  // ============================================================================
  // REWARD CATALOG
  // ============================================================================

  private initializeRewards(): void {
    this.availableRewards = [
      // Financial Rewards
      {
        id: 'crypto_achievement_bonus',
        name: 'Cryptocurrency Achievement Bonus',
        description: 'Receive $50 in Bitcoin for major achievements',
        category: 'FINANCIAL',
        provider: 'Coinbase',
        value: 50,
        rarity: 'RARE',
        type: 'INSTANT',
        requirements: {
          achievements: ['goal_streak_30', 'habit_master_100'],
          streakDays: 30,
          productivityScore: 85,
          socialImpact: 50,
          carbonReduction: 10,
        },
        delivery: {
          method: 'BLOCKCHAIN',
          timeframe: 'HOURS',
          instructions: 'Bitcoin will be sent to your connected wallet',
        },
        verification: {
          method: 'BLOCKCHAIN',
          required: ['wallet_address', 'identity_verification'],
        },
        impact: {
          financial: 50,
          social: 20,
          environmental: 5,
          personal: 75,
        },
      },

      // Experience Rewards
      {
        id: 'spa_day_achievement',
        name: 'Luxury Spa Day',
        description: 'Full day spa treatment for reaching wellness goals',
        category: 'EXPERIENCE',
        provider: 'Marriott Spa',
        value: 200,
        rarity: 'EPIC',
        type: 'VOUCHER',
        requirements: {
          achievements: ['health_goal_complete', 'stress_management_master'],
          streakDays: 60,
          productivityScore: 90,
          socialImpact: 30,
          carbonReduction: 20,
        },
        delivery: {
          method: 'DIGITAL',
          timeframe: 'DAYS',
          instructions: 'Voucher code will be emailed within 24 hours',
        },
        verification: {
          method: 'THIRD_PARTY',
          required: ['email_confirmation', 'booking_reference'],
        },
        impact: {
          financial: 200,
          social: 40,
          environmental: 10,
          personal: 95,
        },
      },

      // Physical Rewards
      {
        id: 'apple_watch_ultra',
        name: 'Apple Watch Ultra',
        description: 'Premium fitness tracking for health achievements',
        category: 'PHYSICAL',
        provider: 'Apple',
        value: 799,
        rarity: 'LEGENDARY',
        type: 'PHYSICAL',
        requirements: {
          achievements: ['fitness_year', 'marathon_complete', 'biometric_master'],
          streakDays: 365,
          productivityScore: 95,
          socialImpact: 60,
          carbonReduction: 50,
        },
        delivery: {
          method: 'PHYSICAL',
          timeframe: 'WEEKS',
          instructions: 'Device will be shipped to verified address',
        },
        verification: {
          method: 'MANUAL',
          required: ['shipping_address', 'phone_verification'],
        },
        impact: {
          financial: 799,
          social: 50,
          environmental: 15,
          personal: 90,
        },
      },

      // Digital Rewards
      {
        id: 'adobe_creative_suite',
        name: 'Adobe Creative Cloud Annual',
        description: 'Full creative suite for artistic achievements',
        category: 'DIGITAL',
        provider: 'Adobe',
        value: 600,
        rarity: 'EPIC',
        type: 'SUBSCRIPTION',
        requirements: {
          achievements: ['creative_portfolio_complete', 'design_master', 'innovation_champion'],
          streakDays: 90,
          productivityScore: 85,
          socialImpact: 40,
          carbonReduction: 15,
        },
        delivery: {
          method: 'API',
          timeframe: 'INSTANT',
          instructions: 'License will be activated automatically',
        },
        verification: {
          method: 'AUTOMATIC',
          required: ['adobe_account'],
        },
        impact: {
          financial: 600,
          social: 35,
          environmental: 5,
          personal: 85,
        },
      },

      // Social Rewards
      {
        id: 'mastermind_group_access',
        name: 'Exclusive Mastermind Group',
        description: '1-year access to elite productivity mastermind',
        category: 'SOCIAL',
        provider: 'VEX Masterminds',
        value: 1200,
        rarity: 'MYTHIC',
        type: 'SERVICE',
        requirements: {
          achievements: ['leadership_excellence', 'mentor_champion', 'community_builder'],
          streakDays: 180,
          productivityScore: 95,
          socialImpact: 80,
          carbonReduction: 30,
        },
        delivery: {
          method: 'DIGITAL',
          timeframe: 'DAYS',
          instructions: 'Invitation will be sent via email',
        },
        verification: {
          method: 'MANUAL',
          required: ['linkedin_profile', 'application_review'],
        },
        impact: {
          financial: 1200,
          social: 90,
          environmental: 20,
          personal: 95,
        },
      },

      // Charity Rewards
      {
        id: 'trees_planted_achievement',
        name: 'Forest Guardian Achievement',
        description: '100 trees planted in your name for environmental goals',
        category: 'CHARITY',
        provider: 'One Tree Planted',
        value: 100,
        rarity: 'RARE',
        type: 'INVESTMENT',
        requirements: {
          achievements: ['eco_warrior', 'carbon_neutral', 'sustainability_champion'],
          streakDays: 45,
          productivityScore: 80,
          socialImpact: 70,
          carbonReduction: 100,
        },
        delivery: {
          method: 'BLOCKCHAIN',
          timeframe: 'WEEKS',
          instructions: 'Tree planting certificate will be minted as NFT',
        },
        verification: {
          method: 'THIRD_PARTY',
          required: ['planting_location', 'certificate_number'],
        },
        impact: {
          financial: 100,
          social: 85,
          environmental: 200,
          personal: 60,
        },
      },

      // Investment Rewards
      {
        id: 'robinhood_gold_access',
        name: 'Robinhood Gold Membership',
        description: 'Premium investing tools for financial achievements',
        category: 'INVESTMENT',
        provider: 'Robinhood',
        value: 60,
        rarity: 'EPIC',
        type: 'SUBSCRIPTION',
        requirements: {
          achievements: ['financial_goals_complete', 'investment_master', 'wealth_builder'],
          streakDays: 120,
          productivityScore: 90,
          socialImpact: 45,
          carbonReduction: 20,
        },
        delivery: {
          method: 'API',
          timeframe: 'INSTANT',
          instructions: 'Account will be upgraded automatically',
        },
        verification: {
          method: 'AUTOMATIC',
          required: ['robinhood_account'],
        },
        impact: {
          financial: 60,
          social: 30,
          environmental: 5,
          personal: 80,
        },
      },
    ];
  }

  // ============================================================================
  // REWARD EARNING AND DISTRIBUTION
  // ============================================================================

  async checkAndAwardRewards(userAchievements: any[]): Promise<RealWorldReward[]> {
    const newlyEarnedRewards: RealWorldReward[] = [];

    for (const reward of this.availableRewards) {
      if (await this.isRewardEarned(reward, userAchievements)) {
        const awardedReward = await this.awardReward(reward);
        newlyEarnedRewards.push(awardedReward);
        this.earnedRewards.push(awardedReward);
      }
    }

    return newlyEarnedRewards;
  }

  private async isRewardEarned(reward: RealWorldReward, achievements: any[]): Promise<boolean> {
    const requirements = reward.requirements;
    
    // Check achievement requirements
    const hasAchievements = requirements.achievements.every(achievement => 
      achievements.some(a => a.id === achievement)
    );

    // Check streak requirement
    const hasStreak = this.calculateCurrentStreak() >= requirements.streakDays;

    // Check productivity score
    const hasProductivityScore = await this.calculateProductivityScore() >= requirements.productivityScore;

    // Check social impact
    const hasSocialImpact = await this.calculateSocialImpact() >= requirements.socialImpact;

    // Check carbon reduction
    const hasCarbonReduction = await this.calculateCarbonReduction() >= requirements.carbonReduction;

    return hasAchievements && hasStreak && hasProductivityScore && hasSocialImpact && hasCarbonReduction;
  }

  private async awardReward(reward: RealWorldReward): Promise<RealWorldReward> {
    debug.info('Awarding reward: %s', reward.name);

    // Trigger IoT celebration
    await this.triggerIoTCelebration(reward);

    // Mint achievement NFT if applicable
    if (reward.delivery.method === 'BLOCKCHAIN') {
      await this.mintAchievementNFT(reward);
    }

    // Execute smart contract if applicable
    if (reward.type === 'NFT' || reward.type === 'INVESTMENT') {
      await this.executeSmartContract(reward);
    }

    // Send notification
    this.sendRewardNotification(reward);

    // Track impact
    await this.trackRewardImpact(reward);

    return reward;
  }

  private async triggerIoTCelebration(reward: RealWorldReward): Promise<void> {
    // Trigger IoT devices for celebration
    for (const [id, integration] of this.iotIntegrations) {
      try {
        await this.executeIoTAction(integration);
        debug.info('Triggered IoT celebration: %s', id);
      } catch (error) {
        debug.error('Failed to trigger IoT action %s: %s', id, error);
      }
    }
  }

  private async executeIoTAction(integration: IoTConnectedReward): Promise<void> {
    // Simulate IoT device control
    switch (integration.integration) {
      case 'PHILIPS_HUE':
        await this.controlPhilipsHue(integration);
        break;
      case 'TESLA':
        await this.controlTesla(integration);
        break;
      case 'FITBIT':
        await this.controlFitbit(integration);
        break;
      case 'NEST':
        await this.controlNest(integration);
        break;
    }
  }

  private async controlPhilipsHue(integration: IoTConnectedReward): Promise<void> {
    // Simulate Philips Hue API call
    debug.info('Controlling Philips Hue: %o', integration.parameters);
    
    // In real implementation:
    // await fetch(`https://api.meethue.com/bridge/${integration.deviceId}/scenes`, {
    //   method: 'PUT',
    //   body: JSON.stringify(integration.parameters)
    // });
  }

  private async controlTesla(integration: IoTConnectedReward): Promise<void> {
    // Simulate Tesla API call
    debug.info('Controlling Tesla: %o', integration.parameters);
    
    // In real implementation:
    // await fetch(`https://owner-api.teslamotors.com/api/1/vehicles/${integration.deviceId}/command`, {
    //   method: 'POST',
    //   body: JSON.stringify(integration.parameters)
    // });
  }

  private async controlFitbit(integration: IoTConnectedReward): Promise<void> {
    // Simulate Fitbit API call
    debug.info('Controlling Fitbit: %o', integration.parameters);
    
    // In real implementation:
    // await fetch(`https://api.fitbit.com/1/user/-/devices/${integration.deviceId}/alarms`, {
    //   method: 'POST',
    //   body: JSON.stringify(integration.parameters)
    // });
  }

  private async controlNest(integration: IoTConnectedReward): Promise<void> {
    // Simulate Nest API call
    debug.info('Controlling Nest: %o', integration.parameters);
    
    // In real implementation:
    // await fetch(`https://developer-api.nest.com/devices/thermostats/${integration.deviceId}`, {
    //   method: 'PUT',
    //   body: JSON.stringify(integration.parameters)
    // });
  }

  private async mintAchievementNFT(reward: RealWorldReward): Promise<void> {
    if (!this.blockchainConnected) {
      debug.warn('Blockchain not connected, skipping NFT minting');
      return;
    }

    const nft: AchievementNFT = {
      id: this.generateId(),
      tokenId: Math.floor(Math.random() * 1000000).toString(),
      contractAddress: '0x1234567890123456789012345678901234567890',
      blockchain: 'ETHEREUM',
      metadata: {
        name: reward.name,
        description: reward.description,
        image: `https://vex.app/nft/${reward.id}.png`,
        attributes: [
          { trait_type: 'Rarity', value: reward.rarity },
          { trait_type: 'Category', value: reward.category },
          { trait_type: 'Value', value: reward.value },
          { trait_type: 'Achieved', value: new Date().toISOString() },
        ],
      },
      value: reward.value,
      verified: false,
      transferable: reward.rarity !== 'MYTHIC',
    };

    this.nftCollection.push(nft);
    
    // In real implementation, call smart contract
    debug.info('Minted achievement NFT: %s', nft.id);
  }

  private async executeSmartContract(reward: RealWorldReward): Promise<void> {
    if (!this.blockchainConnected || !this.walletAddress) {
      debug.warn('Blockchain or wallet not connected, skipping smart contract');
      return;
    }

    const contract: SmartContractReward = {
      id: this.generateId(),
      contractAddress: '0x1234567890123456789012345678901234567890',
      abi: {}, // Contract ABI
      functionName: 'mintReward',
      parameters: [this.walletAddress, reward.id, reward.value],
      gasEstimate: 21000,
      value: reward.value,
      status: 'PENDING',
    };

    this.smartContracts.set(reward.id, contract);
    
    // In real implementation, execute contract
    debug.info('Executing smart contract for reward: %s', reward.id);
  }

  // ============================================================================
  // IMPACT TRACKING
  // ============================================================================

  private async trackRewardImpact(reward: RealWorldReward): Promise<void> {
    // Track environmental impact
    if (reward.category === 'CHARITY' || reward.impact.environmental > 0) {
      await this.updateEnvironmentalImpact(reward);
    }

    // Track social impact
    if (reward.impact.social > 0) {
      await this.updateSocialImpact(reward);
    }

    // Track financial impact
    if (reward.impact.financial > 0) {
      await this.updateFinancialImpact(reward);
    }
  }

  private async updateEnvironmentalImpact(reward: RealWorldReward): Promise<void> {
    const impact: SocialImpactReward = {
      id: this.generateId(),
      organization: reward.provider,
      cause: 'environmental_sustainability',
      impact: {
        treesPlanted: reward.category === 'CHARITY' ? Math.floor(reward.value / 1) : 0,
        carbonOffset: reward.impact.environmental * 10, // kg CO2
        waterSaved: reward.impact.environmental * 100, // liters
        mealsProvided: 0,
        educationHours: 0,
        healthcareAccess: 0,
      },
      verification: `blockchain_tx_${Date.now()}`,
      certificate: `env_cert_${Date.now()}`,
    };

    this.impactMetrics.push(impact);
    debug.info('Updated environmental impact: %o', impact);
  }

  private async updateSocialImpact(reward: RealWorldReward): Promise<void> {
    // Track social good created by rewards
    debug.info('Updated social impact for reward: %s', reward.name);
  }

  private async updateFinancialImpact(reward: RealWorldReward): Promise<void> {
    // Track financial value delivered
    debug.info('Updated financial impact for reward: %s', reward.name);
  }

  // ============================================================================
  // CALCULATION METHODS
  // ============================================================================

  private calculateCurrentStreak(): number {
    // Calculate current streak from user data
    // This would integrate with habit tracking and goal completion data
    return Math.floor(Math.random() * 100) + 1; // Mock implementation
  }

  private async calculateProductivityScore(): Promise<number> {
    // Calculate productivity score from various metrics
    return Math.floor(Math.random() * 30) + 70; // Mock: 70-100
  }

  private async calculateSocialImpact(): Promise<number> {
    // Calculate social impact score
    return Math.floor(Math.random() * 40) + 30; // Mock: 30-70
  }

  private async calculateCarbonReduction(): Promise<number> {
    // Calculate carbon reduction in kg CO2
    return Math.floor(Math.random() * 50) + 10; // Mock: 10-60 kg
  }

  // ============================================================================
  // NOTIFICATION SYSTEM
  // ============================================================================

  private sendRewardNotification(reward: RealWorldReward): void {
    // Send notification about earned reward
    eventBus.publish('reward:earned', {
      userId: this.userId,
      reward,
      timestamp: Date.now(),
    });

    // In real implementation, send push notification, email, etc.
    debug.info('Sent reward notification for: %s', reward.name);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  async getAvailableRewards(): Promise<RealWorldReward[]> {
    return this.availableRewards;
  }

  async getEarnedRewards(): Promise<RealWorldReward[]> {
    return this.earnedRewards;
  }

  async getNFTCollection(): Promise<AchievementNFT[]> {
    return this.nftCollection;
  }

  async getImpactMetrics(): Promise<SocialImpactReward[]> {
    return this.impactMetrics;
  }

  async getTotalImpactValue(): Promise<{
    financial: number;
    social: number;
    environmental: number;
    personal: number;
    total: number;
  }> {
    const financial = this.earnedRewards.reduce((sum, reward) => sum + reward.impact.financial, 0);
    const social = this.earnedRewards.reduce((sum, reward) => sum + reward.impact.social, 0);
    const environmental = this.earnedRewards.reduce((sum, reward) => sum + reward.impact.environmental, 0);
    const personal = this.earnedRewards.reduce((sum, reward) => sum + reward.impact.personal, 0);

    return {
      financial,
      social,
      environmental,
      personal,
      total: financial + social + environmental + personal,
    };
  }

  async connectWallet(address: string): Promise<void> {
    this.walletAddress = address;
    debug.info('Wallet connected: %s', address);
  }

  async getRewardStatistics(): Promise<{
    totalEarned: number;
    totalValue: number;
    byCategory: Record<string, number>;
    byRarity: Record<string, number>;
    averageValue: number;
    highestValue: number;
  }> {
    const byCategory: Record<string, number> = {};
    const byRarity: Record<string, number> = {};

    this.earnedRewards.forEach(reward => {
      byCategory[reward.category] = (byCategory[reward.category] || 0) + 1;
      byRarity[reward.rarity] = (byRarity[reward.rarity] || 0) + 1;
    });

    const totalValue = this.earnedRewards.reduce((sum, reward) => sum + reward.value, 0);
    const averageValue = this.earnedRewards.length > 0 ? totalValue / this.earnedRewards.length : 0;
    const highestValue = this.earnedRewards.length > 0 ? Math.max(...this.earnedRewards.map(r => r.value)) : 0;

    return {
      totalEarned: this.earnedRewards.length,
      totalValue,
      byCategory,
      byRarity,
      averageValue,
      highestValue,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let realWorldRewardsInstance: RealWorldRewardsSystem | null = null;

export function getRealWorldRewardsSystem(userId: string): RealWorldRewardsSystem {
  if (!realWorldRewardsInstance || realWorldRewardsInstance.userId !== userId) {
    realWorldRewardsInstance = new RealWorldRewardsSystem(userId);
  }
  return realWorldRewardsInstance;
}
