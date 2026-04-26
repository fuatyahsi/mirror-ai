import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { InsightCard } from "@/components/cards/InsightCard";
import { useAuthStore } from "@/stores/useAuthStore";
import { colors, spacing } from "@/theme";

export default function OnboardingStartScreen() {
  const continueAsGuest = useAuthStore((state) => state.continueAsGuest);

  function start() {
    continueAsGuest();
    router.push("/onboarding/birth-info");
  }

  return (
    <Screen>
      <View style={styles.brandWrap}>
        <Text style={styles.brand}>Mirror AI</Text>
      </View>
      <PageHeader
        eyebrow="Kişisel hafızalı içgörü"
        title="Seni hatırlayan spiritüel asistan"
        subtitle="Tarot, kahve falı, ilişki analizi ve günlük içgörüleri kişisel profilinle birlikte yorumlayan sakin bir alan."
      />
      <InsightCard
        title="İlk adım: mistik profil"
        body="Kısa bir doğum bilgisi ve davranış döngüsü testiyle yorum stilini kişiselleştireceğiz."
      />
      <InsightCard
        title="Kesin kehanet yok"
        body="Mirror AI sonuçları sembolik ve farkındalık amaçlı sunar; karar hakkını her zaman sende bırakır."
      />
      <View style={styles.actions}>
        <PrimaryButton onPress={start}>Başla</PrimaryButton>
        <PrimaryButton variant="secondary" onPress={() => router.push("/auth/login")}>
          Zaten hesabım var
        </PrimaryButton>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandWrap: {
    minHeight: 92,
    justifyContent: "center"
  },
  brand: {
    color: colors.text,
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 0
  },
  actions: {
    marginTop: "auto",
    gap: spacing.sm
  }
});

