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
