import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { TextField } from "@/components/forms/TextField";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { useAuthStore } from "@/stores/useAuthStore";
import { colors } from "@/theme";

export default function RegisterScreen() {
  const { register, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    await register(email, password);
    router.replace("/onboarding/birth-info");
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="Kayıt"
        title="Kişisel hafızanı başlat"
        subtitle="Gerçek Supabase projesi bağlanınca kayıt ve oturum kalıcı hale gelir."
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
      <PrimaryButton disabled={isLoading || !email || password.length < 8} onPress={submit}>
        Hesap oluştur
      </PrimaryButton>
      <PrimaryButton variant="ghost" onPress={() => router.back()}>
        Geri dön
      </PrimaryButton>
    </Screen>
  );
}

