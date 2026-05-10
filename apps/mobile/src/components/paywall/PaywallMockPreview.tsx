import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { PremiumFeatureKey } from "@/features/premium/featureGates";
import { colors, featureColors, radii, spacing } from "@/theme";

type Locale = "tr" | "en";

// Şu an satın almadan önce kullanıcı ne alacağını göremiyor. Burada her premium
// feature için "minik bir gerçek rapor parçası" gösteriyoruz: skor şeridi, branded
// başlık, bir kanıt chip'i ve örnek mesaj/satır. Alt kısmı redacted block'larla
// + dim overlay ile örtülü; "açılınca görünür" hissi yaratır.

type MockKind = "relationship" | "weekly" | "coffee" | "tarot" | "numerology" | "birth_chart" | "daily";

function pickKind(feature: PremiumFeatureKey): MockKind {
  if (feature === "relationship_loop" || feature === "relationship_timing" || feature === "deep_synastry")
    return "relationship";
  if (feature === "weekly_relationship_report") return "weekly";
  if (feature === "detailed_coffee") return "coffee";
  if (feature === "premium_tarot") return "tarot";
  if (feature === "deep_numerology") return "numerology";
  if (feature === "deep_birth_chart") return "birth_chart";
  return "daily";
}

type CopyShape = {
  sample: string;
  locked: string;
  bondTitle: string;
  bondSubtitle: string;
  bondLine1: string;
  bondLine2Hidden: string;
  aspectLabel: string;
  aspectMeaning: string;
  sampleHeader: string;
  sampleLine: string;
  weeklyTitle: string;
  weeklyHeadline: string;
  weeklyTheme: string;
  coffeeTitle: string;
  coffeeHeadline: string;
  tarotTitle: string;
  tarotHeadline: string;
  numerologyTitle: string;
  numerologyHeadline: string;
  chartTitle: string;
  chartHeadline: string;
  dailyTitle: string;
  dailyHeadline: string;
  score: { intensity: string; clarity: string; pull: string; repair: string };
};

const copy: Record<Locale, CopyShape> = {
  tr: {
    sample: "ÖRNEK ÇIKTI",
    locked: "Açılınca tamamı görünür",
    bondTitle: "Belirsizliğin Dansı",
    bondSubtitle: "Mert · belirsiz ilişki",
    bondLine1: "Çekim güçlü, ama netlik aramayı bırakırsan ilişki rahatlıyor.",
    bondLine2Hidden: "Bugün için önerilen ton: ",
    aspectLabel: "Ay-Venüs üçgen 0.8°",
    aspectMeaning: "duygusal güven kanalı, sıcak hissettiriyor",
    sampleHeader: "Örnek mesaj",
    sampleLine: "Aramızdaki durumu daha net anlamak istiyorum.",
    weeklyTitle: "Test ile geçen 7 gün",
    weeklyHeadline: "Belirsizlik haftası — ama döngü dengelendi.",
    weeklyTheme: "geç cevap → onarım girişimi",
    coffeeTitle: "Ortada bir kuş, sağda kapı",
    coffeeHeadline: "Beklenen haber yakın; ama önce küçük bir kararı netleştirmen gerek.",
    tarotTitle: "Üçlü Açılım — Geçmiş · Şimdi · Yön",
    tarotHeadline: "The Tower (ters) → adım atmadan önce zemini tartan biri.",
    numerologyTitle: "Yaşam Yolu 7",
    numerologyHeadline: "Sezgini bilime tercüme eden bir yıl seni bekliyor.",
    chartTitle: "Yengeç Güneş · Balık Ay · Aslan Yükselen",
    chartHeadline: "Duygusal derinlik + sahne ihtiyacı arasında yaşıyorsun.",
    dailyTitle: "Bugünün gökyüzü",
    dailyHeadline: "Ay Yengeç'te — küçük temaslar bugün uzun teorilerden değerli.",
    score: { intensity: "Yoğunluk", clarity: "Netlik", pull: "Çekim", repair: "Onarım" }
  },
  en: {
    sample: "EXAMPLE OUTPUT",
    locked: "Full report unlocks after purchase",
    bondTitle: "The Dance of Uncertainty",
    bondSubtitle: "Mert · undefined bond",
    bondLine1: "Strong pull, but the moment you stop hunting for clarity the bond breathes.",
    bondLine2Hidden: "Today's suggested tone: ",
    aspectLabel: "Moon-Venus trine 0.8°",
    aspectMeaning: "emotional safety channel, runs warm",
    sampleHeader: "Sample message",
    sampleLine: "I'd like to understand where we stand.",
    weeklyTitle: "Last 7 days with Test",
    weeklyHeadline: "Uncertain week — but the loop steadied by Friday.",
    weeklyTheme: "late replies → small repair gesture",
    coffeeTitle: "A bird at the center, a door on the right",
    coffeeHeadline: "Expected news is close; but a smaller decision wants clarity first.",
    tarotTitle: "Three-card spread — past · now · direction",
    tarotHeadline: "The Tower reversed → someone testing the ground before stepping.",
    numerologyTitle: "Life Path 7",
    numerologyHeadline: "A year that translates your intuition into structured language.",
    chartTitle: "Cancer Sun · Pisces Moon · Leo Rising",
    chartHeadline: "You live between emotional depth and the need for a stage.",
    dailyTitle: "Today's sky",
    dailyHeadline: "Moon in Cancer — small contact beats grand theory today.",
    score: { intensity: "Intensity", clarity: "Clarity", pull: "Pull", repair: "Repair" }
  }
};

