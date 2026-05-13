import { Text } from "react-native";
import { BackButton } from "@/components/layout/BackButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { useI18n } from "@/i18n";
import { colors } from "@/theme";

export default function TermsScreen() {
  const { locale } = useI18n();
  const isEn = locale === "en";

  return (
    <Screen>
      <BackButton fallbackHref="/tabs/profile" />
      <PageHeader
        eyebrow={isEn ? "Terms" : "Şartlar"}
        title={isEn ? "Terms of Use" : "Kullanım Şartları"}
        subtitle={
          isEn
            ? "Mirror AI is a symbolic insight product, not a professional advice service."
            : "Mirror AI sembolik içgörü ürünüdür; profesyonel danışmanlık hizmeti değildir."
        }
      />
      <Text style={{ color: colors.muted, lineHeight: 22 }}>
        {isEn
          ? "Mirror AI does not provide medical, legal, financial, psychological, or deterministic relationship advice. Astrology, tarot, numerology, coffee readings, and relationship reports are reflective tools. You remain responsible for your decisions. Premium and credit purchases are processed through the app stores and RevenueCat. Misuse, harassment, or attempts to obtain certainty about another person are outside the intended use."
          : "Mirror AI tıbbi, hukuki, finansal, psikolojik veya deterministik ilişki tavsiyesi vermez. Astroloji, tarot, numeroloji, kahve yorumları ve ilişki raporları farkındalık amaçlı araçlardır. Kararların sorumluluğu sana aittir. Premium ve kredi satın alımları uygulama mağazaları ve RevenueCat üzerinden işlenir. Kötüye kullanım, taciz veya başka bir kişi hakkında kesinlik elde etmeye çalışma ürünün amacı dışındadır."}
      </Text>
    </Screen>
  );
}
