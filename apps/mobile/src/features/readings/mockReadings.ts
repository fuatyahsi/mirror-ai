import { nowIso } from "@/utils/date";
import type { ReadingOutput, ReadingType, TarotCardDraw } from "@/types/readings";
import type { MysticProfile } from "@/types/profile";

const safetyNote =
  "Bu yorum eğlence ve kişisel farkındalık amaçlıdır; kesin gelecek bilgisi veya profesyonel tavsiye değildir.";

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
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
}): ReadingOutput {
  return {
    id: id(args.type),
    reading_type: args.type,
    topic: args.topic,
    question: args.question,
    created_at: nowIso(),
    title: args.title,
    summary: args.summary,
    tone: "reflective",
    sections: args.sections,
    advice: args.advice,
    reflection_question: "Bugün hangi küçük seçim sana daha fazla iç açıklığı verebilir?",
    explanation: {
      based_on: [
        args.profile?.profile_title || "ilk profil bilgileri",
        "seçilen konu",
        "mock AI yorum motoru"
      ],
      confidence: 0.72,
      limitations:
        "Gerçek AI ve geçmiş hafıza motoru bağlanana kadar sonuçlar örnek veriyle üretilir."
    },
    safety_note: safetyNote
  };
}

export function generateDailyMock(topic: string, mood: string, question?: string, profile?: MysticProfile) {
  return baseReading({
    type: "daily",
    topic,
    question,
    profile,
    title: "Bugünün İç Aynası",
    summary:
      mood === "confused"
        ? "Bugün netlik ihtiyacın yükselirken sezgisel ipuçlarını fazla büyütmemeye dikkat edebilirsin."
        : "Bugün sakin bir gözlem hali, tekrar eden düşüncelerin arkasındaki ihtiyacı daha görünür kılabilir.",
    sections: [
      {
        title: "Ana Tema",
        body: "Günün enerjisi hızlı karar vermekten çok, hislerini isimlendirmeyi destekliyor."
      },
      {
        title: "Dikkat Noktası",
        body: "Karşı tarafın sessizliğini tek bir anlama sabitlemek yerine, kendi ihtiyacını ayırmaya çalış."
      },
      {
        title: "Küçük Ritüel",
        body: "Akşam üç cümle yaz: ne hissettim, neye ihtiyaç duydum, neyi abartmış olabilirim?"
      }
    ],
    advice: "Bugün cevap aramadan önce, sorunun sende hangi duyguyu uyandırdığını fark et."
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
  profile?: MysticProfile
) {
  const cards = drawTarot(spreadType);
  return {
    reading: baseReading({
      type: "tarot",
      topic,
      question,
      profile,
      title: "Tarot Aynası",
      summary: "Kartlar bu konuyu kesin bir sonuçtan çok, görünmeyen duygu ve karar ekseni üzerinden okuyor.",
      sections: cards.map((card) => ({
        title: `${card.position}: ${card.card}`,
        body: `${card.orientation === "upright" ? "Düz" : "Ters"} gelen bu kart, sorunun içinde hem sezgisel bir çağrı hem de sınır koyma ihtiyacı olabileceğini gösteren sembolik bir işaret gibi okunabilir.`
      })),
      advice: "Kartları bir hüküm gibi değil, kendine soracağın daha iyi sorular için bir ayna gibi kullan."
    }),
    cards
  };
}

export function generateCoffeeMock(topic: string, question: string, context: string, profile?: MysticProfile) {
  return {
    reading: baseReading({
      type: "coffee",
      topic,
      question,
      profile,
      title: "Kahve Falı Yorumu",
      summary:
        "Fincanda yol, halka ve küçük bir açıklık teması öne çıkıyor; bunlar hareket, tekrar eden döngü ve konuşma ihtimalini sembolize eder.",
      sections: [
        {
          title: "Görülen Semboller",
          body: "Yol hareketi, halka tekrar eden bir temayı, açık alan ise netleşme ihtiyacını temsil eder."
        },
        {
          title: "Kişisel Bağlam",
          body: context
            ? `Paylaştığın bağlamda "${context}" teması olduğu için yorum belirsizlikle baş etme ekseninde kişiselleştirildi.`
            : "Ek bağlam verilmediği için yorum genel profil ve seçilen konu üzerinden tutuldu."
        },
        {
          title: "Yakın Dönem Mesajı",
          body: "Sembolik okuma, beklemekten çok sakin bir açıklıkla soru sormanın daha iyi hissettirebileceğini söylüyor."
        }
      ],
      advice: "Kendini tek bir işarete bağlamak yerine, gördüğün sembolün sende uyandırdığı ihtiyacı takip et."
    }),
    detected_symbols: [
      { symbol: "road", label: "Yol", confidence: 0.71 },
      { symbol: "ring", label: "Halka", confidence: 0.64 }
    ]
  };
}

export function generateRelationshipMock(
  nickname: string,
  status: string,
  question: string,
  recentContext: string,
  profile?: MysticProfile
) {
  return {
    reading: baseReading({
      type: "relationship",
      topic: "relationship",
      question,
      profile,
      title: "İlişki Enerji Analizi",
      summary: `${nickname || "Bu kişi"} ile ilgili dinamikte çekim kadar belirsizlik de görünür durumda; bu yorum kesin niyet okumaz, sadece temaları ayırır.`,
      sections: [
        {
          title: "Duygusal Çekim",
          body: "Verilen bilgiler karşılıklı merak ihtimalini dışlamıyor, ama bunu kesin ilgi olarak yorumlamak sağlıklı olmaz."
        },
        {
          title: "İletişim Netliği",
          body: `${status} durumu ve ${recentContext || "sınırlı bağlam"} iletişimde netleşme ihtiyacını öne çıkarıyor.`
        },
        {
          title: "Riskli Patern",
          body: "Belirsizlik uzadığında zihnin boşlukları hızla doldurabilir; bu yüzden davranışa dayalı veri ile hisleri ayırmak önemli."
        }
      ],
      advice: "Kararı tek bir yorumla verme; küçük, saygılı ve net bir iletişim denemesi daha güvenilir veri sağlayabilir."
    }),
    scores: {
      emotional_pull: 72,
      communication_clarity: 48,
      uncertainty_level: 81,
      user_projection_risk: 67
    }
  };
}

