import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { TextField } from "@/components/forms/TextField";
import { BackButton } from "@/components/layout/BackButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { calculateNatalChart } from "@/features/astrology/api";
import { findBirthPlaceByCity, type BirthPlace } from "@/features/astrology/birthPlaces";
import { searchBirthPlaces } from "@/features/astrology/geocoding";
import { useI18n } from "@/i18n";
import { useUserStore } from "@/stores/useUserStore";
import { colors, radii, spacing } from "@/theme";

type PickerKind = "year" | "month" | "day" | "hour" | "minute";

function formatDateKey(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatTimeKey(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
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

function parseTimeKey(value?: string) {
  const match = /^(\d{1,2}):(\d{2})/.exec(value ?? "");
  if (!match) return { hour: 12, minute: 0 };
  return {
    hour: Math.max(0, Math.min(23, Number(match[1]))),
    minute: Math.max(0, Math.min(59, Number(match[2])))
  };
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function numberRange(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export default function BirthInfoScreen() {
  const userProfile = useUserStore((state) => state.profile);
  const setBirthInfo = useUserStore((state) => state.setBirthInfo);
  const setNatalChart = useUserStore((state) => state.setNatalChart);
  const { locale, t } = useI18n();
  const existingDate = parseDateKey(userProfile.birth.birth_date);
  const existingTime = parseTimeKey(userProfile.birth.birth_time);
  const storedPlace =
    userProfile.birth.birth_city &&
    typeof userProfile.birth.latitude === "number" &&
    typeof userProfile.birth.longitude === "number"
      ? {
          city: userProfile.birth.birth_city,
          country: userProfile.birth.birth_country ?? "",
          latitude: userProfile.birth.latitude,
          longitude: userProfile.birth.longitude,
          timezone: userProfile.birth.timezone ?? "UTC"
        }
      : undefined;
  const existingPlace =
    findBirthPlaceByCity(userProfile.birth.birth_city, userProfile.birth.birth_country) ?? storedPlace;

  const [selectedYear, setSelectedYear] = useState(existingDate?.year ?? 1985);
  const [selectedMonth, setSelectedMonth] = useState(existingDate?.monthIndex ?? 0);
  const [selectedDay, setSelectedDay] = useState(existingDate?.day ?? 1);
  const [selectedHour, setSelectedHour] = useState(existingTime.hour);
  const [selectedMinute, setSelectedMinute] = useState(existingTime.minute);
  const [pickerKind, setPickerKind] = useState<PickerKind>();
  const [placeQuery, setPlaceQuery] = useState(userProfile.birth.birth_city ?? "");
  const [places, setPlaces] = useState<BirthPlace[]>(existingPlace ? [existingPlace] : []);
  const [selectedPlace, setSelectedPlace] = useState<BirthPlace | undefined>(existingPlace);
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();

  const monthLabels = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, monthIndex) =>
        new Date(2024, monthIndex, 1).toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", {
          month: "short"
        })
      ),
    [locale]
  );

  const currentMonthDays = daysInMonth(selectedYear, selectedMonth);
  const safeSelectedDay = Math.min(selectedDay, currentMonthDays);
  const selectedDate = formatDateKey(selectedYear, selectedMonth, safeSelectedDay);
  const birthTime = formatTimeKey(selectedHour, selectedMinute);
  const selectedPlaceLabel = selectedPlace
    ? `${selectedPlace.city}, ${selectedPlace.country} / ${selectedPlace.timezone}`
    : t("birth.placeRequired");
  const searchLabel = locale === "en" ? "Search city" : "Şehri ara";
  const searchingLabel = locale === "en" ? "Searching places..." : "Yer aranıyor...";
  const noPlaceLabel = locale === "en" ? "No city found. Try country + city." : "Şehir bulunamadı. Ülke + şehir deneyin.";
  const canSearchPlace = placeQuery.trim().length >= 2 && !isSearchingPlace;

  function selectPlace(place: BirthPlace) {
    setSelectedPlace(place);
    setPlaceQuery(place.city);
  }

  async function searchPlaces() {
    if (!canSearchPlace) return;
    setIsSearchingPlace(true);
    setError(undefined);
    try {
      const results = await searchBirthPlaces(placeQuery, locale);
      setPlaces(results);
    } finally {
      setIsSearchingPlace(false);
    }
  }

  function selectYear(year: number) {
    setSelectedYear(year);
    setSelectedDay((day) => Math.min(day, daysInMonth(year, selectedMonth)));
    setPickerKind(undefined);
  }

  function selectMonth(monthIndex: number) {
    setSelectedMonth(monthIndex);
    setSelectedDay((day) => Math.min(day, daysInMonth(selectedYear, monthIndex)));
    setPickerKind(undefined);
  }

  async function next() {
    if (!selectedDate || !selectedPlace) return;
    setIsSaving(true);
    setError(undefined);

    const birth = {
      birth_date: selectedDate,
      birth_time: birthTime,
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

  return (
    <Screen>
      <BackButton fallbackHref={userProfile.onboarding_completed ? "/tabs/astrology" : "/onboarding"} />
      <PageHeader eyebrow={t("birth.eyebrow")} title={t("birth.title")} subtitle={t("birth.subtitle")} />

      <View style={styles.selectorCard}>
        <Text style={styles.selectorTitle}>{t("birth.selectedDate")}</Text>
        <View style={styles.dateRow}>
          <SelectorButton label={t("birth.day")} value={String(safeSelectedDay)} onPress={() => setPickerKind("day")} />
          <SelectorButton
            label={t("birth.month")}
            value={monthLabels[selectedMonth]}
            onPress={() => setPickerKind("month")}
          />
          <SelectorButton label={t("birth.year")} value={String(selectedYear)} onPress={() => setPickerKind("year")} />
        </View>
        <Text style={styles.selectionText}>{selectedDate}</Text>
      </View>

      <View style={styles.selectorCard}>
        <Text style={styles.selectorTitle}>{t("birth.time")}</Text>
        <View style={styles.timeRow}>
          <SelectorButton label={locale === "en" ? "Hour" : "Saat"} value={String(selectedHour).padStart(2, "0")} onPress={() => setPickerKind("hour")} />
          <Text style={styles.timeDivider}>:</Text>
          <SelectorButton label={locale === "en" ? "Minute" : "Dakika"} value={String(selectedMinute).padStart(2, "0")} onPress={() => setPickerKind("minute")} />
        </View>
        <Text style={styles.selectionText}>{birthTime}</Text>
      </View>

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
        <Pressable
          onPress={searchPlaces}
          disabled={!canSearchPlace}
          style={[styles.searchButton, !canSearchPlace && styles.searchButtonDisabled]}
        >
          <Text style={styles.searchButtonText}>{isSearchingPlace ? searchingLabel : searchLabel}</Text>
        </Pressable>
        <View style={styles.placeList}>
          {places.map((place) => {
            const active =
              selectedPlace?.city === place.city &&
              selectedPlace.country === place.country &&
              selectedPlace.latitude === place.latitude;
            return (
              <Pressable
                key={`${place.city}-${place.country}-${place.latitude}-${place.longitude}`}
                onPress={() => selectPlace(place)}
                style={[styles.placeOption, active && styles.placeOptionActive]}
              >
                <Text style={[styles.placeTitle, active && styles.placeTitleActive]}>
                  {place.city}, {place.country}
                </Text>
                <Text style={styles.placeMeta}>
                  {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)} / {place.timezone}
                </Text>
                {place.display_name ? <Text style={styles.placeDisplay}>{place.display_name}</Text> : null}
              </Pressable>
            );
          })}
          {!isSearchingPlace && placeQuery.trim().length >= 2 && places.length === 0 ? (
            <Text style={styles.emptyPlaceText}>{noPlaceLabel}</Text>
          ) : null}
        </View>
        <Text style={styles.selectionText}>
          {t("birth.selectedPlace")}: {selectedPlaceLabel}
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton disabled={!selectedDate || !selectedPlace || isSaving} onPress={next}>
        {isSaving ? t("birth.calculatingChart") : userProfile.onboarding_completed ? t("birth.saveAndCalculate") : t("birth.next")}
      </PrimaryButton>

      <PickerSheet
        visible={Boolean(pickerKind)}
        title={pickerKind ? pickerTitle(pickerKind, t, locale) : ""}
        options={pickerOptions({
          pickerKind,
          monthLabels,
          selectedYear,
          selectedMonth,
          selectedDay: safeSelectedDay,
          selectedHour,
          selectedMinute,
          currentMonthDays,
          onSelectYear: selectYear,
          onSelectMonth: selectMonth,
          onSelectDay: (day) => {
            setSelectedDay(day);
            setPickerKind(undefined);
          },
          onSelectHour: (hour) => {
            setSelectedHour(hour);
            setPickerKind(undefined);
          },
          onSelectMinute: (minute) => {
            setSelectedMinute(minute);
            setPickerKind(undefined);
          }
        })}
        closeLabel={locale === "en" ? "Close" : "Kapat"}
        onClose={() => setPickerKind(undefined)}
      />
    </Screen>
  );
}

