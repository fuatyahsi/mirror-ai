# Mirror AI — Yayın Hazırlık Handoff

**Son güncelleme:** 2026-05-15
**Yazan:** önceki Cowork oturumu (Claude). Yeni Cowork oturumuna açıldığında bu dosya tek başına yeterlidir.

---

## 0. Tek cümle özet

Mirror AI; doğum haritası + sinastri + ilişki günlüğü + bugünkü gökyüzünü tek raporda yorumlayan, Gemini Pro + Swiss Ephemeris ile çalışan, Plus aboneliği ve kredi paketi sunan, Türkçe + İngilizce React Native (Expo) uygulamasıdır. Bu aşamada **fonksiyonel olarak tam, store-ready** durumda; eksik olan **şirket bilgileri** ve **gerçek satış sandbox doğrulamaları**.

---

## 1. Repo + ortam

| Bileşen | Konum |
|---|---|
| Repo kökü | `C:\Users\user\Desktop\mirrorai` |
| Mobile app | `apps\mobile` (Expo SDK 52, RN 0.76, TS, Zustand, Supabase JS, RevenueCat) |
| Edge Functions (Deno) | `supabase\functions` |
| Shared modüller | `supabase\functions\shared` |
| Migrations | `supabase\migrations` (013'e kadar) |
| Astroloji servisi | Hugging Face Space `fuatyah/mirror-ai-astrology` (FastAPI + pyswisseph) |
| Legal | `docs\legal\privacy.{tr,en}.md`, `docs\legal\terms.{tr,en}.md` |
| Store listing | `docs\store\listing.{tr,en}.md` |
| Telemetri raporu | `scripts\usage-report.sh` |
| Secrets | `secrets.txt` repo kökünde |
| Supabase project ref | `eysnrjkupfvwdbqzmiml` |
| Supabase PAT | Dokümana yazılmamalı. Deploy gerekiyorsa Supabase Dashboard > Account > Access Tokens üzerinden geçici `sbp_...` token üret ve iş bitince revoke et. |
| Mevcut release APK | `apps\mobile\android\app\build\outputs\apk\release\app-release.apk` (cihazda doğrulandı) |

---

## 2. Tamamlanan ana yetenekler (bu turda)

### Premium derin sinastri raporu (3 katmanlı blueprint mimarisi)
- `RelationshipDeepReport` schema'sı: bond_profile, synastry_pattern, repeated_loop, today_timing, next_action_or_message, **user_blueprint**, **partner_blueprint**, **interaction_choreography**, history_compare, scores, confidence, evidence.
- LLM prompt zorunlu sıralı üretim mantığı: önce iki blueprint'i çıkar (attachment style, defense, wound, triggers, soft spots), sonra etkileşim koreografisi (trigger zincirleri), sonra diğer bölümler bu çapaları çağırır.
- Curated context bloğu: Sun/Moon/Asc + Venus/Mars/Saturn/Mercury/Jupiter + Lilith/Chiron/NorthNode + 7. ev/Descendant + ilişkisel basınç açıları (Moon-Saturn, Venus-Saturn vb.).
- Mobile `RelationshipDeepReportCard`: yeni 3 katman tam render (Senin Blueprint, Onun Blueprint, Etkileşim Koreografisi — trigger zincirleri + repair window).

### Gemini Pro + premium quality directive
- `pickGeminiModel(request)` → premium reading tipleri Pro'ya, free Lite'a. Pro hatasında otomatik Lite fallback.
- `premiumQualityDirective` prompt'a enjekte edilir: jenerik zodiac yasak, screenshot-worthy cümle zorunlu, evidence-temelli özgüllük şart.
- `GEMINI_PRICING_PER_1M` Google AI Studio 2026 fiyatlarıyla güncellendi: Gemini 3.1/3/2.5 aileleri, Pro long-context tier ve Flash-Lite maliyetleri izleniyor.
- Premium kullanıcı/credit harcayan yüzeyler Pro model kullanır; ücretsiz/basic yüzeyler Lite/Flash kalır. `GEMINI_FORCE_MODEL` acil durumda tüm trafiği ucuz modele düşürür.

### Haftalık ilişki raporu
- Schema, prompt, edge function (`generate-weekly-relationship-report`), `WeeklyRelationshipReportCard` (mood_arc, recurring themes severity rozetleri, 7 günlük timeline, next week focus + timing anchors, numaralı action plan).
- Kredi: 4 (deep ile aynı) veya Plus.

### 1-hafta sonra otomatik takip raporu
- `relationship_follow_ups` tablosu (RLS + partial unique index → spam engel).
- `generate-relationship-reading` deep rapor sonrası 7 gün sonrası için pending satır enqueue eder.
- `process-relationship-follow-ups` edge function (auth + cron-secret) saatte bir push gönderir.
- pg_cron job `0 * * * *` çalışıyor; `CRON_SECRET` Supabase secrets'ta.
- Mobile `addRelationshipFollowUpListener` push tap'ini `/tabs/relationship`'e yönlendirir.

### Kahve fotoğrafı no-store
- Cihazdaki fotoğraf storage'a **hiç yüklenmez**. Mobile base64 olarak gönderir, vision API tek seferde okur, hiçbir yere kalıcı yazılmaz.
- `uploadCoffeeImage` ve `deleteCoffeeImage` kaldırıldı; yerine `readImageAsBase64`.
- Edge function `cup_image_base64` + `cup_image_mime_type` body parametrelerini kabul eder. Geriye dönük URL desteği vision provider'da hâlâ var ama mobile akış URL kullanmaz.
- i18n string'i ve gizlilik politikası "fotoğrafın saklanmaz" diyecek şekilde güncellendi.

### Pro maliyet izleme + telemetri
- `ai_usage_logs` tablosu: prompt_tokens, completion_tokens, est_cost_usd, preflight_est_cost_usd, latency_ms, success, error_code, finish_reason, billing_tier, is_premium_model, blocked_reason.
- `aiProvider.ts` her LLM çağrısından **önce** bütçe guard çalıştırır, sonra gerçek token/maliyet loglar. Kahve vision çağrısı da aynı guard'a bağlı.
- Guard env'leri: `AI_BUDGET_GUARD_ENABLED`, `AI_DAILY_GLOBAL_BUDGET_USD`, `AI_MONTHLY_GLOBAL_BUDGET_USD`, `AI_DAILY_PREMIUM_MODEL_BUDGET_USD`, `AI_DAILY_USER_FREE_BUDGET_USD`, `AI_DAILY_USER_PAID_BUDGET_USD`, `AI_MONTHLY_USER_PAID_BUDGET_USD`, `AI_DAILY_USER_FREE_CALLS`, `AI_DAILY_USER_PAID_CALLS`.
- `get-ai-usage-summary` edge function kullanıcıya kendi kullanım/maliyet özetini döner. `AI_USAGE_ADMIN_EMAILS` içinde olan kullanıcı `scope=global` ile global özeti görebilir.
- `scripts/usage-report.sh` günlük/haftalık özet — blocked çağrılar ve engellenen tahmini maliyet dahil.

### Paywall mock preview
- `PaywallMockPreview` component her premium feature için blur'lı bir gerçek-rapor parçası gösterir (bond title + skor şeridi + key aspect chip + sample message snippet + redacted block char'lar + dim overlay + lock badge).
- Yeni dep gerektirmez. Paywall ekranına otomatik enjekte (compact değilken).

