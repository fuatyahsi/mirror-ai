import { Pressable, StyleSheet, Text, View } from "react-native";
import { useI18n, type Locale } from "@/i18n";
import { colors, radii, spacing } from "@/theme";

const options: { locale: Locale; labelKey: "language.tr" | "language.en" }[] = [
  { locale: "tr", labelKey: "language.tr" },
  { locale: "en", labelKey: "language.en" }
];

type LanguageSwitchProps = {
  compact?: boolean;
};

export function LanguageSwitch({ compact }: LanguageSwitchProps) {
  const { locale, setLocale, t } = useI18n();

  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      <Text style={styles.label}>{t("language.label")}</Text>
      <View style={styles.segment}>
        {options.map((option) => {
          const active = option.locale === locale;
          return (
            <Pressable
              accessibilityRole="button"
              key={option.locale}
              onPress={() => setLocale(option.locale)}
              style={[styles.option, active && styles.optionActive]}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>
                {t(option.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs
  },
  compact: {
    maxWidth: 240
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  segment: {
    flexDirection: "row",
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "transparent",
    overflow: "hidden"
  },
  option: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm
  },
  optionActive: {
    backgroundColor: colors.accent
  },
  optionText: {
    color: colors.muted,
    fontWeight: "800"
  },
  optionTextActive: {
    color: colors.background
  }
});
