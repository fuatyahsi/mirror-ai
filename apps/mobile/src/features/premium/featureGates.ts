import type { EntitlementStatus } from "@/features/premium/revenueCat";

export type PremiumFeatureKey =
  | "relationship_loop"
  | "relationship_timing"
  | "deep_synastry"
  | "weekly_relationship_report"
  | "unlimited_people"
  | "premium_tarot"
  | "detailed_coffee"
  | "deep_numerology"
  | "deep_birth_chart"
  | "daily_timing";

export type FeatureAccessModel = "plus" | "credits" | "plus_or_credits";

export type FeatureGateInput = {
  entitlement?: EntitlementStatus;
  journalEntryCount?: number;
  relationshipCount?: number;
  freeRelationshipReadingsToday?: number;
};

export type FeatureGateResult = {
  unlocked: boolean;
  feature: PremiumFeatureKey;
  reason?: string;
  previewAvailable: boolean;
  requiredPlan: "plus" | "credits";
};

export type FeatureOfferCopy = {
  title: string;
  subtitle: string;
  outcome: string;
  freePreview: string;
  unlockLabel: string;
  accessLabel: string;
  cta: string;
  bullets: string[];
  receipt: string[];
  trustNote: string;
};

const premiumOnly = new Set<PremiumFeatureKey>([
  "relationship_loop",
  "relationship_timing",
  "deep_synastry",
  "weekly_relationship_report",
  "unlimited_people",
  "premium_tarot",
  "detailed_coffee",
  "deep_numerology",
  "deep_birth_chart",
  "daily_timing"
]);

export const freeTierLimits = {
  relationshipPeople: 1,
  relationshipLoopPreviewEntries: 2,
  relationshipReadingsPerDay: 1,
  weeklyTarot: 1,
  monthlyCoffee: 1
} as const;

export function checkFeatureGate(feature: PremiumFeatureKey, input: FeatureGateInput = {}): FeatureGateResult {
  const isPremium = Boolean(input.entitlement?.isPremium);
  if (isPremium || !premiumOnly.has(feature)) {
    return {
      unlocked: true,
      feature,
      previewAvailable: true,
      requiredPlan: defaultRequiredPlan(feature)
    };
  }

  if (feature === "unlimited_people" && (input.relationshipCount ?? 0) < freeTierLimits.relationshipPeople) {
    return {
      unlocked: true,
      feature,
      previewAvailable: true,
      requiredPlan: "plus"
    };
  }

  return {
    unlocked: false,
    feature,
    previewAvailable: true,
    requiredPlan: defaultRequiredPlan(feature),
    reason: featureReason(feature)
  };
}

export function shouldShowRelationshipLoopPreview(journalEntryCount: number) {
  return journalEntryCount >= freeTierLimits.relationshipLoopPreviewEntries;
}

export function featureOffer(feature: PremiumFeatureKey, locale: "tr" | "en" = "tr"): FeatureOfferCopy {
  return (locale === "en" ? enFeatureCopy : trFeatureCopy)[feature];
}

export function featureTitle(feature: PremiumFeatureKey, locale: "tr" | "en" = "tr") {
  return featureOffer(feature, locale).title;
}

export function featureSubtitle(feature: PremiumFeatureKey, locale: "tr" | "en" = "tr") {
  return featureOffer(feature, locale).subtitle;
}

export function featureOutcome(feature: PremiumFeatureKey, locale: "tr" | "en" = "tr") {
  return featureOffer(feature, locale).outcome;
}

export function featureValueBullets(feature: PremiumFeatureKey, locale: "tr" | "en" = "tr") {
  return featureOffer(feature, locale).bullets;
}

export function featureReceipt(feature: PremiumFeatureKey, locale: "tr" | "en" = "tr") {
  return featureOffer(feature, locale).receipt;
}

export function featureTrustNote(feature: PremiumFeatureKey, locale: "tr" | "en" = "tr") {
  return featureOffer(feature, locale).trustNote;
}

