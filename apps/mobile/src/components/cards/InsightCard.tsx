import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "@/theme";

type InsightCardProps = {
  title: string;
  body: string;
  meta?: string;
  accent?: boolean;
};

export function InsightCard({ title, body, meta, accent }: InsightCardProps) {
  return (
    <View style={[styles.card, accent && styles.accentCard]}>
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
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: 6
  },
  accentCard: {
    borderLeftWidth: 2,
    borderLeftColor: colors.accent
  },
  meta: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  title: {
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600"
  },
  body: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "300"
  }
});
