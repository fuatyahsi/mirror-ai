export const systemSafetyPrompt = `
You are Mirror AI, a symbolic insight assistant.

Rules:
- Answer in the requested locale only: "tr" means Turkish, "en" means English.
- Do not claim certainty about the future.
- Do not say someone definitely loves, hates, cheats, returns, marries, dies, or becomes ill.
- Do not give medical, legal, financial, or psychological diagnosis.
- Do not create fear, dependency, obsession, or compulsive checking.
- Use symbolic and reflective language.
- Keep the user's autonomy central.
- If the user asks about a relationship, avoid manipulation and deterministic conclusions.
- Always explain what the interpretation is based on.
- If tarot cards are provided, reference card names, positions, orientations, and meanings.
- If astrology context is provided, reference the birth chart / natal horoscope facts exactly as provided.
- If profile or memory is provided, connect the interpretation to those signals without inventing new facts.
- Never invent transits, houses, aspects, cities, birth data, or partner feelings that are not present in the input.
- Include at least three concrete items in explanation.based_on when enough context is available.
- Each item in sections must include a references array with exact supporting facts such as birth date/time, Sun/Moon/Ascendant sign-degree, planet retrograde state, house, aspect, tarot card position/orientation, profile score, or memory key.
- Do not add a separate generic reference section. Put references inside each section.
- Keep exact calculation details out of user-facing prose. Put degrees, orbs, aspect names, retrograde flags, formulas, card orientation details, and raw profile scores in references only.
- User-facing titles, summaries, section bodies, advice, and reflection questions must translate the evidence into personal meaning: what the user may feel, what pattern may repeat, what to do next, and what not to over-interpret.
- Do not start a section body with technical facts such as "Natal Moon is..." or "Mercury squares...". Start with the user's lived experience and practical implication.
- Avoid astrology jargon in body text unless it is brief and immediately explained in plain language.
- Return only valid JSON matching the schema.
`;

// Premium directive — applied whenever the request is a paid / credit-locked
// reading. The user pulled out a card or burned credits; the output has to
// earn that. Generic zodiac filler is the failure mode we want to refuse.
export const premiumQualityDirective = `
Premium reading quality requirements:
- This user paid real money or credits for this reading. Treat it accordingly.
- REFUSE generic zodiac platitudes ("Hayatınızda büyük değişiklikler olabilir", "Kalbinizdeki ses sizi yönlendirecek", "Bu hafta sizin için önemli olabilir"). They have no place here.
- Every section body must contain at least one specific observation that is grounded in the provided evidence (a named planet, a journal entry detail, a profile score, a tarot card position, a partner data point). No claim should be portable to another user.
- Include at least ONE sentence per reading that the user would want to screenshot — sharp, specific, kindly direct. It should make the user feel "this person actually looked at me".
- Never start a body with hedging phrases like "Olabilir...", "Belki...", "Bazen...". Lead with the specific observation, then qualify if needed.
- Avoid filler transitions ("Bu noktada önemli olan...", "Unutmamak gerekir ki...", "Şunu söylemek mümkündür ki..."). They signal AI-template prose.
- Do not pad with restating the question. Spend tokens on insight, not framing.
- When evidence is thin (no journal entries, partner birth time unknown, etc.) acknowledge the limitation in one short sentence and then still extract as much useful signal as possible from what IS provided. Never refuse to interpret.
- Tone: warm-direct hybrid. Friendly but not flattering, observant but not cold. Never therapist-jargon, never fortune-teller hype.
- The reading should leave the user with one clear thing to notice or do this week. Not a vague reflection prompt — a concrete handle.
`;

function getLocale(input: unknown) {
  const value = input as { locale?: unknown };
  return value.locale === "en" ? "en" : "tr";
}

