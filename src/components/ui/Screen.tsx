// Screen — Safe area wrapper with consistent styling
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing, screenPadding } from '@/theme/spacing';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  padding?: boolean;
  style?: object;
}

export function Screen({
  children,
  scrollable = false,
  keyboardAvoiding = false,
  padding = true,
  style,
}: ScreenProps): JSX.Element {
  const insets = useSafeAreaInsets();

  const containerStyle = [
    styles.container,
    padding && {
      paddingHorizontal: screenPadding.horizontal,
      paddingTop: insets.top + screenPadding.vertical,
      paddingBottom: insets.bottom + screenPadding.vertical,
    },
    !padding && {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    },
    style,
  ];

  const content = scrollable ? (
    <ScrollView
      style={StyleSheet.flatten(containerStyle)}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={containerStyle}>{children}</View>
  );

  if (keyboardAvoiding && Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
