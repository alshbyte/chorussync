import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ArrowLeft, Search, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCommunityStore } from '@/stores/community-store'
import { searchSongLyrics, formatLyrics, isGeminiConfigured } from '@/lib/gemini'
import type { SongCategory, Deity } from '@/types/song'

const CATEGORIES: { value: SongCategory; label: string }[] = [
  { value: 'aarti', label: 'Aarti' },
  { value: 'bhajan', label: 'Bhajan' },
  { value: 'kirtan', label: 'Kirtan' },
  { value: 'chalisa', label: 'Chalisa' },
  { value: 'mantra', label: 'Mantra' },
  { value: 'stuti', label: 'Stuti' },
  { value: 'other', label: 'Other' },
]

const DEITIES: { value: Deity; label: string }[] = [
  { value: 'krishna', label: 'Krishna' },
  { value: 'shiva', label: 'Shiva' },
  { value: 'ram', label: 'Ram' },
  { value: 'ganesh', label: 'Ganesh' },
  { value: 'hanuman', label: 'Hanuman' },
  { value: 'durga', label: 'Durga' },
  { value: 'lakshmi', label: 'Lakshmi' },
  { value: 'saraswati', label: 'Saraswati' },
  { value: 'vishnu', label: 'Vishnu' },
  { value: 'universal', label: 'Universal' },
  { value: 'other', label: 'Other' },
]

export function AddSong() {
  const { templeId } = useParams<{ templeId: string }>()
  const navigate = useNavigate()
  const { addSong } = useCommunityStore()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<SongCategory>('bhajan')
  const [deity, setDeity] = useState<Deity>('krishna')
  const [lyrics, setLyrics] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [formatting, setFormatting] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const [aiError, setAiError] = useState(false)
  const aiEnabled = isGeminiConfigured()

  const handleSave = async () => {
    if (!title.trim() || !lyrics.trim() || !templeId) return
    await addSong(templeId, title.trim(), category, deity, lyrics)
    navigate(`/temple/${templeId}/songs`)
  }

  const handleAISearch = async () => {
    if (!searchQuery.trim() || !aiEnabled) return
    setSearching(true)
    setAiMessage('')
    setAiError(false)
    try {
      const result = await searchSongLyrics(searchQuery)
      if (result) {
        setTitle(result.title)
        setLyrics(result.lyrics)
        setCategory(result.category)
        setDeity(result.deity)
        setAiMessage('✨ Found! Review and save.')
        setAiError(false)
      } else {
        setAiMessage('Song not found. Try a different query or paste lyrics manually.')
        setAiError(true)
      }
    } catch (e: unknown) {
      const msg = (e as Error).message;
      setAiError(true)
      setAiMessage(
        msg === 'RATE_LIMIT'
          ? '⏳ Rate limit reached. Wait a minute and try again.'
          : 'AI search failed. Please paste lyrics manually.',
      )
    }
    setSearching(false)
  }

  const handleSmartFormat = async () => {
    if (!lyrics.trim() || !aiEnabled) return
    setFormatting(true)
    setAiMessage('')
    setAiError(false)
    try {
      const result = await formatLyrics(lyrics)
      if (result) {
        setLyrics(result.formatted)
        setAiMessage(`✨ Formatted into ${result.stanzaLabels.length} stanzas: ${result.stanzaLabels.join(', ')}`)
        setAiError(false)
      } else {
        setAiMessage('Formatting failed. Please format manually.')
        setAiError(true)
      }
    } catch (e: unknown) {
      const msg = (e as Error).message;
      setAiError(true)
      setAiMessage(
        msg === 'RATE_LIMIT'
          ? '⏳ Rate limit reached. Wait a minute and try again.'
          : 'AI formatting failed.',
      )
    }
    setFormatting(false)
  }

  const stanzaCount = lyrics.split(/\n\s*\n/).filter((b) => b.trim()).length

  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="text-xl font-semibold">Add Song</h1>

        {/* AI Search */}
        {aiEnabled && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI Song Search
            </div>
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by song name, e.g. 'Om Jai Jagdish'"
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
              />
              <Button onClick={handleAISearch} disabled={searching || !searchQuery.trim()} size="icon" className="shrink-0">
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {aiMessage && (
          <p className={`text-sm ${aiError ? 'text-destructive' : 'text-primary'}`}>{aiMessage}</p>
        )}

        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Song title"
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as SongCategory)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Deity</Label>
              <Select value={deity} onValueChange={(v) => setDeity(v as Deity)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEITIES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label>Lyrics</Label>
              {aiEnabled && lyrics.trim() && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1.5 text-primary"
                  onClick={handleSmartFormat}
                  disabled={formatting}
                >
                  {formatting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  Smart Format
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">
              Separate stanzas with a blank line. First stanza becomes the Chorus.
            </p>
            <Textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder={'Chorus line 1\nChorus line 2\n\nVerse 1 line 1\nVerse 1 line 2'}
              rows={10}
              className="font-serif"
            />
            {stanzaCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1.5">
                {stanzaCount} stanza{stanzaCount !== 1 ? 's' : ''} detected
              </p>
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={!title.trim() || !lyrics.trim()}
            className="w-full h-11"
          >
            Save Song
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
