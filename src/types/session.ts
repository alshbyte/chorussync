export type SessionStatus = 'active' | 'paused' | 'ended';

export interface LiveSession {
  id: string;
  groupId: string;
  leaderId: string;
  status: SessionStatus;
  currentSongId: string | null;
  currentStanzaIndex: number;
  setlist: string[]; // song IDs
  setlistPosition: number;
  startedAt: string;
  endedAt: string | null;
}

export interface SyncMessage {
  type: 'stanza_change' | 'song_change' | 'session_control' | 'raise_hand';
  songId?: string;
  stanzaIndex?: number;
  sessionStatus?: SessionStatus;
  senderId: string;
  senderName?: string;
  timestamp: number;
}

export interface SessionParticipant {
  userId: string;
  displayName: string;
  role: 'leader' | 'follower';
  joinedAt: string;
  isConnected: boolean;
}

export interface SessionHistory {
  id: string;
  sessionId: string;
  groupId: string;
  songsSung: string[];
  participantCount: number;
  durationMinutes: number;
  recordedAt: string;
}
