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
      };
    };
  };
};

