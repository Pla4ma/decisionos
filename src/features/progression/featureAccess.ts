import {
  FEATURE_CATALOG, FEATURE_HIERARCHY, FEATURE_TIER_LABELS, TABLE_CLASSIFICATION,
  type FeatureId, type FeatureMilestone, type FeatureClassification,
} from './featureCatalog';

export { FEATURE_CATALOG, FEATURE_HIERARCHY, FEATURE_TIER_LABELS, TABLE_CLASSIFICATION };
export type { FeatureId, FeatureMilestone, FeatureClassification };

export function isFeatureUnlocked(
  featureId: FeatureId,
  stats: { decisionsCreated: number; decisionsReviewed: number; analysesRun: number; daysActive: number; hasValues?: boolean; hasPrivacyConsent?: boolean },
): boolean {
  const feature = FEATURE_CATALOG[featureId];
  if (!feature) return false;
  if (feature.classification === 'disabled') return false;
  if (feature.requiredDecisionsCreated !== undefined && stats.decisionsCreated < feature.requiredDecisionsCreated) return false;
  if (feature.requiredDecisionsReviewed !== undefined && stats.decisionsReviewed < feature.requiredDecisionsReviewed) return false;
  if (feature.requiredAnalysesRun !== undefined && stats.analysesRun < feature.requiredAnalysesRun) return false;
  if (feature.requiredDaysActive !== undefined && stats.daysActive < feature.requiredDaysActive) return false;
  if (feature.requiredValuesAvailable !== undefined && feature.requiredValuesAvailable && !stats.hasValues) return false;
  if (feature.requiredPrivacyConsent !== undefined && feature.requiredPrivacyConsent && !stats.hasPrivacyConsent) return false;
  if (feature.parentFeature) return isFeatureUnlocked(feature.parentFeature, stats);
  return true;
}

export function getFeatureClassification(featureId: FeatureId): FeatureClassification | undefined {
  return FEATURE_CATALOG[featureId]?.classification;
}

export function isFeatureGloballyAccessible(featureId: FeatureId): boolean {
  const classification = getFeatureClassification(featureId);
  if (!classification || classification === 'disabled') return false;
  return true;
}

export function getTableClassification(tableName: string): FeatureClassification | undefined {
  return TABLE_CLASSIFICATION[tableName];
}

export function isTableAccessible(tableName: string): boolean {
  const classification = TABLE_CLASSIFICATION[tableName];
  if (!classification || classification === 'disabled') return false;
  return true;
}

export function getUnlockedFeatures(
  stats: { decisionsCreated: number; decisionsReviewed: number; analysesRun: number; daysActive: number; hasValues?: boolean; hasPrivacyConsent?: boolean },
): FeatureId[] {
  return (Object.keys(FEATURE_CATALOG) as FeatureId[]).filter((id) => isFeatureUnlocked(id, stats));
}