function SelectorButton({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.selectorButton}>
      <Text style={styles.selectorButtonLabel}>{label}</Text>
      <Text style={styles.selectorButtonValue}>{value}</Text>
    </Pressable>
  );
}

function pickerTitle(kind: PickerKind, t: ReturnType<typeof useI18n>["t"], locale: string) {
  const titles = {
    year: t("birth.year"),
    month: t("birth.month"),
    day: t("birth.day"),
    hour: locale === "en" ? "Hour" : "Saat",
    minute: locale === "en" ? "Minute" : "Dakika"
  };
  return titles[kind];
}

function pickerOptions(input: {
  pickerKind?: PickerKind;
  monthLabels: string[];
  selectedYear: number;
  selectedMonth: number;
  selectedDay: number;
  selectedHour: number;
  selectedMinute: number;
  currentMonthDays: number;
  onSelectYear: (year: number) => void;
  onSelectMonth: (monthIndex: number) => void;
  onSelectDay: (day: number) => void;
  onSelectHour: (hour: number) => void;
  onSelectMinute: (minute: number) => void;
}) {
  switch (input.pickerKind) {
    case "year":
      return numberRange(1960, 2026).map((year) => ({
        label: String(year),
        active: year === input.selectedYear,
        onPress: () => input.onSelectYear(year)
      }));
    case "month":
      return input.monthLabels.map((label, monthIndex) => ({
        label,
        active: monthIndex === input.selectedMonth,
        onPress: () => input.onSelectMonth(monthIndex)
      }));
    case "day":
      return numberRange(1, input.currentMonthDays).map((day) => ({
        label: String(day),
        active: day === input.selectedDay,
        onPress: () => input.onSelectDay(day)
      }));
    case "hour":
      return numberRange(0, 23).map((hour) => ({
        label: String(hour).padStart(2, "0"),
        active: hour === input.selectedHour,
        onPress: () => input.onSelectHour(hour)
      }));
    case "minute":
      return numberRange(0, 59).map((minute) => ({
        label: String(minute).padStart(2, "0"),
        active: minute === input.selectedMinute,
        onPress: () => input.onSelectMinute(minute)
      }));
    default:
      return [];
  }
}

