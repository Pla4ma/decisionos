import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { QuickReviewFeeling, QUICK_REVIEW_EMOJIS } from '@/features/engagement/quickReviewTypes';

interface QuickReviewPromptProps {
  decisionTitle: string;
  decisionId: string;
  onSelect: (feeling: QuickReviewFeeling) => void;
  onDismiss: () => void;
  isSubmitting: boolean;
}

export function QuickReviewPrompt({ decisionTitle, onSelect, onDismiss, isSubmitting }: QuickReviewPromptProps): JSX.Element {
  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>📬</Text>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Quick Check-In</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{decisionTitle}</Text>
        </View>
      </View>

      <Text style={styles.prompt}>How is that decision working out so far?</Text>

      <View style={styles.emojiRow}>
        {([1, 2, 3, 4, 5] as QuickReviewFeeling[]).map((feeling) => (
          <TouchableOpacity
            key={feeling}
            style={styles.emojiBtn}
            onPress={() => onSelect(feeling)}
            activeOpacity={0.7}
            disabled={isSubmitting}
          >
            <Text style={styles.emoji}>{QUICK_REVIEW_EMOJIS[feeling].emoji}</Text>
            <Text style={styles.emojiLabel}>{QUICK_REVIEW_EMOJIS[feeling].label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss} activeOpacity={0.7}>
        <Text style={styles.dismissText}>Not now</Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  icon: { fontSize: 28 },
  headerContent: { flex: 1 },
  title: { fontSize: typography.size.sm, fontWeight: '700', color: colors.accent.primary, textTransform: 'uppercase', letterSpacing: 1 },
  subtitle: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.primary, marginTop: 2 },
  prompt: { fontSize: typography.size.sm, color: colors.text.secondary, marginBottom: spacing.lg, lineHeight: 20 },
  emojiRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.md },
  emojiBtn: { alignItems: 'center', gap: spacing.xs, padding: spacing.sm },
  emoji: { fontSize: 32 },
  emojiLabel: { fontSize: 10, color: colors.text.tertiary, textAlign: 'center' },
  dismissBtn: { alignItems: 'center', padding: spacing.sm },
  dismissText: { fontSize: typography.size.sm, color: colors.text.tertiary },
});