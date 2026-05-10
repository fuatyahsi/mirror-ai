import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { NatalChart } from "@/types/astrology";
import type { Json } from "@/types/database";
import type { BirthInfo, MysticProfile, UserProfile } from "@/types/profile";

type SyncResult = {
  synced: boolean;
  reason?: string;
};

async function getCurrentUserId() {
  if (!isSupabaseConfigured) return undefined;
  const { data, error } = await supabase.auth.getUser();
  if (error) return undefined;
  return data.user?.id;
}

export async function syncBirthProfile(birth: BirthInfo, chart?: NatalChart): Promise<SyncResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { synced: false, reason: "no_authenticated_user" };

  const { error: profileError } = await supabase.from("users_profile").upsert(
    {
      user_id: userId,
      birth_date: birth.birth_date ?? null,
      birth_time: birth.birth_time ?? null,
      birth_city: birth.birth_city ?? null,
      birth_country: birth.birth_country ?? null,
      latitude: birth.latitude ?? null,
      longitude: birth.longitude ?? null,
      timezone: birth.timezone ?? null
    },
    { onConflict: "user_id" }
  );

  if (profileError) throw profileError;

  if (chart) {
    const { error: chartError } = await supabase.from("birth_charts").insert({
      user_id: userId,
      input_json: chart.input as unknown as Json,
      chart_json: chart as unknown as Json,
      engine: chart.engine?.name ?? "swiss_ephemeris"
    });

    if (chartError) throw chartError;
  }

  return { synced: true };
}

export async function syncMysticProfile(profile: MysticProfile): Promise<SyncResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { synced: false, reason: "no_authenticated_user" };

  const { error: personalityError } = await supabase.from("user_personality_profile").upsert(
    {
      user_id: userId,
      uncertainty_tolerance: profile.uncertainty_tolerance,
      intuitive_openness: profile.intuitive_openness,
      romantic_idealization: profile.romantic_idealization,
      control_need: profile.control_need,
      emotional_intensity: profile.emotional_intensity,
      rationality_need: profile.rationality_need,
      spiritual_openness: profile.spiritual_openness,
      attachment_anxiety: profile.attachment_anxiety,
      avoidance_tendency: profile.avoidance_tendency,
      profile_title: profile.profile_title,
      profile_summary: profile.profile_summary,
      relationship_pattern: profile.relationship_pattern,
      preferred_reading_style: profile.preferred_reading_style
    },
    { onConflict: "user_id" }
  );

  if (personalityError) throw personalityError;

  const { error: profileError } = await supabase
    .from("users_profile")
    .upsert({ user_id: userId, onboarding_completed: true }, { onConflict: "user_id" });

  if (profileError) throw profileError;

  return { synced: true };
}

export async function loadRemoteUserProfile(): Promise<Partial<UserProfile> | undefined> {
  const userId = await getCurrentUserId();
  if (!userId) return undefined;

  const [profileResponse, personalityResponse, chartResponse, creditsResponse] = await Promise.all([
    supabase.from("users_profile").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("user_personality_profile").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("birth_charts")
      .select("chart_json")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("user_credits").select("balance").eq("user_id", userId).maybeSingle()
  ]);

  if (profileResponse.error) throw profileResponse.error;
  if (personalityResponse.error) throw personalityResponse.error;
  if (chartResponse.error) throw chartResponse.error;
  if (creditsResponse.error) throw creditsResponse.error;

  const profile = profileResponse.data;
  const personality = personalityResponse.data;
  const remoteProfile: Partial<UserProfile> = {};

  if (profile) {
    remoteProfile.display_name = profile.display_name ?? undefined;
    remoteProfile.birth = {
      birth_date: profile.birth_date ?? undefined,
      birth_time: profile.birth_time ? profile.birth_time.slice(0, 5) : undefined,
      birth_city: profile.birth_city ?? undefined,
      birth_country: profile.birth_country ?? undefined,
      latitude: profile.latitude == null ? undefined : Number(profile.latitude),
      longitude: profile.longitude == null ? undefined : Number(profile.longitude),
      timezone: profile.timezone ?? undefined
    };
    remoteProfile.onboarding_completed = profile.onboarding_completed;
  }

  if (personality) {
    remoteProfile.mystic_profile = {
      uncertainty_tolerance: personality.uncertainty_tolerance,
      intuitive_openness: personality.intuitive_openness,
      romantic_idealization: personality.romantic_idealization,
      control_need: personality.control_need,
      emotional_intensity: personality.emotional_intensity,
      rationality_need: personality.rationality_need,
      spiritual_openness: personality.spiritual_openness,
      attachment_anxiety: personality.attachment_anxiety,
      avoidance_tendency: personality.avoidance_tendency,
      profile_title: personality.profile_title ?? "Mirror AI Profili",
      profile_summary: personality.profile_summary ?? "",
      relationship_pattern: personality.relationship_pattern ?? "Henüz kalibre edilmedi",
      preferred_reading_style: personality.preferred_reading_style ?? "Sakin, açıklanabilir ve kişisel"
    };
  }

  if (chartResponse.data?.chart_json) {
    remoteProfile.natal_chart = chartResponse.data.chart_json as unknown as NatalChart;
  }

  if (creditsResponse.data) {
    remoteProfile.credits = creditsResponse.data.balance;
  }

  return remoteProfile;
}

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