export function PaywallMockPreview({
  feature,
  locale
}: {
  feature: PremiumFeatureKey;
  locale: Locale;
}) {
  const t = copy[locale];
  const kind = pickKind(feature);

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Ionicons name="eye-outline" size={14} color={colors.accent} />
        <Text style={styles.eyebrow}>{t.sample}</Text>
      </View>
      <View style={styles.preview}>
        {kind === "relationship" || kind === "weekly" ? (
          <RelationshipMock t={t} kind={kind} />
        ) : kind === "coffee" ? (
          <SimpleMock title={t.coffeeTitle} headline={t.coffeeHeadline} icon="cafe-outline" />
        ) : kind === "tarot" ? (
          <SimpleMock title={t.tarotTitle} headline={t.tarotHeadline} icon="layers-outline" />
        ) : kind === "numerology" ? (
          <SimpleMock title={t.numerologyTitle} headline={t.numerologyHeadline} icon="apps-outline" />
        ) : kind === "birth_chart" ? (
          <SimpleMock title={t.chartTitle} headline={t.chartHeadline} icon="planet-outline" />
        ) : (
          <SimpleMock title={t.dailyTitle} headline={t.dailyHeadline} icon="sunny-outline" />
        )}
        <View pointerEvents="none" style={styles.dimOverlay} />
        <View pointerEvents="none" style={styles.lockBadgeWrap}>
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={11} color={colors.background} />
            <Text style={styles.lockText}>{t.locked}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function RelationshipMock({ t, kind }: { t: CopyShape; kind: "relationship" | "weekly" }) {
  const title = kind === "weekly" ? t.weeklyTitle : t.bondTitle;
  const subtitle = kind === "weekly" ? "" : t.bondSubtitle;
  const headline = kind === "weekly" ? t.weeklyHeadline : t.bondLine1;
  return (
    <>
      <View style={styles.titleRow}>
        <Ionicons
          name={kind === "weekly" ? "calendar-outline" : "git-compare-outline"}
          size={16}
          color={featureColors.relationship.accent}
        />
        <Text style={styles.title}>{title}</Text>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <ScoreStripMock t={t} />
      <Text style={styles.body}>{headline}</Text>
      {kind === "relationship" ? (
        <View style={styles.aspectChip}>
          <Text style={styles.aspectLabel}>{t.aspectLabel}</Text>
          <Text style={styles.aspectMeaning}>{t.aspectMeaning}</Text>
        </View>
      ) : (
        <View style={styles.aspectChip}>
          <Ionicons name="repeat-outline" size={12} color={colors.accentGold} />
          <Text style={[styles.aspectLabel, { color: colors.accentGold }]}>{t.weeklyTheme}</Text>
        </View>
      )}
      <View style={styles.sampleBox}>
        <Text style={styles.sampleLabel}>{t.sampleHeader}</Text>
        <Text style={styles.sampleLine}>“{t.sampleLine}</Text>
        <Text style={styles.redactedLine}>████ ███ ███████ ███ ███████ ████.”</Text>
      </View>
    </>
  );
}

function ScoreStripMock({ t }: { t: CopyShape }) {
  const items = [
    { key: "intensity", label: t.score.intensity, value: 67, accent: colors.accent },
    { key: "clarity", label: t.score.clarity, value: 54, accent: colors.accentBlue },
    { key: "pull", label: t.score.pull, value: 78, accent: colors.accentRose },
    { key: "repair", label: t.score.repair, value: 41, accent: colors.accentGold }
  ];
  return (
    <View style={styles.scoreStrip}>
      {items.map((item) => (
        <View key={item.key} style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>{item.label}</Text>
          <View style={styles.scoreBarTrack}>
            <View
              style={[
                styles.scoreBarFill,
                { width: `${item.value}%`, backgroundColor: item.accent }
              ]}
            />
          </View>
          <Text style={styles.scoreValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

function SimpleMock({
  title,
  headline,
  icon
}: {
  title: string;
  headline: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <>
      <View style={styles.titleRow}>
        <Ionicons name={icon} size={16} color={featureColors.relationship.accent} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.body}>{headline}</Text>
      <Text style={styles.redactedLine}>████████ ██████ █████ ████ ████ ███ ████████.</Text>
      <Text style={styles.redactedLine}>████ █████████ ████ ████ ███ █████ ███ ████.</Text>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
    marginVertical: spacing.sm
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4
  },
  preview: {
    position: "relative",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: featureColors.relationship.accent,
    backgroundColor: featureColors.relationship.surface,
    padding: spacing.md,
    gap: spacing.xs,
    overflow: "hidden"
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700"
  },
  body: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18
  },
  scoreStrip: {
    gap: 4,
    marginTop: 4
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  scoreLabel: {
    color: colors.muted,
    fontSize: 10,
    width: "30%"
  },
  scoreBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surfaceMid,
    borderRadius: 2,
    overflow: "hidden"
  },
  scoreBarFill: { height: "100%", borderRadius: 2 },
  scoreValue: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "900",
    width: 24,
    textAlign: "right"
  },
  aspectChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    backgroundColor: "rgba(94,196,192,0.18)",
    borderWidth: 1,
    borderColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: "flex-start"
  },
  aspectLabel: {
    color: colors.success,
    fontSize: 11,
    fontWeight: "800"
  },
  aspectMeaning: {
    color: colors.muted,
    fontSize: 11,
    fontStyle: "italic"
  },
  sampleBox: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderGlow,
    backgroundColor: colors.surfaceSoft,
    padding: spacing.sm,
    gap: 4,
    marginTop: 4
  },
  sampleLabel: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1
  },
  sampleLine: {
    color: colors.text,
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 18
  },
  redactedLine: {
    color: colors.faint,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: -1
  },
  dimOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
    backgroundColor: "rgba(7,5,15,0.55)"
  },
  lockBadgeWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.accentGold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999
  },
  lockText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.4
  }
});
