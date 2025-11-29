-- EMERGENCY FIX FOR FAMILY VISIBILITY
-- Run this in your Supabase SQL Editor to allow users to see their family members.

-- 1. Allow all authenticated users to view all profiles (Simplest fix for demo)
-- Note: In a real production app, you would restrict this to only family members.
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
CREATE POLICY "Enable read access for all users"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- 2. Allow all authenticated users to view all families
DROP POLICY IF EXISTS "Enable read access for all users" ON families;
CREATE POLICY "Enable read access for all users"
ON families FOR SELECT
TO authenticated
USING (true);

-- 3. Ensure updates are allowed for own profile (for joining families)
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;
CREATE POLICY "Enable update for users based on email"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
