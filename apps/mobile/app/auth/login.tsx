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

export default function LoginScreen() {
  const { signIn, isLoading, error } = useAuthStore();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    await signIn(email, password);
    router.replace("/tabs/home");
  }

  return (
    <Screen>
      <BackButton fallbackHref="/onboarding" />
      <PageHeader
        eyebrow={t("auth.loginEyebrow")}
        title={t("auth.loginTitle")}
        subtitle={t("auth.loginSubtitle")}
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
      <PrimaryButton disabled={isLoading || !email || !password} onPress={submit}>
        {t("auth.loginButton")}
      </PrimaryButton>
      <PrimaryButton variant="ghost" onPress={() => router.push("/auth/register")}>
        {t("auth.createAccount")}
      </PrimaryButton>
    </Screen>
  );
}
