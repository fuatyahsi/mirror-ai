import type { Locale } from "@/i18n";
import type { MysticProfile } from "@/types/profile";
import type { ReadingOutput, ReadingType, TarotCardDraw } from "@/types/readings";
import { nowIso } from "@/utils/date";

const copy = {
  tr: {
    safety:
      "Bu yorum eğlence ve kişisel farkındalık amaçlıdır; kesin gelecek bilgisi veya profesyonel tavsiye değildir.",
    personalContext: "Kişisel bağlam",
    personalContextBody:
      "{{profile}} profilin ve \"{{style}}\" yorum stilin dikkate alındı. Bu yüzden yorum kesin hükümden çok netlik, sınır ve duygu ayrımı üzerinden kişiselleştirildi.",
    reflection: "Bugün hangi küçük seçim sana daha fazla iç açıklığı verebilir?",
    basedInitial: "ilk profil bilgileri",
    basedTopic: "seçilen konu",
    basedMock: "örnek Mirror AI yorum motoru",
    limitations: "Gerçek AI ve geçmiş hafıza motoru bağlanana kadar sonuçlar örnek veriyle üretilir.",
    dailyTitle: "Bugünün İç Aynası",
    dailyConfused:
      "Bugün netlik ihtiyacın yükselirken sezgisel ipuçlarını fazla büyütmemeye dikkat edebilirsin.",
    dailyCalm:
      "Bugün sakin bir gözlem hali, tekrar eden düşüncelerin arkasındaki ihtiyacı daha görünür kılabilir.",
    dailyTheme: "Ana Tema",
    dailyThemeBody: "Günün enerjisi hızlı karar vermekten çok, hislerini isimlendirmeyi destekliyor.",
    dailyFocus: "Dikkat Noktası",
    dailyFocusBody:
      "Karşı tarafın sessizliğini tek bir anlama sabitlemek yerine, kendi ihtiyacını ayırmaya çalış.",
    dailyRitual: "Küçük Ritüel",
    dailyRitualBody:
      "Akşam üç cümle yaz: ne hissettim, neye ihtiyaç duydum, neyi abartmış olabilirim?",
    dailyAdvice:
      "Bugün cevap aramadan önce, sorunun sende hangi duyguyu uyandırdığını fark et.",
    tarotTitle: "Tarot Aynası",
    tarotSummary:
      "Kartlar bu konuyu kesin bir sonuçtan çok, görünmeyen duygu ve karar ekseni üzerinden okuyor.",
    upright: "Düz",
    reversed: "Ters",
    tarotCardBody:
      "{{orientation}} gelen bu kart, sorunun içinde hem sezgisel bir çağrı hem de sınır koyma ihtiyacı olabileceğini gösteren sembolik bir işaret gibi okunabilir.",
    tarotAdvice:
      "Kartları bir hüküm gibi değil, kendine soracağın daha iyi sorular için bir ayna gibi kullan.",
    coffeeTitle: "Kahve Falı Yorumu",
    coffeeSummary:
      "Fincanda yol, halka ve küçük bir açıklık teması öne çıkıyor; bunlar hareket, tekrar eden döngü ve konuşma ihtimalini sembolize eder.",
    symbols: "Görülen Semboller",
    symbolsBody: "Yol hareketi, halka tekrar eden bir temayı, açık alan ise netleşme ihtiyacını temsil eder.",
    coffeeContextWith:
      "Paylaştığın bağlamda \"{{context}}\" teması olduğu için yorum belirsizlikle baş etme ekseninde kişiselleştirildi.",
    coffeeContextWithout: "Ek bağlam verilmediği için yorum genel profil ve seçilen konu üzerinden tutuldu.",
    nearTerm: "Yakın Dönem Mesajı",
    nearTermBody:
      "Sembolik okuma, beklemekten çok sakin bir açıklıkla soru sormanın daha iyi hissettirebileceğini söylüyor.",
    coffeeAdvice:
      "Kendini tek bir işarete bağlamak yerine, gördüğün sembolün sende uyandırdığı ihtiyacı takip et.",
    road: "Yol",
    ring: "Halka",
    relationshipTitle: "İlişki Enerji Analizi",
    relationshipSummary:
      "{{name}} ile ilgili dinamikte çekim kadar belirsizlik de görünür durumda; bu yorum kesin niyet okumaz, sadece temaları ayırır.",
    defaultPerson: "Bu kişi",
    pull: "Duygusal Çekim",
    pullBody:
      "Verilen bilgiler karşılıklı merak ihtimalini dışlamıyor, ama bunu kesin ilgi olarak yorumlamak sağlıklı olmaz.",
    clarity: "İletişim Netliği",
    clarityBody: "{{status}} durumu ve {{context}} iletişimde netleşme ihtiyacını öne çıkarıyor.",
    limitedContext: "sınırlı bağlam",
    risk: "Riskli Patern",
    riskBody:
      "Belirsizlik uzadığında zihnin boşlukları hızla doldurabilir; bu yüzden davranışa dayalı veri ile hisleri ayırmak önemli.",
    relationshipAdvice:
      "Kararı tek bir yorumla verme; küçük, saygılı ve net bir iletişim denemesi daha güvenilir veri sağlayabilir."
  },
  en: {
    safety:
      "This reading is for entertainment and personal reflection only; it is not certain future knowledge or professional advice.",
    personalContext: "Personal context",
    personalContextBody:
      "Your {{profile}} profile and \"{{style}}\" reading style were considered. The reading is personalized around clarity, boundaries, and emotional distinction rather than a verdict.",
    reflection: "Which small choice could give you more inner clarity today?",
    basedInitial: "initial profile information",
    basedTopic: "selected topic",
    basedMock: "sample Mirror AI reading engine",
    limitations: "Results use sample data until real AI and memory history are connected.",
    dailyTitle: "Today’s Inner Mirror",
    dailyConfused:
      "As your need for clarity rises today, try not to inflate intuitive clues beyond the evidence.",
    dailyCalm:
      "A calmer observing stance can make the need behind repeated thoughts more visible today.",
    dailyTheme: "Main Theme",
    dailyThemeBody: "Today’s energy supports naming your feelings more than rushing into a decision.",
    dailyFocus: "Focus Point",
    dailyFocusBody:
      "Instead of fixing another person’s silence to one meaning, try separating your own need from the signal.",
    dailyRitual: "Small Ritual",
    dailyRitualBody:
      "Tonight, write three lines: what I felt, what I needed, and what I may have amplified.",
    dailyAdvice: "Before looking for an answer today, notice which feeling the question awakens in you.",
    tarotTitle: "Tarot Mirror",
    tarotSummary:
      "The cards read this topic through unseen feeling and choice patterns, not as a fixed outcome.",
    upright: "Upright",
    reversed: "Reversed",
    tarotCardBody:
      "This {{orientation}} card can be read as a symbolic sign of both an intuitive call and a need for boundaries inside the question.",
    tarotAdvice: "Use the cards as a mirror for better questions, not as a verdict.",
    coffeeTitle: "Coffee Reading",
    coffeeSummary:
      "Road, ring, and an opening stand out in the cup; they symbolize movement, repeating cycles, and possible conversation.",
    symbols: "Seen Symbols",
    symbolsBody: "The road suggests movement, the ring suggests a repeated theme, and the open area suggests a need for clarity.",
    coffeeContextWith:
      "Because you shared the context \"{{context}}\", the reading was personalized around handling uncertainty.",
    coffeeContextWithout: "Because no extra context was added, the reading stays close to your profile and selected topic.",
    nearTerm: "Near-Term Message",
    nearTermBody:
      "The symbolic reading suggests that asking with calm clarity may feel better than waiting.",
    coffeeAdvice:
      "Instead of attaching yourself to one sign, follow the need that the symbol awakens in you.",
    road: "Road",
    ring: "Ring",
    relationshipTitle: "Relationship Energy Analysis",
    relationshipSummary:
      "In the dynamic with {{name}}, uncertainty is as visible as attraction; this reading separates themes without claiming certain intent.",
    defaultPerson: "This person",
    pull: "Emotional Pull",
    pullBody:
      "The information does not rule out mutual curiosity, but reading it as definite interest would not be grounded.",
    clarity: "Communication Clarity",
    clarityBody: "The {{status}} status and {{context}} highlight a need for clearer communication.",
    limitedContext: "limited context",
    risk: "Risk Pattern",
    riskBody:
      "When uncertainty stretches out, your mind may fill gaps quickly; separating behavior-based evidence from feelings matters.",
    relationshipAdvice:
      "Do not decide from one reading alone; a small, respectful, clear communication attempt can provide more reliable information."
  }
} as const;