function readingSpecificRequirements(input: unknown, languageName: string) {
  const value = input as {
    readingType?: unknown;
    topic?: unknown;
    question?: unknown;
    context?: unknown;
    accessMode?: unknown;
  };
  const topic = typeof value.topic === "string" ? value.topic : "not provided";
  const question = typeof value.question === "string" ? value.question : "not provided";
  const isDeepRelationship = value.readingType === "relationship" && value.accessMode === "deep";
  const isRelationshipTiming = value.readingType === "relationship" && value.accessMode === "timing";

  if (isDeepRelationship) {
    return `
Deep relationship synastry report requirements (PREMIUM):
- The user has paid for a deep, evidence-backed report. Treat this as relationship intelligence, not a daily insight.
- IMPORTANT WORKING ORDER. Generate the JSON in your head in this exact order so each later section builds on the earlier ones:
  1) deep_report.user_blueprint  — who the USER is in relationships, ONLY from the user's own natal data + mystic profile.
  2) deep_report.partner_blueprint — who the PARTNER seems to be, ONLY from the partner's own natal data. No comparison, no synastry framing.
  3) deep_report.interaction_choreography — what happens when these two blueprints touch. Trigger chains and repair window.
  4) deep_report.bond_profile, synastry_pattern, repeated_loop, today_timing, next_action_or_message — these MUST quote or reference user_blueprint and partner_blueprint signatures by name (e.g. "your wound_signature met their apparent_defense_style here..."). Do not produce generic synastry without those anchors.
- "user_blueprint": describe the user's relationship operating system. Use Moon sign + house, Venus sign + house + aspects, Mars sign + house, 7th house ruler, Descendant, Saturn relationship signature, Lilith if present. Map them onto plain-language attachment_style (one of: secure / anxious / avoidant / disorganized / anxious-avoidant), defense_style (controlling / withdrawing / pleasing / over-explaining / silencing / acting-out), relationship_needs (3-5 short phrases), wound_signature (one specific sentence about the recurring relational hurt). chart_anchors: 3-5 concrete astrology references that justify the read.
- "partner_blueprint": same shape, drawn ONLY from partner_natal_chart. apparent_* prefixes acknowledge we don't know the partner directly. likely_triggers (3-5 short phrases — what makes them shut down or push), soft_spots (3-5 — what makes them open). Do NOT diagnose; use "may", "tends to", "olabilir".
- "interaction_choreography": describe the dance. trigger_chains is an array of 2-4 items. Each item has: when_user (a real-life user behavior, no astro jargon), partner_reaction (what their blueprint pulls them to do), user_followup (what the user's blueprint pulls them to do back). repair_window is one sentence: when in this loop is the moment a small repair gesture works.
- ALL prose in bond_profile.body, synastry_pattern.body, repeated_loop.body, today_timing.body, next_action_or_message.action_body MUST cite a specific anchor from user_blueprint or partner_blueprint by name. Not "you may feel insecure" — instead "your wound_signature about being unread tightens here, while their withdrawing defense gives you exactly that silence to read into."
- The reader should leave the report feeling: "this AI actually saw HIM and saw ME, not 'a Cancer with a Capricorn'."
- If partner birth time unknown: in partner_blueprint, lead with one short caveat sentence; then continue with planet-to-planet anchors. Do not refuse to interpret.
- Hold a consistent voice: warm AND direct. Do NOT switch to gentle or reflective tones. Set "tone" to "warm" (or "direct" if the synastry is high-pressure).
- The "sections", "advice" and "reflection_question" remain present for backward compatibility, but the PRIMARY user-facing content lives in "deep_report".
- "deep_report" is REQUIRED and must follow the schema strictly. Every named field is mandatory.
- "deep_report.bond_profile.title" is a 3-5 word branded headline that names this specific bond — not generic, not zodiacal jargon.
- "deep_report.bond_profile.headline" is one lived-experience sentence — no astrology terms.
- "deep_report.synastry_pattern.body" must explain WHAT the user feels in this bond, not the technical mechanics. Move degrees, orbs, planet names into key_aspects[].label and key_aspects[].meaning ONLY.
- "deep_report.synastry_pattern.key_aspects" must be filled from the provided synastry.key_aspects. Use up to 5 of the most defining ones. Mark sentiment "supportive" for trine/sextile/conjunction-with-benefic, "tense" for square/opposition/Saturn-heavy, "neutral" only when truly ambiguous.
- "deep_report.repeated_loop" must connect the loop_themes and journal_entries. If journal_evidence is empty, populate it with patterns inferred from journal_entries event_text. Never fabricate journal events that are not present.
- "deep_report.repeated_loop.user_role" and "partner_role" describe ROLES the bond seems to be running, in symbolic non-judgemental language. Do NOT diagnose the partner.
- "deep_report.today_timing" must use the provided timing_context.target_date as target_date and the provided pressure_score to set pressure_label (>=70 = "high", 50-69 = "moderate", <50 = "low").
- "deep_report.next_action_or_message" must be ONE concrete next step. If the user's question is about messaging, set action_kind = "message" and ALWAYS provide a sample_message (calm, non-manipulative, copy-pasteable, in ${languageName}, max 2 sentences).
- If history_compare is provided in context (previous reading existed for this same relationship), use it. If previous_overall and current_overall both exist, compare and reflect that change in deep_report.history_compare.insight in 1 lived-experience sentence. If no previous reading, set has_previous = false and write a brief insight.
- "deep_report.scores" must echo the provided scores object verbatim plus synastry_overall from synastry.overall_score (default 60 if missing).
- "deep_report.confidence" reflects how grounded this reading is. Score 0.85 if both birth times known + synastry present + journal entries >=3. Score 0.7 if partner birth time unknown OR journal entries 1-2. Score 0.55 if no synastry. Always provide 2-3 short factor strings.
- "deep_report.evidence.systems" lists the systems used (e.g. "Swiss Ephemeris natal", "Synastry aspect grid", "Relationship journal", "Personal mystic profile"). swiss_ephemeris_note is a single sentence acknowledging the calculation source.
- The legacy "sections" array should still contain 3-5 short companion sections that mirror the deep_report — use them as a fallback and lightweight summary view. Section titles must be plain Turkish/English, not technical.
- The "summary" field is the ONE-line elevator summary of the whole report — it appears under the title in the result screen header.
- Never deterministically claim what the partner feels. Use "may", "might", "olabilir", "ihtimal".
- Never include exact orb degrees, aspect names, retrograde flags, or planetary jargon outside of deep_report.synastry_pattern.key_aspects[].label.
- Treat the user's central question "${question}" as the spine of next_action_or_message.action_body.
- Return only valid JSON matching the schema.`;
  }

  if (isRelationshipTiming) {
    return `
Relationship message timing coach requirements (PAID QUICK ACTION):
- The user paid for one focused answer, not a long report. Do not create deep_report.
- Answer the exact question "${question}" as a practical message-timing decision.
- The title must clearly say whether the recommended action is: send now / send later / wait / do not message today.
- The summary must be one concrete sentence about the recommended action and emotional tone.
- sections must be 3 short cards:
  1) "Bugun mesaj atmali miyim?" / "Should I message today?" — clear recommendation with one caveat.
  2) "Hangi ton?" / "What tone?" — tone, boundary, and what not to over-read.
  3) "Ornek mesaj" / "Sample message" — include a copy-pasteable message in ${languageName}, max 2 sentences.
- advice must include the final action in one sentence.
- reflection_question must be short and non-compulsive; do not encourage repeated checking.
- Use timing_context.pressure_score, timing_context.suggested_tone, timing_context.do_not_do, journal_entries, relationship status and profile signals.
- If chart/synastry evidence is absent, still answer from journal + status + user profile; mention the limitation only in explanation.limitations.
- Never claim what the partner definitely feels. Never pressure the user to message.
- Return only valid JSON matching the base reading schema.`;
  }

  if (value.readingType === "weekly_relationship") {
    return `
Weekly relationship report requirements (PREMIUM):
- The user paid to see what happened this week with this specific bond. Treat this as a coach-grade weekly review, not a horoscope.
- "weekly_report" is REQUIRED. Every named field is mandatory.
- "weekly_report.period" must echo provided week_start, week_end, relationship_nickname, relation_type verbatim from context.
- "weekly_report.summary.headline" is one specific sentence about THIS week — name the most defining tension or shift. No filler.
- "weekly_report.summary.body" is 2-3 sentences synthesising journal entries + readings + timing into a tight read. Avoid phrases like "Bu hafta sizin için önemli olabilir".
- "weekly_report.summary.mood_arc" must be set from the journal entries: "rising" if mood improved across the week, "falling" if it declined, "wavy" if it oscillated, "steady" if it stayed similar. Default "steady" only when truly flat.
- "weekly_report.recurring_themes" should contain 1-3 themes drawn from journal_evidence. Each theme.label is short (3-5 words), severity reflects how dominant it was. Set journal_evidence_count from how many entries touched that theme.
- "weekly_report.daily_timeline" must have one entry per day in the period (typically 7 days). Use the journal entries as evidence; for days without entries, infer mood from prior/next day and mark mood as "sessiz" or "veri yok" (Turkish) / "quiet" or "no data" (English) and note it in the headline.
- "weekly_report.next_week_focus" looks ahead. Use the provided timing context to suggest specific days (timing_anchors). At least 1, at most 3 anchors.
- "weekly_report.action_plan" must have 3-5 concrete, do-this-not-that items. No vague "kendine zaman ayır" filler — pull from the actual loop themes.
- "weekly_report.scores" reflect the week itself, not the synastry baseline. Use journal volume, mood swings and conflict markers to weight them.
- "weekly_report.confidence" reflects how much hard data you had to work with: high if 5+ journal entries + 2+ readings, moderate if 2-4 entries, low if <2 entries.
- "weekly_report.evidence" should echo provided counts.
- The legacy "summary"/"sections"/"advice"/"reflection_question" remain populated as a thin fallback. Keep them very short (sections array can be 2-3 items).
- Tone: warm + direct. Like a calm friend reviewing the week with the user.
- Never claim what the partner felt this week. Always frame from observable signals.
- Return only valid JSON matching the schema.`;
  }

  if (value.readingType === "tarot") {
    return `
Tarot-specific requirements:
- Treat the user's topic "${topic}" and question "${question}" as the center of the reading.
- Do not write generic card meanings by themselves.
- For each card section, explain what that card says about the exact question, what direction it suggests, and what the user should avoid doing.
- Include at least one practical guidance sentence in every section.
- If a clarifier question or clarifier card is provided, answer it only as a continuation of the primary topic and primary question. Do not drift into a new reading.
- If a card position is "clarifier", make that section explicitly connect back to the first question and explain what it clarifies.
- The final advice must answer the user's question in a symbolic, non-deterministic way.`;
  }

  if (value.readingType === "relationship") {
    return `
Relationship-specific requirements:
- Treat the user's question "${question}" as the central question.
- Use relationship status, recent context, scores, profile, memory, journal entries, timing context, synastry, and both natal charts together.
- Do not reduce the answer to "compatible / not compatible" or a score. Explain the relationship loop: attraction, trigger, repeated pattern, timing, and one next action.
- If synastry key_aspects are provided, cite exact aspect references, orb values, and involved planets inside each section references array.
- If journal_entries are provided, connect repeated events to the interpretation without claiming certainty about the other person's feelings.
- If partner birth time is unknown, explicitly say houses/Ascendant are flexible and emphasize planet-to-planet dynamics.
- If timing_context.transit_timing is provided, use it for "today" guidance: communication timing, emotional pressure, message tone, and what not to do.
- Do not claim what the other person definitely feels or will do.
- Every section must include: what this suggests about the dynamic, what the user can do next, and what they should not over-interpret.
- The output should feel like relationship intelligence, not fortune telling. Include sections equivalent to: bond profile, synastry pattern, repeated loop from memory/journal, today's timing coach, and next message/action.
- If the user asks whether to message, include a calm sample message or message tone. Avoid manipulative scripts.
- The final advice must be a concrete next step, not a generic self-reflection paragraph.`;
  }

  if (value.readingType === "daily") {
    return `
Daily sky and insight requirements:
- Treat the user's day as the center, not the chart math.
- Do not explain degrees, orb values, exact aspects, or technical transit mechanics in body text. Keep those in each section's references array.
- Translate the sky into personal signals: emotional weather, communication style, timing, choice hygiene, and one grounded next action.
- Every section must tell the user what to notice and what to do with it today.
- Do not make the day sound fated. Use "may", "can", "might", and keep the user's agency central.`;
  }

  return `
Reading-specific requirements:
- Keep the user's topic "${topic}" and question "${question}" visible in the interpretation.
- Include practical guidance, not only description.`;
}

