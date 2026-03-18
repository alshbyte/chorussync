import { supabase } from './supabase'
import type { Temple, Group, Membership } from '@/types/temple'
import type { Song, SongCategory, Deity, Stanza } from '@/types/song'
import type { ActiveSession, SessionRecord } from '@/stores/community-store'

// ── Temples ─────────────────────────────────────────────────────────

export async function dbCreateTemple(
  name: string,
  description: string | null,
  inviteCode: string,
  createdBy: string,
): Promise<Temple | null> {
  const { data, error } = await supabase
    .from('temples')
    .insert({ name, description, invite_code: inviteCode, created_by: createdBy })
    .select()
    .single()
  if (error) { console.error('dbCreateTemple:', error); return null }
  return mapTemple(data)
}

export async function dbGetTemples(): Promise<Temple[]> {
  const { data, error } = await supabase.from('temples').select('*').order('created_at', { ascending: false })
  if (error) { console.error('dbGetTemples:', error); return [] }
  return (data || []).map(mapTemple)
}

export async function dbFindByInviteCode(code: string): Promise<{ type: 'temple' | 'group'; data: Temple | Group; templeId: string } | null> {
  // Check temples
  const { data: t } = await supabase.from('temples').select('*').eq('invite_code', code).maybeSingle()
  if (t) return { type: 'temple', data: mapTemple(t), templeId: t.id }
  // Check groups
  const { data: g } = await supabase.from('groups').select('*').eq('invite_code', code).maybeSingle()
  if (g) return { type: 'group', data: mapGroup(g), templeId: g.temple_id }
  return null
}

// ── Groups ──────────────────────────────────────────────────────────

export async function dbCreateGroup(templeId: string, name: string, inviteCode: string): Promise<Group | null> {
  const { data, error } = await supabase
    .from('groups')
    .insert({ temple_id: templeId, name, invite_code: inviteCode })
    .select()
    .single()
  if (error) { console.error('dbCreateGroup:', error); return null }
  return mapGroup(data)
}

export async function dbGetGroups(): Promise<Group[]> {
  const { data, error } = await supabase.from('groups').select('*').order('created_at')
  if (error) { console.error('dbGetGroups:', error); return [] }
  return (data || []).map(mapGroup)
}

// ── Memberships ─────────────────────────────────────────────────────

export async function dbCreateMembership(userId: string, groupId: string, role: string, displayName: string): Promise<Membership | null> {
  const { data, error } = await supabase
    .from('memberships')
    .upsert({ user_id: userId, group_id: groupId, role, display_name: displayName }, { onConflict: 'user_id,group_id' })
    .select()
    .single()
  if (error) { console.error('dbCreateMembership:', error); return null }
  return mapMembership(data)
}

export async function dbGetMemberships(): Promise<Membership[]> {
  const { data, error } = await supabase.from('memberships').select('*')
  if (error) { console.error('dbGetMemberships:', error); return [] }
  return (data || []).map(mapMembership)
}

export async function dbDeleteMembership(userId: string, groupId: string): Promise<void> {
  await supabase.from('memberships').delete().eq('user_id', userId).eq('group_id', groupId)
}

// ── Songs ───────────────────────────────────────────────────────────

export async function dbAddSong(
  templeId: string, title: string, category: SongCategory, deity: Deity,
  stanzas: Stanza[], createdBy: string,
): Promise<Song | null> {
  const { data, error } = await supabase
    .from('songs')
    .insert({
      temple_id: templeId, title, category, deity,
      stanzas: JSON.stringify(stanzas),
      created_by: createdBy,
    })
    .select()
    .single()
  if (error) { console.error('dbAddSong:', error); return null }
  return mapSong(data)
}

export async function dbGetSongs(): Promise<Song[]> {
  const { data, error } = await supabase.from('songs').select('*').order('created_at', { ascending: false })
  if (error) { console.error('dbGetSongs:', error); return [] }
  return (data || []).map(mapSong)
}

export async function dbDeleteSong(id: string): Promise<void> {
  await supabase.from('songs').delete().eq('id', id)
}

export async function dbUpdateSongStanzas(id: string, stanzas: Stanza[]): Promise<void> {
  await supabase.from('songs').update({ stanzas: JSON.stringify(stanzas), updated_at: new Date().toISOString() }).eq('id', id)
}

// ── Active Sessions ─────────────────────────────────────────────────

