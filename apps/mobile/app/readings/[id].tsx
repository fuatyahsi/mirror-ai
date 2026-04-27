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
import type { FeedbackScore } from "@/types/readings";

export default function ReadingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const reading = useUserStore((state) => state.readings.find((item) => item.id === id));
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
        <InsightCard key={`${section.title}-${index}`} title={section.title} body={section.body} />
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
          {currentReading.source_context.references.map((item, index) => (
            <Text key={`${item}-${index}`} style={styles.basedOn}>
              {item}
            </Text>
          ))}
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

const styles = StyleSheet.create({
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
