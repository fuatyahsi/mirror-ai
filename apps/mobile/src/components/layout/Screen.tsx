import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stars } from "@/components/brand/Stars";
import { colors, spacing } from "@/theme";

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
};

export function Screen({ children, scroll = true }: ScreenProps) {
  if (!scroll) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stars />
        <View style={styles.content}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Stars />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: "hidden"
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: 12
  }
});
