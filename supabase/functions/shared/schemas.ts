export type ReadingOutput = {
  title: string;
  summary: string;
  tone: "gentle" | "direct" | "reflective" | "warm";
  sections: { title: string; body: string; references?: string[] }[];
  advice: string;
  reflection_question: string;
  explanation: {
    based_on: string[];
    confidence: number;
    limitations: string;
  };
  safety_note: string;
};

export type ReadingType = "daily" | "coffee" | "tarot" | "numerology" | "relationship" | "birth_chart";

export type GenerateReadingRequest = {
  readingType: ReadingType;
  topic: string;
  question?: string;
  context?: Record<string, unknown>;
  profile?: Record<string, unknown> | null;
  memory?: Record<string, unknown>[];
  astrology?: Record<string, unknown> | null;
  locale?: "tr" | "en";
};
