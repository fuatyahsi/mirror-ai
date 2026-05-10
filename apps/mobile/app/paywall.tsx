import { useLocalSearchParams } from "expo-router";
import { BackButton } from "@/components/layout/BackButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { PremiumPaywall } from "@/components/paywall/PremiumPaywall";
import { featureOffer, type PremiumFeatureKey } from "@/features/premium/featureGates";
import { useI18n } from "@/i18n";

const premiumFeatures: PremiumFeatureKey[] = [
  "relationship_loop",
  "relationship_timing",
  "deep_synastry",
  "weekly_relationship_report",
  "unlimited_people",
  "premium_tarot",
  "detailed_coffee",
  "deep_numerology",
  "deep_birth_chart",
  "daily_timing"
];

export default function PaywallScreen() {
  const { feature } = useLocalSearchParams<{ feature?: string }>();
  const { locale } = useI18n();
  const featureKey = premiumFeatures.includes(feature as PremiumFeatureKey)
    ? (feature as PremiumFeatureKey)
    : "relationship_loop";
  const localeKey = locale === "en" ? "en" : "tr";
  const offer = featureOffer(featureKey, localeKey);

  return (
    <Screen>
      <BackButton fallbackHref="/tabs/relationship" />
      <PageHeader
        eyebrow="MIRROR AI PLUS"
        title={locale === "en" ? "Know exactly what unlocks" : "Ne alacağını net gör"}
        subtitle={
          locale === "en"
            ? `This purchase is for: ${offer.title}. You keep the free preview, and unlock the deeper personal layer described below.`
            : `Bu satın alma şu özellik için: ${offer.title}. Ücretsiz önizleme kalır; aşağıdaki derin kişisel katman açılır.`
        }
      />
      <PremiumPaywall feature={featureKey} />
    </Screen>
  );
}
