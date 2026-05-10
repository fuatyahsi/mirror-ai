export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users_profile: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          gender: string | null;
          birth_date: string | null;
          birth_time: string | null;
          birth_city: string | null;
          birth_country: string | null;
          latitude: number | null;
          longitude: number | null;
          timezone: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string | null;
          gender?: string | null;
          birth_date?: string | null;
          birth_time?: string | null;
          birth_city?: string | null;
          birth_country?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          timezone?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users_profile"]["Insert"]>;
        Relationships: [];
      };
      user_personality_profile: {
        Row: {
          id: string;
          user_id: string;
          uncertainty_tolerance: number;
          intuitive_openness: number;
          romantic_idealization: number;
          control_need: number;
          emotional_intensity: number;
          rationality_need: number;
          spiritual_openness: number;
          attachment_anxiety: number;
          avoidance_tendency: number;
          profile_title: string | null;
          profile_summary: string | null;
          relationship_pattern: string | null;
          preferred_reading_style: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          uncertainty_tolerance?: number;
          intuitive_openness?: number;
          romantic_idealization?: number;
          control_need?: number;
          emotional_intensity?: number;
          rationality_need?: number;
          spiritual_openness?: number;
          attachment_anxiety?: number;
          avoidance_tendency?: number;
          profile_title?: string | null;
          profile_summary?: string | null;
          relationship_pattern?: string | null;
          preferred_reading_style?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_personality_profile"]["Insert"]>;
        Relationships: [];
      };
      readings: {
        Row: {
          id: string;
          user_id: string;
          reading_type: string;
          topic: string;
          question: string | null;
          result_json: Json;
          explanation_json: Json;
          confidence: number | null;
          premium_used: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          reading_type: string;
          topic: string;
          question?: string | null;
          result_json: Json;
          explanation_json?: Json;
          confidence?: number | null;
          premium_used?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["readings"]["Insert"]>;
        Relationships: [];
      };
      birth_charts: {
        Row: {
          id: string;
          user_id: string;
          input_json: Json;
          chart_json: Json;
          engine: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          input_json?: Json;
          chart_json?: Json;
          engine?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["birth_charts"]["Insert"]>;
        Relationships: [];
      };
      user_credits: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_credits"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
