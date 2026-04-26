# Mirror AI Astrology Service

This service is the isolated Swiss Ephemeris calculation layer for Mirror AI.

It is intentionally kept outside the mobile app and outside Supabase Edge Functions because Swiss Ephemeris uses native code. The mobile app or Supabase Edge Function calls this service through HTTP.

## License Note

Swiss Ephemeris is available under AGPL or a paid Swiss Ephemeris Professional License. For local testing, this service can use the AGPL path. Before a public/commercial release, choose the correct license path.

Do not commit downloaded ephemeris files. Put them under `services/astrology/ephe`, which is ignored by Git.

## Setup

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
  -d "{\"birth_date\":\"1998-08-24\",\"birth_time\":\"14:30\",\"latitude\":41.0082,\"longitude\":28.9784,\"timezone\":\"Europe/Istanbul\"}"
```

## Environment

```txt
SWISS_EPHEMERIS_PATH=./ephe
MIRROR_ASTRO_FALLBACK_TO_MOSHIER=true
MIRROR_ASTROLOGY_SERVICE_TOKEN=
```

If no Swiss ephemeris data files are present, the service can fall back to Moshier calculations for development. Production should use the proper Swiss Ephemeris data files and license.

