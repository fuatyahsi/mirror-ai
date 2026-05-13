alter table public.readings
  drop constraint if exists readings_reading_type_check;

alter table public.readings
  add constraint readings_reading_type_check
  check (
    reading_type in (
      'daily',
      'coffee',
      'tarot',
      'numerology',
      'relationship',
      'weekly_relationship',
      'birth_chart'
    )
  );
