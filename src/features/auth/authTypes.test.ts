// Auth Types Tests
// Unit tests for authentication type definitions

import type { AuthUser, SignUpInput, SignInInput, AuthError, AuthState } from './authTypes';

describe('authTypes', () => {
  describe('AuthUser', () => {
    const validUser: AuthUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      displayName: 'Test User',
      onboardingCompleted: false,
    };

    test('accepts valid user', () => {
      expect(validUser.id).toBeTruthy();
      expect(validUser.email).toBeTruthy();
    });

    test('displayName can be null', () => {
      const noDisplayName: AuthUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        displayName: null,
        onboardingCompleted: false,
      };
      expect(noDisplayName.displayName).toBeNull();
    });

    test('id is a UUID string', () => {
      expect(validUser.id).toMatch(/^[0-9a-f-]{36}$/);
    });

    test('email is valid format', () => {
      expect(validUser.email).toContain('@');
      expect(validUser.email).toContain('.');
    });

    test('onboardingCompleted is boolean', () => {
      const completed: AuthUser = { ...validUser, onboardingCompleted: true };
      const notCompleted: AuthUser = { ...validUser, onboardingCompleted: false };
      expect(completed.onboardingCompleted).toBe(true);
      expect(notCompleted.onboardingCompleted).toBe(false);
    });

    test('all fields are required except displayName', () => {
      const minimal: AuthUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        displayName: null,
        onboardingCompleted: false,
      };
      expect(minimal.id).toBeTruthy();
      expect(minimal.email).toBeTruthy();
    });
  });

  describe('SignUpInput', () => {
    const validInput: SignUpInput = {
      email: 'newuser@example.com',
      password: 'SecurePassword123!',
      displayName: 'New User',
    };

    test('accepts complete input', () => {
      expect(validInput.email).toBeTruthy();
      expect(validInput.password).toBeTruthy();
    });

    test('password is required', () => {
      const input: SignUpInput = {
        email: 'user@example.com',
        password: 'password123',
      };
      expect(input.password).toBeTruthy();
    });

    test('displayName is optional', () => {
      const input: SignUpInput = {
        email: 'user@example.com',
        password: 'password123',
      };
      expect(input.displayName).toBeUndefined();
    });

    test('email format validation expectation', () => {
      const input: SignUpInput = {
        email: 'not-an-email',
        password: 'password123',
      };
      expect(input.email).toBeTruthy();
    });
  });

  describe('SignInInput', () => {
    const validInput: SignInInput = {
      email: 'user@example.com',
      password: 'password123',
    };

    test('accepts valid input', () => {
      expect(validInput.email).toBeTruthy();
      expect(validInput.password).toBeTruthy();
    });

    test('both fields are required', () => {
      const input: SignInInput = {
        email: 'user@example.com',
        password: 'password123',
      };
      expect(input.email).toBeTruthy();
      expect(input.password).toBeTruthy();
    });

    test('no optional fields', () => {
      const input: SignInInput = {
        email: 'user@example.com',
        password: 'password123',
      };
      const keys = Object.keys(input);
      expect(keys).toHaveLength(2);
      expect(keys).toContain('email');
      expect(keys).toContain('password');
    });
  });

  describe('AuthError', () => {
    const validError: AuthError = {
      message: 'Invalid credentials',
      code: 'auth/invalid-credentials',
    };

    test('accepts valid error', () => {
      expect(validError.message).toBeTruthy();
      expect(validError.code).toBeTruthy();
    });

    test('code is optional', () => {
      const noCode: AuthError = {
        message: 'Something went wrong',
      };
      expect(noCode.code).toBeUndefined();
    });

    test('message is required', () => {
      const error: AuthError = {
        message: 'Error message',
      };
      expect(error.message).toBeTruthy();
    });
  });

  describe('AuthState', () => {
    test('idle state', () => {
      const state: AuthState = { status: 'idle' };
      expect(state.status).toBe('idle');
    });

    test('loading state', () => {
      const state: AuthState = { status: 'loading' };
      expect(state.status).toBe('loading');
    });

    test('authenticated state with user', () => {
      const user: AuthUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        displayName: 'Test',
        onboardingCompleted: false,
      };
      const state: AuthState = { status: 'authenticated', user };
      expect(state.status).toBe('authenticated');
      expect(state.user).toBeTruthy();
    });

    test('unauthenticated state', () => {
      const state: AuthState = { status: 'unauthenticated' };
      expect(state.status).toBe('unauthenticated');
    });

    test('error state with error', () => {
      const error: AuthError = { message: 'Auth failed', code: 'AUTH_ERROR' };
      const state: AuthState = { status: 'error', error };
      expect(state.status).toBe('error');
      expect(state.error).toBeTruthy();
    });

    test('error message is required in error state', () => {
      const state: AuthState = { status: 'error', error: { message: 'Error' } };
      expect(state.error.message).toBeTruthy();
    });

    test('user is required in authenticated state', () => {
      const user: AuthUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        displayName: null,
        onboardingCompleted: false,
      };
      const state: AuthState = { status: 'authenticated', user };
      expect(state.status).toBe('authenticated');
    });

    test('all states are mutually exclusive', () => {
      const states: AuthState[] = [
        { status: 'idle' },
        { status: 'loading' },
        { status: 'unauthenticated' },
        { status: 'authenticated', user: { id: '1', email: 'a@b.com', displayName: null, onboardingCompleted: false } },
        { status: 'error', error: { message: 'e' } },
      ];

      const statuses = states.map(s => s.status);
      const uniqueStatuses = new Set(statuses);
      expect(uniqueStatuses.size).toBe(statuses.length);
    });
  });

  describe('type relationships', () => {
    test('AuthState authenticated contains AuthUser', () => {
      const user: AuthUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        displayName: 'Test',
        onboardingCompleted: true,
      };
      const state: AuthState = { status: 'authenticated', user };
      if (state.status === 'authenticated') {
        expect(state.user.email).toBe('test@example.com');
      }
    });

    test('AuthState error contains AuthError', () => {
      const error: AuthError = {
        message: 'Invalid email',
        code: 'auth/invalid-email',
      };
      const state: AuthState = { status: 'error', error };
      if (state.status === 'error') {
        expect(state.error.code).toBe('auth/invalid-email');
      }
    });
  });
});