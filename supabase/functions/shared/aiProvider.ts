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
        pillar_tags: { type: "array", items: { type: "string" } }
      },
      required: ["title", "headline", "body", "pillar_tags"]
    },
    synastry_pattern: {
      type: "object",
      properties: {
        headline: { type: "string" },
        body: { type: "string" },
        strengths: { type: "array", items: { type: "string" } },
        risk_areas: { type: "array", items: { type: "string" } },
        key_aspects: {
          type: "array", items: {
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
        loop_themes: { type: "array", items: { type: "string" } },
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
        relationship_needs: { type: "array", items: { type: "string" } },
        wound_signature: { type: "string" },
        chart_anchors: { type: "array", items: { type: "string" } }
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
        likely_triggers: { type: "array", items: { type: "string" } },
        soft_spots: { type: "array", items: { type: "string" } },
        chart_anchors: { type: "array", items: { type: "string" } }
      },
      required: ["headline", "body", "apparent_attachment_style", "apparent_defense_style", "likely_triggers", "soft_spots", "chart_anchors"]
    },
    interaction_choreography: {
      type: "object",
      properties: {
        headline: { type: "string" },
        body: { type: "string" },
        trigger_chains: {
          type: "array", items: {
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
        factors: { type: "array", items: { type: "string" } }
      },
      required: ["score", "label", "factors"]
    },
    evidence: {
      type: "object",
      properties: {
        systems: { type: "array", items: { type: "string" } },
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

type Locale = NonNullable<GenerateReadingRequest["locale"]>;

const deepReportFallbacks: Record<
  Locale,
  {
    pillarTags: string[];
    strengths: string[];
    riskAreas: string[];
    keyAspect: RelationshipDeepReport["synastry_pattern"]["key_aspects"][number];
    loopThemes: string[];
    relationshipNeeds: string[];
    chartAnchors: string[];
    partnerTriggers: string[];
    partnerSoftSpots: string[];
    triggerChains: RelationshipDeepReport["interaction_choreography"]["trigger_chains"];
    confidenceFactors: string[];
    evidenceSystems: string[];
  }
> = {
  tr: {
    pillarTags: ["Sinastri", "İlişki hafızası", "Zamanlama"],
    strengths: ["Bağın güçlü tarafları ilişki sorusu ve harita temaları birlikte okunarak çıkarıldı."],
    riskAreas: ["Hassas alanlar kesin hüküm değil, dikkat isteyen ilişki dinamikleri olarak okunmalıdır."],
    keyAspect: {
      label: "Ana ilişki teması",
      meaning: "Bu tema, doğum haritaları ve ilişki hafızası birlikte okunduğunda öne çıkan genel dinamiği gösterir.",
      sentiment: "neutral"
    },
    loopThemes: ["Belirsizlikte anlam arama", "Netlik ihtiyacı"],
    relationshipNeeds: ["Net iletişim", "Duygusal güven", "Tutarlı temas"],
    chartAnchors: ["Natal harita", "Sinastri", "İlişki hafızası"],
    partnerTriggers: ["Baskı hissi", "Belirsiz beklenti", "Hızlı sonuç ihtiyacı"],
    partnerSoftSpots: ["Sakin ton", "Açık niyet", "Alan tanıyan yaklaşım"],
    triggerChains: [
      {
        when_user: "Belirsizlikte daha fazla işaret aradığında",
        partner_reaction: "karşı taraf baskı hissedip geri çekilebilir",
        user_followup: "sen de bunu daha büyük bir kopuş sinyali gibi okuyabilirsin"
      },
      {
        when_user: "netlik ihtiyacını çok hızlı sonuca bağladığında",
        partner_reaction: "karşı taraf savunmaya geçebilir",
        user_followup: "senin içindeki güven arayışı yeniden yükselir"
      }
    ],
    confidenceFactors: ["doğum haritası", "sinastri verisi", "ilişki hafızası"],
    evidenceSystems: ["Swiss Ephemeris", "ilişki hafızası", "Mirror AI yorum katmanı"]
  },
  en: {
    pillarTags: ["Synastry", "Relationship memory", "Timing"],
    strengths: ["The bond strengths were inferred from the question, chart context, and relationship memory together."],
    riskAreas: ["Sensitive areas are reflective dynamics, not certainty claims."],
    keyAspect: {
      label: "Core relationship theme",
      meaning: "This theme summarizes the main dynamic emerging from the birth charts and relationship memory.",
      sentiment: "neutral"
    },
    loopThemes: ["Meaning-seeking under uncertainty", "Need for clarity"],
    relationshipNeeds: ["Clear communication", "Emotional safety", "Consistent contact"],
    chartAnchors: ["Natal chart", "Synastry", "Relationship memory"],
    partnerTriggers: ["Feeling pressured", "Unclear expectations", "Rush for certainty"],
    partnerSoftSpots: ["Calm tone", "Clear intention", "Space-respecting approach"],
    triggerChains: [
      {
        when_user: "When you search for more signs under uncertainty",
        partner_reaction: "the other person may feel pressured and pull back",
        user_followup: "you may read that distance as a bigger rupture than it is"
      },
      {
        when_user: "When you push the need for clarity toward a fast conclusion",
        partner_reaction: "the other person may become defensive",
        user_followup: "your need for reassurance rises again"
      }
    ],
    confidenceFactors: ["birth chart", "synastry data", "relationship memory"],
    evidenceSystems: ["Swiss Ephemeris", "relationship memory", "Mirror AI interpretation layer"]
  }
};

function normalizeStringList(value: unknown, min: number, max: number, fallback: string[]): string[] {
  const raw = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  const cleaned: string[] = [];

  for (const item of raw) {
    if (typeof item !== "string") continue;
    const text = item.trim();
    if (text && !cleaned.includes(text)) cleaned.push(text);
    if (cleaned.length >= max) break;
  }

  for (const item of fallback) {
    const text = item.trim();
    if (cleaned.length >= min) break;
    if (text && !cleaned.includes(text)) cleaned.push(text);
  }

  return cleaned.slice(0, max);
}

function normalizeNumber(value: unknown, min: number, max: number, fallback: number): number {
  const numberValue = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.max(min, Math.min(max, numberValue));
}

function normalizeEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;
}

function normalizeKeyAspects(
  value: unknown,
  fallback: RelationshipDeepReport["synastry_pattern"]["key_aspects"][number]
): RelationshipDeepReport["synastry_pattern"]["key_aspects"] {
  const raw = Array.isArray(value) ? value : [];
  const normalized = raw
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const aspect = item as Record<string, unknown>;
      const label = typeof aspect.label === "string" ? aspect.label.trim() : "";
      const meaning = typeof aspect.meaning === "string" ? aspect.meaning.trim() : "";
      if (!label && !meaning) return null;
      return {
        label: label || fallback.label,
        meaning: meaning || fallback.meaning,
        sentiment: normalizeEnum(aspect.sentiment, ["supportive", "tense", "neutral"] as const, "neutral")
      };
    })
    .filter((item): item is RelationshipDeepReport["synastry_pattern"]["key_aspects"][number] => Boolean(item))
    .slice(0, 6);

  return normalized.length ? normalized : [fallback];
}

function normalizeTriggerChains(
  value: unknown,
  fallback: RelationshipDeepReport["interaction_choreography"]["trigger_chains"]
): RelationshipDeepReport["interaction_choreography"]["trigger_chains"] {
  const raw = Array.isArray(value) ? value : [];
  const normalized = raw
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const chain = item as Record<string, unknown>;
      const whenUser = typeof chain.when_user === "string" ? chain.when_user.trim() : "";
      const partnerReaction = typeof chain.partner_reaction === "string" ? chain.partner_reaction.trim() : "";
      const userFollowup = typeof chain.user_followup === "string" ? chain.user_followup.trim() : "";
      if (!whenUser && !partnerReaction && !userFollowup) return null;
      return {
        when_user: whenUser || fallback[0].when_user,
        partner_reaction: partnerReaction || fallback[0].partner_reaction,
        user_followup: userFollowup || fallback[0].user_followup
      };
    })
    .filter((item): item is RelationshipDeepReport["interaction_choreography"]["trigger_chains"][number] =>
      Boolean(item)
    )
    .slice(0, 4);

  for (const chain of fallback) {
    if (normalized.length >= 2) break;
    normalized.push(chain);
  }

  return normalized.slice(0, 4);
}

function normalizeRelationshipDeepReport(
  report: RelationshipDeepReport | undefined,
  locale: Locale
): RelationshipDeepReport | undefined {
  if (!report) return undefined;

  const fallback = deepReportFallbacks[locale];
  const bondProfile = (report.bond_profile ?? {}) as RelationshipDeepReport["bond_profile"];
  const synastryPattern = (report.synastry_pattern ?? {}) as RelationshipDeepReport["synastry_pattern"];
  const repeatedLoop = (report.repeated_loop ?? {}) as RelationshipDeepReport["repeated_loop"];
  const userBlueprint = (report.user_blueprint ?? {}) as RelationshipDeepReport["user_blueprint"];
  const partnerBlueprint = (report.partner_blueprint ?? {}) as RelationshipDeepReport["partner_blueprint"];
  const choreography = (report.interaction_choreography ?? {}) as RelationshipDeepReport["interaction_choreography"];
  const confidence = (report.confidence ?? {}) as RelationshipDeepReport["confidence"];
  const evidence = (report.evidence ?? {}) as RelationshipDeepReport["evidence"];

  return {
    ...report,
    bond_profile: {
      ...bondProfile,
      pillar_tags: normalizeStringList(bondProfile.pillar_tags, 2, 5, fallback.pillarTags)
    },
    synastry_pattern: {
      ...synastryPattern,
      strengths: normalizeStringList(synastryPattern.strengths, 1, 3, fallback.strengths),
      risk_areas: normalizeStringList(synastryPattern.risk_areas, 1, 3, fallback.riskAreas),
      key_aspects: normalizeKeyAspects(synastryPattern.key_aspects, fallback.keyAspect)
    },
    repeated_loop: {
      ...repeatedLoop,
      loop_themes: normalizeStringList(repeatedLoop.loop_themes, 1, 4, fallback.loopThemes),
      journal_evidence: normalizeStringList(repeatedLoop.journal_evidence, 0, 4, [])
    },
    user_blueprint: {
      ...userBlueprint,
      relationship_needs: normalizeStringList(
        userBlueprint.relationship_needs,
        3,
        5,
        fallback.relationshipNeeds
      ),
      chart_anchors: normalizeStringList(userBlueprint.chart_anchors, 3, 5, fallback.chartAnchors)
    },
    partner_blueprint: {
      ...partnerBlueprint,
      likely_triggers: normalizeStringList(partnerBlueprint.likely_triggers, 3, 5, fallback.partnerTriggers),
      soft_spots: normalizeStringList(partnerBlueprint.soft_spots, 3, 5, fallback.partnerSoftSpots),
      chart_anchors: normalizeStringList(partnerBlueprint.chart_anchors, 3, 5, fallback.chartAnchors)
    },
    interaction_choreography: {
      ...choreography,
      trigger_chains: normalizeTriggerChains(choreography.trigger_chains, fallback.triggerChains)
    },
    scores: {
      emotional_pull: normalizeNumber(report.scores?.emotional_pull, 0, 100, 60),
      communication_clarity: normalizeNumber(report.scores?.communication_clarity, 0, 100, 55),
      uncertainty_level: normalizeNumber(report.scores?.uncertainty_level, 0, 100, 50),
      user_projection_risk: normalizeNumber(report.scores?.user_projection_risk, 0, 100, 45),
      synastry_overall: normalizeNumber(report.scores?.synastry_overall, 0, 100, 60)
    },
    confidence: {
      ...confidence,
      score: normalizeNumber(confidence.score, 0, 1, 0.68),
      label: normalizeEnum(confidence.label, ["low", "moderate", "high"] as const, "moderate"),
      factors: normalizeStringList(confidence.factors, 1, 4, fallback.confidenceFactors)
    },
    evidence: {
      ...evidence,
      systems: normalizeStringList(evidence.systems, 1, 6, fallback.evidenceSystems)
    }
  };
}

function normalizeReadingOutput(output: ReadingOutput, locale: Locale): ReadingOutput {
  const fallbackSection =
    locale === "tr"
      ? {
          title: "Kişisel yorum",
          body: "Mirror AI bu okumayı sembolik içgörü ve kişisel farkındalık amacıyla yorumladı.",
          references: ["kullanıcı sorusu"]
        }
      : {
          title: "Personal reading",
          body: "Mirror AI interpreted this as symbolic insight for self-reflection.",
          references: ["user question"]
        };

  const sections = (Array.isArray(output.sections) ? output.sections : [])
    .map((section) => ({
      title: section.title || fallbackSection.title,
      body: section.body || fallbackSection.body,
      references: normalizeStringList(section.references, 1, 7, fallbackSection.references)
    }))
    .slice(0, 5);

  while (sections.length < 2) {
    sections.push(fallbackSection);
  }

  return {
    title: output.title || "Mirror AI Reading",
    summary: output.summary || "The reading could not produce a summary.",
    tone: output.tone || "reflective",
    sections,
    advice: output.advice || "Use this as a reflective prompt, not a certainty claim.",
    reflection_question:
      output.reflection_question || "What feels more grounded when you keep your choice central?",
    explanation: {
      based_on:
        normalizeStringList(output.explanation?.based_on, 1, 6, ["user input", "selected reading type"]),
      confidence:
        typeof output.explanation?.confidence === "number"
          ? Math.max(0, Math.min(1, output.explanation.confidence))
          : 0.68,
      limitations:
        output.explanation?.limitations ||
        "This is a symbolic AI reading for self-reflection and entertainment."
    },
    safety_note: output.safety_note || safetyNote,
    deep_report: normalizeRelationshipDeepReport(output.deep_report, locale),
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
    return normalizeReadingOutput(JSON.parse(text) as ReadingOutput, request.locale ?? "tr");
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
