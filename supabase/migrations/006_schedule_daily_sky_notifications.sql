create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

do $$
begin
  perform cron.unschedule('invoke-daily-sky-notifications-hourly');
exception
  when others then null;
end;
$$;

select cron.schedule(
  'invoke-daily-sky-notifications-hourly',
  '5 * * * *',
  $$
  select
    net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'mirror_project_url')
        || '/functions/v1/send-daily-sky-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'mirror_anon_key'),
        'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'mirror_anon_key'),
        'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'mirror_cron_secret')
      ),
      body := jsonb_build_object('now', now()),
      timeout_milliseconds := 10000
    ) as request_id;
  $$
);
