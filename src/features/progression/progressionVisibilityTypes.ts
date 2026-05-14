import { ARCHETYPE_DEFINITIONS, DecisionArchetype } from '@/features/dq/dqTypes';

export interface ProgressionMilestone {
  currentArchetype: DecisionArchetype;
  currentDq: number;
  nextArchetype: DecisionArchetype | null;
  nextDqThreshold: number;
  progressToNext: number;
  requirements: string[];
  completedCount: number;
}

export function getProgressionMilestone(dqScore: number, reviewCount: number, biasMitigatedCount: number): ProgressionMilestone {
  const archetypes: DecisionArchetype[] = ['gambler', 'overthinker', 'learner', 'decisive', 'sage'];
  const thresholds = [0, 30, 50, 70, 85, 101];

  let currentIdx = 0;
  for (let i = archetypes.length - 1; i >= 0; i--) {
    if (dqScore >= thresholds[i]) { currentIdx = i; break; }
  }

  const currentArchetype = archetypes[currentIdx];
  const nextArchetype = currentIdx < archetypes.length - 1 ? archetypes[currentIdx + 1] : null;
  const currentThreshold = thresholds[currentIdx];
  const nextThreshold = thresholds[currentIdx + 1] ?? 100;
  const progress = nextThreshold - currentThreshold;
  const achieved = dqScore - currentThreshold;
  const progressToNext = progress > 0 ? Math.min(100, (achieved / progress) * 100) : 100;

  const requirements: string[] = [];
  if (reviewCount < 3) requirements.push(`Complete ${3 - reviewCount} more review${reviewCount < 2 ? 's' : ''}`);
  if (biasMitigatedCount < 5) requirements.push(`Catch ${Math.min(5 - biasMitigatedCount, 5)} more bias${5 - biasMitigatedCount > 1 ? 'es' : ''}`);

  return {
    currentArchetype,
    currentDq: dqScore,
    nextArchetype,
    nextDqThreshold: nextThreshold,
    progressToNext,
    requirements,
    completedCount: reviewCount,
  };
}

export function getArchetypeUnlockMessage(archetype: DecisionArchetype | null): string | null {
  if (!archetype) return null;
  const def = ARCHETYPE_DEFINITIONS[archetype];
  return def ? `${def.title}: ${def.description}` : null;
}

export function getProvisionalDqMessage(reviewCount: number): string {
  if (reviewCount === 0) return 'Complete your first review to unlock your DQ score';
  if (reviewCount === 1) return 'Your DQ score will stabilize after 3 reviews';
  return 'Your DQ score gets more accurate with every review';
}
