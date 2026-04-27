import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { InsightCard } from "@/components/cards/InsightCard";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { BackButton } from "@/components/layout/BackButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { calculateNatalChart } from "@/features/astrology/api";
import { useI18n } from "@/i18n";
import { useUserStore } from "@/stores/useUserStore";
import { colors, spacing } from "@/theme";

export default function OnboardingResultScreen() {
  const userProfile = useUserStore((state) => state.profile);
  const profile = userProfile.mystic_profile;
  const setNatalChart = useUserStore((state) => state.setNatalChart);
  const { t } = useI18n();
  const [chartStatus, setChartStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [chartError, setChartError] = useState<string>();

  useEffect(() => {
    const birth = userProfile.birth;
    if (!birth.birth_date || !birth.latitude || !birth.longitude || userProfile.natal_chart) return;

    setChartStatus("loading");
    calculateNatalChart({
      birth_date: birth.birth_date,
      birth_time: birth.birth_time || "12:00",
      latitude: birth.latitude,
      longitude: birth.longitude,
      timezone: birth.timezone || "UTC",
      house_system: "P"
    })
      .then((chart) => {
        setNatalChart(chart);
        setChartStatus("ready");
      })
      .catch((error) => {
        setChartError(error instanceof Error ? error.message : t("result.chartFallback"));
        setChartStatus("error");
      });
  }, [setNatalChart, t, userProfile.birth, userProfile.natal_chart]);

  const chart = userProfile.natal_chart;

  return (
    <Screen>
      <BackButton label={t("result.edit")} fallbackHref="/onboarding/birth-info" />
      <PageHeader
        eyebrow={t("result.eyebrow")}
        title={profile?.profile_title || t("result.readyTitle")}
        subtitle={profile?.profile_summary}
      />
      {profile ? (
        <View style={styles.grid}>
          <Score label={t("result.intuitive")} value={profile.intuitive_openness} />
          <Score label={t("result.uncertainty")} value={profile.uncertainty_tolerance} />
          <Score label={t("result.emotional")} value={profile.emotional_intensity} />
          <Score label={t("result.clarity")} value={profile.rationality_need} />
        </View>
      ) : null}
      <InsightCard
        title={t("result.relationshipPattern")}
        body={profile?.relationship_pattern || t("result.relationshipFallback")}
      />
      <InsightCard
        title={t("result.readingStyle")}
        body={profile?.preferred_reading_style || t("result.readingStyleFallback")}
      />
      <InsightCard
        title={t("result.birthChart")}
        body={
          chartStatus === "loading"
            ? t("result.chartLoading")
            : chart
              ? t("result.chartReady", {
                  sun: chart.sun.sign_label,
                  moon: chart.moon.sign_label,
                  ascendant: chart.ascendant.sign_label
                })
              : chartError || t("result.chartFallback")
        }
      />
      {chartError ? (
        <PrimaryButton variant="secondary" onPress={() => router.push("/onboarding/birth-info")}>
          {t("result.fixBirth")}
        </PrimaryButton>
      ) : null}
      <PrimaryButton onPress={() => router.replace("/tabs/home")}>{t("result.toHome")}</PrimaryButton>
    </Screen>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.score}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.scoreValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  score: {
    width: "48%",
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs
  },
  scoreLabel: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17
  },
  scoreValue: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: "900"
  }
});
