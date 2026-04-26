export type ReadingType =
  | "daily"
  | "coffee"
  | "tarot"
  | "numerology"
  | "relationship"
  | "birth_chart";

export type ReadingTone = "gentle" | "direct" | "reflective" | "warm";

export type ReadingSection = {
  title: string;
  body: string;
};

export type ReadingExplanation = {
  based_on: string[];
  confidence: number;
  limitations: string;
};

export type ReadingOutput = {
  id: string;
  reading_type: ReadingType;
  topic: string;
  question?: string;
  created_at: string;
  title: string;
  summary: string;
  tone: ReadingTone;
  sections: ReadingSection[];
  advice: string;
  reflection_question: string;
  explanation: ReadingExplanation;
  safety_note: string;
};

export type TarotCardDraw = {
  position: string;
  card: string;
  orientation: "upright" | "reversed";
};

export type FeedbackScore = "accurate" | "partial" | "inaccurate";

export type ReadingFeedback = {
  id: string;
  reading_id: string;
  score: FeedbackScore;
  accuracy_rating: number;
  emotional_resonance: number;
  comment?: string;
  created_at: string;
};

