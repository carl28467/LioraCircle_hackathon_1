-- Create schedules table
create table if not exists schedules (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  family_id uuid references families(id) not null,
  title text not null,
  time text not null, -- Storing as HH:MM format
  type text not null, -- 'routine', 'medication', 'appointment', 'exercise', etc.
  status text default 'pending', -- 'pending', 'completed'
  description text,
  assigned_to uuid references profiles(id), -- Optional: specific family member
  date date default CURRENT_DATE
);

-- Enable RLS
alter table schedules enable row level security;

-- Policies
create policy "Users can view their family schedules." on schedules
  for select using (
    family_id in (select family_id from profiles where id = auth.uid())
  );

create policy "Users can insert schedules for their family." on schedules
  for insert with check (
    family_id in (select family_id from profiles where id = auth.uid())
  );

create policy "Users can update their family schedules." on schedules
  for update using (
    family_id in (select family_id from profiles where id = auth.uid())
  );

create policy "Users can delete their family schedules." on schedules
  for delete using (
    family_id in (select family_id from profiles where id = auth.uid())
  );
