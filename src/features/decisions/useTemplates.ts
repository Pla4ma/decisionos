// useTemplates — Pre-built decision frameworks
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { isTableAccessible } from '@/features/progression/featureAccess';
import type { DecisionTemplate } from '@/features/decisions/templateTypes';

export function useTemplates() {
  const disabled = !isTableAccessible('decision_templates');

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates', 'active'],
    queryFn: async (): Promise<DecisionTemplate[]> => {
      if (disabled) return [];
      const { data, error } = await supabase
        .from('decision_templates')
        .select('*')
        .eq('is_active', true)
        .order('times_used', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as DecisionTemplate[];
    },
    enabled: !disabled,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const getTemplatesByCategory = (category: string): DecisionTemplate[] => {
    return (templates || []).filter(t => t.category === category);
  };

  const incrementTemplateUse = async (templateId: string): Promise<void> => {
    try { await supabase.rpc('increment_template_use', { p_template_id: templateId }); } catch {}
  };

  return {
    templates: templates || [],
    isLoading,
    getTemplatesByCategory,
    incrementTemplateUse,
    freeTemplates: (templates || []).filter(t => t.tier === 'free'),
    plusTemplates: (templates || []).filter(t => t.tier === 'plus'),
  };
}
