import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ChevronUp, ChevronDown, Square, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCommunityStore } from '@/stores/community-store'
import { createSyncChannel } from '@/lib/sync-engine'
import type { SyncPayload } from '@/lib/sync-engine'

export function LiveSession() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const store = useCommunityStore()
  const syncRef = useRef<ReturnType<typeof createSyncChannel> | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const session = store.activeSessions.find((s) => s.groupId === groupId)
  const song = session ? store.songs.find((s) => s.id === session.songId) : null
  const group = store.groups.find((g) => g.id === groupId)
  const isLeader = session?.leaderId === store.userId

  // Set up BroadcastChannel sync
  useEffect(() => {
    if (!groupId) return
    const channel = createSyncChannel(groupId)
    syncRef.current = channel

    channel.onMessage((msg: SyncPayload) => {
      if (msg.senderId === store.userId) return
      if (msg.type === 'stanza_change' && msg.stanzaIndex !== undefined) {
        setActiveIndex(msg.stanzaIndex)
        store.setSessionStanza(groupId, msg.stanzaIndex)
      }
      if (msg.type === 'session_end') {
        navigate(`/group/${groupId}`)
      }
      if (msg.type === 'request_state' && isLeader && session) {
        channel.broadcast({
          type: 'state_response',
          stanzaIndex: store.activeSessions.find((s) => s.groupId === groupId)
            ?.currentStanzaIndex,
          songId: session.songId,
          senderId: store.userId,
          timestamp: Date.now(),
        })
      }
      if (msg.type === 'state_response' && msg.stanzaIndex !== undefined) {
        setActiveIndex(msg.stanzaIndex)
      }
    })

    if (!isLeader) {
      channel.broadcast({
        type: 'request_state',
        senderId: store.userId,
        timestamp: Date.now(),
      })
    }

    return () => channel.close()
  }, [groupId])

  // Sync from store on mount
  useEffect(() => {
    if (session) setActiveIndex(session.currentStanzaIndex)
  }, [])

  // Auto-scroll to active stanza
  useEffect(() => {
    const el = document.getElementById(`stanza-${activeIndex}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeIndex])

  const changeStanza = (idx: number) => {
    if (!isLeader || !song || !groupId) return
    const clamped = Math.max(0, Math.min(idx, song.stanzas.length - 1))
    setActiveIndex(clamped)
    store.setSessionStanza(groupId, clamped)
    syncRef.current?.broadcast({
      type: 'stanza_change',
      stanzaIndex: clamped,
      senderId: store.userId,
      timestamp: Date.now(),
    })
  }

  const handleEnd = () => {
    if (!groupId) return
    syncRef.current?.broadcast({
      type: 'session_end',
      senderId: store.userId,
      timestamp: Date.now(),
    })
    store.endSession(groupId)
    navigate(`/group/${groupId}`)
  }

  if (!session || !song) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <Radio className="h-10 w-10 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">No active session</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate(groupId ? `/group/${groupId}` : '/dashboard')}
        >
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <button
            onClick={() => navigate(`/group/${groupId}`)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="text-center flex-1 min-w-0 px-4">
            <p className="text-sm font-semibold truncate">{song.title}</p>
            <p className="text-[11px] text-muted-foreground">
              {group?.name} · {isLeader ? 'Leading' : 'Following'}
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </div>
        </div>
      </div>

      {/* Stanzas */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-28">
        <div className="mx-auto max-w-lg space-y-3">
          {song.stanzas.map((stanza, idx) => {
            const isActive = idx === activeIndex
            return (
              <div
                key={stanza.index}
                id={`stanza-${idx}`}
                onClick={() => isLeader && changeStanza(idx)}
                className={[
                  'rounded-xl border p-4 transition-all duration-300',
                  isActive
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.01]'
                    : 'border-border opacity-40 hover:opacity-70',
                  isLeader ? 'cursor-pointer active:scale-[0.99]' : '',
                ].join(' ')}
              >
                <p
                  className={`text-xs font-medium uppercase tracking-wider mb-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  {stanza.label}
                </p>
                <div className="space-y-1">
                  {stanza.lines.map((line, i) => (
                    <p
                      key={i}
                      className={`font-serif leading-relaxed ${isActive ? 'text-lg' : 'text-base'}`}
                    >
                      {line.text}
                    </p>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Leader Controls Dock */}
      {isLeader && (
        <div className="fixed bottom-0 inset-x-0 border-t border-border bg-background/90 backdrop-blur-md pb-4">
          <div className="mx-auto max-w-lg flex items-center justify-between px-4 py-3">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl"
              disabled={activeIndex === 0}
              onClick={() => changeStanza(activeIndex - 1)}
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                {activeIndex + 1} / {song.stanzas.length}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 text-destructive hover:text-destructive h-7 text-xs"
                onClick={handleEnd}
              >
                <Square className="h-3 w-3 mr-1" /> End
              </Button>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl"
              disabled={activeIndex === song.stanzas.length - 1}
              onClick={() => changeStanza(activeIndex + 1)}
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
