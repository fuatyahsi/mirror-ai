import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { InsightCard } from "@/components/cards/InsightCard";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { BackButton } from "@/components/layout/BackButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { useI18n } from "@/i18n";
import { useUserStore } from "@/stores/useUserStore";
import { colors, radii, spacing } from "@/theme";
import type { NatalChart, ZodiacPoint } from "@/types/astrology";
import type { FeedbackScore, ReadingOutput, ReadingSection } from "@/types/readings";

export default function ReadingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const reading = useUserStore((state) => state.readings.find((item) => item.id === id));
  const profile = useUserStore((state) => state.profile);
  const submitFeedback = useUserStore((state) => state.submitFeedback);
  const { t } = useI18n();

  if (!reading) {
    return (
      <Screen>
        <PageHeader title={t("detail.notFoundTitle")} subtitle={t("detail.notFoundSubtitle")} />
        <PrimaryButton onPress={() => router.replace("/tabs/home")}>{t("detail.goHome")}</PrimaryButton>
      </Screen>
    );
  }

  const currentReading = reading;

  function feedback(score: FeedbackScore) {
    submitFeedback({
      reading_id: currentReading.id,
      score,
      accuracy_rating: score === "accurate" ? 5 : score === "partial" ? 3 : 1,
      emotional_resonance: score === "inaccurate" ? 2 : 4
    });
    router.push("/tabs/profile");
  }

  return (
    <Screen>
      <BackButton fallbackHref="/tabs/home" />
      <PageHeader eyebrow={currentReading.reading_type} title={currentReading.title} subtitle={currentReading.summary} />
      {currentReading.sections.map((section, index) => (
        <ReadingSectionCard
          key={`${section.title}-${index}`}
          section={section}
          references={buildSectionReferences(section, index, currentReading, profile.natal_chart, {
            birth: t("astrology.birthData"),
            sun: t("astrology.sun"),
            moon: t("astrology.moon"),
            ascendant: t("astrology.ascendant")
          })}
        />
      ))}
      <InsightCard title={t("detail.advice")} body={currentReading.advice} />
      <InsightCard title={t("detail.reflection")} body={currentReading.reflection_question} />
      <View style={styles.explanation}>
        <Text style={styles.explanationTitle}>{t("detail.basedOn")}</Text>
        {currentReading.explanation.based_on.map((item, index) => (
          <Text key={`${item}-${index}`} style={styles.basedOn}>
            {item}
          </Text>
        ))}
        <Text style={styles.limitations}>{currentReading.explanation.limitations}</Text>
      </View>
      {currentReading.source_context ? (
        <View style={styles.explanation}>
          <Text style={styles.explanationTitle}>{t("detail.proof")}</Text>
          <Text style={styles.limitations}>
            {t("detail.systems")}: {currentReading.source_context.systems.join(", ")}
          </Text>
          {currentReading.source_context.engine ? (
            <Text style={styles.limitations}>
              {t("detail.engine")}: {currentReading.source_context.engine}
            </Text>
          ) : null}
        </View>
      ) : null}
      <InsightCard title={t("detail.safety")} body={currentReading.safety_note} />
      <View style={styles.feedback}>
        <Text style={styles.feedbackTitle}>{t("detail.feedbackTitle")}</Text>
        <PrimaryButton onPress={() => feedback("accurate")}>{t("detail.accurate")}</PrimaryButton>
        <PrimaryButton variant="secondary" onPress={() => feedback("partial")}>
          {t("detail.partial")}
        </PrimaryButton>
        <PrimaryButton variant="secondary" onPress={() => feedback("inaccurate")}>
          {t("detail.inaccurate")}
        </PrimaryButton>
      </View>
    </Screen>
  );
}

function ReadingSectionCard({
  section,
  references
}: {
  section: ReadingSection;
  references: string[];
}) {
  const { t } = useI18n();

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionCardTitle}>{section.title}</Text>
      <Text style={styles.sectionCardBody}>{section.body}</Text>
      {references.length > 0 ? (
        <View style={styles.sectionReferences}>
          <Text style={styles.referenceTitle}>{t("detail.cardReferences")}</Text>
          {references.map((reference) => (
            <Text key={reference} style={styles.referenceItem}>
              {reference}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function buildSectionReferences(
  section: ReadingSection,
  index: number,
  reading: ReadingOutput,
  chart: NatalChart | undefined,
  labels: { birth: string; sun: string; moon: string; ascendant: string }
) {
  const directReferences = Array.isArray(section.references) ? section.references : [];
  const sourceReferences = reading.source_context?.references ?? [];
  const titleWords = section.title.toLocaleLowerCase("tr-TR").split(/\s+/);
  const matchingSourceRefs = sourceReferences.filter((reference) => {
    const lower = reference.toLocaleLowerCase("tr-TR");
    return titleWords.some((word) => word.length > 3 && lower.includes(word));
  });

  return unique([
    ...directReferences,
    ...matchingSourceRefs.slice(0, 2),
    ...chartReferencesForSection(chart, index, labels)
  ]).slice(0, 7);
}

function chartReferencesForSection(
  chart: NatalChart | undefined,
  index: number,
  labels: { birth: string; sun: string; moon: string; ascendant: string }
) {
  if (!chart) return [];

  const personalPlanets = chart.planets.filter((planet) =>
    ["mercury", "venus", "mars", "jupiter", "saturn"].includes(planet.key)
  );
  const selectedPlanet = personalPlanets[index % Math.max(personalPlanets.length, 1)];
  const selectedAspect = chart.aspects[index % Math.max(chart.aspects.length, 1)];

  return [
    `${labels.birth}: ${chart.input.birth_date} / ${chart.input.birth_time ?? "12:00"} / ${chart.input.timezone}`,
    pointReference(labels.sun, chart.sun),
    pointReference(labels.moon, chart.moon),
    pointReference(labels.ascendant, chart.ascendant),
    selectedPlanet ? pointReference(selectedPlanet.label, selectedPlanet) : undefined,
    selectedAspect ? `${selectedAspect.label}: ${selectedAspect.between.join(" - ")} / ${selectedAspect.orb.toFixed(1)} orb` : undefined
  ].filter(Boolean) as string[];
}

function pointReference(label: string, point: ZodiacPoint) {
  return `${label}: ${point.sign_label} ${point.degree.toFixed(1)}°${point.retrograde ? " R" : ""}`;
}

function unique(items: string[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: spacing.sm
  },
  sectionCardTitle: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900"
  },
  sectionCardBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 21
  },
  sectionReferences: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    gap: spacing.xs
  },
  referenceTitle: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  referenceItem: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  explanation: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  explanationTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  basedOn: {
    color: colors.accent,
    fontSize: 14
  },
  limitations: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  },
  feedback: {
    gap: spacing.sm,
    marginTop: spacing.md
  },
  feedbackTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  }
});