### Share-card (text-only, ilk versiyon)
- RN built-in `Share` API ile. `shareReading(reading, locale)` deep + weekly için özgül paylaşım metni üretir.
- Reading detay ekranının altında "Bu raporu paylaş" butonu.
- Görsel share-card (view-shot ile) erteleyi: yeni dep + APK rebuild gerektirir.

### Anonymous Supabase auth bootstrap
- `_layout.tsx`'te `ensureAnonymousSession` cold start'ta `signInAnonymously` çağırır. Cihaz başına kalıcı user kimliği.
- Anonymous sign-ins Supabase project ayarlarında AÇIK (management API ile patch edildi).
- Email/social sign-in akışı henüz yok; kullanıcı sadece anonymous oturumla başlar.

### Production guard (mock fallback kapatma)
- `lib/supabase.ts` → `assertRemoteServicesAvailable()` ve `shouldUseMockFallback()`.
- Tüm `features/**/api.ts` dosyaları artık production'da mock'a düşmüyor; gerçek backend olmadan fail-fast hata atar.
- `__DEV__ || EXPO_PUBLIC_ALLOW_MOCKS === "true"` koşulu ile mock'lar yalnızca dev'de izinli.

### Yayın için yasal + ASO
- `docs/legal/privacy.{tr,en}.md` — KVKK + GDPR uyumlu (toplanan veriler, üçüncü taraf işleyiciler, saklama süreleri, kullanıcı hakları, hesap silme).
- `docs/legal/terms.{tr,en}.md` — abonelik, krediler, cayma, yasak kullanım, sorumluluk reddi, uygulanacak hukuk (TR).
- `docs/store/listing.{tr,en}.md` — uygulama adı, kısa+uzun açıklama, anahtar kelimeler, ekran görüntüsü altyazıları, promo text.
- **Placeholder doldurulacaklar:** `{{TARIH}}`, `{{SIRKET_ADI_VE_VERGI_BILGISI}}`, `{{ILETISIM_EPOSTASI}}`, `{{POSTAL_ADRES}}` (yeni oturum kullanıcıdan alır).

