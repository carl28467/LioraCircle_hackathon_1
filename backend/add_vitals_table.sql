-- Create vitals table
create table if not exists vitals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  type text not null, -- 'heart_rate', 'spo2', 'steps', 'sleep', 'calories', etc.
  value numeric not null,
  unit text not null,
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  source text default 'manual' -- 'manual', 'device', 'simulation'
);

-- Enable RLS
alter table vitals enable row level security;

-- Policies
create policy "Users can view their own vitals." on vitals
  for select using (auth.uid() = user_id);

create policy "Users can insert their own vitals." on vitals
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own vitals." on vitals
  for update using (auth.uid() = user_id);

create policy "Users can delete their own vitals." on vitals
  for delete using (auth.uid() = user_id);
