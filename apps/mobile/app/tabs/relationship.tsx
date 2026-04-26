import { router } from "expo-router";
import { useState } from "react";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { TextField } from "@/components/forms/TextField";
import { generateRelationshipReading } from "@/features/relationshipReading/api";
import { useUserStore } from "@/stores/useUserStore";
import { colors } from "@/theme";
import { Text } from "react-native";

export default function RelationshipScreen() {
  const userProfile = useUserStore((state) => state.profile);
  const memoryEvents = useUserStore((state) => state.memoryEvents);
  const addReading = useUserStore((state) => state.addReading);
  const [nickname, setNickname] = useState("");
  const [relationType, setRelationType] = useState("belirsiz ilişki");
  const [status, setStatus] = useState("uzaklaştı");
  const [question, setQuestion] = useState("");
  const [recentContext, setRecentContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string>();

  async function generate() {
    setIsGenerating(true);
    setGenerationError(undefined);
    try {
      const result = await generateRelationshipReading({
        nickname,
        status,
        question,
        recent_context: recentContext,
        profile: userProfile.mystic_profile,
        memory: memoryEvents,
        natalChart: userProfile.natal_chart
      });
      addReading(result.reading);
      router.push(`/readings/${result.reading.id}`);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Gemini ilişki yorumu alınamadı.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="İlişki enerjisi"
        title="Dinamiği kesin hüküm kurmadan ayır"
        subtitle="Gemini ilişkiyi profil, hafıza ve doğum haritası bağlamıyla sembolik olarak yorumlar; kesin niyet okuması yapmaz."
      />
      <TextField label="Kişi adı veya takma ad" value={nickname} onChangeText={setNickname} />
      <TextField label="İlişki tipi" value={relationType} onChangeText={setRelationType} />
      <TextField label="Son durum" value={status} onChangeText={setStatus} />
      <TextField
        label="Ana sorun"
        value={question}
        onChangeText={setQuestion}
        placeholder="Bu kişi bana karşı ne hissediyor olabilir?"
        multiline
      />
      <TextField
        label="Son bağlam"
        value={recentContext}
        onChangeText={setRecentContext}
        placeholder="Son mesajıma geç cevap verdi."
        multiline
      />
      {generationError ? <Text style={{ color: colors.danger }}>{generationError}</Text> : null}
      <PrimaryButton disabled={!question || isGenerating} onPress={generate}>
        {isGenerating ? "Gemini yorumluyor" : "Analizi başlat"}
      </PrimaryButton>
    </Screen>
  );
}
