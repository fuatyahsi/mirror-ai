import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { TextField } from "@/components/forms/TextField";
import { BackButton } from "@/components/layout/BackButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { calculateNatalChart } from "@/features/astrology/api";
import { findBirthPlaceByCity, findBirthPlaces, type BirthPlace } from "@/features/astrology/birthPlaces";
import { useI18n } from "@/i18n";
import { useUserStore } from "@/stores/useUserStore";
import { colors, radii, spacing } from "@/theme";

function formatDateKey(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDateKey(value?: string) {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  return {
    year: Number(match[1]),
    monthIndex: Number(match[2]) - 1,
    day: Number(match[3])
  };
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export default function BirthInfoScreen() {
  const userProfile = useUserStore((state) => state.profile);
  const setBirthInfo = useUserStore((state) => state.setBirthInfo);
  const setNatalChart = useUserStore((state) => state.setNatalChart);
  const { locale, t } = useI18n();
  const existingDate = parseDateKey(userProfile.birth.birth_date);
  const existingPlace = findBirthPlaceByCity(userProfile.birth.birth_city, userProfile.birth.birth_country);
  const now = new Date();

  const [selectedYear, setSelectedYear] = useState(existingDate?.year ?? now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(existingDate?.monthIndex ?? now.getMonth());
  const [selectedDay, setSelectedDay] = useState(existingDate?.day ?? 1);
  const [birthTime, setBirthTime] = useState(userProfile.birth.birth_time ?? "12:00");
  const [placeQuery, setPlaceQuery] = useState(userProfile.birth.birth_city ?? "");
  const [selectedPlace, setSelectedPlace] = useState<BirthPlace | undefined>(existingPlace);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();

  const places = useMemo(() => findBirthPlaces(placeQuery), [placeQuery]);
  const monthLabels = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, monthIndex) =>
        new Date(2024, monthIndex, 1).toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", {
          month: "short"
        })
      ),
    [locale]
  );
  const selectedDate = formatDateKey(selectedYear, selectedMonth, Math.min(selectedDay, daysInMonth(selectedYear, selectedMonth)));

  function selectPlace(place: BirthPlace) {
    setSelectedPlace(place);
    setPlaceQuery(place.city);
  }

  async function next() {
    if (!selectedDate || !selectedPlace) return;
    setIsSaving(true);
    setError(undefined);

    const birth = {
      birth_date: selectedDate,
      birth_time: birthTime || "12:00",
      birth_city: selectedPlace.city,
      birth_country: selectedPlace.country,
      latitude: selectedPlace.latitude,
      longitude: selectedPlace.longitude,
      timezone: selectedPlace.timezone
    };

    setBirthInfo(birth);

    try {
      const chart = await calculateNatalChart({
        birth_date: birth.birth_date,
        birth_time: birth.birth_time,
        latitude: birth.latitude,
        longitude: birth.longitude,
        timezone: birth.timezone,
        house_system: "P"
      });
      setNatalChart(chart);

      if (userProfile.onboarding_completed) {
        router.replace("/tabs/astrology");
      } else {
        router.push("/onboarding/profile-quiz");
      }
    } catch (chartError) {
      setError(chartError instanceof Error ? chartError.message : t("birth.chartError"));
      if (!userProfile.onboarding_completed) {
        router.push("/onboarding/profile-quiz");
      }
    } finally {
      setIsSaving(false);
    }
  }

  const selectedPlaceLabel = selectedPlace
    ? `${selectedPlace.city}, ${selectedPlace.country} / ${selectedPlace.timezone}`
    : t("birth.placeRequired");
  const selectedDateLabel = selectedDate || t("birth.dateRequired");
  const currentMonthDays = daysInMonth(selectedYear, selectedMonth);

  return (
    <Screen>
      <BackButton fallbackHref={userProfile.onboarding_completed ? "/tabs/astrology" : "/onboarding"} />
      <PageHeader eyebrow={t("birth.eyebrow")} title={t("birth.title")} subtitle={t("birth.subtitle")} />

      <View style={styles.calendar}>
        <View style={styles.selector}>
          <Text style={styles.selectorTitle}>{t("birth.year")}</Text>
          <View style={styles.stepRow}>
            {[-10, -1, 1, 10].map((step) => (
              <Pressable
                key={step}
                onPress={() => setSelectedYear((year) => year + step)}
                style={styles.stepButton}
              >
                <Text style={styles.stepText}>{step > 0 ? `+${step}` : step}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.selectedBig}>{selectedYear}</Text>
        </View>

        <View style={styles.selector}>
          <Text style={styles.selectorTitle}>{t("birth.month")}</Text>
          <View style={styles.monthGrid}>
            {monthLabels.map((label, monthIndex) => {
              const active = selectedMonth === monthIndex;
              return (
                <Pressable
                  key={`${label}-${monthIndex}`}
                  onPress={() => {
                    setSelectedMonth(monthIndex);
                    setSelectedDay((day) => Math.min(day, daysInMonth(selectedYear, monthIndex)));
                  }}
                  style={[styles.monthChip, active && styles.dayCellActive]}
                >
                  <Text style={[styles.dayText, active && styles.dayTextActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.selector}>
          <Text style={styles.selectorTitle}>{t("birth.day")}</Text>
        <View style={styles.dayGrid}>
          {Array.from({ length: currentMonthDays }).map((_, index) => {
            const day = index + 1;
            const active = selectedDay === day;
            return (
              <Pressable
                key={day}
                onPress={() => setSelectedDay(day)}
                style={[styles.dayCell, active && styles.dayCellActive]}
              >
                <Text style={[styles.dayText, active && styles.dayTextActive]}>{day}</Text>
              </Pressable>
            );
          })}
        </View>
        </View>
        <Text style={styles.selectionText}>
          {t("birth.selectedDate")}: {selectedDateLabel}
        </Text>
      </View>

      <TextField label={t("birth.time")} placeholder="14:30" value={birthTime} onChangeText={setBirthTime} />

      <View style={styles.placeBox}>
        <TextField
          label={t("birth.city")}
          placeholder={t("birth.cityPlaceholder")}
          value={placeQuery}
          onChangeText={(value) => {
            setPlaceQuery(value);
            setSelectedPlace(undefined);
          }}
        />
        <View style={styles.placeList}>
          {places.map((place) => {
            const active = selectedPlace?.city === place.city && selectedPlace.country === place.country;
            return (
              <Pressable
                key={`${place.city}-${place.country}`}
                onPress={() => selectPlace(place)}
                style={[styles.placeOption, active && styles.placeOptionActive]}
              >
                <Text style={[styles.placeTitle, active && styles.placeTitleActive]}>
                  {place.city}, {place.country}
                </Text>
                <Text style={styles.placeMeta}>
                  {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)} / {place.timezone}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.selectionText}>
          {t("birth.selectedPlace")}: {selectedPlaceLabel}
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton disabled={!selectedDate || !selectedPlace || isSaving} onPress={next}>
        {isSaving ? t("birth.calculatingChart") : userProfile.onboarding_completed ? t("birth.saveAndCalculate") : t("birth.next")}
      </PrimaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  calendar: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  selector: {
    gap: spacing.xs
  },
  selectorTitle: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  stepRow: {
    flexDirection: "row",
    gap: spacing.xs
  },
  stepButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background
  },
  stepText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "900"
  },
  selectedBig: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
    textAlign: "center"
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  monthChip: {
    width: "23%",
    minHeight: 38,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background
  },
  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4
  },
  dayCell: {
    width: "13.1%",
    aspectRatio: 1,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center"
  },
  dayCellActive: {
    backgroundColor: colors.accent
  },
  dayText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800"
  },
  dayTextActive: {
    color: colors.background
  },
  selectionText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  placeBox: {
    gap: spacing.sm
  },
  placeList: {
    gap: spacing.xs
  },
  placeOption: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2
  },
  placeOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft
  },
  placeTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800"
  },
  placeTitleActive: {
    color: colors.accent
  },
  placeMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 19
  }
});
