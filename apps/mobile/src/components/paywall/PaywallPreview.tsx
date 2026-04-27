import { StyleSheet, Text, View } from "react-native";
import { useI18n } from "@/i18n";
import { colors, radii, spacing, typography } from "@/theme";
import { PrimaryButton } from "@/components/forms/PrimaryButton";

export function PaywallPreview() {
  const { t } = useI18n();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("paywall.title")}</Text>
      <Text style={styles.body}>{t("paywall.body")}</Text>
      <PrimaryButton variant="secondary">{t("common.soon")}</PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  title: {
    color: colors.text,
    fontFamily: typography.display,
    fontWeight: "600",
    fontSize: 18
  },
  body: {
    color: colors.muted,
    lineHeight: 21
  }
});
