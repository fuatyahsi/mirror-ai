import type { GenerateReadingRequest, ReadingOutput } from "./schemas.ts";
import { buildReadingPrompt, systemSafetyPrompt } from "./prompts.ts";

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

const readingOutputSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    tone: { type: "string", enum: ["gentle", "direct", "reflective", "warm"] },
    sections: {
      type: "array",
      minItems: 2,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          body: { type: "string" }
        },
        required: ["title", "body"]
      }
    },
    advice: { type: "string" },
    reflection_question: { type: "string" },
    explanation: {
      type: "object",
      properties: {
        based_on: {
          type: "array",
          minItems: 1,
          maxItems: 6,
          items: { type: "string" }
        },
        confidence: { type: "number", minimum: 0, maximum: 1 },
        limitations: { type: "string" }
      },
      required: ["based_on", "confidence", "limitations"]
    },
    safety_note: { type: "string" }
  },
  required: [
    "title",
    "summary",
    "tone",
    "sections",
    "advice",
    "reflection_question",
    "explanation",
    "safety_note"
  ]
};

function parseGeminiText(data: Record<string, unknown>) {
  const candidates = data.candidates as Array<Record<string, unknown>> | undefined;
  const firstCandidate = candidates?.[0];
  const content = firstCandidate?.content as Record<string, unknown> | undefined;
  const parts = content?.parts as Array<Record<string, unknown>> | undefined;
  const text = parts?.map((part) => part.text).filter(Boolean).join("") ?? "";

  if (!text) {
    const feedback = firstCandidate?.finishReason ? ` Finish reason: ${firstCandidate.finishReason}.` : "";
    throw new Error(`Gemini returned an empty response.${feedback}`);
  }

  return text;
}

function normalizeReadingOutput(output: ReadingOutput): ReadingOutput {
  return {
    title: output.title || "Mirror AI Reading",
    summary: output.summary || "The reading could not produce a summary.",
    tone: output.tone || "reflective",
    sections: Array.isArray(output.sections) && output.sections.length > 0 ? output.sections : [],
    advice: output.advice || "Use this as a reflective prompt, not a certainty claim.",
    reflection_question:
      output.reflection_question || "What feels more grounded when you keep your choice central?",
    explanation: {
      based_on:
        output.explanation?.based_on && output.explanation.based_on.length > 0
          ? output.explanation.based_on
          : ["user input", "selected reading type"],
      confidence:
        typeof output.explanation?.confidence === "number"
          ? Math.max(0, Math.min(1, output.explanation.confidence))
          : 0.68,
      limitations:
        output.explanation?.limitations ||
        "This is a symbolic AI reading for self-reflection and entertainment."
    },
    safety_note: output.safety_note || safetyNote
  };
}

export const geminiAIProvider: AIProvider = {
  async generateReading(request) {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash-lite";
    const prompt = buildReadingPrompt(request);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemSafetyPrompt }]
          },
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.75,
            topP: 0.9,
            responseMimeType: "application/json",
            responseJsonSchema: readingOutputSchema
          }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      const message = data?.error?.message || `Gemini request failed with status ${response.status}.`;
      throw new Error(message);
    }

    const text = parseGeminiText(data);
    return normalizeReadingOutput(JSON.parse(text) as ReadingOutput);
  }
};

export function getAIProvider(): AIProvider {
  const provider = Deno.env.get("AI_PROVIDER") ?? (Deno.env.get("GEMINI_API_KEY") ? "gemini" : "mock");

  if (provider === "gemini") {
    return geminiAIProvider;
  }

  if (provider !== "mock") {
    throw new Error(`AI provider '${provider}' is not implemented yet. Use AI_PROVIDER=mock or gemini.`);
  }

  return mockAIProvider;
}
