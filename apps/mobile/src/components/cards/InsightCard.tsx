import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, typography } from "@/theme";

type InsightCardProps = {
  title: string;
  body: string;
  meta?: string;
  accent?: boolean;
  actionLabel?: string;
  onPress?: () => void;
};

function InsightCardContent({ title, body, meta, actionLabel }: InsightCardProps) {
  return (
    <>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {actionLabel ? <Text style={styles.action}>{actionLabel}</Text> : null}
    </>
  );
}

export function InsightCard(props: InsightCardProps) {
  const { accent, onPress } = props;

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.card, accent && styles.accentCard, pressed && styles.pressed]}
      >
        <InsightCardContent {...props} />
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, accent && styles.accentCard]}>
      <InsightCardContent {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 7
  },
  accentCard: {
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
    borderColor: colors.borderGlow,
    backgroundColor: colors.surfaceSoft
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
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "600"
  },
  body: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "300"
  },
  action: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  pressed: {
    opacity: 0.78
  }
});
