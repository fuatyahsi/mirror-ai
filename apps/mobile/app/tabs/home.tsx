import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MirrorMark } from "@/components/brand/MirrorMark";
import { InsightCard } from "@/components/cards/InsightCard";
import { ReadingCard } from "@/components/cards/ReadingCard";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { SubtlePremiumOffer } from "@/components/paywall/SubtlePremiumOffer";
import { generateDailySkyReading } from "@/features/dailySky/api";
import {
  disableDailySkyNotifications,
  registerDailySkyNotifications
} from "@/features/notifications/dailySkyNotifications";
import { useI18n } from "@/i18n";
import { useUserStore } from "@/stores/useUserStore";
import { colors, featureColors, radii, spacing } from "@/theme";
import type { ReadingOutput } from "@/types/readings";

export default function HomeScreen() {
  const profile = useUserStore((state) => state.profile);
  const readings = useUserStore((state) => state.readings);
  const memoryEvents = useUserStore((state) => state.memoryEvents);
  const addReading = useUserStore((state) => state.addReading);
  const dailySkyNotifications = useUserStore((state) => state.dailySkyNotifications);
  const setDailySkyNotifications = useUserStore((state) => state.setDailySkyNotifications);
  const { locale, t } = useI18n();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [generationError, setGenerationError] = useState<string>();
  const hasPersonalProfile = Boolean(profile.mystic_profile);
  const score = profile.mystic_profile;
  const energyValue = score ? Math.round((score.intuitive_openness + score.emotional_intensity) / 2) : 64;
  const clarityValue = score ? Math.round((score.uncertainty_tolerance + score.rationality_need) / 2) : 58;
  const latestReadings = getLatestReadingsByType(readings).slice(0, 4);

  async function createDaily() {
    setIsGenerating(true);
    setGenerationError(undefined);
    try {
      const reading = await generateDailySkyReading({
        topic: locale === "en" ? "daily sky and relationships" : "günlük gökyüzü ve ilişkiler",
        mood: "calm",
        question:
          locale === "en"
            ? "What should I notice in today's sky, especially in relationships?"
            : "Bugünün gökyüzünde özellikle ilişkiler için neyi fark etmeliyim?",
        profile: profile.mystic_profile,
        memory: memoryEvents,
        natalChart: profile.natal_chart,
        locale,
        timezone: profile.birth.timezone
      });
      addReading(reading);
      router.push(`/readings/${reading.id}`);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : t("home.dailyError"));
    } finally {
      setIsGenerating(false);
    }
  }

  async function toggleDailyNotifications() {
    setIsUpdatingNotifications(true);
    setGenerationError(undefined);
    try {
      if (dailySkyNotifications.enabled) {
        await disableDailySkyNotifications(dailySkyNotifications.expoPushToken);
        setDailySkyNotifications({ enabled: false, remoteRegistered: false });
      } else {
        const result = await registerDailySkyNotifications({
          locale,
          timezone: profile.birth.timezone,
          dailyHour: dailySkyNotifications.dailyHour
        });
        setDailySkyNotifications({
          enabled: result.enabled,
          expoPushToken: result.expoPushToken,
          remoteRegistered: result.remoteRegistered
        });

        if (!result.enabled) {
          setGenerationError(
            locale === "en"
              ? "Notification permission was not granted."
              : "Bildirim izni verilmedi."
          );
        }
      }
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : t("home.dailyError"));
    } finally {
      setIsUpdatingNotifications(false);
    }
  }

  return (
    <Screen>
      <View style={styles.heroPanel}>
        <View style={styles.heroRow}>
          <View style={styles.heroText}>
            <PageHeader eyebrow={t("home.eyebrow")} title={t("home.title")} subtitle={t("home.subtitle")} />
          </View>
          <MirrorMark size={54} />
        </View>
        <View style={styles.metricRow}>
          <MetricCard
            label={locale === "en" ? "Personal tone" : "Kişisel ton"}
            value={profile.mystic_profile?.profile_title || (locale === "en" ? "Calibrating" : "Kalibre ediliyor")}
            icon="sparkles-outline"
            color={featureColors.daily.accent}
          />
          <MetricCard
            label={locale === "en" ? "Memory" : "Hafıza"}
            value={`${memoryEvents.length}`}
            icon="bookmark-outline"
            color={colors.accentTeal}
            compact
          />
        </View>
      </View>

      <View style={styles.energyGrid}>
        <SmallMetric title={locale === "en" ? "Intuitive energy" : "Sezgisel enerji"} value={energyValue} />
        <SmallMetric title={locale === "en" ? "Clarity need" : "Netlik ihtiyacı"} value={clarityValue} />
      </View>

      <InsightCard
        meta={profile.mystic_profile?.profile_title || t("home.energyMeta")}
        title={locale === "en" ? "Daily Sky Mirror" : "Günlük Gökyüzü Aynası"}
        body={
          locale === "en"
            ? "A personal daily reading that combines your natal chart, today's sky, profile, and memory signals."
            : "Doğum haritanı, bugünün gökyüzünü, profilini ve hafıza sinyallerini birleştiren kişisel günlük yorum."
        }
        accent
      />

      {!hasPersonalProfile ? (
        <>
          <InsightCard title={t("home.profileNeededTitle")} body={t("home.profileNeededBody")} />
          <PrimaryButton
            onPress={() => router.push(profile.birth.birth_date ? "/onboarding/profile-quiz" : "/onboarding/birth-info")}
          >
            {t("home.profileNeededButton")}
          </PrimaryButton>
        </>
      ) : (
        <>
          <PrimaryButton disabled={isGenerating} onPress={createDaily}>
            {isGenerating
              ? t("common.loadingMirror")
              : locale === "en"
                ? "Open today’s sky reading"
                : "Bugünün gökyüzü yorumunu aç"}
          </PrimaryButton>
          <NotificationCard
            enabled={dailySkyNotifications.enabled}
            remoteRegistered={dailySkyNotifications.remoteRegistered}
            isUpdating={isUpdatingNotifications}
            locale={locale}
            onPress={toggleDailyNotifications}
          />
          <SubtlePremiumOffer feature="daily_timing" compact />
        </>
      )}

      {generationError ? <InsightCard title={t("home.generationErrorTitle")} body={generationError} /> : null}

      <Text style={styles.sectionTitle}>{locale === "en" ? "Insight modules" : "İçgörü modülleri"}</Text>
      <View style={styles.actions}>
        <QuickAction
          title={t("home.quickCoffee")}
          subtitle={locale === "en" ? "Cup symbols" : "Fincan sembolleri"}
          icon="cafe-outline"
          palette={featureColors.coffee}
          onPress={() => router.push("/tabs/coffee")}
        />
        <QuickAction
          title={t("home.quickTarot")}
          subtitle={locale === "en" ? "Question spread" : "Soru açılımı"}
          icon="albums-outline"
          palette={featureColors.tarot}
          onPress={() => router.push("/tabs/tarot")}
        />
        <QuickAction
          title={locale === "en" ? "Numerology" : "Numeroloji"}
          subtitle={locale === "en" ? "Life path" : "Yaşam yolu"}
          icon="keypad-outline"
          palette={featureColors.numerology}
          onPress={() => router.push("/tabs/numerology" as Href)}
        />
        <QuickAction
          title={t("home.quickAstrology")}
          subtitle={locale === "en" ? "Natal context" : "Natal bağlam"}
          icon="planet-outline"
          palette={featureColors.astrology}
          onPress={() => router.push("/tabs/astrology")}
        />
        <QuickAction
          title={t("home.quickRelationship")}
          subtitle={locale === "en" ? "Pattern mirror" : "Döngü aynası"}
          icon="heart-outline"
          palette={featureColors.relationship}
          wide
          onPress={() => router.push("/tabs/relationship")}
        />
      </View>

      <Text style={styles.sectionTitle}>{t("home.recent")}</Text>
      {latestReadings.length === 0 ? (
        <InsightCard title={t("home.noReadingsTitle")} body={t("home.noReadingsBody")} />
      ) : (
        latestReadings.map((reading) => <ReadingCard key={reading.id} reading={reading} />)
      )}
    </Screen>
  );
}

