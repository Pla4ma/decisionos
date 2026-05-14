// ErrorState — Error display with retry action
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
  style?: object;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  fullScreen = false,
  style,
}: ErrorStateProps): JSX.Element {
  const content = (
    <>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>⚠️</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <View style={styles.buttonContainer}>
          <Button title="Try Again" onPress={onRetry} variant="secondary" />
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

// Compact error for inline use
export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }): JSX.Element {
  return (
    <View style={styles.compact}>
      <Text style={styles.compactText}>{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry}>
          <Text style={styles.compactRetry}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Specialized error states
export function AuthError({ onRetry }: { onRetry?: () => void }): JSX.Element {
  return (
    <ErrorState
      title="Sign in required"
      message="Please sign in to continue. Your data is safe with us."
      onRetry={onRetry}
      fullScreen
    />
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }): JSX.Element {
  return (
    <ErrorState
      title="Connection issue"
      message="We couldn't connect to the server. Check your internet and try again."
      onRetry={onRetry}
      fullScreen
    />
  );
}

export function DatabaseError({ onRetry }: { onRetry?: () => void }): JSX.Element {
  return (
    <ErrorState
      title="Data unavailable"
      message="We couldn't load your data right now. Please try again."
      onRetry={onRetry}
      fullScreen
    />
  );
}

export function GeminiError({ onRetry }: { onRetry?: () => void }): JSX.Element {
  return (
    <ErrorState
      title="Analysis unavailable"
      message="The AI service is experiencing issues. Please try again in a moment."
      onRetry={onRetry}
    />
  );
}

export function InvalidAIResponseError({ onRetry }: { onRetry?: () => void }): JSX.Element {
  return (
    <ErrorState
      title="Analysis incomplete"
      message="The AI response couldn't be processed. Please try running analysis again."
      onRetry={onRetry}
    />
  );
}

export function SubscriptionCheckError({ onRetry }: { onRetry?: () => void }): JSX.Element {
  return (
    <ErrorState
      title="Subscription check failed"
      message="We couldn't verify your subscription status. Please try again."
      onRetry={onRetry}
    />
  );
}

export function UnauthorizedDecisionError(): JSX.Element {
  return (
    <ErrorState
      title="Access denied"
      message="You don't have permission to view this decision."
      fullScreen
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
    padding: spacing.lg,
    alignItems: 'center',
    margin: spacing.md,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${colors.status.error}15`,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 32,
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
    minWidth: 140,
  },
  compactText: {
    fontSize: typography.size.sm,
    color: colors.status.error,
    flex: 1,
  },
  compactRetry: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.accent.primary,
    marginLeft: spacing.md,
  },
});
