import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { generateChapterGrade, LifeChapter } from '@/features/engagement/chaptersTypes';

interface LifeChapterCardProps {
  chapter: LifeChapter | null;
  onCreateChapter: () => void;
}

export function LifeChapterCard({ chapter, onCreateChapter }: LifeChapterCardProps) {
  if (!chapter) {
    return (
      <TouchableOpacity style={styles.emptyContainer} onPress={onCreateChapter} activeOpacity={0.7}>
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={styles.emptyTitle}>Start a Life Chapter</Text>
        <Text style={styles.emptyDescription}>Group decisions into chapters. See how your choices define your story.</Text>
        <Text style={styles.emptyAction}>Create Chapter →</Text>
      </TouchableOpacity>
    );
  }

  const grade = generateChapterGrade(chapter);

  return (
    <TouchableOpacity style={styles.container} onPress={onCreateChapter} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.chapterEmoji}>{chapter.emoji}</Text>
        <View style={styles.chapterInfo}>
          <Text style={styles.chapterTitle}>{chapter.title}</Text>
          <Text style={styles.chapterMeta}>
            {chapter.decision_count} decisions · {chapter.reviewed_count} reviewed
          </Text>
        </View>
        <View style={styles.gradeBadge}>
          <Text style={styles.gradeText}>{grade.grade}</Text>
        </View>
      </View>
      <Text style={styles.chapterGrade}>{grade.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12, padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border.primary,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
  },
  chapterEmoji: { fontSize: 24, marginRight: spacing.md },
  chapterInfo: { flex: 1 },
  chapterTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  chapterMeta: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  gradeBadge: {
    backgroundColor: colors.accent.primary + '20',
    borderRadius: 8, width: 36, height: 36,
    justifyContent: 'center', alignItems: 'center',
  },
  gradeText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.accent.primary,
  },
  chapterGrade: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12, padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border.primary,
    borderStyle: 'dashed',
  },
  emptyIcon: { fontSize: 24, marginBottom: spacing.sm },
  emptyTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptyDescription: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  emptyAction: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.accent.primary,
  },
});
