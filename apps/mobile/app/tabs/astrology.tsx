import type { ReactNode } from "react";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { MirrorMark } from "@/components/brand/MirrorMark";
import { InsightCard } from "@/components/cards/InsightCard";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { useI18n } from "@/i18n";
import { useUserStore } from "@/stores/useUserStore";
import { colors, radii, spacing, typography } from "@/theme";
import type { HousePoint, NatalAspect, NatalChart, ZodiacPoint } from "@/types/astrology";

export default function AstrologyScreen() {
  const profile = useUserStore((state) => state.profile);
  const { t } = useI18n();
  const chart = profile.natal_chart;

  if (!chart) {
    return (
      <Screen>
        <PageHeader eyebrow={t("astrology.eyebrow")} title={t("astrology.title")} subtitle={t("astrology.subtitle")} />
        <InsightCard title={t("astrology.emptyTitle")} body={t("astrology.emptyBody")} accent />
        <PrimaryButton onPress={() => router.push("/onboarding/birth-info")}>{t("astrology.enterBirth")}</PrimaryButton>
      </Screen>
    );
  }

  const corePoints = [
    { label: t("astrology.sun"), point: chart.sun },
    { label: t("astrology.moon"), point: chart.moon },
    { label: t("astrology.ascendant"), point: chart.ascendant },
    { label: t("astrology.midheaven"), point: chart.midheaven }
  ];

  return (
    <Screen>
      <PageHeader eyebrow={t("astrology.eyebrow")} title={t("astrology.title")} subtitle={t("astrology.subtitle")} />
      <View style={styles.hero}>
        <ChartWheel chart={chart} />
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>{t("astrology.birthChartTitle")}</Text>
          <Text style={styles.heroBody}>
            {t("profile.astrologyReady", {
              sun: chart.sun.sign_label,
              moon: chart.moon.sign_label,
              ascendant: chart.ascendant.sign_label
            })}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t("astrology.coreTitle")}</Text>
      <View style={styles.grid}>
        {corePoints.map(({ label, point }, index) => (
          <PointCard key={`${label}-${point?.key ?? index}`} label={label} point={point} />
        ))}
      </View>

      <InsightCard title={t("astrology.natalTitle")} body={t("astrology.natalBody")} accent />

      <Section title={t("astrology.starChartTitle")}>
        {chart.planets.map((planet, index) => (
          <PointRow
            key={`${planet.key}-${planet.absolute_degree}-${index}`}
            point={planet}
            right={formatDegree(planet)}
          />
        ))}
      </Section>

      <Section title={t("astrology.housesTitle")}>
        {chart.houses.slice(0, 12).map((house) => (
          <HouseRow key={`house-${house.house}-${house.absolute_degree}`} house={house} />
        ))}
      </Section>

      <Section title={t("astrology.aspectsTitle")}>
        {chart.aspects.length === 0 ? (
          <Text style={styles.muted}>{t("astrology.noAspects")}</Text>
        ) : (
          chart.aspects.slice(0, 10).map((aspect, index) => (
            <AspectRow key={`${aspect.type}-${aspect.between.join("-")}-${index}`} aspect={aspect} />
          ))
        )}
      </Section>

      <Section title={t("astrology.referencesTitle")}>
        <ReferenceLine label={t("astrology.engine")} value={chart.engine.name} />
        <ReferenceLine label="UTC" value={chart.time.utc} />
        <ReferenceLine label="JD UT" value={String(chart.time.julian_day_ut)} />
        <ReferenceLine
          label={t("astrology.location")}
          value={`${chart.input.latitude.toFixed(4)}, ${chart.input.longitude.toFixed(4)} / ${chart.input.timezone}`}
        />
        <Text style={styles.referenceBody}>{t("astrology.referenceBody")}</Text>
      </Section>

      {chart.warnings.length > 0 ? (
        <InsightCard title={t("astrology.warningsTitle")} body={chart.warnings.join("\n")} />
      ) : null}
    </Screen>
  );
}

