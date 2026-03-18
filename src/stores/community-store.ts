import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Temple, Group, Membership } from '@/types/temple'
import type { Song, SongCategory, Deity, Stanza } from '@/types/song'
import * as db from '@/lib/supabase-db'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const genCode = (n = 6) =>
  Array.from({ length: n }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')

export interface ActiveSession {
  id: string
  groupId: string
  songId: string
  leaderId: string
  currentStanzaIndex: number
  startedAt: string
}

export interface SessionRecord {
  id: string
  groupId: string
  songIds: string[]
  startedAt: string
  endedAt: string
}

interface CommunityState {
  userId: string
  userName: string
  temples: Temple[]
  groups: Group[]
  memberships: Membership[]
  songs: Song[]
  activeSessions: ActiveSession[]
  sessionHistory: SessionRecord[]
  loaded: boolean
  syncing: boolean

  setUserName: (name: string) => void
  loadFromCloud: () => Promise<void>
  createTemple: (name: string, description?: string) => Promise<Temple>
  createGroup: (templeId: string, name: string) => Promise<Group>
  joinByCode: (code: string) => Promise<{ type: 'temple' | 'group'; id: string; templeId: string } | null>
  addSong: (templeId: string, title: string, category: SongCategory, deity: Deity, rawLyrics: string) => Promise<Song>
  deleteSong: (id: string) => void
  leaveGroup: (groupId: string) => void
  saveTransliteration: (songId: string, script: string, stanzas: Stanza[]) => void
  updateTransliterationLine: (songId: string, script: string, stanzaIndex: number, lineIndex: number, text: string) => void
  hasTransliteration: (songId: string, script: string) => boolean
  startSession: (groupId: string, songId: string) => Promise<ActiveSession>
  endSession: (groupId: string) => void
  setSessionStanza: (groupId: string, index: number) => void
  setSessionSong: (groupId: string, songId: string) => void
  getActiveSession: (groupId: string) => ActiveSession | undefined
  refreshSessions: () => Promise<void>
}

function parseLyrics(raw: string) {
  const blocks = raw.split(/\n\s*\n/).filter((b) => b.trim())
  return blocks.map((block, i) => ({
    index: i,
    type: (i === 0 && blocks.length > 1 ? 'chorus' : 'verse') as 'chorus' | 'verse',
    label: i === 0 && blocks.length > 1 ? 'Chorus' : `Verse ${blocks.length > 1 ? i : i + 1}`,
    lines: block
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => ({ text: l.trim(), transliterations: {} })),
  }))
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      userId: crypto.randomUUID(),
      userName: 'Singer',
      temples: [],
      groups: [],
      memberships: [],
      songs: [],
      activeSessions: [],
      sessionHistory: [],
      loaded: false,
      syncing: false,

      setUserName: (n) => set({ userName: n }),

      // Load all data from Supabase
      loadFromCloud: async () => {
        if (get().syncing) return
        set({ syncing: true })
        try {
          const data = await db.dbLoadAll()
          set({ ...data, loaded: true, syncing: false })
        } catch (e) {
          console.error('Failed to load from cloud:', e)
          set({ loaded: true, syncing: false })
        }
      },

      createTemple: async (name, description) => {
        const code = genCode()
        const userId = get().userId
        // Write to Supabase
        const t = await db.dbCreateTemple(name, description || null, code, userId)
        if (t) {
          set((s) => ({ temples: [...s.temples, t] }))
          return t
        }
        // Fallback: local-only
        const local: Temple = {
          id: crypto.randomUUID(), name, description: description || null,
          inviteCode: code, createdBy: userId, createdAt: new Date().toISOString(), settings: {},
        }
        set((s) => ({ temples: [...s.temples, local] }))
        return local
      },

      createGroup: async (templeId, name) => {
        const code = genCode()
        const userId = get().userId
        const g = await db.dbCreateGroup(templeId, name, code)
        if (g) {
          // Also create leader membership
          const m = await db.dbCreateMembership(userId, g.id, 'leader', get().userName)
          set((s) => ({
            groups: [...s.groups, g],
            memberships: m ? [...s.memberships, m] : s.memberships,
          }))
          return g
        }
        // Fallback
        const local: Group = { id: crypto.randomUUID(), templeId, name, inviteCode: code, createdAt: new Date().toISOString() }
        const localM: Membership = { id: crypto.randomUUID(), userId, groupId: local.id, role: 'leader', displayName: get().userName, joinedAt: new Date().toISOString() }
        set((s) => ({ groups: [...s.groups, local], memberships: [...s.memberships, localM] }))
        return local
      },

      joinByCode: async (code) => {
        const c = code.toUpperCase().trim()
        const result = await db.dbFindByInviteCode(c)
        if (!result) return null

        if (result.type === 'group') {
          const group = result.data as Group
          // Add membership
          if (!get().memberships.find((m) => m.groupId === group.id && m.userId === get().userId)) {
            const m = await db.dbCreateMembership(get().userId, group.id, 'follower', get().userName)
            if (m) set((s) => ({ memberships: [...s.memberships, m] }))
          }
          // Ensure group is in local state
          if (!get().groups.find((g) => g.id === group.id)) {
            set((s) => ({ groups: [...s.groups, group] }))
          }
          // Ensure temple is in local state
          if (!get().temples.find((t) => t.id === result.templeId)) {
            await get().loadFromCloud()
          }
          return { type: 'group', id: group.id, templeId: result.templeId }
        }

        const temple = result.data as Temple
        if (!get().temples.find((t) => t.id === temple.id)) {
          set((s) => ({ temples: [...s.temples, temple] }))
        }
        // Load all data for this temple
        await get().loadFromCloud()
        return { type: 'temple', id: temple.id, templeId: temple.id }
      },

      addSong: async (templeId, title, category, deity, raw) => {
        const stanzas = parseLyrics(raw)
        const userId = get().userId
        const song = await db.dbAddSong(templeId, title, category, deity, stanzas, userId)
        if (song) {
          set((s) => ({ songs: [...s.songs, song] }))
          return song
        }
        // Fallback
        const local: Song = {
          id: crypto.randomUUID(), templeId, title, originalLanguage: 'hi', category, deity,
          stanzas, metadata: {}, createdBy: userId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        }
        set((s) => ({ songs: [...s.songs, local] }))
        return local
      },

      deleteSong: (id) => {
        set((s) => ({ songs: s.songs.filter((x) => x.id !== id) }))
        db.dbDeleteSong(id)
      },

      leaveGroup: (groupId) => {
        const userId = get().userId
        set((s) => ({ memberships: s.memberships.filter((m) => !(m.groupId === groupId && m.userId === userId)) }))
        db.dbDeleteMembership(userId, groupId)
      },

      saveTransliteration: (songId, script, transliteratedStanzas) => {
        set((s) => ({
          songs: s.songs.map((song) => {
            if (song.id !== songId) return song
            const updated = {
              ...song,
              updatedAt: new Date().toISOString(),
              stanzas: song.stanzas.map((stanza) => {
                const matched = transliteratedStanzas.find((t) => t.index === stanza.index)
                if (!matched) return stanza
                return {
                  ...stanza,
                  lines: stanza.lines.map((line, i) => {
                    const transText = matched.lines[i]?.transliterations[script as keyof typeof line.transliterations]
                    if (!transText) return line
                    return { ...line, transliterations: { ...line.transliterations, [script]: transText } }
                  }),
                }
              }),
            }
            // Sync to cloud in background
            db.dbUpdateSongStanzas(songId, updated.stanzas)
            return updated
          }),
        }))
      },

      updateTransliterationLine: (songId, script, stanzaIndex, lineIndex, text) => {
        set((s) => ({
          songs: s.songs.map((song) => {
            if (song.id !== songId) return song
            const updated = {
              ...song,
              updatedAt: new Date().toISOString(),
              stanzas: song.stanzas.map((stanza) => {
                if (stanza.index !== stanzaIndex) return stanza
                return {
                  ...stanza,
                  lines: stanza.lines.map((line, i) => {
                    if (i !== lineIndex) return line
                    return { ...line, transliterations: { ...line.transliterations, [script]: text } }
                  }),
                }
              }),
            }
            // Debounced cloud sync
            db.dbUpdateSongStanzas(songId, updated.stanzas)
            return updated
          }),
        }))
      },

      hasTransliteration: (songId, script) => {
        const song = get().songs.find((s) => s.id === songId)
        if (!song) return false
        return song.stanzas.every((s) =>
          s.lines.every((l) => l.transliterations[script as keyof typeof l.transliterations])
        )
      },

      startSession: async (groupId, songId) => {
        const userId = get().userId
        const sess = await db.dbStartSession(groupId, songId, userId)
        if (sess) {
          set((s) => ({ activeSessions: [...s.activeSessions.filter((x) => x.groupId !== groupId), sess] }))
          return sess
        }
        // Fallback
        const local: ActiveSession = {
          id: crypto.randomUUID(), groupId, songId, leaderId: userId,
          currentStanzaIndex: 0, startedAt: new Date().toISOString(),
        }
        set((s) => ({ activeSessions: [...s.activeSessions.filter((x) => x.groupId !== groupId), local] }))
        return local
      },

      endSession: (groupId) => {
        const session = get().activeSessions.find((x) => x.groupId === groupId)
        if (session) {
          const record: SessionRecord = {
            id: crypto.randomUUID(), groupId, songIds: [session.songId],
            startedAt: session.startedAt, endedAt: new Date().toISOString(),
          }
          set((s) => ({
            activeSessions: s.activeSessions.filter((x) => x.groupId !== groupId),
            sessionHistory: [...s.sessionHistory, record],
          }))
        } else {
          set((s) => ({ activeSessions: s.activeSessions.filter((x) => x.groupId !== groupId) }))
        }
        db.dbEndSession(groupId)
      },

      setSessionStanza: (groupId, index) => {
        set((s) => ({
          activeSessions: s.activeSessions.map((x) =>
            x.groupId === groupId ? { ...x, currentStanzaIndex: index } : x,
          ),
        }))
        db.dbUpdateSessionStanza(groupId, index)
      },

      setSessionSong: (groupId, songId) => {
        set((s) => ({
          activeSessions: s.activeSessions.map((x) =>
            x.groupId === groupId ? { ...x, songId, currentStanzaIndex: 0 } : x,
          ),
        }))
        db.dbUpdateSessionSong(groupId, songId)
      },

      getActiveSession: (groupId) => get().activeSessions.find((x) => x.groupId === groupId),

      // Refresh just active sessions from cloud (called by realtime subscription)
      refreshSessions: async () => {
        const sessions = await db.dbGetActiveSessions()
        set({ activeSessions: sessions })
      },
    }),
    { name: 'chorussync-community' },
  ),
)
