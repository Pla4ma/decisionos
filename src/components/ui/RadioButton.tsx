// RadioButton — Single-select option with label and optional description
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface RadioButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  description?: string;
  disabled?: boolean;
}

export function RadioButton({ label, selected, onPress, description, disabled }: RadioButtonProps): JSX.Element {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selectedContainer, disabled && styles.disabledContainer]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.radio, selected && styles.radioSelected, disabled && styles.radioDisabled]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <View style={styles.content}>
        <Text style={[styles.label, selected && styles.labelSelected, disabled && styles.labelDisabled]}>
          {label}
        </Text>
        {description && (
          <Text style={[styles.description, disabled && styles.descriptionDisabled]} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    marginBottom: spacing.sm,
    backgroundColor: colors.background.primary,
  },
  selectedContainer: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.accent.primary + '10',
  },
  disabledContainer: {
    opacity: 0.5,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border.primary,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioSelected: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.accent.primary + '20',
  },
  radioDisabled: {
    borderColor: colors.border.secondary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent.primary,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },
  labelSelected: {
    fontWeight: typography.weight.semibold,
    color: colors.accent.primary,
  },
  labelDisabled: {
    color: colors.text.tertiary,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  descriptionDisabled: {
    color: colors.text.tertiary,
  },
});
