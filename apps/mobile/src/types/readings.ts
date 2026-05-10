export type ReadingType =
  | "daily"
  | "coffee"
  | "tarot"
  | "numerology"
  | "relationship"
  | "birth_chart"
  | "weekly_relationship";

export type ReadingTone = "gentle" | "direct" | "reflective" | "warm";

export type ReadingSection = {
  title: string;
  body: string;
  references?: string[];
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
  source_context?: {
    systems: string[];
    references: string[];
    engine?: string;
  };
  safety_note: string;
  deep_report?: RelationshipDeepReport;
  weekly_report?: WeeklyRelationshipReport;
};

// Premium derin sinastri raporu için yapılandırılmış çıktı.
// Edge Function deep_report olarak gönderir, UI bu alanları render eder.
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
    key_aspects: {
      label: string;
      meaning: string;
      sentiment: "supportive" | "tense" | "neutral";
    }[];
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
    trigger_chains: {
      when_user: string;
      partner_reaction: string;
      user_followup: string;
    }[];
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

export type TarotCardDraw = {
  position: string;
  position_label?: string;
  card: string;
  card_name_en?: string;
  card_key?: string;
  orientation: "upright" | "reversed";
  orientation_label?: string;
  upright_meaning?: string;
  reversed_meaning?: string;
  meaning?: string;
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


export type WeeklyRelationshipReport = {
  period: {
    week_start: string;
    week_end: string;
    relationship_nickname: string;
    relation_type: string;
  };
  summary: {
    headline: string;
    body: string;
    mood_arc: "rising" | "falling" | "wavy" | "steady";
    mood_arc_explainer: string;
  };
  recurring_themes: {
    label: string;
    body: string;
    severity: "low" | "moderate" | "high";
    journal_evidence_count: number;
  }[];
  daily_timeline: {
    date: string;
    mood: string;
    headline: string;
    note?: string;
  }[];
  next_week_focus: {
    headline: string;
    body: string;
    timing_anchors: {
      day_label: string;
      reason: string;
    }[];
  };
  action_plan: {
    headline: string;
    items: string[];
  };
  scores: {
    week_intensity: number;
    week_clarity: number;
    week_repair_need: number;
    week_growth: number;
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
