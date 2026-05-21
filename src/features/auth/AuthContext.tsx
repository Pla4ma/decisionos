import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthUser, AuthError, SignUpInput, SignInInput } from './authTypes';
import { signUp, signIn, signOut, getCurrentUser } from './authService';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
  signIn: (input: SignInInput) => Promise<boolean>;
  signUp: (input: SignUpInput) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const u = await getCurrentUser();
      setUser(u);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = useCallback(async (input: SignInInput): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    const { user: u, error: err } = await signIn(input);
    if (err || !u) {
      setError(err);
      setIsLoading(false);
      return false;
    }
    setUser(u);
    setIsLoading(false);
    return true;
  }, []);

  const handleSignUp = useCallback(async (input: SignUpInput): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    const { user: u, error: err } = await signUp(input);
    if (err || !u) {
      setError(err);
      setIsLoading(false);
      return false;
    }
    setUser(u);
    setIsLoading(false);
    return true;
  }, []);

  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    await signOut();
    setUser(null);
    setIsLoading(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      error,
      isAuthenticated: !!user,
      signIn: handleSignIn,
      signUp: handleSignUp,
      signOut: handleSignOut,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
