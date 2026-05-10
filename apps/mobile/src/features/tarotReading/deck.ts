import type { Locale } from "@/i18n";
import type { TarotCardDraw } from "@/types/readings";

export type TarotDeckEntry = {
  card_key: string;
  name: string;
  tr_name: string;
  upright_meaning: string;
  reversed_meaning: string;
  tr_upright_meaning: string;
  tr_reversed_meaning: string;
};

export type SelectableTarotCard = TarotDeckEntry & {
  orientation: "upright" | "reversed";
};

const spreadPositions: Record<string, string[]> = {
  single: ["message"],
  three_card: ["past", "present", "possible_direction"],
  relationship: ["you", "other", "dynamic"],
  decision: ["option_a", "option_b", "subconscious_influence"]
};

const positionLabels = {
  tr: {
    message: "Mesaj",
    past: "Geçmiş",
    present: "Şimdi",
    possible_direction: "Olası yön",
    you: "Sen",
    other: "Karşı taraf",
    dynamic: "Dinamik",
    option_a: "Seçenek A",
    option_b: "Seçenek B",
    subconscious_influence: "Bilinçaltı etki",
    clarifier: "Netleştirici kart"
  },
  en: {
    message: "Message",
    past: "Past",
    present: "Present",
    possible_direction: "Possible direction",
    you: "You",
    other: "Other person",
    dynamic: "Dynamic",
    option_a: "Option A",
    option_b: "Option B",
    subconscious_influence: "Subconscious influence",
    clarifier: "Clarifier card"
  }
} as const;

const orientationLabels = {
  tr: {
    upright: "Düz",
    reversed: "Ters"
  },
  en: {
    upright: "Upright",
    reversed: "Reversed"
  }
} as const;

