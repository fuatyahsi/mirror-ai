import { router } from "expo-router";
import { useState } from "react";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackButton } from "@/components/layout/BackButton";
import { TextField } from "@/components/forms/TextField";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { useUserStore } from "@/stores/useUserStore";

export default function BirthInfoScreen() {
  const setBirthInfo = useUserStore((state) => state.setBirthInfo);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [birthCountry, setBirthCountry] = useState("Türkiye");
  const [latitude, setLatitude] = useState("41.0082");
  const [longitude, setLongitude] = useState("28.9784");
  const [timezone, setTimezone] = useState("Europe/Istanbul");

  function normalizeBirthDate(value: string) {
    const clean = value.trim().replace(/\//g, ".").replace(/-/g, ".");
    const parts = clean.split(".").filter(Boolean);

    if (parts.length !== 3) return value.trim();

    const [first, second, third] = parts;
    if (first.length === 4) {
      return `${first}-${second.padStart(2, "0")}-${third.padStart(2, "0")}`;
    }

    if (third.length === 4) {
      return `${third}-${second.padStart(2, "0")}-${first.padStart(2, "0")}`;
    }

    return value.trim();
  }

  function next() {
    setBirthInfo({
      birth_date: normalizeBirthDate(birthDate),
      birth_time: birthTime,
      birth_city: birthCity,
      birth_country: birthCountry,
      latitude: Number(latitude),
      longitude: Number(longitude),
      timezone
    });
    router.push("/onboarding/profile-quiz");
  }

  return (
    <Screen>
      <BackButton fallbackHref="/onboarding" />
      <PageHeader
        eyebrow="Doğum bilgileri"
        title="İlk bağlamı kuralım"
        subtitle="MVP aşamasında astrolojik hesaplar basit tutulur; ileride Swiss Ephemeris katmanı buraya bağlanacak."
      />
      <TextField
        label="Doğum tarihi"
        placeholder="1983-02-21 veya 21.02.1983"
        value={birthDate}
        onChangeText={setBirthDate}
      />
      <TextField
        label="Doğum saati"
        placeholder="14:30"
        value={birthTime}
        onChangeText={setBirthTime}
      />
      <TextField
        label="Doğum şehri"
        placeholder="İstanbul"
        value={birthCity}
        onChangeText={setBirthCity}
      />
      <TextField
        label="Ülke"
        placeholder="Türkiye"
        value={birthCountry}
        onChangeText={setBirthCountry}
      />
      <TextField
        label="Latitude"
        placeholder="41.0082"
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="decimal-pad"
      />
      <TextField
        label="Longitude"
        placeholder="28.9784"
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="decimal-pad"
      />
      <TextField
        label="Timezone"
        placeholder="Europe/Istanbul"
        value={timezone}
        onChangeText={setTimezone}
        autoCapitalize="none"
      />
      <PrimaryButton disabled={!birthDate || !birthCity} onPress={next}>
        Profil testine geç
      </PrimaryButton>
    </Screen>
  );
}
