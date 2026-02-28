-- ChorusSync Initial Schema
-- Run in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Temples (top-level organizations)
CREATE TABLE temples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  settings JSONB DEFAULT '{}'
);

-- Groups within a temple
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id UUID REFERENCES temples(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Memberships
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'leader', 'follower')),
  display_name TEXT,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, group_id)
);

-- Song Library
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id UUID REFERENCES temples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  original_language TEXT NOT NULL DEFAULT 'hi',
  category TEXT CHECK (category IN ('aarti', 'bhajan', 'kirtan', 'stuti', 'chalisa', 'mantra', 'other')),
  deity TEXT,
  stanzas JSONB NOT NULL DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Live Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  leader_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  current_song_id UUID REFERENCES songs(id),
  current_stanza_index INT DEFAULT 0,
  setlist UUID[] DEFAULT '{}',
  setlist_position INT DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- Session History
CREATE TABLE session_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  group_id UUID REFERENCES groups(id),
  songs_sung UUID[] DEFAULT '{}',
  participant_count INT,
  duration_minutes INT,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- User Preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  preferred_script TEXT DEFAULT 'original',
  font_size TEXT DEFAULT 'medium',
  theme TEXT DEFAULT 'dark',
  haptic_feedback BOOLEAN DEFAULT true,
  show_chords BOOLEAN DEFAULT false,
  auto_scroll BOOLEAN DEFAULT true
);

-- Indexes
CREATE INDEX idx_groups_temple ON groups(temple_id);
CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_group ON memberships(group_id);
CREATE INDEX idx_songs_temple ON songs(temple_id);
CREATE INDEX idx_songs_category ON songs(category);
CREATE INDEX idx_songs_deity ON songs(deity);
CREATE INDEX idx_sessions_group ON sessions(group_id);
CREATE INDEX idx_sessions_status ON sessions(status);

-- Row Level Security
ALTER TABLE temples ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Temples (readable by anyone, writable by admin)
CREATE POLICY "Temples are viewable by everyone" ON temples FOR SELECT USING (true);
CREATE POLICY "Temples are creatable by authenticated users" ON temples FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Temples are updatable by creator" ON temples FOR UPDATE USING (created_by = auth.uid());

-- RLS Policies: Groups (visible to temple members)
CREATE POLICY "Groups are viewable by temple members" ON groups FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM memberships m
    JOIN groups g2 ON g2.temple_id = groups.temple_id
    WHERE m.user_id = auth.uid() AND m.group_id = g2.id
  ) OR true); -- Allow discovery for invite code lookup
CREATE POLICY "Groups are creatable by temple admins" ON groups FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM memberships m
    JOIN groups g2 ON g2.temple_id = groups.temple_id
    WHERE m.user_id = auth.uid() AND m.role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM temples t WHERE t.id = temple_id AND t.created_by = auth.uid()
  ));

-- RLS Policies: Memberships
CREATE POLICY "Users can view own memberships" ON memberships FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own membership" ON memberships FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view group memberships" ON memberships FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM memberships m WHERE m.group_id = memberships.group_id AND m.user_id = auth.uid() AND m.role = 'admin'
  ));

-- RLS Policies: Songs (scoped to temple membership)
CREATE POLICY "Songs viewable by temple members" ON songs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM memberships m
    JOIN groups g ON g.id = m.group_id
    WHERE g.temple_id = songs.temple_id AND m.user_id = auth.uid()
  ));
CREATE POLICY "Songs creatable by leaders/admins" ON songs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM memberships m
    JOIN groups g ON g.id = m.group_id
    WHERE g.temple_id = songs.temple_id AND m.user_id = auth.uid() AND m.role IN ('admin', 'leader')
  ));
CREATE POLICY "Songs updatable by creator" ON songs FOR UPDATE USING (created_by = auth.uid());

-- RLS Policies: Sessions
CREATE POLICY "Sessions viewable by group members" ON sessions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM memberships m WHERE m.group_id = sessions.group_id AND m.user_id = auth.uid()
  ));
CREATE POLICY "Sessions creatable by leaders" ON sessions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.group_id = sessions.group_id AND m.user_id = auth.uid() AND m.role IN ('admin', 'leader')
  ));
CREATE POLICY "Sessions updatable by leader" ON sessions FOR UPDATE USING (leader_id = auth.uid());

-- RLS Policies: User Preferences
CREATE POLICY "Users can manage own preferences" ON user_preferences FOR ALL USING (user_id = auth.uid());

-- RLS Policies: Session History
CREATE POLICY "Session history viewable by group members" ON session_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM memberships m WHERE m.group_id = session_history.group_id AND m.user_id = auth.uid()
  ));

-- Enable Realtime for sessions table
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
