# Database Schema

The canonical schema is in `supabase/migrations/001_init.sql`.

Main tables:

- `users_profile`
- `user_personality_profile`
- `readings`
- `reading_feedback`
- `memory_events`
- `coffee_readings`
- `tarot_decks`
- `tarot_spreads`
- `relationships`
- `user_credits`
- `credit_transactions`
- `subscriptions`

All user-owned tables are isolated with RLS through `auth.uid() = user_id`.

