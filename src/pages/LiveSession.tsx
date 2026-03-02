import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Square,
  Radio,
  Volume2,
  VolumeX,
  SkipForward,
  Music,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCommunityStore } from '@/stores/community-store'
import { useUIStore } from '@/stores/ui-store'
import { createSyncChannel, type SyncPayload } from '@/lib/sync-engine'
import { startDrone, stopDrone } from '@/lib/audio'
import { transliterateStanzas, isGeminiConfigured } from '@/lib/gemini'
import type { Stanza } from '@/types/song'

const FONT_SIZE: Record<string, { normal: string; active: string }> = {
  small: { normal: 'text-sm', active: 'text-base' },
  medium: { normal: 'text-base', active: 'text-lg' },
  large: { normal: 'text-lg', active: 'text-xl' },
  xlarge: { normal: 'text-xl', active: 'text-2xl' },
}

export function LiveSession() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const store = useCommunityStore()
  const { fontSize, hapticFeedback, autoScroll, preferredScript } = useUIStore()
  const syncRef = useRef<ReturnType<typeof createSyncChannel> | null>(null)
  const touchRef = useRef<{ y: number; time: number } | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [raisedHands, setRaisedHands] = useState<{ name: string; time: number }[]>([])
  const [droneOn, setDroneOn] = useState(false)
  const [songPickerOpen, setSongPickerOpen] = useState(false)
  const [transliterated, setTransliterated] = useState<Stanza[] | null>(null)
  const [transLoading, setTransLoading] = useState(false)

  const session = store.activeSessions.find((s) => s.groupId === groupId)
  const song = session ? store.songs.find((s) => s.id === session.songId) : null
  const group = store.groups.find((g) => g.id === groupId)
  const isLeader = session?.leaderId === store.userId
  const templeSongs = store.songs.filter((s) => s.templeId === group?.templeId)
  const sizes = FONT_SIZE[fontSize] || FONT_SIZE.medium

  // Haptic vibration on stanza change
  useEffect(() => {
    if (hapticFeedback && navigator.vibrate) {
      navigator.vibrate(50)
    }
  }, [activeIndex, hapticFeedback])

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
      if (msg.type === 'song_change' && msg.songId) {
        store.setSessionSong(groupId, msg.songId)
        setActiveIndex(0)
      }
      if (msg.type === 'session_end') {
        navigate(`/group/${groupId}`)
      }
      if (msg.type === 'raise_hand' && msg.senderName) {
        setRaisedHands((prev) => [...prev, { name: msg.senderName!, time: Date.now() }])
        setTimeout(() => {
          setRaisedHands((prev) => prev.filter((h) => Date.now() - h.time < 5000))
        }, 5000)
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
      channel.broadcast({ type: 'request_state', senderId: store.userId, timestamp: Date.now() })
    }

    return () => channel.close()
  }, [groupId])

  // Sync from store on mount
  useEffect(() => {
    if (session) setActiveIndex(session.currentStanzaIndex)
  }, [])

  // Transliterate stanzas when song or preferredScript changes
  useEffect(() => {
    if (!song || preferredScript === 'original' || !isGeminiConfigured()) {
      setTransliterated(null)
      return
    }
    let cancelled = false
    setTransLoading(true)
    transliterateStanzas(song.stanzas, preferredScript).then((result) => {
      if (!cancelled) {
        setTransliterated(result)
        setTransLoading(false)
      }
    }).catch(() => {
      if (!cancelled) setTransLoading(false)
    })
    return () => { cancelled = true }
  }, [song?.id, preferredScript])

  // Auto-scroll to active stanza
  useEffect(() => {
    if (!autoScroll) return
    const el = document.getElementById(`stanza-${activeIndex}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeIndex, autoScroll])

  const changeStanza = useCallback(
    (idx: number) => {
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
    },
    [isLeader, song, groupId, store],
  )

  const changeSong = (songId: string) => {
    if (!groupId) return
    store.setSessionSong(groupId, songId)
    setActiveIndex(0)
    store.setSessionStanza(groupId, 0)
    setSongPickerOpen(false)
    syncRef.current?.broadcast({
      type: 'song_change',
      songId,
      stanzaIndex: 0,
      senderId: store.userId,
      timestamp: Date.now(),
    })
  }

  const handleEnd = () => {
    if (!groupId) return
    if (droneOn) {
      stopDrone()
      setDroneOn(false)
    }
    syncRef.current?.broadcast({
      type: 'session_end',
      senderId: store.userId,
      timestamp: Date.now(),
    })
    store.endSession(groupId)
    navigate(`/group/${groupId}`)
  }

  const raiseHand = () => {
    if (!groupId) return
    syncRef.current?.broadcast({
      type: 'raise_hand',
      senderId: store.userId,
      senderName: store.userName,
      timestamp: Date.now(),
    })
    if (hapticFeedback && navigator.vibrate) navigator.vibrate([50, 50, 50])
  }

  const toggleDrone = () => {
    if (droneOn) {
      stopDrone()
      setDroneOn(false)
    } else {
      startDrone('C')
      setDroneOn(true)
    }
  }

  // Swipe gesture handling (leader only)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchRef.current = { y: e.touches[0].clientY, time: Date.now() }
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current || !isLeader) return
    const dy = touchRef.current.y - e.changedTouches[0].clientY
    const dt = Date.now() - touchRef.current.time
    if (Math.abs(dy) > 60 && dt < 400) {
      if (dy > 0) changeStanza(activeIndex + 1)
      else changeStanza(activeIndex - 1)
    }
    touchRef.current = null
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
    <div
      className="min-h-screen flex flex-col bg-background"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Raised Hand Notifications (Leader only) */}
      {isLeader && raisedHands.length > 0 && (
        <div className="fixed top-14 right-3 z-20 space-y-2">
          {raisedHands.map((h, i) => (
            <div
              key={i}
              className="rounded-lg bg-primary/90 text-primary-foreground px-3 py-2 text-sm shadow-lg animate-in slide-in-from-right"
            >
              🙏 {h.name}
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <button
            onClick={() => navigate(`/group/${groupId}`)}
            className="p-1.5 -ml-1.5 text-muted-foreground min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center flex-1 min-w-0 px-2">
            <p className="text-sm font-semibold truncate">{song.title}</p>
            <p className="text-[11px] text-muted-foreground">
              {group?.name} · {isLeader ? 'Leading' : 'Following'}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleDrone}
              className={`p-2 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors ${droneOn ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
            >
              {droneOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </div>
          </div>
        </div>
      </div>

      {/* Stanzas */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-36">
        {transLoading && (
          <div className="mx-auto max-w-lg flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground mb-3">
            <Loader2 className="h-3 w-3 animate-spin" />
            Transliterating…
          </div>
        )}
        <div className="mx-auto max-w-lg space-y-3">
          {(transliterated || song.stanzas).map((stanza, idx) => {
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
                    : 'border-border opacity-40',
                  isLeader ? 'cursor-pointer active:scale-[0.99]' : '',
                ].join(' ')}
              >
                <p
                  className={`text-xs font-medium uppercase tracking-wider mb-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  {stanza.label}
                </p>
                <div className="space-y-1">
                  {stanza.lines.map((line, i) => {
                    const transText = preferredScript !== 'original'
                      ? line.transliterations[preferredScript as keyof typeof line.transliterations]
                      : null
                    return (
                      <div key={i}>
                        <p className={`font-serif leading-relaxed ${isActive ? sizes.active : sizes.normal}`}>
                          {transText || line.text}
                        </p>
                        {transText && (
                          <p className={`text-muted-foreground leading-relaxed ${isActive ? 'text-xs' : 'text-[10px]'}`}>
                            {line.text}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-0 inset-x-0 border-t border-border bg-background/90 backdrop-blur-md safe-bottom">
        <div className="mx-auto max-w-lg px-4 py-3">
          {isLeader ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
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
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => setSongPickerOpen(true)}
                >
                  <SkipForward className="h-3.5 w-3.5" /> Switch Song
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-destructive hover:text-destructive gap-1.5"
                  onClick={handleEnd}
                >
                  <Square className="h-3 w-3" /> End
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 h-12 px-8 text-base"
                onClick={raiseHand}
              >
                🙏 Raise Hand
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Song Picker Dialog */}
      <Dialog open={songPickerOpen} onOpenChange={setSongPickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch Song</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {templeSongs
              .filter((s) => s.id !== session.songId)
              .map((s) => (
                <button
                  key={s.id}
                  onClick={() => changeSong(s.id)}
                  className="w-full flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted/50 active:scale-[0.99] transition-all text-left"
                >
                  <Music className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.stanzas.length} stanza{s.stanzas.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </button>
              ))}
            {templeSongs.filter((s) => s.id !== session.songId).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No other songs available. Add more songs to your temple library.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
