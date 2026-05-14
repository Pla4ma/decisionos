// TextField — Single-line text input with validation
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing, touchTargets } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';

interface TextFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helper?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  style?: object;
}

export function TextField({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  helper,
  disabled = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
  style,
}: TextFieldProps): JSX.Element {
  const hasError = !!error;

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
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          style={styles.input}
        />
      </View>
      {hasError && <Text style={styles.errorText}>{error}</Text>}
      {!hasError && helper && <Text style={styles.helperText}>{helper}</Text>}
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
    minHeight: touchTargets.minHeight,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  input: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: colors.background.tertiary,
  },
  errorText: {
    fontSize: typography.size.xs,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});
