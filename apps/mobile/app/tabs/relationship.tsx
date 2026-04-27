import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { TextField } from "@/components/forms/TextField";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { generateRelationshipReading } from "@/features/relationshipReading/api";
import { useI18n } from "@/i18n";
import { useUserStore } from "@/stores/useUserStore";
import { colors } from "@/theme";

export default function RelationshipScreen() {
  const userProfile = useUserStore((state) => state.profile);
  const memoryEvents = useUserStore((state) => state.memoryEvents);
  const addReading = useUserStore((state) => state.addReading);
  const { locale, t } = useI18n();
  const [nickname, setNickname] = useState("");
  const [relationType, setRelationType] = useState(t("relationship.typeDefault"));
  const [status, setStatus] = useState(t("relationship.statusDefault"));
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
        relation_type: relationType,
        status,
        question,
        recent_context: recentContext,
        profile: userProfile.mystic_profile,
        memory: memoryEvents,
        natalChart: userProfile.natal_chart,
        locale
      });
      addReading(result.reading);
      router.push(`/readings/${result.reading.id}`);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : t("relationship.error"));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Screen>
      <PageHeader
        eyebrow={t("relationship.eyebrow")}
        title={t("relationship.title")}
        subtitle={t("relationship.subtitle")}
      />
      <TextField label={t("relationship.nickname")} value={nickname} onChangeText={setNickname} />
      <TextField label={t("relationship.type")} value={relationType} onChangeText={setRelationType} />
      <TextField label={t("relationship.status")} value={status} onChangeText={setStatus} />
      <TextField
        label={t("relationship.mainQuestion")}
        value={question}
        onChangeText={setQuestion}
        placeholder={t("relationship.questionPlaceholder")}
        multiline
      />
      <TextField
        label={t("relationship.recentContext")}
        value={recentContext}
        onChangeText={setRecentContext}
        placeholder={t("relationship.contextPlaceholder")}
        multiline
      />
      {generationError ? <Text style={{ color: colors.danger }}>{generationError}</Text> : null}
      <PrimaryButton disabled={!question || isGenerating} onPress={generate}>
        {isGenerating ? t("common.loadingGemini") : t("common.startAnalysis")}
      </PrimaryButton>
    </Screen>
  );
}
