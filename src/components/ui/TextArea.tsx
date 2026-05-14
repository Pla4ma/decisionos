// TextArea — Multi-line text input with validation
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';

interface TextAreaProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helper?: string;
  disabled?: boolean;
  maxLength?: number;
  numberOfLines?: number;
  style?: object;
}

export function TextArea({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  helper,
  disabled = false,
  maxLength,
  numberOfLines = 4,
  style,
}: TextAreaProps): JSX.Element {
  const hasError = !!error;
  const currentLength = value?.length || 0;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, hasError && styles.inputError, disabled && styles.disabled]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          editable={!disabled}
          maxLength={maxLength}
          multiline
          numberOfLines={numberOfLines}
          textAlignVertical="top"
          style={[styles.input, { minHeight: numberOfLines * 24 }]}
        />
      </View>
      <View style={styles.footer}>
        {hasError ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : helper ? (
          <Text style={styles.helperText}>{helper}</Text>
        ) : (
          <View />
        )}
        {maxLength && (
          <Text style={[styles.counter, currentLength >= maxLength && styles.counterMax]}>
            {currentLength}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.normal * typography.size.md,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: colors.background.tertiary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: spacing.xs,
  },
  errorText: {
    fontSize: typography.size.xs,
    color: colors.status.error,
    flex: 1,
  },
  helperText: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    flex: 1,
  },
  counter: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  counterMax: {
    color: colors.status.error,
  },
});
