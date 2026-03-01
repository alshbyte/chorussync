import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
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

  const handleSave = () => {
    if (!title.trim() || !lyrics.trim() || !templeId) return
    addSong(templeId, title.trim(), category, deity, lyrics)
    navigate(`/temple/${templeId}/songs`)
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
            <Label>Lyrics</Label>
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
