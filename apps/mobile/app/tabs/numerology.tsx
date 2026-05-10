import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { InsightCard } from "@/components/cards/InsightCard";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { TextField } from "@/components/forms/TextField";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { SubtlePremiumOffer } from "@/components/paywall/SubtlePremiumOffer";
import {
  calculateNumerologyReport,
  type NumerologyCard
} from "@/features/numerology/calculate";
import { generateNumerologyReading } from "@/features/numerology/api";
import { useI18n } from "@/i18n";
import { useUserStore } from "@/stores/useUserStore";
import { colors, featureColors, radii, spacing, typography } from "@/theme";

export default function NumerologyScreen() {
  const profile = useUserStore((state) => state.profile);
  const memoryEvents = useUserStore((state) => state.memoryEvents);
  const addReading = useUserStore((state) => state.addReading);
  const { locale } = useI18n();
  const localeKey = locale === "en" ? "en" : "tr";
  const [name, setName] = useState(profile.display_name ?? "");
  const [savedReadingId, setSavedReadingId] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const birthDate = profile.birth.birth_date;

  const report = useMemo(() => {
    if (!birthDate) return undefined;
    try {
      return calculateNumerologyReport({
        birthDate,
        name,
        locale: localeKey,
        profile: profile.mystic_profile,
        natalChart: profile.natal_chart
      });
    } catch {
      return undefined;
    }
  }, [birthDate, localeKey, name, profile.mystic_profile, profile.natal_chart]);

  async function saveReading() {
    if (savedReadingId) {
      router.push(`/readings/${savedReadingId}`);
      return;
    }

    if (!report || !birthDate) return;
    setIsSaving(true);
    setErrorMessage(undefined);
    try {
      const reading = await generateNumerologyReading({
        birthDate,
        name,
        profile: profile.mystic_profile,
        memory: memoryEvents,
        natalChart: profile.natal_chart,
        locale,
        deep: false
      });
      addReading(reading);
      setSavedReadingId(reading.id);
      router.push(`/readings/${reading.id}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : locale === "en"
            ? "Reading could not be saved."
            : "Yorum kaydedilemedi."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!birthDate) {
    return (
      <Screen>
        <PageHeader
          eyebrow={locale === "en" ? "NUMEROLOGY" : "NUMEROLOJİ"}
          title={locale === "en" ? "Numbers need your birth date" : "Sayılar doğum tarihinle başlar"}
          subtitle={
            locale === "en"
              ? "Enter birth details first so Mirror AI can calculate your life path, personal year and timing numbers."
              : "Önce doğum bilgilerini gir; Mirror AI yaşam yolu, kişisel yıl ve zamanlama sayılarını bununla hesaplar."
          }
        />
        <InsightCard
          title={locale === "en" ? "Birth context missing" : "Doğum bağlamı eksik"}
          body={
            locale === "en"
              ? "Numerology uses your birth date as the main reference. You can add name vibration after that."
              : "Numerolojide ana referans doğum tarihidir. Sonrasında isim titreşimini de ekleyebilirsin."
          }
        />
        <PrimaryButton onPress={() => router.push("/onboarding/birth-info")}>
          {locale === "en" ? "Enter birth details" : "Doğum bilgilerini gir"}
        </PrimaryButton>
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeader
        eyebrow={locale === "en" ? "NUMEROLOGY" : "NUMEROLOJİ"}
        title={locale === "en" ? "Your number mirror" : "Sayı aynan"}
        subtitle={
          locale === "en"
            ? "Life path, day tone, first reaction style and personal year are read with your Mirror AI profile."
            : "Yaşam yolu, doğum günü tonu, ilk tepki stili ve kişisel yıl Mirror AI profilinle birlikte okunur."
        }
      />

      <View style={styles.heroCard}>
        <View style={styles.heroIcon}>
          <Ionicons name="keypad-outline" size={24} color={featureColors.numerology.accent} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>
            {locale === "en" ? "Symbolic, not deterministic." : "Sembolik, kaderci değil."}
          </Text>
          <Text style={styles.heroBody}>
            {locale === "en"
              ? "Numbers are used as reflective patterns, then filtered through your profile and birth context."
              : "Sayılar sabit hüküm gibi değil, profilin ve doğum bağlamın içinden geçen farkındalık örüntüleri gibi okunur."}
          </Text>
        </View>
      </View>

      <View style={styles.inputCard}>
        <TextField
          label={locale === "en" ? "Name for vibration analysis" : "İsim titreşimi için ad"}
          value={name}
          onChangeText={(value) => {
            setName(value);
            setSavedReadingId(undefined);
          }}
          placeholder={locale === "en" ? "Optional" : "Opsiyonel"}
        />
        <Text style={styles.note}>
          {locale === "en"
            ? `Birth date reference: ${birthDate}`
            : `Doğum tarihi referansı: ${birthDate}`}
        </Text>
      </View>

      {report ? (
        <>
          <View style={styles.numberGrid}>
            {report.cards
              .filter((card) => card.key !== "profile_bridge")
              .slice(0, 5)
              .map((card) => (
                <NumberCard key={card.key} card={card} />
              ))}
          </View>

          {report.cards.map((card) => (
            <InterpretationCard key={card.key} card={card} locale={localeKey} />
          ))}

          <SubtlePremiumOffer feature="deep_numerology" />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <PrimaryButton disabled={isSaving} onPress={saveReading}>
            {isSaving
              ? locale === "en"
                ? "Preparing reading..."
                : "Yorum hazırlanıyor..."
              : savedReadingId
              ? locale === "en"
                ? "Open saved reading"
                : "Kayıtlı yorumu aç"
              : locale === "en"
                ? "Save as reading"
                : "Yorum olarak kaydet"}
          </PrimaryButton>
        </>
      ) : (
        <InsightCard
          title={locale === "en" ? "Could not calculate" : "Hesaplanamadı"}
          body={locale === "en" ? "Check your birth date format." : "Doğum tarihi formatını kontrol et."}
        />
      )}
    </Screen>
  );
}

function NumberCard({ card }: { card: NumerologyCard }) {
  return (
    <View style={styles.numberCard}>
      <Text style={styles.numberLabel}>{card.label}</Text>
      <Text style={styles.numberValue}>{card.value}</Text>
    </View>
  );
}

function InterpretationCard({ card, locale }: { card: NumerologyCard; locale: "tr" | "en" }) {
  return (
    <View style={styles.interpretationCard}>
      <View style={styles.cardTitleRow}>
        <Text style={styles.cardTitle}>{card.label}</Text>
        <Text style={styles.cardValue}>{card.value}</Text>
      </View>
      <Text style={styles.cardBody}>{card.summary}</Text>
      <Text style={styles.cardAdvice}>{card.advice}</Text>
      <View style={styles.referenceBlock}>
        <Text style={styles.referenceTitle}>{locale === "en" ? "References" : "Referanslar"}</Text>
        {card.references.slice(0, 4).map((reference) => (
          <Text key={reference} style={styles.referenceItem}>
            {reference}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(232,168,124,0.42)",
    backgroundColor: "#160F14",
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
    borderColor: featureColors.numerology.accent,
    backgroundColor: featureColors.numerology.surfaceDeep,
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
  inputCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  note: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  numberGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  numberCard: {
    width: "48%",
    minHeight: 94,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(232,168,124,0.42)",
    backgroundColor: "#11131E",
    padding: spacing.md,
    justifyContent: "space-between"
  },
  numberLabel: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800"
  },
  numberValue: {
    color: featureColors.numerology.accent,
    fontSize: 30,
    fontWeight: "900"
  },
  interpretationCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  cardTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900"
  },
  cardValue: {
    color: featureColors.numerology.accent,
    fontSize: 20,
    fontWeight: "900"
  },
  cardBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 21
  },
  cardAdvice: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "700"
  },
  referenceBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    gap: spacing.xs
  },
  referenceTitle: {
    color: colors.accentGold,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  referenceItem: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 19
  }
});
