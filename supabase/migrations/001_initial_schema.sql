-- ChorusSync Database Schema
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Temples
CREATE TABLE IF NOT EXISTS temples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  settings JSONB DEFAULT '{}'
);

-- 2. Groups
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id UUID REFERENCES temples(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Memberships
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'follower' CHECK (role IN ('admin', 'leader', 'follower')),
  display_name TEXT NOT NULL DEFAULT 'Singer',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, group_id)
);

-- 4. Songs (stanzas stored as JSONB)
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id UUID REFERENCES temples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  original_language TEXT NOT NULL DEFAULT 'hi',
  category TEXT DEFAULT 'bhajan',
  deity TEXT DEFAULT 'universal',
  stanzas JSONB NOT NULL DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Active Sessions
CREATE TABLE IF NOT EXISTS active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE SET NULL,
  leader_id TEXT NOT NULL,
  current_stanza_index INT DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id)
);

-- 6. Session History
CREATE TABLE IF NOT EXISTS session_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  song_ids UUID[] DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security but allow all access via anon key for now
-- (proper RLS policies would use auth.uid() — we'll add that later)
ALTER TABLE temples ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_history ENABLE ROW LEVEL SECURITY;

-- Permissive policies (allow all for now — tighten later with auth)
CREATE POLICY "Allow all" ON temples FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON memberships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON songs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON active_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON session_history FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for active_sessions (for live sync)
ALTER PUBLICATION supabase_realtime ADD TABLE active_sessions;
