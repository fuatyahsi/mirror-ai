# Mirror AI

Mirror AI is a personal-memory spiritual insight assistant for symbolic readings, tarot, coffee readings, relationship reflection, synastry-aware relationship guidance, and profile-aware daily sky updates.

The current build is wired to Supabase Edge Functions, Gemini, RevenueCat, and the external Swiss Ephemeris astrology service. Local mock fallbacks are restricted to development builds through `EXPO_PUBLIC_ALLOW_MOCKS=true`.

## Stack

- Expo + React Native + TypeScript
- Expo Router
- Supabase Auth, Postgres, Storage, Edge Functions, RLS
- Zustand
- TanStack Query
- React Hook Form + Zod
- Gemini-backed AI provider abstraction with development-only mock fallback
- Isolated Swiss Ephemeris astrology microservice for natal chart calculations
- RevenueCat subscriptions and credit-pack purchase validation

## Getting Started

```bash
cd apps/mobile
npm install
npm run dev
```

Copy the example environment file:

```bash
cp .env.example .env
```

Set these values after creating a Supabase project:

```txt
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_ASTROLOGY_SERVICE_URL=http://localhost:8010
EXPO_PUBLIC_REVENUECAT_API_KEY=
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=mirror_plus
EXPO_PUBLIC_ALLOW_MOCKS=true
```

## Astrology Service

Swiss Ephemeris is integrated as a separate Python API service under `services/astrology`.

```bash
cd services/astrology
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8010
```

The mobile app can call this service directly in local web development through `EXPO_PUBLIC_ASTROLOGY_SERVICE_URL`. In backend mode, Supabase Edge Function `calculate-natal-chart` calls the same service through `ASTROLOGY_SERVICE_URL`.

Swiss Ephemeris is dual licensed under AGPL or the paid Swiss Ephemeris Professional License. Local testing can use the AGPL path. Public or commercial release needs a deliberate license decision.

## Supabase Setup

1. Create a Supabase project.
2. Run the SQL files in `supabase/migrations` in order.
3. Create a private/public policy-aware Storage bucket named `coffee-readings`.
4. Deploy Edge Functions from `supabase/functions`.
5. Add function secrets:

```bash
supabase secrets set AI_PROVIDER=gemini
supabase secrets set GEMINI_API_KEY=...
supabase secrets set GEMINI_MODEL=gemini-2.5-flash-lite
supabase secrets set ASTROLOGY_SERVICE_URL=https://your-astrology-service.example.com
supabase secrets set ASTROLOGY_SERVICE_TOKEN=...
supabase secrets set REVENUECAT_SECRET_KEY=...
supabase secrets set REVENUECAT_ENTITLEMENT_ID=mirror_plus
supabase secrets set REVENUECAT_CREDIT_SMALL_PRODUCT_ID=mirror_credits_10
supabase secrets set REVENUECAT_CREDIT_SMALL_AMOUNT=10
```

Gemini is wired through the Supabase Edge Function provider layer, not the mobile app. The default model is `gemini-2.5-flash-lite` because it has a practical Free Tier quota for prototyping.

The mobile app now calls these Edge Functions for readings:

```txt
generate-daily-insight
generate-daily-sky
generate-tarot-reading
generate-coffee-reading
generate-relationship-reading
generate-weekly-relationship-report
generate-numerology-reading
submit-feedback
calculate-natal-chart
register-push-token
sync-revenuecat-entitlement
send-daily-sky-notifications
delete-user-data
```

Production builds require Supabase and remote services. If Edge Functions or secrets are missing, the app fails loudly instead of silently serving mock readings.

## Product Safety

Mirror AI must not present deterministic fortune-telling, medical/legal/financial advice, manipulation, fear-based claims, or relationship certainty. Readings are symbolic, reflective, and autonomy-preserving.

## Repository Layout

```txt
apps/mobile      Expo app
supabase         SQL migrations and Edge Functions
docs             Product, API, schema, prompt, roadmap notes
```
