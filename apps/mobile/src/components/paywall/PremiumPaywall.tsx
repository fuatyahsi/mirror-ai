import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { PaywallMockPreview } from "@/components/paywall/PaywallMockPreview";
import {
  featureAccessLabel,
  featureAccessModel,
  featureOffer,
  featureReceipt,
  type PremiumFeatureKey
} from "@/features/premium/featureGates";
import {
  purchaseCreditPack,
  purchasePlus,
  getRevenueCatOfferPreview,
  restoreRevenueCatPurchases,
  revenueCatConfig,
  type RevenueCatOfferPreview,
  type PurchaseResult
} from "@/features/premium/revenueCat";
import { useI18n } from "@/i18n";
import { colors, radii, spacing, typography } from "@/theme";

type PremiumPaywallProps = {
  feature?: PremiumFeatureKey;
  compact?: boolean;
  onClose?: () => void;
};

type PlanKey = "monthly" | "yearly";

export function PremiumPaywall({ feature = "relationship_loop", compact, onClose }: PremiumPaywallProps) {
  const { locale } = useI18n();
  const [message, setMessage] = useState<string>();
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("yearly");
  const [storePreview, setStorePreview] = useState<RevenueCatOfferPreview>();
  const localeKey = locale === "en" ? "en" : "tr";
  const copy = localeKey === "en" ? enCopy : trCopy;
  const offer = featureOffer(feature, localeKey);
  const receipt = featureReceipt(feature, localeKey);
  const accessModel = featureAccessModel(feature);
  const canUsePlus = accessModel !== "credits";
  const canUseCredits = accessModel !== "plus";
  const fallbackPrice = storePreview ? copy.storePriceInCheckout : copy.loadingPrice;
  const monthlyPrice = storePreview?.monthly?.priceString ?? fallbackPrice;
  const yearlyPrice = storePreview?.yearly?.priceString ?? fallbackPrice;
  const yearlyDetail =
    storePreview?.yearly?.pricePerMonthString
      ? copy.yearlyMonthlyEquivalent.replace("{{price}}", storePreview.yearly.pricePerMonthString)
      : copy.yearlyDetail;
  const creditPrice = storePreview?.creditSmall?.priceString;
  const creditButtonLabel = creditPrice
    ? `${copy.creditCta} (${creditPrice})`
    : storePreview
      ? copy.creditCtaStore
      : copy.creditCta;
  const setupWarning =
    storePreview && !storePreview.configured
      ? storePreview.reason === "test_key_in_release"
        ? copy.productionKeyNeeded
        : copy.configureNeeded
      : storePreview && canUsePlus && !storePreview.monthly && !storePreview.yearly
        ? copy.noOffering
        : storePreview && canUseCredits && !storePreview.creditSmall
          ? copy.noCreditProduct
          : undefined;

  useEffect(() => {
    let active = true;
    getRevenueCatOfferPreview().then((preview) => {
      if (active) setStorePreview(preview);
    });
    return () => {
      active = false;
    };
  }, []);

  async function openPaywall() {
    const packageId =
      selectedPlan === "monthly" ? revenueCatConfig.monthlyProductId : revenueCatConfig.yearlyProductId;
    const result = await purchasePlus(packageId);
    setMessage(result.completed ? copy.unlocked : purchaseMessage(result, copy));
  }

  async function buyCredits() {
    const result = await purchaseCreditPack();
    setMessage(result.completed ? copy.creditsUnlocked : purchaseMessage(result, copy));
  }

  async function restorePurchases() {
    const result = await restoreRevenueCatPurchases();
    setMessage(result.completed ? copy.unlocked : purchaseMessage(result, copy));
  }

  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="lock-open-outline" size={22} color={colors.accentGold} />
        </View>
        <View style={styles.accessPill}>
          <Text style={styles.accessText}>{featureAccessLabel(feature, localeKey)}</Text>
        </View>
        {onClose ? (
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
      <Text style={styles.title}>{offer.title}</Text>
      <Text style={styles.body}>{offer.outcome}</Text>

      <View style={styles.previewBox}>
        <Text style={styles.previewLabel}>{copy.freeLabel}</Text>
        <Text style={styles.previewText}>{offer.freePreview}</Text>
      </View>

      {!compact ? <PaywallMockPreview feature={feature} locale={localeKey} /> : null}

      <View style={styles.sectionBox}>
        <Text style={styles.sectionLabel}>{offer.unlockLabel}</Text>
        <View style={styles.benefits}>
          {offer.bullets.map((item) => (
            <View key={item} style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.accentTeal} />
              <Text style={styles.benefitText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.receiptBox}>
        <Text style={styles.receiptTitle}>{copy.receiptLabel}</Text>
        <View style={styles.receiptRow}>
          {receipt.map((item) => (
            <View key={item} style={styles.receiptPill}>
              <Text style={styles.receiptText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {!compact && canUsePlus ? (
        <View style={styles.planRow}>
          <PlanCard
            title={copy.monthly}
            price={monthlyPrice}
            detail={storePreview?.monthly?.description || copy.monthlyDetail}
            selected={selectedPlan === "monthly"}
            onPress={() => setSelectedPlan("monthly")}
          />
          <PlanCard
            title={copy.yearly}
            price={yearlyPrice}
            detail={yearlyDetail}
            selected={selectedPlan === "yearly"}
            badge={copy.bestValue}
            onPress={() => setSelectedPlan("yearly")}
          />
        </View>
      ) : null}

      {canUsePlus ? <PrimaryButton onPress={openPaywall}>{copy.plusCta}</PrimaryButton> : null}
      {canUseCredits ? (
        <PrimaryButton variant={canUsePlus ? "secondary" : "primary"} onPress={buyCredits}>
          {creditButtonLabel}
        </PrimaryButton>
      ) : null}
      <Pressable onPress={restorePurchases} style={styles.restoreButton}>
        <Text style={styles.restoreText}>{copy.restore}</Text>
      </Pressable>
      {message ? (
        <Text style={styles.message}>{message}</Text>
      ) : setupWarning ? (
        <Text style={styles.warning}>{setupWarning}</Text>
      ) : (
        <Text style={styles.caption}>{offer.trustNote}</Text>
      )}
    </View>
  );
}

function purchaseMessage(result: PurchaseResult, copy: typeof trCopy) {
  if (result.reason === "missing_key") return copy.configureNeeded;
  if (result.reason === "test_key_in_release") return copy.productionKeyNeeded;
  if (result.reason === "no_offering") return copy.noOffering;
  if (result.reason === "cancelled") return copy.cancelled;
  return copy.revenueCatPending;
}

function PlanCard({
  title,
  price,
  selected,
  badge,
  detail,
  onPress
}: {
  title: string;
  price: string;
  detail?: string;
  selected: boolean;
  badge?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.plan, selected && styles.planSelected]}>
      <View style={styles.planHeader}>
        <Text style={styles.planTitle}>{title}</Text>
        {badge ? (
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.planPrice}>{price}</Text>
      {detail ? <Text style={styles.planDetail}>{detail}</Text> : null}
    </Pressable>
  );
}

const trCopy = {
  eyebrow: "Mirror AI Plus",
  freeLabel: "Ücretsiz ne verir?",
  receiptLabel: "Satın alınca hesabına yansıyacaklar",
  monthly: "Aylık",
  yearly: "Yıllık",
  loadingPrice: "Fiyat yükleniyor",
  storePriceInCheckout: "Fiyat mağazada doğrulanır",
  monthlyDetail: "Her ay yenilenir.",
  yearlyDetail: "Yıllık erişim.",
  yearlyMonthlyEquivalent: "Aylık karşılığı yaklaşık {{price}}",
  bestValue: "Önerilen",
  plusCta: "Plus ile aç",
  creditCta: "Krediyle tek rapor aç",
  creditCtaStore: "Krediyle tek rapor aç",
  restore: "Satın alımları geri yükle",
  revenueCatPending: "Satın alma tamamlanamadı. Ürünleri ve test hesabını kontrol et.",
  configureNeeded: "RevenueCat API key henüz .env içinde tanımlı değil.",
  productionKeyNeeded:
    "Bu release APK Test Store key ile derlenmiş. Uygulamanın kapanmaması için RevenueCat devre dışı bırakıldı; canlı satın alma testi için Android production SDK key gerekir.",
  noOffering: "RevenueCat offering içinde uygun ürün bulunamadı.",
  noCreditProduct: "RevenueCat offering içinde kredi paketi bulunamadı.",
  cancelled: "Satın alma iptal edildi.",
  creditsUnlocked: "Kredi paketi işlendi.",
  unlocked: "Premium açıldı."
};

const enCopy = {
  eyebrow: "Mirror AI Plus",
  freeLabel: "What is free?",
  receiptLabel: "What will be added to your account",
  monthly: "Monthly",
  yearly: "Yearly",
  loadingPrice: "Loading price",
  storePriceInCheckout: "Price confirmed by store",
  monthlyDetail: "Renews monthly.",
  yearlyDetail: "Annual access.",
  yearlyMonthlyEquivalent: "Approx. {{price}} per month",
  bestValue: "Recommended",
  plusCta: "Unlock with Plus",
  creditCta: "Unlock one report with credits",
  creditCtaStore: "Unlock one report with credits",
  restore: "Restore purchases",
  revenueCatPending: "Purchase could not be completed. Check products and sandbox account.",
  configureNeeded: "RevenueCat API key is not defined in .env yet.",
  productionKeyNeeded:
    "This release APK was built with a Test Store key. RevenueCat is disabled to keep the app open; live purchase testing needs the Android production SDK key.",
  noOffering: "No matching product was found in the RevenueCat offering.",
  noCreditProduct: "No credit pack was found in the RevenueCat offering.",
  cancelled: "Purchase cancelled.",
  creditsUnlocked: "Credit pack processed.",
  unlocked: "Premium unlocked."
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.5)",
    backgroundColor: "#0C101C",
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: colors.accentGold,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5
  },
  compactCard: {
    shadowOpacity: 0.08
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.56)",
    backgroundColor: "rgba(216,181,109,0.12)",
    alignItems: "center",
    justifyContent: "center"
  },
  accessPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(94,196,192,0.34)",
    backgroundColor: "rgba(94,196,192,0.1)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4
  },
  accessText: {
    color: colors.accentTeal,
    fontSize: 11,
    fontWeight: "900"
  },
  closeButton: {
    marginLeft: "auto",
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  eyebrow: {
    color: colors.accentGold,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  title: {
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "600"
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21
  },
  previewBox: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.035)",
    padding: spacing.sm,
    gap: 4
  },
  previewLabel: {
    color: colors.faint,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  previewText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  sectionBox: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.22)",
    backgroundColor: "#111722",
    padding: spacing.sm,
    gap: spacing.xs
  },
  sectionLabel: {
    color: colors.accentGold,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  benefits: {
    gap: 8
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8
  },
  benefitText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700"
  },
  receiptBox: {
    gap: 6
  },
  receiptTitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  receiptRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  receiptPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(94,196,192,0.3)",
    backgroundColor: "rgba(94,196,192,0.1)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 5
  },
  receiptText: {
    color: colors.accentTeal,
    fontSize: 11,
    fontWeight: "900"
  },
  planRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  plan: {
    flex: 1,
    minHeight: 84,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: spacing.sm,
    gap: 7
  },
  planSelected: {
    borderColor: colors.accentGold,
    backgroundColor: "rgba(216,181,109,0.14)"
  },
  planHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 5
  },
  planTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  planBadge: {
    borderRadius: 999,
    backgroundColor: colors.accentGold,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  planBadgeText: {
    color: colors.background,
    fontSize: 9,
    fontWeight: "900"
  },
  planPrice: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  planDetail: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16
  },
  caption: {
    color: colors.faint,
    fontSize: 11,
    lineHeight: 16
  },
  message: {
    color: colors.accentTeal,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800"
  },
  warning: {
    color: colors.accentGold,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800"
  },
  restoreButton: {
    alignItems: "center",
    paddingVertical: spacing.xs
  },
  restoreText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  }
});
