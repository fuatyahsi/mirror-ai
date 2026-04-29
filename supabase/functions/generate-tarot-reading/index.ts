import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { getAIProvider } from "../shared/aiProvider.ts";
import { getOptionalUser } from "../shared/auth.ts";
import { buildSourceContext, normalizeLocale, sourceLabels } from "../shared/sourceContext.ts";

type TarotDeckCard = {
  card_key: string;
  name: string;
  arcana: string;
  upright_meaning: string;
  reversed_meaning: string;
};

const spreadPositions: Record<string, string[]> = {
  single: ["message"],
  three_card: ["past", "present", "possible_direction"],
  relationship: ["you", "other", "dynamic"],
  decision: ["option_a", "option_b", "subconscious_influence"]
};

const fallbackCards: TarotDeckCard[] = [
  {
    card_key: "major_18_moon",
    name: "The Moon",
    arcana: "major",
    upright_meaning: "Uncertainty, dreams, subconscious signals.",
    reversed_meaning: "Anxiety clearing, illusion becoming visible."
  },
  {
    card_key: "major_17_star",
    name: "The Star",
    arcana: "major",
    upright_meaning: "Hope, renewal, quiet guidance.",
    reversed_meaning: "Doubt, delayed trust, inner distance."
  },
  {
    card_key: "major_11_justice",
    name: "Justice",
    arcana: "major",
    upright_meaning: "Balance, truth, clear consequence.",
    reversed_meaning: "Avoided truth, imbalance, unclear accountability."
  }
];

const tarotTranslations: Record<
  string,
  {
    tr: { name: string; upright: string; reversed: string };
  }
> = {
  major_00_fool: {
    tr: {
      name: "Deli",
      upright: "Yeni başlangıç, açıklık ve ilk adımda güven.",
      reversed: "Düşünmeden risk alma, pratik sinyalleri görmezden gelme."
    }
  },
  major_01_magician: {
    tr: {
      name: "Büyücü",
      upright: "Niyetini eyleme çevirme, odak ve kişisel güç.",
      reversed: "Dağınık irade, zemini olmayan performans."
    }
  },
  major_02_high_priestess: {
    tr: {
      name: "Başrahibe",
      upright: "Sezgi, iç bilgi ve sessiz gözlem.",
      reversed: "Gizli bilgi, sezgiye güvensizlik ve iç sesi bastırma."
    }
  },
  major_03_empress: {
    tr: {
      name: "İmparatoriçe",
      upright: "Bakım, büyüme, bedenlenme ve kabul etme.",
      reversed: "Aşırı verme, duygusal sınırların bulanıklaşması."
    }
  },
  major_04_emperor: {
    tr: {
      name: "İmparator",
      upright: "Yapı, koruma ve net sınırlar.",
      reversed: "Kontrol, katılık ve duygusal mesafe."
    }
  },
  major_05_hierophant: {
    tr: {
      name: "Aziz",
      upright: "Gelenek, rehberlik ve ortak değerler.",
      reversed: "Kalıba uyma, miras alınmış kurallar ve farklılıktan korkma."
    }
  },
  major_06_lovers: {
    tr: {
      name: "Aşıklar",
      upright: "Seçim, uyum ve yakınlıkta dürüstlük.",
      reversed: "Karışık sinyaller, uyumsuzluk ve yansıtma."
    }
  },
  major_07_chariot: {
    tr: {
      name: "Savaş Arabası",
      upright: "Yön, öz disiplin ve hareket.",
      reversed: "Zorlama, sabırsızlık ve çözülmemiş iç çatışma."
    }
  },
  major_08_strength: {
    tr: {
      name: "Güç",
      upright: "Nazik cesaret, sabır ve duygusal olgunluk.",
      reversed: "Özgüven kırılması, bastırılmış öfke ve iç çekingenlik."
    }
  },
  major_09_hermit: {
    tr: {
      name: "Ermiş",
      upright: "Yalnız kalıp düşünme, iç rehberlik ve sakin gözlem.",
      reversed: "İzolasyon, geri çekilme ve destek almaktan kaçınma."
    }
  },
  major_10_wheel: {
    tr: {
      name: "Kader Çarkı",
      upright: "Döngü değişimi, zamanlama ve dönüm noktası.",
      reversed: "Tekrarlayan kalıp, değişime direnç."
    }
  },
  major_11_justice: {
    tr: {
      name: "Adalet",
      upright: "Netlik, sorumluluk ve dengeli karar.",
      reversed: "Ertelenen gerçek, adaletsizlik hissi ve kafa karışıklığı."
    }
  },
  major_12_hanged_man: {
    tr: {
      name: "Asılan Adam",
      upright: "Duraklama, yeniden çerçeveleme ve teslimiyet.",
      reversed: "Tıkanma, gecikme ve kendini fazla feda etme."
    }
  },
  major_13_death: {
    tr: {
      name: "Ölüm",
      upright: "Bitiş, yenilenme ve dönüşüm.",
      reversed: "Tutunma, geçişten korkma."
    }
  },
  major_14_temperance: {
    tr: {
      name: "Denge",
      upright: "Bütünleşme, ölçülülük ve duygusal simya.",
      reversed: "Aşırılık, dengesizlik ve sabırsızlık."
    }
  },
  major_15_devil: {
    tr: {
      name: "Şeytan",
      upright: "Bağlılık, cazibe ve gölge kalıp.",
      reversed: "Serbest kalma, döngüyü görme ve seçimi geri alma."
    }
  },
  major_16_tower: {
    tr: {
      name: "Kule",
      upright: "Sarsılma, gerçeğin yanılsamayı kırması.",
      reversed: "Değişim korkusu, gecikmiş dürüstlük."
    }
  },
  major_17_star: {
    tr: {
      name: "Yıldız",
      upright: "Umut, iyileşme ve dürüst kırılganlık.",
      reversed: "Cesaret kırılması, temkinlilik ve inanç kaybı."
    }
  },
  major_18_moon: {
    tr: {
      name: "Ay",
      upright: "Belirsizlik, rüyalar ve bilinçaltı sinyaller.",
      reversed: "Kaygının dağılması, yanılsamanın görünür olması."
    }
  },
  major_19_sun: {
    tr: {
      name: "Güneş",
      upright: "Sıcaklık, canlılık, görünürlük ve sevinç.",
      reversed: "Geçici gölgelenme, fazla açılma ve sabırsızlık."
    }
  },
  major_20_judgement: {
    tr: {
      name: "Mahkeme",
      upright: "Uyanış, değerlendirme ve çağrıya cevap verme.",
      reversed: "Kaçınma, kendini yargılama ve tamamlanmamış ders."
    }
  },
  major_21_world: {
    tr: {
      name: "Dünya",
      upright: "Tamamlanma, bütünleşme ve olgun bakış.",
      reversed: "Açık kalan uçlar, neredeyse tamamlanmış döngü."
    }
  }
};

