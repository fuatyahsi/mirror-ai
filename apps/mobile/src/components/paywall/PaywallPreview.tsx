import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@/theme";
import { PrimaryButton } from "@/components/forms/PrimaryButton";

export function PaywallPreview() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Premium hafıza katmanı</Text>
      <Text style={styles.body}>
        Detaylı kahve falı, ilişki analizleri, geçmiş trendler ve sınırsız yorum için RevenueCat entegrasyonu burada bağlanacak.
      </Text>
      <PrimaryButton variant="secondary">Yakında</PrimaryButton>
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
    fontWeight: "800",
    fontSize: 17
  },
  body: {
    color: colors.muted,
    lineHeight: 21
  }
});

