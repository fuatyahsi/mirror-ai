import type {
  GenerateReadingRequest,
  ReadingOutput,
  RelationshipDeepReport,
  WeeklyRelationshipReport
} from "./schemas.ts";
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
            "The symbolic reading highlights uncertainty as a place to observe, not a place to rush into certainty.",
          references: ["selected reading type", "provided question"]
        },
        {
          title: "Personal Context",
          body:
            "The profile and recent context suggest that explainable, grounded language will be more useful than dramatic predictions.",
          references: ["user profile", "recent context"]
        },
        {
          title: "Gentle Direction",
          body:
            "A small, honest action may give better information than repeated checking or trying to decode every signal.",
          references: ["safety rules", "autonomy-centered guidance"]
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

const readingOutputSchemaBase = {
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
          body: { type: "string" },
          references: {
            type: "array",
            minItems: 1,
            maxItems: 7,
            items: { type: "string" }
          }
        },
        required: ["title", "body", "references"]
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

const weeklyRelationshipReportSchema = {
  type: "object",
  properties: {
    period: {
      type: "object",
      properties: {
        week_start: { type: "string" },
        week_end: { type: "string" },
        relationship_nickname: { type: "string" },
        relation_type: { type: "string" }
      },
      required: ["week_start", "week_end", "relationship_nickname", "relation_type"]
    },
    summary: {
      type: "object",
      properties: {
        headline: { type: "string" },
        body: { type: "string" },
        mood_arc: { type: "string", enum: ["rising", "falling", "wavy", "steady"] },
        mood_arc_explainer: { type: "string" }
      },
      required: ["headline", "body", "mood_arc", "mood_arc_explainer"]
    },
    recurring_themes: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          body: { type: "string" },
          severity: { type: "string", enum: ["low", "moderate", "high"] },
          journal_evidence_count: { type: "number" }
        },
        required: ["label", "body", "severity", "journal_evidence_count"]
      }
    },
    daily_timeline: {
      type: "array",
      minItems: 1,
      maxItems: 7,
      items: {
        type: "object",
        properties: {
          date: { type: "string" },
          mood: { type: "string" },
          headline: { type: "string" },
          note: { type: "string" }
        },
        required: ["date", "mood", "headline"]
      }
    },
    next_week_focus: {
      type: "object",
      properties: {
        headline: { type: "string" },
        body: { type: "string" },
        timing_anchors: {
          type: "array",
          minItems: 1,
          maxItems: 3,
          items: {
            type: "object",
            properties: {
              day_label: { type: "string" },
              reason: { type: "string" }
            },
            required: ["day_label", "reason"]
          }
        }
      },
      required: ["headline", "body", "timing_anchors"]
    },
    action_plan: {
      type: "object",
      properties: {
        headline: { type: "string" },
        items: { type: "array", minItems: 3, maxItems: 5, items: { type: "string" } }
      },
      required: ["headline", "items"]
    },
    scores: {
      type: "object",
      properties: {
        week_intensity: { type: "number" },
        week_clarity: { type: "number" },
        week_repair_need: { type: "number" },
        week_growth: { type: "number" }
      },
      required: ["week_intensity", "week_clarity", "week_repair_need", "week_growth"]
    },
    confidence: {
      type: "object",
      properties: {
        score: { type: "number" },
        label: { type: "string", enum: ["low", "moderate", "high"] },
        factors: { type: "array", minItems: 1, maxItems: 4, items: { type: "string" } }
      },
      required: ["score", "label", "factors"]
    },
    evidence: {
      type: "object",
      properties: {
        journal_entries_count: { type: "number" },
        readings_count: { type: "number" },
        days_with_data: { type: "number" },
        swiss_ephemeris_note: { type: "string" }
      },
      required: ["journal_entries_count", "readings_count", "days_with_data", "swiss_ephemeris_note"]
    }
  },
  required: [
    "period",
    "summary",
    "recurring_themes",
    "daily_timeline",
    "next_week_focus",
    "action_plan",
    "scores",
    "confidence",
    "evidence"
  ]
};

