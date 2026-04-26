import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { TextField } from "@/components/forms/TextField";
import { generateTarotReading } from "@/features/tarotReading/api";
import { useUserStore } from "@/stores/useUserStore";
import { colors, radii, spacing } from "@/theme";

const spreadOptions = [
  { id: "single", label: "Tek kart" },
  { id: "three_card", label: "Üç kart" },
  { id: "relationship", label: "İlişki" },
  { id: "decision", label: "Karar" }
];

export default function TarotScreen() {
  const userProfile = useUserStore((state) => state.profile);
  const memoryEvents = useUserStore((state) => state.memoryEvents);
  const addReading = useUserStore((state) => state.addReading);
  const [spreadType, setSpreadType] = useState("three_card");
  const [topic, setTopic] = useState("relationship");
  const [question, setQuestion] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string>();

  async function generate() {
    setIsGenerating(true);
    setGenerationError(undefined);
    try {
      const result = await generateTarotReading({
        spread_type: spreadType,
        topic,
        question,
        profile: userProfile.mystic_profile,
        memory: memoryEvents,
        natalChart: userProfile.natal_chart
      });
      addReading(result.reading);
      router.push(`/readings/${result.reading.id}`);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Gemini tarot yorumu alınamadı.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="Tarot"
        title="Kartları hüküm değil ayna olarak aç"
        subtitle="Kartlar Edge Function içinde seçilir; Gemini profil, hafıza ve doğum haritası bağlamıyla yorumlar."
      />
      <View style={styles.options}>
        {spreadOptions.map((option) => (
          <Pressable
            key={option.id}
            style={[styles.option, spreadType === option.id && styles.active]}
            onPress={() => setSpreadType(option.id)}
          >
            <Text style={[styles.optionText, spreadType === option.id && styles.activeText]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextField label="Konu" value={topic} onChangeText={setTopic} />
      <TextField
        label="Sorun"
        value={question}
        onChangeText={setQuestion}
        placeholder="Bu kişiyle devam etmeli miyim?"
        multiline
      />
      {generationError ? <Text style={styles.error}>{generationError}</Text> : null}
      <PrimaryButton disabled={!question || isGenerating} onPress={generate}>
        {isGenerating ? "Gemini yorumluyor" : "Kartları aç"}
      </PrimaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  option: {
    width: "48%",
    minHeight: 48,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm
  },
  active: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft
  },
  optionText: {
    color: colors.muted,
    fontWeight: "700"
  },
  activeText: {
    color: colors.text
  },
  error: {
    color: colors.danger,
    lineHeight: 20
  }
});
