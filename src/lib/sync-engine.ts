export interface SyncPayload {
  type:
    | 'stanza_change'
    | 'song_change'
    | 'session_end'
    | 'request_state'
    | 'state_response'
    | 'raise_hand'
  songId?: string
  stanzaIndex?: number
  senderId: string
  senderName?: string
  timestamp: number
}

export function createSyncChannel(groupId: string) {
  const channel = new BroadcastChannel(`chorussync-${groupId}`)

  return {
    broadcast(payload: SyncPayload) {
      channel.postMessage(payload)
    },
    onMessage(cb: (payload: SyncPayload) => void) {
      channel.onmessage = (e) => cb(e.data)
    },
    close() {
      channel.close()
    },
  }
}