function fill(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (text, [name, value]) => text.replace(new RegExp(`{{${name}}}`, "g"), value),
    template
  );
}

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function personalContextSection(profile: MysticProfile | undefined, locale: Locale) {
  if (!profile) return [];
  const text = copy[locale];

  return [
    {
      title: text.personalContext,
      body: fill(text.personalContextBody, {
        profile: profile.profile_title,
        style: profile.preferred_reading_style
      })
    }
  ];
}

function baseReading(args: {
  type: ReadingType;
  topic: string;
  question?: string;
  profile?: MysticProfile;
  title: string;
  summary: string;
  sections: { title: string; body: string }[];
  advice: string;
  locale?: Locale;
}): ReadingOutput {
  const locale = args.locale ?? "tr";
  const text = copy[locale];

  return {
    id: id(args.type),
    reading_type: args.type,
    topic: args.topic,
    question: args.question,
    created_at: nowIso(),
    title: args.title,
    summary: args.summary,
    tone: "reflective",
    sections: [...personalContextSection(args.profile, locale), ...args.sections],
    advice: args.advice,
    reflection_question: text.reflection,
    explanation: {
      based_on: [args.profile?.profile_title || text.basedInitial, text.basedTopic, text.basedMock],
      confidence: 0.72,
      limitations: text.limitations
    },
    safety_note: text.safety
  };
}

