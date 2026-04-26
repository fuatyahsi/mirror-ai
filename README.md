# Mirror AI

Mirror AI is a personal-memory spiritual insight assistant for symbolic readings, tarot, coffee readings, relationship reflection, and profile-aware daily guidance.

The first build is intentionally mock-first: the mobile app, Supabase schema, Edge Function interfaces, feedback loop, and memory model are prepared before real AI provider calls are enabled.

## Stack

- Expo + React Native + TypeScript
- Expo Router
- Supabase Auth, Postgres, Storage, Edge Functions, RLS
- Zustand
- TanStack Query
- React Hook Form + Zod
- Mock AI provider abstraction, ready for OpenAI/Gemini/Claude later

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
```

## Supabase Setup

1. Create a Supabase project.
2. Run the SQL files in `supabase/migrations` in order.
3. Create a private/public policy-aware Storage bucket named `coffee-readings`.
4. Deploy Edge Functions from `supabase/functions`.
5. Add function secrets when real providers are enabled:

```bash
supabase secrets set AI_PROVIDER=mock
supabase secrets set OPENAI_API_KEY=...
```

## Product Safety

Mirror AI must not present deterministic fortune-telling, medical/legal/financial advice, manipulation, fear-based claims, or relationship certainty. Readings are symbolic, reflective, and autonomy-preserving.

## Repository Layout

```txt
apps/mobile      Expo app
supabase         SQL migrations and Edge Functions
docs             Product, API, schema, prompt, roadmap notes
```

