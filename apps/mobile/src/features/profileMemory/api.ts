import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function updateMemoryProfile() {
  if (!isSupabaseConfigured) {
    return { updated: true, memory_event_count: 0 };
  }

  const { data, error } = await supabase.functions.invoke("update-memory-profile", {
    body: {}
  });

  if (error) throw error;
  return data;
}

