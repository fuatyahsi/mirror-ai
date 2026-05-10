alter table public.credit_transactions
add column if not exists provider text,
add column if not exists provider_transaction_id text;

create unique index if not exists credit_transactions_provider_tx_unique
on public.credit_transactions(provider, provider_transaction_id)
where provider_transaction_id is not null;
