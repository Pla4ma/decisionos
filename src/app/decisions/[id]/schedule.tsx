// Review Schedule — Schedule a future review for this decision
import { useCallback, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { RadioButton } from '@/components/ui/RadioButton';
import { getDecision, scheduleDecisionReview } from '@/features/decisions/decisionRepository';

const REVIEW_OPTIONS = [
  { days: 7, label: '1 week', description: 'Quick check-in for fast-moving decisions' },
  { days: 30, label: '1 month', description: 'Good for most medium-term decisions' },
  { days: 90, label: '3 months', description: 'Ideal for major life decisions' },
];

export default function ScheduleReviewScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedDays, setSelectedDays] = useState<number | null>(null);
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const { data: decision, isLoading, error } = useQuery({
    queryKey: ['decision', id],
    queryFn: () => getDecision(id),
    enabled: !!id,
  });

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      let reviewDate: Date;
      if (showCustomPicker && customDate) {
        reviewDate = customDate;
      } else if (selectedDays) {
        reviewDate = new Date();
        reviewDate.setDate(reviewDate.getDate() + selectedDays);
      } else {
        throw new Error('Please select a review date');
      }
      await scheduleDecisionReview(id, reviewDate);
    },
    onSuccess: () => {
      Alert.alert(
        'Review Scheduled',
        "We'll remind you to review this decision when the time comes.",
        [{ text: 'Done', onPress: () => router.push(`/decisions/${id}`) }]
      );
    },
    onError: (error) => {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to schedule review');
    },
  });

  const handleCustomDateChange = useCallback((event: unknown, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowCustomPicker(false);
    }
    if (date) {
      setCustomDate(date);
      setSelectedDays(null);
    }
  }, []);

  const handleOptionSelect = useCallback((days: number) => {
    setSelectedDays(days);
    setCustomDate(null);
    setShowCustomPicker(false);
  }, []);

  const getReviewDateText = useCallback(() => {
    if (showCustomPicker && customDate) {
      return customDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    if (selectedDays) {
      const date = new Date();
      date.setDate(date.getDate() + selectedDays);
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    return null;
  }, [selectedDays, customDate, showCustomPicker]);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Link href={`/decisions/${id}`} asChild>
            <Button title="Back" variant="ghost" size="small" />
          </Link>
          <Text style={styles.headerTitle}>Schedule Review</Text>
          <View style={styles.placeholder} />
        </View>
        <LoadingState message="Loading decision..." />
      </View>
    );
  }

  if (error || !decision) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Link href={`/decisions/${id}`} asChild>
            <Button title="Back" variant="ghost" size="small" />
          </Link>
          <Text style={styles.headerTitle}>Schedule Review</Text>
          <View style={styles.placeholder} />
        </View>
        <ErrorState message="Decision not found" onRetry={() => router.back()} />
      </View>
    );
  }

  const reviewDateText = getReviewDateText();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Link href={`/decisions/${id}`} asChild>
          <Button title="Back" variant="ghost" size="small" />
        </Link>
        <Text style={styles.headerTitle}>Schedule Review</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.decisionTitle}>{decision.title}</Text>
        <Text style={styles.subtitle}>When should DecisionOS check back in?</Text>

        <Card variant="outlined" style={styles.optionsCard}>
          <Text style={styles.optionsLabel}>Review Options</Text>
          {REVIEW_OPTIONS.map((option) => (
            <RadioButton
              key={option.days}
              label={option.label}
              description={option.description}
              selected={selectedDays === option.days}
              onPress={() => handleOptionSelect(option.days)}
            />
          ))}

          <RadioButton
            label="Custom date"
            description="Pick a specific date"
            selected={showCustomPicker}
            onPress={() => {
              setShowCustomPicker(true);
              setSelectedDays(null);
              if (!customDate) {
                const defaultDate = new Date();
                defaultDate.setDate(defaultDate.getDate() + 14);
                setCustomDate(defaultDate);
              }
            }}
          />
        </Card>

        {showCustomPicker && Platform.OS === 'ios' && (
          <Card style={styles.customCard}>
            <Text style={styles.customLabel}>Select Date</Text>
            {/* DatePicker would go here - using text input for now */}
            <Text style={styles.customHint}>Date picker placeholder (iOS)</Text>
          </Card>
        )}

        {reviewDateText && (
          <Card variant="elevated" style={styles.confirmCard}>
            <Text style={styles.confirmLabel}>Review scheduled for:</Text>
            <Text style={styles.confirmDate}>{reviewDateText}</Text>
            <Badge title="Reminder set" variant="info" size="small" style={styles.reminderBadge} />
          </Card>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Why review decisions?</Text>
          <Text style={styles.infoText}>
            DecisionOS gets better when you reflect on outcomes. Your reviews help identify patterns
            and improve future recommendations.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title={scheduleMutation.isPending ? 'Scheduling...' : 'Schedule Review'}
            variant="primary"
            onPress={() => scheduleMutation.mutate()}
            disabled={(!selectedDays && !customDate) || scheduleMutation.isPending}
          />
          <Link href={`/decisions/${id}`} asChild>
            <Button title="Skip for Now" variant="ghost" />
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.primary },
  headerTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.semibold, color: colors.text.primary },
  placeholder: { width: 60 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  decisionTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.semibold, color: colors.text.primary, marginBottom: spacing.sm },
  subtitle: { fontSize: typography.size.md, color: colors.text.secondary, marginBottom: spacing.lg },
  optionsCard: { marginBottom: spacing.lg },
  optionsLabel: { fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.text.secondary, marginBottom: spacing.md },
  customCard: { marginBottom: spacing.lg },
  customLabel: { fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.text.secondary, marginBottom: spacing.sm },
  customHint: { fontSize: typography.size.sm, color: colors.text.tertiary, fontStyle: 'italic' },
  confirmCard: { marginBottom: spacing.lg, backgroundColor: colors.status.info + '15' },
  confirmLabel: { fontSize: typography.size.sm, color: colors.text.secondary, marginBottom: spacing.xs },
  confirmDate: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.text.primary, marginBottom: spacing.sm },
  reminderBadge: { alignSelf: 'flex-start' },
  infoCard: { backgroundColor: colors.background.secondary, padding: spacing.md, borderRadius: 8, marginBottom: spacing.lg },
  infoTitle: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.text.primary, marginBottom: spacing.xs },
  infoText: { fontSize: typography.size.sm, color: colors.text.secondary, lineHeight: 20 },
  actions: { gap: spacing.md, marginTop: spacing.lg },
});
