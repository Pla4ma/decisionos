import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import type { LifeChapter } from '@/features/engagement/chaptersTypes';

interface LifeChapterCardProps {
  chapter: LifeChapter | null;
  onCreateChapter: () => void;
}

export function LifeChapterCard({ chapter, onCreateChapter }: LifeChapterCardProps): JSX.Element {
  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>Life Chapter</Text>
        <TouchableOpacity onPress={onCreateChapter}>
          <Text style={styles.createText}>+ New</Text>
        </TouchableOpacity>
      </View>
      {chapter ? (
        <View style={styles.chapterContent}>
          <Text style={styles.chapterEmoji}>{chapter.emoji}</Text>
          <View style={styles.chapterInfo}>
            <Text style={styles.chapterTitle}>{chapter.title}</Text>
            {chapter.description && (
              <Text style={styles.chapterDesc} numberOfLines={1}>{chapter.description}</Text>
            )}
            <View style={styles.chapterStats}>
              {chapter.decision_count > 0 && (
                <View style={styles.statBadge}>
                  <Text style={styles.statText}>{chapter.decision_count} decision{chapter.decision_count > 1 ? 's' : ''}</Text>
                </View>
              )}
              {chapter.average_satisfaction && (
                <View style={styles.statBadge}>
                  <Text style={styles.statText}>{chapter.average_satisfaction.toFixed(1)} avg satisfaction</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyChapter}>
          <Text style={styles.emptyIcon}>📖</Text>
          <Text style={styles.emptyText}>Organize decisions into life chapters</Text>
          <TouchableOpacity style={styles.createChapterBtn} onPress={onCreateChapter} activeOpacity={0.7}>
            <Text style={styles.createChapterText}>Create first chapter</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, marginBottom: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  label: { fontSize: typography.size.xs, fontWeight: '700', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 1 },
  createText: { fontSize: typography.size.sm, color: colors.accent.primary, fontWeight: '600' },
  chapterContent: { flexDirection: 'row', gap: spacing.md },
  chapterEmoji: { fontSize: 36, lineHeight: 42 },
  chapterInfo: { flex: 1 },
  chapterTitle: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.primary },
  chapterDesc: { fontSize: typography.size.xs, color: colors.text.secondary, marginTop: 2 },
  chapterStats: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  statBadge: { backgroundColor: colors.background.tertiary, borderRadius: 9999, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  statText: { fontSize: 10, color: colors.text.tertiary, fontWeight: '500' },
  emptyChapter: { alignItems: 'center', paddingVertical: spacing.md },
  emptyIcon: { fontSize: 32, marginBottom: spacing.sm },
  emptyText: { fontSize: typography.size.sm, color: colors.text.tertiary, marginBottom: spacing.md },
  createChapterBtn: { backgroundColor: colors.accent.muted, borderRadius: 9999, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  createChapterText: { fontSize: typography.size.sm, color: colors.accent.primary, fontWeight: '600' },
});