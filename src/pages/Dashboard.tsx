import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, Music, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useCommunityStore } from '@/stores/community-store'

export function Dashboard() {
  const navigate = useNavigate()
  const { temples, groups, songs, userId, createTemple } = useCommunityStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [templeName, setTempleName] = useState('')
  const [templeDesc, setTempleDesc] = useState('')

  const myTemples = temples.filter((t) => t.createdBy === userId)

  const handleCreate = () => {
    if (!templeName.trim()) return
    const t = createTemple(templeName.trim(), templeDesc.trim() || undefined)
    setTempleName('')
    setTempleDesc('')
    setDialogOpen(false)
    navigate(`/temple/${t.id}`)
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">My Communities</h1>
            <p className="text-sm text-muted-foreground">Your temples, groups & sessions</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 h-9">
                <Plus className="h-4 w-4" /> New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Temple</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Temple Name</Label>
                  <Input
                    value={templeName}
                    onChange={(e) => setTempleName(e.target.value)}
                    placeholder="e.g. ISKCON Dwarka"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={templeDesc}
                    onChange={(e) => setTempleDesc(e.target.value)}
                    placeholder="Brief description..."
                    rows={2}
                    className="mt-1.5"
                  />
                </div>
                <Button onClick={handleCreate} disabled={!templeName.trim()} className="w-full">
                  Create Temple
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {myTemples.length === 0 ? (
          <>
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium">No communities yet</p>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-[260px]">
                Create a temple to organize recitals, or join with an invite code.
              </p>
              <Button className="mt-5 gap-2" size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Create Temple
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-3 rounded-xl border border-border p-3.5 hover:bg-muted/50 active:scale-[0.98] transition-all"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Music className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Join with Code</span>
              </button>
              <button
                onClick={() => setDialogOpen(true)}
                className="flex items-center gap-3 rounded-xl border border-border p-3.5 hover:bg-muted/50 active:scale-[0.98] transition-all"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Create Temple</span>
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            {myTemples.map((t) => {
              const templeGroups = groups.filter((g) => g.templeId === t.id)
              const templeSongs = songs.filter((s) => s.templeId === t.id)
              return (
                <button
                  key={t.id}
                  onClick={() => navigate(`/temple/${t.id}`)}
                  className="w-full flex items-center gap-3.5 rounded-xl border border-border p-4 hover:bg-muted/50 active:scale-[0.99] transition-all text-left"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {templeGroups.length} group{templeGroups.length !== 1 ? 's' : ''} ·{' '}
                      {templeSongs.length} song{templeSongs.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                </button>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
