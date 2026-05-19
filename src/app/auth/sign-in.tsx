// FLOW: /auth/sign-in — Existing User Login
// FROM: First app open (no session) | Sign Out from settings
// TO: /onboarding (if first time) | / (home) (if returning)
// STATE: Sets auth session → all queries enabled
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
import { isValidEmail } from '@/utils/validation';
import { ROUTES } from '@/config/routes';

export default function SignInScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSignIn = async () => {
    clearError();
    setEmailError(null);
    setPasswordError(null);

    // Validate
    let hasError = false;
    if (!email || !isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }
    if (!password || password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      hasError = true;
    }
    if (hasError) return;

    const success = await signIn({ email, password });
    if (success) {
      router.replace(ROUTES.HOME);
    }
  };

  const isFormValid = email.length > 0 && password.length >= 8;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue your decision journey</Text>
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
          placeholder="Enter your password"
          secureTextEntry
          error={passwordError}
          editable={!isLoading}
        />
        {error && (
          <Text style={styles.errorText}>{error.message}</Text>
        )}
        <Button
          title={isLoading ? 'Signing In...' : 'Sign In'}
          variant="primary"
          onPress={handleSignIn}
          disabled={!isFormValid || isLoading}
          loading={isLoading}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <Link href={ROUTES.SIGN_UP} asChild>
          <Button title="Sign Up" variant="ghost" disabled={isLoading} />
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
