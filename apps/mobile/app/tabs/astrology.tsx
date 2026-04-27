import type { ReactNode } from "react";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MirrorMark } from "@/components/brand/MirrorMark";
import { InsightCard } from "@/components/cards/InsightCard";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { calculateNatalChart } from "@/features/astrology/api";
import { useI18n } from "@/i18n";
import { useUserStore } from "@/stores/useUserStore";
import { colors, radii, spacing, typography } from "@/theme";
import type { HousePoint, NatalAspect, NatalChart, ZodiacPoint } from "@/types/astrology";

type AstrologyView = "birth" | "star" | "natal";

export default function AstrologyScreen() {
  const profile = useUserStore((state) => state.profile);
  const setNatalChart = useUserStore((state) => state.setNatalChart);
  const { t } = useI18n();
  const chart = profile.natal_chart;
  const [activeView, setActiveView] = useState<AstrologyView>("birth");
  const [isCalculating, setIsCalculating] = useState(false);
  const [chartError, setChartError] = useState<string>();
  const birth = profile.birth;
  const hasBirthInput =
    Boolean(birth.birth_date) &&
    typeof birth.latitude === "number" &&
    typeof birth.longitude === "number" &&
    Boolean(birth.timezone);

  async function calculateChart() {
    if (!hasBirthInput || !birth.birth_date || typeof birth.latitude !== "number" || typeof birth.longitude !== "number") {
      router.push("/onboarding/birth-info");
      return;
    }

    setIsCalculating(true);
    setChartError(undefined);
    try {
      const nextChart = await calculateNatalChart({
        birth_date: birth.birth_date,
        birth_time: birth.birth_time || "12:00",
        latitude: birth.latitude,
        longitude: birth.longitude,
        timezone: birth.timezone || "UTC",
        house_system: "P"
      });
      setNatalChart(nextChart);
    } catch (error) {
      setChartError(error instanceof Error ? error.message : t("astrology.chartError"));
    } finally {
      setIsCalculating(false);
    }
  }

  if (!chart) {
    return (
      <Screen>
        <PageHeader eyebrow={t("astrology.eyebrow")} title={t("astrology.title")} subtitle={t("astrology.subtitle")} />
        <InsightCard title={t("astrology.emptyTitle")} body={t("astrology.emptyBody")} accent />
        {hasBirthInput ? (
          <PrimaryButton disabled={isCalculating} onPress={calculateChart}>
            {isCalculating ? t("birth.calculatingChart") : t("astrology.calculateChart")}
          </PrimaryButton>
        ) : (
          <PrimaryButton onPress={() => router.push("/onboarding/birth-info")}>{t("astrology.enterBirth")}</PrimaryButton>
        )}
        {chartError ? <Text style={styles.error}>{chartError}</Text> : null}
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeader eyebrow={t("astrology.eyebrow")} title={t("astrology.title")} subtitle={t("astrology.subtitle")} />
      <SegmentedControl activeView={activeView} onChange={setActiveView} />
      {activeView === "birth" ? <BirthChartView chart={chart} /> : null}
      {activeView === "star" ? <StarChartView chart={chart} /> : null}
      {activeView === "natal" ? <NatalHoroscopeView chart={chart} /> : null}
      {chart.warnings.length > 0 ? (
        <InsightCard title={t("astrology.warningsTitle")} body={chart.warnings.join("\n")} />
      ) : null}
    </Screen>
  );
}

function SegmentedControl({ activeView, onChange }: { activeView: AstrologyView; onChange: (view: AstrologyView) => void }) {
  const { t } = useI18n();
  const items: { value: AstrologyView; label: string }[] = [
    { value: "birth", label: t("astrology.birthTab") },
    { value: "star", label: t("astrology.starTab") },
    { value: "natal", label: t("astrology.natalTab") }
  ];

  return (
    <View style={styles.segmented}>
      {items.map((item) => {
        const active = activeView === item.value;
        return (
          <Pressable key={item.value} onPress={() => onChange(item.value)} style={[styles.segment, active && styles.segmentActive]}>
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function BirthChartView({ chart }: { chart: NatalChart }) {
  const { t } = useI18n();
  const corePoints = [
    { label: t("astrology.sun"), point: chart.sun },
    { label: t("astrology.moon"), point: chart.moon },
    { label: t("astrology.ascendant"), point: chart.ascendant },
    { label: t("astrology.midheaven"), point: chart.midheaven }
  ];

  return (
    <>
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

      <Section title={t("astrology.referencesTitle")}>
        <ReferenceLine label={t("astrology.engine")} value={chart.engine.name} />
        <ReferenceLine label={t("astrology.birthData")} value={formatBirthData(chart)} />
        <ReferenceLine label="UTC" value={chart.time.utc} />
        <ReferenceLine label="JD UT" value={String(chart.time.julian_day_ut)} />
        <ReferenceLine
          label={t("astrology.location")}
          value={`${chart.input.latitude.toFixed(4)}, ${chart.input.longitude.toFixed(4)} / ${chart.input.timezone}`}
        />
        <Text style={styles.referenceBody}>{t("astrology.referenceBody")}</Text>
      </Section>
    </>
  );
}

function StarChartView({ chart }: { chart: NatalChart }) {
  const { t } = useI18n();

  return (
    <>
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
    </>
  );
}

function NatalHoroscopeView({ chart }: { chart: NatalChart }) {
  const { t } = useI18n();
  const venus = findPlanet(chart, "venus");
  const mars = findPlanet(chart, "mars");
  const mercury = findPlanet(chart, "mercury");

  return (
    <>
      <InsightCard title={t("astrology.natalTitle")} body={t("astrology.natalBody")} accent />
      <Section title={t("astrology.interpretationTitle")}>
        <InterpretationCard
          title={t("astrology.identityLens")}
          body={t("astrology.identityBody", {
            sun: chart.sun.sign_label,
            ascendant: chart.ascendant.sign_label
          })}
          references={[pointReference(t("astrology.sun"), chart.sun), pointReference(t("astrology.ascendant"), chart.ascendant)]}
        />
        <InterpretationCard
          title={t("astrology.emotionalLens")}
          body={t("astrology.emotionalBody", { moon: chart.moon.sign_label })}
          references={[pointReference(t("astrology.moon"), chart.moon), mercury ? pointReference("Mercury", mercury) : undefined].filter(Boolean) as string[]}
        />
        <InterpretationCard
          title={t("astrology.relationalLens")}
          body={t("astrology.relationalBody", {
            venus: venus ? formatPointShort(venus) : t("common.notSet"),
            mars: mars ? formatPointShort(mars) : t("common.notSet")
          })}
          references={[
            venus ? pointReference("Venus", venus) : undefined,
            mars ? pointReference("Mars", mars) : undefined,
            chart.aspects[0] ? aspectReference(chart.aspects[0]) : undefined
          ].filter(Boolean) as string[]}
        />
      </Section>
    </>
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

function InterpretationCard({ title, body, references }: { title: string; body: string; references: string[] }) {
  const { t } = useI18n();

  return (
    <View style={styles.interpretationCard}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.interpretationBody}>{body}</Text>
      <Text style={styles.referenceHeading}>{t("astrology.references")}</Text>
      {references.map((reference) => (
        <Text key={reference} style={styles.referenceBullet}>
          {reference}
        </Text>
      ))}
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

function findPlanet(chart: NatalChart, key: string) {
  return chart.planets.find((planet) => planet.key === key);
}

function formatDegree(point: ZodiacPoint | HousePoint) {
  return `${point.degree.toFixed(1)}° ${point.sign_label}`;
}

function formatPointShort(point: ZodiacPoint) {
  return `${point.sign_label} ${point.degree.toFixed(1)}°${point.retrograde ? " R" : ""}`;
}

function pointReference(label: string, point: ZodiacPoint) {
  return `${label}: ${formatPointShort(point)} / ${point.absolute_degree.toFixed(1)}° absolute`;
}

function aspectReference(aspect: NatalAspect) {
  return `${aspect.label}: ${aspect.between.join(" - ")} / ${aspect.orb.toFixed(1)} orb`;
}

function formatBirthData(chart: NatalChart) {
  return `${chart.input.birth_date} / ${chart.input.birth_time ?? "12:00"} / ${chart.input.timezone}`;
}

const wheelLabelStyles = [
  { top: 12, alignSelf: "center" },
  { right: 10, top: "43%" },
  { bottom: 12, alignSelf: "center" },
  { left: 10, top: "43%" }
] as const;

const styles = StyleSheet.create({
  segmented: {
    flexDirection: "row",
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 4,
    gap: 4
  },
  segment: {
    flex: 1,
    minHeight: 42,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center"
  },
  segmentActive: {
    backgroundColor: colors.accent
  },
  segmentText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800"
  },
  segmentTextActive: {
    color: colors.background
  },
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
  interpretationCard: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.md,
    gap: spacing.xs
  },
  interpretationBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  referenceHeading: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    marginTop: spacing.xs
  },
  referenceBullet: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
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
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 19
  }
});
