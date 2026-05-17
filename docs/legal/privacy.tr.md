# Mirror AI Gizlilik Politikası

**Son güncelleme:** {{TARIH}}
**Sürüm:** 1.0
**Yürürlükteki yasalar:** KVKK (Türkiye), GDPR (Avrupa Birliği), Google Play Store geliştirici politikaları.

Bu politika Mirror AI mobil uygulamasının ("Uygulama") hangi kişisel verileri topladığını, neden işlediğini, kimlerle paylaştığını ve kullanıcı haklarını açıklar. Mirror AI sembolik içgörü ve yansıtma amaçlı bir araçtır; fal, tıbbi, hukuki veya finansal tavsiye değildir.

## 1. Veri sorumlusu ve iletişim

**Veri sorumlusu:** {{SIRKET_ADI_VE_VERGI_BILGISI}}
**E-posta:** {{ILETISIM_EPOSTASI}}
**Adres:** {{POSTAL_ADRES}}

Veri silme, erişim veya düzeltme talepleri için yukarıdaki e-postayı kullanabilirsin. Talepler 30 gün içinde cevaplanır.

## 2. Toplanan kişisel veriler

| Veri kategorisi | Örnekler | Toplama yolu | Yasal dayanak |
|---|---|---|---|
| Hesap kimliği | Anonim oturum kimliği (UUID), e-posta (sosyal hesap bağlanmışsa) | Otomatik (anonim) veya kullanıcı isteğiyle (email/social login) | Sözleşme yürütümü |
| Doğum verisi | Doğum tarihi, doğum saati, doğum şehri (enlem/boylam dahil) | Kullanıcı tarafından girilir | Açık rıza |
| Mistik profil çıkarımları | Profil testinden hesaplanan skorlar (belirsizlik toleransı, netlik ihtiyacı vb.) | Otomatik (test cevaplarından üretilir) | Sözleşme yürütümü |
| İlişki günlüğü | Kullanıcının elle yazdığı duygu/olay kayıtları, ilişki türü ve durumu | Kullanıcı girer | Açık rıza |
| Karşı kişi verisi | İlişki analizi için girilen takma ad, doğum tarihi/şehri | Kullanıcı girer | Açık rıza |
| Kahve fotoğrafı | Yalnızca kahve falı özelliği için cihazdan seçilen fincan/tabak görseli — **sunucumuzda saklanmaz**, tek seferde Gemini görüntü analizine iletilir | Kullanıcı isteğiyle | Açık rıza |
| AI yorumları | Üretilen rapor ve içgörüler (kullanıcının hesabına bağlıdır) | Otomatik (servis tarafından üretilir ve saklanır) | Sözleşme yürütümü |
| Cihaz/oturum verisi | İşletim sistemi sürümü, uygulama sürümü, anonim kullanım kayıtları (ai_usage_logs: model, token, gecikme) | Otomatik | Meşru menfaat (servis kalitesi + maliyet izleme) |
| Bildirim izni | Push token, bildirim tercihleri | Kullanıcı isteğiyle | Açık rıza |
| Ödeme bilgileri | Abonelik durumu, satın alma kimlikleri | Apple App Store / Google Play / RevenueCat üzerinden | Sözleşme yürütümü |

**Mirror AI ödeme/kart bilgilerini saklamaz.** Tüm satın alma işlemleri Apple veya Google'ın kendi mağaza altyapısı + RevenueCat aracılığıyla yürütülür.

## 3. Verileri ne için kullanırız

- **Kişiselleştirilmiş okuma üretmek:** Doğum verisi, mistik profil ve günlük kayıtların; Swiss Ephemeris ile astrolojik veriye, Gemini AI ile metin yorumuna çevrilir.
- **Tarihsel karşılaştırma:** Aynı ilişki için geçmiş raporlar karşılaştırılır, döngü gözlemlenir.
- **Hizmet kalitesini iyileştirmek:** AI model performansı, gecikme, hata oranlarını anonim biçimde izleriz.
- **Bildirim göndermek (kullanıcı izin verdiyse):** Günlük gökyüzü, ilişki zamanlaması vb.
- **Ödeme ve abonelik yönetimi:** RevenueCat üzerinden satın alma durumu doğrulanır.
- **Yasal yükümlülüklere uymak:** Talep ve dava durumlarında saklama.

