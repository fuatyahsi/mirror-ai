import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("Geçerli bir e-posta yaz."),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı.")
});

export const birthInfoSchema = z.object({
  birth_date: z.string().min(1, "Doğum tarihi gerekli."),
  birth_time: z.string().optional(),
  birth_city: z.string().min(1, "Şehir gerekli."),
  birth_country: z.string().min(1, "Ülke gerekli.")
});

export const readingQuestionSchema = z.object({
  question: z.string().min(6, "Sorunu biraz daha açık yaz."),
  topic: z.string().min(1, "Bir konu seç.")
});

