import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useI18n } from "@/i18n";
import { colors, radii, spacing } from "@/theme";
import { formatReadableDate } from "@/utils/date";
import type { ReadingOutput } from "@/types/readings";

type ReadingCardProps = {
  reading: ReadingOutput;
};

export function ReadingCard({ reading }: ReadingCardProps) {
  const { locale, t } = useI18n();
  const typeKey = `readingType.${reading.reading_type}` as const;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(`/readings/${reading.id}`)}
    >
      <View style={styles.row}>
        <Text style={styles.type}>{t(typeKey)}</Text>
        <Text style={styles.date}>{formatReadableDate(reading.created_at, locale)}</Text>
      </View>
      <Text style={styles.title}>{reading.title}</Text>
      <Text numberOfLines={2} style={styles.summary}>
        {reading.summary}
      </Text>
    </Pressable>
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
  pressed: {
    opacity: 0.82
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  type: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  date: {
    color: colors.faint,
    fontSize: 12
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800"
  },
  summary: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21
  }
});
