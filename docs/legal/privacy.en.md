# Mirror AI Privacy Policy

**Last updated:** {{DATE}}
**Version:** 1.0
**Applicable laws:** Türkiye's KVKK, EU GDPR, Google Play Store developer policies.

This policy explains what personal data the Mirror AI mobile application ("App") collects, why we process it, who we share it with, and what rights you have. Mirror AI is a symbolic insight and reflection tool; it is not fortune telling, nor medical, legal, or financial advice.

## 1. Data controller and contact

**Data controller:** {{COMPANY_NAME_AND_REGISTRATION}}
**Email:** {{CONTACT_EMAIL}}
**Address:** {{POSTAL_ADDRESS}}

For deletion, access, or correction requests use the email above. Requests are answered within 30 days.

## 2. Personal data we collect

| Category | Examples | How collected | Legal basis |
|---|---|---|---|
| Account identity | Anonymous session ID (UUID), email (only if you link a social/email account) | Automatic (anon) or by your action | Contract performance |
| Birth data | Birth date, birth time, birth city (incl. latitude/longitude) | You enter it | Explicit consent |
| Mystic profile signals | Scores computed from the profile test (uncertainty tolerance, need for clarity, etc.) | Automatic (from your answers) | Contract performance |
| Relationship journal | Free-text mood/event entries you write, relationship type and status | You enter | Explicit consent |
| Partner data | Nickname, birth date/city you enter for synastry | You enter | Explicit consent |
| Coffee photo | The cup/saucer image selected from your device for the coffee reading feature — **never stored on our servers**, sent once to the AI vision service for the reading and discarded | You select | Explicit consent |
| AI readings | Generated reports and insights tied to your account | Automatic (service-generated and stored) | Contract performance |
| Device/session data | OS version, app version, anonymous usage logs (ai_usage_logs: model, tokens, latency) | Automatic | Legitimate interest (service quality + cost monitoring) |
| Notification permission | Push token, notification preferences | By your action | Explicit consent |
| Payment data | Subscription state, purchase identifiers | Via Apple App Store / Google Play / RevenueCat | Contract performance |

**Mirror AI does not store payment or card details.** All purchases are processed through Apple's or Google's own store infrastructure + RevenueCat.

## 3. How we use the data

- **Personalised readings:** birth data, mystic profile and journal entries are combined into astrological data (via Swiss Ephemeris) and AI-generated interpretation.
- **Historical comparison:** for the same relationship, prior readings are compared to surface the loop.
- **Service quality improvement:** we anonymously track AI performance, latency, and error rates.
- **Notifications (if you allow):** daily sky, relationship timing, etc.
- **Payment and subscription management:** via RevenueCat.
- **Legal obligations:** retention where required by law.

Mirror AI **does not use your data for advertising targeting, third-party data sale, or profile enrichment.**

## 4. Third-party processors

| Processor | Purpose | Region | Policy |
|---|---|---|---|
| Supabase (Postgres + Auth + Edge Functions) | Account, storage, AI proxy | EU / US | https://supabase.com/privacy |
| Google Gemini API | LLM interpretation | Google servers | https://policies.google.com/privacy |
| Hugging Face Spaces (FastAPI + Swiss Ephemeris) | Astrology computation | EU / US | https://huggingface.co/privacy |
| RevenueCat | Subscription and credit management | US | https://www.revenuecat.com/privacy |
| Apple App Store / Google Play | Payments and distribution | Global | Respective platform policies |
| Expo Notifications | Push notifications | Integrated with Apple/Google | https://expo.dev/privacy |

LLM calls **never include your full name, email, or financial data.** What is sent: birth data, mystic profile signals, journal entries, and the question you asked.

## 5. Retention periods

- **Account data:** until you delete the account.
- **Journal entries and reports:** until account deletion (you can also delete individual items).
- **Coffee photo:** **never stored on our servers.** It is sent once to the AI vision service for the reading and discarded immediately after the vision response returns. The interpretation text is kept with your account.
- **AI usage logs:** 12 months, then archived.
- **After deletion request:** all personal data is permanently deleted or irreversibly anonymised within 30 days.

## 6. Your rights (KVKK art. 11 + GDPR art. 15–22)

You can at any time request:
- to know what data we process
- to correct inaccurate data
- to have your data deleted (right to be forgotten)
- to restrict processing
- to receive your data in machine-readable form (portability)
- to withdraw explicit consent
- to object to automated decision-making

**Delete your account:** in-app at **Profile → Account → Delete my account**, or by emailing {{CONTACT_EMAIL}}. Requests are processed within 30 days.

## 7. Children

Mirror AI is **not directed to anyone under 18**. We close accounts we identify as belonging to a minor. If you are a guardian and discover your child has used the App, please contact us at the email above.

## 8. Security

- Traffic is encrypted with TLS 1.2+.
- The database is protected by row-level security (RLS).
- AI service calls use token-based authorisation.
- Staff access to data is strictly limited to production needs.

In the event of a data breach we notify the relevant authority within 72 hours and affected users as soon as reasonably possible.

## 9. Changes to this policy

This policy may be updated. Material changes are announced via in-app notice and email. The effective date is always at the top of this page.

## 10. Jurisdiction and disputes

Disputes related to this policy are governed by **the laws of the Republic of Türkiye**. EU residents retain the right to lodge a complaint with their national supervisory authority pursuant to GDPR art. 77.

---

*Mirror AI is a relationship and insight tool. The interpretations it produces are intended for entertainment and self-reflection — they are not a substitute for definite proof, nor for medical, legal, or financial advice.*