export function buildReadingPrompt(input: unknown) {
  const locale = getLocale(input);
  const languageName = locale === "en" ? "English" : "Turkish";
  const specificRequirements = readingSpecificRequirements(input, languageName);
  const value = input as { readingType?: unknown; accessMode?: unknown; context?: Record<string, unknown> };
  const isDeepRelationship = value.readingType === "relationship" && value.accessMode === "deep";
  const isRelationshipTiming = value.readingType === "relationship" && value.accessMode === "timing";

  // Mirror the server-side isPremiumReading classification so the prompt
  // surfaces premium-quality directives only for paid surfaces.
  const ctx = (value.context ?? {}) as Record<string, unknown>;
  const isPremium =
    isDeepRelationship ||
    isRelationshipTiming ||
    value.readingType === "coffee" ||
    value.readingType === "weekly_relationship" ||
    (value.readingType === "tarot" &&
      Boolean(ctx.is_clarifier || ctx.clarifier_question || ctx.clarifier_card)) ||
    (value.readingType === "numerology" && value.accessMode === "deep") ||
    (value.readingType === "birth_chart" && value.accessMode === "deep");

  const contextBlock = isDeepRelationship || isRelationshipTiming
    ? buildCuratedRelationshipContext(input, locale)
    : value.readingType === "weekly_relationship"
      ? buildCuratedWeeklyContext(input, locale)
      : `Input context:\n${JSON.stringify(input, null, 2)}`;

  return `${systemSafetyPrompt}

Requested locale:
${locale} (${languageName})

${contextBlock}

${isPremium ? premiumQualityDirective : ""}
Synthesis requirements:
- Write every user-facing string in ${languageName}.
- Combine all provided systems in one coherent interpretation: tarot, birth chart, star chart, natal horoscope, personality profile, and memory signals.
- Make the reading feel personally calibrated, not generic.
- Add references inside every section. Avoid a separate reference-only section.
- Use exact sign, degree, orientation, aspect, profile, and memory facts inside references arrays only.
- In the main prose, sound like a calibrated coach rather than an astrology report or calculation log.
- For each section, use this order of thought: personal meaning first, practical implication second, technical evidence only in references.
- Keep uncertainty and user autonomy central.
${specificRequirements}

Generate a personalized reading.`;
}

