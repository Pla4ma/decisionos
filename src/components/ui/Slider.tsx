// Slider — Range slider with labels
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  step: number;
  labels?: [string, string];
}

export function Slider({
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  step,
  labels,
}: SliderProps): JSX.Element {
  const range = maximumValue - minimumValue;
  const steps = range / step;

  return (
    <View style={styles.container}>
      <View style={styles.trackContainer}>
        <View style={styles.track} />
        <View
          style={[
            styles.fill,
            {
              width: `${((value - minimumValue) / range) * 100}%`,
            },
          ]}
        />
        <View style={styles.steps}>
          {Array.from({ length: steps + 1 }).map((_, index) => {
            const stepValue = minimumValue + index * step;
            const isActive = stepValue <= value;
            return (
              <View
                key={index}
                style={[
                  styles.step,
                  isActive && styles.stepActive,
                ]}
              />
            );
          })}
        </View>
      </View>
      {labels && (
        <View style={styles.labels}>
          <Text style={styles.label}>{labels[0]}</Text>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.label}>{labels[1]}</Text>
        </View>
      )}
      {!labels && (
        <Text style={styles.valueCentered}>{value}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  trackContainer: {
    height: 24,
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: 2,
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: 4,
    backgroundColor: colors.accent.primary,
    borderRadius: 2,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  step: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.primary,
  },
  stepActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
  value: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.accent.primary,
  },
  valueCentered: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.accent.primary,
    textAlign: 'center',
  },
});
