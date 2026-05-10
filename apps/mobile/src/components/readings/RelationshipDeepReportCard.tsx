import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, featureColors, radii, spacing } from "@/theme";
import type { RelationshipDeepReport } from "@/types/readings";

type Locale = "tr" | "en";

const localeText = {
  tr: {
    sectionBond: "BAĞIN PROFİLİ",
    sectionUserBlueprint: "SENİN BLUEPRINT'İN",
    sectionPartnerBlueprint: "ONUN BLUEPRINT'İ",
    sectionChoreography: "ETKİLEŞİM KOREOGRAFİSİ",
    sectionPattern: "SİNASTRİ DESENİ",
    sectionLoop: "TEKRAR EDEN DÖNGÜ",
    sectionToday: "BUGÜNKÜ ZAMANLAMA",
    sectionAction: "BİR SONRAKİ ADIM",
    sectionCompare: "GEÇEN RAPORA GÖRE",
    sectionEvidence: "NEDEN BUNA GÜVENİYORUZ",
    attachmentStyle: "Bağlanma stili",
    defenseStyle: "Savunma stratejisi",
    needs: "İhtiyaçlar",
    wound: "Tekrar eden yara",
    triggers: "Tetikleyicileri",
    softSpots: "Yumuşak noktalar",
    chartAnchors: "Haritada nereden",
    triggerChainsTitle: "Tetik zincirleri",
    whenUser: "Sen…",
    partnerReaction: "→ O…",
    userFollowup: "→ Sen yine…",
    repairWindow: "Onarım anı",
    confidence: "Güven",
    pressure: "Bugünkü baskı",
    suggestedTone: "Önerilen ton",
    doNotDo: "Şunu yapma",
    yourRole: "Senin rolün",
    partnerRole: "Onun rolü görünen hali",
    journalEvidence: "Günlüğünden",
    sampleMessage: "Örnek mesaj",
    sampleMessageTone: "Ton",
    copy: "Uzun bas, kopyala",
    copied: "Kopyalandı",
    strengths: "Güçlü yanlar",
    riskAreas: "Hassas alanlar",
    keyAspects: "Ana sinastri temasları",
    overall: "Sinastri toplam",
    delta: "Fark",
    timeUnknown: "Karşı kişinin doğum saati bilinmiyor — yükselen ve evler esnek okundu.",
    timeKnown: "Karşı kişinin doğum saati biliniyor — yükselen ve evler güçlü referans alındı.",
    pressureLow: "Sakin",
    pressureModerate: "Orta",
    pressureHigh: "Yüksek",
    confidenceLow: "Düşük",
    confidenceModerate: "Orta",
    confidenceHigh: "Yüksek",
    actionMessage: "Mesaj atmak",
    actionWait: "Beklemek",
    actionBoundary: "Sınır koymak",
    actionSelf: "Kendine dönmek",
    actionTalk: "Yüz yüze konuşmak",
    scoreEmotionalPull: "Duygusal çekim",
    scoreCommClarity: "İletişim netliği",
    scoreUncertainty: "Belirsizlik",
    scoreProjection: "Senin projeksiyon riskin",
    scoreSynastry: "Sinastri toplam"
  },
  en: {
    sectionBond: "BOND PROFILE",
    sectionUserBlueprint: "YOUR BLUEPRINT",
    sectionPartnerBlueprint: "THEIR BLUEPRINT",
    sectionChoreography: "INTERACTION CHOREOGRAPHY",
    sectionPattern: "SYNASTRY PATTERN",
    sectionLoop: "REPEATED LOOP",
    sectionToday: "TODAY'S TIMING",
    sectionAction: "NEXT STEP",
    sectionCompare: "VS PREVIOUS REPORT",
    sectionEvidence: "WHY WE TRUST THIS",
    attachmentStyle: "Attachment style",
    defenseStyle: "Defense pattern",
    needs: "Needs",
    wound: "Recurring wound",
    triggers: "Apparent triggers",
    softSpots: "Soft spots",
    chartAnchors: "Chart anchors",
    triggerChainsTitle: "Trigger chains",
    whenUser: "You…",
    partnerReaction: "→ They…",
    userFollowup: "→ You again…",
    repairWindow: "Repair moment",
    confidence: "Confidence",
    pressure: "Today's pressure",
    suggestedTone: "Suggested tone",
    doNotDo: "Do not do",
    yourRole: "Your role",
    partnerRole: "Their apparent role",
    journalEvidence: "From your journal",
    sampleMessage: "Sample message",
    sampleMessageTone: "Tone",
    copy: "Long-press to copy",
    copied: "Copied",
    strengths: "Strengths",
    riskAreas: "Sensitive areas",
    keyAspects: "Core synastry themes",
    overall: "Synastry total",
    delta: "Δ",
    timeUnknown: "Partner birth time unknown — Ascendant and houses read flexibly.",
    timeKnown: "Partner birth time known — Ascendant and houses anchor the reading.",
    pressureLow: "Calm",
    pressureModerate: "Moderate",
    pressureHigh: "High",
    confidenceLow: "Low",
    confidenceModerate: "Moderate",
    confidenceHigh: "High",
    actionMessage: "Message",
    actionWait: "Wait",
    actionBoundary: "Set a boundary",
    actionSelf: "Turn inward",
    actionTalk: "Talk in person",
    scoreEmotionalPull: "Emotional pull",
    scoreCommClarity: "Communication clarity",
    scoreUncertainty: "Uncertainty",
    scoreProjection: "Your projection risk",
    scoreSynastry: "Synastry total"
  }
} as const;

