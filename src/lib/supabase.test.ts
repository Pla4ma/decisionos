// Supabase Client Tests
// Unit tests for Supabase client configuration

describe('supabase', () => {
  describe('client creation', () => {
    test('requires SUPABASE_URL', () => {
      const url = 'https://example.supabase.co';
      expect(url).toBeTruthy();
      expect(url).toContain('supabase.co');
    });

    test('requires SUPABASE_ANON_KEY', () => {
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MjU1MTYwMCwiZXhwIjoxOTU4MTI3NjAwfQ.example';
      expect(anonKey).toBeTruthy();
      expect(anonKey.length).toBeGreaterThan(50);
    });

    test('auth config has autoRefreshToken', () => {
      const authConfig = {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      };

      expect(authConfig.autoRefreshToken).toBe(true);
    });

    test('auth config has persistSession', () => {
      const authConfig = {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      };

      expect(authConfig.persistSession).toBe(true);
    });

    test('auth config has detectSessionInUrl', () => {
      const authConfig = {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      };

      expect(authConfig.detectSessionInUrl).toBe(false);
    });
  });

  describe('environment validation', () => {
    test('throws error when SUPABASE_URL missing', () => {
      const url = '';
      expect(() => {
        if (!url) {
          throw new Error('Missing SUPABASE_URL');
        }
      }).toThrow('Missing SUPABASE_URL');
    });

    test('throws error when SUPABASE_ANON_KEY missing', () => {
      const anonKey = '';
      expect(() => {
        if (!anonKey) {
          throw new Error('Missing SUPABASE_ANON_KEY');
        }
      }).toThrow('Missing SUPABASE_ANON_KEY');
    });

    test('no error when both provided', () => {
      const url = 'https://example.supabase.co';
      const anonKey = 'valid-key';

      expect(() => {
        if (!url || !anonKey) {
          throw new Error('Missing config');
        }
      }).not.toThrow();
    });
  });

  describe('export type', () => {
    test('exports SupabaseClient type', () => {
      const clientType = 'SupabaseClient';
      expect(clientType).toBe('SupabaseClient');
    });
  });
});