import { router, type Href } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { InsightCard } from "@/components/cards/InsightCard";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { PaywallPreview } from "@/components/paywall/PaywallPreview";
import { deleteUserData } from "@/features/privacy/accountData";
import { LanguageSwitch } from "@/components/settings/LanguageSwitch";
import { useI18n } from "@/i18n";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";
import { colors, featureColors, radii, spacing } from "@/theme";

export default function ProfileScreen() {
  const signOut = useAuthStore((state) => state.signOut);
  const profile = useUserStore((state) => state.profile);
  const feedback = useUserStore((state) => state.feedback);
  const memoryEvents = useUserStore((state) => state.memoryEvents);
  const clearLocalUserData = useUserStore((state) => state.clearLocalUserData);
  const { t } = useI18n();
  const [isDeletingData, setIsDeletingData] = useState(false);

  async function handleDeleteData() {
    Alert.alert(t("profile.deleteDataTitle"), t("profile.deleteDataConfirm"), [
      { text: t("profile.cancel"), style: "cancel" },
      {
        text: t("profile.deleteData"),
        style: "destructive",
        onPress: () => {
          void performDeleteData();
        }
      }
    ]);
  }

  async function performDeleteData() {
    setIsDeletingData(true);
    try {
      await deleteUserData("data");
      clearLocalUserData();
      Alert.alert(t("profile.deleteDataDoneTitle"), t("profile.deleteDataDone"));
    } catch (error) {
      Alert.alert(
        t("profile.deleteDataErrorTitle"),
        error instanceof Error ? error.message : t("profile.deleteDataError")
      );
    } finally {
      setIsDeletingData(false);
    }
  }

  return (
    <Screen>
      <PageHeader
        eyebrow={t("profile.eyebrow")}
        title={profile.mystic_profile?.profile_title || t("profile.titleFallback")}
        subtitle={profile.mystic_profile?.profile_summary || t("profile.subtitleFallback")}
      />
      <View style={styles.stats}>
        <Stat label={t("profile.credits")} value={profile.credits} />
        <Stat label={t("profile.feedback")} value={feedback.length} />
        <Stat label={t("profile.memory")} value={memoryEvents.length} />
      </View>
      <InsightCard
        title={t("profile.birthInfo")}
        body={`${profile.birth.birth_city || t("profile.noCity")} / ${profile.birth.birth_date || t("profile.noDate")}`}
        actionLabel={t("profile.editBirthInfo")}
        accent
        onPress={() =>
          router.push({
            pathname: "/onboarding/birth-info",
            params: { returnTo: "/tabs/profile" }
          })
        }
      />
      <InsightCard
        title={t("profile.astrology")}
        body={
          profile.natal_chart
            ? t("profile.astrologyReady", {
                sun: profile.natal_chart.sun.sign_label,
                moon: profile.natal_chart.moon.sign_label,
                ascendant: profile.natal_chart.ascendant.sign_label
              })
            : t("profile.astrologyEmpty")
        }
      />
      <PrimaryButton variant="secondary" onPress={() => router.push("/tabs/astrology")}>
        {t("profile.openAstrology")}
      </PrimaryButton>
      <View style={styles.setting}>
        <LanguageSwitch />
        <Text style={styles.settingBody}>{t("profile.languageBody")}</Text>
      </View>
      <View style={styles.dataControl}>
        <InsightCard title={t("profile.dataControl")} body={t("profile.dataControlBody")} />
        <PrimaryButton variant="secondary" disabled={isDeletingData} onPress={handleDeleteData}>
          {isDeletingData ? t("profile.deletingData") : t("profile.deleteData")}
        </PrimaryButton>
      </View>
      <View style={styles.legalLinks}>
        <PrimaryButton variant="secondary" onPress={() => router.push("/legal/privacy" as Href)}>
          {t("profile.privacyPolicy")}
        </PrimaryButton>
        <PrimaryButton variant="secondary" onPress={() => router.push("/legal/terms" as Href)}>
          {t("profile.terms")}
        </PrimaryButton>
      </View>
      <PaywallPreview />
      <PrimaryButton variant="secondary" onPress={() => void signOut()}>
        {t("profile.signOut")}
      </PrimaryButton>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: "row",
    gap: spacing.sm
  },
  stat: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: featureColors.profile.accent,
    backgroundColor: featureColors.profile.surface,
    padding: spacing.md,
    gap: spacing.xs
  },
  statValue: {
    color: featureColors.profile.accent,
    fontSize: 24,
    fontWeight: "900"
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12
  },
  setting: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: spacing.md,
    gap: spacing.sm
  },
  settingBody: {
    color: colors.muted,
    lineHeight: 21
  },
  dataControl: {
    gap: spacing.sm
  },
  legalLinks: {
    gap: spacing.sm
  }
});
