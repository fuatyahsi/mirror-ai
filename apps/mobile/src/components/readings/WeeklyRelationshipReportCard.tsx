import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, featureColors, radii, spacing } from "@/theme";
import type { WeeklyRelationshipReport } from "@/types/readings";

type Locale = "tr" | "en";

const localeText = {
  tr: {
    eyebrow: "HAFTALIK İLİŞKİ RAPORU",
    summary: "HAFTANIN ÖZETİ",
    moodArc: "Haftanın duygu seyri",
    recurringThemes: "TEKRAR EDEN TEMALAR",
    timeline: "GÜN GÜN AKTİVİTE",
    nextWeek: "ÖNÜMÜZDEKİ HAFTA ODAĞI",
    timingAnchors: "Zamanlama nirengileri",
    actionPlan: "AKSİYON PLANI",
    confidence: "Güven",
    confidenceLow: "Düşük",
    confidenceModerate: "Orta",
    confidenceHigh: "Yüksek",
    severityLow: "hafif",
    severityModerate: "orta",
    severityHigh: "yoğun",
    arcRising: "yükseliş",
    arcFalling: "düşüş",
    arcWavy: "dalgalı",
    arcSteady: "durağan",
    journalEvidence: "günlük kaydında",
    evidence: "NEDEN BUNA GÜVENİYORUZ",
    evidenceJournal: "günlük kaydı",
    evidenceReadings: "yorum",
    evidenceDays: "veri olan gün",
    scoreIntensity: "Haftanın yoğunluğu",
    scoreClarity: "Senin netliğin",
    scoreRepair: "Onarım ihtiyacı",
    scoreGrowth: "Büyüme sinyali"
  },
  en: {
    eyebrow: "WEEKLY RELATIONSHIP REPORT",
    summary: "WEEK SUMMARY",
    moodArc: "Mood arc of the week",
    recurringThemes: "RECURRING THEMES",
    timeline: "DAY BY DAY",
    nextWeek: "FOCUS FOR NEXT WEEK",
    timingAnchors: "Timing anchors",
    actionPlan: "ACTION PLAN",
    confidence: "Confidence",
    confidenceLow: "Low",
    confidenceModerate: "Moderate",
    confidenceHigh: "High",
    severityLow: "light",
    severityModerate: "moderate",
    severityHigh: "intense",
    arcRising: "rising",
    arcFalling: "falling",
    arcWavy: "wavy",
    arcSteady: "steady",
    journalEvidence: "journal mentions",
    evidence: "WHY WE TRUST THIS",
    evidenceJournal: "journal entries",
    evidenceReadings: "readings",
    evidenceDays: "days with data",
    scoreIntensity: "Week intensity",
    scoreClarity: "Your clarity",
    scoreRepair: "Repair need",
    scoreGrowth: "Growth signal"
  }
} as const;

const severityColor = {
  low: colors.success,
  moderate: colors.accentGold,
  high: colors.danger
} as const;

const arcColor = {
  rising: colors.success,
  falling: colors.danger,
  wavy: colors.accentGold,
  steady: colors.muted
} as const;

const arcIcon = {
  rising: "trending-up" as const,
  falling: "trending-down" as const,
  wavy: "pulse" as const,
  steady: "remove" as const
};

