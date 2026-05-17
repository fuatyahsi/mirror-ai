import { Share } from "react-native";
import type { Locale } from "@/i18n";
import type { ReadingOutput, RelationshipDeepReport, WeeklyRelationshipReport } from "@/types/readings";

// Mirror AI viral hamlesinin en hızlı versiyonu: rapor sonunda kullanıcı
// "Paylaş" butonuna basınca native Share Sheet açılır, metin paylaşır.
// Şu an dep gerektirmiyor (Share API React Native built-in). Bir sonraki
// APK döngüsünde react-native-view-shot ile görsel kart eklenir.

const TAGLINE = {
  tr: "Mirror AI · İlişki zekası, fal değil.",
  en: "Mirror AI · Relationship intelligence, not fortune telling."
};

const DEEP_LABELS = {
  tr: {
    bond: "Bağın profili",
    user: "Senin blueprint'in",
    partner: "Onun blueprint'i",
    score: "Sinastri toplam",
    quote: "Damga cümle",
    cta: "Sen de dene"
  },
  en: {
    bond: "Bond profile",
    user: "Your blueprint",
    partner: "Their blueprint",
    score: "Synastry total",
    quote: "Signature line",
    cta: "Try it yourself"
  }
};

const WEEKLY_LABELS = {
  tr: {
    period: "Haftalık özet",
    arc: "Duygu seyri",
    theme: "Tekrar eden tema",
    action: "Bu hafta ne yapmalı",
    cta: "Sen de dene"
  },
  en: {
    period: "Weekly review",
    arc: "Mood arc",
    theme: "Recurring theme",
    action: "This week's move",
    cta: "Try it yourself"
  }
};

function clean(text: string | undefined, maxLen = 160): string {
  if (!text) return "";
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= maxLen ? flat : flat.slice(0, maxLen - 1).trimEnd() + "…";
}

export function buildDeepShareMessage(
  reading: ReadingOutput,
  deep: RelationshipDeepReport,
  locale: Locale
): string {
  const t = DEEP_LABELS[locale];
  const lines: string[] = [];
  lines.push(`✨ ${TAGLINE[locale]}`);
  lines.push("");
  if (deep.bond_profile?.title) lines.push(`【${t.bond}】 ${deep.bond_profile.title}`);
  if (deep.scores?.synastry_overall != null) lines.push(`📊 ${t.score}: ${Math.round(deep.scores.synastry_overall)}/100`);
  lines.push("");
  if (deep.user_blueprint) {
    const attach = deep.user_blueprint.attachment_style ?? "";
    const def = deep.user_blueprint.defense_style ?? "";
    lines.push(`🪞 ${t.user}: ${[attach, def].filter(Boolean).join(" · ")}`);
  }
  if (deep.partner_blueprint) {
    const attach = deep.partner_blueprint.apparent_attachment_style ?? "";
    const def = deep.partner_blueprint.apparent_defense_style ?? "";
    lines.push(`💞 ${t.partner}: ${[attach, def].filter(Boolean).join(" · ")}`);
  }
  lines.push("");
  // Vurucu cümle: bond_profile headline veya interaction_choreography body'sinden seç
  const punch = deep.interaction_choreography?.headline ?? deep.bond_profile?.headline ?? reading.summary;
  if (punch) lines.push(`💬 “${clean(punch, 180)}”`);
  lines.push("");
  lines.push(`→ ${t.cta}: https://mirror-ai.app`);
  return lines.join("\n").trim();
}

export function buildWeeklyShareMessage(
  reading: ReadingOutput,
  weekly: WeeklyRelationshipReport,
  locale: Locale
): string {
  const t = WEEKLY_LABELS[locale];
  const lines: string[] = [];
  lines.push(`✨ ${TAGLINE[locale]}`);
  lines.push("");
  if (weekly.period) {
    lines.push(`📅 ${t.period}: ${weekly.period.week_start} → ${weekly.period.week_end}`);
    if (weekly.period.relationship_nickname) lines.push(`   ${weekly.period.relationship_nickname}`);
  }
  if (weekly.summary) {
    lines.push(`💫 ${t.arc}: ${weekly.summary.mood_arc}`);
    lines.push(`   ${clean(weekly.summary.headline, 180)}`);
  }
  if (weekly.recurring_themes?.length) {
    lines.push("");
    lines.push(`🔁 ${t.theme}: ${weekly.recurring_themes[0]?.label ?? ""}`);
  }
  if (weekly.action_plan?.items?.length) {
    lines.push("");
    lines.push(`✅ ${t.action}: ${clean(weekly.action_plan.items[0], 160)}`);
  }
  lines.push("");
  lines.push(`→ ${t.cta}: https://mirror-ai.app`);
  return lines.join("\n").trim();
}

export async function shareReading(
  reading: ReadingOutput,
  locale: Locale
): Promise<{ shared: boolean }> {
  let message: string | undefined;
  if (reading.deep_report) {
    message = buildDeepShareMessage(reading, reading.deep_report, locale);
  } else if (reading.weekly_report) {
    message = buildWeeklyShareMessage(reading, reading.weekly_report, locale);
  } else {
    // Fallback: generic reading share
    message = [
      `✨ ${TAGLINE[locale]}`,
      "",
      reading.title,
      "",
      clean(reading.summary, 220),
      "",
      `→ https://mirror-ai.app`
    ].join("\n");
  }
  try {
    const result = await Share.share({ message });
    return { shared: result.action === Share.sharedAction };
  } catch {
    return { shared: false };
  }
}
