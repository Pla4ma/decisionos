export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'milestone' | 'streak' | 'mastery' | 'social' | 'discovery';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: (stats: AchievementStats) => boolean;
  progress: (stats: AchievementStats) => { current: number; target: number };
  xpReward: number;
}

export interface AchievementStats {
  decisionsCreated: number;
  decisionsAnalyzed: number;
  decisionsReviewed: number;
  quickReviewsDone: number;
  currentStreak: number;
  longestStreak: number;
  biasesDetected: number;
  biasesMitigated: number;
  reflectionsWritten: number;
  templatesUsed: number;
  practicesCompleted: number;
  secondOpinionsGiven: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_decision',
    title: 'First Step',
    description: 'Create your first decision',
    icon: '🌱',
    category: 'milestone',
    rarity: 'common',
    requirement: (s) => s.decisionsCreated >= 1,
    progress: (s) => ({ current: Math.min(s.decisionsCreated, 1), target: 1 }),
    xpReward: 50,
  },
  {
    id: 'ten_decisions',
    title: 'Decisive Mind',
    description: 'Create 10 decisions',
    icon: '🧠',
    category: 'milestone',
    rarity: 'common',
    requirement: (s) => s.decisionsCreated >= 10,
    progress: (s) => ({ current: Math.min(s.decisionsCreated, 10), target: 10 }),
    xpReward: 100,
  },
  {
    id: 'fifty_decisions',
    title: 'Decision Architect',
    description: 'Create 50 decisions',
    icon: '🏛️',
    category: 'milestone',
    rarity: 'rare',
    requirement: (s) => s.decisionsCreated >= 50,
    progress: (s) => ({ current: Math.min(s.decisionsCreated, 50), target: 50 }),
    xpReward: 300,
  },
  {
    id: 'hundred_decisions',
    title: 'Grand Decider',
    description: 'Create 100 decisions',
    icon: '👑',
    category: 'milestone',
    rarity: 'epic',
    requirement: (s) => s.decisionsCreated >= 100,
    progress: (s) => ({ current: Math.min(s.decisionsCreated, 100), target: 100 }),
    xpReward: 1000,
  },
  {
    id: 'first_analysis',
    title: 'AI Insight',
    description: 'Analyze your first decision with AI',
    icon: '🤖',
    category: 'mastery',
    rarity: 'common',
    requirement: (s) => s.decisionsAnalyzed >= 1,
    progress: (s) => ({ current: Math.min(s.decisionsAnalyzed, 1), target: 1 }),
    xpReward: 75,
  },
  {
    id: 'ten_analyses',
    title: 'Deep Analyst',
    description: 'Analyze 10 decisions',
    icon: '🔬',
    category: 'mastery',
    rarity: 'rare',
    requirement: (s) => s.decisionsAnalyzed >= 10,
    progress: (s) => ({ current: Math.min(s.decisionsAnalyzed, 10), target: 10 }),
    xpReward: 250,
  },
  {
    id: 'first_review',
    title: 'Learning Loop',
    description: 'Complete your first review',
    icon: '🔄',
    category: 'milestone',
    rarity: 'common',
    requirement: (s) => s.decisionsReviewed >= 1,
    progress: (s) => ({ current: Math.min(s.decisionsReviewed, 1), target: 1 }),
    xpReward: 75,
  },
  {
    id: 'ten_reviews',
    title: 'Review Master',
    description: 'Complete 10 reviews',
    icon: '📚',
    category: 'mastery',
    rarity: 'rare',
    requirement: (s) => s.decisionsReviewed >= 10,
    progress: (s) => ({ current: Math.min(s.decisionsReviewed, 10), target: 10 }),
    xpReward: 300,
  },
  {
    id: 'streak_3',
    title: 'Getting Started',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    requirement: (s) => s.currentStreak >= 3,
    progress: (s) => ({ current: Math.min(s.currentStreak, 3), target: 3 }),
    xpReward: 100,
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    requirement: (s) => s.currentStreak >= 7,
    progress: (s) => ({ current: Math.min(s.currentStreak, 7), target: 7 }),
    xpReward: 200,
  },
  {
    id: 'streak_30',
    title: 'Monthly Momentum',
    description: 'Maintain a 30-day streak',
    icon: '💪',
    category: 'streak',
    rarity: 'epic',
    requirement: (s) => s.currentStreak >= 30,
    progress: (s) => ({ current: Math.min(s.currentStreak, 30), target: 30 }),
    xpReward: 1000,
  },
  {
    id: 'streak_100',
    title: 'Century Streak',
    description: 'Maintain a 100-day streak',
    icon: '🏆',
    category: 'streak',
    rarity: 'legendary',
    requirement: (s) => s.currentStreak >= 100,
    progress: (s) => ({ current: Math.min(s.currentStreak, 100), target: 100 }),
    xpReward: 5000,
  },
  {
    id: 'bias_hunter',
    title: 'Bias Hunter',
    description: 'Detect 5 cognitive biases',
    icon: '🎯',
    category: 'mastery',
    rarity: 'rare',
    requirement: (s) => s.biasesDetected >= 5,
    progress: (s) => ({ current: Math.min(s.biasesDetected, 5), target: 5 }),
    xpReward: 200,
  },
  {
    id: 'bias_master',
    title: 'Bias Master',
    description: 'Mitigate 10 biases',
    icon: '🛡️',
    category: 'mastery',
    rarity: 'epic',
    requirement: (s) => s.biasesMitigated >= 10,
    progress: (s) => ({ current: Math.min(s.biasesMitigated, 10), target: 10 }),
    xpReward: 500,
  },
  {
    id: 'quick_reviewer',
    title: 'Quick Checker',
    description: 'Complete 20 quick reviews',
    icon: '⚡',
    category: 'mastery',
    rarity: 'rare',
    requirement: (s) => s.quickReviewsDone >= 20,
    progress: (s) => ({ current: Math.min(s.quickReviewsDone, 20), target: 20 }),
    xpReward: 250,
  },
  {
    id: 'reflection_10',
    title: 'Deep Thinker',
    description: 'Write 10 reflections',
    icon: '📝',
    category: 'mastery',
    rarity: 'rare',
    requirement: (s) => s.reflectionsWritten >= 10,
    progress: (s) => ({ current: Math.min(s.reflectionsWritten, 10), target: 10 }),
    xpReward: 300,
  },
];

