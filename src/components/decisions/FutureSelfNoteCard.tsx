// FutureSelfNoteCard — Shows AI-generated letter from future-you
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface FutureSelfData {
  letterText: string;
  perspective: string;
  biggestLesson: string;
}

interface FutureSelfNoteCardProps {
  optionTitle: string;
  futureSelf: FutureSelfData;
}

export function FutureSelfNoteCard({ optionTitle, futureSelf }: FutureSelfNoteCardProps): JSX.Element {
  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>🕰️</Text>
        <Text style={styles.title}>Future You on "{optionTitle}"</Text>
      </View>

      <View style={styles.letterBox}>
        <Text style={styles.letterText}>{futureSelf.letterText}</Text>
      </View>

      {futureSelf.perspective && (
        <View style={styles.insightBox}>
          <Text style={styles.insightLabel}>What future-you sees that you don't:</Text>
          <Text style={styles.insightText}>{futureSelf.perspective}</Text>
        </View>
      )}

      {futureSelf.biggestLesson && (
        <View style={styles.lessonBox}>
          <Text style={styles.lessonIcon}>💡</Text>
          <Text style={styles.lessonText}>{futureSelf.biggestLesson}</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md, backgroundColor: colors.accent.primary + '05' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  icon: { fontSize: 18, marginRight: spacing.sm },
  title: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.text.primary },
  letterBox: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.primary,
  },
  letterText: { fontSize: typography.size.sm, color: colors.text.primary, lineHeight: 22, fontStyle: 'italic' },
  insightBox: { marginBottom: spacing.md },
  insightLabel: { fontSize: 11, fontWeight: typography.weight.semibold, color: colors.text.tertiary, marginBottom: 4 },
  insightText: { fontSize: typography.size.sm, color: colors.text.secondary, lineHeight: 20 },
  lessonBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accent.warning + '10',
    borderRadius: 8,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  lessonIcon: { fontSize: 16 },
  lessonText: { flex: 1, fontSize: typography.size.sm, color: colors.text.primary, fontWeight: typography.weight.medium },
});
