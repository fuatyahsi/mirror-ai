import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { TextField } from "@/components/forms/TextField";
import { BackButton } from "@/components/layout/BackButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { calculateNatalChart } from "@/features/astrology/api";
import { findBirthPlaceByCity, type BirthPlace } from "@/features/astrology/birthPlaces";
import { searchBirthPlaces } from "@/features/astrology/geocoding";
import { syncBirthProfile } from "@/features/profileMemory/api";
import { useI18n } from "@/i18n";
import { useUserStore } from "@/stores/useUserStore";
import { colors, radii, spacing } from "@/theme";

type PickerKind = "date" | "time";

const MIN_BIRTH_YEAR = 1960;
const WHEEL_ITEM_HEIGHT = 52;
const WHEEL_VISIBLE_ITEMS = 5;
const WHEEL_VERTICAL_PADDING = WHEEL_ITEM_HEIGHT * Math.floor(WHEEL_VISIBLE_ITEMS / 2);

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
  const params = useLocalSearchParams<{ returnTo?: string }>();
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
  const returnTo =
    params.returnTo === "/tabs/profile" || params.returnTo === "/tabs/astrology"
      ? params.returnTo
      : undefined;
  const completedFallbackHref = returnTo ?? "/tabs/astrology";

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
      try {
        await syncBirthProfile(birth, chart);
      } catch {
        // Local onboarding should keep moving even if remote sync is briefly unavailable.
      }

      if (userProfile.onboarding_completed) {
        router.replace(completedFallbackHref);
      } else {
        router.push("/onboarding/profile-quiz");
      }
    } catch (chartError) {
      try {
        await syncBirthProfile(birth);
      } catch {
        // Birth data stays local and will be retried by the user on the next save.
      }
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
      <BackButton fallbackHref={userProfile.onboarding_completed ? completedFallbackHref : "/onboarding"} />
      <PageHeader eyebrow={t("birth.eyebrow")} title={t("birth.title")} subtitle={t("birth.subtitle")} />

      <View style={styles.selectorCard}>
        <Text style={styles.selectorTitle}>{t("birth.selectedDate")}</Text>
        <View style={styles.dateRow}>
          <SelectorButton label={t("birth.day")} value={String(safeSelectedDay)} onPress={() => setPickerKind("date")} />
          <SelectorButton
            label={t("birth.month")}
            value={monthLabels[selectedMonth]}
            onPress={() => setPickerKind("date")}
          />
          <SelectorButton label={t("birth.year")} value={String(selectedYear)} onPress={() => setPickerKind("date")} />
        </View>
        <Text style={styles.selectionText}>{selectedDate}</Text>
      </View>

      <View style={styles.selectorCard}>
        <Text style={styles.selectorTitle}>{t("birth.time")}</Text>
        <View style={styles.timeRow}>
          <SelectorButton label={locale === "en" ? "Hour" : "Saat"} value={String(selectedHour).padStart(2, "0")} onPress={() => setPickerKind("time")} />
          <Text style={styles.timeDivider}>:</Text>
          <SelectorButton label={locale === "en" ? "Minute" : "Dakika"} value={String(selectedMinute).padStart(2, "0")} onPress={() => setPickerKind("time")} />
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

      <WheelPickerSheet
        visible={Boolean(pickerKind)}
        mode={pickerKind}
        locale={locale}
        monthLabels={monthLabels}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        selectedDay={safeSelectedDay}
        selectedHour={selectedHour}
        selectedMinute={selectedMinute}
        currentMonthDays={currentMonthDays}
        onSelectYear={(year) => {
          setSelectedYear(year);
          setSelectedDay((day) => Math.min(day, daysInMonth(year, selectedMonth)));
        }}
        onSelectMonth={(monthIndex) => {
          setSelectedMonth(monthIndex);
          setSelectedDay((day) => Math.min(day, daysInMonth(selectedYear, monthIndex)));
        }}
        onSelectDay={setSelectedDay}
        onSelectHour={setSelectedHour}
        onSelectMinute={setSelectedMinute}
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

function WheelPickerSheet({
  visible,
  mode,
  locale,
  monthLabels,
  selectedYear,
  selectedMonth,
  selectedDay,
  selectedHour,
  selectedMinute,
  currentMonthDays,
  onSelectYear,
  onSelectMonth,
  onSelectDay,
  onSelectHour,
  onSelectMinute,
  onClose
}: {
  visible: boolean;
  mode?: PickerKind;
  locale: string;
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
  onClose: () => void;
}) {
  const title =
    mode === "time"
      ? locale === "en"
        ? "Birth time"
        : "Doğum saati"
      : locale === "en"
        ? "Birth date"
        : "Doğum tarihi";
  const doneLabel = locale === "en" ? "Done" : "Tamam";
  const yearOptions = numberRange(MIN_BIRTH_YEAR, new Date().getFullYear());
  const dayOptions = numberRange(1, currentMonthDays);
  const monthOptions = monthLabels.map((label, value) => ({ label, value }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>{doneLabel}</Text>
            </Pressable>
          </View>
          {mode === "time" ? (
            <View style={styles.wheelColumns}>
              <WheelColumn
                label={locale === "en" ? "Hour" : "Saat"}
                options={numberRange(0, 23).map((value) => ({ label: String(value).padStart(2, "0"), value }))}
                value={selectedHour}
                visible={visible}
                onSelect={onSelectHour}
              />
              <WheelColumn
                label={locale === "en" ? "Minute" : "Dakika"}
                options={numberRange(0, 59).map((value) => ({ label: String(value).padStart(2, "0"), value }))}
                value={selectedMinute}
                visible={visible}
                onSelect={onSelectMinute}
              />
            </View>
          ) : (
            <View style={styles.wheelColumns}>
              <WheelColumn
                label={locale === "en" ? "Day" : "Gün"}
                options={dayOptions.map((value) => ({ label: String(value), value }))}
                value={selectedDay}
                visible={visible}
                onSelect={onSelectDay}
              />
              <WheelColumn
                label={locale === "en" ? "Month" : "Ay"}
                options={monthOptions}
                value={selectedMonth}
                visible={visible}
                onSelect={onSelectMonth}
              />
              <WheelColumn
                label={locale === "en" ? "Year" : "Yıl"}
                options={yearOptions.map((value) => ({ label: String(value), value }))}
                value={selectedYear}
                visible={visible}
                onSelect={onSelectYear}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function WheelColumn({
  label,
  options,
  value,
  visible,
  onSelect
}: {
  label: string;
  options: { label: string; value: number }[];
  value: number;
  visible: boolean;
  onSelect: (value: number) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  useEffect(() => {
    if (!visible) return;
    const handle = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: selectedIndex * WHEEL_ITEM_HEIGHT, animated: false });
    }, 80);
    return () => clearTimeout(handle);
  }, [options.length, selectedIndex, visible]);

  function selectFromScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.max(0, Math.min(options.length - 1, Math.round(event.nativeEvent.contentOffset.y / WHEEL_ITEM_HEIGHT)));
    const option = options[index];
    if (option && option.value !== value) onSelect(option.value);
  }

  return (
    <View style={styles.wheelColumn}>
      <Text style={styles.wheelLabel}>{label}</Text>
      <View style={styles.wheelWindow}>
        <View pointerEvents="none" style={styles.wheelSelectionBand} />
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={WHEEL_ITEM_HEIGHT}
          decelerationRate="fast"
          contentContainerStyle={styles.wheelContent}
          onMomentumScrollEnd={selectFromScroll}
          onScrollEndDrag={selectFromScroll}
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <Pressable
                key={`${label}-${option.value}`}
                onPress={() => onSelect(option.value)}
                style={[styles.wheelOption, active && styles.wheelOptionActive]}
              >
                <Text style={[styles.wheelOptionText, active && styles.wheelOptionTextActive]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  selectorCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderGlow,
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
    backgroundColor: colors.surfaceSoft,
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
    backgroundColor: colors.surfaceMid,
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
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2
  },
  placeOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceMid
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
  wheelColumns: {
    flexDirection: "row",
    gap: spacing.sm
  },
  wheelColumn: {
    flex: 1,
    gap: spacing.xs
  },
  wheelLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
    textTransform: "uppercase"
  },
  wheelWindow: {
    height: WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ITEMS,
    overflow: "hidden",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft
  },
  wheelSelectionBand: {
    position: "absolute",
    left: spacing.xs,
    right: spacing.xs,
    top: WHEEL_VERTICAL_PADDING,
    height: WHEEL_ITEM_HEIGHT,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surfaceMid
  },
  wheelContent: {
    paddingVertical: WHEEL_VERTICAL_PADDING
  },
  wheelOption: {
    height: WHEEL_ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2
  },
  wheelOptionActive: {
    borderRadius: radii.sm
  },
  wheelOptionText: {
    color: colors.muted,
    fontSize: 18,
    fontWeight: "900"
  },
  wheelOptionTextActive: {
    color: colors.accent,
    fontSize: 22
  }
});
