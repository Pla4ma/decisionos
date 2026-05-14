// EmptyState — Display when no content exists
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  fullScreen?: boolean;
  style?: object;
}

export function EmptyState({
  icon = '📭',
  title,
  message,
  actionLabel,
  onAction,
  fullScreen = false,
  style,
}: EmptyStateProps): JSX.Element {
  const content = (
    <>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <View style={styles.buttonContainer}>
          <Button title={actionLabel} onPress={onAction} variant="primary" />
        </View>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, style]}>
        {content}
      </View>
    );
  }

  return (
    <View style={[styles.inline, style]}>
      {content}
    </View>
  );
}

// Compact version for inline lists
export function InlineEmpty({ message }: { message: string }): JSX.Element {
  return (
    <View style={styles.compact}>
      <Text style={styles.compactText}>{message}</Text>
    </View>
  );
}

// Specialized empty states
export function NoDecisionsYet({ onCreate }: { onCreate?: () => void }): JSX.Element {
  return (
    <EmptyState
      icon="📝"
      title="No decisions yet"
      message="Start by creating your first decision. It only takes a minute."
      actionLabel="Create First Decision"
      onAction={onCreate}
      fullScreen
    />
  );
}

export function NoAnalysisYet({ onAnalyze }: { onAnalyze?: () => void }): JSX.Element {
  return (
    <EmptyState
      icon="🔮"
      title="Ready for AI analysis"
      message="Get a structured breakdown of your options with scores, tradeoffs, and insights."
      actionLabel="Run Analysis"
      onAction={onAnalyze}
    />
  );
}

export function NoReviewsDue(): JSX.Element {
  return (
    <EmptyState
      icon="✅"
      title="No reviews due"
      message="All your decisions are up to date. Reviews help you learn from past choices."
      fullScreen
    />
  );
}

export function NoInternet({ onRetry }: { onRetry?: () => void }): JSX.Element {
  return (
    <EmptyState
      icon="📡"
      title="No connection"
      message="Check your internet connection and try again."
      actionLabel="Try Again"
      onAction={onRetry}
      fullScreen
    />
  );
}

export function FreeLimitReached({ onUpgrade }: { onUpgrade?: () => void }): JSX.Element {
  return (
    <EmptyState
      icon="⭐"
      title="Analysis limit reached"
      message="You've used all 3 free analyses this month. Upgrade to Plus for unlimited analyses."
      actionLabel="Upgrade to Plus"
      onAction={onUpgrade}
    />
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  inline: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
    margin: spacing.md,
  },
  compact: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: typography.lineHeight.normal * typography.size.md,
  },
  buttonContainer: {
    minWidth: 180,
  },
  compactText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
