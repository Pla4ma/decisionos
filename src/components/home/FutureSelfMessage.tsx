import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { FutureSelfMessage as FutureSelfMessageType } from '@/features/ai/futureSelfTypes';

interface FutureSelfMessageProps {
  messages: FutureSelfMessageType[];
  unreadCount: number;
  onRead: (message: FutureSelfMessageType) => void;
  onDismiss: (id: string) => void;
}

export function FutureSelfMessageCard({ messages, unreadCount, onRead, onDismiss }: FutureSelfMessageProps) {
  if (messages.length === 0) return null;

  const displayMessage = messages[0];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onRead(displayMessage)}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <View style={styles.iconRow}>
          <Text style={styles.avatar}>📜</Text>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>From Future You</Text>
              {unreadCount > 0 && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.subject}>{displayMessage.subject}</Text>
          </View>
        </View>
        {unreadCount > 1 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>+{unreadCount - 1}</Text>
          </View>
        )}
      </View>
      <Text style={styles.preview} numberOfLines={2}>
        {displayMessage.body.substring(0, 120)}...
      </Text>
      <TouchableOpacity style={styles.dismissBtn} onPress={() => onDismiss(displayMessage.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={styles.dismissText}>Dismiss</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.accent.muted,
    borderRadius: 12, padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border.accent,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  iconRow: { flexDirection: 'row', gap: spacing.md, flex: 1 },
  avatar: { fontSize: 28, marginTop: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontSize: typography.size.sm, fontWeight: '600', color: colors.accent.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent.primary },
  subject: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.primary, marginTop: 2 },
  countBadge: { backgroundColor: colors.accent.primary + '30', borderRadius: 9999, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  countText: { fontSize: 11, fontWeight: '700', color: colors.accent.primary },
  preview: { fontSize: typography.size.sm, color: colors.text.secondary, lineHeight: 20, marginBottom: spacing.sm },
  dismissBtn: { alignSelf: 'flex-end' },
  dismissText: { fontSize: typography.size.xs, color: colors.text.tertiary },
});
