import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <View style={styles.wrap}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 5,
    marginBottom: spacing.xs
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  title: {
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "600",
    letterSpacing: 0
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 22,
    fontWeight: "300"
  }
});
