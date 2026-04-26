import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackButton } from "@/components/layout/BackButton";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { InsightCard } from "@/components/cards/InsightCard";
import { calculateNatalChart } from "@/features/astrology/api";
import { useUserStore } from "@/stores/useUserStore";
import { colors, spacing } from "@/theme";

export default function OnboardingResultScreen() {
  const userProfile = useUserStore((state) => state.profile);
  const profile = userProfile.mystic_profile;
  const setNatalChart = useUserStore((state) => state.setNatalChart);
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
        setChartError(error instanceof Error ? error.message : "Doğum haritası hesaplanamadı.");
        setChartStatus("error");
      });
  }, [setNatalChart, userProfile.birth, userProfile.natal_chart]);

  const chart = userProfile.natal_chart;

  return (
    <Screen>
      <BackButton label="Bilgileri düzenle" fallbackHref="/onboarding/birth-info" />
      <PageHeader
        eyebrow="Mistik profil"
        title={profile?.profile_title || "Profilin hazır"}
        subtitle={profile?.profile_summary}
      />
      {profile ? (
        <View style={styles.grid}>
          <Score label="Sezgisel açıklık" value={profile.intuitive_openness} />
          <Score label="Belirsizlik toleransı" value={profile.uncertainty_tolerance} />
          <Score label="Duygusal yoğunluk" value={profile.emotional_intensity} />
          <Score label="Netlik ihtiyacı" value={profile.rationality_need} />
        </View>
      ) : null}
      <InsightCard
        title="İlişki döngüsü"
        body={profile?.relationship_pattern || "İlk yorumlardan sonra daha netleşecek."}
      />
      <InsightCard
        title="Yorum stili"
        body={profile?.preferred_reading_style || "Sakin, açıklanabilir ve sembolik."}
      />
      <InsightCard
        title="Doğum haritası"
        body={
          chartStatus === "loading"
            ? "Swiss Ephemeris katmanı doğum haritanı hesaplıyor."
            : chart
              ? `Swiss Ephemeris sonucu: Güneş ${chart.sun.sign_label}, Ay ${chart.moon.sign_label}, Yükselen ${chart.ascendant.sign_label}.`
              : chartError || "Harita hesabı için doğum tarihi, koordinat ve timezone gerekli."
        }
      />
      {chartError ? (
        <PrimaryButton variant="secondary" onPress={() => router.push("/onboarding/birth-info")}>
          Doğum bilgilerini düzelt
        </PrimaryButton>
      ) : null}
      <PrimaryButton onPress={() => router.replace("/tabs/home")}>Ana ekrana geç</PrimaryButton>
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
