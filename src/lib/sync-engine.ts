import { supabase } from './supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

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
  const channelName = `session:${groupId}`
  let supaChannel: RealtimeChannel | null = null
  let messageCallback: ((payload: SyncPayload) => void) | null = null

  // Create Supabase Realtime channel for cross-device sync
  supaChannel = supabase.channel(channelName, {
    config: { broadcast: { self: false } },
  })

  return {
    broadcast(payload: SyncPayload) {
      supaChannel?.send({
        type: 'broadcast',
        event: 'sync',
        payload,
      })
    },

    onMessage(cb: (payload: SyncPayload) => void) {
      messageCallback = cb
      supaChannel
        ?.on('broadcast', { event: 'sync' }, (msg) => {
          if (msg.payload && messageCallback) {
            messageCallback(msg.payload as SyncPayload)
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`[Sync] Connected to channel ${channelName}`)
          }
        })
    },

    close() {
      if (supaChannel) {
        supabase.removeChannel(supaChannel)
        supaChannel = null
      }
      messageCallback = null
    },
  }
}
