alter table public.user_personality_profile
add column if not exists relationship_pattern text,
add column if not exists preferred_reading_style text;
