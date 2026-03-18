import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useCallback } from 'react'
import { ArrowLeft, Trash2, Languages, Loader2, AlertCircle, Pencil, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCommunityStore } from '@/stores/community-store'
import { useUIStore } from '@/stores/ui-store'
import { transliterateStanzas, isGeminiConfigured } from '@/lib/gemini'
import type { ScriptCode } from '@/types/song'

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
  const store = useCommunityStore()
  const { preferredScript, showChords } = useUIStore()

  const song = store.songs.find((s) => s.id === songId)
  const [activeScript, setActiveScript] = useState<ScriptCode>(preferredScript)
  const [loading, setLoading] = useState(false)
  const [transError, setTransError] = useState('')
  const [editing, setEditing] = useState(false)
  const aiEnabled = isGeminiConfigured()

  if (!song)
    return <div className="p-6 text-center text-muted-foreground">Song not found</div>

  const hasSaved = activeScript !== 'original' && store.hasTransliteration(songId!, activeScript)

  const handleTransliterate = async (script: ScriptCode) => {
    setActiveScript(script)
    setTransError('')
    setEditing(false)
    if (script === 'original') return

    // Already saved? No AI call needed — instant display
    if (store.hasTransliteration(songId!, script)) return

    if (!aiEnabled) return
    setLoading(true)
    try {
      const result = await transliterateStanzas(song.stanzas, script)
      if (result) {
        // Persist into song data — never need to call AI again for this script
        store.saveTransliteration(songId!, script, result)
      } else {
        setTransError('Transliteration returned no results')
      }
    } catch (e: unknown) {
      const msg = (e as Error).message
      setTransError(
        msg === 'RATE_LIMIT'
          ? 'Rate limit reached. Try again in a minute.'
          : 'Transliteration failed.'
      )
    }
    setLoading(false)
  }

  const handleEditLine = useCallback((stanzaIdx: number, lineIdx: number, text: string) => {
    if (!songId) return
    store.updateTransliterationLine(songId, activeScript, stanzaIdx, lineIdx, text)
  }, [songId, activeScript, store])

  const handleDelete = () => {
    if (!confirm('Delete this song?')) return
    store.deleteSong(songId!)
    navigate(`/temple/${templeId}/songs`)
  }

  // Always read fresh from store (updated by saveTransliteration / edit)
  const currentSong = store.songs.find((s) => s.id === songId)!

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
          <h1 className="text-xl font-bold text-foreground">{currentSong.title}</h1>
          <div className="mt-2 flex gap-2">
            <Badge variant="secondary" className="text-[10px] capitalize">
              {currentSong.category}
            </Badge>
            <Badge variant="outline" className="text-[10px] capitalize">
              {currentSong.deity}
            </Badge>
          </div>
        </div>

        {/* Script Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          <Languages className="h-4 w-4 text-muted-foreground shrink-0" />
          {Object.entries(SCRIPT_LABELS).map(([code, label]) => {
            const saved = code !== 'original' && store.hasTransliteration(songId!, code)
            const canSelect = code === 'original' || saved || aiEnabled
            return (
              <button
                key={code}
                onClick={() => handleTransliterate(code as ScriptCode)}
                disabled={!canSelect}
                className={[
                  'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[32px] relative',
                  activeScript === code
                    ? 'bg-primary text-primary-foreground'
                    : !canSelect
                      ? 'bg-muted text-muted-foreground/40 cursor-not-allowed'
                      : 'bg-muted text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                {label}
                {saved && activeScript !== code && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500" title="Saved" />
                )}
              </button>
            )
          })}
        </div>

        {/* Edit / Status bar */}
        {hasSaved && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {editing
                ? '✏️ Editing — changes save automatically'
                : `✅ Saved · ${SCRIPT_LABELS[activeScript]}`}
            </p>
            <Button
              variant={editing ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs gap-1.5 rounded-lg"
              onClick={() => setEditing(!editing)}
            >
              {editing ? <><Check className="h-3 w-3" /> Done</> : <><Pencil className="h-3 w-3" /> Edit</>}
            </Button>
          </div>
        )}

        {activeScript !== 'original' && !hasSaved && !loading && !transError && aiEnabled && (
          <p className="text-xs text-muted-foreground text-center py-2">
            🤖 AI will transliterate once · then it's saved forever
          </p>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Transliterating… (one-time, saving permanently)
          </div>
        )}

        {transError && (
          <div className="flex items-center gap-2 py-2 px-3 text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {transError}
          </div>
        )}

        {/* Stanzas */}
        <div className="space-y-4">
          {currentSong.stanzas.map((stanza) => (
            <div key={stanza.index} className="rounded-xl border border-border p-4">
              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2">
                {stanza.label}
              </p>
              <div className="space-y-1.5">
                {stanza.lines.map((line, i) => {
                  const transText =
                    activeScript !== 'original'
                      ? line.transliterations[activeScript as keyof typeof line.transliterations]
                      : null
                  return (
                    <div key={i}>
                      {showChords && line.chords && (
                        <p className="font-mono text-xs text-primary/70">{line.chords}</p>
                      )}
                      {activeScript === 'original' || !transText ? (
                        <p className="font-serif text-base leading-relaxed text-foreground">{line.text}</p>
                      ) : editing ? (
                        <div className="space-y-0.5">
                          <input
                            type="text"
                            value={transText}
                            onChange={(e) => handleEditLine(stanza.index, i, e.target.value)}
                            className="w-full font-serif text-base leading-relaxed bg-primary/5 border border-primary/20 rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                          />
                          <p className="text-[10px] text-muted-foreground leading-relaxed pl-2.5">{line.text}</p>
                        </div>
                      ) : (
                        <>
                          <p className="font-serif text-base leading-relaxed text-foreground">{transText}</p>
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
