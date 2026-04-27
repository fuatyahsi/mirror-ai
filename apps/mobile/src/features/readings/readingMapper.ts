import { translate, type Locale } from "@/i18n";
import type { ReadingOutput, ReadingType } from "@/types/readings";
import { nowIso } from "@/utils/date";

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
  },
  locale: Locale = "tr"
): ReadingOutput {
  return {
    id: data.reading_id || data.id || `${fallback.reading_type}_${Date.now()}`,
    reading_type: fallback.reading_type,
    topic: fallback.topic,
    question: fallback.question,
    created_at: data.created_at || nowIso(),
    title: data.title || translate(locale, "mapper.titleFallback"),
    summary: data.summary || translate(locale, "mapper.summaryFallback"),
    tone: data.tone || "reflective",
    sections: Array.isArray(data.sections) ? data.sections : [],
    advice: data.advice || translate(locale, "mapper.adviceFallback"),
    reflection_question: data.reflection_question || translate(locale, "mapper.reflectionFallback"),
    explanation: data.explanation || {
      based_on: [
        translate(locale, "mapper.basedProfile"),
        translate(locale, "mapper.basedChart"),
        translate(locale, "mapper.basedMemory"),
        "Gemini LLM"
      ],
      confidence: 0.68,
      limitations: translate(locale, "mapper.limitationsFallback")
    },
    source_context: data.source_context,
    safety_note: data.safety_note || translate(locale, "mapper.safetyFallback")
  };
}
