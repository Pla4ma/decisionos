import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/features/auth/useAuth';
import { useFeatureAccess } from '@/features/progression/useFeatureAccess';
import { analyzeDecision, fetchDecisionAnalysis, preCheckSafety, AnalysisServiceError } from '@/features/decisions/decisionAnalysisService';
import type { Decision, DecisionOption, DecisionAnalysis, OptionScore } from '@/features/decisions/decisionTypes';

const DIMENSION_COLORS: Record<string, string> = {
  regretRisk: colors.status.error,
  confidence: colors.status.success,
  valuesAlignment: colors.accent.secondary,
  reversibility: colors.status.info,
  risk: colors.status.warning,
};

const DIMENSION_LABELS: Record<string, string> = {
  regretRisk: 'Regret Risk',
  confidence: 'Confidence',
  valuesAlignment: 'Values',
  reversibility: 'Reversibility',
  risk: 'Risk',
};

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <View style={barStyles.row}>
      <Text style={barStyles.label}>{label}</Text>
      <View style={barStyles.track}>
        <View style={[barStyles.fill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      <Text style={[barStyles.value, { color }]}>{score}</Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  label: { width: 80, fontSize: typography.size.xs, color: colors.text.secondary },
  track: { flex: 1, height: 6, backgroundColor: colors.background.tertiary, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  value: { width: 28, fontSize: typography.size.sm, fontWeight: '700', textAlign: 'right' },
});

export default function AnalysisScreen(): JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<DecisionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();
  const { milestones } = useFeatureAccess(user?.id ?? null);

  const loadAnalysis = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const existing = await fetchDecisionAnalysis(id);
      if (existing) {
        setAnalysis(existing);
      } else {
        setAnalysis(null);
      }
    } catch (err) {
      setError('Failed to load analysis.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { loadAnalysis(); }, [loadAnalysis]);

  const handleAnalyze = useCallback(async () => {
    if (!id) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeDecision(id);
      setAnalysis(result.analysis);
    } catch (err) {
      if (err instanceof AnalysisServiceError) {
        if (err.code === 'FUNCTION_ERROR' && err.message.includes('429')) {
          setError('Monthly analysis limit reached. Upgrade for unlimited analyses.');
        } else if (err.code === 'FUNCTION_ERROR' && err.message.includes('403')) {
          setError('Please upgrade to analyze more decisions this month.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Analysis service unavailable. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [id]);

  const goToCommit = () => router.push(ROUTES.DECISION_COMMIT(id));
  const goToDecision = () => router.push(ROUTES.DECISION_DETAIL(id));

  if (isLoading) {
    return <LoadingState message="Loading analysis..." />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {error && (
          <ErrorState
            message={error}
            actionLabel="Try Again"
            onAction={handleAnalyze}
          />
        )}

        {!analysis && !isAnalyzing && !error && (
          <Card variant="elevated" style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🧠</Text>
            <Text style={styles.emptyTitle}>Ready to analyze?</Text>
            <Text style={styles.emptyDesc}>
              The AI will score each option on regret risk, confidence, values alignment, reversibility, and risk.
            </Text>
            <TouchableOpacity style={styles.analyzeBtn} onPress={handleAnalyze} activeOpacity={0.7}>
              <Text style={styles.analyzeBtnText}>Run Analysis</Text>
            </TouchableOpacity>
          </Card>
        )}

        {isAnalyzing && (
          <Card variant="elevated" style={styles.analyzingCard}>
            <ActivityIndicator size="large" color={colors.accent.primary} />
            <Text style={styles.analyzingText}>Analyzing your decision...</Text>
            <Text style={styles.analyzingSubtext}>The AI is evaluating tradeoffs and scoring each option.</Text>
          </Card>
        )}

        {analysis && (
          <>
            <Card variant="elevated" style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Summary</Text>
              <Text style={styles.summaryText}>{analysis.summary}</Text>
              <View style={styles.confidenceRow}>
                <Text style={styles.confidenceLabel}>Analysis confidence:</Text>
                <View style={styles.confidenceBar}>
                  <View style={[styles.confidenceFill, { width: `${analysis.confidenceLevel}%` }]} />
                </View>
                <Text style={styles.confidenceValue}>{analysis.confidenceLevel}%</Text>
              </View>
            </Card>

            <Text style={styles.optionsSectionTitle}>Option Scores</Text>

            {analysis.option_scores?.map((optionScore: OptionScore) => {
              const isTop = optionScore.overall_score === Math.max(...analysis.option_scores.map(o => o.overall_score));
              return (
                <Card key={optionScore.option_id} variant="elevated" style={[styles.optionCard, isTop && styles.topOption]}>
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionTitle}>{optionScore.option_title}</Text>
                    <View style={[styles.overallBadge, isTop && styles.topBadge]}>
                      <Text style={[styles.overallScore, isTop && styles.topScore]}>
                        {optionScore.overall_score}
                      </Text>
                    </View>
                  </View>
                  {isTop && <Text style={styles.recommendedBadge}>Recommended</Text>}
                  <Text style={styles.optionReasoning} numberOfLines={4}>{optionScore.reasoning}</Text>
                  {optionScore.scores && Object.entries(optionScore.scores).map(([key, val]) => (
                    <ScoreBar
                      key={key}
                      label={DIMENSION_LABELS[key] || key}
                      score={val as number}
                      color={DIMENSION_COLORS[key] || colors.text.tertiary}
                    />
                  ))}
                </Card>
              );
            })}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.primaryAction} onPress={goToCommit} activeOpacity={0.7}>
                <Text style={styles.primaryActionText}>Choose an option →</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryAction} onPress={goToDecision} activeOpacity={0.7}>
                <Text style={styles.secondaryActionText}>Back to decision</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backBtn: { minWidth: 60 },
  backText: { fontSize: typography.size.md, color: colors.accent.primary, fontWeight: '500' },
  headerTitle: { fontSize: typography.size.lg, fontWeight: '700', color: colors.text.primary },
  scrollContent: { padding: spacing.md, paddingBottom: 120 },
  emptyCard: { padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: typography.size.xl, fontWeight: '700', color: colors.text.primary, marginBottom: spacing.sm },
  emptyDesc: { fontSize: typography.size.sm, color: colors.text.secondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  analyzeBtn: { backgroundColor: colors.accent.primary, borderRadius: 12, paddingHorizontal: spacing.xxl, paddingVertical: spacing.md },
  analyzeBtnText: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.inverse },
  analyzingCard: { padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md },
  analyzingText: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.primary, marginTop: spacing.md },
  analyzingSubtext: { fontSize: typography.size.sm, color: colors.text.tertiary, marginTop: spacing.xs, textAlign: 'center' },
  summaryCard: { padding: spacing.lg, marginBottom: spacing.md },
  summaryLabel: { fontSize: typography.size.xs, fontWeight: '700', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  summaryText: { fontSize: typography.size.sm, color: colors.text.secondary, lineHeight: 22, marginBottom: spacing.md },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  confidenceLabel: { fontSize: typography.size.xs, color: colors.text.tertiary },
  confidenceBar: { flex: 1, height: 4, backgroundColor: colors.background.tertiary, borderRadius: 2, overflow: 'hidden' },
  confidenceFill: { height: '100%', backgroundColor: colors.accent.primary, borderRadius: 2 },
  confidenceValue: { fontSize: typography.size.xs, fontWeight: '700', color: colors.accent.primary },
  optionsSectionTitle: { fontSize: typography.size.sm, fontWeight: '700', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md, marginTop: spacing.md },
  optionCard: { padding: spacing.lg, marginBottom: spacing.md },
  topOption: { borderWidth: 1, borderColor: colors.accent.primary },
  optionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  optionTitle: { fontSize: typography.size.md, fontWeight: '700', color: colors.text.primary, flex: 1 },
  overallBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.background.tertiary, alignItems: 'center', justifyContent: 'center' },
  topBadge: { backgroundColor: colors.accent.muted },
  overallScore: { fontSize: typography.size.lg, fontWeight: '800', color: colors.text.secondary },
  topScore: { color: colors.accent.primary },
  recommendedBadge: { fontSize: 10, fontWeight: '700', color: colors.accent.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  optionReasoning: { fontSize: typography.size.xs, color: colors.text.secondary, lineHeight: 18, marginBottom: spacing.md, fontStyle: 'italic' },
  actions: { gap: spacing.sm, paddingTop: spacing.md },
  primaryAction: { backgroundColor: colors.accent.primary, borderRadius: 12, padding: spacing.md, alignItems: 'center' },
  primaryActionText: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.inverse },
  secondaryAction: { alignItems: 'center', padding: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.border.primary },
  secondaryActionText: { fontSize: typography.size.md, fontWeight: '500', color: colors.text.secondary },
});