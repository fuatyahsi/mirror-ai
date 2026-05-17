#!/usr/bin/env bash
# Mirror AI — AI usage + maliyet özeti.
#
# Kullanım:
#   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... scripts/usage-report.sh [days]

set -euo pipefail

DAYS="${1:-7}"
: "${SUPABASE_URL:?SUPABASE_URL env eksik}"
: "${SUPABASE_SERVICE_ROLE_KEY:?SUPABASE_SERVICE_ROLE_KEY env eksik}"

SINCE=$(python3 -c "import datetime; print((datetime.datetime.utcnow() - datetime.timedelta(days=$DAYS)).strftime('%Y-%m-%dT%H:%M:%SZ'))")
echo "Mirror AI usage report — last $DAYS day(s) since $SINCE"
echo

PAYLOAD=$(curl -sG "${SUPABASE_URL%/}/rest/v1/ai_usage_logs" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  --data-urlencode "select=reading_type,access_mode,model,prompt_tokens,completion_tokens,total_tokens,est_cost_usd,preflight_est_cost_usd,latency_ms,success,is_premium_model,billing_tier,blocked_reason,created_at" \
  --data-urlencode "created_at=gte.$SINCE" \
  --data-urlencode "order=created_at.desc")

python3 - "$PAYLOAD" <<'PY'
import json, sys
raw = sys.argv[1].strip() if len(sys.argv) > 1 else ""
if not raw or raw[0] not in "[{":
    print("Geçersiz cevap:", raw[:200]); sys.exit(1)
rows = json.loads(raw)
if not rows:
    print("Hiç çağrı yok."); sys.exit()

total_cost = sum(float(r.get("est_cost_usd") or 0) for r in rows)
blocked_preflight = sum(float(r.get("preflight_est_cost_usd") or 0) for r in rows if r.get("blocked_reason"))
total_tokens = sum(int(r.get("total_tokens") or 0) for r in rows)
success_count = sum(1 for r in rows if r.get("success"))
blocked_count = sum(1 for r in rows if r.get("blocked_reason"))
premium_model_count = sum(1 for r in rows if r.get("is_premium_model") and r.get("success"))
avg_latency = sum(int(r.get("latency_ms") or 0) for r in rows) / len(rows)

print(f"Toplam çağrı     : {len(rows)} ({success_count} başarılı / {len(rows)-success_count} hatalı)")
print(f"Bloklanan çağrı  : {blocked_count} (${blocked_preflight:.4f} tahmini engellendi)")
print(f"Premium model    : {premium_model_count}")
print(f"Toplam token     : {total_tokens:,}")
print(f"Toplam maliyet   : ${total_cost:.4f}")
print(f"Ortalama gecikme : {avg_latency:.0f} ms")
print()

by = {}
for r in rows:
    key = (r.get("reading_type") or "?", r.get("access_mode") or "-", r.get("model") or "?")
    b = by.setdefault(key, {"n":0,"t":0,"c":0.0,"l":0})
    b["n"] += 1; b["t"] += int(r.get("total_tokens") or 0)
    b["c"] += float(r.get("est_cost_usd") or 0); b["l"] += int(r.get("latency_ms") or 0)

print(f"{'reading_type':22} {'mode':8} {'model':24} {'#':>4} {'tokens':>10} {'$':>8} {'avg_ms':>7}")
for (rt, am, model), b in sorted(by.items(), key=lambda kv: -kv[1]['c']):
    print(f"{rt[:22]:22} {am:8} {model[:24]:24} {b['n']:>4} {b['t']:>10,} ${b['c']:>7.4f} {b['l']/b['n']:>7.0f}")
PY