---

## 3. Mimari özet (yeni oturum hızlı kavrasın)

### Reading akışı (deep relationship örnek)
```
Mobile app
  ├─ ensureAnonymousSession (cold start)
  ├─ İlişki ekranı → form doldur (kişi adı, doğum verisi, soru)
  ├─ "Derin sinastri raporunu aç" → kredi/Plus kontrolü (frontend)
  ├─ buildSynastryReport (mobile, instant local synastry)
  ├─ generateRelationshipReading()
  │    └─ POST /functions/v1/generate-relationship-reading
  │
Edge Function (Deno)
  ├─ getOptionalUser(req) → user veya anon
  ├─ requirePaidAccessForUser("relationship", user.id) → 402 if no credits/Plus
  ├─ calculateServerSynastry → Hugging Face Spaces /synastry
  ├─ buildCuratedRelationshipContext → curated input bloğu
  ├─ provider.generateReading() → Gemini 2.5 Pro
  │    └─ logAiUsage fire-and-forget → ai_usage_logs
  ├─ finalizeDeepReport (sunucu doğruları)
  ├─ readings.insert (result_json + relationship_key + access_mode)
  ├─ recordCreditSpend
  └─ relationship_follow_ups.insert (due_at = now + 7d) → otomatik takip için
```

### Otomatik takip raporu akışı
```
pg_cron "process_relationship_follow_ups_hourly" (saatte bir)
  └─ HTTP POST /functions/v1/process-relationship-follow-ups
       │  Headers: Authorization Bearer ANON + apikey + x-cron-secret
       ├─ SELECT pending follow_ups WHERE due_at <= now
       ├─ For each:
       │    ├─ push_tokens.findFirst(user_id)
       │    ├─ Expo push → "Mirror AI · Bağının haftalık nabzı..."
       │    └─ UPDATE status='sent' + notification_events.insert
       └─ summary döndür

Cihazda push tap → addRelationshipFollowUpListener → router.push("/tabs/relationship")
  └─ Kullanıcı oradan "Haftalık raporu aç" tıklar → kredi/Plus ile yeni weekly
```