function PickerSheet({
  visible,
  title,
  options,
  closeLabel,
  onClose
}: {
  visible: boolean;
  title: string;
  options: { label: string; active: boolean; onPress: () => void }[];
  closeLabel: string;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>{closeLabel}</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.pickerGrid}>
            {options.map((option) => (
              <Pressable
                key={`${title}-${option.label}`}
                onPress={option.onPress}
                style={[styles.pickerOption, option.active && styles.pickerOptionActive]}
              >
                <Text style={[styles.pickerOptionText, option.active && styles.pickerOptionTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  selectorCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  selectorTitle: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  dateRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  timeDivider: {
    color: colors.accent,
    fontSize: 28,
    fontWeight: "900"
  },
  selectorButton: {
    flex: 1,
    minHeight: 62,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    justifyContent: "center",
    gap: 3
  },
  selectorButtonLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  selectorButtonValue: {
    color: colors.text,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "900"
  },
  selectionText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  placeBox: {
    gap: spacing.sm
  },
  searchButton: {
    minHeight: 44,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  searchButtonDisabled: {
    opacity: 0.45
  },
  searchButtonText: {
    color: colors.text,
    fontWeight: "900"
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
  placeDisplay: {
    color: colors.faint,
    fontSize: 11,
    lineHeight: 16
  },
  emptyPlaceText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 19
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.62)"
  },
  modalCard: {
    maxHeight: "78%",
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  modalClose: {
    minHeight: 36,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center"
  },
  modalCloseText: {
    color: colors.accent,
    fontWeight: "900"
  },
  pickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    paddingBottom: spacing.md
  },
  pickerOption: {
    width: "23.5%",
    minHeight: 46,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center"
  },
  pickerOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent
  },
  pickerOptionText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "900"
  },
  pickerOptionTextActive: {
    color: colors.background
  }
});
