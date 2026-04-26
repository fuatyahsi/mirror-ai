import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@/theme";

type InsightCardProps = {
  title: string;
  body: string;
  meta?: string;
};

export function InsightCard({ title, body, meta }: InsightCardProps) {
  return (
    <View style={styles.card}>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
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
  meta: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700"
  },
  title: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800"
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21
  }
});