const relationshipDeepReportSchema = {
  type: "object",
  properties: {
    bond_profile: {
      type: "object",
      properties: {
        title: { type: "string" },
        headline: { type: "string" },
        body: { type: "string" },
        pillar_tags: { type: "array", minItems: 2, maxItems: 5, items: { type: "string" } }
      },
      required: ["title", "headline", "body", "pillar_tags"]
    },
    synastry_pattern: {
      type: "object",
      properties: {
        headline: { type: "string" },
        body: { type: "string" },
        strengths: { type: "array", minItems: 1, maxItems: 3, items: { type: "string" } },
        risk_areas: { type: "array", minItems: 1, maxItems: 3, items: { type: "string" } },
        key_aspects: {
          type: "array",
          minItems: 1,
          maxItems: 6,
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              meaning: { type: "string" },
              sentiment: { type: "string", enum: ["supportive", "tense", "neutral"] }
            },
            required: ["label", "meaning", "sentiment"]
          }
        }
      },
      required: ["headline", "body", "strengths", "risk_areas", "key_aspects"]
    },
    repeated_loop: {
      type: "object",
      properties: {
        headline: { type: "string" },
        body: { type: "string" },
        loop_themes: { type: "array", minItems: 1, maxItems: 4, items: { type: "string" } },
        journal_evidence: { type: "array", maxItems: 4, items: { type: "string" } },
        user_role: { type: "string" },
        partner_role: { type: "string" }
      },
      required: ["headline", "body", "loop_themes", "journal_evidence", "user_role", "partner_role"]
    },
    today_timing: {
      type: "object",
      properties: {
        target_date: { type: "string" },
        headline: { type: "string" },
        body: { type: "string" },
        pressure_label: { type: "string", enum: ["low", "moderate", "high"] },
        suggested_tone: { type: "string" },
        do_not_do: { type: "string" }
      },
      required: ["target_date", "headline", "body", "pressure_label", "suggested_tone", "do_not_do"]
    },
    next_action_or_message: {
      type: "object",
      properties: {
        headline: { type: "string" },
        action_kind: { type: "string", enum: ["message", "wait", "boundary", "self", "talk"] },
        action_body: { type: "string" },
        sample_message: { type: "string" },
        sample_message_tone: { type: "string" }
      },
      required: ["headline", "action_kind", "action_body"]
    },
    user_blueprint: {
      type: "object",
      properties: {
        headline: { type: "string" },
        body: { type: "string" },
        attachment_style: { type: "string" },
        defense_style: { type: "string" },
        relationship_needs: { type: "array", minItems: 3, maxItems: 5, items: { type: "string" } },
        wound_signature: { type: "string" },
        chart_anchors: { type: "array", minItems: 3, maxItems: 5, items: { type: "string" } }
      },
      required: ["headline", "body", "attachment_style", "defense_style", "relationship_needs", "wound_signature", "chart_anchors"]
    },
    partner_blueprint: {
      type: "object",
      properties: {
        headline: { type: "string" },
        body: { type: "string" },
        apparent_attachment_style: { type: "string" },
        apparent_defense_style: { type: "string" },
        likely_triggers: { type: "array", minItems: 3, maxItems: 5, items: { type: "string" } },
        soft_spots: { type: "array", minItems: 3, maxItems: 5, items: { type: "string" } },
        chart_anchors: { type: "array", minItems: 3, maxItems: 5, items: { type: "string" } }
      },
      required: ["headline", "body", "apparent_attachment_style", "apparent_defense_style", "likely_triggers", "soft_spots", "chart_anchors"]
    },
    interaction_choreography: {
      type: "object",
      properties: {
        headline: { type: "string" },
        body: { type: "string" },
        trigger_chains: {
          type: "array",
          minItems: 2,
          maxItems: 4,
          items: {
            type: "object",
            properties: {
              when_user: { type: "string" },
              partner_reaction: { type: "string" },
              user_followup: { type: "string" }
            },
            required: ["when_user", "partner_reaction", "user_followup"]
          }
        },
        repair_window: { type: "string" }
      },
      required: ["headline", "body", "trigger_chains", "repair_window"]
    },
    history_compare: {
      type: "object",
      properties: {
        has_previous: { type: "boolean" },
        previous_overall: { type: "number" },
        current_overall: { type: "number" },
        delta: { type: "number" },
        insight: { type: "string" }
      },
      required: ["has_previous", "insight"]
    },
    scores: {
      type: "object",
      properties: {
        emotional_pull: { type: "number" },
        communication_clarity: { type: "number" },
        uncertainty_level: { type: "number" },
        user_projection_risk: { type: "number" },
        synastry_overall: { type: "number" }
      },
      required: [
        "emotional_pull",
        "communication_clarity",
        "uncertainty_level",
        "user_projection_risk",
        "synastry_overall"
      ]
    },
    confidence: {
      type: "object",
      properties: {
        score: { type: "number", minimum: 0, maximum: 1 },
        label: { type: "string", enum: ["low", "moderate", "high"] },
        factors: { type: "array", minItems: 1, maxItems: 4, items: { type: "string" } }
      },
      required: ["score", "label", "factors"]
    },
    evidence: {
      type: "object",
      properties: {
        systems: { type: "array", minItems: 1, maxItems: 6, items: { type: "string" } },
        swiss_ephemeris_note: { type: "string" },
        time_known: { type: "boolean" }
      },
      required: ["systems", "swiss_ephemeris_note", "time_known"]
    }
  },
  required: [
    "bond_profile",
    "synastry_pattern",
    "repeated_loop",
    "today_timing",
    "next_action_or_message",
    "user_blueprint",
    "partner_blueprint",
    "interaction_choreography",
    "history_compare",
    "scores",
    "confidence",
    "evidence"
  ]
};

