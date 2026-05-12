import { router } from "expo-router";
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
import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { TextField } from "@/components/forms/TextField";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { SubtlePremiumOffer } from "@/components/paywall/SubtlePremiumOffer";
import { calculateNatalChart } from "@/features/astrology/api";
import { searchBirthPlaces } from "@/features/astrology/geocoding";
import type { BirthPlace } from "@/features/astrology/birthPlaces";
import { shouldShowRelationshipLoopPreview } from "@/features/premium/featureGates";
import { scheduleRelationshipTimingNotification } from "@/features/notifications/dailySkyNotifications";
import { generateRelationshipReading } from "@/features/relationshipReading/api";
import { buildSynastryReport } from "@/features/relationshipReading/synastry";
import { generateWeeklyRelationshipReport } from "@/features/relationshipReading/weekly";
import { useI18n } from "@/i18n";
import { useUserStore } from "@/stores/useUserStore";
import { colors, featureColors, radii, spacing, typography } from "@/theme";
import type { BirthInfo } from "@/types/profile";

type LocaleKey = "tr" | "en";
type PartnerPickerKind = "date" | "time";
type SelectOption = {
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: Record<LocaleKey, string>;
  hint?: Record<LocaleKey, string>;
};

const MIN_BIRTH_YEAR = 1940;
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
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return { year: 1995, monthIndex: 0, day: 1 };
  return { year: Number(match[1]), monthIndex: Number(match[2]) - 1, day: Number(match[3]) };
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

const relationshipTypeOptions: SelectOption[] = [
  { value: "flirt", icon: "sparkles-outline", label: { tr: "Flört", en: "Dating" }, hint: { tr: "Yeni ya da netleşmemiş romantik temas", en: "New or not-yet-defined romantic contact" } },
  { value: "situationship", icon: "help-buoy-outline", label: { tr: "Belirsiz ilişki", en: "Situationship" }, hint: { tr: "Adı konmamış ama duygusal yoğunluğu olan bağ", en: "Emotionally loaded but undefined bond" } },
  { value: "partner", icon: "heart-outline", label: { tr: "Partner", en: "Partner" }, hint: { tr: "Süren ilişki veya düzenli görüşme", en: "Ongoing relationship or regular dating" } },
  { value: "spouse", icon: "infinite-outline", label: { tr: "Eş / uzun ilişki", en: "Spouse / long-term" }, hint: { tr: "Uzun vadeli bağ ve ortak hayat dinamiği", en: "Long-term bond and shared-life dynamic" } },
  { value: "ex", icon: "return-down-back-outline", label: { tr: "Eski sevgili", en: "Ex partner" }, hint: { tr: "Kopmuş ama zihinde veya hayatta süren bağ", en: "Ended bond that still has emotional presence" } },
  { value: "no_contact", icon: "radio-outline", label: { tr: "İletişim yok", en: "No contact" }, hint: { tr: "Konuşmama, bekleme veya mesafe dönemi", en: "No conversation, waiting or distance period" } },
  { value: "platonic", icon: "flower-outline", label: { tr: "Platonik", en: "Platonic" }, hint: { tr: "Tek taraflı veya söylenmemiş çekim", en: "One-sided or unspoken attraction" } },
  { value: "complicated", icon: "git-network-outline", label: { tr: "Karmaşık bağ", en: "Complicated bond" }, hint: { tr: "Gel-gitli, yarım kalmış veya sınırları bulanık ilişki", en: "On-off, unfinished or blurry-boundary bond" } },
  { value: "work", icon: "briefcase-outline", label: { tr: "İş / sosyal çevre", en: "Work / social circle" }, hint: { tr: "Aynı ortamda süren dikkatli temas", en: "Careful contact inside a shared environment" } }
];

const relationshipSignalOptions: SelectOption[] = [
  { value: "talking", icon: "chatbubble-ellipses-outline", label: { tr: "Konuşuyoruz", en: "We talk" } },
  { value: "late_replies", icon: "time-outline", label: { tr: "Geç cevap veriyor", en: "Late replies" } },
  { value: "distant", icon: "remove-circle-outline", label: { tr: "Uzaklaştı", en: "Distant" } },
  { value: "warm_cold", icon: "thermometer-outline", label: { tr: "Bir sıcak bir soğuk", en: "Hot and cold" } },
  { value: "ambiguous", icon: "help-circle-outline", label: { tr: "Belirsiz", en: "Ambiguous" } },
  { value: "conflict", icon: "flash-outline", label: { tr: "Tartışma oldu", en: "Recent conflict" } },
  { value: "returned", icon: "return-up-back-outline", label: { tr: "Geri döndü", en: "Came back" } },
  { value: "breakup", icon: "heart-dislike-outline", label: { tr: "Ayrıldık", en: "Separated" } },
  { value: "new", icon: "planet-outline", label: { tr: "Yeni tanıştık", en: "Just met" } },
  { value: "silent", icon: "volume-mute-outline", label: { tr: "Sessizlik var", en: "Silence" } },
  { value: "jealousy", icon: "eye-outline", label: { tr: "Kıskançlık / kontrol", en: "Jealousy / control" } },
  { value: "future_talk", icon: "map-outline", label: { tr: "Gelecek konuşuyoruz", en: "Future talk" } }
];

const questionIntentOptions: SelectOption[] = [
  { value: "compatibility", icon: "git-compare-outline", label: { tr: "Uyumumuz nasıl?", en: "How compatible are we?" }, hint: { tr: "Sinastri ve bağlanma dinamiğiyle genel uyum", en: "Overall fit through synastry and attachment dynamic" } },
  { value: "why_attached", icon: "magnet-outline", label: { tr: "Neden kopamıyorum?", en: "Why can't I detach?" }, hint: { tr: "Çekim, tekrar döngüsü ve tetiklenme alanı", en: "Attraction, repetition loop and trigger area" } },
  { value: "will_it_work", icon: "trail-sign-outline", label: { tr: "Bu ilişki yürür mü?", en: "Can this work?" }, hint: { tr: "Kolay akan ve emek isteyen yerleri ayırır", en: "Separates easy flow from effort points" } },
  { value: "message_timing", icon: "send-outline", label: { tr: "Mesaj atmalı mıyım?", en: "Should I message?" }, hint: { tr: "Bugünkü ton, sınır ve zamanlama", en: "Today's tone, boundary and timing" } },
  { value: "why_distant", icon: "walk-outline", label: { tr: "Neden uzaklaşıyor?", en: "Why are they distant?" }, hint: { tr: "Mesafe, baskı hissi ve iletişim kopması", en: "Distance, pressure response and communication gap" } },
  { value: "does_feel", icon: "pulse-outline", label: { tr: "Bana karşı ne hissediyor olabilir?", en: "What might they feel?" }, hint: { tr: "Kesin hüküm değil, sembolik eğilim okuması", en: "Not certainty, a symbolic tendency reading" } },
  { value: "ex_return", icon: "refresh-outline", label: { tr: "Eski ilişki döngüsü ne söylüyor?", en: "What does the ex-cycle say?" }, hint: { tr: "Geri dönüş ihtimalinden çok döngünün anlamı", en: "Less prediction, more meaning of the cycle" } },
  { value: "boundary", icon: "shield-outline", label: { tr: "Sınır mı koymalıyım?", en: "Should I set a boundary?" }, hint: { tr: "Netlik, mesafe ve özsaygı dengesi", en: "Clarity, distance and self-respect balance" } },
  { value: "next_step", icon: "compass-outline", label: { tr: "Bir sonraki doğru adım ne?", en: "What is the next right step?" }, hint: { tr: "Somut, sakin ve uygulanabilir yön", en: "Concrete, calm and practical direction" } }
];

