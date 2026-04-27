import type { Locale } from "@/i18n";

export const profileQuestions = {
  tr: [
    {
      id: "uncertainty",
      title: "Net sinyal alamadığında genelde ne yaparsın?",
      options: [
        { id: "wait", label: "İçime kapanır, beklerim." },
        { id: "clues", label: "Daha fazla ipucu ararım." },
        { id: "direct", label: "Direkt sorarım." },
        { id: "withdraw", label: "Kendimi geri çekerim." },
        { id: "overthink", label: "Fazla düşünür, anlam yüklerim." }
      ]
    },
    {
      id: "pattern",
      title: "Geçmiş ilişkilerinde en çok hangi döngüyü tekrar ettin?",
      options: [
        { id: "unavailable", label: "Ulaşılması zor kişilere çekilmek" },
        { id: "fast_attach", label: "Çok hızlı bağlanmak" },
        { id: "cool_off", label: "İyi giderken soğumak" },
        { id: "change_them", label: "Karşımdakini değiştirmeye çalışmak" },
        { id: "limbo", label: "Belirsiz ilişkide uzun kalmak" }
      ]
    },
    {
      id: "resonance",
      title: "Bir yorumun sana doğru gelmesi için ne gerekir?",
      options: [
        { id: "emotion", label: "Duygumu yakalaması" },
        { id: "concrete", label: "Somut olayla bağ kurması" },
        { id: "spiritual", label: "Spiritüel olarak anlamlı hissettirmesi" },
        { id: "logical", label: "Mantıklı ve tutarlı olması" },
        { id: "surprise", label: "Beni şaşırtması" }
      ]
    },
    {
      id: "decision",
      title: "Zor bir karar verirken içindeki pusula en çok neye döner?",
      options: [
        { id: "body_signal", label: "Bedenimdeki his ve iç sıkışmasına" },
        { id: "evidence_map", label: "Somut kanıt ve olay sırasına" },
        { id: "trusted_voice", label: "Güvendiğim birinin aynalamasına" },
        { id: "symbolic_sign", label: "Tekrar eden sembol ve işaretlere" },
        { id: "time_distance", label: "Biraz zaman geçince kalan hisse" }
      ]
    },
    {
      id: "emotional_loop",
      title: "Bir konu zihninde dönüp durduğunda seni en çok ne rahatlatır?",
      options: [
        { id: "name_feeling", label: "Duyguyu net isimlendirmek" },
        { id: "action_step", label: "Küçük ve uygulanabilir bir adım bulmak" },
        { id: "ritual_space", label: "Kendime sakin bir ritüel alanı açmak" },
        { id: "talk_it_out", label: "Biriyle konuşup dışarıdan görmek" },
        { id: "control_plan", label: "Plan yapıp kontrolü geri almak" }
      ]
    },
    {
      id: "astrology_expectation",
      title: "Astrolojik yorumda en çok neyi görmek istersin?",
      options: [
        { id: "chart_reference", label: "Gezegen, burç, ev ve açı referanslarını" },
        { id: "life_theme", label: "Hayat teması ve tekrar eden döngüyü" },
        { id: "relationship_axis", label: "İlişki ve bağlanma dinamiğini" },
        { id: "daily_focus", label: "Günlük net odak ve uyarıyı" },
        { id: "deep_symbolism", label: "Daha mistik ve sembolik anlatımı" }
      ]
    },
    {
      id: "feedback_style",
      title: "Bir yorum sana uymadığında nasıl geri bildirim verirsin?",
      options: [
        { id: "specific_correction", label: "Hangi kısmın uymadığını net söylerim" },
        { id: "emotional_note", label: "Bende bıraktığı hissi anlatırım" },
        { id: "skip_feedback", label: "Genelde geçerim, uğraşmam" },
        { id: "compare_past", label: "Eski yorumlarla kıyaslarım" },
        { id: "ask_deeper", label: "Daha derin ve açıklamalı yorum isterim" }
      ]
    },
    {
      id: "tone",
      title: "Mirror AI sana nasıl konuşursa daha iyi gelir?",
      options: [
        { id: "gentle_tone", label: "Yumuşak, sakin ve güven veren" },
        { id: "direct_tone", label: "Net, kısa ve dolandırmadan" },
        { id: "reflective_tone", label: "Düşündüren ve içgörü açan" },
        { id: "evidence_tone", label: "Referanslı, gerekçeli ve analitik" },
        { id: "mystic_tone", label: "Sembolik, şiirsel ama abartısız" }
      ]
    }
  ],
  en: [
    {
      id: "uncertainty",
      title: "When you do not get a clear signal, what do you usually do?",
      options: [
        { id: "wait", label: "I close inward and wait." },
        { id: "clues", label: "I look for more clues." },
        { id: "direct", label: "I ask directly." },
        { id: "withdraw", label: "I pull myself back." },
        { id: "overthink", label: "I overthink and attach meaning." }
      ]
    },
    {
      id: "pattern",
      title: "Which pattern have you repeated most in past relationships?",
      options: [
        { id: "unavailable", label: "Being drawn to unavailable people" },
        { id: "fast_attach", label: "Getting attached very quickly" },
        { id: "cool_off", label: "Cooling off when things go well" },
        { id: "change_them", label: "Trying to change the other person" },
        { id: "limbo", label: "Staying too long in unclear connections" }
      ]
    },
    {
      id: "resonance",
      title: "What makes a reading feel accurate to you?",
      options: [
        { id: "emotion", label: "It captures my feeling." },
        { id: "concrete", label: "It connects to a concrete situation." },
        { id: "spiritual", label: "It feels spiritually meaningful." },
        { id: "logical", label: "It is logical and consistent." },
        { id: "surprise", label: "It surprises me." }
      ]
    },
    {
      id: "decision",
      title: "When making a difficult decision, what does your inner compass check first?",
      options: [
        { id: "body_signal", label: "Body signals and inner tightness" },
        { id: "evidence_map", label: "Concrete evidence and sequence of events" },
        { id: "trusted_voice", label: "Reflection from someone I trust" },
        { id: "symbolic_sign", label: "Repeated symbols and signs" },
        { id: "time_distance", label: "The feeling that remains after time passes" }
      ]
    },
    {
      id: "emotional_loop",
      title: "When a topic loops in your mind, what calms you most?",
      options: [
        { id: "name_feeling", label: "Naming the feeling clearly" },
        { id: "action_step", label: "Finding a small practical step" },
        { id: "ritual_space", label: "Opening a calm ritual space" },
        { id: "talk_it_out", label: "Talking it through with someone" },
        { id: "control_plan", label: "Making a plan to regain control" }
      ]
    },
    {
      id: "astrology_expectation",
      title: "What do you most want to see in an astrology reading?",
      options: [
        { id: "chart_reference", label: "Planet, sign, house, and aspect references" },
        { id: "life_theme", label: "Life themes and repeating patterns" },
        { id: "relationship_axis", label: "Relationship and attachment dynamics" },
        { id: "daily_focus", label: "A clear daily focus and caution" },
        { id: "deep_symbolism", label: "More mystical and symbolic language" }
      ]
    },
    {
      id: "feedback_style",
      title: "When a reading does not fit, how do you usually give feedback?",
      options: [
        { id: "specific_correction", label: "I clearly name the part that missed." },
        { id: "emotional_note", label: "I describe the feeling it left in me." },
        { id: "skip_feedback", label: "I usually skip it." },
        { id: "compare_past", label: "I compare it with older readings." },
        { id: "ask_deeper", label: "I ask for a deeper explanation." }
      ]
    },
    {
      id: "tone",
      title: "How should Mirror AI speak to you?",
      options: [
        { id: "gentle_tone", label: "Soft, calm, and reassuring" },
        { id: "direct_tone", label: "Clear, concise, and direct" },
        { id: "reflective_tone", label: "Reflective and insight-opening" },
        { id: "evidence_tone", label: "Referenced, reasoned, and analytical" },
        { id: "mystic_tone", label: "Symbolic and poetic without exaggeration" }
      ]
    }
  ]
} as const;

export function getProfileQuestions(locale: Locale) {
  return profileQuestions[locale];
}
