-- Create a table for public profiles
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  
  -- Flexible JSON storage for all user attributes (Age, Height, Weight, Conditions, etc.)
  profile_data jsonb default '{}'::jsonb,
  
  onboarding_completed boolean default false,
  family_id uuid
);

-- Create a table for families
create table if not exists families (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  invite_code text unique not null,
  pioneer_id uuid references auth.users not null
);

-- Create a table for chat messages
create table if not exists chat_messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  sender text not null, -- 'user' or 'liora'
  content text,
  attachments jsonb default '[]'::jsonb
);

-- Add foreign key constraint to profiles (if not already added inline)
alter table profiles 
add constraint fk_family 
foreign key (family_id) 
references families (id);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table families enable row level security;
alter table chat_messages enable row level security;

-- Policies for profiles
create policy "Users can view their own profile." on profiles
  for select using (auth.uid() = id);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on profiles
  for update using (auth.uid() = id);

-- Policies for families
create policy "Users can view their own family." on families
  for select using (
    id in (select family_id from profiles where id = auth.uid())
  );

create policy "Pioneers can insert families." on families
  for insert with check (auth.uid() = pioneer_id);

-- Policies for chat_messages
create policy "Users can view their own messages." on chat_messages
  for select using (auth.uid() = user_id);

create policy "Users can insert their own messages." on chat_messages
  for insert with check (auth.uid() = user_id);

-- Optional: Trigger to automatically update updated_at
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on profiles
  for each row execute procedure moddatetime (updated_at);
