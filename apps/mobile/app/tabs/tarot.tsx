import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { TextField } from "@/components/forms/TextField";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { generateTarotReading } from "@/features/tarotReading/api";
import { useI18n } from "@/i18n";
import { useUserStore } from "@/stores/useUserStore";
import { colors, radii, spacing } from "@/theme";

const spreadOptions = [
  { id: "single", labelKey: "tarot.single" },
  { id: "three_card", labelKey: "tarot.three" },
  { id: "relationship", labelKey: "tarot.relationship" },
  { id: "decision", labelKey: "tarot.decision" }
] as const;

export default function TarotScreen() {
  const userProfile = useUserStore((state) => state.profile);
  const memoryEvents = useUserStore((state) => state.memoryEvents);
  const addReading = useUserStore((state) => state.addReading);
  const { locale, t } = useI18n();
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
        natalChart: userProfile.natal_chart,
        locale
      });
      addReading(result.reading);
      router.push(`/readings/${result.reading.id}`);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : t("tarot.error"));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Screen>
      <PageHeader eyebrow={t("tarot.eyebrow")} title={t("tarot.title")} subtitle={t("tarot.subtitle")} />
      <View style={styles.options}>
        {spreadOptions.map((option) => (
          <Pressable
            key={option.id}
            style={[styles.option, spreadType === option.id && styles.active]}
            onPress={() => setSpreadType(option.id)}
          >
            <Text style={[styles.optionText, spreadType === option.id && styles.activeText]}>
              {t(option.labelKey)}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextField label={t("common.topic")} value={topic} onChangeText={setTopic} />
      <TextField
        label={t("common.question")}
        value={question}
        onChangeText={setQuestion}
        placeholder={t("tarot.questionPlaceholder")}
        multiline
      />
      {generationError ? <Text style={styles.error}>{generationError}</Text> : null}
      <PrimaryButton disabled={!question || isGenerating} onPress={generate}>
        {isGenerating ? t("common.loadingGemini") : t("tarot.openCards")}
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
