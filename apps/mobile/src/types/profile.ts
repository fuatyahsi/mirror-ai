export type BirthInfo = {
  birth_date?: string;
  birth_time?: string;
  birth_city?: string;
  birth_country?: string;
};

export type PersonalityScores = {
  uncertainty_tolerance: number;
  intuitive_openness: number;
  romantic_idealization: number;
  control_need: number;
  emotional_intensity: number;
  rationality_need: number;
  spiritual_openness: number;
  attachment_anxiety: number;
  avoidance_tendency: number;
};

export type MysticProfile = PersonalityScores & {
  profile_title: string;
  profile_summary: string;
  relationship_pattern: string;
  preferred_reading_style: string;
};

export type UserProfile = {
  display_name?: string;
  birth: BirthInfo;
  onboarding_completed: boolean;
  mystic_profile?: MysticProfile;
  credits: number;
};

