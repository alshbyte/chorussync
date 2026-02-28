import { create } from 'zustand';
import type { LiveSession, SessionParticipant, SyncMessage } from '@/types/session';

interface SessionState {
  currentSession: LiveSession | null;
  participants: SessionParticipant[];
  isConnected: boolean;
  syncLatency: number; // ms
  raisedHands: string[]; // user IDs
  lastSyncMessage: SyncMessage | null;

  setSession: (session: LiveSession | null) => void;
  updateStanza: (stanzaIndex: number) => void;
  updateSong: (songId: string) => void;
  setParticipants: (participants: SessionParticipant[]) => void;
  setConnected: (connected: boolean) => void;
  setSyncLatency: (latency: number) => void;
  addRaisedHand: (userId: string) => void;
  clearRaisedHand: (userId: string) => void;
  setLastSyncMessage: (msg: SyncMessage) => void;
  reset: () => void;
}

const initialState = {
  currentSession: null,
  participants: [],
  isConnected: false,
  syncLatency: 0,
  raisedHands: [],
  lastSyncMessage: null,
};

export const useSessionStore = create<SessionState>()((set) => ({
  ...initialState,

  setSession: (currentSession) => set({ currentSession }),
  updateStanza: (stanzaIndex) =>
    set((s) => ({
      currentSession: s.currentSession
        ? { ...s.currentSession, currentStanzaIndex: stanzaIndex }
        : null,
    })),
  updateSong: (songId) =>
    set((s) => ({
      currentSession: s.currentSession
        ? { ...s.currentSession, currentSongId: songId, currentStanzaIndex: 0 }
        : null,
    })),
  setParticipants: (participants) => set({ participants }),
  setConnected: (isConnected) => set({ isConnected }),
  setSyncLatency: (syncLatency) => set({ syncLatency }),
  addRaisedHand: (userId) =>
    set((s) => ({
      raisedHands: s.raisedHands.includes(userId) ? s.raisedHands : [...s.raisedHands, userId],
    })),
  clearRaisedHand: (userId) =>
    set((s) => ({ raisedHands: s.raisedHands.filter((id) => id !== userId) })),
  setLastSyncMessage: (lastSyncMessage) => set({ lastSyncMessage }),
  reset: () => set(initialState),
}));
