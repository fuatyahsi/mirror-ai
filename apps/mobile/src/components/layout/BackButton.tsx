import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { useI18n } from "@/i18n";
import { colors, spacing } from "@/theme";

type BackButtonProps = {
  label?: string;
  fallbackHref?: Href;
};

export function BackButton({ label, fallbackHref }: BackButtonProps) {
  const { t } = useI18n();

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    if (fallbackHref) {
      router.replace(fallbackHref);
    }
  }

  return (
    <Pressable accessibilityRole="button" onPress={goBack} style={styles.button}>
      <Ionicons name="chevron-back" size={18} color={colors.accent} />
      <Text style={styles.label}>{label ?? t("common.back")}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingRight: spacing.sm
  },
  label: {
    color: colors.accent,
    fontWeight: "800",
    fontSize: 13
  }
});
