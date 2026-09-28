-- One row per visited country, so each toggle is an insert/delete instead of
-- overwriting the whole list (fixes out-of-order saves and multi-device clobbering).
create table user_countries (
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null check (code ~ '^[A-Z]{2}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, code)
);

alter table user_countries enable row level security;

create policy "Users can read own countries"
  on user_countries for select
  using (auth.uid() = user_id);

create policy "Users can insert own countries"
  on user_countries for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own countries"
  on user_countries for delete
  using (auth.uid() = user_id);

insert into user_countries (user_id, code)
select user_id, jsonb_array_elements_text(countries)
from visited_countries
on conflict do nothing;

-- visited_countries is kept so the previous deploy keeps working during rollout.
-- Drop it in a follow-up migration once this version is live.
