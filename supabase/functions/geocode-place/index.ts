import { corsHeaders, jsonResponse } from "../shared/cors.ts";

type GeocodeInput = {
  query?: string;
  locale?: "tr" | "en";
};

type NominatimPlace = {
  display_name?: string;
  lat?: string;
  lon?: string;
  name?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
};

const countryTimezones: Record<string, string> = {
  tr: "Europe/Istanbul",
  gb: "Europe/London",
  ie: "Europe/Dublin",
  fr: "Europe/Paris",
  de: "Europe/Berlin",
  nl: "Europe/Amsterdam",
  be: "Europe/Brussels",
  es: "Europe/Madrid",
  it: "Europe/Rome",
  at: "Europe/Vienna",
  ch: "Europe/Zurich",
  gr: "Europe/Athens",
  az: "Asia/Baku",
  ge: "Asia/Tbilisi",
  ae: "Asia/Dubai",
  qa: "Asia/Qatar",
  sa: "Asia/Riyadh",
  eg: "Africa/Cairo",
  ir: "Asia/Tehran",
  jp: "Asia/Tokyo",
  kr: "Asia/Seoul",
  cn: "Asia/Shanghai",
  sg: "Asia/Singapore",
  in: "Asia/Kolkata",
  br: "America/Sao_Paulo",
  ar: "America/Argentina/Buenos_Aires",
  mx: "America/Mexico_City"
};

function normalizeLocale(locale?: string) {
  return locale === "en" ? "en" : "tr";
}

function timezoneFor(countryCode: string, longitude: number) {
  if (countryCode === "us") {
    if (longitude < -130) return "Pacific/Honolulu";
    if (longitude < -115) return "America/Los_Angeles";
    if (longitude < -100) return "America/Denver";
    if (longitude < -85) return "America/Chicago";
    return "America/New_York";
  }

  if (countryCode === "ca") {
    if (longitude < -125) return "America/Vancouver";
    if (longitude < -105) return "America/Edmonton";
    if (longitude < -90) return "America/Winnipeg";
    if (longitude < -70) return "America/Toronto";
    return "America/Halifax";
  }

  if (countryCode === "au") {
    if (longitude < 129) return "Australia/Perth";
    if (longitude < 142) return "Australia/Adelaide";
    return "Australia/Sydney";
  }

  return countryTimezones[countryCode] ?? "UTC";
}

function cityFrom(place: NominatimPlace) {
  return (
    place.address?.city ||
    place.address?.town ||
    place.address?.village ||
    place.address?.municipality ||
    place.address?.county ||
    place.address?.state ||
    place.name ||
    ""
  );
}

function mapPlace(place: NominatimPlace) {
  const latitude = Number(place.lat);
  const longitude = Number(place.lon);
  const countryCode = place.address?.country_code?.toLowerCase() ?? "";
  const city = cityFrom(place);
  const country = place.address?.country ?? "";

  if (!city || !country || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return {
    city,
    country,
    display_name: place.display_name ?? `${city}, ${country}`,
    latitude,
    longitude,
    timezone: timezoneFor(countryCode, longitude)
  };
}

function uniquePlaces<T extends { city: string; country: string; latitude: number; longitude: number }>(places: T[]) {
  const seen = new Set<string>();
  return places.filter((place) => {
    const key = `${place.city}|${place.country}|${place.latitude.toFixed(3)}|${place.longitude.toFixed(3)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json().catch(() => ({}))) as GeocodeInput;
    const query = body.query?.trim() ?? "";
    const locale = normalizeLocale(body.locale);

    if (query.length < 2) {
      return jsonResponse({ places: [] });
    }

    const params = new URLSearchParams({
      q: query,
      format: "jsonv2",
      addressdetails: "1",
      limit: "8",
      featureType: "settlement",
      "accept-language": locale === "en" ? "en" : "tr,en"
    });

    const endpoint = Deno.env.get("GEOCODING_SERVICE_URL") ?? "https://nominatim.openstreetmap.org/search";
    const response = await fetch(`${endpoint}?${params.toString()}`, {
      headers: {
        "User-Agent": "MirrorAI/0.1 contact: github.com/fuatyahsi/mirror-ai",
        Referer: "https://github.com/fuatyahsi/mirror-ai"
      }
    });

    const data = (await response.json()) as unknown;
    if (!response.ok) {
      return jsonResponse({ error: "Geocoding service error", detail: data }, response.status);
    }

    const rawPlaces = Array.isArray(data) ? (data as NominatimPlace[]) : [];
    const places = uniquePlaces(
      rawPlaces.map(mapPlace).filter((place): place is NonNullable<ReturnType<typeof mapPlace>> => Boolean(place))
    );
    return jsonResponse({ places });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