const sentimentColor = {
  supportive: colors.success,
  tense: colors.danger,
  neutral: colors.muted
} as const;

const sentimentLabel = {
  tr: { supportive: "destekleyici", tense: "gergin", neutral: "nötr" },
  en: { supportive: "supportive", tense: "tense", neutral: "neutral" }
} as const;

export function RelationshipDeepReportCard({
  report,
  locale,
  partnerNickname,
  relationType,
  question
}: {
  report: RelationshipDeepReport;
  locale: Locale;
  partnerNickname?: string;
  relationType?: string;
  question?: string;
}) {
  const t = localeText[locale];

  return (
    <View style={styles.wrapper}>
      <DeepHeader
        report={report}
        locale={locale}
        partnerNickname={partnerNickname}
        relationType={relationType}
        question={question}
      />
      <ScoreStrip report={report} locale={locale} />
      <Section eyebrow={t.sectionBond} accent>
        <Text style={styles.sectionTitle}>{report.bond_profile.title}</Text>
        <Text style={styles.sectionHeadline}>{report.bond_profile.headline}</Text>
        <Text style={styles.sectionBody}>{report.bond_profile.body}</Text>
        <View style={styles.tagRow}>
          {report.bond_profile.pillar_tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </Section>

      {report.user_blueprint && report.partner_blueprint ? (
        <View style={styles.blueprintRow}>
          <BlueprintCard
            eyebrow={t.sectionUserBlueprint}
            headline={report.user_blueprint.headline}
            body={report.user_blueprint.body}
            attachmentLabel={t.attachmentStyle}
            attachment={report.user_blueprint.attachment_style}
            defenseLabel={t.defenseStyle}
            defense={report.user_blueprint.defense_style}
            primaryListLabel={t.needs}
            primaryListItems={report.user_blueprint.relationship_needs}
            footerLabel={t.wound}
            footer={report.user_blueprint.wound_signature}
            anchorsLabel={t.chartAnchors}
            anchors={report.user_blueprint.chart_anchors}
            tone="user"
          />
          <BlueprintCard
            eyebrow={t.sectionPartnerBlueprint}
            headline={report.partner_blueprint.headline}
            body={report.partner_blueprint.body}
            attachmentLabel={t.attachmentStyle}
            attachment={report.partner_blueprint.apparent_attachment_style}
            defenseLabel={t.defenseStyle}
            defense={report.partner_blueprint.apparent_defense_style}
            primaryListLabel={t.triggers}
            primaryListItems={report.partner_blueprint.likely_triggers}
            secondaryListLabel={t.softSpots}
            secondaryListItems={report.partner_blueprint.soft_spots}
            anchorsLabel={t.chartAnchors}
            anchors={report.partner_blueprint.chart_anchors}
            tone="partner"
          />
        </View>
      ) : null}

      {report.interaction_choreography ? (
        <Section eyebrow={t.sectionChoreography} accent>
          <Text style={styles.sectionHeadline}>{report.interaction_choreography.headline}</Text>
          <Text style={styles.sectionBody}>{report.interaction_choreography.body}</Text>
          {report.interaction_choreography.trigger_chains.length ? (
            <View style={styles.choreoBlock}>
              <Text style={styles.bulletLabel}>{t.triggerChainsTitle}</Text>
              {report.interaction_choreography.trigger_chains.map((chain, idx) => (
                <View key={`${chain.when_user}-${idx}`} style={styles.chainCard}>
                  <Text style={styles.chainLine}>
                    <Text style={styles.chainTag}>{t.whenUser} </Text>
                    {chain.when_user}
                  </Text>
                  <Text style={styles.chainLine}>
                    <Text style={[styles.chainTag, { color: colors.danger }]}>{t.partnerReaction} </Text>
                    {chain.partner_reaction}
                  </Text>
                  <Text style={styles.chainLine}>
                    <Text style={styles.chainTag}>{t.userFollowup} </Text>
                    {chain.user_followup}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          <View style={styles.repairCard}>
            <Text style={styles.repairLabel}>{t.repairWindow}</Text>
            <Text style={styles.repairBody}>{report.interaction_choreography.repair_window}</Text>
          </View>
        </Section>
      ) : null}

      <Section eyebrow={t.sectionPattern}>
        <Text style={styles.sectionHeadline}>{report.synastry_pattern.headline}</Text>
        <Text style={styles.sectionBody}>{report.synastry_pattern.body}</Text>
        {report.synastry_pattern.strengths.length ? (
          <View style={styles.bulletGroup}>
            <Text style={styles.bulletLabel}>{t.strengths}</Text>
            {report.synastry_pattern.strengths.map((item, idx) => (
              <Text key={`${item}-${idx}`} style={styles.bulletItem}>· {item}</Text>
            ))}
          </View>
        ) : null}
        {report.synastry_pattern.risk_areas.length ? (
          <View style={styles.bulletGroup}>
            <Text style={[styles.bulletLabel, styles.bulletLabelDanger]}>{t.riskAreas}</Text>
            {report.synastry_pattern.risk_areas.map((item, idx) => (
              <Text key={`${item}-${idx}`} style={styles.bulletItem}>· {item}</Text>
            ))}
          </View>
        ) : null}
        {report.synastry_pattern.key_aspects.length ? (
          <View style={styles.aspectsBlock}>
            <Text style={styles.bulletLabel}>{t.keyAspects}</Text>
            {report.synastry_pattern.key_aspects.map((aspect, idx) => (
              <View key={`${aspect.label}-${idx}`} style={styles.aspectRow}>
                <View
                  style={[
                    styles.aspectChip,
                    { backgroundColor: `${sentimentColor[aspect.sentiment]}22`, borderColor: sentimentColor[aspect.sentiment] }
                  ]}
                >
                  <Text style={[styles.aspectChipText, { color: sentimentColor[aspect.sentiment] }]}>
                    {aspect.label}
                  </Text>
                </View>
                <Text style={styles.aspectMeaning}>
                  {aspect.meaning}
                  <Text style={styles.aspectSentiment}> · {sentimentLabel[locale][aspect.sentiment]}</Text>
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Section>

      <Section eyebrow={t.sectionLoop}>
        <Text style={styles.sectionHeadline}>{report.repeated_loop.headline}</Text>
        <Text style={styles.sectionBody}>{report.repeated_loop.body}</Text>
        <View style={styles.tagRow}>
          {report.repeated_loop.loop_themes.map((theme) => (
            <View key={theme} style={[styles.tag, styles.tagWarn]}>
              <Text style={[styles.tagText, styles.tagTextWarn]}>{theme}</Text>
            </View>
          ))}
        </View>
        <View style={styles.rolesRow}>
          <View style={styles.roleCard}>
            <Text style={styles.roleLabel}>{t.yourRole}</Text>
            <Text style={styles.roleBody}>{report.repeated_loop.user_role}</Text>
          </View>
          <View style={styles.roleCard}>
            <Text style={styles.roleLabel}>{t.partnerRole}</Text>
            <Text style={styles.roleBody}>{report.repeated_loop.partner_role}</Text>
          </View>
        </View>
        {report.repeated_loop.journal_evidence.length ? (
          <View style={styles.bulletGroup}>
            <Text style={styles.bulletLabel}>{t.journalEvidence}</Text>
            {report.repeated_loop.journal_evidence.map((item, idx) => (
              <Text key={`${item}-${idx}`} style={styles.bulletItem}>· {item}</Text>
            ))}
          </View>
        ) : null}
      </Section>

      <Section eyebrow={t.sectionToday} accent>
        <View style={styles.timingHeader}>
          <Text style={styles.timingDate}>{report.today_timing.target_date}</Text>
          <PressureBadge label={report.today_timing.pressure_label} locale={locale} />
        </View>
        <Text style={styles.sectionHeadline}>{report.today_timing.headline}</Text>
        <Text style={styles.sectionBody}>{report.today_timing.body}</Text>
        <View style={styles.timingMetaRow}>
          <View style={styles.timingMetaCol}>
            <Text style={styles.metaLabel}>{t.suggestedTone}</Text>
            <Text style={styles.metaValue}>{report.today_timing.suggested_tone}</Text>
          </View>
          <View style={styles.timingMetaCol}>
            <Text style={[styles.metaLabel, { color: colors.danger }]}>{t.doNotDo}</Text>
            <Text style={styles.metaValue}>{report.today_timing.do_not_do}</Text>
          </View>
        </View>
      </Section>

      <Section eyebrow={t.sectionAction} accent>
        <ActionKindBadge kind={report.next_action_or_message.action_kind} locale={locale} />
        <Text style={styles.sectionHeadline}>{report.next_action_or_message.headline}</Text>
        <Text style={styles.sectionBody}>{report.next_action_or_message.action_body}</Text>
        {report.next_action_or_message.sample_message ? (
          <SampleMessageCard
            message={report.next_action_or_message.sample_message}
            tone={report.next_action_or_message.sample_message_tone}
            locale={locale}
          />
        ) : null}
      </Section>

      {report.history_compare ? (
        <Section eyebrow={t.sectionCompare}>
          <View style={styles.historyHeader}>
            {report.history_compare.has_previous &&
            typeof report.history_compare.previous_overall === "number" &&
            typeof report.history_compare.current_overall === "number" ? (
              <Text style={styles.historyDelta}>
                {report.history_compare.previous_overall} → {report.history_compare.current_overall}
                {typeof report.history_compare.delta === "number" ? (
                  <Text
                    style={[
                      styles.historyDeltaPill,
                      { color: report.history_compare.delta >= 0 ? colors.success : colors.danger }
                    ]}
                  >
                    {"  "}
                    {report.history_compare.delta >= 0 ? "+" : ""}
                    {report.history_compare.delta}
                  </Text>
                ) : null}
              </Text>
            ) : null}
          </View>
          <Text style={styles.sectionBody}>{report.history_compare.insight}</Text>
        </Section>
      ) : null}

      <EvidencePanel report={report} locale={locale} />
    </View>
  );
}

function DeepHeader({
  report,
  locale,
  partnerNickname,
  relationType
}: {
  report: RelationshipDeepReport;
  locale: Locale;
  partnerNickname?: string;
  relationType?: string;
  question?: string;
}) {
  const t = localeText[locale];
  return (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <Ionicons name="git-compare-outline" size={18} color={featureColors.relationship.accent} />
        <Text style={styles.headerEyebrow}>
          {locale === "en" ? "DEEP SYNASTRY REPORT" : "DERİN SİNASTRİ RAPORU"}
        </Text>
      </View>
      {partnerNickname ? (
        <Text style={styles.headerTitle}>
          {partnerNickname}
          {relationType ? <Text style={styles.headerSubtitle}> · {relationType}</Text> : null}
        </Text>
      ) : null}
      <View style={styles.headerMetaRow}>
        <ConfidenceBadge confidence={report.confidence} locale={locale} />
        <Text style={styles.headerTimeNote}>
          {report.evidence.time_known ? t.timeKnown : t.timeUnknown}
        </Text>
      </View>
    </View>
  );
}

function ConfidenceBadge({
  confidence,
  locale
}: {
  confidence: RelationshipDeepReport["confidence"];
  locale: Locale;
}) {
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
  const pct = Math.round(confidence.score * 100);
  return (
    <View style={[styles.confidenceBadge, { borderColor: colorMap[confidence.label] }]}>
      <Text style={[styles.confidenceLabel, { color: colorMap[confidence.label] }]}>
        {t.confidence} · {labelMap[confidence.label]}
      </Text>
      <Text style={styles.confidencePct}>%{pct}</Text>
    </View>
  );
}

function PressureBadge({
  label,
  locale
}: {
  label: RelationshipDeepReport["today_timing"]["pressure_label"];
  locale: Locale;
}) {
  const t = localeText[locale];
  const map = { low: t.pressureLow, moderate: t.pressureModerate, high: t.pressureHigh } as const;
  const colorMap = { low: colors.success, moderate: colors.accentGold, high: colors.danger } as const;
  return (
    <View style={[styles.pressureBadge, { borderColor: colorMap[label] }]}>
      <Text style={[styles.pressureBadgeText, { color: colorMap[label] }]}>
        {t.pressure}: {map[label]}
      </Text>
    </View>
  );
}

function ActionKindBadge({
  kind,
  locale
}: {
  kind: RelationshipDeepReport["next_action_or_message"]["action_kind"];
  locale: Locale;
}) {
  const t = localeText[locale];
  const map = {
    message: { label: t.actionMessage, icon: "send-outline" as const },
    wait: { label: t.actionWait, icon: "hourglass-outline" as const },
    boundary: { label: t.actionBoundary, icon: "shield-outline" as const },
    self: { label: t.actionSelf, icon: "leaf-outline" as const },
    talk: { label: t.actionTalk, icon: "chatbubbles-outline" as const }
  };
  const item = map[kind];
  return (
    <View style={styles.actionKindBadge}>
      <Ionicons name={item.icon} size={14} color={colors.accent} />
      <Text style={styles.actionKindText}>{item.label}</Text>
    </View>
  );
}

function SampleMessageCard({
  message,
  tone,
  locale
}: {
  message: string;
  tone?: string;
  locale: Locale;
}) {
  const t = localeText[locale];
  return (
    <View style={styles.sampleCard}>
      <View style={styles.sampleHeaderRow}>
        <Text style={styles.sampleLabel}>{t.sampleMessage}</Text>
        {tone ? <Text style={styles.sampleTone}>{t.sampleMessageTone}: {tone}</Text> : null}
      </View>
      <Text selectable style={styles.sampleText}>
        “{message}”
      </Text>
      <View style={styles.copyHint}>
        <Ionicons name="copy-outline" size={12} color={colors.accent} />
        <Text style={styles.copyHintText}>{t.copy}</Text>
      </View>
    </View>
  );
}

function ScoreStrip({ report, locale }: { report: RelationshipDeepReport; locale: Locale }) {
  const t = localeText[locale];
  const items = useMemo(
    () => [
      { key: "synastry", label: t.scoreSynastry, value: report.scores.synastry_overall, accent: colors.accent },
      { key: "pull", label: t.scoreEmotionalPull, value: report.scores.emotional_pull, accent: colors.accentRose },
      { key: "comm", label: t.scoreCommClarity, value: report.scores.communication_clarity, accent: colors.accentBlue },
      {
        key: "uncertainty",
        label: t.scoreUncertainty,
        value: report.scores.uncertainty_level,
        accent: colors.accentGold,
        invert: true
      },
      {
        key: "projection",
        label: t.scoreProjection,
        value: report.scores.user_projection_risk,
        accent: colors.danger,
        invert: true
      }
    ],
    [report.scores, t]
  );

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

function EvidencePanel({ report, locale }: { report: RelationshipDeepReport; locale: Locale }) {
  const t = localeText[locale];
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.evidence}>
      <Pressable style={styles.evidenceHead} onPress={() => setOpen((v) => !v)}>
        <Text style={styles.evidenceEyebrow}>{t.sectionEvidence}</Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color={colors.muted} />
      </Pressable>
      {open ? (
        <View style={styles.evidenceBody}>
          {report.evidence.systems.map((system) => (
            <Text key={system} style={styles.evidenceItem}>· {system}</Text>
          ))}
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
      <Text style={[styles.eyebrow, accent && styles.eyebrowAccent]}>{eyebrow}</Text>
      {children}
    </View>
  );
}

function BlueprintCard({
  eyebrow,
  headline,
  body,
  attachmentLabel,
  attachment,
  defenseLabel,
  defense,
  primaryListLabel,
  primaryListItems,
  secondaryListLabel,
  secondaryListItems,
  footerLabel,
  footer,
  anchorsLabel,
  anchors,
  tone
}: {
  eyebrow: string;
  headline: string;
  body: string;
  attachmentLabel: string;
  attachment: string;
  defenseLabel: string;
  defense: string;
  primaryListLabel: string;
  primaryListItems: string[];
  secondaryListLabel?: string;
  secondaryListItems?: string[];
  footerLabel?: string;
  footer?: string;
  anchorsLabel: string;
  anchors: string[];
  tone: "user" | "partner";
}) {
  const accent = tone === "user" ? colors.accent : colors.accentRose;
  return (
    <View style={[styles.blueprintCard, { borderColor: accent }]}>
      <Text style={[styles.eyebrow, { color: accent }]}>{eyebrow}</Text>
      <Text style={styles.blueprintHeadline}>{headline}</Text>
      <Text style={styles.blueprintBody}>{body}</Text>
      <View style={styles.blueprintMetaRow}>
        <View style={styles.blueprintMetaCol}>
          <Text style={styles.metaLabel}>{attachmentLabel}</Text>
          <Text style={styles.metaValue}>{attachment}</Text>
        </View>
        <View style={styles.blueprintMetaCol}>
          <Text style={styles.metaLabel}>{defenseLabel}</Text>
          <Text style={styles.metaValue}>{defense}</Text>
        </View>
      </View>
      <View style={styles.blueprintList}>
        <Text style={[styles.bulletLabel, { color: accent }]}>{primaryListLabel}</Text>
        {primaryListItems.map((item, idx) => (
          <Text key={`${item}-${idx}`} style={styles.bulletItem}>· {item}</Text>
        ))}
      </View>
      {secondaryListLabel && secondaryListItems && secondaryListItems.length ? (
        <View style={styles.blueprintList}>
          <Text style={[styles.bulletLabel, { color: colors.success }]}>{secondaryListLabel}</Text>
          {secondaryListItems.map((item, idx) => (
            <Text key={`${item}-${idx}`} style={styles.bulletItem}>· {item}</Text>
          ))}
        </View>
      ) : null}
      {footerLabel && footer ? (
        <View style={styles.blueprintFooter}>
          <Text style={[styles.metaLabel, { color: colors.danger }]}>{footerLabel}</Text>
          <Text style={styles.blueprintFooterText}>{footer}</Text>
        </View>
      ) : null}
      {anchors.length ? (
        <View style={styles.blueprintAnchors}>
          <Text style={styles.anchorsLabel}>{anchorsLabel}</Text>
          <View style={styles.anchorsRow}>
            {anchors.map((anchor, idx) => (
              <View key={`${anchor}-${idx}`} style={[styles.anchorChip, { borderColor: accent }]}>
                <Text style={[styles.anchorChipText, { color: accent }]}>{anchor}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md
  },
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
  headerTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900"
  },
  headerSubtitle: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "600"
  },
  headerMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  headerTimeNote: {
    flex: 1,
    minWidth: 180,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17
  },
  confidenceBadge: {
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "flex-start",
    gap: 2
  },
  confidenceLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.6
  },
  confidencePct: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  scoreStrip: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  scoreLabel: {
    color: colors.muted,
    fontSize: 12,
    width: "38%"
  },
  scoreBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceMid,
    borderRadius: 3,
    overflow: "hidden"
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 3
  },
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
  eyebrow: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5
  },
  eyebrowAccent: {
    color: featureColors.relationship.accent
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900"
  },
  sectionHeadline: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22
  },
  sectionBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent
  },
  tagText: {
    color: colors.accentStrong,
    fontSize: 12,
    fontWeight: "700"
  },
  tagWarn: {
    backgroundColor: "rgba(216,181,109,0.18)",
    borderColor: colors.accentGold
  },
  tagTextWarn: {
    color: colors.accentGold
  },
  blueprintRow: {
    gap: spacing.md
  },
  blueprintCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  blueprintHeadline: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 22
  },
  blueprintBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  blueprintMetaRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  blueprintMetaCol: {
    flex: 1,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceMid,
    padding: spacing.sm,
    gap: 4
  },
  blueprintList: {
    gap: 4
  },
  blueprintFooter: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(244,114,114,0.28)",
    backgroundColor: "rgba(244,114,114,0.08)",
    padding: spacing.sm,
    gap: 4
  },
  blueprintFooterText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18
  },
  blueprintAnchors: {
    gap: spacing.xs
  },
  anchorsLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1
  },
  anchorsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  anchorChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.surfaceMid
  },
  anchorChipText: {
    fontSize: 10,
    fontWeight: "800"
  },
  bulletGroup: {
    gap: 4
  },
  bulletLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1
  },
  bulletLabelDanger: {
    color: colors.danger
  },
  bulletItem: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19
  },
  aspectsBlock: {
    gap: spacing.xs
  },
  aspectRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginTop: 4
  },
  aspectChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  aspectChipText: {
    fontSize: 11,
    fontWeight: "800"
  },
  aspectMeaning: {
    flex: 1,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  aspectSentiment: {
    color: colors.faint,
    fontStyle: "italic"
  },
  choreoBlock: {
    gap: spacing.xs
  },
  chainCard: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMid,
    padding: spacing.sm,
    gap: 4
  },
  chainLine: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18
  },
  chainTag: {
    color: colors.accent,
    fontWeight: "900"
  },
  repairCard: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderGlow,
    backgroundColor: colors.surfaceSoft,
    padding: spacing.sm,
    gap: 4
  },
  repairLabel: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1
  },
  repairBody: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19
  },
  rolesRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  roleCard: {
    flex: 1,
    backgroundColor: colors.surfaceMid,
    borderRadius: radii.sm,
    padding: spacing.sm,
    gap: 4
  },
  roleLabel: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1
  },
  roleBody: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18
  },
  timingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  timingDate: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6
  },
  pressureBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  pressureBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4
  },
  timingMetaRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  timingMetaCol: {
    flex: 1,
    gap: 4
  },
  metaLabel: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1
  },
  metaValue: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18
  },
  actionKindBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent
  },
  actionKindText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.6
  },
  sampleCard: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderGlow,
    backgroundColor: colors.surfaceSoft,
    padding: spacing.sm,
    gap: spacing.xs
  },
  sampleHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sampleLabel: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2
  },
  sampleTone: {
    color: colors.muted,
    fontSize: 11
  },
  sampleText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
    fontStyle: "italic"
  },
  copyHint: {
    flexDirection: "row",
    gap: 4,
    alignSelf: "flex-start",
    alignItems: "center"
  },
  copyHintText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  historyDelta: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  historyDeltaPill: {
    fontSize: 14,
    fontWeight: "900"
  },
  evidence: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  evidenceHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  evidenceEyebrow: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4
  },
  evidenceBody: {
    gap: spacing.xs
  },
  evidenceItem: {
    color: colors.muted,
    fontSize: 12
  },
  evidenceNote: {
    color: colors.faint,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: "italic"
  },
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
  evidenceFactorText: {
    color: colors.muted,
    fontSize: 10,
    letterSpacing: 0.6
  }
});
