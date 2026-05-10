export type ZodiacPoint = {
  key: string;
  label: string;
  absolute_degree: number;
  sign_key: string;
  sign_label: string;
  degree: number;
  speed?: number;
  retrograde?: boolean;
};

export type HousePoint = {
  house: number;
  absolute_degree: number;
  sign_key: string;
  sign_label: string;
  degree: number;
};

export type NatalAspect = {
  type: string;
  label: string;
  between: string[];
  orb: number;
};

export type NatalChartInput = {
  birth_date: string;
  birth_time?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  house_system?: string;
};

export type NatalChart = {
  input: NatalChartInput;
  time: {
    local: string;
    utc: string;
    julian_day_ut: number;
  };
  engine: {
    name: string;
    python_package?: string;
    version?: string;
    ephemeris_path?: string;
  };
  sun: ZodiacPoint;
  moon: ZodiacPoint;
  ascendant: ZodiacPoint;
  midheaven?: ZodiacPoint;
  planets: ZodiacPoint[];
  houses: HousePoint[];
  aspects: NatalAspect[];
  warnings: string[];
};

export type SynastryAspect = {
  type: string;
  label: string;
  between: [string, string];
  orb: number;
  category: "emotional" | "mental" | "romantic" | "long_term" | "crisis" | "attachment" | "karmic";
  weight: number;
  reference: string;
};

export type SynastryReport = {
  overall_score: number;
  confidence: number;
  time_accuracy_note?: string;
  strengths: string[];
  risk_areas: string[];
  scores: {
    emotional_harmony: number;
    mental_flow: number;
    romantic_pull: number;
    long_term_potential: number;
    crisis_intensity: number;
    attachment_dynamic: number;
    repeating_theme: number;
  };
  key_aspects: SynastryAspect[];
};
