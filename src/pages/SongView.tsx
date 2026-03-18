import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ArrowLeft, Trash2, Languages, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCommunityStore } from '@/stores/community-store'
import { useUIStore } from '@/stores/ui-store'
import { transliterateStanzas, isGeminiConfigured } from '@/lib/gemini'
import type { Stanza, ScriptCode } from '@/types/song'

const SCRIPT_LABELS: Record<string, string> = {
  original: 'Original',
  en: 'English (Roman)',
  hi: 'हिन्दी',
  te: 'తెలుగు',
  ta: 'தமிழ்',
  od: 'ଓଡ଼ିଆ',
}

export function SongView() {
  const { templeId, songId } = useParams<{ templeId: string; songId: string }>()
  const navigate = useNavigate()
  const { songs, deleteSong } = useCommunityStore()
  const { preferredScript } = useUIStore()

  const song = songs.find((s) => s.id === songId)
  const [transliterated, setTransliterated] = useState<Stanza[] | null>(null)
  const [activeScript, setActiveScript] = useState<ScriptCode>(preferredScript)
  const [loading, setLoading] = useState(false)
  const [transError, setTransError] = useState('')
  const aiEnabled = isGeminiConfigured()

  if (!song)
    return <div className="p-6 text-center text-muted-foreground">Song not found</div>

  const handleTransliterate = async (script: ScriptCode) => {
    setActiveScript(script)
    setTransError('')
    if (script === 'original') {
      setTransliterated(null)
      return
    }
    // Check if we already have cached transliterations in the stanza lines
    const allCached = song.stanzas.every((s) =>
      s.lines.every((l) => l.transliterations[script as keyof typeof l.transliterations])
    )
    if (allCached) {
      setTransliterated(song.stanzas)
      return
    }
    setLoading(true)
    try {
      const result = await transliterateStanzas(song.stanzas, script)
      if (result) setTransliterated(result)
      else setTransError('Transliteration returned no results')
    } catch (e: unknown) {
      const msg = (e as Error).message
      setTransError(
        msg === 'RATE_LIMIT'
          ? 'Rate limit reached. Try again in a minute.'
          : 'Transliteration failed. Showing original text.'
      )
    }
    setLoading(false)
  }

  const handleDelete = () => {
    if (!confirm('Delete this song?')) return
    deleteSong(songId!)
    navigate(`/temple/${templeId}/songs`)
  }

  const displayStanzas = transliterated || song.stanzas

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

        {/* Script Selector */}
        {aiEnabled && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Languages className="h-4 w-4 text-muted-foreground shrink-0" />
            {Object.entries(SCRIPT_LABELS).map(([code, label]) => (
              <button
                key={code}
                onClick={() => handleTransliterate(code as ScriptCode)}
                className={[
                  'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  activeScript === code
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Transliterating…
          </div>
        )}

        {transError && (
          <div className="flex items-center gap-2 py-2 px-3 text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {transError}
          </div>
        )}

        <div className="space-y-4">
          {displayStanzas.map((stanza) => (
            <div key={stanza.index} className="rounded-xl border border-border p-4">
              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2">
                {stanza.label}
              </p>
              <div className="space-y-1">
                {stanza.lines.map((line, i) => {
                  const transText =
                    activeScript !== 'original'
                      ? line.transliterations[activeScript as keyof typeof line.transliterations]
                      : null
                  return (
                    <div key={i}>
                      {activeScript === 'original' || !transText ? (
                        <p className="font-serif text-base leading-relaxed">{line.text}</p>
                      ) : (
                        <>
                          <p className="font-serif text-base leading-relaxed">{transText}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{line.text}</p>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