export function generateDailyMock(
  topic: string,
  mood: string,
  question?: string,
  profile?: MysticProfile,
  locale: Locale = "tr"
) {
  const text = copy[locale];
  return baseReading({
    type: "daily",
    topic,
    question,
    profile,
    locale,
    title: text.dailyTitle,
    summary: mood === "confused" ? text.dailyConfused : text.dailyCalm,
    sections: [
      { title: text.dailyTheme, body: text.dailyThemeBody },
      { title: text.dailyFocus, body: text.dailyFocusBody },
      { title: text.dailyRitual, body: text.dailyRitualBody }
    ],
    advice: text.dailyAdvice
  });
}

const tarotCards = [
  "The Moon",
  "Two of Cups",
  "Justice",
  "The Star",
  "Queen of Swords",
  "Six of Cups",
  "The Hermit",
  "Ace of Cups"
];

export function drawTarot(spreadType: string): TarotCardDraw[] {
  const positions =
    spreadType === "single"
      ? ["message"]
      : spreadType === "relationship"
        ? ["you", "other", "dynamic"]
        : ["past", "present", "possible_direction"];

  return positions.map((position, index) => ({
    position,
    card: tarotCards[(Date.now() + index) % tarotCards.length],
    orientation: index % 2 === 0 ? "upright" : "reversed"
  }));
}

export function generateTarotMock(
  spreadType: string,
  topic: string,
  question: string,
  profile?: MysticProfile,
  locale: Locale = "tr"
) {
  const text = copy[locale];
  const cards = drawTarot(spreadType);
  return {
    reading: baseReading({
      type: "tarot",
      topic,
      question,
      profile,
      locale,
      title: text.tarotTitle,
      summary: text.tarotSummary,
      sections: cards.map((card) => ({
        title: `${card.position}: ${card.card}`,
        body: fill(text.tarotCardBody, {
          orientation: card.orientation === "upright" ? text.upright : text.reversed
        })
      })),
      advice: text.tarotAdvice
    }),
    cards
  };
}

export function generateCoffeeMock(
  topic: string,
  question: string,
  context: string,
  profile?: MysticProfile,
  locale: Locale = "tr"
) {
  const text = copy[locale];
  return {
    reading: baseReading({
      type: "coffee",
      topic,
      question,
      profile,
      locale,
      title: text.coffeeTitle,
      summary: text.coffeeSummary,
      sections: [
        { title: text.symbols, body: text.symbolsBody },
        {
          title: text.personalContext,
          body: context ? fill(text.coffeeContextWith, { context }) : text.coffeeContextWithout
        },
        { title: text.nearTerm, body: text.nearTermBody }
      ],
      advice: text.coffeeAdvice
    }),
    detected_symbols: [
      { symbol: "road", label: text.road, confidence: 0.71 },
      { symbol: "ring", label: text.ring, confidence: 0.64 }
    ]
  };
}

export function generateRelationshipMock(
  nickname: string,
  status: string,
  question: string,
  recentContext: string,
  profile?: MysticProfile,
  locale: Locale = "tr"
) {
  const text = copy[locale];
  return {
    reading: baseReading({
      type: "relationship",
      topic: "relationship",
      question,
      profile,
      locale,
      title: text.relationshipTitle,
      summary: fill(text.relationshipSummary, { name: nickname || text.defaultPerson }),
      sections: [
        { title: text.pull, body: text.pullBody },
        {
          title: text.clarity,
          body: fill(text.clarityBody, {
            status,
            context: recentContext || text.limitedContext
          })
        },
        { title: text.risk, body: text.riskBody }
      ],
      advice: text.relationshipAdvice
    }),
    scores: {
      emotional_pull: 72,
      communication_clarity: 48,
      uncertainty_level: 81,
      user_projection_risk: 67
    }
  };
}
