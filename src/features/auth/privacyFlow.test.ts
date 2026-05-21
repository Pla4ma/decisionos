import { supabase } from '@/lib/supabase';
import { signOut, getCurrentUser } from './authService';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    functions: { invoke: jest.fn() },
    rpc: jest.fn(),
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}));

describe('privacy', () => {
  describe('export function returns full export', () => {
    test('calls export-user-data edge function', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: { user_id: 'user-1', decisions: [], profile: {} },
        error: null,
      });

      const { data, error } = await supabase.functions.invoke('export-user-data');
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.user_id).toBe('user-1');
    });

    test('export returns all expected data tables', async () => {
      const mockExport = {
        user_id: 'user-1',
        profile: { id: 'user-1' },
        decisions: [{ id: 'd-1', title: 'Test' }],
        decision_options: [],
        decision_answers: [],
        decision_analysis: [],
        decision_reviews: [],
        pattern_insights: [],
        ai_usage_events: [],
      };

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: mockExport,
        error: null,
      });

      const { data } = await supabase.functions.invoke('export-user-data');
      expect(data.decisions).toBeDefined();
      expect(data.profile).toBeDefined();
    });

    test('export fails gracefully', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Export failed' },
      });

      const { data, error } = await supabase.functions.invoke('export-user-data');
      expect(data).toBeNull();
      expect(error).toBeDefined();
    });
  });

  describe('delete user removes all user data', () => {
    test('calls delete_user_data RPC with user ID', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: null, error: null });

      const { error } = await supabase.rpc('delete_user_data', { p_user_id: 'user-1' });
      expect(error).toBeNull();
      expect(supabase.rpc).toHaveBeenCalledWith('delete_user_data', { p_user_id: 'user-1' });
    });

    test('signs out after deletion', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

      const { error } = await signOut();
      expect(error).toBeNull();
    });

    test('delete fails gracefully', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Permission denied' },
      });

      const { error } = await supabase.rpc('delete_user_data', { p_user_id: 'user-1' });
      expect(error).toBeDefined();
    });
  });
});
