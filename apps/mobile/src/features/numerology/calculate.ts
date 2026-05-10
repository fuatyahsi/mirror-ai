import type { NatalChart } from "@/types/astrology";
import type { MysticProfile } from "@/types/profile";
import type { ReadingOutput, ReadingSection } from "@/types/readings";

export type NumerologyLocale = "tr" | "en";

export type NumerologyCard = {
  key: "life_path" | "birth_day" | "attitude" | "personal_year" | "name_vibration" | "profile_bridge";
  label: string;
  value: number | string;
  rawValue?: number;
  summary: string;
  advice: string;
  references: string[];
};

export type NumerologyReport = {
  birthDate: string;
  name?: string;
  cards: NumerologyCard[];
  sourceReferences: string[];
};

const numberMeanings: Record<number, { tr: string; en: string }> = {
  1: {
    tr: "başlatma, cesaret ve kendi yolunu açma teması",
    en: "initiative, courage and opening your own path"
  },
  2: {
    tr: "duyarlılık, bağ kurma ve ince denge teması",
    en: "sensitivity, bonding and subtle balance"
  },
  3: {
    tr: "ifade, görünürlük ve yaratıcı aktarım teması",
    en: "expression, visibility and creative communication"
  },
  4: {
    tr: "düzen, emek ve güvenli yapı kurma teması",
    en: "structure, effort and building reliable ground"
  },
  5: {
    tr: "değişim, hareket ve özgürleşme teması",
    en: "change, movement and liberation"
  },
  6: {
    tr: "sorumluluk, ilişki bakımı ve uyum teması",
    en: "responsibility, relational care and harmony"
  },
  7: {
    tr: "içe dönüş, anlam arama ve sezgisel analiz teması",
    en: "inner reflection, meaning-seeking and intuitive analysis"
  },
  8: {
    tr: "güç, sınır, görünür başarı ve özdeğer teması",
    en: "power, boundary, visible success and self-worth"
  },
  9: {
    tr: "tamamlama, şefkat ve geniş perspektif teması",
    en: "completion, compassion and wider perspective"
  },
  11: {
    tr: "sezgisel farkındalık, ilham ve hassas algı teması",
    en: "intuitive awareness, inspiration and heightened sensitivity"
  },
  22: {
    tr: "büyük yapı kurma, somutlaştırma ve uzun vadeli etki teması",
    en: "large-scale building, manifestation and long-term impact"
  },
  33: {
    tr: "şefkatli rehberlik, kalpten hizmet ve iyileştirici ifade teması",
    en: "compassionate guidance, heart-led service and healing expression"
  }
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

export function calculateNumerologyReport({
  birthDate,
  name,
  locale,
  profile,
  natalChart
}: {
  birthDate: string;
  name?: string;
  locale: NumerologyLocale;
  profile?: MysticProfile;
  natalChart?: NatalChart;
}): NumerologyReport {
  const date = parseBirthDate(birthDate);
  const year = new Date().getFullYear();
  const lifePath = reduceWithPath(date.yearDigits + date.monthDigits + date.dayDigits);
  const birthDay = reduceWithPath(date.dayDigits);
  const attitude = reduceWithPath(date.monthDigits + date.dayDigits);
  const personalYear = reduceWithPath(`${date.day}${date.month}${year}`);
  const nameVibration = name?.trim() ? calculateNameNumber(name) : undefined;
  const profileTitle = profile?.profile_title ?? (locale === "en" ? "Calibrating profile" : "Kalibre edilen profil");
  const clarityNeed = profile ? Math.round((profile.rationality_need + profile.uncertainty_tolerance) / 2) : undefined;
  const emotionalTone = profile ? Math.round((profile.emotional_intensity + profile.intuitive_openness) / 2) : undefined;
  const sunReference = natalChart?.sun ? `${natalChart.sun.sign_label} ${natalChart.sun.degree.toFixed(1)}°` : undefined;
  const moonReference = natalChart?.moon ? `${natalChart.moon.sign_label} ${natalChart.moon.degree.toFixed(1)}°` : undefined;

  const cards: NumerologyCard[] = [
    {
      key: "life_path",
      label: locale === "en" ? "Life path" : "Yaşam yolu",
      value: lifePath.value,
      rawValue: lifePath.raw,
      summary: buildSummary(lifePath.value, locale, profileTitle, "life_path"),
      advice: buildAdvice(lifePath.value, locale, "life_path"),
      references: [
        locale === "en" ? `Birth date: ${birthDate}` : `Doğum tarihi: ${birthDate}`,
        locale === "en" ? `Calculation: ${lifePath.path}` : `Hesap: ${lifePath.path}`,
        sunReference ? `${locale === "en" ? "Sun" : "Güneş"}: ${sunReference}` : undefined
      ].filter(Boolean) as string[]
    },
    {
      key: "birth_day",
      label: locale === "en" ? "Birth day tone" : "Doğum günü tonu",
      value: birthDay.value,
      rawValue: birthDay.raw,
      summary: buildSummary(birthDay.value, locale, profileTitle, "birth_day"),
      advice: buildAdvice(birthDay.value, locale, "birth_day"),
      references: [
        locale === "en" ? `Day: ${date.day}` : `Gün: ${date.day}`,
        locale === "en" ? `Calculation: ${birthDay.path}` : `Hesap: ${birthDay.path}`,
        moonReference ? `${locale === "en" ? "Moon" : "Ay"}: ${moonReference}` : undefined
      ].filter(Boolean) as string[]
    },
    {
      key: "attitude",
      label: locale === "en" ? "First reaction style" : "İlk tepki stili",
      value: attitude.value,
      rawValue: attitude.raw,
      summary: buildSummary(attitude.value, locale, profileTitle, "attitude"),
      advice: buildAdvice(attitude.value, locale, "attitude"),
      references: [
        locale === "en" ? `Month + day: ${date.month} + ${date.day}` : `Ay + gün: ${date.month} + ${date.day}`,
        locale === "en" ? `Calculation: ${attitude.path}` : `Hesap: ${attitude.path}`,
        clarityNeed !== undefined ? `${locale === "en" ? "Clarity profile" : "Netlik profili"}: ${clarityNeed}` : undefined
      ].filter(Boolean) as string[]
    },
    {
      key: "personal_year",
      label: locale === "en" ? "Personal year" : "Kişisel yıl",
      value: personalYear.value,
      rawValue: personalYear.raw,
      summary: buildSummary(personalYear.value, locale, profileTitle, "personal_year"),
      advice: buildAdvice(personalYear.value, locale, "personal_year"),
      references: [
        locale === "en" ? `Birth day + month + current year: ${date.day}.${date.month}.${year}` : `Doğum günü + ay + mevcut yıl: ${date.day}.${date.month}.${year}`,
        locale === "en" ? `Calculation: ${personalYear.path}` : `Hesap: ${personalYear.path}`
      ]
    }
  ];

  if (nameVibration) {
    cards.push({
      key: "name_vibration",
      label: locale === "en" ? "Name vibration" : "İsim titreşimi",
      value: nameVibration.value,
      rawValue: nameVibration.raw,
      summary: buildSummary(nameVibration.value, locale, profileTitle, "name_vibration"),
      advice: buildAdvice(nameVibration.value, locale, "name_vibration"),
      references: [
        locale === "en" ? `Name: ${name?.trim()}` : `İsim: ${name?.trim()}`,
        locale === "en" ? `Calculation: ${nameVibration.path}` : `Hesap: ${nameVibration.path}`
      ]
    });
  }

  cards.push({
    key: "profile_bridge",
    label: locale === "en" ? "Mirror AI personalization" : "Mirror AI kişiselleştirme",
    value: locale === "en" ? "Profile" : "Profil",
    summary:
      locale === "en"
        ? `${profileTitle} is used as the interpretation filter, so the numbers are not shown as fixed fate but as behavioral themes.`
        : `${profileTitle} yorum filtresi olarak kullanılır; bu yüzden sayılar sabit kader gibi değil, davranış teması gibi okunur.`,
    advice:
      locale === "en"
        ? "Read the strongest number as a question: where does this pattern help me, and where does it make me repeat myself?"
        : "En güçlü sayıyı bir soru gibi oku: Bu tema nerede işime yarıyor, nerede beni tekrar eden bir döngüye sokuyor?",
    references: [
      `${locale === "en" ? "Profile" : "Profil"}: ${profileTitle}`,
      emotionalTone !== undefined ? `${locale === "en" ? "Emotional/intuitive tone" : "Duygusal/sezgisel ton"}: ${emotionalTone}` : undefined,
      profile?.relationship_pattern ? `${locale === "en" ? "Relationship pattern" : "İlişki döngüsü"}: ${profile.relationship_pattern}` : undefined
    ].filter(Boolean) as string[]
  });

  return {
    birthDate,
    name: name?.trim(),
    cards,
    sourceReferences: cards.flatMap((card) => card.references)
  };
}

export function buildNumerologyReading(report: NumerologyReport, locale: NumerologyLocale): ReadingOutput {
  const lifePath = report.cards.find((card) => card.key === "life_path");
  const personalYear = report.cards.find((card) => card.key === "personal_year");
  const sections: ReadingSection[] = report.cards.map((card) => ({
    title: `${card.label}: ${card.value}`,
    body: `${card.summary}\n\n${card.advice}`,
    references: card.references
  }));

  return {
    id: `numerology_${Date.now()}`,
    reading_type: "numerology",
    topic: locale === "en" ? "personal numerology" : "kişisel numeroloji",
    created_at: new Date().toISOString(),
    title:
      locale === "en"
        ? `Your ${lifePath?.value ?? ""} life path mirror`
        : `${lifePath?.value ?? ""} yaşam yolu aynan`,
    summary:
      locale === "en"
        ? `Life path ${lifePath?.value ?? "-"} and personal year ${personalYear?.value ?? "-"} are read with your profile context.`
        : `Yaşam yolu ${lifePath?.value ?? "-"} ve kişisel yıl ${personalYear?.value ?? "-"} profil bağlamınla birlikte okundu.`,
    tone: "reflective",
    sections,
    advice:
      locale === "en"
        ? "Use this as a reflective map, not a fixed verdict. The useful question is which pattern wants more awareness today."
        : "Bunu sabit hüküm gibi değil, farkındalık haritası gibi kullan. İşe yarayan soru şu: Bugün hangi örüntü daha bilinçli yönetilmek istiyor?",
    reflection_question:
      locale === "en"
        ? "Which number felt most accurate, and where does it repeat in your relationships or choices?"
        : "Hangi sayı sana en doğru geldi ve bu tema ilişkilerinde ya da seçimlerinde nerede tekrar ediyor?",
    explanation: {
      based_on:
        locale === "en"
          ? ["birth date numerology", "optional name vibration", "Mirror AI profile context"]
          : ["doğum tarihi numerolojisi", "opsiyonel isim titreşimi", "Mirror AI profil bağlamı"],
      confidence: 0.72,
      limitations:
        locale === "en"
          ? "Numerology is symbolic and reflective. It does not determine future outcomes or replace personal judgment."
          : "Numeroloji sembolik ve farkındalık amaçlıdır. Geleceği belirlemez veya kişisel kararının yerine geçmez."
    },
    source_context: {
      systems: ["Numerology", "Mirror AI profile memory"],
      references: report.sourceReferences,
      engine: "Local numerology calculator"
    },
    safety_note:
      locale === "en"
        ? "This reading is for reflection and entertainment; your choices remain yours."
        : "Bu yorum farkındalık ve eğlence amaçlıdır; karar hakkı sende kalır."
  };
}

function parseBirthDate(birthDate: string) {
  const [yearText, monthText, dayText] = birthDate.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!year || !month || !day) {
    throw new Error("Invalid birth date");
  }

  return {
    year,
    month,
    day,
    yearDigits: yearText,
    monthDigits: monthText,
    dayDigits: dayText
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

  return {
    raw,
    value,
    path: steps.join(" -> ")
  };
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
    path: `${normalized.split("").join("+")} = ${values.join("+")} = ${raw}${raw === reduced.value ? "" : ` -> ${reduced.value}`}`
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
    .replace(/I/g, "I")
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

function buildSummary(value: number, locale: NumerologyLocale, profileTitle: string, cardKey: NumerologyCard["key"]) {
  const meaning = numberMeanings[value]?.[locale] ?? numberMeanings[reduceWithPath(value).value]?.[locale];
  const prefix =
    locale === "en"
      ? `${value} carries ${meaning}.`
      : `${value} sayısı ${meaning} taşır.`;

  if (cardKey === "personal_year") {
    return locale === "en"
      ? `${prefix} For ${profileTitle}, this year is best read as the atmosphere around choices, pacing and emotional timing.`
      : `${prefix} ${profileTitle} için bu yıl; seçimlerin, tempo ayarının ve duygusal zamanlamanın atmosferi gibi okunur.`;
  }

  if (cardKey === "name_vibration") {
    return locale === "en"
      ? `${prefix} It reflects the tone people may first meet in your name, not your whole identity.`
      : `${prefix} Bu, kimliğinin tamamı değil; isminle dışarıya ilk yansıyan tonu anlatır.`;
  }

  return locale === "en"
    ? `${prefix} Through the ${profileTitle} profile, this number becomes a personal pattern to observe rather than a fixed label.`
    : `${prefix} ${profileTitle} profiliyle birlikte bu sayı sabit etiket değil, gözlemlenecek kişisel bir örüntüye dönüşür.`;
}

function buildAdvice(value: number, locale: NumerologyLocale, cardKey: NumerologyCard["key"]) {
  const advices: Record<number, { tr: string; en: string }> = {
    1: { tr: "Bugün kararını tamamen başkasının sinyaline bırakma; küçük de olsa kendi yönünü belirleyen bir adım seç.", en: "Do not leave your direction entirely to someone else's signal today; choose one small self-led step." },
    2: { tr: "Denge ararken kendi ihtiyacını görünmez yapma; nazik ama açık bir cümle kur.", en: "Do not erase your own need while seeking harmony; use one gentle but clear sentence." },
    3: { tr: "İçinde kalan şeyi dramatize etmeden ifade et; görünür olmak bu temanın ilacıdır.", en: "Express what is inside without dramatizing it; visibility is the medicine of this theme." },
    4: { tr: "Belirsizliği azaltmak için somut plan, saat veya sınır iste; düzen seni sakinleştirir.", en: "Ask for a concrete plan, time or boundary to reduce ambiguity; structure calms this theme." },
    5: { tr: "Hareket isteği yüksek olabilir; ani kopuş yerine alan açan bir seçenek bırak.", en: "The urge to move may be high; leave an option that creates space rather than making a sudden break." },
    6: { tr: "Bakım vermekle kendini fazla sorumlu hissetmeyi ayır; ilişkide tek düzenleyici sen olmak zorunda değilsin.", en: "Separate care from over-responsibility; you do not have to be the only regulator in a bond." },
    7: { tr: "Aşırı analiz yükselirse tek bir kanıta dön: Bugün gerçekten bildiğin şey ne?", en: "If over-analysis rises, return to one piece of evidence: what do you truly know today?" },
    8: { tr: "Güçlü görünmek adına duygunu sertleştirme; sınır koyarken kalbini kapatmak zorunda değilsin.", en: "Do not harden your feelings just to look strong; a boundary does not require closing your heart." },
    9: { tr: "Tamamlama isteği varsa önce yasını ve yorgunluğunu kabul et; her kapanış hemen karar istemez.", en: "If completion is calling, first honor your grief and fatigue; not every ending needs an immediate decision." },
    11: { tr: "Sezgiyi korkudan ayırmak için bedendeki hissi yavaşlat; acele yorum yapma.", en: "Slow the body down to separate intuition from fear; do not interpret too quickly." },
    22: { tr: "Büyük resmi kurmadan önce tek uygulanabilir adımı seç; sağlam yapı küçük netliklerle başlar.", en: "Before building the big picture, choose one practical step; solid structure starts with small clarity." },
    33: { tr: "Şefkati kurtarıcılığa çevirme; yardım etmek ile kendini ihmal etmek aynı şey değil.", en: "Do not turn compassion into rescuing; helping and abandoning yourself are not the same." }
  };

  const base = advices[value]?.[locale] ?? advices[reduceWithPath(value).value]?.[locale] ?? "";
  if (cardKey === "personal_year") {
    return locale === "en" ? `${base} Treat this as the year's pacing advice.` : `${base} Bunu yılın tempo tavsiyesi gibi oku.`;
  }
  return base;
}
