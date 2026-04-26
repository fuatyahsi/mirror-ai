import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { TextField } from "@/components/forms/TextField";
import { generateCoffeeMock } from "@/features/readings/mockReadings";
import { useUserStore } from "@/stores/useUserStore";
import { colors, radii, spacing } from "@/theme";

export default function CoffeeScreen() {
  const profile = useUserStore((state) => state.profile.mystic_profile);
  const addReading = useUserStore((state) => state.addReading);
  const [cupImage, setCupImage] = useState<string>();
  const [topic, setTopic] = useState("love");
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");

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

  function generate() {
    const result = generateCoffeeMock(topic, question, context, profile);
    addReading(result.reading);
    router.push(`/readings/${result.reading.id}`);
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="Kahve falı"
        title="Fincandaki sembolleri kişisel bağlamla oku"
        subtitle="MVP'de görsel analizi mock çalışır; gerçek vision modeli Edge Function katmanında bağlanacak."
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
      <PrimaryButton disabled={!question} onPress={generate}>
        Analizi başlat
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
  }
});

