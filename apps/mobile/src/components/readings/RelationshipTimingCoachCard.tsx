import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@/theme";
import type { ReadingOutput, ReadingSection } from "@/types/readings";

type Locale = "tr" | "en";

const copy = {
  tr: {
    eyebrow: "HIZLI MESAJ KOÇU",
    paid: "Plus veya 1 krediyle açıldı",
    decision: "Net karar",
    tone: "Ton ve sınır",
    sample: "Kopyalanabilir mesaj",
    proof: "Neye dayandı?",
    safety: "Karar sende kalır; bu koç manipülatif mesaj yazdırmaz."
  },
  en: {
    eyebrow: "QUICK MESSAGE COACH",
    paid: "Unlocked with Plus or 1 credit",
    decision: "Clear decision",
    tone: "Tone and boundary",
    sample: "Copy-paste message",
    proof: "What it used",
    safety: "The choice stays yours; this coach does not write manipulative messages."
  }
} as const;

export function RelationshipTimingCoachCard({
  reading,
  locale
}: {
  reading: ReadingOutput;
  locale: Locale;
}) {
  const t = copy[locale];
  const decision = pickSection(reading.sections, ["mesaj", "message", "today", "bugün"], 0);
  const tone = pickSection(reading.sections, ["ton", "tone", "sınır", "boundary"], 1);
  const sample = pickSection(reading.sections, ["örnek", "sample", "message", "mesaj"], 2);
  const proofItems = [
    ...reading.explanation.based_on,
    ...(reading.source_context?.references ?? [])
  ].filter(Boolean).slice(0, 6);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name="send-outline" size={20} color={colors.accentTeal} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>{t.eyebrow}</Text>
          <Text style={styles.title}>{reading.title}</Text>
          <Text style={styles.paid}>{t.paid}</Text>
        </View>
      </View>

      <Text style={styles.summary}>{reading.summary}</Text>

      <CoachBlock icon="checkmark-circle-outline" label={t.decision} section={decision} accent={colors.accentGold} />
      <CoachBlock icon="options-outline" label={t.tone} section={tone} accent={colors.accentTeal} />

      <View style={styles.sampleBox}>
        <View style={styles.blockHead}>
          <Ionicons name="chatbubble-ellipses-outline" size={15} color={colors.accentRose} />
          <Text style={[styles.blockLabel, { color: colors.accentRose }]}>{t.sample}</Text>
        </View>
        <Text selectable style={styles.sampleText}>
          {sample?.body ?? reading.advice}
        </Text>
      </View>

      <View style={styles.proofBox}>
        <Text style={styles.proofTitle}>{t.proof}</Text>
        {proofItems.map((item, index) => (
          <View key={`${item}-${index}`} style={styles.proofRow}>
            <Ionicons name="sparkles-outline" size={12} color={colors.accentGold} />
            <Text style={styles.proofItem}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.safetyBox}>
        <Ionicons name="shield-checkmark-outline" size={14} color={colors.muted} />
        <Text style={styles.safety}>{reading.safety_note || t.safety}</Text>
      </View>
    </View>
  );
}

function CoachBlock({
  icon,
  label,
  section,
  accent
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  section?: ReadingSection;
  accent: string;
}) {
  if (!section) return null;
  return (
    <View style={styles.block}>
      <View style={styles.blockHead}>
        <Ionicons name={icon} size={15} color={accent} />
        <Text style={[styles.blockLabel, { color: accent }]}>{label}</Text>
      </View>
      <Text style={styles.blockTitle}>{section.title}</Text>
      <Text style={styles.blockBody}>{section.body}</Text>
    </View>
  );
}

function pickSection(sections: ReadingSection[], keywords: string[], fallbackIndex: number) {
  return (
    sections.find((section) => {
      const haystack = `${section.title} ${section.body}`.toLocaleLowerCase("tr-TR");
      return keywords.some((keyword) => haystack.includes(keyword));
    }) ?? sections[fallbackIndex]
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(94,196,192,0.42)",
    backgroundColor: "#071A22",
    padding: spacing.md,
    gap: spacing.sm
  },
  header: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center"
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(94,196,192,0.46)",
    backgroundColor: "rgba(94,196,192,0.12)",
    alignItems: "center",
    justifyContent: "center"
  },
  headerText: {
    flex: 1,
    gap: 3
  },
  eyebrow: {
    color: colors.accentTeal,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1
  },
  title: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "900"
  },
  paid: {
    color: colors.accentGold,
    fontSize: 11,
    fontWeight: "900"
  },
  summary: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21
  },
  block: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#0D1420",
    padding: spacing.sm,
    gap: 5
  },
  blockHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  blockLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase"
  },
  blockTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  blockBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  sampleBox: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(224,122,168,0.34)",
    backgroundColor: "rgba(224,122,168,0.08)",
    padding: spacing.sm,
    gap: 6
  },
  sampleText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700"
  },
  proofBox: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.2)",
    backgroundColor: "rgba(216,181,109,0.06)",
    padding: spacing.sm,
    gap: 7
  },
  proofTitle: {
    color: colors.accentGold,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  proofRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6
  },
  proofItem: {
    flex: 1,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17
  },
  safetyBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6
  },
  safety: {
    flex: 1,
    color: colors.faint,
    fontSize: 12,
    lineHeight: 18
  }
});