Mirror AI verileri **reklam hedefleme, üçüncü taraf veri satışı veya profil zenginleştirme için kullanmaz.**

## 4. Üçüncü taraf işleyiciler

| İşleyici | Amaç | Veri bölgesi | Politikası |
|---|---|---|---|
| Supabase (Postgres + Auth + Edge Functions) | Hesap, veri saklama, AI proxy | AB / ABD | https://supabase.com/privacy |
| Google Gemini API | LLM yorum üretimi | Google sunucuları | https://policies.google.com/privacy |
| Hugging Face Spaces (FastAPI + Swiss Ephemeris) | Astroloji hesaplaması | AB / ABD | https://huggingface.co/privacy |
| RevenueCat | Abonelik ve kredi yönetimi | ABD | https://www.revenuecat.com/privacy |
| Apple App Store / Google Play | Ödeme ve dağıtım | Küresel | İlgili platformun politikası |
| Expo Notifications | Push bildirim | Apple/Google ile entegre | https://expo.dev/privacy |

LLM çağrılarında **kullanıcının tam ismi, e-posta adresi veya finansal verisi gönderilmez.** Gönderilenler: doğum verisi, mistik profil çıkarımları, ilişki günlüğü kayıtları ve sorduğun soru.

## 5. Saklama süreleri

- **Hesap verisi:** Hesap silinene kadar.
- **İlişki günlüğü ve raporlar:** Hesap silinene kadar (kullanıcı kendisi de tek tek silebilir).
- **Kahve fotoğrafı:** **Sunucumuzda hiç saklanmaz.** Sadece o anki yorum üretimi için tek seferde Gemini görüntü analizine iletilir, vision yanıtı döndükten sonra silinir. Üretilen yorum metni hesabınla birlikte saklanır.
- **AI kullanım kayıtları (ai_usage_logs):** 12 ay, sonra arşivlenir.
- **Hesap silme talebi sonrası:** 30 gün içinde tüm kişisel veri kalıcı olarak silinir veya geri döndürülemez biçimde anonimleştirilir.

## 6. Kullanıcı hakları (KVKK madde 11 + GDPR madde 15–22)

Her zaman talep edebilirsin:
- Hangi verinin işlendiğini öğrenme
- Yanlış veriyi düzeltme
- Verinin silinmesini isteme (right to be forgotten)
- İşlemenin kısıtlanmasını isteme
- Veriyi makine-okunabilir biçimde aktarma (veri taşınabilirliği)
- Açık rızayı geri alma
- Otomatik karar verme süreçlerine itiraz

**Hesap silme:** Uygulama içinde **Profil → Hesap → Hesabımı sil** üzerinden veya {{ILETISIM_EPOSTASI}} adresine yazarak. Talep 30 gün içinde sonuçlandırılır.

## 7. Çocuklar

Mirror AI **18 yaş altına yönelik değildir**. Çocuk olduğunu bildiğimiz hesaplar kapatılır. Vasi olarak çocuğunuzun kullanmış olduğunu fark ederseniz lütfen yukarıdaki e-postadan ulaşın.

## 8. Güvenlik

- Trafik TLS 1.2+ ile şifrelenir.
- Veritabanı satır düzeyinde güvenlik (RLS) ile korunur.
- AI servis çağrılarında token tabanlı yetkilendirme kullanılır.
- Personel veriye erişim, üretim gereksinimleri ile sınırlıdır.

Bir veri ihlali durumunda ilgili otoritelere 72 saat içinde, etkilenen kullanıcılara mümkün olan en kısa sürede haber verilir.

## 9. Politika değişiklikleri

Bu politika güncellenebilir. Önemli değişiklikler uygulama içi bildirim ve e-posta ile duyurulur. Yürürlüğe giriş tarihi her zaman bu sayfanın en üstündedir.

## 10. Yargı yetkisi ve uyuşmazlık

Bu politikayla ilgili uyuşmazlıklarda **Türkiye Cumhuriyeti yasaları** geçerlidir. AB'de yaşayan kullanıcılar için GDPR madde 77 gereği ulusal denetim kurumuna şikâyet hakkı saklıdır.

---

*Mirror AI ilişki ve içgörü uygulaması; üretilen yorumlar eğlence ve yansıtma içindir, kesin kanıt veya tıbbi/hukuki/finansal tavsiye yerine geçmez.*
