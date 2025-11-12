-- 0002_rls.sql
-- Row-Level Security policies for Smart eQuiz Platform
-- Intended to be applied in Supabase (or environments where `auth.uid()` is available).
-- These policies assume Supabase Auth and the `auth.uid()` helper function.

-- Users profiles: only the profile owner may update their row; reads allowed to all
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_profiles_owner_update ON users_profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Questions: authors can insert/update/delete their questions; others can read
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY questions_author_mod ON questions
  FOR ALL USING (auth.uid() = author_id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = author_id OR auth.role() = 'service_role');

-- Tournaments: owner can manage; public can read
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tournaments_owner_manage ON tournaments
  FOR ALL USING (auth.uid() = owner_id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = owner_id OR auth.role() = 'service_role');

-- Matches/answers can have more granular policies later; these are examples only.
