-- Supabase schema for Smart eQuiz Platform
-- Run this in the Supabase SQL editor (https://app.supabase.com) to create the initial tables.

-- Users (basic profile stored server-side; auth handled by Supabase Auth)
CREATE TABLE IF NOT EXISTS users_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Questions bank
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES users_profiles(id) ON DELETE SET NULL,
  prompt text NOT NULL,
  choices jsonb, -- array of choice objects {id, text, correct}
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Tournaments (or quizzes)
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  owner_id uuid REFERENCES users_profiles(id) ON DELETE SET NULL,
  settings jsonb,
  created_at timestamptz DEFAULT now()
);

-- Tournament questions mapping
CREATE TABLE IF NOT EXISTS tournament_questions (
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  ordering integer DEFAULT 0,
  PRIMARY KEY (tournament_id, question_id)
);

-- Matches / live games
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE SET NULL,
  status text DEFAULT 'pending', -- pending | live | finished
  started_at timestamptz,
  finished_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Player answers
CREATE TABLE IF NOT EXISTS answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
  player_id uuid REFERENCES users_profiles(id) ON DELETE SET NULL,
  question_id uuid REFERENCES questions(id) ON DELETE SET NULL,
  answer jsonb,
  correct boolean,
  answered_at timestamptz DEFAULT now()
);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_questions_author ON questions(author_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_owner ON tournaments(owner_id);
CREATE INDEX IF NOT EXISTS idx_answers_match ON answers(match_id);