export function featureAccessModel(feature: PremiumFeatureKey): FeatureAccessModel {
  if (feature === "detailed_coffee") return "credits";
  if (
    feature === "deep_synastry" ||
    feature === "weekly_relationship_report" ||
    feature === "premium_tarot" ||
    feature === "deep_numerology" ||
    feature === "deep_birth_chart"
  ) {
    return "plus_or_credits";
  }
  return "plus";
}

export function featureAccessLabel(feature: PremiumFeatureKey, locale: "tr" | "en" = "tr") {
  const model = featureAccessModel(feature);
  if (locale === "en") {
    if (model === "credits") return "Credits";
    if (model === "plus_or_credits") return "Plus or credits";
    return "Plus";
  }
  if (model === "credits") return "Kredi";
  if (model === "plus_or_credits") return "Plus veya kredi";
  return "Plus";
}

function defaultRequiredPlan(feature: PremiumFeatureKey): "plus" | "credits" {
  return feature === "detailed_coffee" ? "credits" : "plus";
}

function featureReason(feature: PremiumFeatureKey) {
  if (feature === "relationship_loop") return "relationship_loop_requires_plus";
  if (feature === "relationship_timing") return "relationship_timing_requires_plus";
  if (feature === "deep_synastry") return "deep_synastry_requires_plus";
  if (feature === "weekly_relationship_report") return "weekly_report_requires_plus";
  if (feature === "unlimited_people") return "free_person_limit_reached";
  if (feature === "deep_numerology") return "deep_numerology_requires_plus";
  if (feature === "deep_birth_chart") return "deep_birth_chart_requires_plus";
  if (feature === "daily_timing") return "daily_timing_requires_plus";
  return "premium_required";
}

