import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { InsightCard } from "@/components/cards/InsightCard";
import { PaywallPreview } from "@/components/paywall/PaywallPreview";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";
import { colors, radii, spacing } from "@/theme";

export default function ProfileScreen() {
  const signOut = useAuthStore((state) => state.signOut);
  const profile = useUserStore((state) => state.profile);
  const feedback = useUserStore((state) => state.feedback);
  const memoryEvents = useUserStore((state) => state.memoryEvents);

  return (
    <Screen>
      <PageHeader
        eyebrow="Profil"
        title={profile.mystic_profile?.profile_title || "Mirror profilin"}
        subtitle={profile.mystic_profile?.profile_summary || "Onboarding tamamlandığında profil özeti burada görünür."}
      />
      <View style={styles.stats}>
        <Stat label="Kredi" value={profile.credits} />
        <Stat label="Feedback" value={feedback.length} />
        <Stat label="Hafıza" value={memoryEvents.length} />
      </View>
      <InsightCard
        title="Doğum bilgileri"
        body={`${profile.birth.birth_city || "Şehir yok"} / ${profile.birth.birth_date || "Tarih yok"}`}
      />
      <InsightCard
        title="Veri kontrolü"
        body="Veri silme talebi ve profil dışa aktarma akışları Supabase bağlantısından sonra etkinleştirilecek."
      />
      <PaywallPreview />
      <PrimaryButton variant="secondary" onPress={() => void signOut()}>
        Çıkış yap
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
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs
  },
  statValue: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: "900"
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12
  }
});

