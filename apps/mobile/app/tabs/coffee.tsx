import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { TextField } from "@/components/forms/TextField";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { SubtlePremiumOffer } from "@/components/paywall/SubtlePremiumOffer";
import { generateCoffeeReading, readImageAsBase64 } from "@/features/coffeeReading/api";
import { useI18n } from "@/i18n";
import { useUserStore } from "@/stores/useUserStore";
import { colors, featureColors, radii, spacing } from "@/theme";

export default function CoffeeScreen() {
  const userProfile = useUserStore((state) => state.profile);
  const memoryEvents = useUserStore((state) => state.memoryEvents);
  const addReading = useUserStore((state) => state.addReading);
  const { locale, t } = useI18n();
  const [cupImage, setCupImage] = useState<string>();
  const [topic, setTopic] = useState("love");
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string>();

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85
    });
    if (!result.canceled) {
      setCupImage(result.assets[0]?.uri);
    }
  }

  async function generate() {
    setIsGenerating(true);
    setGenerationError(undefined);
    try {
      // No-store: cihazdaki fotoğrafı sadece base64 olarak gövdede gönder.
      // Storage'a kaydetmeyiz, edge function'da da kaydedilmez.
      const cupPayload = cupImage ? await readImageAsBase64(cupImage) : undefined;
      const result = await generateCoffeeReading({
        cup_image_base64: cupPayload?.base64,
        cup_image_mime_type: cupPayload?.mimeType,
        topic,
        question,
        context,
        profile: userProfile.mystic_profile,
        memory: memoryEvents,
        natalChart: userProfile.natal_chart,
        locale
      });
      addReading(result.reading);
      router.push(`/readings/${result.reading.id}`);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : t("coffee.error"));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Screen>
      <PageHeader eyebrow={t("coffee.eyebrow")} title={t("coffee.title")} subtitle={t("coffee.subtitle")} />
      <View style={styles.upload}>
        {cupImage ? <Image source={{ uri: cupImage }} style={styles.image} /> : null}
        <PrimaryButton variant="secondary" onPress={pickImage}>
          {t("coffee.pickImage")}
        </PrimaryButton>
        <Text style={styles.note}>{t("coffee.photoNote")}</Text>
      </View>
      <TextField
        label={t("common.topic")}
        value={topic}
        onChangeText={setTopic}
        placeholder={t("coffee.topicPlaceholder")}
      />
      <TextField
        label={t("common.question")}
        value={question}
        onChangeText={setQuestion}
        placeholder={t("coffee.questionPlaceholder")}
        multiline
      />
      <TextField
        label={t("common.context")}
        value={context}
        onChangeText={setContext}
        placeholder={t("coffee.contextPlaceholder")}
        multiline
      />
      <SubtlePremiumOffer feature="detailed_coffee" compact />
      {generationError ? <Text style={styles.error}>{generationError}</Text> : null}
      <PrimaryButton disabled={!question || isGenerating} onPress={generate}>
        {isGenerating ? t("common.loadingMirror") : t("common.startAnalysis")}
      </PrimaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  upload: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: featureColors.coffee.accent,
    backgroundColor: featureColors.coffee.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: radii.sm,
    backgroundColor: featureColors.coffee.surfaceDeep
  },
  note: {
    color: colors.faint,
    fontSize: 12,
    lineHeight: 17
  },
  error: {
    color: colors.danger,
    lineHeight: 20
  }
});
