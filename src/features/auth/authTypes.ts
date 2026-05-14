// Auth Types
// Type definitions for authentication domain

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  onboardingCompleted: boolean;
}

export interface SignUpInput {
  email: string;
  password: string;
  displayName?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export type AuthState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'unauthenticated' }
  | { status: 'error'; error: AuthError };
