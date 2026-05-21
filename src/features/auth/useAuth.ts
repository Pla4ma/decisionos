import { useAuthContext } from './AuthContext';

export function useAuth() {
  const ctx = useAuthContext();
  return {
    user: ctx.user,
    isLoading: ctx.isLoading,
    isAuthenticated: ctx.isAuthenticated,
    error: ctx.error,
    signUp: ctx.signUp,
    signIn: ctx.signIn,
    signOut: ctx.signOut,
    clearError: ctx.clearError,
  };
}

export type { AuthUser, SignUpInput, SignInInput, AuthError, AuthState } from './authTypes';