function shuffled<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function localizedCard(card: TarotDeckCard, locale: "tr" | "en") {
  const translated = locale === "tr" ? tarotTranslations[card.card_key]?.tr : undefined;
  return {
    name: translated?.name ?? card.name,
    upright_meaning: translated?.upright ?? card.upright_meaning,
    reversed_meaning: translated?.reversed ?? card.reversed_meaning
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { supabase, user } = await getOptionalUser(req);
    const body = await req.json();
    const locale = normalizeLocale(body.locale);
    const labels = sourceLabels(locale);
    const spreadType = body.spread_type ?? "three_card";
    const positions = spreadPositions[spreadType] ?? spreadPositions.three_card;

    const { data: deck, error: deckError } = await supabase
      .from("tarot_decks")
      .select("card_key,name,arcana,upright_meaning,reversed_meaning")
      .limit(78);

    if (deckError) throw deckError;

    const selectedDeck = shuffled((deck?.length ? deck : fallbackCards) as TarotDeckCard[]).slice(0, positions.length);
    const selectedCards = positions.map((position, index) => {
      const baseCard = selectedDeck[index] ?? fallbackCards[index % fallbackCards.length];
      const orientation = Math.random() < 0.78 ? "upright" : "reversed";
      const localized = localizedCard(baseCard, locale);
      const positionLabel = labels.positions[position as keyof typeof labels.positions] ?? position;
      const orientationLabel = labels.orientations[orientation as keyof typeof labels.orientations] ?? orientation;
      const meaning = orientation === "reversed" ? localized.reversed_meaning : localized.upright_meaning;

      return {
        position,
        position_label: positionLabel,
        card: localized.name,
        card_name_en: baseCard.name,
        card_key: baseCard.card_key,
        orientation,
        orientation_label: orientationLabel,
        upright_meaning: localized.upright_meaning,
        reversed_meaning: localized.reversed_meaning,
        meaning
      };
    });

    const { data: dbProfile } = user
      ? await supabase
          .from("user_personality_profile")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle()
      : { data: null };

    const profile = dbProfile ?? body.profile ?? body.client_profile ?? null;
    const memory = body.memory ?? body.client_memory ?? [];
    const astrology = body.astrology ?? body.astro_context ?? body.natal_chart ?? null;

    const provider = getAIProvider();
    const sourceContext = buildSourceContext({
      readingType: "tarot",
      locale,
      profile,
      memory,
      astrology,
      tarotCards: selectedCards,
      extra: [`${labels.spreadType}: ${spreadType}`, `${labels.topic}: ${body.topic ?? "general"}`]
    });
    const result = await provider.generateReading({
      readingType: "tarot",
      topic: body.topic ?? "general",
      question: body.question,
      context: { spread_type: spreadType, selected_cards: selectedCards, astrology_context: astrology },
      profile,
      memory,
      astrology,
      locale
    });

    if (!user) {
      return jsonResponse({
        reading_id: crypto.randomUUID(),
        persisted: false,
        spread_type: spreadType,
        cards: selectedCards,
        ...result,
        source_context: sourceContext
      });
    }

    const { data: reading, error: readingError } = await supabase
      .from("readings")
      .insert({
        user_id: user.id,
        reading_type: "tarot",
        topic: body.topic ?? "general",
        question: body.question ?? null,
        result_json: { ...result, cards: selectedCards, source_context: sourceContext },
        explanation_json: result.explanation,
        confidence: result.explanation.confidence
      })
      .select("id")
      .single();

    if (readingError) throw readingError;

    const { error: spreadError } = await supabase.from("tarot_spreads").insert({
      user_id: user.id,
      reading_id: reading.id,
      spread_type: spreadType,
      selected_cards: selectedCards
    });

    if (spreadError) throw spreadError;

    return jsonResponse({
      reading_id: reading.id,
      persisted: true,
      spread_type: spreadType,
      cards: selectedCards,
      ...result,
      source_context: sourceContext
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
