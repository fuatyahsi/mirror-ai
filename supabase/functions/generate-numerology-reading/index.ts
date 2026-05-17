import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { getAIProvider } from "../shared/aiProvider.ts";
import { getOptionalUser } from "../shared/auth.ts";
import { recordCreditSpend, requirePaidAccessForUser } from "../shared/credits.ts";
import { buildSourceContext, normalizeLocale, sourceLabels } from "../shared/sourceContext.ts";

type NumerologyCard = {
  key: string;
  label: string;
  value: number | string;
  raw_value?: number;
  meaning: string;
  reference: string[];
};

const meanings: Record<number, { tr: string; en: string }> = {
  1: { tr: "başlatma, cesaret ve kendi yönünü seçme", en: "initiative, courage and choosing your own direction" },
  2: { tr: "bağ kurma, duyarlılık ve denge", en: "bonding, sensitivity and balance" },
  3: { tr: "ifade, görünürlük ve yaratıcı aktarım", en: "expression, visibility and creative communication" },
  4: { tr: "düzen, emek ve güvenli yapı kurma", en: "structure, effort and building reliable ground" },
  5: { tr: "değişim, hareket ve özgürleşme", en: "change, movement and liberation" },
  6: { tr: "ilişki bakımı, sorumluluk ve uyum", en: "relational care, responsibility and harmony" },
  7: { tr: "içe dönüş, anlam arama ve sezgisel analiz", en: "inner reflection, meaning-seeking and intuitive analysis" },
  8: { tr: "güç, sınır ve özdeğer", en: "power, boundary and self-worth" },
  9: { tr: "tamamlama, şefkat ve geniş perspektif", en: "completion, compassion and wider perspective" },
  11: { tr: "sezgisel farkındalık ve hassas algı", en: "intuitive awareness and heightened sensitivity" },
  22: { tr: "büyük yapı kurma ve uzun vadeli etki", en: "large-scale building and long-term impact" },
  33: { tr: "şefkatli rehberlik ve iyileştirici ifade", en: "compassionate guidance and healing expression" }
};

const pythagoreanValues: Record<string, number> = {
  A: 1,
  J: 1,
  S: 1,
  B: 2,
  K: 2,
  T: 2,
  C: 3,
  L: 3,
  U: 3,
  D: 4,
  M: 4,
  V: 4,
  E: 5,
  N: 5,
  W: 5,
  F: 6,
  O: 6,
  X: 6,
  G: 7,
  P: 7,
  Y: 7,
  H: 8,
  Q: 8,
  Z: 8,
  I: 9,
  R: 9
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { supabase, user } = await getOptionalUser(req);
    const body = await req.json();
    const locale = normalizeLocale(body.locale);
    const labels = sourceLabels(locale);
    const creditAccess = body.deep === true ? await requirePaidAccessForUser("deep_numerology", user?.id) : null;

    const [{ data: dbProfile }, { data: userProfile }, { data: dbMemory }, { data: chartRow }] = user
      ? await Promise.all([
          supabase.from("user_personality_profile").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("users_profile").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("memory_events").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8),
          supabase
            .from("birth_charts")
            .select("chart_json")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        ])
      : [{ data: null }, { data: null }, { data: [] }, { data: null }];

    const birthDate = body.birth_date ?? userProfile?.birth_date;
    if (!birthDate) return jsonResponse({ error: "birth_date is required" }, 400);

    const name = String(body.name ?? userProfile?.display_name ?? "").trim();
    const profile = dbProfile ?? body.profile ?? body.client_profile ?? null;
    const memory = dbMemory?.length ? dbMemory : (body.memory ?? body.client_memory ?? []);
    const astrology = body.astrology ?? body.astro_context ?? body.natal_chart ?? chartRow?.chart_json ?? null;
    const report = buildNumerologyReport({ birthDate, name, locale, profile, astrology });

    const provider = getAIProvider();
    const sourceContext = buildSourceContext({
      readingType: "numerology",
      locale,
      profile,
      memory,
      astrology,
      extra: [
        `${labels.topic}: numerology`,
        `${locale === "en" ? "Birth date" : "Doğum tarihi"}: ${birthDate}`,
        ...report.cards.map((card) => `${card.label}: ${card.value} (${card.meaning})`)
      ]
    });

    const result = await provider.generateReading({
      readingType: "numerology",
      userId: user?.id,
      topic: body.topic ?? "numerology",
      question:
        body.question ??
        (locale === "en"
          ? "What do these numerology patterns suggest for my current personal cycle?"
          : "Bu numeroloji örüntüleri şu anki kişisel döngüm için ne söylüyor?"),
      context: {
        numerology_report: report,
        deep: body.deep === true,
        astrology_context: astrology
      },
      profile,
      memory,
      astrology,
      locale
    });

    if (!user) {
      return jsonResponse({
        reading_id: crypto.randomUUID(),
        persisted: false,
        report,
        ...result,
        source_context: sourceContext
      });
    }

    const { data: reading, error } = await supabase
      .from("readings")
      .insert({
        user_id: user.id,
        reading_type: "numerology",
        topic: body.topic ?? "numerology",
        question: body.question ?? null,
        result_json: { ...result, report, source_context: sourceContext },
        explanation_json: result.explanation,
        confidence: result.explanation.confidence,
        premium_used: Boolean(creditAccess?.isPremium || creditAccess?.shouldSpendCredits)
      })
      .select("id")
      .single();

    if (error) throw error;

    const billing = creditAccess ? await recordCreditSpend(user.id, creditAccess, reading.id) : null;

    return jsonResponse({
      reading_id: reading.id,
      persisted: true,
      billing,
      report,
      ...result,
      source_context: sourceContext
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});