const trFeatureCopy: Record<PremiumFeatureKey, FeatureOfferCopy> = {
  relationship_loop: {
    title: "İlişki döngünü aç",
    subtitle: "Günlük kayıtların, sinastri ve zamanlama birlikte okunsun.",
    outcome:
      "Tek tek olaylar yerine, bu kişinin sende hangi tekrar eden bağı ve tetiklenmeyi çalıştırdığını görürsün.",
    freePreview: "Ücretsiz katmanda kısa ilişki enerjisi ve ilk hafıza sinyali görünür.",
    unlockLabel: "Açılacak ilişki zekası",
    accessLabel: "Plus",
    cta: "Döngü analizini aç",
    bullets: [
      "Son kayıtlarından tekrar eden tema çıkarımı",
      "Geç cevap, belirsizlik, geri çekilme gibi döngü etiketleri",
      "Sinastriyle birleşen kişisel tetiklenme yorumu",
      "Bugün hangi tavrı büyütmemen gerektiği"
    ],
    receipt: [
      "İlişki hafızası analizi",
      "Döngü özeti",
      "Somut iletişim önerisi"
    ],
    trustNote: "Kesin hüküm vermez; ilişkiyi farkındalık ve karar desteği olarak okur."
  },
  relationship_timing: {
    title: "Bugün ne yapmalıyım?",
    subtitle: "Mesaj tonu, zamanlama ve dikkat edilmesi gereken alan açılsın.",
    outcome:
      "Kullanıcı sadece yorum değil, bugün atılacak daha sakin ve net adımı görür.",
    freePreview: "Ücretsiz katmanda genel ilişki enerjisi görünür.",
    unlockLabel: "Açılacak zamanlama koçu",
    accessLabel: "Plus",
    cta: "Bugünkü adımı aç",
    bullets: [
      "Bugünün transitleriyle ilişki hassasiyeti",
      "Mesaj atmalı mıyım sorusuna net ton önerisi",
      "Zorlamaman gereken davranış",
      "Gerekirse kısa ve sakin örnek mesaj"
    ],
    receipt: [
      "Günlük zamanlama yorumu",
      "Mesaj tonu",
      "Yap / yapma önerisi"
    ],
    trustNote: "Kararı kullanıcının özerkliğinde bırakır; manipülatif ilişki yönlendirmesi yapmaz."
  },
  deep_synastry: {
    title: "Derin sinastri raporu",
    subtitle: "İki harita, bağlanma dinamiği ve ilişki sorusu aynı raporda birleşsin.",
    outcome:
      "Uyum puanından fazlasını verir: çekim, iletişim, güven ve kriz alanlarının nasıl çalıştığını açıklar.",
    freePreview: "Ücretsiz katmanda temel ilişki enerjisi ve kısa uyum sinyali verilir.",
    unlockLabel: "Açılacak sinastri raporu",
    accessLabel: "Plus veya kredi",
    cta: "Derin raporu aç",
    bullets: [
      "Duygusal, zihinsel, romantik ve uzun vade skorları",
      "Güçlü çekim ve zorlanma alanları",
      "Gezegen açıları ve orb referansları",
      "Bu bağ sende hangi ilişki döngüsünü çalıştırıyor sorusu"
    ],
    receipt: [
      "Sinastri skor kartları",
      "Güçlü ve riskli temalar",
      "Kişisel yorum ve öneri"
    ],
    trustNote: "Doğum saati bilinmiyorsa bunu açıkça söyler; ev ve yükselen hassasiyetini abartmaz."
  },
  weekly_relationship_report: {
    title: "Haftalık ilişki raporu",
    subtitle: "Haftanın olayları, günlük kayıtlar ve gökyüzü tek akışta özetlensin.",
    outcome:
      "Kullanıcı haftanın sadece ne olduğunu değil, ilişkide hangi temanın tekrar ettiğini görür.",
    freePreview: "Ücretsiz katmanda günlük tekil yorumlar görünür.",
    unlockLabel: "Açılacak haftalık rapor",
    accessLabel: "Plus veya kredi",
    cta: "Haftalık raporu aç",
    bullets: [
      "Son 7 gün ilişki günlüğü özeti",
      "Tekrarlayan duygu ve davranış teması",
      "Önümüzdeki hafta için zamanlama odağı",
      "Sakin aksiyon planı"
    ],
    receipt: [
      "7 günlük ilişki özeti",
      "Döngü haritası",
      "Haftalık aksiyon planı"
    ],
    trustNote: "Kısa panik yorumları yerine düzenli gözlemden anlam çıkarır."
  },
  unlimited_people: {
    title: "Sınırsız kişi profili",
    subtitle: "Birden fazla ilişkiyi ayrı hafıza ve ayrı bağlamla takip et.",
    outcome:
      "Her kişi için ayrı soru, günlük, sinastri ve zamanlama geçmişi tutulur.",
    freePreview: "Ücretsiz katmanda bir kişiyle temel ilişki profili denenebilir.",
    unlockLabel: "Açılacak profil alanı",
    accessLabel: "Plus",
    cta: "Sınırsız profili aç",
    bullets: [
      "Birden fazla kişi için ayrı ilişki hafızası",
      "Her kişi için ayrı ana soru ve ilişki durumu",
      "Karışmayan günlük kayıtları",
      "Geri dönüp karşılaştırılabilir ilişki geçmişi"
    ],
    receipt: [
      "Sınırsız kişi",
      "Ayrı hafıza",
      "Ayrı rapor geçmişi"
    ],
    trustNote: "Kişileri birbirine karıştırmadan, her bağı kendi bağlamında okur."
  },
  premium_tarot: {
    title: "Premium tarot açılımı",
    subtitle: "Kartlar sorudan kopmadan yorumlansın; gerekirse netleştirici kart açılsın.",
    outcome:
      "Kullanıcı sadece kart anlamı değil, sorduğu soruya bağlı cevap ve sonraki adımı görür.",
    freePreview: "Ücretsiz katmanda temel açılım ve kısa kart yorumu bulunur.",
    unlockLabel: "Açılacak tarot katmanı",
    accessLabel: "Plus veya kredi",
    cta: "Derin tarot aç",
    bullets: [
      "Konu ve ana soruya bağlı yorum",
      "Netleştirici ikinci soru ve ek kart",
      "Kart referansları ayrı ayrı",
      "Karar baskısı yapmayan öneri"
    ],
    receipt: [
      "Derin kart yorumu",
      "Netleştirici kart",
      "Soruya bağlı aksiyon"
    ],
    trustNote: "Kartları kesin hüküm gibi değil, kararını temizleyen sembolik ayna gibi okur."
  },
  detailed_coffee: {
    title: "Detaylı kahve yorumu",
    subtitle: "Fincan sembolleri, seçtiğin konu ve kişisel hafıza tek raporda birleşsin.",
    outcome:
      "Kullanıcı sembol listesi yerine, kendi sorusuna bağlanan daha kişisel bir kahve yorumu alır.",
    freePreview: "Ücretsiz katmanda sınırlı kısa kahve yorumu denenebilir.",
    unlockLabel: "Açılacak kahve raporu",
    accessLabel: "Kredi",
    cta: "Krediyle kahve raporu aç",
    bullets: [
      "Fincan görüntüsünden sembol çıkarımı",
      "Aşk, iş, para veya aile konusuna özel yorum",
      "Profil ve geçmiş geri bildirimle kişiselleştirme",
      "Fotoğrafı analizden sonra saklamama ilkesi"
    ],
    receipt: [
      "Detaylı sembol analizi",
      "Kişisel bağlam",
      "Tek rapor kullanımı"
    ],
    trustNote: "Fotoğrafı gereksiz saklamadan, sadece yorum üretmek için kullanmayı hedefler."
  },
  deep_numerology: {
    title: "Derin numeroloji raporu",
    subtitle: "Yaşam yolu, kişisel yıl ve ilişki sayıları birlikte yorumlansın.",
    outcome:
      "Kullanıcı sayısal çıktıları değil, bu dönem hangi tema ve seçimle karşılaştığını görür.",
    freePreview: "Ücretsiz katmanda temel yaşam yolu kartı görünür.",
    unlockLabel: "Açılacak numeroloji raporu",
    accessLabel: "Plus veya kredi",
    cta: "Numeroloji raporunu aç",
    bullets: [
      "Yaşam yolu ve kişisel yıl yorumu",
      "İsim titreşimi ve tekrar eden tema",
      "İlişki sayısal uyum karşılaştırması",
      "Yılın karar ve zamanlama odağı"
    ],
    receipt: [
      "Derin numeroloji kartları",
      "Yıllık tema",
      "İlişki uyumu"
    ],
    trustNote: "Sayıları kader cümlesi olarak değil, farkındalık dili olarak kullanır."
  },
  deep_birth_chart: {
    title: "Derin doğum haritası raporu",
    subtitle: "Natal harita, evler, gezegenler ve ilişki stili kişisel öneriye dönüşsün.",
    outcome:
      "Kullanıcı sadece yerleşim listesi değil, kendi ilişki dili, gölge alanı ve gelişim yönünü okur.",
    freePreview: "Ücretsiz katmanda temel natal özet ve gezegen yerleşimleri görünür.",
    unlockLabel: "Açılacak harita raporu",
    accessLabel: "Plus veya kredi",
    cta: "Derin haritayı aç",
    bullets: [
      "Kimlik, duygu, iletişim ve çekim dili",
      "Ev temaları ve ilişki tetiklenmeleri",
      "Gölge alanlar ve pratik öneriler",
      "Harita referanslarıyla açıklanabilir yorum"
    ],
    receipt: [
      "Derin natal yorum",
      "İlişki stili",
      "Gölge ve öneri kartları"
    ],
    trustNote: "Teknik harita verisini sade yorumla ayırır; kanıtı referans kartında gösterir."
  },
  daily_timing: {
    title: "Kişisel günlük zamanlama",
    subtitle: "Bugünün gökyüzü natal harita, hafıza ve ruh haliyle okunsun.",
    outcome:
      "Kullanıcı genel burç yorumu yerine, bugün ilişkide veya iletişimde nasıl davranacağını görür.",
    freePreview: "Ücretsiz katmanda kısa günlük gökyüzü yorumu açılır.",
    unlockLabel: "Açılacak günlük zamanlama",
    accessLabel: "Plus",
    cta: "Günlük zamanlamayı aç",
    bullets: [
      "Natal harita + bugünün gökyüzü",
      "Teknik açıları sade kişisel dile çevirme",
      "İlişki ve iletişim odağı",
      "Günlük küçük aksiyon"
    ],
    receipt: [
      "Kişisel günlük yorum",
      "Transit zamanlama",
      "Uygulanabilir öneri"
    ],
    trustNote: "Teknik astroloji referansları görünür kalır; ana metin kullanıcıya sade anlatılır."
  }
};