export const majorArcanaDeck: TarotDeckEntry[] = [
  {
    card_key: "major_00_fool",
    name: "The Fool",
    tr_name: "Deli",
    upright_meaning: "New beginning, openness, trust in the first step.",
    reversed_meaning: "Recklessness, avoidance of practical signals.",
    tr_upright_meaning: "Yeni başlangıç, açıklık ve ilk adımda güven.",
    tr_reversed_meaning: "Düşünmeden risk alma, pratik sinyalleri görmezden gelme."
  },
  {
    card_key: "major_01_magician",
    name: "The Magician",
    tr_name: "Büyücü",
    upright_meaning: "Agency, focus, turning intention into action.",
    reversed_meaning: "Scattered will, performance without grounding.",
    tr_upright_meaning: "Niyetini eyleme çevirme, odak ve kişisel güç.",
    tr_reversed_meaning: "Dağınık irade, zemini olmayan performans."
  },
  {
    card_key: "major_02_high_priestess",
    name: "The High Priestess",
    tr_name: "Başrahibe",
    upright_meaning: "Intuition, inner knowing, quiet observation.",
    reversed_meaning: "Hidden information, distrust of intuition.",
    tr_upright_meaning: "Sezgi, iç bilgi ve sessiz gözlem.",
    tr_reversed_meaning: "Gizli bilgi, sezgiye güvensizlik ve iç sesi bastırma."
  },
  {
    card_key: "major_03_empress",
    name: "The Empress",
    tr_name: "İmparatoriçe",
    upright_meaning: "Care, growth, embodiment, receiving.",
    reversed_meaning: "Overgiving, blurred emotional boundaries.",
    tr_upright_meaning: "Bakım, büyüme, bedenlenme ve kabul etme.",
    tr_reversed_meaning: "Aşırı verme, duygusal sınırların bulanıklaşması."
  },
  {
    card_key: "major_04_emperor",
    name: "The Emperor",
    tr_name: "İmparator",
    upright_meaning: "Structure, protection, clear limits.",
    reversed_meaning: "Control, rigidity, emotional distance.",
    tr_upright_meaning: "Yapı, koruma ve net sınırlar.",
    tr_reversed_meaning: "Kontrol, katılık ve duygusal mesafe."
  },
  {
    card_key: "major_05_hierophant",
    name: "The Hierophant",
    tr_name: "Aziz",
    upright_meaning: "Tradition, guidance, shared values.",
    reversed_meaning: "Conformity, inherited rules, fear of difference.",
    tr_upright_meaning: "Gelenek, rehberlik ve ortak değerler.",
    tr_reversed_meaning: "Kalıba uyma, miras alınmış kurallar ve farklılıktan korkma."
  },
  {
    card_key: "major_06_lovers",
    name: "The Lovers",
    tr_name: "Aşıklar",
    upright_meaning: "Choice, alignment, intimate honesty.",
    reversed_meaning: "Mixed signals, misalignment, projection.",
    tr_upright_meaning: "Seçim, uyum ve yakınlıkta dürüstlük.",
    tr_reversed_meaning: "Karışık sinyaller, uyumsuzluk ve yansıtma."
  },
  {
    card_key: "major_07_chariot",
    name: "The Chariot",
    tr_name: "Savaş Arabası",
    upright_meaning: "Direction, self-command, movement.",
    reversed_meaning: "Force, impatience, unresolved inner conflict.",
    tr_upright_meaning: "Yön, öz disiplin ve hareket.",
    tr_reversed_meaning: "Zorlama, sabırsızlık ve çözülmemiş iç çatışma."
  },
  {
    card_key: "major_08_strength",
    name: "Strength",
    tr_name: "Güç",
    upright_meaning: "Gentle courage, patience, emotional maturity.",
    reversed_meaning: "Self-doubt, suppressed anger, fragile confidence.",
    tr_upright_meaning: "Nazik cesaret, sabır ve duygusal olgunluk.",
    tr_reversed_meaning: "Özgüven kırılması, bastırılmış öfke ve iç çekingenlik."
  },
  {
    card_key: "major_09_hermit",
    name: "The Hermit",
    tr_name: "Ermiş",
    upright_meaning: "Solitude, reflection, inner guidance.",
    reversed_meaning: "Isolation, withdrawal, refusing support.",
    tr_upright_meaning: "Yalnız kalıp düşünme, iç rehberlik ve sakin gözlem.",
    tr_reversed_meaning: "İzolasyon, geri çekilme ve destek almaktan kaçınma."
  },
  {
    card_key: "major_10_wheel",
    name: "Wheel of Fortune",
    tr_name: "Kader Çarkı",
    upright_meaning: "Cycle change, timing, turning point.",
    reversed_meaning: "Repeating pattern, resistance to change.",
    tr_upright_meaning: "Döngü değişimi, zamanlama ve dönüm noktası.",
    tr_reversed_meaning: "Tekrarlayan kalıp, değişime direnç."
  },
  {
    card_key: "major_11_justice",
    name: "Justice",
    tr_name: "Adalet",
    upright_meaning: "Clarity, accountability, balanced decision.",
    reversed_meaning: "Avoided truth, unfairness, confusion.",
    tr_upright_meaning: "Netlik, sorumluluk ve dengeli karar.",
    tr_reversed_meaning: "Ertelenen gerçek, adaletsizlik hissi ve kafa karışıklığı."
  },
  {
    card_key: "major_12_hanged_man",
    name: "The Hanged Man",
    tr_name: "Asılan Adam",
    upright_meaning: "Pause, reframing, surrender.",
    reversed_meaning: "Stagnation, delay, self-sacrifice.",
    tr_upright_meaning: "Duraklama, yeniden çerçeveleme ve teslimiyet.",
    tr_reversed_meaning: "Tıkanma, gecikme ve kendini fazla feda etme."
  },
  {
    card_key: "major_13_death",
    name: "Death",
    tr_name: "Ölüm",
    upright_meaning: "Ending, renewal, transformation.",
    reversed_meaning: "Clinging, fear of transition.",
    tr_upright_meaning: "Bitiş, yenilenme ve dönüşüm.",
    tr_reversed_meaning: "Tutunma, geçişten korkma."
  },
  {
    card_key: "major_14_temperance",
    name: "Temperance",
    tr_name: "Denge",
    upright_meaning: "Integration, moderation, emotional alchemy.",
    reversed_meaning: "Excess, imbalance, impatience.",
    tr_upright_meaning: "Bütünleşme, ölçülülük ve duygusal simya.",
    tr_reversed_meaning: "Aşırılık, dengesizlik ve sabırsızlık."
  },
  {
    card_key: "major_15_devil",
    name: "The Devil",
    tr_name: "Şeytan",
    upright_meaning: "Attachment, temptation, shadow pattern.",
    reversed_meaning: "Release, seeing the loop, reclaiming choice.",
    tr_upright_meaning: "Bağlılık, cazibe ve gölge kalıp.",
    tr_reversed_meaning: "Serbest kalma, döngüyü görme ve seçimi geri alma."
  },
  {
    card_key: "major_16_tower",
    name: "The Tower",
    tr_name: "Kule",
    upright_meaning: "Disruption, truth breaking through illusion.",
    reversed_meaning: "Fear of change, delayed honesty.",
    tr_upright_meaning: "Sarsılma, gerçeğin yanılsamayı kırması.",
    tr_reversed_meaning: "Değişim korkusu, gecikmiş dürüstlük."
  },
  {
    card_key: "major_17_star",
    name: "The Star",
    tr_name: "Yıldız",
    upright_meaning: "Hope, healing, honest vulnerability.",
    reversed_meaning: "Discouragement, guardedness, lost faith.",
    tr_upright_meaning: "Umut, iyileşme ve dürüst kırılganlık.",
    tr_reversed_meaning: "Cesaret kırılması, temkinlilik ve inanç kaybı."
  },
  {
    card_key: "major_18_moon",
    name: "The Moon",
    tr_name: "Ay",
    upright_meaning: "Uncertainty, dreams, subconscious signals.",
    reversed_meaning: "Anxiety clearing, illusion becoming visible.",
    tr_upright_meaning: "Belirsizlik, rüyalar ve bilinçaltı sinyaller.",
    tr_reversed_meaning: "Kaygının dağılması, yanılsamanın görünür olması."
  },
  {
    card_key: "major_19_sun",
    name: "The Sun",
    tr_name: "Güneş",
    upright_meaning: "Warmth, vitality, visibility, joy.",
    reversed_meaning: "Temporary dimming, overexposure, impatience.",
    tr_upright_meaning: "Sıcaklık, canlılık, görünürlük ve sevinç.",
    tr_reversed_meaning: "Geçici gölgelenme, fazla açılma ve sabırsızlık."
  },
  {
    card_key: "major_20_judgement",
    name: "Judgement",
    tr_name: "Mahkeme",
    upright_meaning: "Awakening, reflection, answering a call.",
    reversed_meaning: "Avoidance, self-judgment, unfinished lesson.",
    tr_upright_meaning: "Uyanış, değerlendirme ve çağrıya cevap verme.",
    tr_reversed_meaning: "Kaçınma, kendini yargılama ve tamamlanmamış ders."
  },
  {
    card_key: "major_21_world",
    name: "The World",
    tr_name: "Dünya",
    upright_meaning: "Completion, integration, mature perspective.",
    reversed_meaning: "Loose ends, almost-finished cycle.",
    tr_upright_meaning: "Tamamlanma, bütünleşme ve olgun bakış.",
    tr_reversed_meaning: "Açık kalan uçlar, neredeyse tamamlanmış döngü."
  }
];

