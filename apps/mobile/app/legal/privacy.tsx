import { Text } from "react-native";
import { BackButton } from "@/components/layout/BackButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { useI18n } from "@/i18n";
import { colors } from "@/theme";

export default function PrivacyPolicyScreen() {
  const { locale } = useI18n();
  const isEn = locale === "en";

  return (
    <Screen>
      <BackButton fallbackHref="/tabs/profile" />
      <PageHeader
        eyebrow={isEn ? "Privacy" : "Gizlilik"}
        title={isEn ? "Privacy Policy" : "Gizlilik Politikası"}
        subtitle={
          isEn
            ? "Mirror AI uses your data only to personalize symbolic insight and relationship memory."
            : "Mirror AI verilerini yalnızca sembolik içgörü ve ilişki hafızasını kişiselleştirmek için kullanır."
        }
      />
      <Text style={{ color: colors.muted, lineHeight: 22 }}>
        {isEn
          ? "We process birth details, profile answers, readings, feedback, relationship journal entries, push tokens, and purchase status. Coffee photos are uploaded only for analysis and are deleted after processing. We do not use your photos for model training. You can delete your Mirror AI data from the Profile tab. Readings are for entertainment and personal reflection only."
          : "Doğum bilgileri, profil cevapları, yorumlar, feedback, ilişki günlükleri, push tokenları ve satın alma durumunu işleriz. Kahve fotoğrafları yalnızca analiz için yüklenir ve işlemden sonra silinir. Fotoğrafların model eğitimi için kullanılmaz. Mirror AI verilerini Profil sekmesinden silebilirsin. Yorumlar eğlence ve kişisel farkındalık amaçlıdır."}
      </Text>
    </Screen>
  );
}
