import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DecisionInboxItem } from '@/features/decisions/decisionInboxTypes';

interface DecisionInboxCardProps {
  items: DecisionInboxItem[];
  unprocessedCount: number;
  onAdd: (thought: string) => void;
  onItemPress: (item: DecisionInboxItem) => void;
}

export function DecisionInboxCard({ items, unprocessedCount, onAdd, onItemPress }: DecisionInboxCardProps) {
  const [thought, setThought] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    if (thought.trim().length < 3) return;
    onAdd(thought.trim());
    setThought('');
  };

  const recentItems = items.slice(0, 5);

  return (
    <Card variant="outlined" style={styles.container}>
      <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>📥</Text>
          <Text style={styles.title}>Decision Inbox</Text>
          {unprocessedCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unprocessedCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={thought}
              onChangeText={setThought}
              placeholder="What decision is on your mind?"
              placeholderTextColor={colors.text.disabled}
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleSubmit} disabled={thought.trim().length < 3}>
              <Text style={[styles.addBtnText, thought.trim().length < 3 && styles.addBtnDisabled]}>+</Text>
            </TouchableOpacity>
          </View>

          {recentItems.length > 0 && (
            <View style={styles.itemsList}>
              {recentItems.map(item => (
                <TouchableOpacity key={item.id} style={styles.inboxItem} onPress={() => onItemPress(item)} activeOpacity={0.7}>
                  <View style={styles.itemDot} />
                  <Text style={styles.itemThought} numberOfLines={1}>{item.thought}</Text>
                  <Text style={styles.itemArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {items.length === 0 && (
            <Text style={styles.emptyText}>Capture decisions as they come to mind. No structure needed.</Text>
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md, borderColor: colors.border.accent },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { fontSize: 16 },
  title: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  badge: { backgroundColor: colors.accent.primary, borderRadius: 9999, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.background.primary },
  expandIcon: { fontSize: 10, color: colors.text.tertiary },
  content: { marginTop: spacing.md },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  input: { flex: 1, backgroundColor: colors.background.tertiary, borderRadius: 8, padding: spacing.md, color: colors.text.primary, fontSize: typography.size.md },
  addBtn: { backgroundColor: colors.accent.primary, width: 44, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { fontSize: 22, color: colors.background.primary, fontWeight: '700' },
  addBtnDisabled: { opacity: 0.4 },
  itemsList: { marginTop: spacing.md, gap: spacing.xs },
  inboxItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.tertiary, borderRadius: 6, padding: spacing.sm, gap: spacing.sm },
  itemDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent.secondary },
  itemThought: { flex: 1, fontSize: typography.size.sm, color: colors.text.primary },
  itemArrow: { fontSize: 14, color: colors.text.tertiary },
  emptyText: { fontSize: typography.size.sm, color: colors.text.tertiary, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.md },
});
