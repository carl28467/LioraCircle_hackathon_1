-- Fix RLS for Pioneers to view their created family
DROP POLICY IF EXISTS "Users can view their own family." ON families;
CREATE POLICY "Users can view their own family." ON families
  FOR SELECT USING (
    id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
    OR
    pioneer_id = auth.uid()
  );

-- Function to check family code securely (bypassing RLS for this specific check)
CREATE OR REPLACE FUNCTION check_family_code(code text)
RETURNS TABLE (id uuid, name text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT f.id, f.name
  FROM families f
  WHERE f.invite_code = code;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_family_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_family_code(text) TO anon;