export function WeeklyRelationshipReportCard({
  report,
  locale
}: {
  report: WeeklyRelationshipReport;
  locale: Locale;
}) {
  const t = localeText[locale];
  const arcLabel = {
    rising: t.arcRising,
    falling: t.arcFalling,
    wavy: t.arcWavy,
    steady: t.arcSteady
  } as const;
  const severityLabel = {
    low: t.severityLow,
    moderate: t.severityModerate,
    high: t.severityHigh
  } as const;

  return (
    <View style={styles.wrapper}>
      <Header report={report} locale={locale} />
      <ScoreStrip report={report} locale={locale} />
      <Section eyebrow={t.summary} accent>
        <View style={styles.arcRow}>
          <Ionicons name={arcIcon[report.summary.mood_arc]} size={18} color={arcColor[report.summary.mood_arc]} />
          <Text style={[styles.arcLabel, { color: arcColor[report.summary.mood_arc] }]}>
            {t.moodArc}: {arcLabel[report.summary.mood_arc]}
          </Text>
        </View>
        <Text style={styles.headline}>{report.summary.headline}</Text>
        <Text style={styles.body}>{report.summary.body}</Text>
        <Text style={styles.arcExplainer}>{report.summary.mood_arc_explainer}</Text>
      </Section>

      {report.recurring_themes.length ? (
        <Section eyebrow={t.recurringThemes}>
          {report.recurring_themes.map((theme, idx) => (
            <View key={`${theme.label}-${idx}`} style={styles.themeCard}>
              <View style={styles.themeHeader}>
                <View style={[styles.severityChip, { borderColor: severityColor[theme.severity] }]}>
                  <Text style={[styles.severityText, { color: severityColor[theme.severity] }]}>
                    {severityLabel[theme.severity]}
                  </Text>
                </View>
                <Text style={styles.themeLabel}>{theme.label}</Text>
              </View>
              <Text style={styles.themeBody}>{theme.body}</Text>
              <Text style={styles.themeMeta}>
                {theme.journal_evidence_count} {t.journalEvidence}
              </Text>
            </View>
          ))}
        </Section>
      ) : null}

      <Section eyebrow={t.timeline}>
        {report.daily_timeline.map((day, idx) => (
          <View key={`${day.date}-${idx}`} style={styles.dayRow}>
            <View style={styles.dayDate}>
              <Text style={styles.dayDateText}>{formatShortDate(day.date, locale)}</Text>
              <Text style={styles.dayMood}>{day.mood}</Text>
            </View>
            <View style={styles.dayContent}>
              <Text style={styles.dayHeadline}>{day.headline}</Text>
              {day.note ? <Text style={styles.dayNote}>{day.note}</Text> : null}
            </View>
          </View>
        ))}
      </Section>

      <Section eyebrow={t.nextWeek} accent>
        <Text style={styles.headline}>{report.next_week_focus.headline}</Text>
        <Text style={styles.body}>{report.next_week_focus.body}</Text>
        {report.next_week_focus.timing_anchors.length ? (
          <View style={styles.anchorBlock}>
            <Text style={styles.anchorLabel}>{t.timingAnchors}</Text>
            {report.next_week_focus.timing_anchors.map((anchor, idx) => (
              <View key={`${anchor.day_label}-${idx}`} style={styles.anchorRow}>
                <View style={styles.anchorDay}>
                  <Text style={styles.anchorDayText}>{anchor.day_label}</Text>
                </View>
                <Text style={styles.anchorReason}>{anchor.reason}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Section>

      <Section eyebrow={t.actionPlan} accent>
        <Text style={styles.headline}>{report.action_plan.headline}</Text>
        {report.action_plan.items.map((item, idx) => (
          <View key={`${item}-${idx}`} style={styles.actionRow}>
            <View style={styles.actionBullet}>
              <Text style={styles.actionBulletText}>{idx + 1}</Text>
            </View>
            <Text style={styles.actionText}>{item}</Text>
          </View>
        ))}
      </Section>

      <EvidencePanel report={report} locale={locale} />
    </View>
  );
}

function Header({ report, locale }: { report: WeeklyRelationshipReport; locale: Locale }) {
  const t = localeText[locale];
  const labelMap = {
    low: t.confidenceLow,
    moderate: t.confidenceModerate,
    high: t.confidenceHigh
  } as const;
  const colorMap = {
    low: colors.danger,
    moderate: colors.accentGold,
    high: colors.success
  } as const;
  const pct = Math.round(report.confidence.score * 100);
  return (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <Ionicons name="calendar-outline" size={18} color={featureColors.relationship.accent} />
        <Text style={styles.headerEyebrow}>{t.eyebrow}</Text>
      </View>
      <Text style={styles.headerTitle}>
        {report.period.relationship_nickname}
        <Text style={styles.headerSubtitle}> · {report.period.relation_type}</Text>
      </Text>
      <View style={styles.headerMetaRow}>
        <Text style={styles.headerPeriod}>
          {formatShortDate(report.period.week_start, locale)} →{" "}
          {formatShortDate(report.period.week_end, locale)}
        </Text>
        <View style={[styles.confidenceBadge, { borderColor: colorMap[report.confidence.label] }]}>
          <Text style={[styles.confidenceLabel, { color: colorMap[report.confidence.label] }]}>
            {t.confidence} · {labelMap[report.confidence.label]} %{pct}
          </Text>
        </View>
      </View>
    </View>
  );
}

function ScoreStrip({ report, locale }: { report: WeeklyRelationshipReport; locale: Locale }) {
  const t = localeText[locale];
  const items = [
    { key: "intensity", label: t.scoreIntensity, value: report.scores.week_intensity, accent: colors.accent },
    { key: "clarity", label: t.scoreClarity, value: report.scores.week_clarity, accent: colors.accentBlue },
    { key: "repair", label: t.scoreRepair, value: report.scores.week_repair_need, accent: colors.danger },
    { key: "growth", label: t.scoreGrowth, value: report.scores.week_growth, accent: colors.success }
  ];
  return (
    <View style={styles.scoreStrip}>
      {items.map((item) => (
        <View key={item.key} style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>{item.label}</Text>
          <View style={styles.scoreBarTrack}>
            <View
              style={[
                styles.scoreBarFill,
                { width: `${Math.max(0, Math.min(100, item.value))}%`, backgroundColor: item.accent }
              ]}
            />
          </View>
          <Text style={styles.scoreValue}>{Math.round(item.value)}</Text>
        </View>
      ))}
    </View>
  );
}

function EvidencePanel({ report, locale }: { report: WeeklyRelationshipReport; locale: Locale }) {
  const t = localeText[locale];
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.evidence}>
      <Pressable style={styles.evidenceHead} onPress={() => setOpen((v) => !v)}>
        <Text style={styles.evidenceEyebrow}>{t.evidence}</Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color={colors.muted} />
      </Pressable>
      {open ? (
        <View style={styles.evidenceBody}>
          <Text style={styles.evidenceItem}>
            · {report.evidence.journal_entries_count} {t.evidenceJournal}
          </Text>
          <Text style={styles.evidenceItem}>
            · {report.evidence.readings_count} {t.evidenceReadings}
          </Text>
          <Text style={styles.evidenceItem}>
            · {report.evidence.days_with_data} {t.evidenceDays}
          </Text>
          <Text style={styles.evidenceNote}>{report.evidence.swiss_ephemeris_note}</Text>
          {report.confidence.factors.length ? (
            <View style={styles.evidenceFactors}>
              {report.confidence.factors.map((factor) => (
                <View key={factor} style={styles.evidenceFactor}>
                  <Text style={styles.evidenceFactorText}>{factor}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function Section({
  eyebrow,
  accent,
  children
}: {
  eyebrow: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.section, accent && styles.sectionAccent]}>
      <Text style={[styles.sectionEyebrow, accent && styles.sectionEyebrowAccent]}>{eyebrow}</Text>
      {children}
    </View>
  );
}

function formatShortDate(dateString: string, locale: Locale) {
  // Input: YYYY-MM-DD. Output: "9 May" / "May 9"
  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;
  const [, m, d] = parts;
  const monthIndex = Math.max(0, Math.min(11, Number(m) - 1));
  const monthsTr = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = locale === "en" ? monthsEn[monthIndex] : monthsTr[monthIndex];
  const day = String(Number(d));
  return locale === "en" ? `${month} ${day}` : `${day} ${month}`;
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.md },
  header: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: featureColors.relationship.accent,
    backgroundColor: featureColors.relationship.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  headerTopRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  headerEyebrow: {
    color: featureColors.relationship.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4
  },
  headerTitle: { color: colors.text, fontSize: 22, fontWeight: "900" },
  headerSubtitle: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  headerMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  headerPeriod: { color: colors.muted, fontSize: 12, fontWeight: "700", letterSpacing: 0.4 },
  confidenceBadge: {
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  confidenceLabel: { fontSize: 11, fontWeight: "900", letterSpacing: 0.5 },
  scoreStrip: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  scoreLabel: { color: colors.muted, fontSize: 12, width: "38%" },
  scoreBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceMid,
    borderRadius: 3,
    overflow: "hidden"
  },
  scoreBarFill: { height: "100%", borderRadius: 3 },
  scoreValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
    width: 32,
    textAlign: "right"
  },
  section: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  sectionAccent: {
    borderColor: featureColors.relationship.accent,
    backgroundColor: featureColors.relationship.surface
  },
  sectionEyebrow: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5
  },
  sectionEyebrowAccent: { color: featureColors.relationship.accent },
  arcRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  arcLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  arcExplainer: { color: colors.faint, fontSize: 11, fontStyle: "italic" },
  headline: { color: colors.text, fontSize: 16, fontWeight: "700", lineHeight: 22 },
  body: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  themeCard: {
    backgroundColor: colors.surfaceMid,
    borderRadius: radii.sm,
    padding: spacing.sm,
    gap: spacing.xs
  },
  themeHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  severityChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  severityText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  themeLabel: { color: colors.text, fontSize: 14, fontWeight: "700", flex: 1 },
  themeBody: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  themeMeta: { color: colors.faint, fontSize: 11, fontStyle: "italic" },
  dayRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  dayDate: { width: 64 },
  dayDateText: { color: colors.text, fontSize: 12, fontWeight: "700" },
  dayMood: { color: colors.accent, fontSize: 11, fontStyle: "italic" },
  dayContent: { flex: 1 },
  dayHeadline: { color: colors.text, fontSize: 13, lineHeight: 19 },
  dayNote: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 2 },
  anchorBlock: { gap: spacing.xs, marginTop: 4 },
  anchorLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1
  },
  anchorRow: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  anchorDay: {
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.accent
  },
  anchorDayText: { color: colors.accent, fontSize: 11, fontWeight: "800" },
  anchorReason: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 18 },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
    marginTop: 4
  },
  actionBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: featureColors.relationship.accent,
    alignItems: "center",
    justifyContent: "center"
  },
  actionBulletText: { color: colors.background, fontSize: 11, fontWeight: "900" },
  actionText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 19 },
  evidence: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  evidenceHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  evidenceEyebrow: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4
  },
  evidenceBody: { gap: spacing.xs },
  evidenceItem: { color: colors.muted, fontSize: 12 },
  evidenceNote: { color: colors.faint, fontSize: 11, lineHeight: 16, fontStyle: "italic" },
  evidenceFactors: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: spacing.xs
  },
  evidenceFactor: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border
  },
  evidenceFactorText: { color: colors.muted, fontSize: 10, letterSpacing: 0.6 }
});
