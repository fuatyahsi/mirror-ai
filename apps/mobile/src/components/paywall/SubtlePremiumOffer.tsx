import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  featureAccessLabel,
  featureOffer,
  featureValueBullets,
  type PremiumFeatureKey
} from "@/features/premium/featureGates";
import { useI18n } from "@/i18n";
import { colors, radii, spacing } from "@/theme";

type SubtlePremiumOfferProps = {
  feature: PremiumFeatureKey;
  title?: string;
  body?: string;
  bullets?: string[];
  compact?: boolean;
};

export function SubtlePremiumOffer({ feature, title, body, bullets, compact }: SubtlePremiumOfferProps) {
  const { locale } = useI18n();
  const localeKey = locale === "en" ? "en" : "tr";
  const offer = featureOffer(feature, localeKey);
  const visibleBullets = (bullets?.length ? bullets : featureValueBullets(feature, localeKey)).slice(0, compact ? 3 : 4);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/paywall?feature=${feature}` as Href)}
      style={({ pressed }) => [styles.card, compact && styles.compact, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <View style={styles.icon}>
          <Ionicons name="sparkles-outline" size={18} color={colors.accentGold} />
        </View>
        <View style={styles.headerText}>
          <View style={styles.metaRow}>
            <Text style={styles.eyebrow}>{locale === "en" ? "Optional deeper layer" : "İsteğe bağlı derin katman"}</Text>
            <View style={styles.accessPill}>
              <Text style={styles.accessText}>{featureAccessLabel(feature, localeKey)}</Text>
            </View>
          </View>
          <Text style={styles.title}>{title ?? offer.title}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.faint} />
      </View>

      <Text style={styles.body}>{body ?? offer.outcome}</Text>

      <View style={styles.unlockBox}>
        <Text style={styles.unlockLabel}>{offer.unlockLabel}</Text>
        <View style={styles.bullets}>
          {visibleBullets.map((bullet) => (
            <View key={bullet} style={styles.bulletRow}>
              <Ionicons name="checkmark-circle" size={14} color={colors.accentTeal} />
              <Text style={styles.bullet}>{bullet}</Text>
            </View>
          ))}
        </View>
      </View>

      {!compact ? <Text style={styles.trustNote}>{offer.trustNote}</Text> : null}
      <Text style={styles.cta}>{offer.cta}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.34)",
    backgroundColor: "#101624",
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: colors.accentGold,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  },
  compact: {
    paddingVertical: spacing.sm
  },
  pressed: {
    opacity: 0.84
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.46)",
    backgroundColor: "rgba(216,181,109,0.1)",
    alignItems: "center",
    justifyContent: "center"
  },
  headerText: {
    flex: 1,
    gap: 4
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6
  },
  eyebrow: {
    color: colors.accentGold,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  accessPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(94,196,192,0.34)",
    backgroundColor: "rgba(94,196,192,0.1)",
    paddingHorizontal: 7,
    paddingVertical: 2
  },
  accessText: {
    color: colors.accentTeal,
    fontSize: 10,
    fontWeight: "900"
  },
  title: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900"
  },
  body: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  unlockBox: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.035)",
    padding: spacing.sm,
    gap: 6
  },
  unlockLabel: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  bullets: {
    gap: 5
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6
  },
  bullet: {
    flex: 1,
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16
  },
  trustNote: {
    color: colors.faint,
    fontSize: 11,
    lineHeight: 16
  },
  cta: {
    color: colors.accentTeal,
    fontSize: 12,
    fontWeight: "900"
  }
});
