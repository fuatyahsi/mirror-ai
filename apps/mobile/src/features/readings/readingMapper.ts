import { nowIso } from "@/utils/date";
import type { ReadingOutput, ReadingType } from "@/types/readings";

type RemoteReading = Partial<ReadingOutput> & {
  reading_id?: string;
  persisted?: boolean;
};

export function toReadingOutput(
  data: RemoteReading,
  fallback: {
    reading_type: ReadingType;
    topic: string;
    question?: string;
  }
): ReadingOutput {
  return {
    id: data.reading_id || data.id || `${fallback.reading_type}_${Date.now()}`,
    reading_type: fallback.reading_type,
    topic: fallback.topic,
    question: fallback.question,
    created_at: data.created_at || nowIso(),
    title: data.title || "Mirror AI Yorumu",
    summary: data.summary || "Yorum üretildi, ancak özet alanı boş döndü.",
    tone: data.tone || "reflective",
    sections: Array.isArray(data.sections) ? data.sections : [],
    advice: data.advice || "Bu yorumu kesin hüküm değil, farkındalık için bir başlangıç olarak kullan.",
    reflection_question:
      data.reflection_question || "Bu yorum sende hangi duyguyu daha görünür yaptı?",
    explanation: data.explanation || {
      based_on: ["kişisel profil", "doğum haritası", "son hafıza sinyalleri", "Gemini LLM"],
      confidence: 0.68,
      limitations: "Bu yorum sembolik ve kişisel farkındalık amaçlıdır."
    },
    source_context: data.source_context,
    safety_note:
      data.safety_note ||
      "Bu yorum eğlence ve kişisel farkındalık amaçlıdır; kesin gelecek bilgisi veya profesyonel tavsiye değildir."
  };
}