export function getSpreadPositions(spreadType: string) {
  return spreadPositions[spreadType] ?? spreadPositions.three_card;
}

export function getRequiredCardCount(spreadType: string) {
  return getSpreadPositions(spreadType).length;
}

export function getPositionLabel(position: string, locale: Locale = "tr") {
  const labels = positionLabels[locale];
  return labels[position as keyof typeof labels] ?? position;
}

export function getOrientationLabel(orientation: "upright" | "reversed", locale: Locale = "tr") {
  return orientationLabels[locale][orientation];
}

export function getCardName(card: TarotDeckEntry, locale: Locale = "tr") {
  return locale === "en" ? card.name : card.tr_name;
}

export function getCardMeaning(card: TarotDeckEntry, orientation: "upright" | "reversed", locale: Locale = "tr") {
  if (locale === "en") {
    return orientation === "reversed" ? card.reversed_meaning : card.upright_meaning;
  }
  return orientation === "reversed" ? card.tr_reversed_meaning : card.tr_upright_meaning;
}

export function buildShuffledTarotDeck() {
  const deck = majorArcanaDeck.map((card) => ({
    ...card,
    orientation: Math.random() < 0.78 ? ("upright" as const) : ("reversed" as const)
  }));

  for (let index = deck.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [deck[index], deck[randomIndex]] = [deck[randomIndex], deck[index]];
  }

  return deck;
}

export function assignSelectedTarotCards(
  cards: SelectableTarotCard[],
  spreadType: string,
  locale: Locale = "tr",
  includeClarifier = false
): TarotCardDraw[] {
  const positions = includeClarifier ? [...getSpreadPositions(spreadType), "clarifier"] : getSpreadPositions(spreadType);

  return cards.slice(0, positions.length).map((card, index) => {
    const position = positions[index];
    return {
      position,
      position_label: getPositionLabel(position, locale),
      card: getCardName(card, locale),
      card_name_en: card.name,
      card_key: card.card_key,
      orientation: card.orientation,
      orientation_label: getOrientationLabel(card.orientation, locale),
      upright_meaning: locale === "en" ? card.upright_meaning : card.tr_upright_meaning,
      reversed_meaning: locale === "en" ? card.reversed_meaning : card.tr_reversed_meaning,
      meaning: getCardMeaning(card, card.orientation, locale)
    };
  });
}
