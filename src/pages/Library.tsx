import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Music, Search, Plus } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCommunityStore } from '@/stores/community-store'

export function Library() {
  const navigate = useNavigate()
  const { songs, temples, userId } = useCommunityStore()
  const [search, setSearch] = useState('')

  const myTemples = temples.filter((t) => t.createdBy === userId)
  const allSongs = songs
    .filter((s) => myTemples.some((t) => t.id === s.templeId))
    .filter((s) => !search || s.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Song Library</h1>
          {myTemples.length > 0 && (
            <Button
              size="sm"
              className="gap-1.5 h-8"
              onClick={() => navigate(`/temple/${myTemples[0].id}/songs/new`)}
            >
              <Plus className="h-3.5 w-3.5" /> Add Song
            </Button>
          )}
        </div>

        {myTemples.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <Music className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              Create a temple first to start adding songs
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search songs..."
                className="pl-9"
              />
            </div>

            {allSongs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-10 text-center">
                <Music className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">
                  {search ? 'No songs match your search' : 'No songs yet'}
                </p>
                {!search && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={() => navigate(`/temple/${myTemples[0].id}/songs/new`)}
                  >
                    Add your first song
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {allSongs.map((s) => {
                  const temple = myTemples.find((t) => t.id === s.templeId)
                  return (
                    <button
                      key={s.id}
                      onClick={() => navigate(`/temple/${s.templeId}/songs/${s.id}`)}
                      className="w-full flex items-center gap-3 rounded-xl border border-border p-3.5 hover:bg-muted/50 active:scale-[0.99] transition-all text-left"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Music className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {temple?.name} · {s.stanzas.length} stanza
                          {s.stanzas.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] capitalize shrink-0">
                        {s.category}
                      </Badge>
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
