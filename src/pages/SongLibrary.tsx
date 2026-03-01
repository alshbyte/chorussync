import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ArrowLeft, Plus, Music, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCommunityStore } from '@/stores/community-store'

export function SongLibrary() {
  const { templeId } = useParams<{ templeId: string }>()
  const navigate = useNavigate()
  const { songs, temples } = useCommunityStore()
  const [search, setSearch] = useState('')

  const temple = temples.find((t) => t.id === templeId)
  const templeSongs = songs
    .filter((s) => s.templeId === templeId)
    .filter((s) => !search || s.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <button
          onClick={() => navigate(`/temple/${templeId}`)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {temple?.name || 'Back'}
        </button>

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Song Library</h1>
          <Button
            size="sm"
            className="gap-1.5 h-8"
            onClick={() => navigate(`/temple/${templeId}/songs/new`)}
          >
            <Plus className="h-3.5 w-3.5" /> Add Song
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search songs..."
            className="pl-9"
          />
        </div>

        {templeSongs.length === 0 ? (
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
                onClick={() => navigate(`/temple/${templeId}/songs/new`)}
              >
                Add your first song
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {templeSongs.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/temple/${templeId}/songs/${s.id}`)}
                className="w-full flex items-center gap-3 rounded-xl border border-border p-3.5 hover:bg-muted/50 active:scale-[0.99] transition-all text-left"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Music className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.stanzas.length} stanza{s.stanzas.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Badge variant="secondary" className="text-[10px] capitalize shrink-0">
                  {s.category}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
