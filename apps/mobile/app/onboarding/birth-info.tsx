import { router } from "expo-router";
import { useState } from "react";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
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

  function next() {
    setBirthInfo({
      birth_date: birthDate,
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
      <PageHeader
        eyebrow="Doğum bilgileri"
        title="İlk bağlamı kuralım"
        subtitle="MVP aşamasında astrolojik hesaplar basit tutulur; ileride Swiss Ephemeris katmanı buraya bağlanacak."
      />
      <TextField
        label="Doğum tarihi"
        placeholder="1998-08-24"
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
