import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { QUICK_REVIEW_EMOJIS, QuickReviewFeeling } from '@/features/engagement/quickReviewTypes';

interface QuickReviewPromptProps {
  decisionTitle: string;
  decisionId: string;
  onSelect: (feeling: QuickReviewFeeling) => void;
  onDismiss: () => void;
  isSubmitting: boolean;
}

export function QuickReviewPrompt({ decisionTitle, onSelect, onDismiss, isSubmitting }: QuickReviewPromptProps) {
  const feelings = [1, 2, 3, 4, 5] as QuickReviewFeeling[];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quick Check-In</Text>
        <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
          <Text style={styles.dismissIcon}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>
        How are you feeling about "{decisionTitle}"?
      </Text>
      <View style={styles.emojiRow}>
        {feelings.map(f => (
          <TouchableOpacity
            key={f}
            style={styles.emojiBtn}
            onPress={() => onSelect(f)}
            disabled={isSubmitting}
            activeOpacity={0.6}
          >
            <Text style={styles.emoji}>{QUICK_REVIEW_EMOJIS[f].emoji}</Text>
            <Text style={styles.emojiLabel}>{QUICK_REVIEW_EMOJIS[f].label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12, padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.accent.secondary + '40',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  dismissBtn: { padding: spacing.xs },
  dismissIcon: { fontSize: 14, color: colors.text.tertiary },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  emojiRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    gap: spacing.xs,
  },
  emojiBtn: {
    alignItems: 'center', padding: spacing.sm,
    borderRadius: 10, backgroundColor: colors.background.tertiary,
    flex: 1,
  },
  emoji: { fontSize: 22, marginBottom: 2 },
  emojiLabel: { fontSize: 8, color: colors.text.tertiary, textAlign: 'center' },
});
