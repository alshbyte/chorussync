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
    | 'presence_ping'
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
  let subscribed = false
  let pendingMessages: SyncPayload[] = []

  // Create Supabase Realtime channel with server acknowledgment
  supaChannel = supabase.channel(channelName, {
    config: { broadcast: { self: false, ack: true } },
  })

  return {
    async broadcast(payload: SyncPayload) {
      if (!supaChannel) return

      // Queue messages if not yet subscribed
      if (!subscribed) {
        pendingMessages.push(payload)
        return
      }

      try {
        const result = await supaChannel.send({
          type: 'broadcast',
          event: 'sync',
          payload,
        })
        if (result !== 'ok') {
          console.warn(`[Sync] Broadcast ${payload.type} returned: ${result}`)
        }
      } catch (err) {
        console.error(`[Sync] Broadcast error for ${payload.type}:`, err)
      }
    },

    onMessage(cb: (payload: SyncPayload) => void, onStatusChange?: (connected: boolean) => void) {
      messageCallback = cb
      supaChannel
        ?.on('broadcast', { event: 'sync' }, (msg) => {
          if (msg.payload && messageCallback) {
            messageCallback(msg.payload as SyncPayload)
          }
        })
        .subscribe(async (status) => {
          console.log(`[Sync] Channel ${channelName} status: ${status}`)
          if (status === 'SUBSCRIBED') {
            subscribed = true
            onStatusChange?.(true)
            // Flush any messages that were queued before subscription
            for (const msg of pendingMessages) {
              try {
                await supaChannel?.send({ type: 'broadcast', event: 'sync', payload: msg })
              } catch { /* ignore flush errors */ }
            }
            pendingMessages = []
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            subscribed = false
            onStatusChange?.(false)
          }
        })
    },

    isSubscribed() {
      return subscribed
    },

    close() {
      subscribed = false
      pendingMessages = []
      if (supaChannel) {
        supabase.removeChannel(supaChannel)
        supaChannel = null
      }
      messageCallback = null
    },
  }
}
