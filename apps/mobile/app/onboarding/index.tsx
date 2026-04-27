import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { MirrorMark } from "@/components/brand/MirrorMark";
import { InsightCard } from "@/components/cards/InsightCard";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { LanguageSwitch } from "@/components/settings/LanguageSwitch";
import { useI18n } from "@/i18n";
import { useAuthStore } from "@/stores/useAuthStore";
import { colors, spacing } from "@/theme";

export default function OnboardingStartScreen() {
  const continueAsGuest = useAuthStore((state) => state.continueAsGuest);
  const { t } = useI18n();

  function start() {
    continueAsGuest();
    router.push("/onboarding/birth-info");
  }

  return (
    <Screen>
      <View style={styles.brandWrap}>
        <MirrorMark size={58} />
        <Text style={styles.brand}>Mirror AI</Text>
        <LanguageSwitch compact />
      </View>
      <PageHeader
        eyebrow={t("onboarding.eyebrow")}
        title={t("onboarding.title")}
        subtitle={t("onboarding.subtitle")}
      />
      <InsightCard title={t("onboarding.firstStepTitle")} body={t("onboarding.firstStepBody")} />
      <InsightCard title={t("onboarding.noCertaintyTitle")} body={t("onboarding.noCertaintyBody")} />
      <View style={styles.actions}>
        <PrimaryButton onPress={start}>{t("onboarding.start")}</PrimaryButton>
        <PrimaryButton variant="secondary" onPress={() => router.push("/auth/login")}>
          {t("onboarding.haveAccount")}
        </PrimaryButton>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandWrap: {
    minHeight: 176,
    justifyContent: "center",
    gap: spacing.sm
  },
  brand: {
    color: colors.text,
    fontFamily: "serif",
    fontSize: 42,
    fontWeight: "400",
    letterSpacing: 0
  },
  actions: {
    marginTop: "auto",
    gap: spacing.sm
  }
});
