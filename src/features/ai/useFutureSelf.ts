import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { FutureSelfMessage, generateFutureSelfLetter } from './futureSelfTypes';
import { useAuth } from '@/features/auth';

interface UseFutureSelfReturn {
  unreadMessages: FutureSelfMessage[];
  latestMessage: FutureSelfMessage | null;
  totalCount: number;
  isLoading: boolean;
  generateWeeklyLetter: (dqScore: number, archetype: string, streakCount: number) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  archiveMessage: (id: string) => Promise<void>;
}

export function useFutureSelf(): UseFutureSelfReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['futureSelfMessages', user?.id],
    queryFn: async (): Promise<FutureSelfMessage[]> => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('future_self_messages')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data || []) as FutureSelfMessage[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const generateMutation = useMutation({
    mutationFn: async ({ dqScore, archetype, streakCount }: { dqScore: number; archetype: string; streakCount: number }) => {
      if (!user?.id) throw new Error('No user');
      const displayName = user.email?.split('@')[0] || 'there';
      const { data: existing } = await supabase
        .from('future_self_messages')
        .select('id')
        .eq('user_id', user.id)
        .eq('message_type', 'weekly_letter')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (existing && existing.length > 0) return;

      const letter = generateFutureSelfLetter(displayName, streakCount, dqScore, archetype, false, streakCount);
      const { error } = await supabase.from('future_self_messages').insert({
        user_id: user.id,
        message_type: 'weekly_letter',
        subject: letter.subject,
        body: letter.body,
        context: { days_since_last_message: 7 },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['futureSelfMessages', user?.id] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('future_self_messages').update({
        is_read: true,
        read_at: new Date().toISOString(),
      }).eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['futureSelfMessages', user?.id] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('future_self_messages').update({ is_archived: true }).eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['futureSelfMessages', user?.id] });
    },
  });

  const unreadMessages = messages.filter(m => !m.is_read);

  return {
    unreadMessages,
    latestMessage: messages[0] || null,
    totalCount: messages.length,
    isLoading,
    generateWeeklyLetter: async (dqScore, archetype, streakCount) =>
      generateMutation.mutateAsync({ dqScore, archetype, streakCount }),
    markAsRead: async (id) => markReadMutation.mutateAsync(id),
    archiveMessage: async (id) => archiveMutation.mutateAsync(id),
  };
}
