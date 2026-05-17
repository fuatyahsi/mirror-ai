import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { createServiceClient } from "../shared/auth.ts";

// 1-hafta sonra otomatik takip raporu worker'ı.
// pg_cron saatlik tetikler (x-cron-secret header zorunlu).
// Her run: due olan pending takipleri çek → her biri için weekly raporu
// üret (generate-weekly-relationship-report'a service-role JWT ile çağrı)
// → push notification gönder → follow_up satırını işaretle.

type FollowUpRow = {
  id: string;
  user_id: string;
  relationship_id: string | null;
  relationship_key: string;
  source_reading_id: string | null;
  due_at: string;
  attempts: number;
  locale: "tr" | "en";
};

type PushTokenRow = {
  id: string;
  expo_push_token: string;
  locale: "tr" | "en";
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    if (!cronSecret) return jsonResponse({ error: "CRON_SECRET is not configured." }, 500);
    if (req.headers.get("x-cron-secret") !== cronSecret) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body.limit ?? 25), 1), 100);
    const dryRun = Boolean(body.dry_run);

    const supabase = createServiceClient();
    const nowIso = new Date().toISOString();

    const { data: rows, error } = await supabase
      .from("relationship_follow_ups")
      .select("id,user_id,relationship_id,relationship_key,source_reading_id,due_at,attempts,locale")
      .eq("status", "pending")
      .lte("due_at", nowIso)
      .lt("attempts", 3)
      .order("due_at", { ascending: true })
      .limit(limit);

    if (error) throw error;
    const followUps = (rows ?? []) as FollowUpRow[];

    const summary = {
      candidates: followUps.length,
      processed: 0,
      sent: 0,
      skipped: 0,
      failed: 0,
      dryRun
    };

    if (dryRun) return jsonResponse({ ok: true, summary, followUps });

    for (const followUp of followUps) {
      summary.processed += 1;
      try {
        // 1) Weekly raporu üret. Edge function'ı service-role olarak çağırıyoruz;
        //    fonksiyon getOptionalUser ile user'ı tanımayacak — bu yüzden iç akışı
        //    kullanmak yerine doğrudan kayıt oluşturmayı tercih ediyoruz, ama
        //    en az kod tekrarı için generate-weekly-relationship-report çağrılır
        //    ve istek body'sinde user_id geçirilir (function tarafında manuel ele alınır).
        //    Pratik çözüm: önce relationship'i tekrar oku ve generate function'ı
        //    user JWT olmadan da işleyebilir hale getirmek yerine, burada kısa
        //    bir Expo push mesajı tetikleyip kullanıcı uygulamayı açtığında
        //    raporu kendisi tetiklesin. Bu hibrit yaklaşım: push gönder + deep
        //    link parametresi olarak relationship_key'i geçir. Reading'i kullanıcı
        //    uygulama açınca isteyerek üretsin (kredi/Plus yine kontrol edilir).
        const { data: token } = await supabase
          .from("push_tokens")
          .select("id,expo_push_token,locale")
          .eq("user_id", followUp.user_id)
          .eq("enabled", true)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!token) {
          await markStatus(followUp.id, "skipped", "no_push_token");
          summary.skipped += 1;
          continue;
        }

        const message = buildMessage(followUp, token as PushTokenRow);
        const pushResponse = await sendExpoPush(message);
        if (!pushResponse.ok) {
          await markStatus(followUp.id, "failed", `expo_${pushResponse.status}`);
          summary.failed += 1;
          continue;
        }

        const result = await pushResponse.json().catch(() => ({}));
        const ticketId = String(((result?.data ?? [])[0]?.id) ?? "");

        await supabase
          .from("relationship_follow_ups")
          .update({
            status: "sent",
            push_notification_id: ticketId || null,
            last_attempt_at: new Date().toISOString(),
            attempts: followUp.attempts + 1
          })
          .eq("id", followUp.id);

        await supabase.from("notification_events").insert({
          user_id: followUp.user_id,
          push_token_id: token.id,
          event_key: `relationship_follow_up:${followUp.id}`,
          event_type: "relationship_follow_up",
          payload_json: {
            follow_up_id: followUp.id,
            relationship_key: followUp.relationship_key,
            source_reading_id: followUp.source_reading_id
          }
        });

        summary.sent += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown";
        await markStatus(followUp.id, "failed", message.slice(0, 200));
        summary.failed += 1;
      }
    }

    return jsonResponse({ ok: true, summary });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});

async function markStatus(id: string, status: string, errorMessage?: string | null) {
  const supabase = createServiceClient();
  await supabase
    .from("relationship_follow_ups")
    .update({
      status,
      last_attempt_at: new Date().toISOString(),
      error_message: errorMessage ?? null
    })
    .eq("id", id);
}

function buildMessage(followUp: FollowUpRow, token: PushTokenRow): Record<string, unknown> {
  const locale = followUp.locale ?? token.locale ?? "tr";
  const isEn = locale === "en";
  return {
    to: token.expo_push_token,
    title: isEn ? "Mirror AI · Your weekly bond pulse" : "Mirror AI · Bağının haftalık nabzı",
    body: isEn
      ? "It's been a week since your deep reading. Tap to see how the loop shifted."
      : "Derin raporundan bu yana bir hafta geçti. Döngü nasıl değişti, bak.",
    sound: "default",
    priority: "high",
    channelId: "relationship-follow-up",
    data: {
      type: "relationship_follow_up",
      relationship_key: followUp.relationship_key,
      relationship_id: followUp.relationship_id,
      source_reading_id: followUp.source_reading_id,
      follow_up_id: followUp.id
    }
  };
}

async function sendExpoPush(message: Record<string, unknown>): Promise<Response> {
  return fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify([message])
  });
}