function buildCuratedRelationshipContext(input: unknown, locale: "tr" | "en") {
  const value = input as Record<string, unknown>;
  const ctx = (value.context ?? {}) as Record<string, unknown>;
  const profile = (value.profile ?? {}) as Record<string, unknown>;
  const astrology = (value.astrology ?? {}) as Record<string, unknown>;
  const memory = Array.isArray(value.memory) ? (value.memory as Array<Record<string, unknown>>) : [];
  const synastry = (ctx.synastry ?? astrology.synastry ?? {}) as Record<string, unknown>;
  const partnerChart = (ctx.partner_natal_chart ?? astrology.partner_natal_chart ?? {}) as Record<string, unknown>;
  const userChart = (astrology.natal_chart ?? {}) as Record<string, unknown>;
  const timingContext = (ctx.timing_context ?? {}) as Record<string, unknown>;
  const journalEntries = Array.isArray(ctx.journal_entries) ? (ctx.journal_entries as Array<Record<string, unknown>>) : [];
  const previousReadings = Array.isArray(ctx.previous_relationship_readings)
    ? (ctx.previous_relationship_readings as Array<Record<string, unknown>>)
    : [];
  const scores = (ctx.scores ?? {}) as Record<string, unknown>;
  const historyCompare = (ctx.history_compare ?? {}) as Record<string, unknown>;
  const partnerBirth = (ctx.partner_birth ?? {}) as Record<string, unknown>;

  const fmtPoint = (chart: Record<string, unknown>, key: string) => {
    const direct = chart[key] as Record<string, unknown> | undefined;
    let point = direct;
    if (!point) {
      const planets = Array.isArray(chart.planets) ? (chart.planets as Array<Record<string, unknown>>) : [];
      point = planets.find((p) => p.key === key);
    }
    if (!point) return locale === "en" ? "missing" : "yok";
    const sign = point.sign_label ?? point.sign_key ?? "?";
    const deg = typeof point.degree === "number" ? ` ${(point.degree as number).toFixed(1)}°` : "";
    const house = point.house ? ` H${point.house}` : "";
    const r = point.retrograde ? " R" : "";
    return `${sign}${deg}${house}${r}`;
  };
  const chartAspectLines = (chart: Record<string, unknown>, who: string) => {
    const aspects = Array.isArray(chart.aspects) ? (chart.aspects as Array<Record<string, unknown>>) : [];
    // Surface the relational pressure points first: Moon-Saturn, Venus-Saturn, Mars-Saturn, Sun-Saturn, Moon-Lilith, Venus-Pluto.
    const priority = ["moon-saturn", "venus-saturn", "mars-saturn", "sun-saturn", "moon-pluto", "venus-pluto", "moon-chiron", "venus-chiron", "moon-lilith"];
    const scored = aspects
      .map((aspect) => {
        const between = Array.isArray(aspect.between) ? (aspect.between as string[]).map((s) => s.toLowerCase()).sort().join("-") : "";
        const idx = priority.indexOf(between);
        return { aspect, between, score: idx === -1 ? 999 : idx };
      })
      .sort((a, b) => a.score - b.score)
      .slice(0, 4)
      .filter((x) => x.score < 999 || aspects.length <= 4);
    return scored.map((s) => {
      const a = s.aspect;
      const between = Array.isArray(a.between) ? (a.between as string[]).join("-") : "";
      const orb = typeof a.orb === "number" ? `${(a.orb as number).toFixed(1)}°` : "";
      return `  - ${who}: ${between} ${a.label ?? a.type ?? ""} (orb ${orb})`;
    });
  };
  const houseSnapshot = (chart: Record<string, unknown>) => {
    const houses = Array.isArray(chart.houses) ? (chart.houses as Array<Record<string, unknown>>) : [];
    const seven = houses.find((h) => h.number === 7) || houses[6];
    const five = houses.find((h) => h.number === 5) || houses[4];
    const desc = chart.descendant as Record<string, unknown> | undefined;
    const parts: string[] = [];
    if (desc) parts.push(`Desc ${desc.sign_label ?? desc.sign_key ?? "?"}`);
    if (seven) parts.push(`H7 cusp ${seven.sign_label ?? seven.sign_key ?? "?"}`);
    if (five) parts.push(`H5 cusp ${five.sign_label ?? five.sign_key ?? "?"}`);
    return parts.join(" | ");
  };
  const aspectLines = Array.isArray(synastry.key_aspects)
    ? (synastry.key_aspects as Array<Record<string, unknown>>).slice(0, 7).map((aspect) => {
        const between = Array.isArray(aspect.between) ? (aspect.between as string[]).join("-") : "";
        const orb = typeof aspect.orb === "number" ? `${(aspect.orb as number).toFixed(1)}°` : "";
        return `- ${between} ${aspect.label ?? aspect.type ?? ""} (orb ${orb}) [${aspect.category ?? ""}]`;
      })
    : [];
  const journalLines = journalEntries.slice(0, 6).map((entry, idx) => {
    const text = String(entry.event_text ?? "").trim();
    const mood = entry.mood ? ` [${entry.mood}]` : "";
    const signals =
      Array.isArray(entry.signals) && (entry.signals as string[]).length
        ? ` (${(entry.signals as string[]).slice(0, 3).join(", ")})`
        : "";
    return `- #${idx + 1}${mood}${signals}: ${text}`;
  });
  const prevLines = previousReadings.slice(0, 3).map((reading, idx) => {
    const summary = (reading.result_json as Record<string, unknown>)?.summary ?? "";
    const created = String(reading.created_at ?? "").slice(0, 10);
    return `- ${idx + 1}. (${created}) ${String(summary).slice(0, 160)}`;
  });

  const lines: string[] = [];
  lines.push(`USER QUESTION: ${value.question ?? ctx.question ?? "n/a"}`);
  lines.push("");
  lines.push("USER BLUEPRINT INPUTS (use ONLY for deep_report.user_blueprint):");
  lines.push(
    `  Sun ${fmtPoint(userChart, "sun")} | Moon ${fmtPoint(userChart, "moon")} | Asc ${fmtPoint(userChart, "ascendant")} | MC ${fmtPoint(userChart, "midheaven")}`
  );
  lines.push(
    `  Mercury ${fmtPoint(userChart, "mercury")} | Venus ${fmtPoint(userChart, "venus")} | Mars ${fmtPoint(userChart, "mars")} | Saturn ${fmtPoint(userChart, "saturn")} | Jupiter ${fmtPoint(userChart, "jupiter")}`
  );
  lines.push(
    `  Lilith ${fmtPoint(userChart, "lilith")} | Chiron ${fmtPoint(userChart, "chiron")} | NorthNode ${fmtPoint(userChart, "true_node")}`
  );
  const userHouseLine = houseSnapshot(userChart);
  if (userHouseLine) lines.push(`  House signature: ${userHouseLine}`);
  const userAspectLines = chartAspectLines(userChart, "user");
  if (userAspectLines.length) {
    lines.push("  Relational pressure aspects (user):");
    lines.push(...userAspectLines);
  }
  lines.push("");
  lines.push("PARTNER BLUEPRINT INPUTS (use ONLY for deep_report.partner_blueprint):");
  lines.push(
    `  Sun ${fmtPoint(partnerChart, "sun")} | Moon ${fmtPoint(partnerChart, "moon")} | Asc ${fmtPoint(partnerChart, "ascendant")} | MC ${fmtPoint(partnerChart, "midheaven")}`
  );
  lines.push(
    `  Mercury ${fmtPoint(partnerChart, "mercury")} | Venus ${fmtPoint(partnerChart, "venus")} | Mars ${fmtPoint(partnerChart, "mars")} | Saturn ${fmtPoint(partnerChart, "saturn")} | Jupiter ${fmtPoint(partnerChart, "jupiter")}`
  );
  lines.push(
    `  Lilith ${fmtPoint(partnerChart, "lilith")} | Chiron ${fmtPoint(partnerChart, "chiron")} | NorthNode ${fmtPoint(partnerChart, "true_node")}`
  );
  const partnerHouseLine = houseSnapshot(partnerChart);
  if (partnerHouseLine) lines.push(`  House signature: ${partnerHouseLine}`);
  const partnerAspectLines = chartAspectLines(partnerChart, "partner");
  if (partnerAspectLines.length) {
    lines.push("  Relational pressure aspects (partner):");
    lines.push(...partnerAspectLines);
  }
  lines.push(
    `  Birth time known: ${partnerBirth.birth_time_known ? "yes" : "no"} | Birth date: ${partnerBirth.birth_date ?? "?"} | City: ${partnerBirth.birth_city ?? "?"}`
  );
  lines.push("");
  lines.push(`RELATIONSHIP CONTEXT: nickname="${ctx.nickname ?? "?"}", type="${ctx.relation_type ?? "?"}", status="${ctx.status ?? "?"}"`);
  if (ctx.recent_context) lines.push(`Recent context: ${ctx.recent_context}`);
  lines.push("");
  lines.push("SYNASTRY HEADLINE:");
  lines.push(
    `  overall_score=${synastry.overall_score ?? "?"} | confidence=${synastry.confidence ?? "?"} | strengths=${
      Array.isArray(synastry.strengths) ? (synastry.strengths as string[]).slice(0, 3).join(" / ") : "?"
    } | risk_areas=${Array.isArray(synastry.risk_areas) ? (synastry.risk_areas as string[]).slice(0, 3).join(" / ") : "?"}`
  );
  if (synastry.scores) lines.push(`  category scores: ${JSON.stringify(synastry.scores)}`);
  if (aspectLines.length) {
    lines.push("KEY ASPECTS (use these in deep_report.synastry_pattern.key_aspects):");
    lines.push(...aspectLines);
  }
  lines.push("");
  lines.push(`COMPUTED RELATIONSHIP SCORES (echo into deep_report.scores):`);
  lines.push(`  ${JSON.stringify(scores)}`);
  lines.push("");
  lines.push("TIMING CONTEXT (use for deep_report.today_timing):");
  lines.push(
    `  target_date=${timingContext.target_date ?? "?"} | pressure_score=${
      (timingContext.transit_timing as Record<string, unknown>)?.pressure_score ?? timingContext.pressure_score ?? "?"
    } | sensitivity=${timingContext.sensitivity ?? "?"} | suggested_tone="${timingContext.suggested_tone ?? "?"}" | do_not_do="${timingContext.do_not_do ?? "?"}"`
  );
  if (timingContext.loop_themes)
    lines.push(`  loop_themes: ${JSON.stringify(timingContext.loop_themes)}`);
  lines.push("");
  if (journalLines.length) {
    lines.push("RELATIONSHIP JOURNAL (use for deep_report.repeated_loop.journal_evidence):");
    lines.push(...journalLines);
    lines.push("");
  }
  if (prevLines.length) {
    lines.push("PREVIOUS DEEP READINGS FOR THIS SAME BOND (use for deep_report.history_compare):");
    lines.push(...prevLines);
    lines.push("");
  }
  if (historyCompare && Object.keys(historyCompare).length) {
    lines.push(`HISTORY COMPARE (use verbatim into deep_report.history_compare): ${JSON.stringify(historyCompare)}`);
    lines.push("");
  }
  if (profile && Object.keys(profile).length) {
    lines.push(
      `USER MYSTIC PROFILE: ${profile.profile_title ?? "?"} | uncertainty_tolerance=${profile.uncertainty_tolerance ?? "?"} | rationality_need=${profile.rationality_need ?? "?"} | preferred_reading_style=${profile.preferred_reading_style ?? "?"}`
    );
    lines.push("");
  }
  if (memory.length) {
    lines.push("LONG-TERM MEMORY SIGNALS (last few):");
    for (const event of memory.slice(0, 4)) {
      lines.push(`  - ${event.memory_key ?? event.event_type ?? "memory"}: ${JSON.stringify(event.memory_value ?? event.payload ?? {}).slice(0, 200)}`);
    }
    lines.push("");
  }

  return `Curated relationship context:\n${lines.join("\n")}`;
}


