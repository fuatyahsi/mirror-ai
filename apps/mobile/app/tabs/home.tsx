import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { InsightCard } from "@/components/cards/InsightCard";
import { ReadingCard } from "@/components/cards/ReadingCard";
import { generateDailyInsight } from "@/features/dailyInsight/api";
import { useUserStore } from "@/stores/useUserStore";
import { colors, radii, spacing } from "@/theme";

export default function HomeScreen() {
  const profile = useUserStore((state) => state.profile);
  const readings = useUserStore((state) => state.readings);
  const memoryEvents = useUserStore((state) => state.memoryEvents);
  const addReading = useUserStore((state) => state.addReading);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string>();

  async function createDaily() {
    setIsGenerating(true);
    setGenerationError(undefined);
    try {
      const reading = await generateDailyInsight({
        topic: "love",
        mood: "calm",
        question: "Bugün nelere dikkat etmeliyim?",
        profile: profile.mystic_profile,
        memory: memoryEvents,
        natalChart: profile.natal_chart
      });
      addReading(reading);
      router.push(`/readings/${reading.id}`);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Gemini yorumu alınamadı.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="Mirror AI"
        title="Bugün iç aynanda ne var?"
        subtitle="Kişisel profilin, geri bildirimlerin ve sembolik yorumların burada birleşir."
      />
      <InsightCard
        meta={profile.mystic_profile?.profile_title || "Mistik profil"}
        title="Günlük enerji"
        body="Bugün netlik arayışı ile sezgisel hisleri ayırmak iyi gelebilir."
      />
      <PrimaryButton disabled={isGenerating} onPress={createDaily}>
        {isGenerating ? "Gemini yorumluyor" : "Bugünkü içgörümü göster"}
      </PrimaryButton>
      {generationError ? (
        <InsightCard title="LLM bağlantısı" body={generationError} />
      ) : null}
      <View style={styles.actions}>
        <QuickAction title="Kahve falı" onPress={() => router.push("/tabs/coffee")} />
        <QuickAction title="Tarot" onPress={() => router.push("/tabs/tarot")} />
        <QuickAction title="İlişki analizi" onPress={() => router.push("/tabs/relationship")} />
        <QuickAction title="Profil" onPress={() => router.push("/tabs/profile")} />
      </View>
      <Text style={styles.sectionTitle}>Son yorumlar</Text>
      {readings.length === 0 ? (
        <InsightCard
          title="Henüz yorum yok"
          body="İlk günlük içgörünü oluşturduğunda geçmiş yorumların burada görünür."
        />
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
