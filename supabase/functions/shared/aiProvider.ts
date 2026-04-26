import type { GenerateReadingRequest, ReadingOutput } from "./schemas.ts";

export type AIProvider = {
  generateReading: (request: GenerateReadingRequest) => Promise<ReadingOutput>;
};

const safetyNote =
  "This reading is for entertainment and self-reflection only. It is not a certainty claim or professional advice.";

export const mockAIProvider: AIProvider = {
  async generateReading(request) {
    const isRelationship = request.readingType === "relationship";
    const isCoffee = request.readingType === "coffee";
    const isTarot = request.readingType === "tarot";

    return {
      title: isCoffee
        ? "Coffee Symbol Reading"
        : isTarot
          ? "Tarot Mirror"
          : isRelationship
            ? "Relationship Energy Reflection"
            : "Daily Inner Mirror",
      summary:
        "The current pattern points to a need for calmer interpretation, clearer boundaries, and less pressure to force one fixed meaning.",
      tone: "reflective",
      sections: [
        {
          title: "Main Theme",
          body:
            "The symbolic reading highlights uncertainty as a place to observe, not a place to rush into certainty."
        },
        {
          title: "Personal Context",
          body:
            "The profile and recent context suggest that explainable, grounded language will be more useful than dramatic predictions."
        },
        {
          title: "Gentle Direction",
          body:
            "A small, honest action may give better information than repeated checking or trying to decode every signal."
        }
      ],
      advice:
        "Treat this as a reflective prompt. Notice what feels true, what feels exaggerated, and what decision remains yours.",
      reflection_question: "What would feel calmer if you stopped trying to make it certain today?",
      explanation: {
        based_on: ["user profile", "selected topic", "provided question", "mock provider"],
        confidence: 0.72,
        limitations: "This is a mock response until a real AI provider is configured."
      },
      safety_note: safetyNote
    };
  }
};

export function getAIProvider(): AIProvider {
  const provider = Deno.env.get("AI_PROVIDER") ?? "mock";

  if (provider !== "mock") {
    throw new Error(`AI provider '${provider}' is not implemented yet. Use AI_PROVIDER=mock.`);
  }

  return mockAIProvider;
}

