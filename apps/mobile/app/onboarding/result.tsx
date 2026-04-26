import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { InsightCard } from "@/components/cards/InsightCard";
import { useUserStore } from "@/stores/useUserStore";
import { colors, spacing } from "@/theme";

export default function OnboardingResultScreen() {
  const profile = useUserStore((state) => state.profile.mystic_profile);

  return (
    <Screen>
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

