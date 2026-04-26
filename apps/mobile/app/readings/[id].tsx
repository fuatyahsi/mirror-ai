import { useLocalSearchParams, router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackButton } from "@/components/layout/BackButton";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { InsightCard } from "@/components/cards/InsightCard";
import { useUserStore } from "@/stores/useUserStore";
import { colors, radii, spacing } from "@/theme";
import type { FeedbackScore } from "@/types/readings";

export default function ReadingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const reading = useUserStore((state) => state.readings.find((item) => item.id === id));
  const submitFeedback = useUserStore((state) => state.submitFeedback);

  if (!reading) {
    return (
      <Screen>
        <PageHeader title="Yorum bulunamadı" subtitle="Bu mock prototipte geçmiş yorumlar bellekte tutulur." />
        <PrimaryButton onPress={() => router.replace("/tabs/home")}>Ana ekrana dön</PrimaryButton>
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
      {currentReading.sections.map((section) => (
        <InsightCard key={section.title} title={section.title} body={section.body} />
      ))}
      <InsightCard title="Öneri" body={currentReading.advice} />
      <InsightCard title="Yansıma sorusu" body={currentReading.reflection_question} />
      <View style={styles.explanation}>
        <Text style={styles.explanationTitle}>Neye dayanıyor?</Text>
        {currentReading.explanation.based_on.map((item) => (
          <Text key={item} style={styles.basedOn}>
            {item}
          </Text>
        ))}
        <Text style={styles.limitations}>{currentReading.explanation.limitations}</Text>
      </View>
      {currentReading.source_context ? (
        <View style={styles.explanation}>
          <Text style={styles.explanationTitle}>Referans ve kanıt kartı</Text>
          <Text style={styles.limitations}>
            Sistemler: {currentReading.source_context.systems.join(", ")}
          </Text>
          {currentReading.source_context.references.map((item) => (
            <Text key={item} style={styles.basedOn}>
              {item}
            </Text>
          ))}
        </View>
      ) : null}
      <InsightCard title="Güvenlik notu" body={currentReading.safety_note} />
      <View style={styles.feedback}>
        <Text style={styles.feedbackTitle}>Bu yorum sana uydu mu?</Text>
        <PrimaryButton onPress={() => feedback("accurate")}>İsabetli</PrimaryButton>
        <PrimaryButton variant="secondary" onPress={() => feedback("partial")}>
          Kısmen
        </PrimaryButton>
        <PrimaryButton variant="secondary" onPress={() => feedback("inaccurate")}>
          İsabetsiz
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
