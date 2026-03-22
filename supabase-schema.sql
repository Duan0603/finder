-- ============================================
-- Finer (Campus Connect) - Supabase Schema
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  age INT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  gender_preference TEXT CHECK (gender_preference IN ('male', 'female', 'other', 'all')),
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  photos TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  occupation TEXT DEFAULT '',
  university TEXT DEFAULT '',
  city TEXT DEFAULT '',
  lat FLOAT,
  lng FLOAT,
  is_verified BOOLEAN DEFAULT false,
  is_online BOOLEAN DEFAULT false,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Likes
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_super_like BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_user, to_user)
);

-- Matches (created when both users like each other)
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1, user2)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  seen BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone auth'd can read, only owner can update
CREATE POLICY "Profiles readable by authenticated users" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Likes
CREATE POLICY "Users can insert likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = from_user);
CREATE POLICY "Users can read own likes" ON likes
  FOR SELECT USING (auth.uid() = from_user OR auth.uid() = to_user);

-- Matches
CREATE POLICY "Users can read own matches" ON matches
  FOR SELECT USING (auth.uid() = user1 OR auth.uid() = user2);
CREATE POLICY "System can insert matches" ON matches
  FOR INSERT WITH CHECK (true);

-- Messages
CREATE POLICY "Match users can read messages" ON messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM matches WHERE id = match_id AND (user1 = auth.uid() OR user2 = auth.uid()))
  );
CREATE POLICY "Match users can send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM matches WHERE id = match_id AND (user1 = auth.uid() OR user2 = auth.uid()))
  );
CREATE POLICY "Users can delete own messages" ON messages
  FOR DELETE USING (auth.uid() = sender_id);
CREATE POLICY "Match users can update messages" ON messages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM matches WHERE id = match_id AND (user1 = auth.uid() OR user2 = auth.uid()))
  );

-- ============================================
-- Match detection trigger
-- When A likes B and B already liked A -> auto-create match
-- ============================================

CREATE OR REPLACE FUNCTION check_and_create_match()
RETURNS TRIGGER AS $$
DECLARE
  reverse_exists BOOLEAN;
  u1 UUID;
  u2 UUID;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM likes WHERE from_user = NEW.to_user AND to_user = NEW.from_user
  ) INTO reverse_exists;

  IF reverse_exists THEN
    u1 := LEAST(NEW.from_user, NEW.to_user);
    u2 := GREATEST(NEW.from_user, NEW.to_user);
    INSERT INTO matches (user1, user2) VALUES (u1, u2) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_check_match ON likes;
CREATE TRIGGER on_like_check_match
  AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION check_and_create_match();

-- ============================================
-- Enable realtime for messages
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE likes;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- ============================================
-- Storage bucket for avatars
-- CREATE MANUALLY in Supabase Dashboard:
-- 1. Go to Storage (left sidebar)
-- 2. Click "New bucket"
-- 3. Name: avatars, Public: ON
-- 4. Then go to bucket Policies and add:
--    - INSERT: allow authenticated users
--    - SELECT: allow all (public)
-- ============================================
