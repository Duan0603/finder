-- Drop the overly permissive INSERT policy on matches
DROP POLICY IF EXISTS "System can insert matches" ON matches;

-- Create a restrictive policy: only allow inserts where the authenticated user is one of the match parties
-- This still allows the SECURITY DEFINER trigger function to insert matches
CREATE POLICY "System can insert matches" ON matches
  FOR INSERT
  WITH CHECK (auth.uid() = user1 OR auth.uid() = user2);