function buildNumerologyReport({
  birthDate,
  name,
  locale,
  profile,
  astrology
}: {
  birthDate: string;
  name?: string;
  locale: "tr" | "en";
  profile: Record<string, unknown> | null;
  astrology: Record<string, unknown> | null;
}) {
  const [yearText, monthText, dayText] = birthDate.split("-");
  const currentYear = new Date().getFullYear();
  const lifePath = reduceWithPath(`${yearText}${monthText}${dayText}`);
  const birthDay = reduceWithPath(dayText);
  const attitude = reduceWithPath(`${monthText}${dayText}`);
  const personalYear = reduceWithPath(`${dayText}${monthText}${currentYear}`);
  const nameNumber = name ? calculateNameNumber(name) : null;
  const profileTitle =
    typeof profile?.profile_title === "string"
      ? profile.profile_title
      : locale === "en"
        ? "calibrating profile"
        : "kalibre edilen profil";

  const sun = readAstroPoint(astrology, "sun", locale);
  const moon = readAstroPoint(astrology, "moon", locale);
  const ascendant = readAstroPoint(astrology, "ascendant", locale);

  const cards: NumerologyCard[] = [
    card("life_path", locale === "en" ? "Life path" : "Yaşam yolu", lifePath, locale, [
      `${locale === "en" ? "Birth date" : "Doğum tarihi"}: ${birthDate}`,
      `${locale === "en" ? "Calculation" : "Hesap"}: ${lifePath.path}`,
      sun
    ]),
    card("birth_day", locale === "en" ? "Birth day tone" : "Doğum günü tonu", birthDay, locale, [
      `${locale === "en" ? "Day" : "Gün"}: ${Number(dayText)}`,
      `${locale === "en" ? "Calculation" : "Hesap"}: ${birthDay.path}`,
      moon
    ]),
    card("attitude", locale === "en" ? "First reaction style" : "İlk tepki stili", attitude, locale, [
      `${locale === "en" ? "Month + day" : "Ay + gün"}: ${Number(monthText)} + ${Number(dayText)}`,
      `${locale === "en" ? "Calculation" : "Hesap"}: ${attitude.path}`,
      ascendant
    ]),
    card("personal_year", locale === "en" ? "Personal year" : "Kişisel yıl", personalYear, locale, [
      `${locale === "en" ? "Birth day + month + current year" : "Doğum günü + ay + mevcut yıl"}: ${Number(dayText)}.${Number(monthText)}.${currentYear}`,
      `${locale === "en" ? "Calculation" : "Hesap"}: ${personalYear.path}`
    ])
  ];

  if (nameNumber) {
    cards.push(
      card("name_vibration", locale === "en" ? "Name vibration" : "İsim titreşimi", nameNumber, locale, [
        `${locale === "en" ? "Name" : "İsim"}: ${name}`,
        `${locale === "en" ? "Calculation" : "Hesap"}: ${nameNumber.path}`
      ])
    );
  }

  cards.push({
    key: "profile_bridge",
    label: locale === "en" ? "Profile bridge" : "Profil bağlantısı",
    value: profileTitle,
    meaning:
      locale === "en"
        ? "Mirror AI uses the profile as a filter so numbers become behavioral themes, not fate claims."
        : "Mirror AI profili filtre olarak kullanır; sayılar kader hükmü değil davranış teması olarak okunur.",
    reference: [
      `${locale === "en" ? "Profile" : "Profil"}: ${profileTitle}`,
      typeof profile?.relationship_pattern === "string"
        ? `${locale === "en" ? "Relationship pattern" : "İlişki döngüsü"}: ${profile.relationship_pattern}`
        : undefined
    ].filter(Boolean) as string[]
  });

  return { birth_date: birthDate, name: name || null, cards };
}