export const XP_PER_ACTION = {
  CREATE_DECISION: 25,
  ANALYZE_DECISION: 50,
  COMPLETE_REVIEW: 75,
  QUICK_REVIEW: 15,
  DAILY_CHECK_IN: 10,
  DETECT_BIAS: 30,
  MITIGATE_BIAS: 50,
  WRITE_REFLECTION: 40,
  USE_TEMPLATE: 20,
  COMPLETE_PRACTICE: 35,
} as const;

export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 250 },
  { level: 4, xp: 500 },
  { level: 5, xp: 800 },
  { level: 6, xp: 1200 },
  { level: 7, xp: 1800 },
  { level: 8, xp: 2500 },
  { level: 9, xp: 3500 },
  { level: 10, xp: 5000 },
  { level: 11, xp: 7000 },
  { level: 12, xp: 10000 },
  { level: 13, xp: 15000 },
  { level: 14, xp: 25000 },
  { level: 15, xp: 50000 },
] as const;

export function getLevel(xp: number): { level: number; xpForNext: number; progress: number } {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      level = LEVEL_THRESHOLDS[i].level;
      const nextThreshold = LEVEL_THRESHOLDS[i + 1];
      if (nextThreshold) {
        const xpInLevel = xp - LEVEL_THRESHOLDS[i].xp;
        const xpNeeded = nextThreshold.xp - LEVEL_THRESHOLDS[i].xp;
        return { level, xpForNext: nextThreshold.xp - xp, progress: clamp(xpInLevel / xpNeeded * 100, 0, 100) };
      }
      break;
    }
  }
  return { level: 15, xpForNext: 0, progress: 100 };
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

export function getUnlockedAchievements(stats: AchievementStats): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.requirement(stats));
}
