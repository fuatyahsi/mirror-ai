# Mirror AI Release Test Plan

Run this checklist before every Play internal test, closed test or production build.

## 0. Preflight

```powershell
npm run typecheck
npm run lint
npm run check:store
npm run verify:release
npx.cmd supabase functions list
npx.cmd supabase secrets list
```

Expected:

- Typecheck and lint pass.
- Store metadata length checks pass.
- `verify:release` passes only after the production RevenueCat Android SDK key and product ids are in `apps/mobile/.env`.
- Supabase functions include all reading and payment sync functions.
- Secrets include Gemini, RevenueCat, astrology service and AI budget guard values.

## 1. Fresh Install / Onboarding

Test:

- Install from clean device.
- Start anonymous session.
- Enter birth date through picker, not manual typing.
- Search/select birth city.
- Complete profile quiz.
- Confirm profile result screen shows:
  - Mystic profile
  - Birth chart summary
  - Back/edit route

Pass:

- No mock fallback message.
- No date format error.
- No duplicate React key warning.
- Birth city coordinates match selected city.

## 2. Relationship Intelligence

Test:

- Add relationship person.
- Enter relationship type/status.
- Enter optional birth time unknown.
- Add journal entry.
- Run quick relationship analysis.
- Run deep synastry report.
- Run "Should I message today?"
- Run weekly relationship report.

Pass:

- Unknown birth time disclaimer appears when relevant.
- Output connects own chart + their chart + synastry + journal/context.
- Message coach gives action, tone, do-not-do and sample message.
- Weekly report references repeated themes from journal/reading history.
- Credit or Plus gate appears for paid surfaces.

## 3. Astrology / Natal

Test:

- Open birth chart tabs.
- View natal summary, placements and horoscope/natal interpretation.
- Open deep birth chart paywall.

Pass:

- Technical references stay in reference cards.
- Main explanation is personal and plain-language.
- No "Gemini" branding appears in user-facing copy.
- Deep report clearly explains what Plus/credits unlock.

## 4. Tarot

Test:

- Choose each spread type.
- Select cards from the deck animation.
- Add topic and question.
- Add clarifier question where available.

Pass:

- Cards reflect selected spread.
- Interpretation stays tied to topic/question.
- Clarifier requires Plus or credits.
- References are localized.

## 5. Coffee

Test:

- Pick cup image.
- Run detailed coffee reading.

Pass:

- Photo note says images are not stored.
- Edge response persists reading but stores `not_stored` for image URLs.
- Billing requires Plus or 3 credits.
- No Supabase Storage upload occurs for new coffee photos.

## 6. Numerology

Test:

- Run basic numerology.
- Open deep numerology paywall.
- Run deep numerology if credits/Plus available.

Pass:

- Basic result is free.
- Deep result uses Plus or 4 credits.
- Output references birth/profile context without overclaiming certainty.

## 7. Payment / RevenueCat

Test from Play-installed internal test build:

- Open paywall.
- Confirm monthly/yearly prices load.
- Confirm credit pack price loads.
- Buy test subscription.
- Restore purchase.
- Buy 10-credit pack.
- Run a credit-paid feature.

Pass:

- No "Wrong API Key" RevenueCat dialog.
- `sync-revenuecat-entitlement` updates `subscriptions`.
- Credit purchase increments `user_credits` by 10.
- Paid feature deducts correct credits when Plus is not active.
- Plus user does not spend credits for included features.

## 8. AI Budget Guard

Test:

- Open Profile and check AI usage card.
- Run several readings.
- Run `scripts/usage-report.sh` with service role locally.
- Temporarily lower one AI limit in Supabase Secrets on a staging project and confirm 429 block behavior.

Pass:

- `ai_usage_logs` records model, estimated cost, premium model usage and blocked reason.
- Profile usage card updates after readings.
- Guard blocks before Gemini call when budget is exceeded.

## 9. Data Deletion

Test:

- Create readings, relationship, feedback and push token.
- Use Profile -> delete data.

Pass:

- Profile/readings/memory/relationship rows are removed.
- Coffee storage cleanup runs safely even if bucket is empty.
- User can continue with a clean profile or sign out.

## 10. Store Review Sanity

Pass only if:

- Store text does not promise certainty.
- Screenshots match actual app screens.
- Privacy policy URL is public.
- Data Safety answers match real data handling.
- RevenueCat production key is used.
- AAB is signed with upload key.
