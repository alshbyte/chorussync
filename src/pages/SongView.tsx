import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCommunityStore } from '@/stores/community-store'

export function SongView() {
  const { templeId, songId } = useParams<{ templeId: string; songId: string }>()
  const navigate = useNavigate()
  const { songs, deleteSong } = useCommunityStore()

  const song = songs.find((s) => s.id === songId)
  if (!song)
    return <div className="p-6 text-center text-muted-foreground">Song not found</div>

  const handleDelete = () => {
    if (!confirm('Delete this song?')) return
    deleteSong(songId!)
    navigate(`/temple/${templeId}/songs`)
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/temple/${templeId}/songs`)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Library
          </button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive gap-1.5 h-8"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>

        <div>
          <h1 className="text-xl font-semibold">{song.title}</h1>
          <div className="mt-2 flex gap-2">
            <Badge variant="secondary" className="text-[10px] capitalize">
              {song.category}
            </Badge>
            <Badge variant="outline" className="text-[10px] capitalize">
              {song.deity}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          {song.stanzas.map((stanza) => (
            <div key={stanza.index} className="rounded-xl border border-border p-4">
              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2">
                {stanza.label}
              </p>
              <div className="space-y-1">
                {stanza.lines.map((line, i) => (
                  <p key={i} className="font-serif text-base leading-relaxed">
                    {line.text}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
