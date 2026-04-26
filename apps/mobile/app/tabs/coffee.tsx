import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { TextField } from "@/components/forms/TextField";
import { generateCoffeeReading } from "@/features/coffeeReading/api";
import { useUserStore } from "@/stores/useUserStore";
import { colors, radii, spacing } from "@/theme";

export default function CoffeeScreen() {
  const userProfile = useUserStore((state) => state.profile);
  const memoryEvents = useUserStore((state) => state.memoryEvents);
  const addReading = useUserStore((state) => state.addReading);
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
      const result = await generateCoffeeReading({
        cup_image_url: cupImage,
        topic,
        question,
        context,
        profile: userProfile.mystic_profile,
        memory: memoryEvents,
        natalChart: userProfile.natal_chart
      });
      addReading(result.reading);
      router.push(`/readings/${result.reading.id}`);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Gemini kahve yorumu alınamadı.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="Kahve falı"
        title="Fincandaki sembolleri kişisel bağlamla oku"
        subtitle="Şimdilik sembol çıkarımı örnek veriyle, yorum Gemini tarafından profil, hafıza ve doğum haritasıyla yapılır."
      />
      <View style={styles.upload}>
        {cupImage ? <Image source={{ uri: cupImage }} style={styles.image} /> : null}
        <PrimaryButton variant="secondary" onPress={pickImage}>
          Fincan fotoğrafı seç
        </PrimaryButton>
        <Text style={styles.note}>Fotoğraf daha sonra Supabase Storage altında kullanıcı bazlı path ile saklanacak.</Text>
      </View>
      <TextField label="Konu" value={topic} onChangeText={setTopic} placeholder="love, career, family" />
      <TextField
        label="Sorun"
        value={question}
        onChangeText={setQuestion}
        placeholder="Aklımdaki kişiyle aramızdaki enerji ne söylüyor?"
        multiline
      />
      <TextField
        label="Ek bağlam"
        value={context}
        onChangeText={setContext}
        placeholder="Son günlerde biraz uzaklaştı."
        multiline
      />
      {generationError ? <Text style={styles.error}>{generationError}</Text> : null}
      <PrimaryButton disabled={!question || isGenerating} onPress={generate}>
        {isGenerating ? "Gemini yorumluyor" : "Analizi başlat"}
      </PrimaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  upload: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: radii.sm,
    backgroundColor: colors.background
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