function getLatestReadingsByType(readings: ReadingOutput[]) {
  const latestByType = new Map<string, ReadingOutput>();

  [...readings]
    .sort((first, second) => readingTimestamp(second) - readingTimestamp(first))
    .forEach((reading) => {
      if (!latestByType.has(reading.reading_type)) {
        latestByType.set(reading.reading_type, reading);
      }
    });

  return Array.from(latestByType.values()).sort(
    (first, second) => readingTimestamp(second) - readingTimestamp(first)
  );
}

function readingTimestamp(reading: ReadingOutput) {
  const timestamp = Date.parse(reading.created_at);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function MetricCard({
  label,
  value,
  icon,
  color,
  compact
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  compact?: boolean;
}) {
  return (
    <View style={[styles.metricCard, compact && styles.metricCardCompact]}>
      <View style={[styles.iconCircle, { borderColor: color }]}>
        <Ionicons name={icon} color={color} size={17} />
      </View>
      <View style={styles.metricTextWrap}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text numberOfLines={compact ? 1 : 2} style={styles.metricValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function SmallMetric({ title, value }: { title: string; value: number }) {
  return (
    <View style={styles.smallMetric}>
      <Text style={styles.smallMetricTitle}>{title}</Text>
      <Text style={styles.smallMetricValue}>{value}</Text>
    </View>
  );
}

function NotificationCard({
  enabled,
  remoteRegistered,
  isUpdating,
  locale,
  onPress
}: {
  enabled: boolean;
  remoteRegistered?: boolean;
  isUpdating: boolean;
  locale: string;
  onPress: () => void;
}) {
  const title = locale === "en" ? "Daily reminder" : "Günlük bildirim";
  const body =
    locale === "en"
      ? "Send a gentle reminder at 09:00. Free users can open the short daily reading; premium can later unlock deeper transit timing."
      : "Her gün 09:00’da sakin bir hatırlatma gönderir. Ücretsiz kullanıcı kısa günlük yorumu açar; premium’da daha derin transit zamanlaması açılabilir.";
  const status = enabled
    ? remoteRegistered
      ? locale === "en"
        ? "Push active"
        : "Push aktif"
      : locale === "en"
        ? "Local reminder active"
        : "Yerel hatırlatma aktif"
    : locale === "en"
      ? "Off"
      : "Kapalı";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isUpdating}
      style={({ pressed }) => [styles.notificationCard, pressed && styles.pressed]}
    >
      <View style={styles.notificationIcon}>
        <Ionicons name={enabled ? "notifications" : "notifications-outline"} color={colors.accentGold} size={22} />
      </View>
      <View style={styles.notificationText}>
        <Text style={styles.notificationTitle}>{title}</Text>
        <Text style={styles.notificationBody}>{body}</Text>
        <Text style={styles.notificationStatus}>{isUpdating ? (locale === "en" ? "Updating" : "Güncelleniyor") : status}</Text>
      </View>
      <Ionicons name={enabled ? "toggle" : "toggle-outline"} color={enabled ? colors.success : colors.faint} size={34} />
    </Pressable>
  );
}

function QuickAction({
  title,
  subtitle,
  icon,
  palette,
  wide,
  onPress
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  palette: (typeof featureColors)[keyof typeof featureColors];
  wide?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.quick,
        wide && styles.quickWide,
        { backgroundColor: palette.surface, borderColor: palette.accent },
        pressed && styles.pressed
      ]}
    >
      <View style={[styles.quickIcon, { backgroundColor: palette.surfaceDeep, borderColor: palette.accent }]}>
        <Ionicons name={icon} color={palette.accent} size={21} />
      </View>
      <Text style={[styles.quickTitle, wide && styles.quickTextCentered]}>{title}</Text>
      <Text style={[styles.quickSubtitle, wide && styles.quickTextCentered]}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroPanel: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    gap: spacing.md
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md
  },
  heroText: {
    flex: 1
  },
  metricRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  metricCard: {
    flex: 1.7,
    minHeight: 74,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  metricCardCompact: {
    flex: 1
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface
  },
  metricTextWrap: {
    flex: 1,
    gap: 2
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700"
  },
  metricValue: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900"
  },
  energyGrid: {
    flexDirection: "row",
    gap: spacing.sm
  },
  smallMetric: {
    flex: 1,
    minHeight: 72,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: spacing.md,
    justifyContent: "space-between"
  },
  smallMetricTitle: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700"
  },
  smallMetricValue: {
    color: colors.accentGold,
    fontSize: 25,
    fontWeight: "900"
  },
  notificationCard: {
    minHeight: 112,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.36)",
    backgroundColor: "#101624",
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  notificationIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.5)",
    backgroundColor: "rgba(216,181,109,0.1)",
    alignItems: "center",
    justifyContent: "center"
  },
  notificationText: {
    flex: 1,
    gap: 4
  },
  notificationTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  notificationBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  notificationStatus: {
    color: colors.accentTeal,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  quick: {
    width: "48%",
    minHeight: 132,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: 9
  },
  quickWide: {
    width: "100%",
    minHeight: 116,
    alignItems: "center",
    justifyContent: "center"
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  quickTitle: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900"
  },
  quickSubtitle: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17
  },
  quickTextCentered: {
    textAlign: "center"
  },
  pressed: {
    opacity: 0.82
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
    marginTop: spacing.sm
  }
});
