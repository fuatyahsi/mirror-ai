import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const canUseMockFallbacks = __DEV__ || process.env.EXPO_PUBLIC_ALLOW_MOCKS === "true";

export function shouldUseMockFallback(useRemote?: boolean) {
  return (useRemote === false || !isSupabaseConfigured) && canUseMockFallbacks;
}

export function assertRemoteServicesAvailable(useRemote?: boolean) {
  if (useRemote === false && !canUseMockFallbacks) {
    throw new Error("Production build cannot disable remote services.");
  }

  if (!isSupabaseConfigured && !canUseMockFallbacks) {
    throw new Error("Supabase is not configured for this production build.");
  }
}

export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
);