export async function dbStartSession(groupId: string, songId: string, leaderId: string): Promise<ActiveSession | null> {
  // Upsert — replace existing session for this group
  const { data, error } = await supabase
    .from('active_sessions')
    .upsert({ group_id: groupId, song_id: songId, leader_id: leaderId, current_stanza_index: 0 }, { onConflict: 'group_id' })
    .select()
    .single()
  if (error) { console.error('dbStartSession:', error); return null }
  return mapActiveSession(data)
}

export async function dbEndSession(groupId: string): Promise<void> {
  // Get current session before deleting
  const { data: session } = await supabase.from('active_sessions').select('*').eq('group_id', groupId).maybeSingle()
  if (session) {
    // Save to history
    await supabase.from('session_history').insert({
      group_id: groupId,
      song_ids: [session.song_id],
      started_at: session.started_at,
    })
  }
  await supabase.from('active_sessions').delete().eq('group_id', groupId)
}

export async function dbGetActiveSessions(): Promise<ActiveSession[]> {
  const { data, error } = await supabase.from('active_sessions').select('*')
  if (error) { console.error('dbGetActiveSessions:', error); return [] }
  return (data || []).map(mapActiveSession)
}

export async function dbUpdateSessionStanza(groupId: string, index: number): Promise<void> {
  await supabase.from('active_sessions').update({ current_stanza_index: index }).eq('group_id', groupId)
}

export async function dbUpdateSessionSong(groupId: string, songId: string): Promise<void> {
  await supabase.from('active_sessions').update({ song_id: songId, current_stanza_index: 0 }).eq('group_id', groupId)
}

// ── Session History ─────────────────────────────────────────────────

export async function dbGetSessionHistory(): Promise<SessionRecord[]> {
  const { data, error } = await supabase.from('session_history').select('*').order('ended_at', { ascending: false }).limit(50)
  if (error) { console.error('dbGetSessionHistory:', error); return [] }
  return (data || []).map(mapSessionRecord)
}

// ── Load all data (initial fetch) ───────────────────────────────────

export async function dbLoadAll(): Promise<{
  temples: Temple[]
  groups: Group[]
  memberships: Membership[]
  songs: Song[]
  activeSessions: ActiveSession[]
  sessionHistory: SessionRecord[]
}> {
  const [temples, groups, memberships, songs, activeSessions, sessionHistory] = await Promise.all([
    dbGetTemples(),
    dbGetGroups(),
    dbGetMemberships(),
    dbGetSongs(),
    dbGetActiveSessions(),
    dbGetSessionHistory(),
  ])
  return { temples, groups, memberships, songs, activeSessions, sessionHistory }
}

// ── Realtime subscription for active_sessions ───────────────────────

export function subscribeToSessions(onChange: () => void) {
  return supabase
    .channel('active-sessions-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'active_sessions' }, () => {
      onChange()
    })
    .subscribe()
}

// ── Row mappers (DB snake_case → App camelCase) ─────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapTemple(row: any): Temple {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    inviteCode: row.invite_code,
    createdBy: row.created_by,
    createdAt: row.created_at,
    settings: row.settings || {},
  }
}

function mapGroup(row: any): Group {
  return {
    id: row.id,
    templeId: row.temple_id,
    name: row.name,
    inviteCode: row.invite_code,
    createdAt: row.created_at,
  }
}

function mapMembership(row: any): Membership {
  return {
    id: row.id,
    userId: row.user_id,
    groupId: row.group_id,
    role: row.role,
    displayName: row.display_name,
    joinedAt: row.joined_at,
  }
}

function mapSong(row: any): Song {
  const stanzas = typeof row.stanzas === 'string' ? JSON.parse(row.stanzas) : row.stanzas
  return {
    id: row.id,
    templeId: row.temple_id,
    title: row.title,
    originalLanguage: row.original_language,
    category: row.category,
    deity: row.deity,
    stanzas: stanzas || [],
    metadata: row.metadata || {},
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapActiveSession(row: any): ActiveSession {
  return {
    id: row.id,
    groupId: row.group_id,
    songId: row.song_id,
    leaderId: row.leader_id,
    currentStanzaIndex: row.current_stanza_index,
    startedAt: row.started_at,
  }
}

function mapSessionRecord(row: any): SessionRecord {
  return {
    id: row.id,
    groupId: row.group_id,
    songIds: row.song_ids || [],
    startedAt: row.started_at,
    endedAt: row.ended_at,
  }
}
