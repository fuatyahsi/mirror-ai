import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackButton } from "@/components/layout/BackButton";
import { TextField } from "@/components/forms/TextField";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { useAuthStore } from "@/stores/useAuthStore";
import { colors } from "@/theme";

export default function LoginScreen() {
  const { signIn, isLoading, error } = useAuthStore();
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
        eyebrow="Giriş"
        title="Mirror AI hesabına dön"
        subtitle="Supabase bilgileri tanımlı değilse bu ekran mock oturumla devam eder."
      />
      <TextField
        label="E-posta"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextField label="Şifre" secureTextEntry value={password} onChangeText={setPassword} />
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      <PrimaryButton disabled={isLoading || !email || !password} onPress={submit}>
        Giriş yap
      </PrimaryButton>
      <PrimaryButton variant="ghost" onPress={() => router.push("/auth/register")}>
        Hesap oluştur
      </PrimaryButton>
    </Screen>
  );
}
