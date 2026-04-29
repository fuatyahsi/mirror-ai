import { findBirthPlaces, type BirthPlace } from "@/features/astrology/birthPlaces";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Locale } from "@/i18n";

type GeocodeResponse = {
  places?: BirthPlace[];
};

export async function searchBirthPlaces(query: string, locale: Locale = "tr") {
  const fallback = findBirthPlaces(query, 8);
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) return fallback;

  if (!isSupabaseConfigured) return fallback;

  try {
    const { data, error } = await supabase.functions.invoke<GeocodeResponse>("geocode-place", {
      body: {
        query: trimmedQuery,
        locale
      }
    });

    if (error) throw error;

    const remotePlaces = Array.isArray(data?.places) ? data.places : [];
    return mergePlaces(remotePlaces, fallback).slice(0, 8);
  } catch {
    return fallback;
  }
}

function mergePlaces(primary: BirthPlace[], fallback: BirthPlace[]) {
  const seen = new Set<string>();
  return [...primary, ...fallback].filter((place) => {
    const key = `${place.city}|${place.country}|${place.latitude.toFixed(3)}|${place.longitude.toFixed(3)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
