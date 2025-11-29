-- Create a table for inventory items
create table if not exists inventory_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  family_id uuid references families(id), -- Optional, if we want to link to family directly
  name text not null,
  category text not null, -- 'fridge', 'pantry', 'freezer'
  quantity text,
  expiry_date text, -- Storing as text for flexibility, or date
  status text default 'good' -- 'good', 'expiring', 'expired'
);

-- Enable RLS
alter table inventory_items enable row level security;

-- Policies
create policy "Users can view their family's inventory." on inventory_items
  for select using (
    family_id in (select family_id from profiles where id = auth.uid())
    or user_id = auth.uid() -- Fallback if family_id is null
  );

create policy "Users can insert into their family's inventory." on inventory_items
  for insert with check (
    family_id in (select family_id from profiles where id = auth.uid())
    or user_id = auth.uid()
  );

create policy "Users can update their family's inventory." on inventory_items
  for update using (
    family_id in (select family_id from profiles where id = auth.uid())
    or user_id = auth.uid()
  );

create policy "Users can delete from their family's inventory." on inventory_items
  for delete using (
    family_id in (select family_id from profiles where id = auth.uid())
    or user_id = auth.uid()
  );
