import { router } from "expo-router";
import { useState } from "react";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { TextField } from "@/components/forms/TextField";
import { generateRelationshipMock } from "@/features/readings/mockReadings";
import { useUserStore } from "@/stores/useUserStore";

export default function RelationshipScreen() {
  const profile = useUserStore((state) => state.profile.mystic_profile);
  const addReading = useUserStore((state) => state.addReading);
  const [nickname, setNickname] = useState("");
  const [relationType, setRelationType] = useState("belirsiz ilişki");
  const [status, setStatus] = useState("uzaklaştı");
  const [question, setQuestion] = useState("");
  const [recentContext, setRecentContext] = useState("");

  function generate() {
    const result = generateRelationshipMock(nickname, status, question, recentContext, profile);
    addReading(result.reading);
    router.push(`/readings/${result.reading.id}`);
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="İlişki enerjisi"
        title="Dinamiği kesin hüküm kurmadan ayır"
        subtitle="Bu ekran niyet okuma yapmaz; çekim, netlik, belirsizlik ve kullanıcının tekrar döngülerini yumuşak dille analiz eder."
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
      <PrimaryButton disabled={!question} onPress={generate}>
        Analizi başlat
      </PrimaryButton>
    </Screen>
  );
}