function card(
  key: string,
  label: string,
  result: { value: number; raw: number; path: string },
  locale: "tr" | "en",
  reference: Array<string | undefined>
): NumerologyCard {
  return {
    key,
    label,
    value: result.value,
    raw_value: result.raw,
    meaning: meanings[result.value]?.[locale] ?? meanings[reduceWithPath(result.value).value]?.[locale] ?? "",
    reference: reference.filter(Boolean) as string[]
  };
}

function reduceWithPath(input: string | number) {
  const digits = String(input).replace(/\D/g, "");
  const raw = sumDigits(digits);
  const steps = [formatDigitSum(digits, raw)];
  let value = raw;

  while (value > 9 && ![11, 22, 33].includes(value)) {
    const nextDigits = String(value);
    const next = sumDigits(nextDigits);
    steps.push(formatDigitSum(nextDigits, next));
    value = next;
  }

  return { raw, value, path: steps.join(" -> ") };
}

function calculateNameNumber(name: string) {
  const normalized = normalizeName(name);
  const values = normalized
    .split("")
    .map((letter) => pythagoreanValues[letter])
    .filter((value): value is number => Boolean(value));
  const raw = values.reduce((total, value) => total + value, 0);
  const reduced = reduceWithPath(String(raw));

  return {
    raw,
    value: reduced.value,
    path: `${normalized.split("").join("+")} = ${values.join("+")} = ${raw}${
      raw === reduced.value ? "" : ` -> ${reduced.value}`
    }`
  };
}

function normalizeName(name: string) {
  return name
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/Ç/g, "C")
    .replace(/Ğ/g, "G")
    .replace(/İ/g, "I")
    .replace(/Ö/g, "O")
    .replace(/Ş/g, "S")
    .replace(/Ü/g, "U")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase();
}

function sumDigits(value: string) {
  return value
    .split("")
    .map(Number)
    .filter((digit) => Number.isFinite(digit))
    .reduce((total, digit) => total + digit, 0);
}

function formatDigitSum(digits: string, total: number) {
  return `${digits.split("").join("+")} = ${total}`;
}

function readAstroPoint(astrology: Record<string, unknown> | null, key: string, locale: "tr" | "en") {
  const point = astrology?.[key] as Record<string, unknown> | undefined;
  if (!point) return undefined;
  const sign = String(point.sign_label ?? point.sign_key ?? "");
  const degree = typeof point.degree === "number" ? `${point.degree.toFixed(1)}°` : "";
  const label = locale === "en" ? key : key === "sun" ? "Güneş" : key === "moon" ? "Ay" : "Yükselen";
  return `${label}: ${sign} ${degree}`.trim();
}
