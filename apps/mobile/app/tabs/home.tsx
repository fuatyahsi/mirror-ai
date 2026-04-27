import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MirrorMark } from "@/components/brand/MirrorMark";
import { InsightCard } from "@/components/cards/InsightCard";
import { ReadingCard } from "@/components/cards/ReadingCard";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { generateDailyInsight } from "@/features/dailyInsight/api";
import { useI18n } from "@/i18n";
import { useUserStore } from "@/stores/useUserStore";
import { colors, radii, spacing } from "@/theme";

export default function HomeScreen() {
  const profile = useUserStore((state) => state.profile);
  const readings = useUserStore((state) => state.readings);
  const memoryEvents = useUserStore((state) => state.memoryEvents);
  const addReading = useUserStore((state) => state.addReading);
  const { locale, t } = useI18n();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string>();

  async function createDaily() {
    setIsGenerating(true);
    setGenerationError(undefined);
    try {
      const reading = await generateDailyInsight({
        topic: "love",
        mood: "calm",
        question: locale === "en" ? "What should I pay attention to today?" : "Bugün nelere dikkat etmeliyim?",
        profile: profile.mystic_profile,
        memory: memoryEvents,
        natalChart: profile.natal_chart,
        locale
      });
      addReading(reading);
      router.push(`/readings/${reading.id}`);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : t("home.dailyError"));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Screen>
      <View style={styles.heroRow}>
        <View style={styles.heroText}>
          <PageHeader eyebrow={t("home.eyebrow")} title={t("home.title")} subtitle={t("home.subtitle")} />
        </View>
        <MirrorMark size={44} />
      </View>
      <InsightCard
        meta={profile.mystic_profile?.profile_title || t("home.energyMeta")}
        title={t("home.energyTitle")}
        body={t("home.energyBody")}
        accent
      />
      <PrimaryButton disabled={isGenerating} onPress={createDaily}>
        {isGenerating ? t("common.loadingGemini") : t("home.dailyButton")}
      </PrimaryButton>
      {generationError ? <InsightCard title={t("home.generationErrorTitle")} body={generationError} /> : null}
      <View style={styles.actions}>
        <QuickAction title={t("home.quickCoffee")} onPress={() => router.push("/tabs/coffee")} />
        <QuickAction title={t("home.quickTarot")} onPress={() => router.push("/tabs/tarot")} />
        <QuickAction title={t("home.quickRelationship")} onPress={() => router.push("/tabs/relationship")} />
        <QuickAction title={t("home.quickAstrology")} onPress={() => router.push("/tabs/astrology")} />
        <QuickAction title={t("home.quickProfile")} onPress={() => router.push("/tabs/profile")} />
      </View>
      <Text style={styles.sectionTitle}>{t("home.recent")}</Text>
      {readings.length === 0 ? (
        <InsightCard title={t("home.noReadingsTitle")} body={t("home.noReadingsBody")} />
      ) : (
        readings.slice(0, 4).map((reading) => <ReadingCard key={reading.id} reading={reading} />)
      )}
    </Screen>
  );
}

function QuickAction({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Text onPress={onPress} style={styles.quick}>
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md
  },
  heroText: {
    flex: 1
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  quick: {
    width: "48%",
    minHeight: 48,
    borderRadius: radii.sm,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    padding: spacing.md,
    fontWeight: "800",
    textAlign: "center"
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
    marginTop: spacing.md
  }
});
