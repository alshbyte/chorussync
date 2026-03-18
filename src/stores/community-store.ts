import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Temple, Group, Membership } from '@/types/temple'
import type { Song, SongCategory, Deity } from '@/types/song'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const genCode = (n = 6) =>
  Array.from({ length: n }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
const genId = () => crypto.randomUUID()

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

  setUserName: (name: string) => void
  createTemple: (name: string, description?: string) => Temple
  createGroup: (templeId: string, name: string) => Group
  joinByCode: (code: string) => { type: 'temple' | 'group'; id: string; templeId: string } | null
  addSong: (
    templeId: string,
    title: string,
    category: SongCategory,
    deity: Deity,
    rawLyrics: string,
  ) => Song
  deleteSong: (id: string) => void
  leaveGroup: (groupId: string) => void
  startSession: (groupId: string, songId: string) => ActiveSession
  endSession: (groupId: string) => void
  setSessionStanza: (groupId: string, index: number) => void
  setSessionSong: (groupId: string, songId: string) => void
  getActiveSession: (groupId: string) => ActiveSession | undefined
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
      userId: genId(),
      userName: 'Singer',
      temples: [],
      groups: [],
      memberships: [],
      songs: [],
      activeSessions: [],
      sessionHistory: [],

      setUserName: (n) => set({ userName: n }),

      createTemple: (name, description) => {
        const t: Temple = {
          id: genId(),
          name,
          description: description || null,
          inviteCode: genCode(),
          createdBy: get().userId,
          createdAt: new Date().toISOString(),
          settings: {},
        }
        set((s) => ({ temples: [...s.temples, t] }))
        return t
      },

      createGroup: (templeId, name) => {
        const g: Group = {
          id: genId(),
          templeId,
          name,
          inviteCode: genCode(),
          createdAt: new Date().toISOString(),
        }
        const m: Membership = {
          id: genId(),
          userId: get().userId,
          groupId: g.id,
          role: 'leader',
          displayName: get().userName,
          joinedAt: new Date().toISOString(),
        }
        set((s) => ({
          groups: [...s.groups, g],
          memberships: [...s.memberships, m],
        }))
        return g
      },

      joinByCode: (code) => {
        const c = code.toUpperCase().trim()
        const temple = get().temples.find((t) => t.inviteCode === c)
        if (temple) return { type: 'temple', id: temple.id, templeId: temple.id }
        const group = get().groups.find((g) => g.inviteCode === c)
        if (group) {
          if (!get().memberships.find((m) => m.groupId === group.id && m.userId === get().userId)) {
            const m: Membership = {
              id: genId(),
              userId: get().userId,
              groupId: group.id,
              role: 'follower',
              displayName: get().userName,
              joinedAt: new Date().toISOString(),
            }
            set((s) => ({ memberships: [...s.memberships, m] }))
          }
          return { type: 'group', id: group.id, templeId: group.templeId }
        }
        return null
      },

      addSong: (templeId, title, category, deity, raw) => {
        const song: Song = {
          id: genId(),
          templeId,
          title,
          originalLanguage: 'hi',
          category,
          deity,
          stanzas: parseLyrics(raw),
          metadata: {},
          createdBy: get().userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((s) => ({ songs: [...s.songs, song] }))
        return song
      },

      deleteSong: (id) => set((s) => ({ songs: s.songs.filter((x) => x.id !== id) })),

      leaveGroup: (groupId) =>
        set((s) => ({
          memberships: s.memberships.filter(
            (m) => !(m.groupId === groupId && m.userId === s.userId),
          ),
        })),

      startSession: (groupId, songId) => {
        const sess: ActiveSession = {
          id: genId(),
          groupId,
          songId,
          leaderId: get().userId,
          currentStanzaIndex: 0,
          startedAt: new Date().toISOString(),
        }
        set((s) => ({
          activeSessions: [...s.activeSessions.filter((x) => x.groupId !== groupId), sess],
        }))
        return sess
      },

      endSession: (groupId) => {
        const session = get().activeSessions.find((x) => x.groupId === groupId)
        if (session) {
          const record: SessionRecord = {
            id: genId(),
            groupId,
            songIds: [session.songId],
            startedAt: session.startedAt,
            endedAt: new Date().toISOString(),
          }
          set((s) => ({
            activeSessions: s.activeSessions.filter((x) => x.groupId !== groupId),
            sessionHistory: [...s.sessionHistory, record],
          }))
        } else {
          set((s) => ({ activeSessions: s.activeSessions.filter((x) => x.groupId !== groupId) }))
        }
      },

      setSessionStanza: (groupId, index) =>
        set((s) => ({
          activeSessions: s.activeSessions.map((x) =>
            x.groupId === groupId ? { ...x, currentStanzaIndex: index } : x,
          ),
        })),

      setSessionSong: (groupId, songId) =>
        set((s) => ({
          activeSessions: s.activeSessions.map((x) =>
            x.groupId === groupId ? { ...x, songId, currentStanzaIndex: 0 } : x,
          ),
        })),

      getActiveSession: (groupId) => get().activeSessions.find((x) => x.groupId === groupId),
    }),
    { name: 'chorussync-community' },
  ),
)
