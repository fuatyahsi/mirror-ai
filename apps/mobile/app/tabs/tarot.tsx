import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { TextField } from "@/components/forms/TextField";
import { generateTarotMock } from "@/features/readings/mockReadings";
import { useUserStore } from "@/stores/useUserStore";
import { colors, radii, spacing } from "@/theme";

const spreadOptions = [
  { id: "single", label: "Tek kart" },
  { id: "three_card", label: "Üç kart" },
  { id: "relationship", label: "İlişki" },
  { id: "decision", label: "Karar" }
];

export default function TarotScreen() {
  const profile = useUserStore((state) => state.profile.mystic_profile);
  const addReading = useUserStore((state) => state.addReading);
  const [spreadType, setSpreadType] = useState("three_card");
  const [topic, setTopic] = useState("relationship");
  const [question, setQuestion] = useState("");

  function generate() {
    const result = generateTarotMock(spreadType, topic, question, profile);
    addReading(result.reading);
    router.push(`/readings/${result.reading.id}`);
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="Tarot"
        title="Kartları hüküm değil ayna olarak aç"
        subtitle="Kart seçimi mock seed ile yapılır; gerçek backend akışında seçilen kartlar readings ve tarot_spreads tablolarına kaydedilir."
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
      <PrimaryButton disabled={!question} onPress={generate}>
        Kartları aç
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
  }
});