const enFeatureCopy: Record<PremiumFeatureKey, FeatureOfferCopy> = {
  relationship_loop: {
    title: "Unlock your relationship loop",
    subtitle: "Read journal entries, synastry and timing together.",
    outcome:
      "Instead of isolated events, you see which repeating bond and trigger this person activates in you.",
    freePreview: "The free layer shows a short relationship reading and the first memory signal.",
    unlockLabel: "Relationship intelligence unlocked",
    accessLabel: "Plus",
    cta: "Unlock loop analysis",
    bullets: [
      "Repeating themes from recent journal entries",
      "Loop labels like late replies, uncertainty and withdrawal",
      "Personal trigger reading connected to synastry",
      "What not to escalate today"
    ],
    receipt: ["Relationship memory analysis", "Loop summary", "Concrete communication step"],
    trustNote: "It does not make deterministic claims; it supports awareness and choice."
  },
  relationship_timing: {
    title: "What should I do today?",
    subtitle: "Unlock message tone, timing and what to avoid.",
    outcome:
      "You get more than a reading: a calmer, clearer step for today.",
    freePreview: "The free layer shows the general relationship energy.",
    unlockLabel: "Timing coach unlocked",
    accessLabel: "Plus",
    cta: "Unlock today's step",
    bullets: [
      "Today's transit sensitivity for the relationship",
      "Message tone for should-I-text questions",
      "What behavior to avoid pushing",
      "A short calm message sample when useful"
    ],
    receipt: ["Daily timing reading", "Message tone", "Do / do-not guidance"],
    trustNote: "It keeps your autonomy central and avoids manipulative relationship advice."
  },
  deep_synastry: {
    title: "Deep synastry report",
    subtitle: "Combine both charts, attachment dynamics and your exact question.",
    outcome:
      "More than a compatibility score: attraction, communication, safety and friction are explained.",
    freePreview: "The free layer gives a basic bond signal and short relationship reading.",
    unlockLabel: "Synastry report unlocked",
    accessLabel: "Plus or credits",
    cta: "Unlock deep report",
    bullets: [
      "Emotional, mental, romantic and long-term scores",
      "Strength and friction areas",
      "Aspect and orb references",
      "Which relationship loop this bond activates"
    ],
    receipt: ["Synastry score cards", "Strength and risk themes", "Personal interpretation"],
    trustNote: "If birth time is unknown, house and ascendant precision is stated clearly."
  },
  weekly_relationship_report: {
    title: "Weekly relationship report",
    subtitle: "Summarize journal entries, events and timing in one weekly flow.",
    outcome:
      "You see not only what happened this week, but which relational theme repeated.",
    freePreview: "The free layer shows single daily readings.",
    unlockLabel: "Weekly report unlocked",
    accessLabel: "Plus or credits",
    cta: "Unlock weekly report",
    bullets: [
      "Last 7 days relationship journal summary",
      "Repeating emotional and behavioral theme",
      "Next week's timing focus",
      "Calm action plan"
    ],
    receipt: ["7-day relationship summary", "Loop map", "Weekly action plan"],
    trustNote: "It turns regular observation into insight instead of panic-checking."
  },
  unlimited_people: {
    title: "Unlimited people profiles",
    subtitle: "Track multiple bonds with separate memory and context.",
    outcome:
      "Each person keeps their own question, journal, synastry and timing history.",
    freePreview: "The free layer lets you try one basic relationship profile.",
    unlockLabel: "Profile capacity unlocked",
    accessLabel: "Plus",
    cta: "Unlock unlimited profiles",
    bullets: [
      "Separate relationship memory for multiple people",
      "Separate main question and status for each person",
      "Clean journal history per bond",
      "Comparable relationship timeline"
    ],
    receipt: ["Unlimited people", "Separate memory", "Separate report history"],
    trustNote: "It reads each bond in its own context without mixing people together."
  },
  premium_tarot: {
    title: "Premium tarot spread",
    subtitle: "Keep the reading tied to your question and add a clarifier when needed.",
    outcome:
      "You get more than card meanings: a question-aware answer and next step.",
    freePreview: "The free layer includes a basic spread and short card interpretation.",
    unlockLabel: "Tarot layer unlocked",
    accessLabel: "Plus or credits",
    cta: "Unlock deep tarot",
    bullets: [
      "Interpretation tied to topic and exact question",
      "Clarifier question and extra card",
      "References for each card",
      "Advice without pressure or certainty"
    ],
    receipt: ["Deeper card reading", "Clarifier card", "Question-based action"],
    trustNote: "Cards are read as a symbolic mirror, not as deterministic commands."
  },
  detailed_coffee: {
    title: "Detailed coffee reading",
    subtitle: "Blend cup symbols, topic and personal memory into one report.",
    outcome:
      "You receive a personal reading tied to your question instead of a symbol list.",
    freePreview: "The free layer can show a limited short coffee reading.",
    unlockLabel: "Coffee report unlocked",
    accessLabel: "Credits",
    cta: "Unlock with credits",
    bullets: [
      "Symbol extraction from the cup image",
      "Topic-specific love, work, money or family reading",
      "Personalization from profile and feedback",
      "Photo-minimizing approach after analysis"
    ],
    receipt: ["Detailed symbol analysis", "Personal context", "One report use"],
    trustNote: "The product is designed to avoid storing photos unless needed for analysis."
  },
  deep_numerology: {
    title: "Deep numerology report",
    subtitle: "Read life path, personal year and relationship numbers together.",
    outcome:
      "You see the theme and decision pattern of this period, not just numeric outputs.",
    freePreview: "The free layer shows the basic life path card.",
    unlockLabel: "Numerology report unlocked",
    accessLabel: "Plus or credits",
    cta: "Unlock numerology report",
    bullets: [
      "Life path and personal year reading",
      "Name vibration and repeating theme",
      "Relationship number compatibility",
      "Decision and timing focus for the year"
    ],
    receipt: ["Deep numerology cards", "Yearly theme", "Relationship fit"],
    trustNote: "Numbers are used as reflective language, not fate claims."
  },
  deep_birth_chart: {
    title: "Deep birth chart report",
    subtitle: "Turn natal chart, houses, planets and relationship style into personal guidance.",
    outcome:
      "You read your relationship language, shadow pattern and growth direction, not only placements.",
    freePreview: "The free layer shows the basic natal summary and planet placements.",
    unlockLabel: "Chart report unlocked",
    accessLabel: "Plus or credits",
    cta: "Unlock deep chart",
    bullets: [
      "Identity, emotion, communication and attraction style",
      "House themes and relationship triggers",
      "Shadow areas and practical suggestions",
      "Explainable references from the chart"
    ],
    receipt: ["Deep natal reading", "Relationship style", "Shadow and guidance cards"],
    trustNote: "Technical chart data stays in reference cards; the main reading stays human."
  },
  daily_timing: {
    title: "Personal daily timing",
    subtitle: "Read today's sky through natal chart, memory and mood.",
    outcome:
      "You receive personal relationship and communication guidance instead of a generic horoscope.",
    freePreview: "The free layer opens a short daily sky reading.",
    unlockLabel: "Daily timing unlocked",
    accessLabel: "Plus",
    cta: "Unlock daily timing",
    bullets: [
      "Natal chart plus today's sky",
      "Technical aspects translated into plain language",
      "Relationship and communication focus",
      "Small daily action"
    ],
    receipt: ["Personal daily reading", "Transit timing", "Practical guidance"],
    trustNote: "Astrology references remain visible, while the main text stays user-focused."
  }
};
