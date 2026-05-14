// StepIndicator — Visual step progress indicator
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { CreateStep } from '@/features/decisions/useCreateDecision';

interface StepIndicatorProps {
  steps: CreateStep[];
  currentStep: CreateStep;
  stepLabels: Record<CreateStep, string>;
}

export function StepIndicator({ steps, currentStep, stepLabels }: StepIndicatorProps): JSX.Element {
  return (
    <View style={styles.container}>
      {steps.map((step) => (
        <View key={step} style={styles.stepItem}>
          <View style={[styles.stepDot, currentStep === step && styles.stepDotActive]} />
          <Text style={[styles.stepLabel, currentStep === step && styles.stepLabelActive]}>
            {stepLabels[step]}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  stepItem: { alignItems: 'center', gap: spacing.xs },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  stepDotActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
    transform: [{ scale: 1.2 }],
  },
  stepLabel: { fontSize: typography.size.xs, color: colors.text.tertiary },
  stepLabelActive: { color: colors.accent.primary, fontWeight: typography.weight.semibold },
});
