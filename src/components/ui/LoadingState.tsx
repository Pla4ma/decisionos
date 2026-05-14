// LoadingState — Full-screen and inline loading indicators (Phase 16)
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type LoadingVariant =
  | 'default'
  | 'saving'
  | 'loading'
  | 'analyzing'
  | 'checking'
  | 'submitting';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
  style?: object;
  variant?: LoadingVariant;
  submessage?: string;
}

const variantMessages: Record<LoadingVariant, { title: string; submessage?: string }> = {
  default: { title: 'Loading...' },
  saving: { title: 'Saving...', submessage: 'Securing your data' },
  loading: { title: 'Loading...', submessage: 'Gathering your decisions' },
  analyzing: { title: 'Analyzing...', submessage: 'AI is thinking through your options' },
  checking: { title: 'Checking...', submessage: 'Verifying your account' },
  submitting: { title: 'Submitting...', submessage: 'Processing your review' },
};

export function LoadingState({
  message,
  fullScreen = false,
  size = 'large',
  style,
  variant = 'default',
  submessage,
}: LoadingStateProps): JSX.Element {
  const variantConfig = variantMessages[variant];
  const displayMessage = message || variantConfig.title;
  const displaySubmessage = submessage || variantConfig.submessage;

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, style]}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
        <Text style={styles.fullScreenText}>{displayMessage}</Text>
        {displaySubmessage && (
          <Text style={styles.fullScreenSubtext}>{displaySubmessage}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.inline, style]}>
      <ActivityIndicator size={size} color={colors.accent.primary} />
      <View style={styles.inlineTextContainer}>
        <Text style={styles.inlineText}>{displayMessage}</Text>
        {displaySubmessage && (
          <Text style={styles.inlineSubtext}>{displaySubmessage}</Text>
        )}
      </View>
    </View>
  );
}

// Inline loader for lists/cards
export function InlineLoader(): JSX.Element {
  return (
    <View style={styles.inlineLoader}>
      <ActivityIndicator size="small" color={colors.accent.primary} />
    </View>
  );
}

// Specialized loading components
export function GeminiAnalyzingState({ style }: { style?: object }): JSX.Element {
  return (
    <View style={[styles.fullScreen, style]}>
      <View style={styles.geminiContainer}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
        <Text style={styles.geminiTitle}>Analyzing your decision</Text>
        <Text style={styles.geminiSubtext}>
          Gemini is evaluating your options across multiple dimensions
        </Text>
        <View style={styles.geminiSteps}>
          <Text style={styles.geminiStep}>• Weighing factors</Text>
          <Text style={styles.geminiStep}>• Calculating scores</Text>
          <Text style={styles.geminiStep}>• Finding tradeoffs</Text>
        </View>
      </View>
    </View>
  );
}

export function SavingDecisionState({ style }: { style?: object }): JSX.Element {
  return (
    <LoadingState
      variant="saving"
      fullScreen
      style={style}
    />
  );
}

export function LoadingDecisionsState({ style }: { style?: object }): JSX.Element {
  return (
    <LoadingState
      variant="loading"
      fullScreen
      style={style}
    />
  );
}

export function CheckingSubscriptionState({ style }: { style?: object }): JSX.Element {
  return (
    <LoadingState
      variant="checking"
      fullScreen
      style={style}
    />
  );
}

export function SubmittingReviewState({ style }: { style?: object }): JSX.Element {
  return (
    <LoadingState
      variant="submitting"
      fullScreen
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  fullScreenText: {
    marginTop: spacing.md,
    fontSize: typography.size.md,
    color: colors.text.secondary,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  inlineText: {
    marginLeft: spacing.sm,
    fontSize: typography.size.md,
    color: colors.text.secondary,
  },
  inlineLoader: {
    padding: spacing.md,
    alignItems: 'center',
  },
  inlineTextContainer: {
    marginLeft: spacing.sm,
  },
  inlineSubtext: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  fullScreenSubtext: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  geminiContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  geminiTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  geminiSubtext: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  geminiSteps: {
    marginTop: spacing.xl,
    alignItems: 'flex-start',
  },
  geminiStep: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginVertical: spacing.xs,
  },
});