function ChartWheel({ chart }: { chart: NatalChart }) {
  const wheelPoints = [
    chart.sun.sign_label,
    chart.moon.sign_label,
    chart.ascendant.sign_label,
    chart.midheaven?.sign_label
  ].filter(Boolean);

  return (
    <View style={styles.wheel}>
      <View style={styles.wheelRingOuter} />
      <View style={styles.wheelRingMiddle} />
      <View style={styles.wheelRingInner} />
      <View style={styles.wheelAxisVertical} />
      <View style={styles.wheelAxisHorizontal} />
      <MirrorMark size={42} />
      {wheelPoints.slice(0, 4).map((label, index) => (
        <Text key={`${label}-${index}`} style={[styles.wheelLabel, wheelLabelStyles[index]]}>
          {label}
        </Text>
      ))}
    </View>
  );
}

function PointCard({ label, point }: { label: string; point?: ZodiacPoint }) {
  const { t } = useI18n();

  return (
    <View style={styles.pointCard}>
      <Text style={styles.pointLabel}>{label}</Text>
      <Text style={styles.pointValue}>{point ? point.sign_label : t("astrology.noMidheaven")}</Text>
      {point ? (
        <Text style={styles.pointMeta}>
          {formatDegree(point)}
          {point.retrograde ? ` / ${t("astrology.retrograde")}` : ""}
        </Text>
      ) : null}
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function PointRow({ point, right }: { point: ZodiacPoint; right: string }) {
  const { t } = useI18n();

  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{point.label}</Text>
        <Text style={styles.rowMeta}>{point.sign_label}</Text>
      </View>
      <Text style={styles.rowValue}>
        {right}
        {point.retrograde ? ` ${t("astrology.retrograde")}` : ""}
      </Text>
    </View>
  );
}

function HouseRow({ house }: { house: HousePoint }) {
  const { t } = useI18n();

  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>
          {house.house}. {t("astrology.house")}
        </Text>
        <Text style={styles.rowMeta}>{house.sign_label}</Text>
      </View>
      <Text style={styles.rowValue}>{formatDegree(house)}</Text>
    </View>
  );
}

function AspectRow({ aspect }: { aspect: NatalAspect }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{aspect.label}</Text>
        <Text style={styles.rowMeta}>{aspect.between.join(" / ")}</Text>
      </View>
      <Text style={styles.rowValue}>{aspect.orb.toFixed(1)} orb</Text>
    </View>
  );
}

function ReferenceLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.referenceLine}>
      <Text style={styles.referenceLabel}>{label}</Text>
      <Text style={styles.referenceValue}>{value}</Text>
    </View>
  );
}

function formatDegree(point: ZodiacPoint | HousePoint) {
  return `${point.degree.toFixed(1)}° ${point.sign_label}`;
}

const wheelLabelStyles = [
  { top: 12, alignSelf: "center" },
  { right: 10, top: "43%" },
  { bottom: 12, alignSelf: "center" },
  { left: 10, top: "43%" }
] as const;

const styles = StyleSheet.create({
  hero: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md
  },
  heroText: {
    gap: spacing.xs
  },
  heroTitle: {
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "600"
  },
  heroBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "300"
  },
  wheel: {
    width: "100%",
    aspectRatio: 1,
    maxHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center"
  },
  wheelRingOuter: {
    position: "absolute",
    width: "88%",
    height: "88%",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.accent
  },
  wheelRingMiddle: {
    position: "absolute",
    width: "68%",
    height: "68%",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border
  },
  wheelRingInner: {
    position: "absolute",
    width: "42%",
    height: "42%",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border
  },
  wheelAxisVertical: {
    position: "absolute",
    width: 1,
    height: "84%",
    backgroundColor: colors.border
  },
  wheelAxisHorizontal: {
    position: "absolute",
    height: 1,
    width: "84%",
    backgroundColor: colors.border
  },
  wheelLabel: {
    position: "absolute",
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  pointCard: {
    width: "48%",
    minHeight: 96,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs
  },
  pointLabel: {
    color: colors.muted,
    fontSize: 12
  },
  pointValue: {
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600"
  },
  pointMeta: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800"
  },
  section: {
    gap: spacing.sm
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
    marginTop: spacing.sm
  },
  sectionCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs
  },
  row: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm
  },
  rowText: {
    flex: 1,
    gap: 2
  },
  rowTitle: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800"
  },
  rowMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17
  },
  rowValue: {
    color: colors.accent,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
    textAlign: "right",
    maxWidth: 128
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    paddingVertical: spacing.sm
  },
  referenceLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.xs
  },
  referenceLabel: {
    color: colors.muted,
    fontSize: 12
  },
  referenceValue: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
    textAlign: "right"
  },
  referenceBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    paddingTop: spacing.sm
  }
});
