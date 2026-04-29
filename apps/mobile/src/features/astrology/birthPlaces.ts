export type BirthPlace = {
  city: string;
  country: string;
  display_name?: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export const birthPlaces: BirthPlace[] = [
  { city: "Istanbul", country: "Turkey", latitude: 41.0082, longitude: 28.9784, timezone: "Europe/Istanbul" },
  { city: "Ankara", country: "Turkey", latitude: 39.9334, longitude: 32.8597, timezone: "Europe/Istanbul" },
  { city: "Izmir", country: "Turkey", latitude: 38.4237, longitude: 27.1428, timezone: "Europe/Istanbul" },
  { city: "Bursa", country: "Turkey", latitude: 40.1826, longitude: 29.0665, timezone: "Europe/Istanbul" },
  { city: "Antalya", country: "Turkey", latitude: 36.8969, longitude: 30.7133, timezone: "Europe/Istanbul" },
  { city: "Adana", country: "Turkey", latitude: 37.0, longitude: 35.3213, timezone: "Europe/Istanbul" },
  { city: "Konya", country: "Turkey", latitude: 37.8714, longitude: 32.4846, timezone: "Europe/Istanbul" },
  { city: "Kayseri", country: "Turkey", latitude: 38.7205, longitude: 35.4826, timezone: "Europe/Istanbul" },
  { city: "Gaziantep", country: "Turkey", latitude: 37.0662, longitude: 37.3833, timezone: "Europe/Istanbul" },
  { city: "Diyarbakir", country: "Turkey", latitude: 37.9144, longitude: 40.2306, timezone: "Europe/Istanbul" },
  { city: "Trabzon", country: "Turkey", latitude: 41.0027, longitude: 39.7168, timezone: "Europe/Istanbul" },
  { city: "Samsun", country: "Turkey", latitude: 41.2867, longitude: 36.33, timezone: "Europe/Istanbul" },
  { city: "Eskisehir", country: "Turkey", latitude: 39.7767, longitude: 30.5206, timezone: "Europe/Istanbul" },
  { city: "Mersin", country: "Turkey", latitude: 36.8121, longitude: 34.6415, timezone: "Europe/Istanbul" },
  { city: "London", country: "United Kingdom", latitude: 51.5072, longitude: -0.1276, timezone: "Europe/London" },
  { city: "Paris", country: "France", latitude: 48.8566, longitude: 2.3522, timezone: "Europe/Paris" },
  { city: "Berlin", country: "Germany", latitude: 52.52, longitude: 13.405, timezone: "Europe/Berlin" },
  { city: "Amsterdam", country: "Netherlands", latitude: 52.3676, longitude: 4.9041, timezone: "Europe/Amsterdam" },
  { city: "Madrid", country: "Spain", latitude: 40.4168, longitude: -3.7038, timezone: "Europe/Madrid" },
  { city: "Rome", country: "Italy", latitude: 41.9028, longitude: 12.4964, timezone: "Europe/Rome" },
  { city: "Vienna", country: "Austria", latitude: 48.2082, longitude: 16.3738, timezone: "Europe/Vienna" },
  { city: "Zurich", country: "Switzerland", latitude: 47.3769, longitude: 8.5417, timezone: "Europe/Zurich" },
  { city: "Athens", country: "Greece", latitude: 37.9838, longitude: 23.7275, timezone: "Europe/Athens" },
  { city: "Baku", country: "Azerbaijan", latitude: 40.4093, longitude: 49.8671, timezone: "Asia/Baku" },
  { city: "Tbilisi", country: "Georgia", latitude: 41.7151, longitude: 44.8271, timezone: "Asia/Tbilisi" },
  { city: "Dubai", country: "United Arab Emirates", latitude: 25.2048, longitude: 55.2708, timezone: "Asia/Dubai" },
  { city: "Doha", country: "Qatar", latitude: 25.2854, longitude: 51.531, timezone: "Asia/Qatar" },
  { city: "Riyadh", country: "Saudi Arabia", latitude: 24.7136, longitude: 46.6753, timezone: "Asia/Riyadh" },
  { city: "Cairo", country: "Egypt", latitude: 30.0444, longitude: 31.2357, timezone: "Africa/Cairo" },
  { city: "Tehran", country: "Iran", latitude: 35.6892, longitude: 51.389, timezone: "Asia/Tehran" },
  { city: "New York", country: "United States", latitude: 40.7128, longitude: -74.006, timezone: "America/New_York" },
  { city: "Los Angeles", country: "United States", latitude: 34.0522, longitude: -118.2437, timezone: "America/Los_Angeles" },
  { city: "San Francisco", country: "United States", latitude: 37.7749, longitude: -122.4194, timezone: "America/Los_Angeles" },
  { city: "Chicago", country: "United States", latitude: 41.8781, longitude: -87.6298, timezone: "America/Chicago" },
  { city: "Toronto", country: "Canada", latitude: 43.6532, longitude: -79.3832, timezone: "America/Toronto" },
  { city: "Vancouver", country: "Canada", latitude: 49.2827, longitude: -123.1207, timezone: "America/Vancouver" },
  { city: "Mexico City", country: "Mexico", latitude: 19.4326, longitude: -99.1332, timezone: "America/Mexico_City" },
  { city: "Sao Paulo", country: "Brazil", latitude: -23.5558, longitude: -46.6396, timezone: "America/Sao_Paulo" },
  { city: "Buenos Aires", country: "Argentina", latitude: -34.6037, longitude: -58.3816, timezone: "America/Argentina/Buenos_Aires" },
  { city: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503, timezone: "Asia/Tokyo" },
  { city: "Seoul", country: "South Korea", latitude: 37.5665, longitude: 126.978, timezone: "Asia/Seoul" },
  { city: "Beijing", country: "China", latitude: 39.9042, longitude: 116.4074, timezone: "Asia/Shanghai" },
  { city: "Shanghai", country: "China", latitude: 31.2304, longitude: 121.4737, timezone: "Asia/Shanghai" },
  { city: "Singapore", country: "Singapore", latitude: 1.3521, longitude: 103.8198, timezone: "Asia/Singapore" },
  { city: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney" },
  { city: "Melbourne", country: "Australia", latitude: -37.8136, longitude: 144.9631, timezone: "Australia/Melbourne" }
];

function normalize(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function findBirthPlaces(query: string, limit = 6) {
  const needle = normalize(query.trim());
  if (!needle) return birthPlaces.slice(0, limit);

  return birthPlaces
    .filter((place) => {
      const haystack = normalize(`${place.city} ${place.country}`);
      return haystack.includes(needle);
    })
    .slice(0, limit);
}

export function findBirthPlaceByCity(city?: string, country?: string) {
  if (!city) return undefined;
  const needle = normalize(`${city} ${country ?? ""}`);
  return birthPlaces.find((place) => normalize(`${place.city} ${place.country}`) === needle);
}
