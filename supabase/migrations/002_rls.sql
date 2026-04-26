alter table public.users_profile enable row level security;
alter table public.user_personality_profile enable row level security;
alter table public.readings enable row level security;
alter table public.reading_feedback enable row level security;
alter table public.memory_events enable row level security;
alter table public.coffee_readings enable row level security;
alter table public.tarot_decks enable row level security;
alter table public.tarot_spreads enable row level security;
alter table public.relationships enable row level security;
alter table public.user_credits enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.subscriptions enable row level security;

create policy "users_profile_select_own" on public.users_profile
for select using (auth.uid() = user_id);
create policy "users_profile_insert_own" on public.users_profile
for insert with check (auth.uid() = user_id);
create policy "users_profile_update_own" on public.users_profile
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "personality_select_own" on public.user_personality_profile
for select using (auth.uid() = user_id);
create policy "personality_insert_own" on public.user_personality_profile
for insert with check (auth.uid() = user_id);
create policy "personality_update_own" on public.user_personality_profile
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "readings_select_own" on public.readings
for select using (auth.uid() = user_id);
create policy "readings_insert_own" on public.readings
for insert with check (auth.uid() = user_id);
create policy "readings_update_own" on public.readings
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "feedback_select_own" on public.reading_feedback
for select using (auth.uid() = user_id);
create policy "feedback_insert_own" on public.reading_feedback
for insert with check (auth.uid() = user_id);
create policy "feedback_update_own" on public.reading_feedback
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "memory_select_own" on public.memory_events
for select using (auth.uid() = user_id);
create policy "memory_insert_own" on public.memory_events
for insert with check (auth.uid() = user_id);

create policy "coffee_select_own" on public.coffee_readings
for select using (auth.uid() = user_id);
create policy "coffee_insert_own" on public.coffee_readings
for insert with check (auth.uid() = user_id);
create policy "coffee_update_own" on public.coffee_readings
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tarot_decks_public_read" on public.tarot_decks
for select using (true);

create policy "tarot_spreads_select_own" on public.tarot_spreads
for select using (auth.uid() = user_id);
create policy "tarot_spreads_insert_own" on public.tarot_spreads
for insert with check (auth.uid() = user_id);
create policy "tarot_spreads_update_own" on public.tarot_spreads
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "relationships_select_own" on public.relationships
for select using (auth.uid() = user_id);
create policy "relationships_insert_own" on public.relationships
for insert with check (auth.uid() = user_id);
create policy "relationships_update_own" on public.relationships
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "relationships_delete_own" on public.relationships
for delete using (auth.uid() = user_id);

create policy "credits_select_own" on public.user_credits
for select using (auth.uid() = user_id);
create policy "credits_insert_own" on public.user_credits
for insert with check (auth.uid() = user_id);
create policy "credits_update_own" on public.user_credits
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "credit_transactions_select_own" on public.credit_transactions
for select using (auth.uid() = user_id);

create policy "subscriptions_select_own" on public.subscriptions
for select using (auth.uid() = user_id);
create policy "subscriptions_insert_own" on public.subscriptions
for insert with check (auth.uid() = user_id);
create policy "subscriptions_update_own" on public.subscriptions
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "coffee_storage_select_own" on storage.objects
for select using (
  bucket_id = 'coffee-readings'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "coffee_storage_insert_own" on storage.objects
for insert with check (
  bucket_id = 'coffee-readings'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "coffee_storage_update_own" on storage.objects
for update using (
  bucket_id = 'coffee-readings'
  and auth.uid()::text = (storage.foldername(name))[1]
) with check (
  bucket_id = 'coffee-readings'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "coffee_storage_delete_own" on storage.objects
for delete using (
  bucket_id = 'coffee-readings'
  and auth.uid()::text = (storage.foldername(name))[1]
);

