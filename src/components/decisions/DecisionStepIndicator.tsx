import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type StepKey = 'basics' | 'options' | 'questions' | 'review';

interface Step {
  key: StepKey;
  label: string;
  number: number;
}

const STEPS: Step[] = [
  { key: 'basics', label: 'Basics', number: 1 },
  { key: 'options', label: 'Options', number: 2 },
  { key: 'questions', label: 'Reflect', number: 3 },
  { key: 'review', label: 'Review', number: 4 },
];

interface DecisionStepIndicatorProps {
  currentStep: StepKey;
  onStepPress: (step: StepKey) => void;
}

export function DecisionStepIndicator({ currentStep, onStepPress }: DecisionStepIndicatorProps) {
  const stepIndex = STEPS.findIndex(s => s.key === currentStep);

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
      {STEPS.map((step, i) => (
        <View key={step.key} style={{ alignItems: 'center', gap: 4 }}>
          <TouchableOpacity
            disabled={i > stepIndex}
            onPress={() => onStepPress(step.key)}
            style={{
              width: 32, height: 32, borderRadius: 16,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: i < stepIndex ? colors.status.success
                : i === stepIndex ? colors.accent.primary
                : colors.background.tertiary,
              borderWidth: i > stepIndex ? 1 : 0,
              borderColor: i > stepIndex ? colors.border.primary : undefined,
            }}
          >
            <Text style={{
              fontSize: 13, fontWeight: '700',
              color: i <= stepIndex ? colors.text.inverse : colors.text.disabled,
            }}>
              {i < stepIndex ? '✓' : step.number}
            </Text>
          </TouchableOpacity>
          <Text style={{
            fontSize: 10, color: colors.text.tertiary, fontWeight: '500',
            ...(i === stepIndex ? { color: colors.accent.primary, fontWeight: '700' as const } : {}),
          }}>
            {step.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
