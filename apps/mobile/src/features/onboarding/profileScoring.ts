import type { Locale } from "@/i18n";
import type { MysticProfile, PersonalityScores } from "@/types/profile";

export type QuizAnswer = {
  questionId: string;
  optionId: string;
};

const baseScores: PersonalityScores = {
  uncertainty_tolerance: 50,
  intuitive_openness: 50,
  romantic_idealization: 50,
  control_need: 50,
  emotional_intensity: 50,
  rationality_need: 50,
  spiritual_openness: 50,
  attachment_anxiety: 50,
  avoidance_tendency: 50
};

const effects: Record<string, Partial<PersonalityScores>> = {
  wait: { uncertainty_tolerance: -12, attachment_anxiety: 8, avoidance_tendency: 6 },
  clues: { control_need: 10, attachment_anxiety: 10, emotional_intensity: 8 },
  direct: { uncertainty_tolerance: 12, control_need: -6, rationality_need: 8 },
  withdraw: { avoidance_tendency: 14, emotional_intensity: -4 },
  overthink: { attachment_anxiety: 16, romantic_idealization: 10, control_need: 8 },
  unavailable: { romantic_idealization: 14, attachment_anxiety: 8 },
  fast_attach: { emotional_intensity: 14, attachment_anxiety: 14 },
  cool_off: { avoidance_tendency: 12, uncertainty_tolerance: 4 },
  change_them: { control_need: 14, romantic_idealization: 8 },
  limbo: { uncertainty_tolerance: -16, attachment_anxiety: 12 },
  emotion: { intuitive_openness: 12, emotional_intensity: 8 },
  concrete: { rationality_need: 14, intuitive_openness: -4 },
  spiritual: { spiritual_openness: 16, intuitive_openness: 10 },
  logical: { rationality_need: 16, spiritual_openness: -6 },
  surprise: { intuitive_openness: 8, spiritual_openness: 6 }
};

const copy = {
  tr: {
    intuitiveAnxious: "Sezgisel Bağlanan Gözlemci",
    intuitiveCalm: "Sakin Sezgisel Okuyucu",
    analyticalAnxious: "Netlik Arayan Analitik Kalp",
    balanced: "Dengeli Anlam Kurucu",
    summary:
      "Yorumlarda hem duygusal tonu hem de somut bağlamı görmek istiyorsun. Belirsizlik arttığında anlam arama eğilimin güçlenebilir; bu yüzden Mirror AI açıklanabilir, sakin ve karar hakkını sende bırakan yorumlar üretir.",
    anxiousPattern: "Belirsizlik anlarında ipucu arama ve hızlı anlam yükleme",
    balancedPattern: "Mesafe ve yakınlık arasında denge arama",
    intuitiveStyle: "Sembolik ama net açıklamalı",
    analyticalStyle: "Tutarlı, gerekçeli ve sakin"
  },
  en: {
    intuitiveAnxious: "Intuitive Bonding Observer",
    intuitiveCalm: "Calm Intuitive Reader",
    analyticalAnxious: "Analytical Heart Seeking Clarity",
    balanced: "Balanced Meaning Builder",
    summary:
      "You want readings to hold both emotional tone and concrete context. When uncertainty rises, your mind may search harder for meaning; Mirror AI will therefore favor calm, explainable readings that keep your choice in your hands.",
    anxiousPattern: "Searching for clues and attaching meaning quickly when uncertainty rises",
    balancedPattern: "Seeking balance between distance and closeness",
    intuitiveStyle: "Symbolic with clear explanations",
    analyticalStyle: "Consistent, reasoned, and calm"
  }
} as const;

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateMysticProfile(answers: QuizAnswer[], locale: Locale = "tr"): MysticProfile {
  const scores = { ...baseScores };

  for (const answer of answers) {
    const effect = effects[answer.optionId] || {};
    for (const [key, value] of Object.entries(effect)) {
      const scoreKey = key as keyof PersonalityScores;
      scores[scoreKey] = clamp(scores[scoreKey] + Number(value));
    }
  }

  const isIntuitive = scores.intuitive_openness >= scores.rationality_need;
  const isAnxious = scores.attachment_anxiety > 60;
  const text = copy[locale];
  const title = isIntuitive
    ? isAnxious
      ? text.intuitiveAnxious
      : text.intuitiveCalm
    : isAnxious
      ? text.analyticalAnxious
      : text.balanced;

  return {
    ...scores,
    profile_title: title,
    profile_summary: text.summary,
    relationship_pattern: isAnxious ? text.anxiousPattern : text.balancedPattern,
    preferred_reading_style: isIntuitive ? text.intuitiveStyle : text.analyticalStyle
  };
}
