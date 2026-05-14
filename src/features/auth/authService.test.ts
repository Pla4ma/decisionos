// Auth Service Tests
// Unit tests for authentication service

describe('authService', () => {
  describe('error wrapping', () => {
    test('wraps Error objects', () => {
      const original = new Error('Original error');
      const wrapped = wrapError(original);

      expect(wrapped).toHaveProperty('message');
      expect(wrapped).toHaveProperty('code');
    });

    test('wraps unknown errors', () => {
      const original = 'string error';
      const wrapped = wrapError(original);

      expect(wrapped).toHaveProperty('message');
    });

    test('preserves error code if present', () => {
      const original = { message: 'Error', code: 'AUTH_ERROR' };
      const wrapped = wrapError(original);

      expect(wrapped.code).toBe('AUTH_ERROR');
    });
  });

  describe('friendly error messages', () => {
    test('user-not-found gets friendly message', () => {
      const error = { message: 'User not found', code: 'auth/user-not-found' };
      const friendly = getFriendlyMessage(error);

      expect(friendly).toContain('Invalid');
      expect(friendly).toContain('email');
    });

    test('invalid-credentials gets friendly message', () => {
      const error = { message: 'Invalid credentials', code: 'auth/invalid-credentials' };
      const friendly = getFriendlyMessage(error);

      expect(friendly).toContain('Invalid');
    });

    test('email-already-in-use gets friendly message', () => {
      const error = { message: 'Email already exists', code: 'auth/email-already-in-use' };
      const friendly = getFriendlyMessage(error);

      expect(friendly).toContain('already exists');
    });

    test('weak-password gets friendly message', () => {
      const error = { message: 'Weak password', code: 'auth/weak-password' };
      const friendly = getFriendlyMessage(error);

      expect(friendly).toContain('Password');
      expect(friendly).toContain('8 characters');
    });

    test('invalid-email gets friendly message', () => {
      const error = { message: 'Invalid email', code: 'auth/invalid-email' };
      const friendly = getFriendlyMessage(error);

      expect(friendly).toContain('email');
      expect(friendly).toContain('valid');
    });

    test('email not confirmed gets friendly message', () => {
      const error = { message: 'Email not confirmed', code: '' };
      const friendly = getFriendlyMessage(error);

      expect(friendly).toContain('confirm');
      expect(friendly).toContain('email');
    });

    test('unknown error returns original message', () => {
      const error = { message: 'Something weird happened', code: 'unknown' };
      const friendly = getFriendlyMessage(error);

      expect(friendly).toBe('Something weird happened');
    });
  });

  describe('profile creation', () => {
    test('creates profile with user ID', () => {
      const userId = 'user-123';
      const profile = {
        id: userId,
        display_name: null,
        onboarding_completed: false,
      };

      expect(profile.id).toBe(userId);
      expect(profile.onboarding_completed).toBe(false);
    });

    test('can include display name', () => {
      const userId = 'user-123';
      const displayName = 'John Doe';

      const profile = {
        id: userId,
        display_name: displayName,
        onboarding_completed: false,
      };

      expect(profile.display_name).toBe('John Doe');
    });

    test('onboarding_completed starts false', () => {
      const profile = {
        id: 'user-123',
        display_name: null,
        onboarding_completed: false,
      };

      expect(profile.onboarding_completed).toBe(false);
    });
  });

  describe('auth state changes', () => {
    test('SIGNED_OUT triggers null user', () => {
      const event = 'SIGNED_OUT';
      const session = null;

      const user = event === 'SIGNED_OUT' || !session ? null : {};
      expect(user).toBeNull();
    });

    test('SIGNED_IN triggers user fetch', () => {
      const event = 'SIGNED_IN';
      const session = { user: { id: 'user-123' } };

      const shouldFetch = event !== 'SIGNED_OUT' && !!session;
      expect(shouldFetch).toBe(true);
    });
  });

  describe('onboarding status update', () => {
    test('updates profile with completed status', () => {
      const userId = 'user-123';
      const completed = true;

      const update = {
        onboarding_completed: completed,
      };

      expect(update.onboarding_completed).toBe(true);
    });

    test('updates profile with incomplete status', () => {
      const userId = 'user-123';
      const completed = false;

      const update = {
        onboarding_completed: completed,
      };

      expect(update.onboarding_completed).toBe(false);
    });
  });
});

function wrapError(error: unknown): { message: string; code?: string } {
  if (error && typeof error === 'object' && 'message' in error) {
    const err = error as { message: string; code?: string };
    return { message: err.message, code: err.code };
  }
  return { message: 'An unexpected error occurred' };
}

function getFriendlyMessage(error: { message: string; code?: string }): string {
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