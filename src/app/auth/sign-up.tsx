// FLOW: /auth/sign-up — New User Registration
// FROM: /onboarding/values (after values selection)
// TO: / (home) after successful sign-up
// STATE: Creates auth user, persists values_profile, sets onboarding_completed
import { Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/features/auth/useAuth';
import { supabase } from '@/lib/supabase';
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

    const userData = await signUp({ email, password });
    if (userData) {
      try {
        const pendingRaw = await AsyncStorage.getItem('pending_onboarding_values');
        if (pendingRaw) {
          const pending = JSON.parse(pendingRaw);
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('profiles').upsert({
              id: user.id,
              values_profile: { selected_values: pending.values, memory_enabled: pending.memory_enabled },
              onboarding_completed: true,
            }).eq('id', user.id);
          }
          await AsyncStorage.removeItem('pending_onboarding_values');
        }
      } catch {}
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.replace(ROUTES.HOME);
      }
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
          error={emailError ?? undefined}
          editable={!isLoading}
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Create a strong password"
          secureTextEntry
          helper="At least 8 characters"
          error={passwordError ?? undefined}
          editable={!isLoading}
        />
        <TextField
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter your password"
          secureTextEntry
          error={confirmError ?? undefined}
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