function buildReadingResponseSchema(request: GenerateReadingRequest) {
  if (request.readingType === "relationship" && request.accessMode === "deep") {
    return {
      ...readingOutputSchemaBase,
      properties: {
        ...readingOutputSchemaBase.properties,
        deep_report: relationshipDeepReportSchema
      },
      required: [...readingOutputSchemaBase.required, "deep_report"]
    };
  }
  if (request.readingType === "weekly_relationship") {
    return {
      ...readingOutputSchemaBase,
      properties: {
        ...readingOutputSchemaBase.properties,
        weekly_report: weeklyRelationshipReportSchema
      },
      required: [...readingOutputSchemaBase.required, "weekly_report"]
    };
  }
  return readingOutputSchemaBase;
}

const readingOutputSchema = readingOutputSchemaBase;

function parseGeminiText(data: Record<string, unknown>) {
  const candidates = data.candidates as Array<Record<string, unknown>> | undefined;
  const firstCandidate = candidates?.[0];
  const content = firstCandidate?.content as Record<string, unknown> | undefined;
  const parts = content?.parts as Array<Record<string, unknown>> | undefined;
  const text = parts?.map((part) => part.text).filter(Boolean).join("") ?? "";

  if (!text) {
    const feedback = firstCandidate?.finishReason ? ` Finish reason: ${firstCandidate.finishReason}.` : "";
    throw new Error(`Mirror AI provider returned an empty response.${feedback}`);
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
    safety_note: output.safety_note || safetyNote,
    deep_report: output.deep_report,
    weekly_report: output.weekly_report
  };
}

// Premium reading types/contexts that justify the slower/pricier Pro model.
// These are credit-locked or Plus-locked surfaces where users explicitly paid
// for a higher-quality output. Free / daily / basic readings stay on Lite.
function isPremiumReading(request: GenerateReadingRequest): boolean {
  if (request.readingType === "relationship" && request.accessMode === "deep") return true;
  if (request.readingType === "weekly_relationship") return true;
  if (request.readingType === "coffee") return true;
  if (request.readingType === "tarot") {
    // Clarifier tarot is the paid tier; check question/topic for clarifier signal.
    const ctx = (request.context ?? {}) as Record<string, unknown>;
    if (ctx.is_clarifier || ctx.clarifier_question || ctx.clarifier_card) return true;
  }
  if (request.readingType === "numerology" && request.accessMode === "deep") return true;
  if (request.readingType === "birth_chart" && request.accessMode === "deep") return true;
  return false;
}

function pickGeminiModel(request: GenerateReadingRequest): string {
  // Env override for ops emergencies (force everything to Lite if Pro misbehaves).
  const force = Deno.env.get("GEMINI_FORCE_MODEL");
  if (force) return force;
  if (isPremiumReading(request)) {
    return Deno.env.get("GEMINI_MODEL_PREMIUM") ?? "gemini-2.5-pro";
  }
  return Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash-lite";
}

async function callGemini(
  apiKey: string,
  model: string,
  request: GenerateReadingRequest,
  prompt: string
): Promise<Response> {
  return fetch(
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
          temperature:
            (request.readingType === "relationship" && request.accessMode === "deep") ||
            request.readingType === "weekly_relationship"
              ? 0.55
              : 0.75,
          topP: 0.9,
          responseMimeType: "application/json",
          responseJsonSchema: buildReadingResponseSchema(request)
        }
      })
    }
  );
}

export const geminiAIProvider: AIProvider = {
  async generateReading(request) {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const prompt = buildReadingPrompt(request);
    const primaryModel = pickGeminiModel(request);

    let response = await callGemini(apiKey, primaryModel, request, prompt);

    // Defensive fallback: if Pro errors out (rate limit, transient 5xx), retry
    // with Lite so the user still gets a reading. Premium quality directives
    // already make Lite output passable; failing entirely is worse than that.
    if (!response.ok && primaryModel.includes("pro")) {
      const fallback = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash-lite";
      console.warn(`[aiProvider] Pro call failed (${response.status}), falling back to ${fallback}`);
      response = await callGemini(apiKey, fallback, request, prompt);
    }

    const data = await response.json();
    if (!response.ok) {
      const message = data?.error?.message || `Mirror AI provider request failed with status ${response.status}.`;
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
