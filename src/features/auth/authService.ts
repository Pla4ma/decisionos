// Auth Service
// Supabase authentication operations

import { supabase } from '@/lib/supabase';
import { AuthUser, SignUpInput, SignInInput, AuthError } from './authTypes';

// Error wrapper for consistent error handling
function wrapAuthError(error: unknown): AuthError {
  if (error && typeof error === 'object' && 'message' in error) {
    const err = error as { message: string; code?: string };
    return { message: err.message, code: err.code };
  }
  return { message: 'An unexpected error occurred' };
}

// Get friendly error message for common auth errors
function getFriendlyErrorMessage(error: AuthError): string {
  const code = error.code || '';
  const message = error.message || '';

  if (code === 'auth/user-not-found' || code === 'auth/invalid-credentials') {
    return 'Invalid email or password. Please check and try again.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 8 characters.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (message.indexOf('Email not confirmed') >= 0) {
    return 'Please confirm your email address before signing in.';
  }

  return error.message;
}

// Sign up with email and password
export async function signUp(input: SignUpInput): Promise<{ user: AuthUser | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          display_name: input.displayName || '',
        },
      },
    });

    if (error) {
      const authError = wrapAuthError(error);
      return { user: null, error: { ...authError, message: getFriendlyErrorMessage(authError) } };
    }

    if (!data.user) {
      return { user: null, error: null };
    }

    // Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        display_name: input.displayName || null,
        onboarding_completed: false,
      });

    if (profileError) {
      console.error('Failed to create profile:', profileError);
    }

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email || '',
      displayName: input.displayName || null,
      onboardingCompleted: false,
    };

    return { user, error: null };
  } catch (error) {
    const authError = wrapAuthError(error);
    return { user: null, error: { ...authError, message: getFriendlyErrorMessage(authError) } };
  }
}

// Sign in with email and password
export async function signIn(input: SignInInput): Promise<{ user: AuthUser | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      const authError = wrapAuthError(error);
      return { user: null, error: { ...authError, message: getFriendlyErrorMessage(authError) } };
    }

    if (!data.user) {
      return { user: null, error: { message: 'Sign in failed. Please try again.' } };
    }

    // Fetch profile for onboarding status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, onboarding_completed')
      .eq('id', data.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Failed to fetch profile:', profileError);
    }

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email || '',
      displayName: profile?.display_name || null,
      onboardingCompleted: profile?.onboarding_completed || false,
    };

    return { user, error: null };
  } catch (error) {
    const authError = wrapAuthError(error);
    return { user: null, error: { ...authError, message: getFriendlyErrorMessage(authError) } };
  }
}

// Sign out
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: wrapAuthError(error) };
    }

    return { error: null };
  } catch (error) {
    return { error: wrapAuthError(error) };
  }
}

// Get current user
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Fetch profile for onboarding status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, onboarding_completed')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Failed to fetch profile:', profileError);
    }

    return {
      id: user.id,
      email: user.email || '',
      displayName: profile?.display_name || null,
      onboardingCompleted: profile?.onboarding_completed || false,
    };
  } catch {
    return null;
  }
}

// Listen to auth changes
export function listenToAuthChanges(callback: (user: AuthUser | null) => void): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || !session?.user) {
      callback(null);
      return;
    }

    // Fetch full user with profile
    const user = await getCurrentUser();
    callback(user);
  });

  return () => {
    subscription.unsubscribe();
  };
}

// Update onboarding status
export async function updateOnboardingStatus(
  userId: string,
  completed: boolean
): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed: completed })
      .eq('id', userId);

    if (error) {
      return { error: wrapAuthError(error) };
    }

    return { error: null };
  } catch (error) {
    return { error: wrapAuthError(error) };
  }
}
