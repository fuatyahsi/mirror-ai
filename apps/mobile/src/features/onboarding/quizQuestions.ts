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
    }
  ]
} as const;

export function getProfileQuestions(locale: Locale) {
  return profileQuestions[locale];
}