### Premium fiyatlandırma
- Plus: aylık + yıllık (RevenueCat, sandbox key prod'a çevrilecek)
- Krediler: 10 kredi paketi
- Reading fiyatları (kredi):
  - relationship deep: **4**
  - weekly_relationship: **4**
  - coffee: **3**
  - deep_birth_chart: **10**
  - deep_numerology: **4**
  - tarot_clarifier: **2**
- Plus aboneliği bunların hepsini sınırsız açar.

---

## 4. Hâlâ açık iş listesi (önceliklendirilmiş)

### A — Yayın için zorunlu (sen yapacaksın)
1. **Şirket bilgilerini doldur**: `docs/legal/*.md` ve `docs/store/listing.*.md`'deki `{{}}` placeholder'ları (şirket adı, vergi/MERSIS, iletişim e-postası, posta adresi). Bunu yapmadan Play Store başvurusu reddedilir.
2. **Gizlilik politikasını web'e yükle**: bir public URL'e (örn. `mirror-ai.app/privacy.html`). Play Store, mağaza listing'inde URL ister.
3. **RevenueCat prod key**: Mevcut `.env`'de `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=test_...`. Google Play app/provider bağlandıktan sonra Android production/public SDK key ile değiştir.
4. **Release build**: Play Console için APK değil AAB üret: `npm run build:android:aab`. Cihaza direkt kurulum için ayrıca `npm run build:android:apk`.
5. **Play Store iç test track**: `MirrorAI-release.aab` dosyasını internal testing'e yükle. Güncel rehber: `docs/ANDROID_PLAY_INTERNAL_TEST.md`.
6. **Ekran görüntüleri ve özellik grafiği**: store listing için 5-8 ekran görüntüsü (deep report, blueprint kartları, weekly rapor, paywall mock, bugün zamanlaması). Boyut: 1080×1920 + 1024×500 feature graphic.

### B — Ürün geliştirme (sıradakiler, sen istersen yeni oturum yapar)
1. **Image share-card** — `react-native-view-shot` ekle, paylaşılabilir görsel kart üret (skor şeridi + bond title + 1 cümle + branded watermark). Viralite için en yüksek beklenen leverage.
2. **Email/social sign-in** — şu an sadece anon. Kullanıcının başka cihazda da kendi raporlarına erişmesi için email magic link veya Google sign-in.
3. **Profil ekranı "Veri ve gizlilik"** — kullanıcı kendi `ai_usage_logs`'unu görsün, hesabı silsin, verisini indirsin.
4. **Onboarding'de Plus mock preview** — yeni kullanıcı ilk açılışta Plus'ın ne sunduğunu blur'lı kartlarla görsün, paywall öncesi etkileşim.
5. **Pro fallback teşhisi** — telemetri loglarındaki "model: lite" satırlarının nedenini araştır (Pro rate limit mi, başka mı). Logger zaten error_code yazıyor.
6. **Multiple relationships UI iyileştirme** — şu an aktif tek profil. "Saved relationship profiles" görselini güçlendir, geçişi hızlandır.

### C — Teknik borç + operasyonel
1. **APK boyutu**: Hermes + ProGuard + base resource'lar kontrol. `gradle.properties` heap zaten yüksek.
2. **coffee-readings bucket**: Storage'da hâlâ var ama artık yazılmıyor. `delete-user-data` referansı duruyor (eski kullanıcılarda kalan dosyalar için temizlik yapar). Yayın sonrası bir süre kalsın, sonra bucket'ı silebilirsin.
3. **Astrology service strict mode**: Release APK'da `EXPO_PUBLIC_ASTROLOGY_STRICT` env ile zaten zorunlu. HF Spaces cold start (~30s) ilk istekte yaşanır; bir kez warm olunca normalleşir. Production trafiği başlayınca neredeyse hep warm olur.
4. **Pro cost monitoring eşik alarmı**: `ai_usage_logs`'ta günlük maliyet $X'i aşarsa otomatik alarm — şu an manuel `usage-report.sh` koşturuyoruz. Supabase Webhooks + Slack hook ile kurulabilir.

---

## 5. Operasyonel kısa rehber (yeni oturum kullanır)

### Edge function deploy
```
cd /sessions/zen-bold-darwin/mnt/mirrorai
SUPABASE_ACCESS_TOKEN=sbp_xxx /tmp/supabase functions deploy <fn-name> --project-ref eysnrjkupfvwdbqzmiml
```
- supabase CLI sandbox'ta yoksa: `cd /tmp && curl -sL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz`
- Shared modüller değiştiyse onları kullanan **tüm** fonksiyonları redeploy et.

### Migration uygula (Supabase Management API)
```
PAT='sbp_xxx'
SQL='select 1;'
curl -X POST "https://api.supabase.com/v1/projects/eysnrjkupfvwdbqzmiml/database/query" \
  -H "Authorization: Bearer $PAT" -H "Content-Type: application/json" \
  -d "$(python3 -c "import json,sys; print(json.dumps({'query': sys.stdin.read()}))" <<<"$SQL")"
```

### Mobil typecheck + lint
```
cd apps\mobile
npx tsc --noEmit
npx eslint app src --ext .ts,.tsx
```

### Release APK build
```
cd apps\mobile\android
.\gradlew assembleRelease
```
Çıktı: `apps\mobile\android\app\build\outputs\apk\release\app-release.apk`

### Maliyet raporu
```
export SUPABASE_URL=https://eysnrjkupfvwdbqzmiml.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJ... (service role JWT)
bash scripts/usage-report.sh 7
```

### Cron-secret değiştirme
`CRON_SECRET` Supabase Function Secrets'ta. Değiştirirsen pg_cron job'undaki header'ı da güncellemen gerek (cron.job table'da).

---

## 6. Dosya tuzakları (yeni oturum bilsin)

