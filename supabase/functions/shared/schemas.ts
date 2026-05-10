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
  deep_report?: RelationshipDeepReport;
  weekly_report?: WeeklyRelationshipReport;
};

export type ReadingType =
  | "daily"
  | "coffee"
  | "tarot"
  | "numerology"
  | "relationship"
  | "birth_chart"
  | "weekly_relationship";

export type GenerateReadingRequest = {
  readingType: ReadingType;
  topic: string;
  question?: string;
  context?: Record<string, unknown>;
  profile?: Record<string, unknown> | null;
  memory?: Record<string, unknown>[];
  astrology?: Record<string, unknown> | null;
  locale?: "tr" | "en";
  accessMode?: "basic" | "deep";
};

export type RelationshipDeepReport = {
  bond_profile: {
    title: string;
    headline: string;
    body: string;
    pillar_tags: string[];
  };
  synastry_pattern: {
    headline: string;
    body: string;
    strengths: string[];
    risk_areas: string[];
    key_aspects: Array<{
      label: string;
      meaning: string;
      sentiment: "supportive" | "tense" | "neutral";
    }>;
  };
  repeated_loop: {
    headline: string;
    body: string;
    loop_themes: string[];
    journal_evidence: string[];
    user_role: string;
    partner_role: string;
  };
  today_timing: {
    target_date: string;
    headline: string;
    body: string;
    pressure_label: "low" | "moderate" | "high";
    suggested_tone: string;
    do_not_do: string;
  };
  next_action_or_message: {
    headline: string;
    action_kind: "message" | "wait" | "boundary" | "self" | "talk";
    action_body: string;
    sample_message?: string;
    sample_message_tone?: string;
  };
  user_blueprint: {
    headline: string;
    body: string;
    attachment_style: string;
    defense_style: string;
    relationship_needs: string[];
    wound_signature: string;
    chart_anchors: string[];
  };
  partner_blueprint: {
    headline: string;
    body: string;
    apparent_attachment_style: string;
    apparent_defense_style: string;
    likely_triggers: string[];
    soft_spots: string[];
    chart_anchors: string[];
  };
  interaction_choreography: {
    headline: string;
    body: string;
    trigger_chains: Array<{
      when_user: string;
      partner_reaction: string;
      user_followup: string;
    }>;
    repair_window: string;
  };
  history_compare?: {
    has_previous: boolean;
    previous_overall?: number;
    current_overall?: number;
    delta?: number;
    insight: string;
  };
  scores: {
    emotional_pull: number;
    communication_clarity: number;
    uncertainty_level: number;
    user_projection_risk: number;
    synastry_overall: number;
  };
  confidence: {
    score: number;
    label: "low" | "moderate" | "high";
    factors: string[];
  };
  evidence: {
    systems: string[];
    swiss_ephemeris_note: string;
    time_known: boolean;
  };
};

// ----- Weekly relationship report -----
// Sabit yapılı haftalık rapor. Son 7 günün ilişki günlüğü, okumaları ve
// gökyüzünü tek akışta özetleyen premium ekran. Manuel tetik + ileride
// scheduled. Plus → sınırsız, free → 4 kredi.

export type WeeklyRelationshipReport = {
  period: {
    week_start: string;          // YYYY-MM-DD
    week_end: string;            // YYYY-MM-DD
    relationship_nickname: string;
    relation_type: string;
  };
  summary: {
    headline: string;
    body: string;
    mood_arc: "rising" | "falling" | "wavy" | "steady";
    mood_arc_explainer: string;
  };
  recurring_themes: Array<{
    label: string;
    body: string;
    severity: "low" | "moderate" | "high";
    journal_evidence_count: number;
  }>;
  daily_timeline: Array<{
    date: string;                // YYYY-MM-DD
    mood: string;                // tek kelimelik etiket (sevinçli, gergin, mesafeli, vb.)
    headline: string;            // 1 cümle
    note?: string;               // opsiyonel kısa journal alıntısı
  }>;
  next_week_focus: {
    headline: string;
    body: string;
    timing_anchors: Array<{
      day_label: string;         // "Pazartesi", "Çarşamba"
      reason: string;            // 1 cümle açıklama
    }>;
  };
  action_plan: {
    headline: string;
    items: string[];             // 3-5 satır somut adım
  };
  scores: {
    week_intensity: number;      // 0-100 — ilişki ne kadar gündem oldu
    week_clarity: number;        // 0-100 — kullanıcının kafası ne kadar netti
    week_repair_need: number;    // 0-100 — onarım gerekiyor mu
    week_growth: number;         // 0-100 — büyüme sinyalleri
  };
  confidence: {
    score: number;
    label: "low" | "moderate" | "high";
    factors: string[];
  };
  evidence: {
    journal_entries_count: number;
    readings_count: number;
    days_with_data: number;
    swiss_ephemeris_note: string;
  };
};
