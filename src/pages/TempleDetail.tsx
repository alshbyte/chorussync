import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ArrowLeft, Plus, Users, Music, Copy, Check, Play, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useCommunityStore } from '@/stores/community-store'
import { QRCodeDisplay } from '@/components/common/QRCodeDisplay'

export function TempleDetail() {
  const { templeId } = useParams<{ templeId: string }>()
  const navigate = useNavigate()
  const store = useCommunityStore()
  const [groupName, setGroupName] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const temple = store.temples.find((t) => t.id === templeId)
  if (!temple)
    return <div className="p-6 text-center text-muted-foreground">Temple not found</div>

  const templeGroups = store.groups.filter((g) => g.templeId === templeId)
  const templeSongs = store.songs.filter((s) => s.templeId === templeId)

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !templeId) return
    await createGroup(templeId, groupName.trim())
    setGroupName('')
    setDialogOpen(false)
  }

  const { createGroup } = store

  const copyCode = () => {
    navigator.clipboard.writeText(temple.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div>
          <h1 className="text-xl font-semibold">{temple.name}</h1>
          {temple.description && (
            <p className="mt-1 text-sm text-muted-foreground">{temple.description}</p>
          )}
          <button
            onClick={copyCode}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-mono tracking-wider"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {temple.inviteCode}
          </button>
          <QRCodeDisplay code={temple.inviteCode} label={temple.name} />
        </div>

        {/* Song Library */}
        <button
          onClick={() => navigate(`/temple/${templeId}/songs`)}
          className="w-full flex items-center gap-3 rounded-xl border border-border p-4 hover:bg-muted/50 active:scale-[0.99] transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Music className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">Song Library</p>
            <p className="text-xs text-muted-foreground">
              {templeSongs.length} song{templeSongs.length !== 1 ? 's' : ''}
            </p>
          </div>
        </button>

        {/* Groups */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Groups
            </h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 h-8">
                  <Plus className="h-3.5 w-3.5" /> Add Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label>Group Name</Label>
                    <Input
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="e.g. Morning Bhajan Group"
                      className="mt-1.5"
                    />
                  </div>
                  <Button
                    onClick={handleCreateGroup}
                    disabled={!groupName.trim()}
                    className="w-full"
                  >
                    Create Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {templeGroups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No groups yet</p>
              <p className="text-xs text-muted-foreground/70">
                Create a group to start organizing recitals
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {templeGroups.map((g) => {
                const groupSession = store.activeSessions.find((s) => s.groupId === g.id)
                const sessionSong = groupSession
                  ? store.songs.find((s) => s.id === groupSession.songId)
                  : null
                return (
                  <button
                    key={g.id}
                    onClick={() => navigate(`/group/${g.id}`)}
                    className="w-full flex items-center gap-3 rounded-xl border border-border p-3.5 hover:bg-muted/50 active:scale-[0.99] transition-all text-left"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      {groupSession ? (
                        <Radio className="h-4 w-4 text-primary" />
                      ) : (
                        <Users className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{g.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {groupSession ? (
                          <span className="text-primary font-medium">
                            🔴 Live · {sessionSong?.title || 'Session'}
                          </span>
                        ) : (
                          <span className="font-mono">{g.inviteCode}</span>
                        )}
                      </p>
                    </div>
                    {groupSession ? (
                      <Badge variant="default" className="text-[10px] animate-pulse">
                        Live
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Leader
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Start — shown when groups exist but no sessions active */}
        {templeGroups.length > 0 &&
          templeSongs.length > 0 &&
          !store.activeSessions.some((s) => templeGroups.some((g) => g.id === s.groupId)) && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center">
              <Play className="mx-auto h-5 w-5 text-primary mb-2" />
              <p className="text-sm font-medium">Ready to sing?</p>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Tap a group above, then "Start Live Session"
              </p>
            </div>
          )}
      </motion.div>
    </div>
  )
}
