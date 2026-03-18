import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ArrowLeft, Copy, Check, Play, Music, Radio, LogOut, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCommunityStore } from '@/stores/community-store'
import { QRCodeDisplay } from '@/components/common/QRCodeDisplay'

export function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const store = useCommunityStore()
  const [copied, setCopied] = useState(false)
  const [songPickerOpen, setSongPickerOpen] = useState(false)

  const group = store.groups.find((g) => g.id === groupId)
  if (!group)
    return <div className="p-6 text-center text-muted-foreground">Group not found</div>

  const temple = store.temples.find((t) => t.id === group.templeId)
  const members = store.memberships.filter((m) => m.groupId === groupId)
  const songs = store.songs.filter((s) => s.templeId === group.templeId)
  const session = store.activeSessions.find((s) => s.groupId === groupId)
  const activeSong = session ? store.songs.find((s) => s.id === session.songId) : null
  const history = store.sessionHistory.filter((h) => h.groupId === groupId).slice(-5).reverse()
  const isLeader = members.some(
    (m) => m.userId === store.userId && (m.role === 'leader' || m.role === 'admin'),
  )

  const copyCode = () => {
    navigator.clipboard.writeText(group.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStartSession = async (songId: string) => {
    await store.startSession(groupId!, songId)
    setSongPickerOpen(false)
    navigate(`/session/${groupId}`)
  }

  const handleEndSession = () => {
    if (!groupId) return
    store.endSession(groupId)
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <button
          onClick={() => navigate(`/temple/${group.templeId}`)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {temple?.name || 'Back'}
        </button>

        <div>
          <h1 className="text-xl font-semibold">{group.name}</h1>
          <button
            onClick={copyCode}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-mono tracking-wider"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {group.inviteCode}
          </button>
          <QRCodeDisplay code={group.inviteCode} label={group.name} />
        </div>

        {/* Active Session Banner — with End option for leaders */}
        {session && (
          <div className="space-y-2">
            <button
              onClick={() => navigate(`/session/${groupId}`)}
              className="w-full flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/20 p-4 active:scale-[0.99] transition-all"
            >
              <div className="relative">
                <Radio className="h-5 w-5 text-primary" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-primary">Live Session Active</p>
                <p className="text-xs text-muted-foreground">
                  {activeSong?.title || 'Song'} · Tap to join
                </p>
              </div>
            </button>
            {isLeader && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-9 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                onClick={handleEndSession}
              >
                <Square className="h-3 w-3" /> End Session
              </Button>
            )}
          </div>
        )}

        {/* Start Session — prominent call to action */}
        {!session && isLeader && (
          <>
            <Button
              onClick={() =>
                songs.length > 0
                  ? setSongPickerOpen(true)
                  : navigate(`/temple/${group.templeId}/songs/new`)
              }
              className="w-full gap-2 h-12"
              size="lg"
            >
              <Play className="h-4 w-4" />
              {songs.length > 0 ? 'Start Live Session' : 'Add Songs First'}
            </Button>
            {songs.length > 0 && (
              <p className="text-center text-xs text-muted-foreground -mt-3">
                Pick a song and start leading a recital
              </p>
            )}

            <Dialog open={songPickerOpen} onOpenChange={setSongPickerOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pick a Song to Start</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {songs.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleStartSession(s.id)}
                      className="w-full flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted/50 active:scale-[0.99] transition-all text-left"
                    >
                      <Music className="h-4 w-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{s.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {s.category} · {s.deity}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Hint for non-leaders when no session */}
        {!session && !isLeader && (
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <Radio className="mx-auto h-6 w-6 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No active session</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Wait for the leader to start a session
            </p>
          </div>
        )}

        {/* Members */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Members ({members.length})
          </h2>
          <div className="space-y-1.5">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {m.displayName[0]?.toUpperCase()}
                </div>
                <span className="text-sm flex-1">{m.displayName}</span>
                <Badge
                  variant={m.role === 'leader' ? 'default' : 'secondary'}
                  className="text-[10px] capitalize"
                >
                  {m.role}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Session History */}
        {history.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Recent Sessions
            </h2>
            <div className="space-y-1.5">
              {history.map((h) => {
                const songNames = h.songIds
                  .map((id) => store.songs.find((s) => s.id === id)?.title)
                  .filter(Boolean)
                return (
                  <div key={h.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <Music className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{songNames.join(', ') || 'Session'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(h.endedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Leave Group */}
        {!isLeader && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
            onClick={() => {
              if (!confirm('Leave this group?')) return
              store.leaveGroup(groupId!)
              navigate(`/dashboard`)
            }}
          >
            <LogOut className="h-4 w-4" /> Leave Group
          </Button>
        )}
      </motion.div>
    </div>
  )
}