const journalSignalOptions: SelectOption[] = [
  { value: "confused", icon: "help-outline", label: { tr: "Kafam karışık", en: "Confused" } },
  { value: "hurt", icon: "bandage-outline", label: { tr: "Kırıldım", en: "Hurt" } },
  { value: "hopeful", icon: "sunny-outline", label: { tr: "Umutluyum", en: "Hopeful" } },
  { value: "distant", icon: "remove-outline", label: { tr: "Mesafeliyim", en: "Distant" } },
  { value: "need_clarity", icon: "search-outline", label: { tr: "Netlik istiyorum", en: "Need clarity" } },
  { value: "anxious", icon: "pulse-outline", label: { tr: "Kaygılıyım", en: "Anxious" } },
  { value: "angry", icon: "flame-outline", label: { tr: "Kızgınım", en: "Angry" } },
  { value: "miss", icon: "moon-outline", label: { tr: "Özlüyorum", en: "Missing them" } },
  { value: "relieved", icon: "leaf-outline", label: { tr: "Rahatladım", en: "Relieved" } },
  { value: "ready_to_talk", icon: "mic-outline", label: { tr: "Konuşmaya hazırım", en: "Ready to talk" } }
];

export default function RelationshipScreen() {
  const userProfile = useUserStore((state) => state.profile);
  const memoryEvents = useUserStore((state) => state.memoryEvents);
  const relationshipJournalEntries = useUserStore((state) => state.relationshipJournalEntries);
  const relationshipProfiles = useUserStore((state) => state.relationshipProfiles);
  const addRelationshipJournalEntry = useUserStore((state) => state.addRelationshipJournalEntry);
  const upsertRelationshipProfile = useUserStore((state) => state.upsertRelationshipProfile);
  const mergeRemoteProfile = useUserStore((state) => state.mergeRemoteProfile);
  const addReading = useUserStore((state) => state.addReading);
  const { locale, t } = useI18n();
  const localeKey = locale === "en" ? "en" : "tr";
  const [nickname, setNickname] = useState("");
  const [relationType, setRelationType] = useState(relationshipTypeOptions[0].value);
  const [relationshipSignals, setRelationshipSignals] = useState<string[]>(["talking"]);
  const [questionIntent, setQuestionIntent] = useState(questionIntentOptions[0].value);
  const [question, setQuestion] = useState(questionIntentOptions[0].label.tr);
  const [recentContext, setRecentContext] = useState("");
  const [journalSignals, setJournalSignals] = useState<string[]>(["confused"]);
  const [birthDate, setBirthDate] = useState("1995-01-01");
  const [birthTime, setBirthTime] = useState("12:00");
  const [birthTimeKnown, setBirthTimeKnown] = useState(false);
  const [placeQuery, setPlaceQuery] = useState("");
  const [places, setPlaces] = useState<BirthPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<BirthPlace>();
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string>();
  const [isGeneratingWeekly, setIsGeneratingWeekly] = useState(false);
  const [weeklyError, setWeeklyError] = useState<string>();
  const [expandedSelect, setExpandedSelect] = useState<string>();
  const [pickerKind, setPickerKind] = useState<PartnerPickerKind>();

  const relationshipKey = normalizeRelationshipKey(nickname);
  const selectedDateParts = parseDateKey(birthDate);
  const selectedTimeParts = parseTimeKey(birthTime);
  const monthLabels = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, monthIndex) =>
        new Date(2024, monthIndex, 1).toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", {
          month: "short"
        })
      ),
    [locale]
  );
  const recentJournal = useMemo(
    () =>
      relationshipJournalEntries
        .filter((entry) => entry.relationship_key === relationshipKey)
        .slice(0, 4),
    [relationshipJournalEntries, relationshipKey]
  );
  const canCalculateSynastry = Boolean(userProfile.natal_chart && birthDate && selectedPlace);
  const nextLoopEntryCount = recentJournal.length + (recentContext.trim() ? 1 : 0);
  const loopThemes = useMemo(
    () => extractRelationshipLoopThemes(recentJournal, recentContext, locale === "en" ? "en" : "tr"),
    [recentJournal, recentContext, locale]
  );
  const showLoopPreview =
    shouldShowRelationshipLoopPreview(nextLoopEntryCount) || recentContext.trim().length >= 32;
  const relationTypeLabel = getSelectedLabels(relationshipTypeOptions, [relationType], localeKey).join(", ");
  const status = getSelectedLabels(relationshipSignalOptions, relationshipSignals, localeKey).join(", ");
  const journalMood = getSelectedLabels(journalSignalOptions, journalSignals, localeKey).join(", ");
  const activeRelationshipProfile = relationshipProfiles.find((profile) => profile.relationship_key === relationshipKey);
  const isMessageTimingIntent = questionIntent === "message_timing" || /mesaj|yaz|ara|text|message|call/i.test(question);

  useEffect(() => {
    const selectedOption = questionIntentOptions.find((option) => option.value === questionIntent) ?? questionIntentOptions[0];
    const generatedQuestionLabels = questionIntentOptions.flatMap((option) => [option.label.tr, option.label.en]);
    setQuestion((currentQuestion) =>
      generatedQuestionLabels.includes(currentQuestion) ? selectedOption.label[localeKey] : currentQuestion
    );
  }, [localeKey, questionIntent]);

  async function searchPlace() {
    setIsSearchingPlace(true);
    setGenerationError(undefined);
    try {
      const results = await searchBirthPlaces(placeQuery, locale);
      setPlaces(results);
    } finally {
      setIsSearchingPlace(false);
    }
  }

  async function generate(accessMode: "basic" | "timing" | "deep") {
    setIsGenerating(true);
    setGenerationError(undefined);

    try {
      const partnerBirth = buildPartnerBirth();
      const useDeepLayer = accessMode === "deep";
      const usePartnerAstrologyLayer = useDeepLayer || (accessMode === "timing" && canCalculateSynastry);
      const journalEntry =
        recentContext.trim() && nickname.trim()
          ? addRelationshipJournalEntry({
              nickname: nickname.trim(),
              event_text: recentContext.trim(),
              mood: journalMood
            })
          : undefined;
      const nextJournal = journalEntry ? [journalEntry, ...recentJournal] : recentJournal;
      const partnerNatalChart =
        usePartnerAstrologyLayer && partnerBirth && selectedPlace
          ? await calculateNatalChart({
              birth_date: partnerBirth.birth_date ?? birthDate,
              birth_time: birthTimeKnown ? partnerBirth.birth_time : "12:00",
              latitude: selectedPlace.latitude,
              longitude: selectedPlace.longitude,
              timezone: selectedPlace.timezone,
              house_system: "P"
            })
          : undefined;
      const synastry = usePartnerAstrologyLayer
        ? buildSynastryReport(userProfile.natal_chart, partnerNatalChart, {
            partnerBirthTimeKnown: birthTimeKnown,
            locale
          })
        : undefined;

      const result = await generateRelationshipReading({
        accessMode,
        nickname: nickname.trim(),
        relation_type: relationTypeLabel,
        status,
        question: question.trim(),
        recent_context: recentContext.trim(),
        journal_mood: journalMood,
        journal_signals: journalSignals,
        partner_birth: partnerBirth,
        partnerNatalChart,
        synastry,
        journal_entries: nextJournal,
        profile: userProfile.mystic_profile,
        memory: memoryEvents,
        natalChart: userProfile.natal_chart,
        locale
      });
      const remainingBalance = Number(result.billing?.remaining_balance);
      if (Number.isFinite(remainingBalance)) {
        mergeRemoteProfile({ credits: remainingBalance });
      }
      addReading(result.reading);
      upsertRelationshipProfile({
        relationship_key: relationshipKey,
        nickname: nickname.trim(),
        relation_type: relationTypeLabel,
        relation_type_value: relationType,
        status,
        status_values: relationshipSignals,
        main_question: question.trim(),
        question_intent: questionIntent,
        partner_birth: partnerBirth,
        synastry: result.relationship_intelligence?.synastry ?? synastry,
        scores: result.scores,
        timing_context: result.relationship_intelligence?.timing_context,
        journal_count: nextJournal.length,
        last_context: recentContext.trim()
      });
      try {
        await scheduleRelationshipTimingNotification({
          locale,
          nickname: nickname.trim(),
          suggestedTone: String(result.relationship_intelligence?.timing_context?.suggested_tone ?? "")
        });
      } catch {
        // Notification permission can be denied; the reading flow should continue.
      }
      router.push(`/readings/${result.reading.id}`);
    } catch (error) {
      if (accessMode === "deep" && isPaymentRequiredLikeError(error)) {
        setGenerationError(
          locale === "en"
            ? "Deep synastry is a Plus or credit feature. You can unlock it from the next screen."
            : "Derin sinastri Plus veya kredi özelliği. Bir sonraki ekrandan açabilirsin."
        );
        router.push("/paywall?feature=deep_synastry");
        return;
      }
      if (accessMode === "timing" && isPaymentRequiredLikeError(error)) {
        setGenerationError(
          locale === "en"
            ? "The quick message coach is a Plus or 1 credit feature. You can unlock it from the next screen."
            : "HÄ±zlÄ± mesaj koÃ§u Plus veya 1 kredi ile aÃ§Ä±lÄ±r. Bir sonraki ekrandan aÃ§abilirsin."
        );
        router.push("/paywall?feature=relationship_timing");
        return;
      }
      setGenerationError(error instanceof Error ? error.message : t("relationship.error"));
    } finally {
      setIsGenerating(false);
    }
  }

  async function generateWeekly(targetKey: string, targetNickname: string) {
    setIsGeneratingWeekly(true);
    setWeeklyError(undefined);
    try {
      const result = await generateWeeklyRelationshipReport({
        relationship_key: targetKey,
        locale
      });
      const remainingBalance = Number(result.billing?.remaining_balance);
      if (Number.isFinite(remainingBalance)) {
        mergeRemoteProfile({ credits: remainingBalance });
      }
      addReading(result.reading);
      router.push(`/readings/${result.reading.id}`);
    } catch (error) {
      if (isPaymentRequiredLikeError(error)) {
        setWeeklyError(
          locale === "en"
            ? `Weekly report for ${targetNickname} requires Plus or 4 credits. Open the next screen to unlock it.`
            : `${targetNickname} için haftalık rapor Plus veya 4 kredi ile açılır. Bir sonraki ekrandan açabilirsin.`
        );
        router.push("/paywall?feature=weekly_relationship_report");
        return;
      }
      setWeeklyError(error instanceof Error ? error.message : t("relationship.error"));
    } finally {
      setIsGeneratingWeekly(false);
    }
  }

  function applyRelationshipProfile(profile: (typeof relationshipProfiles)[number]) {
    setNickname(profile.nickname);
    setRelationType(profile.relation_type_value ?? relationshipTypeOptions[0].value);
    setRelationshipSignals(profile.status_values?.length ? profile.status_values : relationshipSignals);
    setQuestionIntent(profile.question_intent ?? questionIntentOptions[0].value);
    setQuestion(profile.main_question ?? question);
    setRecentContext(profile.last_context ?? "");
    if (profile.partner_birth?.birth_date) setBirthDate(profile.partner_birth.birth_date);
    if (profile.partner_birth?.birth_time) setBirthTime(profile.partner_birth.birth_time);
    setBirthTimeKnown(Boolean(profile.partner_birth?.birth_time_known));
    if (
      profile.partner_birth?.birth_city &&
      typeof profile.partner_birth.latitude === "number" &&
      typeof profile.partner_birth.longitude === "number"
    ) {
      const place = {
        city: profile.partner_birth.birth_city,
        country: profile.partner_birth.birth_country ?? "",
        latitude: profile.partner_birth.latitude,
        longitude: profile.partner_birth.longitude,
        timezone: profile.partner_birth.timezone ?? "UTC"
      };
      setSelectedPlace(place);
      setPlaceQuery(place.city);
      setPlaces([place, ...places.filter((item) => item.city !== place.city)]);
    }
  }

  function buildPartnerBirth(): (BirthInfo & { birth_time_known?: boolean }) | undefined {
    if (!selectedPlace || !birthDate.trim()) return undefined;
    return {
      birth_date: birthDate.trim(),
      birth_time: birthTimeKnown ? birthTime.trim() : "12:00",
      birth_city: selectedPlace.city,
      birth_country: selectedPlace.country,
      latitude: selectedPlace.latitude,
      longitude: selectedPlace.longitude,
      timezone: selectedPlace.timezone,
      birth_time_known: birthTimeKnown
    };
  }

  return (
    <Screen>
      <PageHeader
        eyebrow={locale === "en" ? "RELATIONSHIP INTELLIGENCE" : "İLİŞKİ ZEKASI"}
        title={locale === "en" ? "Synastry, memory and timing" : "Sinastri, hafıza ve zamanlama"}
        subtitle={
          locale === "en"
            ? "Mirror AI reads the bond through natal context, partner data, relationship journal and the exact question."
            : "Mirror AI bağı doğum haritası, karşı kişi verisi, ilişki günlüğü ve net soruyla birlikte okur."
        }
      />

      <View style={styles.heroCard}>
        <View style={styles.heroIcon}>
          <Ionicons name="git-compare-outline" size={24} color={featureColors.relationship.accent} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>
            {locale === "en" ? "Not only compatibility. The loop." : "Sadece uyum değil, döngü."}
          </Text>
          <Text style={styles.heroBody}>
            {locale === "en"
              ? "The report combines your chart, their chart, recent events and today’s question into one grounded relationship reading."
              : "Rapor senin haritanı, onun haritasını, son olayları ve bugünkü sorunu tek bir ilişki okumasında birleştirir."}
          </Text>
        </View>
      </View>

      <RelationshipSpinePanel
        locale={localeKey}
        canCalculateSynastry={canCalculateSynastry}
        hasOwnChart={Boolean(userProfile.natal_chart)}
        hasPartnerPlace={Boolean(selectedPlace)}
        birthTimeKnown={birthTimeKnown}
        journalCount={nextLoopEntryCount}
        loopThemes={loopThemes}
      />

      {relationshipProfiles.length ? (
        <Section title={locale === "en" ? "Saved relationship profiles" : "Kayıtlı ilişki profilleri"}>
          <View style={styles.profileGrid}>
            {relationshipProfiles.slice(0, 4).map((profile) => (
              <RelationshipProfileCard
                key={profile.relationship_key}
                profile={profile}
                locale={localeKey}
                active={profile.relationship_key === activeRelationshipProfile?.relationship_key}
                onPress={() => applyRelationshipProfile(profile)}
              />
            ))}
          </View>
        </Section>
      ) : null}

      {activeRelationshipProfile ? (
        <>
          <RelationshipIntelligencePanel profile={activeRelationshipProfile} locale={localeKey} />
          <SubtlePremiumOffer feature="relationship_timing" compact />
          <View style={styles.weeklyCard}>
            <View style={styles.weeklyTextBlock}>
              <Text style={styles.weeklyEyebrow}>
                {locale === "en" ? "WEEKLY RELATIONSHIP REPORT" : "HAFTALIK İLİŞKİ RAPORU"}
              </Text>
              <Text style={styles.weeklyTitle}>
                {locale === "en"
                  ? "What this week looked like with " + (activeRelationshipProfile.nickname ?? "this person")
                  : (activeRelationshipProfile.nickname ?? "Bu kişi") + " ile geçen 7 gün"}
              </Text>
              <Text style={styles.weeklyBody}>
                {locale === "en"
                  ? "Pulls together your journal entries, readings and the timing window into one weekly review."
                  : "Günlük kayıtların, ilişki yorumların ve gökyüzü tek bir haftalık raporda toplanır."}
              </Text>
              <Text style={styles.weeklyMeta}>
                {locale === "en"
                  ? `Plus or 4 credits. Balance: ${userProfile.credits}`
                  : `Plus veya 4 kredi. Bakiye: ${userProfile.credits}`}
              </Text>
            </View>
            <PrimaryButton
              variant="secondary"
              disabled={isGeneratingWeekly}
              onPress={() => generateWeekly(activeRelationshipProfile.relationship_key, activeRelationshipProfile.nickname)}
            >
              {isGeneratingWeekly
                ? locale === "en"
                  ? "Mirror AI is reviewing your week..."
                  : "Mirror AI haftanı okuyor..."
                : locale === "en"
                  ? "Open weekly report"
                  : "Haftalık raporu aç"}
            </PrimaryButton>
            {weeklyError ? <Text style={styles.weeklyError}>{weeklyError}</Text> : null}
          </View>
        </>
      ) : null}

      <Section title={locale === "en" ? "Person and bond" : "Kişi ve bağ"}>
        <TextField label={t("relationship.nickname")} value={nickname} onChangeText={setNickname} placeholder="Mert, A., eski sevgilim..." />
        <SelectionDropdown
          id="relationship_type"
          label={locale === "en" ? "Relationship type" : "İlişki türü"}
          options={relationshipTypeOptions}
          selectedValues={[relationType]}
          locale={localeKey}
          expanded={expandedSelect === "relationship_type"}
          onToggle={() => setExpandedSelect(expandedSelect === "relationship_type" ? undefined : "relationship_type")}
          onChange={(values) => {
            setRelationType(values[0] ?? relationshipTypeOptions[0].value);
            setExpandedSelect(undefined);
          }}
        />
        <SelectionDropdown
          id="relationship_signals"
          label={locale === "en" ? "Current signals" : "Mevcut durum sinyalleri"}
          helper={locale === "en" ? "Select all that apply." : "Birden fazla seçenek seçebilirsin."}
          options={relationshipSignalOptions}
          selectedValues={relationshipSignals}
          locale={localeKey}
          expanded={expandedSelect === "relationship_signals"}
          multiple
          onToggle={() => setExpandedSelect(expandedSelect === "relationship_signals" ? undefined : "relationship_signals")}
          onChange={setRelationshipSignals}
        />
      </Section>

      <Section title={locale === "en" ? "Their birth context" : "Onun doğum bağlamı"}>
        <View style={styles.inputRow}>
          <View style={styles.dateRow}>
            <SelectorButton label={locale === "en" ? "Day" : "Gün"} value={String(selectedDateParts.day)} onPress={() => setPickerKind("date")} />
            <SelectorButton label={locale === "en" ? "Month" : "Ay"} value={monthLabels[selectedDateParts.monthIndex]} onPress={() => setPickerKind("date")} />
            <SelectorButton label={locale === "en" ? "Year" : "Yıl"} value={String(selectedDateParts.year)} onPress={() => setPickerKind("date")} />
          </View>
          <View style={styles.timeSelectorRow}>
            <SelectorButton label={locale === "en" ? "Hour" : "Saat"} value={String(selectedTimeParts.hour).padStart(2, "0")} onPress={() => setPickerKind("time")} />
            <Text style={styles.timeDivider}>:</Text>
            <SelectorButton label={locale === "en" ? "Minute" : "Dakika"} value={String(selectedTimeParts.minute).padStart(2, "0")} onPress={() => setPickerKind("time")} />
          </View>
        </View>
        <Pressable style={[styles.toggle, birthTimeKnown && styles.toggleActive]} onPress={() => setBirthTimeKnown((value) => !value)}>
          <Ionicons name={birthTimeKnown ? "checkmark-circle" : "ellipse-outline"} size={18} color={birthTimeKnown ? colors.background : colors.muted} />
          <Text style={[styles.toggleText, birthTimeKnown && styles.toggleTextActive]}>
            {birthTimeKnown ? "Doğum saati biliniyor" : "Doğum saati bilinmiyor / yaklaşık"}
          </Text>
        </Pressable>
        <Text style={styles.note}>
          {birthTimeKnown
            ? "Saat netse yükselen ve evler daha güçlü referans alınır."
            : "Saat bilinmiyorsa analiz gezegenler arası uyum ve temel ilişki dinamiklerine dayanır."}
        </Text>
        <TextField
          label={locale === "en" ? "Birth city" : "Doğum şehri"}
          value={placeQuery}
          onChangeText={(value) => {
            setPlaceQuery(value);
            setSelectedPlace(undefined);
          }}
          placeholder="Ankara, Istanbul, London..."
        />
        <PrimaryButton disabled={placeQuery.trim().length < 2 || isSearchingPlace} onPress={searchPlace}>
          {isSearchingPlace ? "Şehir aranıyor..." : "Şehri bul"}
        </PrimaryButton>
        {places.map((place) => {
          const active = selectedPlace?.city === place.city && selectedPlace.country === place.country;
          return (
            <Pressable key={`${place.city}-${place.country}-${place.latitude}`} style={[styles.placeOption, active && styles.placeOptionActive]} onPress={() => setSelectedPlace(place)}>
              <Text style={styles.placeTitle}>{place.city}, {place.country}</Text>
              <Text style={styles.placeMeta}>{place.latitude.toFixed(4)}, {place.longitude.toFixed(4)} / {place.timezone}</Text>
            </Pressable>
          );
        })}
      </Section>

      <Section title={locale === "en" ? "Question intent" : "Soru niyeti"}>
        <SelectionDropdown
          id="question_intent"
          label={locale === "en" ? "Question type" : "Soru tipi"}
          options={questionIntentOptions}
          selectedValues={[questionIntent]}
          locale={localeKey}
          expanded={expandedSelect === "question_intent"}
          onToggle={() => setExpandedSelect(expandedSelect === "question_intent" ? undefined : "question_intent")}
          onChange={(values) => {
            const nextIntent = values[0] ?? questionIntentOptions[0].value;
            const nextOption = questionIntentOptions.find((option) => option.value === nextIntent) ?? questionIntentOptions[0];
            setQuestionIntent(nextIntent);
            setQuestion(nextOption.label[localeKey]);
            setExpandedSelect(undefined);
          }}
        />
        <TextField
          label={t("relationship.mainQuestion")}
          value={question}
          onChangeText={setQuestion}
          placeholder={t("relationship.questionPlaceholder")}
          multiline
        />
      </Section>

      <Section title={locale === "en" ? "Relationship journal" : "İlişki günlüğü"}>
        <SelectionDropdown
          id="journal_signals"
          label={locale === "en" ? "Today I feel" : "Bugünkü duygu sinyalleri"}
          helper={locale === "en" ? "You can combine mood, need and action readiness." : "Duygu, ihtiyaç ve konuşma hazırlığını birlikte seçebilirsin."}
          options={journalSignalOptions}
          selectedValues={journalSignals}
          locale={localeKey}
          expanded={expandedSelect === "journal_signals"}
          multiple
          onToggle={() => setExpandedSelect(expandedSelect === "journal_signals" ? undefined : "journal_signals")}
          onChange={setJournalSignals}
        />
        <TextField
          label={t("relationship.recentContext")}
          value={recentContext}
          onChangeText={setRecentContext}
          placeholder="Bugün mesajıma geç cevap verdi, buluşmadan sonra kafam karıştı..."
          multiline
        />
        {recentJournal.length ? (
          <View style={styles.journalList}>
            {recentJournal.map((entry) => (
              <View key={entry.id} style={styles.journalItem}>
                <Text style={styles.journalMood}>{entry.mood}</Text>
                <Text style={styles.journalText}>{entry.event_text}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.note}>İlk kayıt bu analizle birlikte hafızaya alınır. Sonraki yorumlar aynı döngüyü takip eder.</Text>
        )}
      </Section>

      {showLoopPreview ? (
        <SubtlePremiumOffer feature="relationship_loop" />
      ) : canCalculateSynastry ? (
        <SubtlePremiumOffer feature="deep_synastry" compact />
      ) : null}

      <View style={styles.readinessCard}>
        <Text style={styles.readinessTitle}>{canCalculateSynastry ? "Derin sinastri hazır" : "Derin sinastri için veri bekleniyor"}</Text>
        <Text style={styles.readinessBody}>
          {canCalculateSynastry
            ? "Temel analiz ücretsiz kısa ilişki aynasıdır. Derin rapor iki haritayı, ilişki hafızasını ve bugünkü zamanlamayı birlikte yorumlar."
            : "Temel analizi yine oluşturabilirsin. Kendi haritan ve karşı tarafın doğum yeri/tarihi olduğunda derin sinastri raporu açılır."}
          {showLoopPreview
            ? locale === "en"
              ? ` Current loop signal: ${loopThemes.slice(0, 2).join(" / ")}.`
              : ` Mevcut döngü sinyali: ${loopThemes.slice(0, 2).join(" / ")}.`
            : ""}
        </Text>
      </View>

      <View style={[styles.quickTimingCard, isMessageTimingIntent && styles.quickTimingCardActive]}>
        <View style={styles.quickTimingHeader}>
          <View style={styles.quickTimingIcon}>
            <Ionicons name="send-outline" size={18} color={colors.accentTeal} />
          </View>
          <View style={styles.quickTimingText}>
            <Text style={styles.quickTimingEyebrow}>{locale === "en" ? "QUICK ACTION · 1 CREDIT" : "HIZLI AKSİYON · 1 KREDİ"}</Text>
            <Text style={styles.quickTimingTitle}>{locale === "en" ? "Should I message today?" : "Bugün mesaj atmalı mıyım?"}</Text>
          </View>
        </View>
        <Text style={styles.quickTimingBody}>
          {locale === "en"
            ? "A short paid answer: message-or-wait decision, exact tone, what not to over-read, and a copy-pasteable sample message."
            : "Kısa ücretli cevap: mesaj at / bekle kararı, net ton, fazla okunmaması gereken şey ve kopyalanabilir örnek mesaj."}
        </Text>
        <Text style={styles.quickTimingMeta}>
          {locale === "en" ? `Plus or 1 credit. Balance: ${userProfile.credits}` : `Plus veya 1 kredi. Bakiye: ${userProfile.credits}`}
        </Text>
        <PrimaryButton
          variant={isMessageTimingIntent ? "primary" : "secondary"}
          disabled={!nickname.trim() || !question.trim() || isGenerating}
          onPress={() => generate("timing")}
        >
          {isGenerating ? t("common.loadingMirror") : locale === "en" ? "Open quick message coach" : "Hızlı mesaj koçunu aç"}
        </PrimaryButton>
      </View>

      {generationError ? <Text style={styles.error}>{generationError}</Text> : null}
      <View style={styles.analysisChoice}>
        <View style={styles.analysisChoiceText}>
          <Text style={styles.analysisChoiceTitle}>{locale === "en" ? "Choose the depth" : "Analiz derinliğini seç"}</Text>
          <Text style={styles.analysisChoiceBody}>
            {locale === "en"
              ? "Start free with the relationship mirror, or unlock the deeper synastry report when the bond matters."
              : "Önce ücretsiz ilişki aynasıyla başlayabilir, bağ önemliyse derin sinastri raporunu açabilirsin."}
          </Text>
          <Text style={styles.analysisChoiceMeta}>
            {locale === "en"
              ? `Deep report uses Plus or 4 credits. Balance: ${userProfile.credits}`
              : `Derin rapor Plus veya 4 kredi ile açılır. Bakiye: ${userProfile.credits}`}
          </Text>
        </View>
      </View>
      <PrimaryButton disabled={!nickname.trim() || !question.trim() || isGenerating} onPress={() => generate("basic")}>
        {isGenerating ? t("common.loadingMirror") : locale === "en" ? "Create free relationship mirror" : "Ücretsiz ilişki aynası oluştur"}
      </PrimaryButton>
      <PrimaryButton
        variant="secondary"
        disabled={!nickname.trim() || !question.trim() || isGenerating || !canCalculateSynastry}
        onPress={() => generate("deep")}
      >
        {locale === "en" ? "Open deep synastry report" : "Derin sinastri raporunu aç"}
      </PrimaryButton>
      <PartnerWheelPickerSheet
        visible={Boolean(pickerKind)}
        mode={pickerKind}
        locale={localeKey}
        monthLabels={monthLabels}
        birthDate={birthDate}
        birthTime={birthTime}
        onChangeDate={setBirthDate}
        onChangeTime={setBirthTime}
        onClose={() => setPickerKind(undefined)}
      />
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function RelationshipSpinePanel({
  locale,
  canCalculateSynastry,
  hasOwnChart,
  hasPartnerPlace,
  birthTimeKnown,
  journalCount,
  loopThemes
}: {
  locale: LocaleKey;
  canCalculateSynastry: boolean;
  hasOwnChart: boolean;
  hasPartnerPlace: boolean;
  birthTimeKnown: boolean;
  journalCount: number;
  loopThemes: string[];
}) {
  const missingSynastry =
    locale === "en"
      ? !hasOwnChart
        ? "Your natal chart is needed."
        : !hasPartnerPlace
          ? "Partner birth place is needed."
          : "Partner birth date is needed."
      : !hasOwnChart
        ? "Önce kendi doğum haritan gerekiyor."
        : !hasPartnerPlace
          ? "Karşı kişinin doğum yeri gerekiyor."
          : "Karşı kişinin doğum tarihi gerekiyor.";
  const pillars = [
    {
      icon: "git-compare-outline" as const,
      title: locale === "en" ? "Synastry" : "Sinastri",
      status: canCalculateSynastry ? (locale === "en" ? "Ready" : "Hazır") : (locale === "en" ? "Waiting" : "Bekliyor"),
      body: canCalculateSynastry
        ? birthTimeKnown
          ? locale === "en"
            ? "Both charts can feed emotional, mental, romantic and long-term bond scores."
            : "İki harita duygusal, zihinsel, romantik ve uzun vade bağ skorlarını besler."
          : locale === "en"
            ? "Birth time is unknown, so the reading leans on planet-to-planet dynamics."
            : "Doğum saati bilinmediği için okuma gezegenler arası dinamiğe yaslanır."
        : missingSynastry
    },
    {
      icon: "bookmarks-outline" as const,
      title: locale === "en" ? "Memory" : "Hafıza",
      status: `${journalCount}`,
      body: journalCount
        ? locale === "en"
          ? `Current loop signal: ${loopThemes.slice(0, 2).join(" / ")}.`
          : `Mevcut döngü sinyali: ${loopThemes.slice(0, 2).join(" / ")}.`
        : locale === "en"
          ? "The first event you write becomes the beginning of this bond's memory."
          : "Yazdığın ilk olay bu bağın hafızasını başlatır."
    },
    {
      icon: "navigate-circle-outline" as const,
      title: locale === "en" ? "Timing" : "Zamanlama",
      status: locale === "en" ? "Today" : "Bugün",
      body: locale === "en"
        ? "The report turns chart pressure and journal patterns into message tone, next action and what not to over-read."
        : "Rapor harita baskısını ve günlük döngülerini mesaj tonu, sonraki adım ve fazla okunmaması gereken şeye çevirir."
    }
  ];

  return (
    <View style={styles.spinePanel}>
      <View style={styles.spineHeader}>
        <Text style={styles.spineEyebrow}>{locale === "en" ? "CORE ENGINE" : "ANA OMURGA"}</Text>
        <Text style={styles.spineTitle}>
          {locale === "en" ? "Chart + memory + timing" : "Harita + hafıza + zamanlama"}
        </Text>
      </View>
      <View style={styles.spineGrid}>
        {pillars.map((pillar) => (
          <View key={pillar.title} style={styles.spineCard}>
            <View style={styles.spineCardTop}>
              <View style={styles.spineIcon}>
                <Ionicons name={pillar.icon} size={17} color={colors.accentTeal} />
              </View>
              <Text style={styles.spineStatus}>{pillar.status}</Text>
            </View>
            <Text style={styles.spineCardTitle}>{pillar.title}</Text>
            <Text style={styles.spineCardBody}>{pillar.body}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function RelationshipProfileCard({
  profile,
  locale,
  active,
  onPress
}: {
  profile: {
    nickname: string;
    relation_type: string;
    status: string;
    synastry?: { overall_score?: number; scores?: Record<string, number>; time_accuracy_note?: string };
    timing_context?: Record<string, unknown>;
    journal_count: number;
    updated_at: string;
  };
  locale: LocaleKey;
  active: boolean;
  onPress: () => void;
}) {
  const score = profile.synastry?.overall_score;
  const timing = profile.timing_context as { sensitivity?: string; loop_themes?: string[]; suggested_tone?: string } | undefined;
  const loop = timing?.loop_themes?.slice(0, 2).join(" / ");

  return (
    <Pressable onPress={onPress} style={[styles.relationshipProfileCard, active && styles.relationshipProfileCardActive]}>
      <View style={styles.relationshipProfileHeader}>
        <Text style={styles.relationshipProfileName}>{profile.nickname}</Text>
        {typeof score === "number" ? <Text style={styles.relationshipScore}>{score}</Text> : null}
      </View>
      <Text style={styles.relationshipProfileMeta} numberOfLines={1}>
        {profile.relation_type} / {profile.status}
      </Text>
      <View style={styles.relationshipProfileStats}>
        <MiniStat label={locale === "en" ? "Journal" : "Günlük"} value={String(profile.journal_count)} />
        <MiniStat label={locale === "en" ? "Timing" : "Zaman"} value={timing?.sensitivity === "high" ? "yüksek" : "orta"} />
      </View>
      {loop ? <Text style={styles.relationshipLoopText}>{loop}</Text> : null}
    </Pressable>
  );
}

function RelationshipIntelligencePanel({
  profile,
  locale
}: {
  profile: {
    synastry?: { overall_score?: number; scores?: Record<string, number>; strengths?: string[]; risk_areas?: string[] };
    timing_context?: Record<string, unknown>;
    journal_count: number;
    last_context?: string;
  };
  locale: LocaleKey;
}) {
  const scores = profile.synastry?.scores ?? {};
  const timing = profile.timing_context as
    | {
        sensitivity?: string;
        loop_themes?: string[];
        suggested_tone?: string;
        do_not_do?: string;
        next_action?: string;
        sample_message?: string;
        transit_timing?: { pressure_score?: number };
      }
    | undefined;
  const scoreCards = [
    { label: locale === "en" ? "Emotional" : "Duygusal", value: scores.emotional_harmony },
    { label: locale === "en" ? "Mental" : "Zihinsel", value: scores.mental_flow },
    { label: locale === "en" ? "Romantic" : "Çekim", value: scores.romantic_pull },
    { label: locale === "en" ? "Long term" : "Uzun vade", value: scores.long_term_potential }
  ].filter((item) => typeof item.value === "number");

  return (
    <Section title={locale === "en" ? "Relationship intelligence panel" : "İlişki zekası paneli"}>
      {typeof profile.synastry?.overall_score === "number" ? (
        <View style={styles.bondSummaryCard}>
          <View style={styles.bondScoreRing}>
            <Text style={styles.bondScore}>{profile.synastry.overall_score}</Text>
            <Text style={styles.bondScoreLabel}>{locale === "en" ? "bond" : "bağ"}</Text>
          </View>
          <View style={styles.bondSummaryText}>
            <Text style={styles.bondSummaryTitle}>{locale === "en" ? "Bond profile" : "Bağ profili"}</Text>
            <Text style={styles.bondSummaryBody}>
              {locale === "en"
                ? "This score is not a verdict. It frames where attraction, safety, communication and friction meet."
                : "Bu skor hüküm değil. Çekim, güven, iletişim ve zorlanmanın nerede buluştuğunu çerçeveler."}
            </Text>
          </View>
        </View>
      ) : null}
      <View style={styles.intelligenceGrid}>
        {scoreCards.map((item) => (
          <View key={item.label} style={styles.intelligenceMetric}>
            <Text style={styles.intelligenceMetricLabel}>{item.label}</Text>
            <Text style={styles.intelligenceMetricValue}>{Math.round(Number(item.value))}</Text>
          </View>
        ))}
      </View>
      <View style={styles.coachCard}>
        <Text style={styles.coachTitle}>{locale === "en" ? "Today coach" : "Bugün ne yapmalı?"}</Text>
        <Text style={styles.coachBody}>
          {timing?.suggested_tone ??
            (locale === "en"
              ? "Run an analysis to unlock today's timing, message tone and what not to over-read."
              : "Bugünün zamanlaması, mesaj tonu ve neyi fazla okumaman gerektiği için analiz çalıştır.")}
        </Text>
        {timing?.do_not_do ? <Text style={styles.coachDoNot}>{timing.do_not_do}</Text> : null}
        {timing?.next_action ? <Text style={styles.coachAction}>{timing.next_action}</Text> : null}
        {timing?.sample_message ? (
          <View style={styles.sampleMessageBox}>
            <Text style={styles.sampleMessageLabel}>{locale === "en" ? "Message tone" : "Mesaj tonu"}</Text>
            <Text style={styles.sampleMessageText}>{timing.sample_message}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.loopCard}>
        <Text style={styles.loopTitle}>{locale === "en" ? "Memory loop" : "Hafıza döngüsü"}</Text>
        <Text style={styles.loopBody}>
          {timing?.loop_themes?.length
            ? timing.loop_themes.join(" / ")
            : locale === "en"
              ? `${profile.journal_count} journal entries will shape the next reading.`
              : `${profile.journal_count} günlük kaydı sonraki yorumu şekillendirir.`}
        </Text>
        {profile.last_context ? <Text style={styles.loopLastContext}>{profile.last_context}</Text> : null}
      </View>
    </Section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={styles.miniStatValue}>{value}</Text>
    </View>
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

function PartnerWheelPickerSheet({
  visible,
  mode,
  locale,
  monthLabels,
  birthDate,
  birthTime,
  onChangeDate,
  onChangeTime,
  onClose
}: {
  visible: boolean;
  mode?: PartnerPickerKind;
  locale: LocaleKey;
  monthLabels: string[];
  birthDate: string;
  birthTime: string;
  onChangeDate: (value: string) => void;
  onChangeTime: (value: string) => void;
  onClose: () => void;
}) {
  const date = parseDateKey(birthDate);
  const time = parseTimeKey(birthTime);
  const currentMonthDays = daysInMonth(date.year, date.monthIndex);
  const title =
    mode === "time"
      ? locale === "en"
        ? "Birth time"
        : "Doğum saati"
      : locale === "en"
        ? "Birth date"
        : "Doğum tarihi";

  function changeDate(next: Partial<typeof date>) {
    const year = next.year ?? date.year;
    const monthIndex = next.monthIndex ?? date.monthIndex;
    const day = Math.min(next.day ?? date.day, daysInMonth(year, monthIndex));
    onChangeDate(formatDateKey(year, monthIndex, day));
  }

  function changeTime(next: Partial<typeof time>) {
    onChangeTime(formatTimeKey(next.hour ?? time.hour, next.minute ?? time.minute));
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>{locale === "en" ? "Done" : "Tamam"}</Text>
            </Pressable>
          </View>
          {mode === "time" ? (
            <View style={styles.wheelColumns}>
              <WheelColumn
                label={locale === "en" ? "Hour" : "Saat"}
                options={numberRange(0, 23).map((value) => ({ label: String(value).padStart(2, "0"), value }))}
                value={time.hour}
                visible={visible}
                onSelect={(hour) => changeTime({ hour })}
              />
              <WheelColumn
                label={locale === "en" ? "Minute" : "Dakika"}
                options={numberRange(0, 59).map((value) => ({ label: String(value).padStart(2, "0"), value }))}
                value={time.minute}
                visible={visible}
                onSelect={(minute) => changeTime({ minute })}
              />
            </View>
          ) : (
            <View style={styles.wheelColumns}>
              <WheelColumn
                label={locale === "en" ? "Day" : "Gün"}
                options={numberRange(1, currentMonthDays).map((value) => ({ label: String(value), value }))}
                value={Math.min(date.day, currentMonthDays)}
                visible={visible}
                onSelect={(day) => changeDate({ day })}
              />
              <WheelColumn
                label={locale === "en" ? "Month" : "Ay"}
                options={monthLabels.map((label, value) => ({ label, value }))}
                value={date.monthIndex}
                visible={visible}
                onSelect={(monthIndex) => changeDate({ monthIndex })}
              />
              <WheelColumn
                label={locale === "en" ? "Year" : "Yıl"}
                options={numberRange(MIN_BIRTH_YEAR, new Date().getFullYear()).map((value) => ({ label: String(value), value }))}
                value={date.year}
                visible={visible}
                onSelect={(year) => changeDate({ year })}
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
    }, 70);
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
                style={styles.wheelOption}
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

function SelectionDropdown({
  label,
  helper,
  options,
  selectedValues,
  locale,
  expanded,
  multiple,
  onToggle,
  onChange
}: {
  id: string;
  label: string;
  helper?: string;
  options: SelectOption[];
  selectedValues: string[];
  locale: LocaleKey;
  expanded: boolean;
  multiple?: boolean;
  onToggle: () => void;
  onChange: (values: string[]) => void;
}) {
  const selectedLabels = getSelectedLabels(options, selectedValues, locale);
  const summary =
    selectedLabels.length > 2
      ? `${selectedLabels.slice(0, 2).join(", ")} +${selectedLabels.length - 2}`
      : selectedLabels.join(", ");

  function toggleValue(value: string) {
    if (!multiple) {
      onChange([value]);
      return;
    }

    const nextValues = selectedValues.includes(value)
      ? selectedValues.filter((selectedValue) => selectedValue !== value)
      : [...selectedValues, value];
    onChange(nextValues.length ? nextValues : [value]);
  }

  return (
    <View style={styles.selectWrap}>
      <Text style={styles.selectLabel}>{label}</Text>
      <Pressable style={[styles.selectTrigger, expanded && styles.selectTriggerActive]} onPress={onToggle}>
        <View style={styles.selectTriggerText}>
          <Text style={styles.selectValue}>{summary}</Text>
          {helper ? <Text style={styles.selectHelper}>{helper}</Text> : null}
        </View>
        <View style={styles.selectCountBadge}>
          <Text style={styles.selectCountText}>{selectedValues.length}</Text>
        </View>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={colors.accentGold} />
      </Pressable>

      {expanded ? (
        <View style={styles.selectMenu}>
          {options.map((option) => {
            const selected = selectedValues.includes(option.value);
            return (
              <Pressable key={option.value} style={[styles.selectOption, selected && styles.selectOptionActive]} onPress={() => toggleValue(option.value)}>
                <View style={[styles.optionIcon, selected && styles.optionIconActive]}>
                  <Ionicons name={selected ? "checkmark" : option.icon} size={16} color={selected ? colors.background : colors.accentTeal} />
                </View>
                <View style={styles.optionTextWrap}>
                  <Text style={[styles.optionLabel, selected && styles.optionLabelActive]}>{option.label[locale]}</Text>
                  {option.hint ? <Text style={styles.optionHint}>{option.hint[locale]}</Text> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function getSelectedLabels(options: SelectOption[], selectedValues: string[], locale: LocaleKey) {
  return selectedValues
    .map((selectedValue) => options.find((option) => option.value === selectedValue)?.label[locale])
    .filter((label): label is string => Boolean(label));
}

function extractRelationshipLoopThemes(
  entries: { event_text: string; mood?: string }[],
  currentContext: string,
  locale: "tr" | "en"
) {
  const text = [currentContext, ...entries.flatMap((entry) => [entry.event_text, entry.mood ?? ""])]
    .join(" ")
    .toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-US");
  const themes = [
    {
      label: locale === "en" ? "Late replies" : "Geç cevap",
      patterns: ["geç", "cevap", "late", "reply", "seen"]
    },
    {
      label: locale === "en" ? "Uncertainty" : "Belirsizlik",
      patterns: ["belirsiz", "netlik", "kafam", "uncertain", "clarity", "confused"]
    },
    {
      label: locale === "en" ? "Withdrawal" : "Geri çekilme",
      patterns: ["uzak", "soğuk", "geri çek", "mesafe", "distant", "cold", "withdraw"]
    },
    {
      label: locale === "en" ? "Conflict repair" : "Kırılma onarımı",
      patterns: ["tartış", "kırıl", "gergin", "conflict", "fight", "hurt"]
    },
    {
      label: locale === "en" ? "Meeting afterglow" : "Buluşma sonrası",
      patterns: ["buluş", "görüştük", "date", "meet", "after"]
    }
  ];
  const matched = themes.filter((theme) => theme.patterns.some((pattern) => text.includes(pattern))).map((theme) => theme.label);

  if (matched.length) return matched;
  return locale === "en" ? ["Timing", "Clarity", "Communication tone"] : ["Zamanlama", "Netlik", "İletişim tonu"];
}

function isPaymentRequiredLikeError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error ?? "");
  return /payment_required|required_credits|non-2xx|402/i.test(message);
}

function normalizeRelationshipKey(value: string) {
  return value.trim().toLocaleLowerCase("tr-TR").replace(/\s+/g, "_") || "unknown";
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(94,196,192,0.42)",
    backgroundColor: "#071A22",
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center"
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: featureColors.relationship.accent,
    backgroundColor: featureColors.relationship.surfaceDeep,
    alignItems: "center",
    justifyContent: "center"
  },
  heroText: {
    flex: 1,
    gap: 4
  },
  heroTitle: {
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "600"
  },
  heroBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  spinePanel: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.28)",
    backgroundColor: "#0B111D",
    padding: spacing.md,
    gap: spacing.sm
  },
  spineHeader: {
    gap: 4
  },
  spineEyebrow: {
    color: colors.accentGold,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  spineTitle: {
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "600"
  },
  spineGrid: {
    gap: spacing.sm
  },
  spineCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(94,196,192,0.22)",
    backgroundColor: "#071823",
    padding: spacing.md,
    gap: spacing.xs
  },
  spineCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  spineIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(94,196,192,0.36)",
    backgroundColor: "rgba(94,196,192,0.1)",
    alignItems: "center",
    justifyContent: "center"
  },
  spineStatus: {
    color: colors.accentGold,
    fontSize: 12,
    fontWeight: "900"
  },
  spineCardTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  spineCardBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  section: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  profileGrid: {
    gap: spacing.sm
  },
  relationshipProfileCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(94,196,192,0.22)",
    backgroundColor: "#091923",
    padding: spacing.md,
    gap: spacing.xs
  },
  relationshipProfileCardActive: {
    borderColor: colors.accentGold,
    backgroundColor: "#141827"
  },
  relationshipProfileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  relationshipProfileName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  relationshipScore: {
    minWidth: 38,
    textAlign: "center",
    color: colors.background,
    backgroundColor: colors.accentGold,
    borderRadius: 19,
    overflow: "hidden",
    paddingVertical: 5,
    fontSize: 14,
    fontWeight: "900"
  },
  relationshipProfileMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  relationshipProfileStats: {
    flexDirection: "row",
    gap: spacing.xs
  },
  miniStat: {
    minWidth: 72,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  miniStatLabel: {
    color: colors.faint,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  miniStatValue: {
    color: colors.accentTeal,
    fontSize: 13,
    fontWeight: "900"
  },
  relationshipLoopText: {
    color: colors.accentGold,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800"
  },
  bondSummaryCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.24)",
    backgroundColor: "#111723",
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  bondScoreRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: colors.accentGold,
    backgroundColor: "rgba(216,181,109,0.12)",
    alignItems: "center",
    justifyContent: "center"
  },
  bondScore: {
    color: colors.accentGold,
    fontSize: 24,
    fontWeight: "900"
  },
  bondScoreLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  bondSummaryText: {
    flex: 1,
    gap: 4
  },
  bondSummaryTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  bondSummaryBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  intelligenceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  intelligenceMetric: {
    width: "47%",
    minHeight: 72,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.22)",
    backgroundColor: "#101725",
    padding: spacing.sm,
    justifyContent: "space-between"
  },
  intelligenceMetricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  intelligenceMetricValue: {
    color: colors.accentGold,
    fontSize: 24,
    fontWeight: "900"
  },
  coachCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(94,196,192,0.28)",
    backgroundColor: "#071A22",
    padding: spacing.md,
    gap: spacing.xs
  },
  coachTitle: {
    color: colors.accentTeal,
    fontSize: 15,
    fontWeight: "900"
  },
  coachBody: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20
  },
  coachDoNot: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  coachAction: {
    color: colors.accentGold,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "900"
  },
  sampleMessageBox: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.22)",
    backgroundColor: "rgba(216,181,109,0.08)",
    padding: spacing.sm,
    gap: 3
  },
  sampleMessageLabel: {
    color: colors.accentGold,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  sampleMessageText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19
  },
  loopCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(224,122,168,0.24)",
    backgroundColor: "#180A12",
    padding: spacing.md,
    gap: spacing.xs
  },
  loopTitle: {
    color: featureColors.relationship.accent,
    fontSize: 15,
    fontWeight: "900"
  },
  loopBody: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20
  },
  loopLastContext: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  inputRow: {
    gap: spacing.sm
  },
  dateRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  timeSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  timeDivider: {
    color: colors.accentGold,
    fontSize: 28,
    fontWeight: "900"
  },
  selectorButton: {
    flex: 1,
    minHeight: 62,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.26)",
    backgroundColor: "#0B1020",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    justifyContent: "center",
    gap: 3
  },
  selectorButtonLabel: {
    color: colors.faint,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  selectorButtonValue: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900"
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
    borderColor: "rgba(216,181,109,0.26)",
    backgroundColor: "#0D1020",
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
    color: colors.accentGold,
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
    textAlign: "center",
    textTransform: "uppercase"
  },
  wheelWindow: {
    height: WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ITEMS,
    overflow: "hidden",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#070B17"
  },
  wheelSelectionBand: {
    position: "absolute",
    left: spacing.xs,
    right: spacing.xs,
    top: WHEEL_VERTICAL_PADDING,
    height: WHEEL_ITEM_HEIGHT,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.accentGold,
    backgroundColor: "rgba(216,181,109,0.14)"
  },
  wheelContent: {
    paddingVertical: WHEEL_VERTICAL_PADDING
  },
  wheelOption: {
    height: WHEEL_ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center"
  },
  wheelOptionText: {
    color: colors.muted,
    fontSize: 18,
    fontWeight: "900"
  },
  wheelOptionTextActive: {
    color: colors.accentGold,
    fontSize: 22
  },
  selectWrap: {
    gap: spacing.xs
  },
  selectLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  selectTrigger: {
    minHeight: 58,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "#121020",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  selectTriggerActive: {
    borderColor: colors.accentGold,
    backgroundColor: "#15121E"
  },
  selectTriggerText: {
    flex: 1,
    gap: 3
  },
  selectValue: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900"
  },
  selectHelper: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17
  },
  selectCountBadge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.38)",
    backgroundColor: "rgba(216,181,109,0.12)",
    alignItems: "center",
    justifyContent: "center"
  },
  selectCountText: {
    color: colors.accentGold,
    fontSize: 12,
    fontWeight: "900"
  },
  selectMenu: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.28)",
    backgroundColor: "#0B1020",
    overflow: "hidden"
  },
  selectOption: {
    minHeight: 58,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  selectOptionActive: {
    backgroundColor: "rgba(216,181,109,0.12)"
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(94,196,192,0.28)",
    backgroundColor: "rgba(94,196,192,0.08)",
    alignItems: "center",
    justifyContent: "center"
  },
  optionIconActive: {
    borderColor: colors.accentGold,
    backgroundColor: colors.accentGold
  },
  optionTextWrap: {
    flex: 1,
    gap: 3
  },
  optionLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  optionLabelActive: {
    color: colors.accentGold
  },
  optionHint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17
  },
  toggle: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  toggleActive: {
    borderColor: colors.accentGold,
    backgroundColor: "rgba(216,181,109,0.72)"
  },
  toggleText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800"
  },
  toggleTextActive: {
    color: colors.background
  },
  note: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  placeOption: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: spacing.sm,
    gap: 4
  },
  placeOptionActive: {
    borderColor: colors.accentGold,
    backgroundColor: "rgba(216,181,109,0.18)"
  },
  placeTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  placeMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  journalList: {
    gap: 8
  },
  journalItem: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(94,196,192,0.24)",
    backgroundColor: "#081823",
    padding: spacing.sm,
    gap: 4
  },
  journalMood: {
    color: featureColors.relationship.accent,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  journalText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  },
  readinessCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.38)",
    backgroundColor: "#111723",
    padding: spacing.md,
    gap: 5
  },
  readinessTitle: {
    color: colors.accentGold,
    fontSize: 15,
    fontWeight: "900"
  },
  readinessBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  quickTimingCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(94,196,192,0.34)",
    backgroundColor: "#071C22",
    padding: spacing.md,
    gap: spacing.sm
  },
  quickTimingCardActive: {
    borderColor: colors.accentTeal,
    shadowColor: colors.accentTeal,
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },
  quickTimingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  quickTimingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(94,196,192,0.45)",
    backgroundColor: "rgba(94,196,192,0.12)",
    alignItems: "center",
    justifyContent: "center"
  },
  quickTimingText: {
    flex: 1,
    gap: 3
  },
  quickTimingEyebrow: {
    color: colors.accentTeal,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  quickTimingTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 23
  },
  quickTimingBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  },
  quickTimingMeta: {
    color: colors.accentGold,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.4
  },
  analysisChoice: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.22)",
    backgroundColor: "#0D1420",
    padding: spacing.md
  },
  analysisChoiceText: {
    gap: 4
  },
  analysisChoiceTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  analysisChoiceBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  analysisChoiceMeta: {
    color: colors.accentTeal,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "900"
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 19
  },
  weeklyCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: featureColors.relationship.accent,
    backgroundColor: featureColors.relationship.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  weeklyTextBlock: {
    gap: spacing.xs
  },
  weeklyEyebrow: {
    color: featureColors.relationship.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4
  },
  weeklyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23
  },
  weeklyBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  },
  weeklyMeta: {
    color: colors.accentTeal,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
    marginTop: 4
  },
  weeklyError: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4
  }
});
