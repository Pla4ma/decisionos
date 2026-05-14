// useAuth Hook
// React hook for authentication state and operations

import { useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  SignUpInput,
  SignInInput,
  AuthError,
  AuthState,
} from './authTypes';
import {
  signUp as signUpService,
  signIn as signInService,
  signOut as signOutService,
  getCurrentUser,
  listenToAuthChanges,
  updateOnboardingStatus,
} from './authService';

// useAuth hook
export function useAuth() {
  const [state, setState] = useState<AuthState>({ status: 'idle' });

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const user = await getCurrentUser();
      if (isMounted) {
        if (user) {
          setState({ status: 'authenticated', user });
        } else {
          setState({ status: 'unauthenticated' });
        }
      }
    }

    initAuth();

    // Listen for auth changes
    const unsubscribe = listenToAuthChanges((user) => {
      if (isMounted) {
        if (user) {
          setState({ status: 'authenticated', user });
        } else {
          setState({ status: 'unauthenticated' });
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Sign up
  const signUp = useCallback(async (input: SignUpInput): Promise<boolean> => {
    setState({ status: 'loading' });

    const { user, error } = await signUpService(input);

    if (error) {
      setState({ status: 'error', error });
      return false;
    }

    if (user) {
      setState({ status: 'authenticated', user });
      return true;
    }

    // Email confirmation required
    setState({ status: 'unauthenticated' });
    return true;
  }, []);

  // Sign in
  const signIn = useCallback(async (input: SignInInput): Promise<boolean> => {
    setState({ status: 'loading' });

    const { user, error } = await signInService(input);

    if (error) {
      setState({ status: 'error', error });
      return false;
    }

    if (user) {
      setState({ status: 'authenticated', user });
      return true;
    }

    setState({ status: 'unauthenticated' });
    return false;
  }, []);

  // Sign out
  const signOut = useCallback(async (): Promise<void> => {
    setState({ status: 'loading' });

    const { error } = await signOutService();

    if (error) {
      setState({ status: 'error', error });
      return;
    }

    setState({ status: 'unauthenticated' });
  }, []);

  // Complete onboarding
  const completeOnboarding = useCallback(async (): Promise<void> => {
    if (state.status !== 'authenticated') {
      return;
    }

    const { error } = await updateOnboardingStatus(state.user.id, true);

    if (error) {
      console.error('Failed to update onboarding status:', error);
      return;
    }

    // Update local state
    setState({
      status: 'authenticated',
      user: { ...state.user, onboardingCompleted: true },
    });
  }, [state]);

  // Clear error
  const clearError = useCallback((): void => {
    if (state.status === 'error') {
      setState({ status: 'idle' });
    }
  }, [state]);

  return {
    state,
    user: state.status === 'authenticated' ? state.user : null,
    isLoading: state.status === 'loading',
    isAuthenticated: state.status === 'authenticated',
    error: state.status === 'error' ? state.error : null,
    signUp,
    signIn,
    signOut,
    completeOnboarding,
    clearError,
  };
}

// Export types
export type { AuthUser, SignUpInput, SignInInput, AuthError, AuthState };
