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

