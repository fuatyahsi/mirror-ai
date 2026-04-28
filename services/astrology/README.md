---
title: Mirror AI Astrology Service
emoji: 🔭
colorFrom: indigo
colorTo: yellow
sdk: docker
app_port: 7860
pinned: false
license: agpl-3.0
---

# Mirror AI Astrology Service

This service is the isolated Swiss Ephemeris calculation layer for Mirror AI.

It is intentionally kept outside the mobile app and outside Supabase Edge Functions because Swiss Ephemeris uses native Python/C code. The mobile app calls Supabase Edge Functions; Supabase then calls this service through HTTPS.

## License Note

Swiss Ephemeris and `pyswisseph` are available under AGPL-compatible terms, with a separate Swiss Ephemeris Professional License option from Astrodienst. For public or commercial release, choose the correct license path before shipping.

Do not commit downloaded ephemeris files. Put them under `services/astrology/ephe`, which is ignored by Git.

## Required Ephemeris Files

For the MVP natal chart range, place these files under `services/astrology/ephe` locally or `/app/ephe` in production:

```txt
sepl_18.se1
semo_18.se1
seas_18.se1
```

`/health` reports whether those files are present:

```json
{
  "ok": true,
  "service": "mirror-ai-astrology",
  "ephemeris": {
    "path": "/app/ephe",
    "required_files": {
      "sepl_18.se1": true,
      "semo_18.se1": true,
      "seas_18.se1": true
    },
    "ready": true,
    "moshier_fallback_enabled": false
  }
}
```

## Local Setup

```bash
cd services/astrology
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8010
```

Health check:

```bash
curl http://localhost:8010/health
```

Natal chart:

```bash
curl -X POST http://localhost:8010/natal-chart ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer your-local-token" ^
  -d "{\"birth_date\":\"1998-08-24\",\"birth_time\":\"14:30\",\"latitude\":41.0082,\"longitude\":28.9784,\"timezone\":\"Europe/Istanbul\"}"
```

## Environment

```txt
SWISS_EPHEMERIS_PATH=./ephe
MIRROR_ASTRO_FALLBACK_TO_MOSHIER=false
MIRROR_ASTROLOGY_SERVICE_TOKEN=
```

For a strict real-device test, keep `MIRROR_ASTRO_FALLBACK_TO_MOSHIER=false` and make sure `/health` returns `"ready": true`.

## Docker

```bash
cd services/astrology
docker build -t mirror-ai-astrology .
docker run --rm -p 8010:8010 ^
  -e MIRROR_ASTROLOGY_SERVICE_TOKEN=your-token ^
  -e SWISS_EPHEMERIS_PATH=/app/ephe ^
  -v "%cd%/ephe:/app/ephe:ro" ^
  mirror-ai-astrology
```

## Public HTTPS Deploy

Recommended flow for the first real test:

1. Deploy this folder as a Docker web service on Render, Railway, Fly.io, Cloud Run, or a VPS.
2. Mount or copy the ephemeris files into `/app/ephe`.
3. Set:

```txt
SWISS_EPHEMERIS_PATH=/app/ephe
MIRROR_ASTRO_FALLBACK_TO_MOSHIER=false
MIRROR_ASTROLOGY_SERVICE_TOKEN=<strong random token>
```

4. Confirm:

```bash
curl https://your-astrology-service.example.com/health
```

5. In Supabase Edge Function Secrets set:

```txt
ASTROLOGY_SERVICE_URL=https://your-astrology-service.example.com
ASTROLOGY_SERVICE_TOKEN=<same token>
```

6. Redeploy `calculate-natal-chart` if needed, then test from the mobile app.

The root `render.yaml` is included as a Render Blueprint starter. For strict Swiss mode on Render, you still need a way to provide `/app/ephe` files; do not commit them to the public repository unless your license decision allows that.