- **Bash mount latency**: Edit tool yazımları bash mount'a geç düşebilir. Edit sonrası `tsc` patladıysa `wc -l` ile dosya boyutu kontrol et; truncated görüyorsan Python ile `pathlib.Path.write_text()` ile yamala (Edit tool'un yazdığı içeriği Read ile al, bash'ten heredoc/python ile yaz).
- **AskUserQuestion timeout**: bazı uzun konuşmalarda timeout oluyor. Cevap yoksa default ile devam et (recommended seçeneği zaten ilk sırada).
- **Personal Access Token**: deploy için `sbp_...` formatı şart. `sb_secret_...` (yeni API key formatı) deploy etmez. Token'ı revoke ettiysen Supabase Dashboard → Account → Tokens'tan yenisini al.

---

## 7. Açık duruma sahip kritik dosyalar (yayın öncesi son kontrol)

| Dosya | Durum |
|---|---|
| `docs/legal/privacy.tr.md` | İçerik tam, sadece `{{}}` doldur |
| `docs/legal/privacy.en.md` | İçerik tam, sadece `{{}}` doldur |
| `docs/legal/terms.tr.md` | İçerik tam, sadece `{{}}` doldur |
| `docs/legal/terms.en.md` | İçerik tam, sadece `{{}}` doldur |
| `docs/store/listing.tr.md` | İçerik tam, ekran görüntüsü üretilecek |
| `docs/store/listing.en.md` | İçerik tam, ekran görüntüsü üretilecek |
| `apps/mobile/.env` | `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` = test → prod'a değiştir |
| `apps/mobile/app.json` | Versiyon kodu / paket adı / icon kontrol |
| RevenueCat Dashboard | Sandbox → Production geçişi, ürün ID'leri |
| Play Console | İç test → kapalı test → açık test → prod |

---

## 8. "Kullanıcı para verir mi?" cevabı (özet)

Bu tur açıldığında derin rapor "fal gibi okunuyor" diye yüzeyel kalıyordu. Sonra eklenenler:
1. **Pro modeli** (Lite yerine) → metin kalitesi ciddi yükseldi.
2. **Premium quality directive** → jenerik zodiac yasak, evidence-temelli özgüllük zorunlu.
3. **3 katmanlı blueprint** → user_blueprint + partner_blueprint + interaction_choreography. Test çıktısı: "Anksiyöz-Kaçınmacı / İçe Kapanma" + "Onun: Kaçınmacı / Dürtüsel Tepki" + trigger zinciri "Sen X → O Y → Sen yine Z" + repair window. Bu artık "iki Yengeç uyumlu" raporu değil; gerçek psikolojik dans.
4. **Paywall mock preview** → satın almadan önce kullanıcı ne alacağını görüyor.
5. **1-hafta sonra otomatik takip raporu** → "tek seferlik" hissi kırılıyor, ilişkinin döngüsünü takip eden bir araç pozisyonu doğuyor.
6. **Tarihsel karşılaştırma** → her yeni deep raporda "Geçen rapora göre" kartı.

Gerçek satışın açılması için sırada: image share-card (viral) + email login (cihaz değiştirilince kayıp olmaması) + onboarding'de Plus mock preview.

---

## 9. Tek seferlik hatırlatmalar

- **Kahve fotoğrafı sunucuda hiç saklanmaz** — bu söz mobil + edge + gizlilik politikası üçünde de tutarlı. Yayın iddiası bu.
- **Anonymous user** → cihaz başına kalıcı kimlik. Cihaz değişirse kullanıcı veri kaybeder. Email login gelene kadar bunu UI'da uyar.
- **Cost guard** → Pro modeli pahalı; usage_logs'u haftalık izle. Beklenmeyen artış olursa `GEMINI_FORCE_MODEL=gemini-2.5-flash-lite` env ile acil olarak Lite'a düşürebilirsin (edge function tarafında).
- **CRON_SECRET** → değişirse pg_cron job'undaki x-cron-secret header da güncellenmeli.

---

Buradan sonra yeni Cowork oturumu: bu .md'yi referans olarak göster, sıra dahilinde **A grubundan başla** (yayın için zorunlu). Sonra B grubu ürün geliştirme. C grubu teknik borç.

Tebrik — store-ready'sin. Şirket bilgilerini doldur, ekran görüntülerini hazırla, gönder.
