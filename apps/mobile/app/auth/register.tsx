import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { TextField } from "@/components/forms/TextField";
import { BackButton } from "@/components/layout/BackButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { useI18n } from "@/i18n";
import { useAuthStore } from "@/stores/useAuthStore";
import { colors } from "@/theme";

export default function RegisterScreen() {
  const { register, isLoading, error } = useAuthStore();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    await register(email, password);
    router.replace("/onboarding/birth-info");
  }

  return (
    <Screen>
      <BackButton fallbackHref="/onboarding" />
      <PageHeader
        eyebrow={t("auth.registerEyebrow")}
        title={t("auth.registerTitle")}
        subtitle={t("auth.registerSubtitle")}
      />
      <TextField
        label={t("common.email")}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextField label={t("common.password")} secureTextEntry value={password} onChangeText={setPassword} />
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      <PrimaryButton disabled={isLoading || !email || password.length < 8} onPress={submit}>
        {t("auth.createAccount")}
      </PrimaryButton>
      <PrimaryButton variant="ghost" onPress={() => router.back()}>
        {t("auth.goBack")}
      </PrimaryButton>
    </Screen>
  );
}
