import { FEATURE_CATALOG, FEATURE_HIERARCHY, FEATURE_TIER_LABELS, type FeatureId, type FeatureMilestone } from './featureCatalog';

export { FEATURE_CATALOG, FEATURE_HIERARCHY, FEATURE_TIER_LABELS };
export type { FeatureId, FeatureMilestone };

export function isFeatureUnlocked(
  featureId: FeatureId,
  stats: { decisionsCreated: number; decisionsReviewed: number; analysesRun: number; daysActive: number },
): boolean {
  const feature = FEATURE_CATALOG[featureId];
  if (!feature) return false;
  if (feature.requiredDecisionsCreated !== undefined && stats.decisionsCreated < feature.requiredDecisionsCreated) return false;
  if (feature.requiredDecisionsReviewed !== undefined && stats.decisionsReviewed < feature.requiredDecisionsReviewed) return false;
  if (feature.requiredAnalysesRun !== undefined && stats.analysesRun < feature.requiredAnalysesRun) return false;
  if (feature.requiredDaysActive !== undefined && stats.daysActive < feature.requiredDaysActive) return false;
  if (feature.parentFeature) return isFeatureUnlocked(feature.parentFeature, stats);
  return true;
}

export function getUnlockedFeatures(
  stats: { decisionsCreated: number; decisionsReviewed: number; analysesRun: number; daysActive: number },
): FeatureId[] {
  return (Object.keys(FEATURE_CATALOG) as FeatureId[]).filter((id) => isFeatureUnlocked(id, stats));
}
