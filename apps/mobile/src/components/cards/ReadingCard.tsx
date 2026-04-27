import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useI18n } from "@/i18n";
import { colors, radii, spacing, typography } from "@/theme";
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
    paddingHorizontal: 15,
    paddingVertical: 13,
    gap: 5
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
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  date: {
    color: colors.faint,
    fontSize: 12
  },
  title: {
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "600"
  },
  summary: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "300"
  }
});
