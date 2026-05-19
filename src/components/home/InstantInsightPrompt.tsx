import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';

interface InstantInsight {
  bias: string;
  blindSpot: string;
  action: string;
}

interface InstantInsightPromptProps {
  onInsightGenerated: (insight: InstantInsight) => void;
  onStartFullAnalysis: (prefill: string) => void;
  onDismiss?: () => void;
}

export function InstantInsightPrompt({ onInsightGenerated, onStartFullAnalysis, onDismiss }: InstantInsightPromptProps): JSX.Element {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insight, setInsight] = useState<InstantInsight | null>(null);

  const analyze = useCallback(async () => {
    if (!input.trim() || input.trim().length < 10) return;
    setIsAnalyzing(true);

    await new Promise(r => setTimeout(r, 1200));

    const text = input.toLowerCase();
    let bias = 'Confirmation bias — you are probably seeking evidence for what you already want to do.';
    let blindSpot = '';
    let action = '';

    if (text.includes('quit') || text.includes('job') || text.includes('career')) {
      bias = 'Loss aversion — you are weighing what you lose more heavily than what you gain. Research shows people overestimate the pain of career changes by 2x.';
      blindSpot = 'You have not considered what staying costs you in opportunity and growth. The status quo feels safe but has its own hidden risks.';
      action = 'Today: write down what your life looks like in 1 year if nothing changes. Then write what it looks like if you make the change. Compare honestly.';
    } else if (text.includes('move') || text.includes('city') || text.includes('relocat')) {
      bias = 'Hindsight bias — you are comparing an uncertain future to a remembered past. Your current city is probably worse than you remember and the new one is probably better than you fear.';
      blindSpot = 'You are probably over-weighting the logistics (cost, time) and under-weighting the identity shift. A move changes who you are, not just where you are.';
      action = 'Today: spend 2 hours in the neighborhood you would move to (virtually or in person). Do not decide. Just observe how it feels.';
    } else if (text.includes('money') || text.includes('buy') || text.includes('purchase') || text.includes('invest')) {
      bias = 'Anchoring — you are fixating on a specific number or option and comparing everything to it.';
      blindSpot = 'You are treating money as the primary dimension. Money decisions are almost never just about money — they are about identity, security, or freedom.';
      action = 'Today: reframe the question. Instead of "can I afford this?" ask "what version of my life does this purchase create?"';
    } else if (text.includes('business') || text.includes('start') || text.includes('startup')) {
      bias = 'Optimism bias — entrepreneurs systematically underestimate timelines and overestimate demand. This is not a bug, it is how new things get built. The question is whether you can survive the gap.';
      blindSpot = 'You are probably focused on the idea and under-weighting your personal resilience for the worst 6 months.';
      action = 'Today: talk to someone who started the SAME business in the last 2 years. Ask them what they wish they knew.';
    } else if (text.includes('school') || text.includes('degree') || text.includes('study') || text.includes('class')) {
      bias = 'Sunk cost — past effort or tuition should not influence this decision, but it probably is.';
      blindSpot = 'You are probably choosing between the expected path and an uncertain one. The expected path has clearer outcomes but may not be right for you.';
      action = 'Today: imagine you had 3 years of your life and unlimited money. What would you study? Now ask: why is that different from your actual choice?';
    } else if (text.includes('relationship') || text.includes('break') || text.includes('partner')) {
      bias = 'Nostalgia bias — you are comparing a recent low to early highs. Relationships feel worse in the moment of deciding and better in retrospect.';
      blindSpot = 'You are probably making this decision in an emotional peak or trough. Decisions about people should never be made in the first 24 hours of a strong feeling.';
      action = 'Today: do not decide. Write down what you would tell your best friend if they were in your exact situation. Read it tomorrow.';
    } else {
      bias = 'Analysis paralysis — you are seeking more information to avoid the discomfort of choosing. More information rarely makes big decisions easier; it just delays the discomfort.';
      blindSpot = 'The decision that feels hardest is often the one where both options are genuinely good. That means you cannot make a wrong choice — just a different one.';
      action = 'Today: flip a coin. Not to decide, but to see which side makes you feel relieved or disappointed. That is your answer.';
    }

    const result: InstantInsight = { bias, blindSpot, action };
    setInsight(result);
    onInsightGenerated(result);
    setIsAnalyzing(false);
  }, [input, onInsightGenerated]);

  const handleSubmit = useCallback(() => {
    if (!insight) {
      analyze();
    }
  }, [insight, analyze]);

  const reset = useCallback(() => {
    setInput('');
    setInsight(null);
  }, []);

  const isReady = input.trim().length >= 10;

  return (
    <Card variant="elevated" style={styles.card}>
      {!insight ? (
        <>
          <Text style={styles.badge}>⚡ Instant Clarity</Text>
          <Text style={styles.title}>What decision is on your mind?</Text>
          <Text style={styles.subtitle}>
            Describe your situation in a few sentences. I will show you what you might be missing.
          </Text>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="I am trying to decide whether to..."
            placeholderTextColor={colors.text.disabled}
            multiline
            textAlignVertical="top"
            autoFocus
          />
          <TouchableOpacity
            style={[styles.submitBtn, !isReady && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.7}
            disabled={!isReady || isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Show me what I am missing</Text>
            )}
          </TouchableOpacity>
          {onDismiss && (
            <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss} activeOpacity={0.7}>
              <Text style={styles.dismissText}>Skip — I will create a decision instead</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <>
          <TouchableOpacity style={styles.backBtn} onPress={reset} activeOpacity={0.7}>
            <Text style={styles.backText}>← Start over</Text>
          </TouchableOpacity>

          <View style={styles.insightSection}>
            <Text style={styles.insightIcon}>🧠</Text>
            <Text style={styles.insightLabel}>Possible bias</Text>
            <Text style={styles.insightText}>{insight.bias}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.insightSection}>
            <Text style={styles.insightIcon}>🔍</Text>
            <Text style={styles.insightLabel}>What you might be missing</Text>
            <Text style={styles.insightText}>{insight.blindSpot}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.insightSection}>
            <Text style={styles.insightIcon}>🎯</Text>
            <Text style={styles.insightLabel}>One thing you can do today</Text>
            <Text style={styles.insightText}>{insight.action}</Text>
          </View>

          <TouchableOpacity
            style={styles.fullAnalysisBtn}
            onPress={() => onStartFullAnalysis(input)}
            activeOpacity={0.7}
          >
            <Text style={styles.fullAnalysisBtnText}>Track this decision properly →</Text>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>
            These are thinking prompts, not predictions. Use them to reflect, not to decide.
          </Text>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  badge: {
    fontSize: typography.size.xs,
    fontWeight: '700',
    color: colors.accent.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    padding: spacing.md,
    minHeight: 120,
    fontSize: typography.size.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    marginBottom: spacing.md,
  },
  submitBtn: {
    backgroundColor: colors.accent.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    fontSize: typography.size.md,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  dismissBtn: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  dismissText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
  backBtn: {
    marginBottom: spacing.md,
  },
  backText: {
    fontSize: typography.size.sm,
    color: colors.accent.primary,
    fontWeight: '500',
  },
  insightSection: {
    marginBottom: spacing.md,
  },
  insightIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  insightLabel: {
    fontSize: typography.size.xs,
    fontWeight: '700',
    color: colors.accent.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  insightText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.primary,
    marginBottom: spacing.md,
  },
  fullAnalysisBtn: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.accent,
    marginBottom: spacing.sm,
  },
  fullAnalysisBtnText: {
    fontSize: typography.size.md,
    fontWeight: '600',
    color: colors.accent.primary,
  },
  disclaimer: {
    fontSize: typography.size.xxs,
    color: colors.text.disabled,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});