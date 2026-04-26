import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { requireUser } from "../shared/auth.ts";

type NatalChartInput = {
  birth_date?: string;
  birth_time?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  house_system?: string;
};

function normalizeInput(body: NatalChartInput, profile?: Record<string, unknown> | null) {
  const latitude = body.latitude ?? Number(profile?.latitude);
  const longitude = body.longitude ?? Number(profile?.longitude);
  const timezone = body.timezone ?? String(profile?.timezone ?? "UTC");

  return {
    birth_date: body.birth_date ?? String(profile?.birth_date ?? ""),
    birth_time: body.birth_time ?? String(profile?.birth_time ?? "12:00"),
    latitude,
    longitude,
    timezone,
    house_system: body.house_system ?? "P"
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { supabase, user } = await requireUser(req);
    const body = await req.json().catch(() => ({}));

    const { data: profile } = await supabase
      .from("users_profile")
      .select("birth_date,birth_time,latitude,longitude,timezone")
      .eq("user_id", user.id)
      .maybeSingle();

    const input = normalizeInput(body, profile);

    if (!input.birth_date || !Number.isFinite(input.latitude) || !Number.isFinite(input.longitude)) {
      return jsonResponse(
        {
          error:
            "birth_date, latitude, longitude and timezone are required for a natal chart calculation."
        },
        400
      );
    }

    const serviceUrl = Deno.env.get("ASTROLOGY_SERVICE_URL");
    if (!serviceUrl) {
      return jsonResponse({ error: "ASTROLOGY_SERVICE_URL is not configured." }, 500);
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = Deno.env.get("ASTROLOGY_SERVICE_TOKEN");
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${serviceUrl.replace(/\/$/, "")}/natal-chart`, {
      method: "POST",
      headers,
      body: JSON.stringify(input)
    });

    const chart = await response.json();
    if (!response.ok) {
      return jsonResponse({ error: "Astrology service error", detail: chart }, response.status);
    }

    const { data: birthChart, error: insertError } = await supabase
      .from("birth_charts")
      .insert({
        user_id: user.id,
        input_json: input,
        chart_json: chart,
        engine: "swiss_ephemeris"
      })
      .select("id")
      .single();

    if (insertError) throw insertError;

    return jsonResponse({ chart_id: birthChart.id, chart });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});