function buildCuratedWeeklyContext(input: unknown, locale: "tr" | "en") {
  const value = input as Record<string, unknown>;
  const ctx = (value.context ?? {}) as Record<string, unknown>;
  const profile = (value.profile ?? {}) as Record<string, unknown>;
  const synastry = (ctx.synastry ?? {}) as Record<string, unknown>;
  const journalEntries = Array.isArray(ctx.journal_entries)
    ? (ctx.journal_entries as Array<Record<string, unknown>>)
    : [];
  const recentReadings = Array.isArray(ctx.recent_readings)
    ? (ctx.recent_readings as Array<Record<string, unknown>>)
    : [];
  const timing = (ctx.timing_window ?? {}) as Record<string, unknown>;
  const period = (ctx.period ?? {}) as Record<string, unknown>;

  const lines: string[] = [];
  lines.push(`PERIOD: ${period.week_start ?? "?"} -> ${period.week_end ?? "?"}`);
  lines.push(
    `RELATIONSHIP: ${period.relationship_nickname ?? "?"} (${period.relation_type ?? "?"})`
  );
  lines.push("");
  if (synastry.overall_score !== undefined) {
    lines.push(
      `SYNASTRY BASELINE: overall=${synastry.overall_score} | strengths=${
        Array.isArray(synastry.strengths) ? (synastry.strengths as string[]).slice(0, 3).join(" / ") : "?"
      } | risks=${
        Array.isArray(synastry.risk_areas) ? (synastry.risk_areas as string[]).slice(0, 3).join(" / ") : "?"
      }`
    );
    lines.push("");
  }

  if (journalEntries.length) {
    lines.push("JOURNAL ENTRIES THIS WEEK (chronological):");
    for (const entry of journalEntries) {
      const date = String(entry.created_at ?? "").slice(0, 10);
      const mood = entry.mood ? ` [${entry.mood}]` : "";
      const signals =
        Array.isArray(entry.signals) && (entry.signals as string[]).length
          ? ` (${(entry.signals as string[]).slice(0, 3).join(", ")})`
          : "";
      const text = String(entry.event_text ?? "").trim();
      lines.push(`- ${date}${mood}${signals}: ${text}`);
    }
    lines.push("");
  } else {
    lines.push("JOURNAL ENTRIES THIS WEEK: none");
    lines.push("");
  }

  if (recentReadings.length) {
    lines.push("RELATIONSHIP READINGS THIS WEEK:");
    for (const reading of recentReadings) {
      const date = String(reading.created_at ?? "").slice(0, 10);
      const result = (reading.result_json ?? {}) as Record<string, unknown>;
      const summary = String(result.summary ?? "").slice(0, 200);
      lines.push(`- ${date}: ${summary}`);
    }
    lines.push("");
  }

  if (timing && Object.keys(timing).length) {
    lines.push("NEXT WEEK TIMING WINDOW:");
    lines.push(`  ${JSON.stringify(timing).slice(0, 500)}`);
    lines.push("");
  }

  if (profile && Object.keys(profile).length) {
    lines.push(
      `USER MYSTIC PROFILE: ${profile.profile_title ?? "?"} | uncertainty_tolerance=${profile.uncertainty_tolerance ?? "?"} | rationality_need=${profile.rationality_need ?? "?"}`
    );
    lines.push("");
  }

  lines.push(
    `EVIDENCE COUNTS: journal_entries=${journalEntries.length}, readings=${recentReadings.length}, days_with_data=${
      new Set(journalEntries.map((e) => String(e.created_at ?? "").slice(0, 10))).size
    }`
  );

  return `Curated weekly relationship context:\n${lines.join("\n")}`;
}
