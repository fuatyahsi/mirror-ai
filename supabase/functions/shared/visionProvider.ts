export type CoffeeSymbol = {
  symbol: string;
  label: string;
  meaning: string;
  confidence: number;
};

type CoffeeVisionResult = {
  detected_symbols: CoffeeSymbol[];
  image_quality?: string;
};

const fallbackSymbols: Record<"tr" | "en", CoffeeSymbol[]> = {
  tr: [
    { symbol: "road", label: "Yol", meaning: "Hareket, haber veya yön değişimi", confidence: 0.61 },
    { symbol: "ring", label: "Yüzük", meaning: "Bağ, döngü veya tekrar eden ilişki teması", confidence: 0.55 }
  ],
  en: [
    { symbol: "road", label: "Road", meaning: "Movement, news, or a change of direction", confidence: 0.61 },
    { symbol: "ring", label: "Ring", meaning: "Bond, loop, or repeated relationship theme", confidence: 0.55 }
  ]
};

const coffeeVisionSchema = {
  type: "object",
  properties: {
    image_quality: { type: "string" },
    detected_symbols: {
      type: "array",
      minItems: 1,
      maxItems: 8,
      items: {
        type: "object",
        properties: {
          symbol: { type: "string" },
          label: { type: "string" },
          meaning: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 }
        },
        required: ["symbol", "label", "meaning", "confidence"]
      }
    }
  },
  required: ["detected_symbols"]
};

export async function extractCoffeeSymbols({
  cupImageBase64,
  cupImageMimeType,
  plateImageBase64,
  plateImageMimeType,
  cupImageUrl,
  plateImageUrl,
  topic,
  question,
  locale
}: {
  cupImageBase64?: string;
  cupImageMimeType?: string;
  plateImageBase64?: string;
  plateImageMimeType?: string;
  cupImageUrl?: string;
  plateImageUrl?: string;
  topic?: string;
  question?: string;
  locale: "tr" | "en";
}): Promise<CoffeeVisionResult> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  const hasInlineCup = Boolean(cupImageBase64);
  const hasUrlCup = Boolean(cupImageUrl && !cupImageUrl.includes("local-dev-coffee-image-placeholder"));
  if (!apiKey || (!hasInlineCup && !hasUrlCup)) {
    return { detected_symbols: fallbackSymbols[locale], image_quality: "fallback" };
  }

  // Tercih: inline base64 (storage'a hiç yüklemiyoruz, kahve fotoğrafı sunucuda hiç tutulmuyor).
  // Geriye dönük uyumluluk: URL geliyorsa fetch et.
  const cupImage = hasInlineCup
    ? buildInlinePart(cupImageBase64!, cupImageMimeType)
    : await fetchImagePart(cupImageUrl!);
  const plateImage = plateImageBase64
    ? buildInlinePart(plateImageBase64, plateImageMimeType)
    : plateImageUrl
      ? await fetchImagePart(plateImageUrl)
      : null;
  const model = Deno.env.get("GEMINI_VISION_MODEL") ?? Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash-lite";
  const prompt =
    locale === "en"
      ? `Analyze this Turkish coffee cup image for symbolic coffee-reading shapes. Topic: ${
          topic ?? "general"
        }. User question: ${question ?? "not provided"}. Return grounded visible symbols only.`
      : `Bu Türk kahvesi fincan görselini sembolik kahve falı şekilleri açısından analiz et. Konu: ${
          topic ?? "genel"
        }. Kullanıcı sorusu: ${question ?? "yok"}. Sadece görselde temellenebilen sembolleri döndür.`;

  const parts: Array<Record<string, unknown>> = [{ text: prompt }, cupImage];
  if (plateImage) parts.push({ text: locale === "en" ? "Optional plate image:" : "Opsiyonel tabak görseli:" }, plateImage);

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.25,
        responseMimeType: "application/json",
        responseJsonSchema: coffeeVisionSchema
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    const message = data?.error?.message || `Coffee vision request failed with status ${response.status}.`;
    throw new Error(message);
  }

  const text = parseGeminiText(data);
  const parsed = JSON.parse(text) as CoffeeVisionResult;
  return {
    image_quality: parsed.image_quality,
    detected_symbols:
      Array.isArray(parsed.detected_symbols) && parsed.detected_symbols.length > 0
        ? parsed.detected_symbols.map(normalizeSymbol)
        : fallbackSymbols[locale]
  };
}

function buildInlinePart(base64: string, mimeType?: string) {
  return {
    inline_data: {
      mime_type: mimeType && mimeType.length ? mimeType : "image/jpeg",
      data: base64
    }
  };
}

async function fetchImagePart(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Coffee image could not be fetched. Status ${response.status}.`);
  }

  const mimeType = response.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  const base64 = arrayBufferToBase64(await response.arrayBuffer());

  return {
    inline_data: {
      mime_type: mimeType,
      data: base64
    }
  };
}

function parseGeminiText(data: Record<string, unknown>) {
  const candidates = data.candidates as Array<Record<string, unknown>> | undefined;
  const firstCandidate = candidates?.[0];
  const content = firstCandidate?.content as Record<string, unknown> | undefined;
  const parts = content?.parts as Array<Record<string, unknown>> | undefined;
  const text = parts?.map((part) => part.text).filter(Boolean).join("") ?? "";
  if (!text) throw new Error("Coffee vision provider returned an empty response.");
  return text;
}

function normalizeSymbol(symbol: CoffeeSymbol): CoffeeSymbol {
  return {
    symbol: String(symbol.symbol || "unknown").toLowerCase().replace(/\s+/g, "_"),
    label: String(symbol.label || symbol.symbol || "Symbol"),
    meaning: String(symbol.meaning || "Symbolic visual cue"),
    confidence: Math.max(0, Math.min(1, Number(symbol.confidence ?? 0.5)))
  };
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}
