// FLOW: /auth/sign-up — New User Registration
// FROM: /auth/sign-in (tap "Create Account")
// TO: /onboarding (after successful sign-up)
// STATE: Creates auth user + profile row
// See FLOW_ARCHITECTURE.md §2
import { Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { isValidEmail, isValidPassword } from '@/utils/validation';
import { ROUTES } from '@/config/routes';

export default function SignUpScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signUp, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const handleSignUp = async () => {
    clearError();
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);

    // Validate
    let hasError = false;
    if (!email || !isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }
    if (!password || !isValidPassword(password)) {
      setPasswordError('Password must be at least 8 characters');
      hasError = true;
    }
    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      hasError = true;
    }
    if (hasError) return;

    const success = await signUp({ email, password });
    if (success) {
      // Navigate to onboarding or home depending on onboarding status
      router.replace(ROUTES.ONBOARDING);
    }
  };

  const isFormValid =
    email.length > 0 &&
    password.length >= 8 &&
    confirmPassword.length >= 8 &&
    password === confirmPassword;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start making better decisions today</Text>
      </View>

      <View style={styles.form}>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={emailError}
          editable={!isLoading}
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Create a strong password"
          secureTextEntry
          helper="At least 8 characters"
          error={passwordError}
          editable={!isLoading}
        />
        <TextField
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter your password"
          secureTextEntry
          error={confirmError}
          editable={!isLoading}
        />
        {error && (
          <Text style={styles.errorText}>{error.message}</Text>
        )}
        <Button
          title={isLoading ? 'Creating Account...' : 'Create Account'}
          variant="primary"
          onPress={handleSignUp}
          disabled={!isFormValid || isLoading}
          loading={isLoading}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Link href={ROUTES.SIGN_IN} asChild>
          <Button title="Sign In" variant="ghost" disabled={isLoading} />
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
  },
  header: {
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
  },
  form: {
    gap: spacing.md,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  footerText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  errorText: {
    fontSize: typography.size.sm,
    color: colors.status.error,
    textAlign: 'center',
  },
});
